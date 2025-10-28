from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class MFAToken(Base):
    """
    Multi-Factor Authentication tokens for SOC 2 compliance
    """
    __tablename__ = "mfa_tokens"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True, unique=True)
    
    # TOTP secret (encrypted)
    totp_secret = Column(String(255), nullable=False)
    
    # Backup codes (one-time use, encrypted)
    backup_codes = Column(Text, nullable=True)  # JSON array of hashed codes
    
    # Status
    is_enabled = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    
    # Recovery
    last_used_at = Column(DateTime, nullable=True)
    failed_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<MFAToken user_id={self.user_id} enabled={self.is_enabled}>"
