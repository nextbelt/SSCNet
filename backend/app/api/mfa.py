from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.mfa_service import mfa_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/mfa", tags=["mfa"])


class MFASetupResponse(BaseModel):
    secret: str
    qr_code: str
    backup_codes: list[str]
    message: str


class MFAVerifyRequest(BaseModel):
    token: str


class MFADisableRequest(BaseModel):
    password: str


@router.post("/setup", response_model=MFASetupResponse)
async def setup_mfa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initialize MFA setup - returns QR code and backup codes
    SOC 2 Compliance - Critical Security Control
    """
    try:
        setup_data = mfa_service.setup_mfa(db, current_user)
        
        # Log MFA setup initiated
        audit_service.log_action(
            db=db,
            action="mfa.setup_initiated",
            status="success",
            user_id=str(current_user.id),
            user_email=current_user.email
        )
        
        return setup_data
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/enable")
async def enable_mfa(
    request: MFAVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enable MFA after verifying the initial setup token
    """
    try:
        success = mfa_service.enable_mfa(db, current_user, request.token)
        
        if not success:
            # Log failed attempt
            audit_service.log_action(
                db=db,
                action="mfa.enable_failed",
                status="failure",
                user_id=str(current_user.id),
                user_email=current_user.email,
                error_message="Invalid verification token"
            )
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification token"
            )
        
        # Log successful MFA enablement
        audit_service.log_action(
            db=db,
            action="mfa.enabled",
            status="success",
            user_id=str(current_user.id),
            user_email=current_user.email
        )
        
        return {
            "message": "MFA enabled successfully",
            "mfa_enabled": True
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/verify")
async def verify_mfa_token(
    request: MFAVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify MFA token (used during login flow)
    """
    try:
        success = mfa_service.verify_mfa(db, current_user, request.token)
        
        if not success:
            audit_service.log_action(
                db=db,
                action="mfa.verification_failed",
                status="failure",
                user_id=str(current_user.id),
                user_email=current_user.email
            )
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid MFA token"
            )
        
        audit_service.log_action(
            db=db,
            action="mfa.verification_success",
            status="success",
            user_id=str(current_user.id),
            user_email=current_user.email
        )
        
        return {
            "message": "MFA verification successful",
            "verified": True
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(e)
        )


@router.post("/disable")
async def disable_mfa(
    request: MFADisableRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Disable MFA (requires password confirmation)
    """
    success = mfa_service.disable_mfa(db, current_user, request.password)
    
    if not success:
        audit_service.log_action(
            db=db,
            action="mfa.disable_failed",
            status="failure",
            user_id=str(current_user.id),
            user_email=current_user.email,
            error_message="Invalid password"
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    audit_service.log_action(
        db=db,
        action="mfa.disabled",
        status="success",
        user_id=str(current_user.id),
        user_email=current_user.email
    )
    
    return {
        "message": "MFA disabled successfully",
        "mfa_enabled": False
    }


@router.post("/regenerate-backup-codes")
async def regenerate_backup_codes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Regenerate backup codes (invalidates old ones)
    """
    try:
        new_codes = mfa_service.regenerate_backup_codes(db, current_user)
        
        audit_service.log_action(
            db=db,
            action="mfa.backup_codes_regenerated",
            status="success",
            user_id=str(current_user.id),
            user_email=current_user.email
        )
        
        return {
            "backup_codes": new_codes,
            "message": "Save these codes in a secure location. You won't be able to see them again."
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/status")
async def get_mfa_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if MFA is enabled for the current user
    """
    is_enabled = mfa_service.is_mfa_enabled(db, current_user)
    
    return {
        "mfa_enabled": is_enabled,
        "user_id": str(current_user.id)
    }
