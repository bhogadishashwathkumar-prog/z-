from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import logging

logger = logging.getLogger(__name__)

Base = declarative_base()

# Use PostgreSQL if available, otherwise SQLite fallback for demo
if settings.has_database:
    DATABASE_URL = settings.DATABASE_URL
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
    logger.info("Connected to PostgreSQL database")
else:
    DATABASE_URL = "sqlite:///./ner_smartlogix_demo.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    logger.warning("No DATABASE_URL configured - using SQLite demo database")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    from app.models import user, vehicle, route, delivery, field_report, alert, weather_record
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")
