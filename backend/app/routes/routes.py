from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import uuid
import logging

from app.database import get_db
from app.schemas.route import RouteAnalyzeRequest, RouteAnalyzeResponse, RouteCandidate, RiskFactors
from app.services.routing_service import get_routes, geocode_location
from app.services.weather_service import get_weather
from app.ml.risk_engine import calculate_risk_score
from app.ml.accessibility_engine import calculate_accessibility_score
from app.ai.gemini_service import analyze_route_with_ai
from app.models.route import Route
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/routes", tags=["Routes"])
logger = logging.getLogger(__name__)


def calculate_reliability_score(risk_score: float, accessibility_score: float) -> float:
    """Reliability = inverse blend of risk and accessibility."""
    return round(max(0, min(100, (100 - risk_score) * 0.5 + accessibility_score * 0.5)), 1)


def determine_road_condition(risk_score: float) -> str:
    if risk_score > 75:
        return "POOR"
    elif risk_score > 50:
        return "FAIR"
    elif risk_score > 25:
        return "MODERATE"
    return "GOOD"


@router.post("/analyze", response_model=RouteAnalyzeResponse)
async def analyze_route(
    request: RouteAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyze routes between source and destination with risk, accessibility, and AI scoring."""
    logger.info(f"Route analysis request: {request.source} → {request.destination}")

    # Geocode source
    src_coords = None
    if request.source_lat and request.source_lng:
        src_coords = (request.source_lat, request.source_lng)
    else:
        src_coords = await geocode_location(request.source)

    if not src_coords:
        raise HTTPException(status_code=400, detail=f"Could not geocode source: {request.source}")

    # Geocode destination
    dst_coords = None
    if request.dest_lat and request.dest_lng:
        dst_coords = (request.dest_lat, request.dest_lng)
    else:
        dst_coords = await geocode_location(request.destination)

    if not dst_coords:
        raise HTTPException(status_code=400, detail=f"Could not geocode destination: {request.destination}")

    src_lat, src_lng = src_coords
    dst_lat, dst_lng = dst_coords

    # Get route candidates
    raw_routes = await get_routes(src_lat, src_lng, dst_lat, dst_lng)
    is_demo = any(r.get("is_demo", False) for r in raw_routes)

    # Get weather at midpoint
    mid_lat = (src_lat + dst_lat) / 2
    mid_lng = (src_lng + dst_lng) / 2
    weather_data = await get_weather(mid_lat, mid_lng)

    # Get active field reports count (simplified)
    from app.models.field_report import FieldReport, ReportStatus
    active_reports = db.query(FieldReport).filter(
        FieldReport.status == ReportStatus.VERIFIED
    ).count()

    # Score each route
    scored_routes = []
    for i, raw in enumerate(raw_routes[:3]):
        dist = raw["distance_km"]
        eta = raw["eta_minutes"]

        # Risk scoring
        risk_result = calculate_risk_score(
            weather_data=weather_data,
            source_lat=src_lat, source_lng=src_lng,
            dest_lat=dst_lat, dest_lng=dst_lng,
            distance_km=dist,
            active_reports=max(0, active_reports - i),  # Routes further in list have fewer reports
            historical_disruptions=max(0, 3 - i),
            region="assam"
        )

        # Accessibility scoring
        acc_result = calculate_accessibility_score(
            weather_data=weather_data,
            distance_km=dist,
            eta_minutes=eta,
            source_lat=src_lat, source_lng=src_lng,
            dest_lat=dst_lat, dest_lng=dst_lng,
            active_reports=max(0, active_reports - i),
            terrain_score=risk_result["terrain_risk"]
        )

        reliability = calculate_reliability_score(risk_result["total_risk"], acc_result["total_accessibility"])

        route_candidate = RouteCandidate(
            route_id=f"route-{i+1}-{str(uuid.uuid4())[:8]}",
            source=request.source,
            destination=request.destination,
            distance_km=dist,
            eta_minutes=eta,
            risk_score=risk_result["total_risk"],
            accessibility_score=acc_result["total_accessibility"],
            reliability_score=reliability,
            weather_risk=weather_data.get("weather_risk", "LOW"),
            road_condition=determine_road_condition(risk_result["total_risk"]),
            disruption_risk=risk_result.get("risk_level", "LOW"),
            risk_level=risk_result["risk_level"],
            risk_factors=RiskFactors(
                weather_risk=risk_result["weather_risk"],
                road_risk=risk_result["road_risk"],
                disruption_risk=risk_result["disruption_risk"],
                historical_risk=risk_result["historical_risk"],
                terrain_risk=risk_result["terrain_risk"],
                total_risk=risk_result["total_risk"],
                risk_level=risk_result["risk_level"],
                reasons=risk_result["reasons"]
            ),
            waypoints=raw.get("geometry", {}).get("coordinates", []),
            is_recommended=False
        )
        scored_routes.append(route_candidate)

    # Select recommended route (lowest risk score with good accessibility)
    def route_score(r: RouteCandidate) -> float:
        # Lower is better: prioritize safety + accessibility over distance
        return r.risk_score * 0.6 - r.accessibility_score * 0.4

    scored_routes.sort(key=route_score)
    recommended = scored_routes[0]
    recommended.is_recommended = True

    # Generate AI explanation for recommended route
    ai_data = {
        "source": request.source,
        "destination": request.destination,
        "distance_km": recommended.distance_km,
        "eta_minutes": recommended.eta_minutes,
        "risk_score": recommended.risk_score,
        "accessibility_score": recommended.accessibility_score,
        "reliability_score": recommended.reliability_score,
        "weather": weather_data,
        "weather_risk": recommended.weather_risk,
        "road_condition": recommended.road_condition,
        "active_reports": active_reports,
        "risk_reasons": recommended.risk_factors.reasons,
        "is_recommended": True
    }
    ai_explanation = await analyze_route_with_ai(ai_data)
    recommended.ai_explanation = ai_explanation

    # Save to DB
    try:
        db_route = Route(
            source_name=request.source,
            destination_name=request.destination,
            source_lat=src_lat, source_lng=src_lng,
            dest_lat=dst_lat, dest_lng=dst_lng,
            distance_km=recommended.distance_km,
            eta_minutes=recommended.eta_minutes,
            risk_score=recommended.risk_score,
            accessibility_score=recommended.accessibility_score,
            reliability_score=recommended.reliability_score,
            weather_risk=recommended.weather_risk,
            road_condition=recommended.road_condition,
            ai_explanation=ai_explanation,
            weather_data=weather_data,
            risk_factors={"reasons": recommended.risk_factors.reasons},
            created_by_id=current_user.id
        )
        db.add(db_route)
        db.commit()
    except Exception as e:
        logger.warning(f"Could not save route to DB: {e}")

    alternatives = [r for r in scored_routes if not r.is_recommended]

    return RouteAnalyzeResponse(
        recommended_route=recommended,
        alternatives=alternatives,
        weather_data=weather_data,
        ai_summary=ai_explanation,
        is_demo=is_demo or weather_data.get("is_demo", False),
        timestamp=datetime.utcnow().isoformat()
    )


@router.get("/history")
async def get_route_history(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    routes = db.query(Route).order_by(Route.created_at.desc()).limit(limit).all()
    return [
        {
            "id": r.id,
            "source": r.source_name,
            "destination": r.destination_name,
            "distance_km": r.distance_km,
            "risk_score": r.risk_score,
            "accessibility_score": r.accessibility_score,
            "weather_risk": r.weather_risk,
            "road_condition": r.road_condition,
            "created_at": r.created_at
        }
        for r in routes
    ]
