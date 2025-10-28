import pyotp
import qrcode
import io
import base64
import json
import secrets
from datetime import datetime, timedelta
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.models.mfa import MFAToken
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class MFAService:
    """
    Multi-Factor Authentication service for TOTP and backup codes
    SOC 2 Compliance - Critical Security Control
    """
    
    @staticmethod
    def generate_totp_secret() -> str:
        """Generate a new TOTP secret"""
        return pyotp.random_base32()
    
    @staticmethod
    def generate_backup_codes(count: int = 10) -> List[str]:
        """
        Generate backup codes (one-time use codes)
        Returns plain text codes for user to save
        """
        codes = []
        for _ in range(count):
            code = '-'.join([
                secrets.token_hex(2).upper(),
                secrets.token_hex(2).upper(),
                secrets.token_hex(2).upper()
            ])
            codes.append(code)
        return codes
    
    @staticmethod
    def hash_backup_codes(codes: List[str]) -> str:
        """Hash backup codes for storage"""
        hashed_codes = [pwd_context.hash(code) for code in codes]
        return json.dumps(hashed_codes)
    
    @staticmethod
    def verify_backup_code(stored_codes_json: str, code: str) -> Tuple[bool, Optional[str]]:
        """
        Verify a backup code and remove it from the list if valid
        Returns (is_valid, updated_codes_json)
        """
        stored_codes = json.loads(stored_codes_json)
        
        for i, hashed_code in enumerate(stored_codes):
            if pwd_context.verify(code, hashed_code):
                # Remove used code
                stored_codes.pop(i)
                return True, json.dumps(stored_codes)
        
        return False, None
    
    @staticmethod
    def generate_qr_code(secret: str, user_email: str, issuer: str = "SSCN") -> str:
        """
        Generate QR code for TOTP setup
        Returns base64-encoded PNG image
        """
        # Create provisioning URI
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user_email,
            issuer_name=issuer
        )
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    
    @staticmethod
    def verify_totp(secret: str, token: str) -> bool:
        """Verify TOTP token"""
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)  # Allow 1 time step variance
    
    @staticmethod
    def setup_mfa(db: Session, user: User) -> dict:
        """
        Initialize MFA setup for a user
        Returns secret, QR code, and backup codes
        """
        # Check if MFA already exists
        existing_mfa = db.query(MFAToken).filter(
            MFAToken.user_id == user.id
        ).first()
        
        if existing_mfa and existing_mfa.is_enabled:
            raise ValueError("MFA is already enabled for this user")
        
        # Generate secret and backup codes
        secret = MFAService.generate_totp_secret()
        backup_codes = MFAService.generate_backup_codes()
        hashed_codes = MFAService.hash_backup_codes(backup_codes)
        
        # Create or update MFA token
        if existing_mfa:
            existing_mfa.totp_secret = secret
            existing_mfa.backup_codes = hashed_codes
            existing_mfa.is_enabled = False
            existing_mfa.is_verified = False
            mfa_token = existing_mfa
        else:
            mfa_token = MFAToken(
                user_id=user.id,
                totp_secret=secret,
                backup_codes=hashed_codes,
                is_enabled=False,
                is_verified=False
            )
            db.add(mfa_token)
        
        db.commit()
        db.refresh(mfa_token)
        
        # Generate QR code
        qr_code = MFAService.generate_qr_code(secret, user.email)
        
        return {
            "secret": secret,
            "qr_code": qr_code,
            "backup_codes": backup_codes,
            "message": "Save your backup codes in a secure location. You won't be able to see them again."
        }
    
    @staticmethod
    def enable_mfa(db: Session, user: User, verification_token: str) -> bool:
        """
        Enable MFA after verifying the initial setup token
        """
        mfa_token = db.query(MFAToken).filter(
            MFAToken.user_id == user.id
        ).first()
        
        if not mfa_token:
            raise ValueError("MFA not set up for this user")
        
        if mfa_token.is_enabled:
            raise ValueError("MFA is already enabled")
        
        # Verify token
        if not MFAService.verify_totp(mfa_token.totp_secret, verification_token):
            mfa_token.failed_attempts += 1
            db.commit()
            return False
        
        # Enable MFA
        mfa_token.is_enabled = True
        mfa_token.is_verified = True
        mfa_token.verified_at = datetime.utcnow()
        mfa_token.failed_attempts = 0
        
        db.commit()
        
        return True
    
    @staticmethod
    def verify_mfa(db: Session, user: User, token: str) -> bool:
        """
        Verify MFA token during login
        Can be either TOTP token or backup code
        """
        mfa_token = db.query(MFAToken).filter(
            MFAToken.user_id == user.id
        ).first()
        
        if not mfa_token or not mfa_token.is_enabled:
            return True  # MFA not required
        
        # Check if locked
        if mfa_token.locked_until and mfa_token.locked_until > datetime.utcnow():
            raise ValueError(f"MFA temporarily locked. Try again after {mfa_token.locked_until.isoformat()}")
        
        # Try TOTP first
        if MFAService.verify_totp(mfa_token.totp_secret, token):
            mfa_token.last_used_at = datetime.utcnow()
            mfa_token.failed_attempts = 0
            mfa_token.locked_until = None
            db.commit()
            return True
        
        # Try backup code
        if mfa_token.backup_codes:
            is_valid, updated_codes = MFAService.verify_backup_code(
                mfa_token.backup_codes, token
            )
            if is_valid:
                mfa_token.backup_codes = updated_codes
                mfa_token.last_used_at = datetime.utcnow()
                mfa_token.failed_attempts = 0
                mfa_token.locked_until = None
                db.commit()
                return True
        
        # Failed verification
        mfa_token.failed_attempts += 1
        
        # Lock after 5 failed attempts
        if mfa_token.failed_attempts >= 5:
            mfa_token.locked_until = datetime.utcnow() + timedelta(minutes=15)
        
        db.commit()
        
        return False
    
    @staticmethod
    def disable_mfa(db: Session, user: User, password: str) -> bool:
        """
        Disable MFA (requires password confirmation)
        """
        from app.core.security import verify_password
        
        # Verify password
        if not verify_password(password, user.hashed_password):
            return False
        
        mfa_token = db.query(MFAToken).filter(
            MFAToken.user_id == user.id
        ).first()
        
        if mfa_token:
            mfa_token.is_enabled = False
            mfa_token.is_verified = False
            db.commit()
        
        return True
    
    @staticmethod
    def regenerate_backup_codes(db: Session, user: User) -> List[str]:
        """
        Regenerate backup codes (invalidates old ones)
        """
        mfa_token = db.query(MFAToken).filter(
            MFAToken.user_id == user.id
        ).first()
        
        if not mfa_token or not mfa_token.is_enabled:
            raise ValueError("MFA not enabled for this user")
        
        # Generate new backup codes
        new_codes = MFAService.generate_backup_codes()
        mfa_token.backup_codes = MFAService.hash_backup_codes(new_codes)
        
        db.commit()
        
        return new_codes
    
    @staticmethod
    def is_mfa_enabled(db: Session, user: User) -> bool:
        """Check if MFA is enabled for a user"""
        mfa_token = db.query(MFAToken).filter(
            MFAToken.user_id == user.id
        ).first()
        
        return mfa_token and mfa_token.is_enabled


mfa_service = MFAService()
