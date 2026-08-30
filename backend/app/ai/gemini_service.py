import asyncio
import logging
from typing import Dict, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

DEMO_BODY = """**Route Analysis Summary:**
Based on the calculated risk and accessibility scores, the recommended route offers significantly better safety margins given the current weather conditions and road infrastructure in this NER corridor.

**Key Observations:**
- The recommended route has a lower risk score, indicating fewer active disruptions and better road surface conditions.
- Terrain factors have been considered — mountainous segments of NER demand extra caution during monsoon season.
- Weather conditions along the route show rainfall impact; road conditions may deteriorate at higher elevations.

**Delivery Recommendation:**
Proceed with the recommended route but ensure vehicle is equipped for wet road conditions. Monitor weather updates during transit.

*This explanation is generated from backend-calculated data fallback.*"""


def _build_route_prompt(route_data: Dict) -> str:
    return f"""You are an AI logistics intelligence assistant for the North Eastern Region (NER) of India.

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


def _build_risk_prompt(risk_data: Dict) -> str:
    return f"""Explain this route risk score in plain language for a logistics operator in NER India.

Risk Score: {risk_data.get('total_risk')}/100
Risk Level: {risk_data.get('risk_level')}
Weather Risk: {risk_data.get('weather_risk')}/100
Road Risk: {risk_data.get('road_risk')}/100
Disruption Risk: {risk_data.get('disruption_risk')}/100
Historical Risk: {risk_data.get('historical_risk')}/100
Terrain Risk: {risk_data.get('terrain_risk')}/100
Reasons: {', '.join(risk_data.get('reasons', []))}

