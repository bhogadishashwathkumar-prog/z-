from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.delivery import Delivery, DeliveryStatus
from app.models.field_report import FieldReport, SeverityLevel
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.models.route import Route

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all dashboard statistics."""
    total_vehicles = db.query(Vehicle).filter(Vehicle.is_active == True).count()
    active_vehicles = db.query(Vehicle).filter(
        Vehicle.is_active == True,
        Vehicle.status == VehicleStatus.MOVING
    ).count()
    at_risk_vehicles = db.query(Vehicle).filter(
        Vehicle.is_active == True,
        Vehicle.status == VehicleStatus.AT_RISK
    ).count()

    active_deliveries = db.query(Delivery).filter(
        Delivery.status == DeliveryStatus.IN_TRANSIT
    ).count()
    delayed_deliveries = db.query(Delivery).filter(
        Delivery.status == DeliveryStatus.DELAYED
    ).count()
    total_deliveries = db.query(Delivery).count()

    critical_alerts = db.query(Alert).filter(
        Alert.severity == AlertSeverity.CRITICAL,
        Alert.status == AlertStatus.ACTIVE
    ).count()
    active_alerts = db.query(Alert).filter(
        Alert.status == AlertStatus.ACTIVE
    ).count()

    critical_reports = db.query(FieldReport).filter(
        FieldReport.severity == SeverityLevel.CRITICAL
    ).count()
    total_reports = db.query(FieldReport).count()

    recent_routes = db.query(Route).order_by(Route.created_at.desc()).limit(10).all()
    avg_risk = 0.0
    avg_accessibility = 0.0
    high_risk_count = 0
    if recent_routes:
        avg_risk = round(sum(r.risk_score for r in recent_routes if r.risk_score) / len(recent_routes), 1)
        avg_accessibility = round(sum(r.accessibility_score for r in recent_routes if r.accessibility_score) / len(recent_routes), 1)
        high_risk_count = sum(1 for r in recent_routes if r.risk_score and r.risk_score > 60)

    return {
        "vehicles": {
            "total": total_vehicles,
            "active": active_vehicles,
            "at_risk": at_risk_vehicles,
        },
        "deliveries": {
            "total": total_deliveries,
            "active": active_deliveries,
            "delayed": delayed_deliveries,
        },
        "alerts": {
            "total": active_alerts,
            "critical": critical_alerts,
        },
        "field_reports": {
            "total": total_reports,
            "critical": critical_reports,
        },
        "routes": {
            "avg_risk": avg_risk,
            "avg_accessibility": avg_accessibility,
            "high_risk_count": high_risk_count,
        }
    }
