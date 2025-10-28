from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Any
import json

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, Company, POC
from app.models.audit_log import AuditLog
from app.services.audit_service import audit_service

router = APIRouter(prefix="/data", tags=["data-management"])


@router.get("/export")
async def export_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export all user data for GDPR/CCPA compliance
    Returns a JSON file with all personal and business data
    """
    # Log the data export request
    audit_service.log_action(
        db=db,
        action="data.export",
        status="success",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"export_type": "full"}
    )
    
    # Gather all user data
    export_data = {
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "name": current_user.name,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            "updated_at": current_user.updated_at.isoformat() if current_user.updated_at else None,
            "is_active": current_user.is_active,
            "is_verified": current_user.is_verified,
            "linkedin_id": current_user.linkedin_id,
            "linkedin_profile_url": current_user.linkedin_profile_url,
        },
        "company_associations": [],
        "audit_logs": [],
        "export_date": datetime.utcnow().isoformat(),
        "format_version": "1.0"
    }
    
    # Add company associations
    for poc in current_user.company_associations:
        company = poc.company
        if company:
            export_data["company_associations"].append({
                "company_id": str(company.id),
                "company_name": company.name,
                "role": poc.role,
                "is_primary": poc.is_primary,
                "created_at": poc.created_at.isoformat() if poc.created_at else None
            })
    
    # Add audit logs (last 90 days)
    cutoff_date = datetime.utcnow() - timedelta(days=90)
    audit_logs = db.query(AuditLog).filter(
        AuditLog.user_id == current_user.id,
        AuditLog.timestamp >= cutoff_date
    ).order_by(AuditLog.timestamp.desc()).limit(1000).all()
    
    export_data["audit_logs"] = [
        {
            "action": log.action,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "ip_address": log.ip_address,
            "status": log.status
        } for log in audit_logs
    ]
    
    return export_data


@router.post("/delete-account")
async def request_account_deletion(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Request account deletion for GDPR/CCPA compliance
    
    This schedules the account for deletion after a 30-day grace period.
    During this period, the user can cancel the deletion request.
    """
    # Check if already scheduled for deletion
    if current_user.deletion_scheduled_at:
        return {
            "message": "Account deletion already scheduled",
            "scheduled_for": current_user.deletion_scheduled_at.isoformat(),
            "can_cancel_until": (current_user.deletion_scheduled_at + timedelta(days=30)).isoformat()
        }
    
    # Schedule deletion for 30 days from now
    deletion_date = datetime.utcnow() + timedelta(days=30)
    current_user.deletion_scheduled_at = datetime.utcnow()
    current_user.is_active = False
    
    db.commit()
    
    # Log the deletion request
    audit_service.log_action(
        db=db,
        action="account.deletion_requested",
        status="success",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"deletion_scheduled_for": deletion_date.isoformat()}
    )
    
    # TODO: Send email notification
    # background_tasks.add_task(send_deletion_notification_email, current_user.email, deletion_date)
    
    return {
        "message": "Account deletion scheduled",
        "scheduled_for": deletion_date.isoformat(),
        "grace_period_days": 30,
        "can_cancel_until": deletion_date.isoformat()
    }


@router.post("/cancel-deletion")
async def cancel_account_deletion(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel a scheduled account deletion
    """
    if not current_user.deletion_scheduled_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No deletion scheduled for this account"
        )
    
    # Check if within grace period (30 days)
    deletion_date = current_user.deletion_scheduled_at + timedelta(days=30)
    if datetime.utcnow() > deletion_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Grace period has expired, account will be deleted"
        )
    
    # Cancel deletion
    current_user.deletion_scheduled_at = None
    current_user.is_active = True
    
    db.commit()
    
    # Log the cancellation
    audit_service.log_action(
        db=db,
        action="account.deletion_cancelled",
        status="success",
        user_id=current_user.id,
        user_email=current_user.email
    )
    
    return {
        "message": "Account deletion cancelled successfully",
        "account_status": "active"
    }


@router.get("/retention-policy")
async def get_retention_policy():
    """
    Return data retention policy information
    """
    return {
        "personal_data": {
            "retention_period": "Duration of account plus 7 years",
            "description": "Personal information retained while account is active and for 7 years after deletion for legal compliance"
        },
        "transaction_data": {
            "retention_period": "7 years",
            "description": "Business transaction records retained for 7 years for accounting and legal purposes"
        },
        "audit_logs": {
            "retention_period": "7 years",
            "description": "Security and audit logs retained for 7 years for SOC 2 compliance"
        },
        "inactive_accounts": {
            "retention_period": "3 years",
            "description": "Accounts inactive for 3 years will receive notice and may be deleted"
        },
        "deletion_grace_period": {
            "period": "30 days",
            "description": "After requesting deletion, users have 30 days to cancel before permanent deletion"
        }
    }
