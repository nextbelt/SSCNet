"""
Sentry Configuration for Error Tracking and Monitoring
SOC 2 Requirement: Real-time error tracking and alerting
"""
try:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
except ImportError:
    sentry_sdk = None
    print("⚠️ WARNING: sentry-sdk not installed. Error tracking disabled.")

from app.core.config import settings


def init_sentry():
    """
    Initialize Sentry for error tracking and performance monitoring.
    
    Environment Variables Required:
    - SENTRY_DSN: Your Sentry project DSN
    - ENVIRONMENT: production, staging, or development
    """
    if sentry_sdk is None:
        return

    if not settings.SENTRY_DSN:
        print("⚠️ WARNING: SENTRY_DSN not configured. Error tracking disabled.")
        return
    
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        
        # Performance monitoring
        traces_sample_rate=0.1 if settings.ENVIRONMENT == "production" else 1.0,
        
        # Integrations
        integrations=[
            FastApiIntegration(
                transaction_style="endpoint",
                failed_request_status_codes=[400, 401, 403, 404, 500, 501, 502, 503],
            ),
            SqlalchemyIntegration(),
        ],
        
        # Release tracking
        release=settings.APP_VERSION,
        
        # Error filtering
        before_send=before_send_filter,
        
        # PII protection
        send_default_pii=False,
        
        # Debug mode (only in development)
        debug=settings.ENVIRONMENT == "development",
        
        # Max breadcrumbs
        max_breadcrumbs=50,
        
        # Attach stacktrace
        attach_stacktrace=True,
    )
    
    print(f"✅ Sentry initialized for {settings.ENVIRONMENT} environment")


def before_send_filter(event, hint):
    """
    Filter and sanitize events before sending to Sentry.
    Remove PII and filter out noise.
    """
    # Don't send health check errors
    if event.get('request', {}).get('url', '').endswith('/health'):
        return None
    
    # Don't send 404 errors for common bot paths
    if event.get('request', {}).get('url', '').endswith(('.php', '.asp', '.env', 'wp-admin')):
        return None
    
    # Sanitize sensitive data from event
    if 'user' in event:
        # Keep user ID but remove email/name
        if 'email' in event['user']:
            del event['user']['email']
        if 'username' in event['user']:
            del event['user']['username']
    
    # Remove sensitive headers
    if 'request' in event and 'headers' in event['request']:
        sensitive_headers = ['Authorization', 'Cookie', 'X-API-Key']
        for header in sensitive_headers:
            if header in event['request']['headers']:
                event['request']['headers'][header] = '[Filtered]'
    
    # Remove sensitive query parameters
    if 'request' in event and 'query_string' in event['request']:
        query = event['request']['query_string']
        if any(param in query for param in ['password', 'token', 'secret', 'key']):
            event['request']['query_string'] = '[Filtered]'
    
    return event


def capture_security_event(event_type: str, user_id: int = None, details: dict = None):
    """
    Capture security-related events with high priority.
    
    Args:
        event_type: Type of security event (e.g., "failed_login", "mfa_bypass_attempt")
        user_id: Optional user ID involved
        details: Additional context
    """
    if sentry_sdk is None:
        return

    with sentry_sdk.configure_scope() as scope:
        scope.set_tag("security_event", True)
        scope.set_level("warning")
        
        if user_id:
            scope.set_user({"id": user_id})
        
        if details:
            for key, value in details.items():
                scope.set_context(key, value)
    
    sentry_sdk.capture_message(
        f"Security Event: {event_type}",
        level="warning"
    )


def capture_compliance_violation(violation_type: str, details: dict):
    """
    Capture compliance violations (SOC 2, GDPR, etc.)
    
    Args:
        violation_type: Type of violation
        details: Violation details
    """
    if sentry_sdk is None:
        return

    with sentry_sdk.configure_scope() as scope:
        scope.set_tag("compliance_violation", True)
        scope.set_level("error")
        scope.set_context("violation", details)
    
    sentry_sdk.capture_message(
        f"Compliance Violation: {violation_type}",
        level="error"
    )


# Custom error classes for better Sentry grouping
class SecurityViolation(Exception):
    """Raised when a security policy is violated"""
    pass


class DataIntegrityError(Exception):
    """Raised when data integrity is compromised"""
    pass


class RateLimitExceeded(Exception):
    """Raised when rate limit is exceeded"""
    pass
