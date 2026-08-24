from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.vehicle import VehicleCreate, VehicleResponse, VehicleLocationUpdate
from app.models.vehicle import Vehicle, VehicleStatus
from app.utils.dependencies import get_current_user
from app.models.user import User
from datetime import datetime

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])


@router.get("", response_model=List[VehicleResponse])
def get_vehicles(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Vehicle).filter(Vehicle.is_active == True)
    if status:
        query = query.filter(Vehicle.status == status)
    return query.all()


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.post("", response_model=VehicleResponse, status_code=201)
def create_vehicle(
    vehicle_data: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_data.vehicle_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle ID already exists")
    vehicle = Vehicle(**vehicle_data.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.post("/{vehicle_id}/location")
def update_vehicle_location(
    vehicle_id: int,
    location: VehicleLocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    vehicle.current_latitude = location.latitude
    vehicle.current_longitude = location.longitude
    if location.speed_kmh is not None:
        vehicle.speed_kmh = location.speed_kmh
    if location.status is not None:
        vehicle.status = location.status
    vehicle.last_updated = datetime.utcnow()
    db.commit()
    return {"message": "Location updated"}
