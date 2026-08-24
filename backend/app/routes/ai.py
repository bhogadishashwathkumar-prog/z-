from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
from app.ai.gemini_service import analyze_route_with_ai, explain_risk_with_ai
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/ai", tags=["AI"])


class RouteAIRequest(BaseModel):
    source: str
    destination: str
    distance_km: float
    eta_minutes: int
    risk_score: float
    accessibility_score: float
    reliability_score: float
    weather: Optional[Dict] = None
    weather_risk: Optional[str] = "LOW"
    road_condition: Optional[str] = "MODERATE"
    active_reports: Optional[int] = 0
    risk_reasons: Optional[list] = []
    is_recommended: Optional[bool] = True


class RiskExplainRequest(BaseModel):
    total_risk: float
    risk_level: str
    weather_risk: float
    road_risk: float
    disruption_risk: float
    historical_risk: float
    terrain_risk: float
    reasons: Optional[list] = []


@router.post("/analyze-route")
async def ai_analyze_route(
    request: RouteAIRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate AI explanation for a route. Gemini is called from backend only."""
    explanation = await analyze_route_with_ai(request.model_dump())
    return {"explanation": explanation}


@router.post("/explain-risk")
async def ai_explain_risk(
    request: RiskExplainRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate plain-language risk explanation using AI."""
    explanation = await explain_risk_with_ai(request.model_dump())
    return {"explanation": explanation}
