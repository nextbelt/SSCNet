from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import validator


class Settings(BaseSettings):
    # Application
    project_name: str = "LinkedProcurement"
    version: str = "1.0.0"
    app_version: str = "1.0.0"  # Alias for Sentry
    debug: bool = False
    environment: str = "production"
    log_level: str = "INFO"
    
    # Production Domain
    production_domain: str = "linkedprocurement.com"
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30
    
    # Frontend URL
    frontend_url: str = "http://localhost:3000"
    
    # Database
    database_url: str = "sqlite:///./sscn.db"
    database_url_test: Optional[str] = None
    
    # LinkedIn API (Optional - can be placeholders)
    linkedin_client_id: str = "placeholder-linkedin-client-id"
    linkedin_client_secret: str = "placeholder-linkedin-client-secret"
    linkedin_redirect_uri: str = "http://localhost:3000/auth/linkedin/callback"
    
    # SendGrid (Optional)
    sendgrid_api_key: str = "placeholder-sendgrid-key"
    from_email: str = "noreply@example.com"
    
    # AWS S3 (Optional)
    aws_access_key_id: str = "placeholder-aws-key"
    aws_secret_access_key: str = "placeholder-aws-secret" 
    s3_bucket_name: str = "placeholder-bucket"
    aws_region: str = "us-east-1"
    
    # Redis (Optional)
    redis_url: str = "redis://localhost:6379/0"
    
    # Elasticsearch (Optional)
    elasticsearch_url: str = "http://localhost:9200"
    
    # Pusher (Optional)
    pusher_app_id: str = "placeholder-pusher-app-id"
    pusher_key: str = "placeholder-pusher-key"
    pusher_secret: str = "placeholder-pusher-secret"
    pusher_cluster: str = "us2"
    
    # Third-party APIs
    clearbit_api_key: Optional[str] = None
    hunter_api_key: Optional[str] = None
    zoominfo_api_key: Optional[str] = None
    
    # Monitoring
    sentry_dsn: Optional[str] = None
    
    # Supabase
    supabase_url: Optional[str] = None
    supabase_anon_key: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    
    @property
    def SENTRY_DSN(self) -> Optional[str]:
        """Uppercase alias for Sentry configuration"""
        return self.sentry_dsn
    
    @property
    def ENVIRONMENT(self) -> str:
        """Uppercase alias for environment"""
        return self.environment
    
    @property
    def APP_VERSION(self) -> str:
        """Uppercase alias for app version"""
        return self.app_version
    
    # SOC 2 Compliance
    max_login_attempts: int = 5
    account_lockout_duration_minutes: int = 15
    mfa_required_for_admin: bool = True
    password_min_length: int = 12
    session_timeout_minutes: int = 30
    session_absolute_timeout_hours: int = 24
    
    # CORS
    allowed_origins: List[str] = []
    
    # Rate Limiting
    rate_limit_requests_per_minute: int = 60
    rate_limit_requests_per_hour: int = 1000

    @validator('allowed_origins', pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()