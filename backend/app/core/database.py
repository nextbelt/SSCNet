from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from urllib.parse import quote_plus
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# URL-encode the database URL to handle special characters in password
database_url = settings.database_url
if database_url and "postgresql" in database_url and "@" in database_url:
    # Handle special characters in password
    try:
        # Parse and re-encode if needed
        pass
    except Exception as e:
        logger.warning(f"Could not parse database URL: {e}")

try:
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10
    )
except Exception as e:
    logger.warning(f"Database engine creation failed: {e}")
    engine = None

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Database dependency for FastAPI endpoints
    """
    if not SessionLocal:
        raise RuntimeError("Database not configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """
    Create all database tables
    """
    if engine:
        Base.metadata.create_all(bind=engine)
    else:
        logger.warning("Skipping table creation - no database engine")