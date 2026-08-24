from typing import Dict, List
import math
import logging

logger = logging.getLogger(__name__)

# Risk weights (configurable)
RISK_WEIGHTS = {
    "weather_risk": 0.25,
    "road_risk": 0.20,
    "disruption_risk": 0.25,
    "historical_risk": 0.15,
    "terrain_risk": 0.15,
}


def calculate_weather_risk_score(weather_data: Dict) -> float:
    """Convert weather risk level to numeric score 0-100."""
    risk_map = {"LOW": 15, "MEDIUM": 40, "HIGH": 70, "CRITICAL": 90}
    risk_level = weather_data.get("weather_risk", "LOW")
    base = risk_map.get(risk_level, 15)

    # Adjust for rainfall
    rainfall = weather_data.get("rainfall_mm", 0)
    if rainfall > 30:
        base = min(95, base + 15)
    elif rainfall > 15:
        base = min(90, base + 8)

    return float(base)


def calculate_terrain_risk(source_lat: float, source_lng: float, dest_lat: float, dest_lng: float) -> float:
    """Estimate terrain risk based on elevation change proxy (NER mountain regions)."""
    # NER is mountainous — proximity to Himalayan foothills increases risk
    avg_lat = (source_lat + dest_lat) / 2

    # Higher latitude in NER = more mountainous (Arunachal, Sikkim)
    if avg_lat > 27.0:
        return 65.0  # Very mountainous
    elif avg_lat > 25.5:
        return 45.0  # Moderately mountainous (Meghalaya, Nagaland)
    elif avg_lat > 24.0:
        return 30.0  # Hill terrain (Manipur, Mizoram)
    else:
        return 20.0  # Plains (Tripura, lower Assam)


def calculate_road_risk(distance_km: float, region: str = "unknown") -> float:
    """Estimate road risk based on distance and region."""
    base = 20.0
    # Longer routes in NER have higher road risk due to mountain roads
    if distance_km > 200:
        base += 25
    elif distance_km > 100:
        base += 15
    elif distance_km > 50:
        base += 8

    # Add region-specific risk (NER road infrastructure varies)
    region_risk = {
        "arunachal": 20, "nagaland": 15, "meghalaya": 10,
        "manipur": 12, "mizoram": 15, "sikkim": 20,
        "assam": 5, "tripura": 5
    }
    base += region_risk.get(region.lower(), 10)
    return min(100.0, base)


def calculate_disruption_risk(active_reports: int = 0, historical_disruptions: int = 0) -> float:
    """Calculate disruption risk from active field reports and historical data."""
    base = 10.0
    base += active_reports * 15.0  # Each active report adds risk
    base += min(20.0, historical_disruptions * 5.0)  # Cap historical contribution
    return min(100.0, base)


def calculate_historical_risk(disruption_count: int = 0) -> float:
    """Historical risk based on past disruptions on similar routes."""
    if disruption_count > 10:
        return 75.0
    elif disruption_count > 5:
        return 55.0
    elif disruption_count > 2:
        return 35.0
    return 15.0


def calculate_risk_score(
    weather_data: Dict,
    source_lat: float,
    source_lng: float,
    dest_lat: float,
    dest_lng: float,
    distance_km: float,
    active_reports: int = 0,
    historical_disruptions: int = 0,
    region: str = "assam"
) -> Dict:
    """
    Calculate composite risk score 0-100.
    Higher score = MORE DANGEROUS.
    """
    weather_score = calculate_weather_risk_score(weather_data)
    road_score = calculate_road_risk(distance_km, region)
    disruption_score = calculate_disruption_risk(active_reports, historical_disruptions)
    historical_score = calculate_historical_risk(historical_disruptions)
    terrain_score = calculate_terrain_risk(source_lat, source_lng, dest_lat, dest_lng)

    # Weighted composite score
    total = (
        weather_score * RISK_WEIGHTS["weather_risk"] +
        road_score * RISK_WEIGHTS["road_risk"] +
        disruption_score * RISK_WEIGHTS["disruption_risk"] +
        historical_score * RISK_WEIGHTS["historical_risk"] +
        terrain_score * RISK_WEIGHTS["terrain_risk"]
    )
    total = round(min(100.0, max(0.0, total)), 1)

    # Determine risk level
    if total <= 30:
        risk_level = "LOW"
    elif total <= 60:
        risk_level = "MEDIUM"
    elif total <= 80:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    # Build reasons list
    reasons = []
    if weather_score > 50:
        reasons.append(f"Adverse weather conditions ({weather_data.get('condition', 'Unknown')})")
    if weather_data.get("rainfall_mm", 0) > 15:
        reasons.append(f"Heavy rainfall ({weather_data.get('rainfall_mm', 0)} mm)")
    if road_score > 50:
        reasons.append(f"Challenging road conditions for {distance_km:.0f}km route")
    if disruption_score > 40:
        reasons.append(f"{active_reports} active disruption report(s) on this corridor")
    if terrain_score > 50:
        reasons.append("High-altitude mountainous terrain with limited road infrastructure")
    if historical_score > 40:
        reasons.append("Historical disruption records indicate elevated risk for this corridor")

    if not reasons:
        reasons.append("Route conditions are within acceptable parameters")

    return {
        "total_risk": total,
        "risk_level": risk_level,
        "weather_risk": round(weather_score, 1),
        "road_risk": round(road_score, 1),
        "disruption_risk": round(disruption_score, 1),
        "historical_risk": round(historical_score, 1),
        "terrain_risk": round(terrain_score, 1),
        "reasons": reasons,
        "weights": RISK_WEIGHTS
    }
