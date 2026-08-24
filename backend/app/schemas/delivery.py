from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.delivery import DeliveryStatus, DeliveryPriority


class DeliveryCreate(BaseModel):
    source: str
    destination: str
    source_lat: Optional[float] = None
    source_lng: Optional[float] = None
    dest_lat: Optional[float] = None
    dest_lng: Optional[float] = None
    goods_type: str
    weight_kg: Optional[float] = 0.0
    vehicle_id: Optional[int] = None
    driver_name: Optional[str] = None
    priority: DeliveryPriority = DeliveryPriority.NORMAL
    notes: Optional[str] = None


class DeliveryResponse(BaseModel):
    id: int
    delivery_id: str
    source: str
    destination: str
    goods_type: str
    weight_kg: float
    driver_name: Optional[str] = None
    priority: DeliveryPriority
    status: DeliveryStatus
    risk_level: str
    expected_delivery: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DeliveryUpdate(BaseModel):
    status: Optional[DeliveryStatus] = None
    priority: Optional[DeliveryPriority] = None
    driver_name: Optional[str] = None
