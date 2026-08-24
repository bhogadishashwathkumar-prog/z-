from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class VehicleStatus(str, enum.Enum):
    MOVING = "MOVING"
    STOPPED = "STOPPED"
    DELAYED = "DELAYED"
    AT_RISK = "AT_RISK"
    DELIVERED = "DELIVERED"
    OFFLINE = "OFFLINE"


class VehicleType(str, enum.Enum):
    TRUCK = "TRUCK"
    VAN = "VAN"
    MOTORCYCLE = "MOTORCYCLE"
    HELICOPTER = "HELICOPTER"
    BOAT = "BOAT"
    SUV = "SUV"


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    vehicle_type = Column(Enum(VehicleType), default=VehicleType.TRUCK)
    driver_name = Column(String(200), nullable=True)
    driver_phone = Column(String(20), nullable=True)
    license_plate = Column(String(20), nullable=True)
    capacity_kg = Column(Float, default=1000.0)
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    destination_latitude = Column(Float, nullable=True)
    destination_longitude = Column(Float, nullable=True)
    destination_name = Column(String(200), nullable=True)
    speed_kmh = Column(Float, default=0.0)
    status = Column(Enum(VehicleStatus), default=VehicleStatus.STOPPED)
    risk_level = Column(String(20), default="LOW")
    eta_minutes = Column(Integer, nullable=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)

    # Relationships
    deliveries = relationship("Delivery", back_populates="vehicle")
