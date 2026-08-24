from fastapi import APIRouter, Depends, Query
from app.services.weather_service import get_weather

router = APIRouter(prefix="/api/weather", tags=["Weather"])


@router.get("")
async def get_weather_data(
    latitude: float = Query(..., description="Latitude"),
    longitude: float = Query(..., description="Longitude")
):
    """Get weather data for a location. Falls back to demo data if API key unavailable."""
    return await get_weather(latitude, longitude)
