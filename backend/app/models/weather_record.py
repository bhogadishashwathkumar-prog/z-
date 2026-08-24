from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base


class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String(300), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    temperature_c = Column(Float, nullable=True)
    rainfall_mm = Column(Float, default=0.0)
    humidity_pct = Column(Float, nullable=True)
    wind_speed_kmh = Column(Float, default=0.0)
    visibility_km = Column(Float, nullable=True)
    condition = Column(String(100), nullable=True)
    weather_risk = Column(String(20), default="LOW")
    raw_data = Column(JSON, nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
