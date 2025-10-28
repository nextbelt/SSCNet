from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import ValidationError
from sqlalchemy.orm import Session
import re

from app.core.config import settings
from app.models.user import User
from app.schemas.token import TokenPayload

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def validate_password_strength(password: str) -> tuple[bool, Optional[str]]:
    """
    Validate password strength according to SOC 2 requirements.
    
    Requirements:
    - Minimum 12 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    
    Args:
        password: Password to validate
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    min_length = settings.password_min_length
    
    if len(password) < min_length:
        return False, f"Password must be at least {min_length} characters long"
    
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", password):
        return False, "Password must contain at least one special character (!@#$%^&* etc.)"
    
    # Check for common weak passwords
    common_passwords = [
        "password", "123456", "12345678", "qwerty", "abc123", "monkey",
        "password123", "admin123", "letmein", "welcome", "password1",
        "admin", "administrator", "root", "toor", "pass", "test"
    ]
    
    if password.lower() in common_passwords:
        return False, "Password is too common. Please choose a more unique password"
    
    # Check for sequential characters (e.g., "abcd", "1234")
    if any(password.lower()[i:i+4] == password.lower()[i:i+4].lower() 
           for i in range(len(password) - 3)
           if password.lower()[i:i+4] in ["abcd", "bcde", "cdef", "1234", "2345", "3456", "4567", "5678", "6789"]):
        return False, "Password contains sequential characters"
    
    return True, None


def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token
    SOC 2 Compliance - 30-minute idle timeout
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # Default: 30 minutes (SOC 2 requirement)
        expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode = {"exp": expire, "sub": str(subject), "iat": datetime.utcnow()}
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def create_refresh_token(subject: Union[str, Any]) -> str:
    """
    Create a JWT refresh token
    SOC 2 Compliance - 24-hour absolute timeout
    """
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh", "iat": datetime.utcnow()}
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password
    """
    return pwd_context.hash(password)


def verify_token(token: str) -> Optional[TokenPayload]:
    """
    Verify and decode a JWT token
    """
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        return None
    return token_data


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def get_current_user(db: Session, token: str) -> Optional[User]:
    """
    Get current user from JWT token
    """
    token_data = verify_token(token)
    if token_data is None:
        return None
    
    user = db.query(User).filter(User.id == token_data.sub).first()
    return user