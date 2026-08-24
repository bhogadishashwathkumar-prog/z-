from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class IncidentType(str, enum.Enum):
    ROADBLOCK = "ROADBLOCK"
    FLOOD = "FLOOD"
    LANDSLIDE = "LANDSLIDE"
    ACCIDENT = "ACCIDENT"
    DAMAGED_ROAD = "DAMAGED_ROAD"
    BRIDGE_DAMAGE = "BRIDGE_DAMAGE"
    WEATHER = "WEATHER"
    OTHER = "OTHER"


class SeverityLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ReportStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    RESOLVED = "RESOLVED"


class FieldReport(Base):
    __tablename__ = "field_reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    location_name = Column(String(300), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    incident_type = Column(Enum(IncidentType), nullable=False)
    severity = Column(Enum(SeverityLevel), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reporter_name = Column(String(200), nullable=True)
    affects_route = Column(Boolean, default=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    reporter = relationship("User", back_populates="field_reports")
