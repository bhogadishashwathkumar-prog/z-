from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from app.database import get_db
from app.schemas.delivery import DeliveryCreate, DeliveryResponse, DeliveryUpdate
from app.models.delivery import Delivery, DeliveryStatus
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/deliveries", tags=["Deliveries"])


@router.get("", response_model=List[DeliveryResponse])
def get_deliveries(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Delivery)
    if status:
        query = query.filter(Delivery.status == status)
    if priority:
        query = query.filter(Delivery.priority == priority)
    return query.order_by(Delivery.created_at.desc()).limit(limit).all()


@router.post("", response_model=DeliveryResponse, status_code=201)
def create_delivery(
    delivery_data: DeliveryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    delivery_id = f"DEL-{str(uuid.uuid4())[:8].upper()}"
    expected = datetime.utcnow() + timedelta(hours=24)
    delivery = Delivery(
        delivery_id=delivery_id,
        expected_delivery=expected,
        **delivery_data.model_dump()
    )
    db.add(delivery)
    db.commit()
    db.refresh(delivery)
    return delivery


@router.put("/{delivery_id}", response_model=DeliveryResponse)
def update_delivery(
    delivery_id: int,
    update: DeliveryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    for field, value in update.model_dump(exclude_none=True).items():
        setattr(delivery, field, value)
    if update.status == DeliveryStatus.DELIVERED:
        delivery.actual_delivery = datetime.utcnow()
    db.commit()
    db.refresh(delivery)
    return delivery
