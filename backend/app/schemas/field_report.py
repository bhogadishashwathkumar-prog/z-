from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.field_report import IncidentType, SeverityLevel, ReportStatus


class FieldReportCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=300)
    location_name: str = Field(..., min_length=2, max_length=300)
    latitude: float
    longitude: float
    incident_type: IncidentType
    severity: SeverityLevel
    description: Optional[str] = None
    image_url: Optional[str] = None
    reporter_name: Optional[str] = None


class FieldReportResponse(BaseModel):
    id: int
    title: str
    location_name: str
    latitude: float
    longitude: float
    incident_type: IncidentType
    severity: SeverityLevel
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: ReportStatus
    reporter_name: Optional[str] = None
    affects_route: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FieldReportUpdate(BaseModel):
    status: Optional[ReportStatus] = None
    affects_route: Optional[bool] = None
