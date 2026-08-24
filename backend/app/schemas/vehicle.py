from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.vehicle import VehicleStatus, VehicleType


class VehicleCreate(BaseModel):
    vehicle_id: str = Field(..., min_length=2, max_length=50)
    name: str
    vehicle_type: VehicleType = VehicleType.TRUCK
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    license_plate: Optional[str] = None
    capacity_kg: Optional[float] = 1000.0


class VehicleResponse(BaseModel):
    id: int
    vehicle_id: str
    name: str
    vehicle_type: VehicleType
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    license_plate: Optional[str] = None
    capacity_kg: float
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    destination_name: Optional[str] = None
    speed_kmh: float
    status: VehicleStatus
    risk_level: str
    eta_minutes: Optional[int] = None
    last_updated: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True


class VehicleLocationUpdate(BaseModel):
    latitude: float
    longitude: float
    speed_kmh: Optional[float] = None
    status: Optional[VehicleStatus] = None
