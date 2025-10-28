from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import time
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import create_tables
from app.api import auth, rfq
from app.services.linkedin import linkedin_service
from app.middleware.security_headers import SecurityHeadersMiddleware

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# Simple rate limiting (can be enhanced with Redis later)
request_counts = {}


def simple_rate_limit(request: Request, max_requests: int = 60):
    """Simple in-memory rate limiting"""
    client_ip = request.client.host
    current_time = time.time()
    
    # Clean old entries (older than 1 minute)
    if client_ip in request_counts:
        request_counts[client_ip] = [
            timestamp for timestamp in request_counts[client_ip] 
            if current_time - timestamp < 60
        ]
    else:
        request_counts[client_ip] = []
    
    # Check if under limit
    if len(request_counts[client_ip]) >= max_requests:
        return False
    
    request_counts[client_ip].append(current_time)
    return True


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events
    """
    # Startup
    logger.info("Starting Sourcing Supply Chain Net API")
    create_tables()
    logger.info("Database tables created/verified")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Sourcing Supply Chain Net API")


# Create FastAPI app
app = FastAPI(
    title=settings.project_name,
    version=settings.version,
    description="A comprehensive B2B supply chain sourcing platform with LinkedIn API integration",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Add middleware
# Security headers (SOC 2 Compliance)
app.add_middleware(SecurityHeadersMiddleware)

# Simple rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if not simple_rate_limit(request):
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded"}
        )
    response = await call_next(request)
    return response

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Trusted host middleware (security)
if not settings.debug:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "*.sscn.com", 
            "sscn.com", 
            "localhost",
            "*.railway.app",
            "*.up.railway.app"
        ]
    )


# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={"detail": "Endpoint not found"}
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


# Middleware for request timing
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Health check endpoint
@app.get("/health")
async def health_check(request: Request):
    """
    Health check endpoint for load balancers and monitoring
    """
    return {
        "status": "healthy",
        "version": settings.version,
        "environment": settings.environment,
        "timestamp": time.time()
    }


# API status endpoint
@app.get("/")
async def root(request: Request):
    """
    API root endpoint with basic information
    """
    return {
        "message": "Sourcing Supply Chain Net API",
        "version": settings.version,
        "environment": settings.environment,
        "docs_url": "/docs" if settings.debug else "Contact admin for API documentation",
        "linkedin_auth_url": "/api/auth/linkedin"
    }


# Include API routers
app.include_router(auth.router, prefix="/api")
app.include_router(rfq.router, prefix="/api")


# Additional API routes would be included here:
# app.include_router(companies.router, prefix="/api")
# app.include_router(search.router, prefix="/api")
# app.include_router(messages.router, prefix="/api")
# app.include_router(analytics.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )