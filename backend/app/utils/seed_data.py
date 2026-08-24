"""
NER SmartLogix Demo Seed Data
Populates database with realistic demo data for North Eastern Region of India.
NOTE: This is DEMO DATA only and does not represent actual government or official information.
"""
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle, VehicleStatus, VehicleType
from app.models.delivery import Delivery, DeliveryStatus, DeliveryPriority
from app.models.field_report import FieldReport, IncidentType, SeverityLevel, ReportStatus
from app.models.alert import Alert, AlertSeverity, AlertStatus, AlertType
from app.utils.auth_utils import hash_password
from datetime import datetime, timedelta
import uuid
import logging

logger = logging.getLogger(__name__)


def seed_demo_data(db: Session):
    """Seed database with demo data if tables are empty."""
    if db.query(User).count() > 0:
        logger.info("Database already has data, skipping seed.")
        return

    logger.info("Seeding demo data for NER SmartLogix...")

    # === USERS ===
    users = [
        User(full_name="Admin User", email="admin@nersmartlogix.in",
             hashed_password=hash_password("admin123"), role=UserRole.ADMIN,
             is_active=True, is_verified=True, phone="+91-9876543210"),
        User(full_name="Rajesh Kumar", email="logistics@nersmartlogix.in",
             hashed_password=hash_password("demo123"), role=UserRole.LOGISTICS_OPERATOR,
             is_active=True, is_verified=True, phone="+91-9876543211"),
        User(full_name="Priya Sharma", email="field@nersmartlogix.in",
             hashed_password=hash_password("demo123"), role=UserRole.FIELD_OFFICER,
             is_active=True, is_verified=True, phone="+91-9876543212"),
        User(full_name="Amit Singh", email="user@nersmartlogix.in",
             hashed_password=hash_password("demo123"), role=UserRole.USER,
             is_active=True, is_verified=True, phone="+91-9876543213"),
    ]
    for u in users:
        db.add(u)
    db.flush()

    # === VEHICLES ===
    vehicles_data = [
        {"vehicle_id": "NER-TRK-001", "name": "Heavy Truck Alpha", "type": VehicleType.TRUCK,
         "driver": "Ramesh Baruah", "lat": 26.1445, "lng": 91.7362, "dest": "Shillong",
         "d_lat": 25.5788, "d_lng": 91.8933, "status": VehicleStatus.MOVING, "speed": 42.0,
         "risk": "MEDIUM", "plate": "AS-01-1234"},
        {"vehicle_id": "NER-TRK-002", "name": "Supply Van Beta", "type": VehicleType.VAN,
         "driver": "Mohan Das", "lat": 25.6751, "lng": 94.1086, "dest": "Imphal",
         "d_lat": 24.8170, "d_lng": 93.9368, "status": VehicleStatus.MOVING, "speed": 38.0,
         "risk": "HIGH", "plate": "NL-01-5678"},
        {"vehicle_id": "NER-TRK-003", "name": "Medical Supply Van", "type": VehicleType.VAN,
         "driver": "Sunita Devi", "lat": 23.8315, "lng": 91.2868, "dest": "Agartala",
         "d_lat": 23.9315, "d_lng": 91.3868, "status": VehicleStatus.STOPPED, "speed": 0.0,
         "risk": "LOW", "plate": "TR-01-9012"},
        {"vehicle_id": "NER-TRK-004", "name": "Emergency Response Unit", "type": VehicleType.SUV,
         "driver": "Bijoy Chakma", "lat": 27.0844, "lng": 93.6053, "dest": "Itanagar",
         "d_lat": 27.1844, "d_lng": 93.7053, "status": VehicleStatus.AT_RISK, "speed": 25.0,
         "risk": "CRITICAL", "plate": "AR-01-3456"},
        {"vehicle_id": "NER-TRK-005", "name": "Cargo Truck Delta", "type": VehicleType.TRUCK,
         "driver": "Lalthansanga", "lat": 23.7307, "lng": 92.7173, "dest": "Aizawl",
         "d_lat": 23.8307, "d_lng": 92.8173, "status": VehicleStatus.DELAYED, "speed": 15.0,
         "risk": "HIGH", "plate": "MZ-01-7890"},
        {"vehicle_id": "NER-TRK-006", "name": "Relief Supply Truck", "type": VehicleType.TRUCK,
         "driver": "Temjen Wati", "lat": 26.3500, "lng": 92.6833, "dest": "Jorhat",
         "d_lat": 26.7509, "d_lng": 94.2037, "status": VehicleStatus.MOVING, "speed": 55.0,
         "risk": "LOW", "plate": "AS-05-2222"},
    ]
    for v in vehicles_data:
        vehicle = Vehicle(
            vehicle_id=v["vehicle_id"], name=v["name"],
            vehicle_type=v["type"], driver_name=v["driver"],
            current_latitude=v["lat"], current_longitude=v["lng"],
            destination_latitude=v["d_lat"], destination_longitude=v["d_lng"],
            destination_name=v["dest"], speed_kmh=v["speed"],
            status=v["status"], risk_level=v["risk"],
            license_plate=v["plate"], capacity_kg=5000.0, is_active=True
        )
        db.add(vehicle)
    db.flush()

    # === DELIVERIES ===
    vehicles = db.query(Vehicle).all()
    deliveries_data = [
        {"src": "Guwahati", "dst": "Shillong", "goods": "Medical Supplies",
         "priority": DeliveryPriority.HIGH, "status": DeliveryStatus.IN_TRANSIT, "risk": "MEDIUM"},
        {"src": "Dimapur", "dst": "Imphal", "goods": "Food Rations",
         "priority": DeliveryPriority.EMERGENCY, "status": DeliveryStatus.DELAYED, "risk": "HIGH"},
        {"src": "Agartala", "dst": "Silchar", "goods": "Construction Materials",
         "priority": DeliveryPriority.NORMAL, "status": DeliveryStatus.PENDING, "risk": "LOW"},
        {"src": "Itanagar", "dst": "Pasighat", "goods": "Government Documents",
         "priority": DeliveryPriority.HIGH, "status": DeliveryStatus.IN_TRANSIT, "risk": "CRITICAL"},
        {"src": "Aizawl", "dst": "Lunglei", "goods": "Relief Materials",
         "priority": DeliveryPriority.EMERGENCY, "status": DeliveryStatus.IN_TRANSIT, "risk": "HIGH"},
        {"src": "Guwahati", "dst": "Jorhat", "goods": "Agricultural Equipment",
         "priority": DeliveryPriority.NORMAL, "status": DeliveryStatus.DELIVERED, "risk": "LOW"},
        {"src": "Gangtok", "dst": "Siliguri", "goods": "Tourist Supplies",
         "priority": DeliveryPriority.NORMAL, "status": DeliveryStatus.ASSIGNED, "risk": "MEDIUM"},
        {"src": "Kohima", "dst": "Dimapur", "goods": "Electronic Equipment",
         "priority": DeliveryPriority.HIGH, "status": DeliveryStatus.IN_TRANSIT, "risk": "LOW"},
    ]
    for i, d in enumerate(deliveries_data):
        delivery = Delivery(
            delivery_id=f"DEL-{str(uuid.uuid4())[:8].upper()}",
            source=d["src"], destination=d["dst"],
            goods_type=d["goods"], weight_kg=500.0,
            driver_name=vehicles_data[i % len(vehicles_data)]["driver"],
            priority=d["priority"], status=d["status"],
            risk_level=d["risk"],
            expected_delivery=datetime.utcnow() + timedelta(hours=12 + i * 4)
        )
        db.add(delivery)

    # === FIELD REPORTS ===
    reports_data = [
        {"title": "Road Blocked by Landslide", "loc": "NH-2, Meghalaya", "lat": 25.4788, "lng": 91.7933,
         "type": IncidentType.LANDSLIDE, "sev": SeverityLevel.CRITICAL, "status": ReportStatus.VERIFIED,
         "desc": "Major landslide blocking NH-2 near Nongstoin. Approximately 50m of road covered.",
         "reporter": "Priya Sharma", "affects": True},
        {"title": "Bridge Damage Reported", "loc": "Kopili River Bridge, Assam", "lat": 26.3500, "lng": 92.8833,
         "type": IncidentType.BRIDGE_DAMAGE, "sev": SeverityLevel.HIGH, "status": ReportStatus.VERIFIED,
         "desc": "Significant cracks observed on bridge structure. Weight limit reduced.",
         "reporter": "Rajesh Kumar", "affects": True},
        {"title": "Flash Flood Warning", "loc": "Barak Valley, Assam", "lat": 24.8333, "lng": 92.7789,
         "type": IncidentType.FLOOD, "sev": SeverityLevel.HIGH, "status": ReportStatus.PENDING,
         "desc": "Rising water levels in Barak river. Road inundation expected within 6 hours.",
         "reporter": "Amit Singh", "affects": False},
        {"title": "Vehicle Accident", "loc": "NH-37, Near Jorhat", "lat": 26.5509, "lng": 94.0037,
         "type": IncidentType.ACCIDENT, "sev": SeverityLevel.MEDIUM, "status": ReportStatus.RESOLVED,
         "desc": "Two-vehicle collision partially blocking road. Cleared by local authorities.",
         "reporter": "Priya Sharma", "affects": False},
        {"title": "Road Surface Damage", "loc": "Imphal-Moreh Road", "lat": 24.5170, "lng": 94.2368,
         "type": IncidentType.DAMAGED_ROAD, "sev": SeverityLevel.MEDIUM, "status": ReportStatus.VERIFIED,
         "desc": "Heavy monsoon rain has eroded roadside. 2km stretch requires caution.",
         "reporter": "Rajesh Kumar", "affects": True},
        {"title": "Heavy Fog Alert", "loc": "Bomdila Pass, Arunachal", "lat": 27.2680, "lng": 92.4158,
         "type": IncidentType.WEATHER, "sev": SeverityLevel.HIGH, "status": ReportStatus.PENDING,
         "desc": "Dense fog reducing visibility to under 50m. Mountain pass temporarily unsafe.",
         "reporter": "Amit Singh", "affects": False},
    ]
    for r in reports_data:
        report = FieldReport(
            title=r["title"], location_name=r["loc"],
            latitude=r["lat"], longitude=r["lng"],
            incident_type=r["type"], severity=r["sev"],
            description=r["desc"], status=r["status"],
            reporter_name=r["reporter"], affects_route=r["affects"]
        )
        db.add(report)

    # === ALERTS ===
    alerts_data = [
        {"title": "CRITICAL: Landslide on NH-2 Meghalaya", "severity": AlertSeverity.CRITICAL,
         "type": AlertType.ROAD, "loc": "NH-2 Meghalaya",
         "msg": "Major landslide blocking NH-2 near Nongstoin. All vehicles must use alternative route via Mairang.",
         "lat": 25.4788, "lng": 91.7933},
        {"title": "Heavy Rainfall Warning — NER Region", "severity": AlertSeverity.HIGH,
         "type": AlertType.WEATHER, "loc": "NER Region",
         "msg": "IMD has issued heavy rainfall warning for Meghalaya, Assam, and Arunachal Pradesh.",
         "lat": 26.1445, "lng": 91.7362},
        {"title": "Bridge Weight Limit Restriction", "severity": AlertSeverity.WARNING,
         "type": AlertType.ROAD, "loc": "Kopili Bridge, Assam",
         "msg": "Kopili River bridge weight limit reduced to 5 tonnes. Heavy vehicles use alternative crossings.",
         "lat": 26.3500, "lng": 92.8833},
        {"title": "Medical Supply Delivery Delay", "severity": AlertSeverity.WARNING,
         "type": AlertType.DELIVERY, "loc": "Imphal Route",
         "msg": "Medical supply convoy delayed by 4 hours due to road conditions on Dimapur-Imphal corridor.",
         "lat": 24.8170, "lng": 93.9368},
        {"title": "Emergency Vehicle Deployment", "severity": AlertSeverity.HIGH,
         "type": AlertType.EMERGENCY, "loc": "Arunachal Pradesh",
         "msg": "Emergency response unit NER-TRK-004 deployed for flood relief in Arunachal Pradesh.",
         "lat": 27.0844, "lng": 93.6053},
        {"title": "System Alert: Demo Mode Active", "severity": AlertSeverity.INFO,
         "type": AlertType.SYSTEM, "loc": "System",
         "msg": "NER SmartLogix is running in DEMO MODE. Data shown is simulated for demonstration purposes.",
         "lat": None, "lng": None},
    ]
    for a in alerts_data:
        alert = Alert(
            title=a["title"], severity=a["severity"], alert_type=a["type"],
            location_name=a["loc"], message=a["msg"],
            latitude=a["lat"], longitude=a["lng"],
            status=AlertStatus.ACTIVE, is_demo=True
        )
        db.add(alert)

    db.commit()
    logger.info("✅ Demo data seeded successfully.")
    logger.info("Demo credentials:")
    logger.info("  Admin:    admin@nersmartlogix.in / admin123")
    logger.info("  Logistics: logistics@nersmartlogix.in / demo123")
    logger.info("  Field:    field@nersmartlogix.in / demo123")
    logger.info("  User:     user@nersmartlogix.in / demo123")
