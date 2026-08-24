from typing import Dict
import math
import logging

logger = logging.getLogger(__name__)

# Accessibility weights (configurable)
ACCESSIBILITY_WEIGHTS = {
    "road_quality": 0.25,
    "weather_impact": 0.20,
    "distance_factor": 0.15,
    "travel_time_factor": 0.15,
    "disruption_probability": 0.15,
    "terrain_difficulty": 0.10,
}


def calculate_road_quality_score(distance_km: float, terrain_score: float) -> float:
    """
    Higher score = better road quality (better accessibility).
    """
    base = 80.0
    if distance_km > 300:
        base -= 20
    elif distance_km > 150:
        base -= 10
    elif distance_km > 75:
        base -= 5

    # Terrain makes roads worse
    base -= (terrain_score / 100.0) * 25
    return max(10.0, min(100.0, base))


def calculate_weather_impact_score(weather_data: Dict) -> float:
    """
    Higher score = less weather impact = better accessibility.
    """
    risk_map = {"LOW": 90, "MEDIUM": 60, "HIGH": 35, "CRITICAL": 15}
    return float(risk_map.get(weather_data.get("weather_risk", "LOW"), 70))


def calculate_distance_accessibility(distance_km: float) -> float:
    """Shorter routes are more accessible (higher score)."""
    if distance_km <= 30:
        return 95.0
    elif distance_km <= 75:
        return 80.0
    elif distance_km <= 150:
        return 65.0
    elif distance_km <= 300:
        return 45.0
    else:
        return 25.0


def calculate_travel_time_accessibility(eta_minutes: int) -> float:
    """Shorter travel time = more accessible."""
    if eta_minutes <= 60:
        return 95.0
    elif eta_minutes <= 120:
        return 78.0
    elif eta_minutes <= 240:
        return 55.0
    elif eta_minutes <= 480:
        return 35.0
    else:
        return 20.0


def calculate_disruption_probability_score(active_reports: int) -> float:
    """Fewer disruptions = higher accessibility score."""
    base = 90.0
    penalty = active_reports * 15.0
    return max(10.0, base - penalty)


def calculate_terrain_accessibility(source_lat: float, source_lng: float, dest_lat: float, dest_lng: float) -> float:
    """Higher NER regions are less accessible."""
    avg_lat = (source_lat + dest_lat) / 2
    if avg_lat > 27.0:
        return 25.0  # Very mountainous
    elif avg_lat > 25.5:
        return 45.0
    elif avg_lat > 24.0:
        return 65.0
    else:
        return 80.0


def calculate_accessibility_score(
    weather_data: Dict,
    distance_km: float,
    eta_minutes: int,
    source_lat: float,
    source_lng: float,
    dest_lat: float,
    dest_lng: float,
    active_reports: int = 0,
    terrain_score: float = 30.0
) -> Dict:
    """
    Calculate composite accessibility score 0-100.
    Higher score = BETTER ACCESSIBILITY.
    """
    road_quality = calculate_road_quality_score(distance_km, terrain_score)
    weather_impact = calculate_weather_impact_score(weather_data)
    distance_acc = calculate_distance_accessibility(distance_km)
    time_acc = calculate_travel_time_accessibility(eta_minutes)
    disruption_prob = calculate_disruption_probability_score(active_reports)
    terrain_acc = calculate_terrain_accessibility(source_lat, source_lng, dest_lat, dest_lng)

    total = (
        road_quality * ACCESSIBILITY_WEIGHTS["road_quality"] +
        weather_impact * ACCESSIBILITY_WEIGHTS["weather_impact"] +
        distance_acc * ACCESSIBILITY_WEIGHTS["distance_factor"] +
        time_acc * ACCESSIBILITY_WEIGHTS["travel_time_factor"] +
        disruption_prob * ACCESSIBILITY_WEIGHTS["disruption_probability"] +
        terrain_acc * ACCESSIBILITY_WEIGHTS["terrain_difficulty"]
    )
    total = round(min(100.0, max(0.0, total)), 1)

    # Determine label
    if total >= 80:
        label = "Highly Accessible"
    elif total >= 60:
        label = "Accessible"
    elif total >= 40:
        label = "Difficult"
    else:
        label = "Highly Difficult"

    return {
        "total_accessibility": total,
        "accessibility_label": label,
        "road_quality": round(road_quality, 1),
        "weather_impact": round(weather_impact, 1),
        "distance_factor": round(distance_acc, 1),
        "travel_time_factor": round(time_acc, 1),
        "disruption_probability": round(disruption_prob, 1),
        "terrain_difficulty": round(terrain_acc, 1),
    }
