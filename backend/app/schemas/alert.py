from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.alert import AlertSeverity, AlertStatus, AlertType


class AlertCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=300)
    message: str
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    alert_type: AlertType = AlertType.SYSTEM
    severity: AlertSeverity = AlertSeverity.INFO


class AlertResponse(BaseModel):
    id: int
    title: str
    message: str
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    alert_type: AlertType
    severity: AlertSeverity
    status: AlertStatus
    is_demo: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AlertUpdate(BaseModel):
    status: Optional[AlertStatus] = None
