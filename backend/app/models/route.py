from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, Text, JSON
from sqlalchemy.sql import func
from app.database import Base
import enum


class RouteStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(300), nullable=False)
    destination_name = Column(String(300), nullable=False)
    source_lat = Column(Float, nullable=False)
    source_lng = Column(Float, nullable=False)
    dest_lat = Column(Float, nullable=False)
    dest_lng = Column(Float, nullable=False)
    distance_km = Column(Float, nullable=True)
    eta_minutes = Column(Integer, nullable=True)
    risk_score = Column(Float, default=0.0)
    accessibility_score = Column(Float, default=50.0)
    reliability_score = Column(Float, default=50.0)
    weather_risk = Column(String(20), default="LOW")
    road_condition = Column(String(20), default="GOOD")
    disruption_risk = Column(String(20), default="LOW")
    status = Column(Enum(RouteStatus), default=RouteStatus.PENDING)
    waypoints = Column(JSON, nullable=True)
    polyline = Column(Text, nullable=True)
    ai_explanation = Column(Text, nullable=True)
    weather_data = Column(JSON, nullable=True)
    risk_factors = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by_id = Column(Integer, nullable=True)


class RouteHistory(Base):
    __tablename__ = "route_history"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, nullable=True)
    source_name = Column(String(300), nullable=False)
    destination_name = Column(String(300), nullable=False)
    risk_score = Column(Float, default=0.0)
    reliability_score = Column(Float, default=50.0)
    disruption_type = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
