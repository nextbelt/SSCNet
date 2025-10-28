from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from cryptography.hazmat.backends import default_backend
import base64
import os
from typing import Optional

from app.core.config import settings


class FieldEncryption:
    """
    Field-level encryption for PII data
    SOC 2 Compliance - Confidentiality requirement
    """
    
    def __init__(self):
        # Derive encryption key from SECRET_KEY
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'sscn_encryption_salt_v1',  # In production, use unique salt per environment
            iterations=100000,
            backend=default_backend()
        )
        key = base64.urlsafe_b64encode(
            kdf.derive(settings.secret_key.encode())
        )
        self.cipher = Fernet(key)
    
    def encrypt(self, plaintext: Optional[str]) -> Optional[str]:
        """
        Encrypt a string value
        Returns base64-encoded encrypted string
        """
        if not plaintext:
            return None
        
        encrypted = self.cipher.encrypt(plaintext.encode())
        return base64.b64encode(encrypted).decode()
    
    def decrypt(self, ciphertext: Optional[str]) -> Optional[str]:
        """
        Decrypt an encrypted string value
        """
        if not ciphertext:
            return None
        
        try:
            decoded = base64.b64decode(ciphertext.encode())
            decrypted = self.cipher.decrypt(decoded)
            return decrypted.decode()
        except Exception:
            # If decryption fails, return None (data might not be encrypted yet)
            return None
    
    def encrypt_dict(self, data: dict, fields: list[str]) -> dict:
        """
        Encrypt specific fields in a dictionary
        """
        encrypted_data = data.copy()
        for field in fields:
            if field in encrypted_data and encrypted_data[field]:
                encrypted_data[field] = self.encrypt(str(encrypted_data[field]))
        return encrypted_data
    
    def decrypt_dict(self, data: dict, fields: list[str]) -> dict:
        """
        Decrypt specific fields in a dictionary
        """
        decrypted_data = data.copy()
        for field in fields:
            if field in decrypted_data and decrypted_data[field]:
                decrypted_data[field] = self.decrypt(decrypted_data[field])
        return decrypted_data


# Global instance
field_encryption = FieldEncryption()