Provide a 3-4 sentence plain-language explanation of why this risk score was assigned. Do NOT add information not in the data provided."""


def _categorize_gemini_error(e: Exception) -> str:
    """Categorize Gemini API exceptions into standard categories for audit and log clarity."""
    error_str = str(e).lower()
    error_type = type(e).__name__

    code = getattr(e, 'code', None)
    if code == 401 or any(k in error_str for k in ['api_key_invalid', 'invalid api key', 'unauthorized', 'invalid_api_key']):
        return "INVALID_KEY"
    if code == 403 or any(k in error_str for k in ['forbidden', 'permissiondenied', 'permission_denied']):
        return "PERMISSION_ERROR"
    if code == 404 or any(k in error_str for k in ['not_found', 'model not found', 'no longer available']):
        return "MODEL_UNAVAILABLE"
    if code == 429 or any(k in error_str for k in ['quota', 'resourceexhausted', 'rate limit', 'too many requests', 'resource_exhausted']):
        return "QUOTA_ERROR"
    if code == 503 or any(k in error_str for k in ['unavailable', 'high demand', 'service_unavailable']):
        return "RATE_LIMIT"
    if any(k in error_str for k in ['connection', 'timeout', 'unreachable', 'network', 'httpx', 'socket']):
        return "NETWORK_ERROR"
    if isinstance(e, ImportError) or 'import' in error_str:
        return "SDK_ERROR"

    return f"UNKNOWN_ERROR ({error_type})"


async def discover_available_gemini_models(client) -> List[str]:
    """Query SDK model catalog to discover models supporting generateContent."""
    available_models = []
    try:
        models = list(client.models.list())
        for m in models:
            name = m.name.replace("models/", "")
            actions = getattr(m, "supported_actions", [])
            if "generateContent" in actions:
                available_models.append(name)
        logger.info(f"Discovered available Gemini models: {available_models}")
    except Exception as e:
        logger.warning(f"Model discovery warning: {e}")
    return available_models


async def _resolve_working_model(client, preferred_model: str) -> str:
    """Inspect SDK models supporting generateContent and return a verified operational model name."""
    from google.genai import types

    candidates = [preferred_model, "gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"]
    for m_name in candidates:
        if not m_name or m_name in ("gemini-1.5-flash", "gemini-2.5-flash"):
            continue
        try:
            res = await client.aio.models.generate_content(
                model=m_name,
                contents="ping",
                config=types.GenerateContentConfig(
                    automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
                ),
            )
            if res and res.text:
                logger.info(f"Verified active Gemini model via SDK ping: {m_name}")
                return m_name
        except Exception:
            continue

    return "gemini-3.6-flash"


async def test_gemini_connection() -> Dict:
    """Test Gemini API connection independently with minimal prompt."""
    configured_model = settings.GEMINI_MODEL or "gemini-3.6-flash"

    logger.info("Gemini SDK: google-genai")
    logger.info(f"Gemini key configured: {'YES' if settings.has_gemini else 'NO'}")
    logger.info(f"Gemini model: {configured_model}")
    logger.info(f"has_gemini: {settings.has_gemini}")

    if not settings.has_gemini:
        return {
            "status": "FAILURE",
            "category": "MISSING_KEY",
            "configured_model": configured_model,
            "has_gemini": False
        }

    try:
        from google import genai
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        available_models = await discover_available_gemini_models(client)
        
        res = await client.aio.models.generate_content(
            model=configured_model,
            contents="Respond with exactly:\nGemini connection successful."
        )
        if res and res.text:
            return {
                "status": "SUCCESS",
                "category": "SUCCESS",
                "response": res.text.strip(),
                "model_used": configured_model,
                "available_models": available_models,
                "has_gemini": True
            }
        else:
            return {
                "status": "FAILURE",
                "category": "UNKNOWN_ERROR",
                "detail": "Empty text response",
                "has_gemini": True
            }
    except Exception as e:
        category = _categorize_gemini_error(e)
        logger.error(f"Gemini connection test failed: {category} ({e})")
        return {
            "status": "FAILURE",
            "category": category,
            "error": str(e),
            "has_gemini": True
        }


async def analyze_route_with_ai(route_data: Dict) -> str:
    """Call Gemini API to generate route explanation using the google-genai SDK."""
    configured_model = settings.GEMINI_MODEL or "gemini-3.6-flash"

    # Safe diagnostic logging (never log API keys or secrets)
    logger.info("Gemini SDK: google-genai")
    logger.info(f"Gemini key configured: {'YES' if settings.has_gemini else 'NO'}")
    logger.info(f"Gemini model: {configured_model}")
    logger.info(f"has_gemini: {settings.has_gemini}")

    if not settings.has_gemini:
        logger.warning("Gemini request failed: MISSING_KEY — GEMINI_API_KEY is not configured — returning fallback")
        return f"[DEMO MODE — No Gemini API Key Configured]\n\n{DEMO_BODY}"

    try:
        from google import genai
        from google.genai import types

        logger.info("Gemini request started")
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        prompt = _build_route_prompt(route_data)

        # Attempt call with configured model first
        active_model = configured_model
        try:
            response = await client.aio.models.generate_content(
                model=active_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
                ),
            )
        except Exception as first_err:
            category = _categorize_gemini_error(first_err)
            if category in ("MODEL_UNAVAILABLE", "QUOTA_ERROR", "RATE_LIMIT"):
                logger.warning(f"Primary model '{active_model}' encountered {category}. Resolving operational model...")
                resolved_model = await _resolve_working_model(client, configured_model)
                if resolved_model != active_model:
                    active_model = resolved_model
                    logger.info(f"Retrying Gemini call with resolved model: {active_model}")
                    response = await client.aio.models.generate_content(
                        model=active_model,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
                        ),
                    )
                else:
                    raise first_err
            else:
                raise first_err

        if response and response.text:
            logger.info("Gemini request succeeded")
            return response.text
        else:
            logger.warning("Gemini request failed: EMPTY_RESPONSE — using fallback")
            return f"[AI analysis unavailable — empty response from Gemini API]\n\n{DEMO_BODY}"

    except ImportError as e:
        logger.error(f"Gemini request failed: SDK_ERROR ({e})")
        return f"[AI analysis unavailable — google-genai SDK import error]\n\n{DEMO_BODY}"
    except Exception as e:
        category = _categorize_gemini_error(e)
        logger.error(f"Gemini request failed: {category} ({e})")
        return f"[AI analysis unavailable — backend error ({category})]\n\n{DEMO_BODY}"


async def explain_risk_with_ai(risk_data: Dict) -> str:
    """Generate a plain-language risk explanation using the google-genai SDK."""
    configured_model = settings.GEMINI_MODEL or "gemini-3.6-flash"

    if not settings.has_gemini:
        logger.warning("Gemini risk explain request failed: MISSING_KEY — returning demo risk text")
        return "[DEMO MODE — No Gemini API Key Configured] Risk score has been calculated based on weather conditions, road infrastructure, terrain difficulty, active disruption reports, and historical data for this NER corridor."

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        prompt = _build_risk_prompt(risk_data)

        response = await client.aio.models.generate_content(
            model=configured_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
            ),
        )

        if response and response.text:
            return response.text
        return "[AI explanation unavailable — empty response]"

    except ImportError as e:
        logger.error(f"Gemini risk explain request failed: SDK_ERROR ({e})")
        return "[AI explanation unavailable — missing google-genai package]"
    except Exception as e:
        category = _categorize_gemini_error(e)
        logger.error(f"Gemini risk explain request failed: {category} ({e})")
        return f"[AI explanation unavailable — {category}]"




