from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from typing import Optional, Dict, Any
import json
from fastapi import Request


class AuditService:
    """
    Service for creating and managing audit logs
    SOC 2 Compliance requirement
    """
    
    @staticmethod
    def log_action(
        db: Session,
        action: str,
        status: str,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_path: Optional[str] = None,
        request_method: Optional[str] = None,
        status_code: Optional[int] = None,
        error_message: Optional[str] = None
    ) -> AuditLog:
        """
        Create an audit log entry
        
        Args:
            action: The action performed (e.g., "user.login", "rfq.create")
            status: "success", "failure", or "error"
            user_id: ID of the user who performed the action
            user_email: Email of the user
            resource_type: Type of resource affected
            resource_id: ID of the resource affected
            details: Additional context as a dictionary
            ip_address: Client IP address
            user_agent: Client user agent
            request_path: API endpoint path
            request_method: HTTP method
            status_code: HTTP status code
            error_message: Error message if action failed
        """
        audit_log = AuditLog(
            user_id=user_id,
            user_email=user_email,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=json.dumps(details) if details else None,
            ip_address=ip_address,
            user_agent=user_agent,
            request_path=request_path,
            request_method=request_method,
            status=status,
            status_code=status_code,
            error_message=error_message
        )
        
        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)
        
        return audit_log
    
    @staticmethod
    def log_from_request(
        db: Session,
        request: Request,
        action: str,
        status: str,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        status_code: Optional[int] = None,
        error_message: Optional[str] = None
    ) -> AuditLog:
        """
        Create an audit log entry from a FastAPI Request object
        """
        return AuditService.log_action(
            db=db,
            action=action,
            status=status,
            user_id=user_id,
            user_email=user_email,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            request_path=str(request.url.path),
            request_method=request.method,
            status_code=status_code,
            error_message=error_message
        )
    
    @staticmethod
    def get_user_activity(
        db: Session,
        user_id: str,
        limit: int = 100
    ):
        """
        Get recent activity for a specific user
        """
        return db.query(AuditLog).filter(
            AuditLog.user_id == user_id
        ).order_by(
            AuditLog.timestamp.desc()
        ).limit(limit).all()
    
    @staticmethod
    def get_failed_login_attempts(
        db: Session,
        email: str,
        minutes: int = 15
    ) -> int:
        """
        Count failed login attempts for an email in the last X minutes
        Used for account lockout protection
        """
        from datetime import datetime, timedelta
        cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)
        
        count = db.query(AuditLog).filter(
            AuditLog.action == "user.login.failed",
            AuditLog.user_email == email,
            AuditLog.timestamp >= cutoff_time
        ).count()
        
        return count


audit_service = AuditService()
