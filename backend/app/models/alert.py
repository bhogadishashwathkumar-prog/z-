from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class AlertSeverity(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AlertStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"


class AlertType(str, enum.Enum):
    WEATHER = "WEATHER"
    ROAD = "ROAD"
    DISRUPTION = "DISRUPTION"
    EMERGENCY = "EMERGENCY"
    SYSTEM = "SYSTEM"
    DELIVERY = "DELIVERY"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    message = Column(Text, nullable=False)
    location_name = Column(String(300), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    alert_type = Column(Enum(AlertType), default=AlertType.SYSTEM)
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.INFO)
    status = Column(Enum(AlertStatus), default=AlertStatus.ACTIVE)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_demo = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User", back_populates="alerts_created")
