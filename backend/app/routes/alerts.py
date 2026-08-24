from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.alert import AlertCreate, AlertResponse, AlertUpdate
from app.models.alert import Alert, AlertStatus
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("", response_model=List[AlertResponse])
def get_alerts(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)
    if severity:
        query = query.filter(Alert.severity == severity)
    return query.order_by(Alert.created_at.desc()).limit(limit).all()


@router.post("", response_model=AlertResponse, status_code=201)
def create_alert(
    alert_data: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = Alert(**alert_data.model_dump(), creator_id=current_user.id)
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.put("/{alert_id}", response_model=AlertResponse)
def update_alert(
    alert_id: int,
    update: AlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    for field, value in update.model_dump(exclude_none=True).items():
        setattr(alert, field, value)
    db.commit()
    db.refresh(alert)
    return alert
