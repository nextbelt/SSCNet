from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import uuid

from app.core.database import get_db
from app.core.security import (
    create_access_token, 
    create_refresh_token, 
    verify_token,
    get_current_user,
    validate_password_strength,
    get_password_hash,
    verify_password
)
from app.core.sanitizer import sanitize_user_data
from app.services.linkedin import linkedin_service
from app.services.audit_service import audit_service, log_audit_event
from app.models.user import User, Company, POC
from app.schemas.token import Token, TokenRefresh
from app.schemas.auth import (
    LinkedInAuthResponse, 
    LinkedInCallback, 
    UserResponse,
    EmailVerification
)

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()


@router.post("/register", response_model=Token)
async def register(
    request: Request,
    name: str,
    email: str,
    password: str,
    company_name: str,
    role: str = "buyer",
    db: Session = Depends(get_db)
):
    """
    Register a new user with email and password
    """
    # Sanitize inputs
    sanitized = sanitize_user_data({"name": name, "email": email})
    name = sanitized.get("name", name)
    email = sanitized.get("email", email).lower().strip()
    
    # Validate password strength
    is_valid, error_message = validate_password_strength(password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = User(
        email=email,
        name=name,
        hashed_password=get_password_hash(password),
        role=role,
        is_active=True,
        is_verified=False,  # Email verification pending
        verification_status="pending",
        created_at=datetime.utcnow()
    )
    
    db.add(user)
    db.flush()  # Get user ID
    
    # Create company if provided
    if company_name and company_name.strip():
        company = Company(
            name=company_name.strip(),
            is_verified=False,
            verification_source="self_registration",
            created_at=datetime.utcnow()
        )
        db.add(company)
        db.flush()
        
        # Create POC relationship
        poc = POC(
            user_id=user.id,
            company_id=company.id,
            role="Primary Contact",
            is_primary=True,
            availability_status="available"
        )
        db.add(poc)
    
    db.commit()
    db.refresh(user)
    
    # Audit log
    log_audit_event(
        db=db,
        user_id=user.id,
        action="user.register",
        resource_type="user",
        resource_id=str(user.id),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=201,
        details={"email": email, "role": role, "has_company": bool(company_name)}
    )
    
    # Generate tokens
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    """
    Login with email and password
    """
    email = email.lower().strip()
    
    # Find user
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Audit failed attempt
        log_audit_event(
            db=db,
            user_id=None,
            action="user.login.failed",
            resource_type="user",
            resource_id=email,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            status_code=401,
            details={"reason": "user_not_found", "email": email}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check if account is locked
    if user.locked_until and user.locked_until > datetime.utcnow():
        minutes_left = int((user.locked_until - datetime.utcnow()).total_seconds() / 60)
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Account locked due to too many failed login attempts. Try again in {minutes_left} minutes."
        )
    
    # Verify password
    if not verify_password(password, user.hashed_password):
        # Increment failed attempts
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        
        # Lock account after 5 failed attempts
        if user.failed_login_attempts >= 5:
            from datetime import timedelta
            user.locked_until = datetime.utcnow() + timedelta(minutes=15)
            db.commit()
            
            # Audit lockout
            log_audit_event(
                db=db,
                user_id=user.id,
                action="user.account.locked",
                resource_type="user",
                resource_id=str(user.id),
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                status_code=423,
                details={"reason": "too_many_failed_attempts", "attempts": user.failed_login_attempts}
            )
            
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account locked due to too many failed login attempts. Try again in 15 minutes."
            )
        
        db.commit()
        
        # Audit failed attempt
        log_audit_event(
            db=db,
            user_id=user.id,
            action="user.login.failed",
            resource_type="user",
            resource_id=str(user.id),
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            status_code=401,
            details={"reason": "invalid_password", "attempts": user.failed_login_attempts}
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Reset failed attempts on successful login
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = datetime.utcnow()
    user.last_login_ip = request.client.host if request.client else None
    db.commit()
    
    # Audit successful login
    log_audit_event(
        db=db,
        user_id=user.id,
        action="user.login.success",
        resource_type="user",
        resource_id=str(user.id),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=200,
        details={"email": email}
    )
    
    # Generate tokens
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.get("/linkedin")
async def initiate_linkedin_auth(request: Request):
    """
    Initiate LinkedIn OAuth flow
    """
    state = str(uuid.uuid4())  # Generate random state for CSRF protection
    # In production, store state in Redis with expiration
    authorization_url = linkedin_service.get_authorization_url(state=state)
    
    return {
        "authorization_url": authorization_url,
        "state": state
    }


@router.post("/linkedin/callback", response_model=Token)
async def linkedin_callback(
    callback_data: LinkedInCallback,
    db: Session = Depends(get_db)
):
    """
    Handle LinkedIn OAuth callback and create/login user
    """
    # Exchange code for access token
    token_data = await linkedin_service.exchange_code_for_token(callback_data.code)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to exchange authorization code for token"
        )
    
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No access token received from LinkedIn"
        )
    
    # Get user profile from LinkedIn
    profile_data = await linkedin_service.get_user_profile(access_token)
    if not profile_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to fetch user profile from LinkedIn"
        )
    
    linkedin_id = profile_data.get("id")
    email = profile_data.get("email")
    
    if not linkedin_id or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incomplete profile data from LinkedIn"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.linkedin_id == linkedin_id) | (User.email == email)
    ).first()
    
    if existing_user:
        # Update existing user with latest LinkedIn data
        existing_user.linkedin_id = linkedin_id
        existing_user.name = f"{profile_data.get('firstName', '')} {profile_data.get('lastName', '')}".strip()
        existing_user.profile_picture_url = profile_data.get("profilePicture")
        existing_user.linkedin_profile_url = f"https://www.linkedin.com/in/{linkedin_id}"
        existing_user.last_linkedin_verification = datetime.utcnow()
        existing_user.is_verified = True
        existing_user.verification_status = "verified"
        
        user = existing_user
    else:
        # Create new user
        user = User(
            email=email,
            linkedin_id=linkedin_id,
            name=f"{profile_data.get('firstName', '')} {profile_data.get('lastName', '')}".strip(),
            profile_picture_url=profile_data.get("profilePicture"),
            linkedin_profile_url=f"https://www.linkedin.com/in/{linkedin_id}",
            last_linkedin_verification=datetime.utcnow(),
            is_verified=True,
            verification_status="verified"
        )
        db.add(user)
    
    # Handle company association if available
    current_company = profile_data.get("currentCompany")
    if current_company and user:
        await _handle_company_association(db, user, current_company, access_token)
    
    db.commit()
    db.refresh(user)
    
    # Create JWT tokens
    access_token_jwt = create_access_token(subject=str(user.id))
    refresh_token_jwt = create_refresh_token(subject=str(user.id))
    
    return Token(
        access_token=access_token_jwt,
        refresh_token=refresh_token_jwt,
        token_type="bearer"
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    token_data: TokenRefresh,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    token_payload = verify_token(token_data.refresh_token)
    if not token_payload or token_payload.type != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user = db.query(User).filter(User.id == token_payload.sub).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user information
    """
    user = get_current_user(db, credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        profile_picture_url=user.profile_picture_url,
        linkedin_profile_url=user.linkedin_profile_url,
        is_verified=user.is_verified,
        verification_status=user.verification_status,
        created_at=user.created_at
    )


@router.post("/verify-email")
async def send_verification_email(
    email_data: EmailVerification,
    db: Session = Depends(get_db)
):
    """
    Send email verification (fallback for non-LinkedIn users)
    """
    # This would integrate with SendGrid to send verification emails
    # For now, return success
    return {"message": "Verification email sent successfully"}


async def _handle_company_association(
    db: Session, 
    user: User, 
    company_data: dict, 
    linkedin_access_token: str
):
    """
    Handle company association for the user based on LinkedIn data
    """
    company_name = company_data.get("name", "")
    
    # Try to find existing company
    existing_company = db.query(Company).filter(
        Company.name.ilike(f"%{company_name}%")
    ).first()
    
    if existing_company:
        company = existing_company
    else:
        # Create new company
        company = Company(
            name=company_name,
            industry=company_data.get("industry"),
            logo_url=company_data.get("logoV2", {}).get("original", ""),
            is_verified=True,
            verification_source="linkedin"
        )
        db.add(company)
        db.flush()  # Get the ID
    
    # Check if POC relationship already exists
    existing_poc = db.query(POC).filter(
        POC.user_id == user.id,
        POC.company_id == company.id
    ).first()
    
    if not existing_poc:
        # Create POC relationship
        poc = POC(
            user_id=user.id,
            company_id=company.id,
            role="LinkedIn Verified",
            is_primary=True,
            availability_status="available"
        )
        db.add(poc)