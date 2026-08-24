import logging
from typing import Dict, Optional
from app.config import settings

logger = logging.getLogger(__name__)

DEMO_EXPLANATION = """[DEMO MODE — No Gemini API Key] 

**Route Analysis Summary:**
Based on the calculated risk and accessibility scores, Route A is recommended over the alternatives. While it may not be the shortest path, it offers significantly better safety margins given the current weather conditions and road infrastructure in this NER corridor.

**Key Observations:**
- The recommended route has a lower risk score, indicating fewer active disruptions and better road surface conditions.
- Terrain factors have been considered — mountainous segments of NER demand extra caution during monsoon season.
- Weather conditions along the route show moderate rainfall impact; road conditions may deteriorate at higher elevations.

**Delivery Recommendation:**
Proceed with the recommended route but ensure vehicle is equipped for wet road conditions. Monitor weather updates during transit.

**Emergency Note:**
If conditions worsen, the alternative route via lower elevation may provide safer passage, though at increased distance.

*This explanation is generated from backend-calculated data. No real-time government or weather data was used to generate this summary.*"""


async def analyze_route_with_ai(route_data: Dict) -> str:
    """Call Gemini API to generate route explanation."""
    if not settings.has_gemini:
        logger.info("Gemini API not configured - returning demo explanation")
        return DEMO_EXPLANATION

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""You are an AI logistics intelligence assistant for the North Eastern Region (NER) of India.

Analyze the following route data and provide a clear, professional explanation.

ROUTE DATA:
- Source: {route_data.get('source')}
- Destination: {route_data.get('destination')}
- Distance: {route_data.get('distance_km')} km
- Estimated Travel Time: {route_data.get('eta_minutes')} minutes
- Risk Score: {route_data.get('risk_score')}/100 (higher = more dangerous)
- Accessibility Score: {route_data.get('accessibility_score')}/100 (higher = better accessibility)
- Reliability Score: {route_data.get('reliability_score')}/100
- Weather Condition: {route_data.get('weather', {}).get('condition', 'Unknown')}
- Rainfall: {route_data.get('weather', {}).get('rainfall_mm', 0)} mm
- Weather Risk: {route_data.get('weather_risk', 'Unknown')}
- Road Condition: {route_data.get('road_condition', 'Unknown')}
- Active Disruption Reports: {route_data.get('active_reports', 0)}
- Risk Reasons: {', '.join(route_data.get('risk_reasons', []))}
- Is Recommended Route: {route_data.get('is_recommended', False)}

INSTRUCTIONS:
1. Explain why this route was recommended (or not recommended).
2. List key risk factors in plain language.
3. Suggest precautions for this route.
4. Give a delivery recommendation (proceed / delay / use alternative).
5. Keep the explanation professional, concise, and useful for government and logistics operators.
6. Do NOT invent weather data, road closures, or GPS coordinates — only use the data provided.
7. If any value is "Unknown" or missing, say "data unavailable" for that item.
8. Format with clear sections using **bold headers**.

Limit response to 300 words."""

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return f"[AI analysis unavailable — backend error. Using demo explanation]\n\n{DEMO_EXPLANATION}"


async def explain_risk_with_ai(risk_data: Dict) -> str:
    """Generate a plain-language risk explanation using Gemini."""
    if not settings.has_gemini:
        return "[DEMO MODE] Risk score has been calculated based on weather conditions, road infrastructure, terrain difficulty, active disruption reports, and historical data for this NER corridor. Higher scores indicate routes with greater danger and should be avoided unless absolutely necessary."

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""Explain this route risk score in plain language for a logistics operator in NER India.

Risk Score: {risk_data.get('total_risk')}/100
Risk Level: {risk_data.get('risk_level')}
Weather Risk: {risk_data.get('weather_risk')}/100
Road Risk: {risk_data.get('road_risk')}/100
Disruption Risk: {risk_data.get('disruption_risk')}/100
Historical Risk: {risk_data.get('historical_risk')}/100
Terrain Risk: {risk_data.get('terrain_risk')}/100
Reasons: {', '.join(risk_data.get('reasons', []))}

Provide a 3-4 sentence plain-language explanation of why this risk score was assigned. Do NOT add information not in the data provided."""

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        logger.error(f"Gemini risk explain error: {e}")
        return "[AI explanation unavailable]"
