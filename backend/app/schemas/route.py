from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime


class RouteAnalyzeRequest(BaseModel):
    source: str = Field(..., description="Source location name")
    destination: str = Field(..., description="Destination location name")
    source_lat: Optional[float] = None
    source_lng: Optional[float] = None
    dest_lat: Optional[float] = None
    dest_lng: Optional[float] = None
    delivery_type: Optional[str] = "GENERAL"
    priority: Optional[str] = "NORMAL"
    vehicle_type: Optional[str] = "TRUCK"
    waypoints: Optional[List[Dict]] = None


class RiskFactors(BaseModel):
    weather_risk: float = 0.0
    road_risk: float = 0.0
    disruption_risk: float = 0.0
    historical_risk: float = 0.0
    terrain_risk: float = 0.0
    total_risk: float = 0.0
    risk_level: str = "LOW"
    reasons: List[str] = []


class RouteCandidate(BaseModel):
    route_id: str
    source: str
    destination: str
    distance_km: float
    eta_minutes: int
    risk_score: float
    accessibility_score: float
    reliability_score: float
    weather_risk: str
    road_condition: str
    disruption_risk: str
    risk_level: str
    risk_factors: RiskFactors
    waypoints: Optional[List] = None
    is_recommended: bool = False
    ai_explanation: Optional[str] = None


class RouteAnalyzeResponse(BaseModel):
    recommended_route: RouteCandidate
    alternatives: List[RouteCandidate]
    weather_data: Optional[Dict] = None
    ai_summary: Optional[str] = None
    is_demo: bool = False
    timestamp: str
