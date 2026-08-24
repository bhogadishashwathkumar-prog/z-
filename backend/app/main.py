from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import init_db, SessionLocal
from app.routes import auth, routes, weather, ai, vehicles, deliveries, reports, alerts, analytics

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Demo mode: {settings.is_demo_mode}")
    logger.info(f"Has Gemini: {settings.has_gemini}")
    logger.info(f"Has OpenWeather: {settings.has_openweather}")
    logger.info(f"Has Database: {settings.has_database}")

    # Create tables
    init_db()

    # Seed demo data
    try:
        from app.utils.seed_data import seed_demo_data
        db = SessionLocal()
        seed_demo_data(db)
        db.close()
    except Exception as e:
        logger.warning(f"Seed data warning: {e}")

    yield
    logger.info("Shutting down NER SmartLogix...")


app = FastAPI(
    title="NER SmartLogix API",
    description="AI-Based Smart Logistics and Accessibility Intelligence Platform for the North Eastern Region",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(routes.router)
app.include_router(weather.router)
app.include_router(ai.router)
app.include_router(vehicles.router)
app.include_router(deliveries.router)
app.include_router(reports.router)
app.include_router(alerts.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "demo_mode": settings.is_demo_mode,
        "docs": "/docs"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "demo_mode": settings.is_demo_mode,
        "has_gemini": settings.has_gemini,
        "has_openweather": settings.has_openweather,
        "has_database": settings.has_database
    }
