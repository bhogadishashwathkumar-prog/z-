from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class DeliveryStatus(str, enum.Enum):
    PENDING = "PENDING"
    ASSIGNED = "ASSIGNED"
    IN_TRANSIT = "IN_TRANSIT"
    DELAYED = "DELAYED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class DeliveryPriority(str, enum.Enum):
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    EMERGENCY = "EMERGENCY"


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    delivery_id = Column(String(50), unique=True, index=True, nullable=False)
    source = Column(String(300), nullable=False)
    destination = Column(String(300), nullable=False)
    source_lat = Column(Float, nullable=True)
    source_lng = Column(Float, nullable=True)
    dest_lat = Column(Float, nullable=True)
    dest_lng = Column(Float, nullable=True)
    goods_type = Column(String(100), nullable=False)
    weight_kg = Column(Float, default=0.0)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    driver_name = Column(String(200), nullable=True)
    priority = Column(Enum(DeliveryPriority), default=DeliveryPriority.NORMAL)
    status = Column(Enum(DeliveryStatus), default=DeliveryStatus.PENDING)
    risk_level = Column(String(20), default="LOW")
    expected_delivery = Column(DateTime(timezone=True), nullable=True)
    actual_delivery = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    vehicle = relationship("Vehicle", back_populates="deliveries")
