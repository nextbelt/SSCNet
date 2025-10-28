from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from typing import Dict, Any
import psutil
import sys

from app.core.database import get_db
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
async def health_check():
    """
    Basic health check endpoint
    Returns 200 if service is running
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "SSCN API",
        "version": settings.version
    }


@router.get("/detailed")
async def detailed_health_check(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Detailed health check with database and system metrics
    SOC 2 Compliance - Availability monitoring
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {}
    }
    
    # Database check
    try:
        db.execute(text("SELECT 1"))
        health_status["checks"]["database"] = {
            "status": "healthy",
            "message": "Database connection successful"
        }
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = {
            "status": "unhealthy",
            "message": f"Database connection failed: {str(e)}"
        }
    
    # System metrics
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        health_status["checks"]["system"] = {
            "status": "healthy",
            "metrics": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available_mb": memory.available / (1024 * 1024),
                "disk_percent": disk.percent,
                "disk_free_gb": disk.free / (1024 * 1024 * 1024)
            }
        }
        
        # Alert if resources are low
        if cpu_percent > 90 or memory.percent > 90 or disk.percent > 90:
            health_status["checks"]["system"]["status"] = "warning"
            health_status["checks"]["system"]["message"] = "High resource utilization"
            
    except Exception as e:
        health_status["checks"]["system"] = {
            "status": "unknown",
            "message": f"Could not retrieve system metrics: {str(e)}"
        }
    
    # Python version
    health_status["checks"]["python"] = {
        "status": "healthy",
        "version": sys.version
    }
    
    # Configuration check
    config_issues = []
    if not settings.database_url:
        config_issues.append("DATABASE_URL not configured")
    if not settings.secret_key or len(settings.secret_key) < 32:
        config_issues.append("SECRET_KEY weak or not configured")
    
    health_status["checks"]["configuration"] = {
        "status": "healthy" if not config_issues else "warning",
        "issues": config_issues
    }
    
    return health_status


@router.get("/readiness")
async def readiness_check(db: Session = Depends(get_db)):
    """
    Readiness probe - checks if service is ready to accept traffic
    Used by container orchestration (Kubernetes, etc.)
    """
    try:
        # Check database connectivity
        db.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service not ready"
        )


@router.get("/liveness")
async def liveness_check():
    """
    Liveness probe - checks if service is alive
    Used by container orchestration (Kubernetes, etc.)
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    }
