import httpx
import math
import logging
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

OSRM_BASE_URL = "http://router.project-osrm.org"
NER_LOCATIONS = {
    "Guwahati": (26.1445, 91.7362),
    "Shillong": (25.5788, 91.8933),
    "Imphal": (24.8170, 93.9368),
    "Agartala": (23.8315, 91.2868),
    "Aizawl": (23.7307, 92.7173),
    "Kohima": (25.6751, 94.1086),
    "Dimapur": (25.9064, 93.7220),
    "Itanagar": (27.0844, 93.6053),
    "Gangtok": (27.3389, 88.6065),
    "Jorhat": (26.7509, 94.2037),
    "Silchar": (24.8333, 92.7789),
    "Dibrugarh": (27.4728, 94.9120),
    "Tezpur": (26.6338, 92.8004),
    "Nagaon": (26.3500, 92.6833),
    "Bongaigaon": (26.4833, 90.5833),
    "Sivasagar": (26.9833, 94.6333),
    "Haflong": (25.1667, 93.0167),
    "Tuensang": (26.2690, 94.8291),
    "Mon": (26.7333, 95.0167),
    "Ukhrul": (25.1028, 94.3597),
    "Churachandpur": (24.3328, 93.6806),
    "Lunglei": (22.8877, 92.7317),
    "Champhai": (23.4578, 93.3267),
    "Dharmanagar": (24.3667, 92.1667),
    "Karimganj": (24.8667, 92.3667),
    "North Lakhimpur": (27.2333, 94.1000),
    "Pasighat": (28.0666, 95.3232),
    "Bomdila": (27.2680, 92.4158),
    "Tawang": (27.5861, 91.8641),
    "Along": (28.1722, 94.7956),
}


async def geocode_location(location_name: str) -> Optional[Tuple[float, float]]:
    """Try to find coordinates for a location name."""
    # Check NER predefined locations first
    for name, coords in NER_LOCATIONS.items():
        if name.lower() in location_name.lower() or location_name.lower() in name.lower():
            return coords

    # Try Nominatim geocoding
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": f"{location_name}, India",
            "format": "json",
            "limit": 1,
            "countrycodes": "in"
        }
        headers = {"User-Agent": "NER-SmartLogix/1.0"}
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(url, params=params, headers=headers)
            data = response.json()
            if data:
                return (float(data[0]["lat"]), float(data[0]["lon"]))
    except Exception as e:
        logger.warning(f"Geocoding failed for {location_name}: {e}")

    return None


async def get_osrm_route(src_lat: float, src_lng: float, dst_lat: float, dst_lng: float) -> Optional[Dict]:
    """Get route from OSRM public API."""
    try:
        url = f"{OSRM_BASE_URL}/route/v1/driving/{src_lng},{src_lat};{dst_lng},{dst_lat}"
        params = {
            "overview": "full",
            "geometries": "geojson",
            "alternatives": "true",
            "steps": "false"
        }
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.get(url, params=params)
            data = response.json()

        if data.get("code") == "Ok" and data.get("routes"):
            routes = []
            for r in data["routes"]:
                routes.append({
                    "distance_km": round(r["distance"] / 1000, 2),
                    "eta_minutes": round(r["duration"] / 60),
                    "geometry": r.get("geometry", {})
                })
            return {"routes": routes, "is_demo": False}
    except Exception as e:
        logger.warning(f"OSRM routing failed: {e}")

    return None


def generate_demo_routes(src_lat: float, src_lng: float, dst_lat: float, dst_lng: float) -> List[Dict]:
    """Generate realistic demo routes for NER when OSRM fails."""
    # Euclidean distance
    dlat = dst_lat - src_lat
    dlng = dst_lng - src_lng
    straight_km = math.sqrt(dlat**2 + dlng**2) * 111.0

    # NER roads are winding — multiply by terrain factor
    route1_km = round(straight_km * 1.45, 1)
    route2_km = round(straight_km * 1.65, 1)
    route3_km = round(straight_km * 1.90, 1)

    def make_waypoints(multiplier: float, curve_type: int = 1) -> List:
        """Generate intermediate waypoints following realistic road curves."""
        # Calculate perpendicular direction for lateral road curve offset
        length = math.sqrt(dlat**2 + dlng**2) or 1.0
        # Perpendicular vector (-dlng, dlat) normalized
        perp_lat = -dlng / length
        perp_lng = dlat / length

        # Generate a multi-segment curved path following terrain contour
        points = []
        num_segments = 8
        for k in range(num_segments + 1):
            t = k / num_segments
            # Interpolate base line
            b_lat = src_lat + t * dlat
            b_lng = src_lng + t * dlng
            
            # Sine curve offset for winding road feel
            sine_offset = math.sin(t * math.pi) * multiplier * 0.15
            # Secondary wiggle for mountain turns
            wiggle = math.sin(t * 3 * math.pi) * 0.02 * (1 if curve_type == 1 else -1)
            
            p_lat = b_lat + (sine_offset + wiggle) * perp_lat
            p_lng = b_lng + (sine_offset + wiggle) * perp_lng
            points.append([p_lat, p_lng])

        return points

    return [
        {
            "distance_km": route1_km,
            "eta_minutes": int(route1_km * 1.5),  # ~40 km/h avg NER
            "geometry": {"type": "LineString", "coordinates": [[p[1], p[0]] for p in make_waypoints(0.25, 1)]},
            "is_demo": True
        },
        {
            "distance_km": route2_km,
            "eta_minutes": int(route2_km * 1.7),
            "geometry": {"type": "LineString", "coordinates": [[p[1], p[0]] for p in make_waypoints(0.55, 2)]},
            "is_demo": True
        },
        {
            "distance_km": route3_km,
            "eta_minutes": int(route3_km * 1.9),
            "geometry": {"type": "LineString", "coordinates": [[p[1], p[0]] for p in make_waypoints(-0.45, 1)]},
            "is_demo": True
        }
    ]


async def get_routes(src_lat: float, src_lng: float, dst_lat: float, dst_lng: float) -> List[Dict]:
    """Get route candidates from OSRM or demo data."""
    osrm_data = await get_osrm_route(src_lat, src_lng, dst_lat, dst_lng)
    if osrm_data and osrm_data.get("routes"):
        routes = osrm_data["routes"]
        # Ensure we have at least 3 routes
        if len(routes) < 3:
            demo = generate_demo_routes(src_lat, src_lng, dst_lat, dst_lng)
            while len(routes) < 3:
                idx = len(routes)
                if idx < len(demo):
                    routes.append(demo[idx])
        return routes
    else:
        return generate_demo_routes(src_lat, src_lng, dst_lat, dst_lng)
