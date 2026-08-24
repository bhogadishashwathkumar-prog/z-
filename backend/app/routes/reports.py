from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.field_report import FieldReportCreate, FieldReportResponse, FieldReportUpdate
from app.models.field_report import FieldReport, ReportStatus
from app.utils.dependencies import get_current_user
from app.models.user import User
from datetime import datetime

router = APIRouter(prefix="/api/reports", tags=["Field Reports"])


@router.get("", response_model=List[FieldReportResponse])
def get_reports(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FieldReport)
    if status:
        query = query.filter(FieldReport.status == status)
    if severity:
        query = query.filter(FieldReport.severity == severity)
    return query.order_by(FieldReport.created_at.desc()).limit(limit).all()


@router.post("", response_model=FieldReportResponse, status_code=201)
def create_report(
    report_data: FieldReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = FieldReport(
        **report_data.model_dump(),
        reporter_id=current_user.id,
        reporter_name=report_data.reporter_name or current_user.full_name
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.put("/{report_id}", response_model=FieldReportResponse)
def update_report(
    report_id: int,
    update: FieldReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(FieldReport).filter(FieldReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    for field, value in update.model_dump(exclude_none=True).items():
        setattr(report, field, value)
    if update.status == ReportStatus.RESOLVED:
        report.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(report)
    return report
