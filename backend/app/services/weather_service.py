import httpx
import logging
from typing import Optional, Dict
from app.config import settings

logger = logging.getLogger(__name__)

DEMO_WEATHER_DATA = {
    "temperature_c": 24.5,
    "rainfall_mm": 12.3,
    "humidity_pct": 82.0,
    "wind_speed_kmh": 18.5,
    "visibility_km": 6.5,
    "condition": "Moderate Rain",
    "weather_risk": "MEDIUM",
    "description": "Moderate rainfall with reduced visibility. Caution advised for mountain passes.",
    "is_demo": True
}

NER_WEATHER_PROFILES = {
    "assam": {"temp": 28, "rainfall": 15, "humidity": 85, "condition": "Heavy Rain", "risk": "HIGH"},
    "meghalaya": {"temp": 18, "rainfall": 25, "humidity": 90, "condition": "Very Heavy Rain", "risk": "CRITICAL"},
    "arunachal": {"temp": 15, "rainfall": 8, "humidity": 75, "condition": "Light Rain", "risk": "LOW"},
    "nagaland": {"temp": 22, "rainfall": 10, "humidity": 78, "condition": "Moderate Rain", "risk": "MEDIUM"},
    "manipur": {"temp": 25, "rainfall": 12, "humidity": 80, "condition": "Cloudy", "risk": "LOW"},
    "mizoram": {"temp": 26, "rainfall": 18, "humidity": 83, "condition": "Rain", "risk": "MEDIUM"},
    "tripura": {"temp": 30, "rainfall": 5, "humidity": 70, "condition": "Partly Cloudy", "risk": "LOW"},
    "sikkim": {"temp": 12, "rainfall": 20, "humidity": 88, "condition": "Heavy Rain", "risk": "HIGH"},
}


def get_weather_risk_level(rainfall_mm: float, condition: str) -> str:
    if rainfall_mm > 20 or "very heavy" in condition.lower():
        return "CRITICAL"
    elif rainfall_mm > 10 or "heavy" in condition.lower():
        return "HIGH"
    elif rainfall_mm > 3 or "rain" in condition.lower():
        return "MEDIUM"
    return "LOW"


async def get_weather(latitude: float, longitude: float) -> Dict:
    if not settings.has_openweather:
        logger.info("OpenWeather API not configured - returning demo data")
        return _get_demo_weather(latitude, longitude)

    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            "lat": latitude,
            "lon": longitude,
            "appid": settings.OPENWEATHER_API_KEY,
            "units": "metric"
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

        rainfall_mm = data.get("rain", {}).get("1h", 0.0)
        condition = data["weather"][0]["description"].title() if data.get("weather") else "Unknown"
        temp = data["main"]["temp"]
        humidity = data["main"]["humidity"]
        wind_kmh = data["wind"]["speed"] * 3.6  # m/s to km/h
        visibility_km = data.get("visibility", 10000) / 1000

        risk = get_weather_risk_level(rainfall_mm, condition)

        return {
            "temperature_c": round(temp, 1),
            "rainfall_mm": round(rainfall_mm, 1),
            "humidity_pct": round(humidity, 1),
            "wind_speed_kmh": round(wind_kmh, 1),
            "visibility_km": round(visibility_km, 1),
            "condition": condition,
            "weather_risk": risk,
            "description": f"{condition} with {humidity}% humidity and {round(wind_kmh, 1)} km/h wind.",
            "is_demo": False
        }
    except Exception as e:
        logger.warning(f"OpenWeather API error: {e} - falling back to demo data")
        return _get_demo_weather(latitude, longitude)


def _get_demo_weather(lat: float, lon: float) -> Dict:
    """Return contextual demo weather based on NER coordinates."""
    # Classify region by coordinates
    if 25.5 < lat < 27.5 and 89.5 < lon < 95.5:
        profile = NER_WEATHER_PROFILES["assam"]
    elif 25.0 < lat < 26.5 and 91.0 < lon < 92.8:
        profile = NER_WEATHER_PROFILES["meghalaya"]
    elif 26.5 < lat < 29.5 and 91.5 < lon < 97.4:
        profile = NER_WEATHER_PROFILES["arunachal"]
    elif 25.0 < lat < 27.0 and 93.5 < lon < 95.5:
        profile = NER_WEATHER_PROFILES["nagaland"]
    elif 23.8 < lat < 25.7 and 93.0 < lon < 95.0:
        profile = NER_WEATHER_PROFILES["manipur"]
    elif 21.9 < lat < 24.5 and 92.2 < lon < 93.5:
        profile = NER_WEATHER_PROFILES["mizoram"]
    elif 22.9 < lat < 24.5 and 91.1 < lon < 92.5:
        profile = NER_WEATHER_PROFILES["tripura"]
    elif 27.0 < lat < 28.2 and 88.0 < lon < 88.9:
        profile = NER_WEATHER_PROFILES["sikkim"]
    else:
        profile = NER_WEATHER_PROFILES["assam"]

    return {
        "temperature_c": profile["temp"],
        "rainfall_mm": profile["rainfall"],
        "humidity_pct": profile["humidity"],
        "wind_speed_kmh": 15.0,
        "visibility_km": 7.0 if profile["rainfall"] < 15 else 4.5,
        "condition": profile["condition"],
        "weather_risk": profile["risk"],
        "description": f"[DEMO DATA] {profile['condition']} conditions typical for this region of NER.",
        "is_demo": True
    }
