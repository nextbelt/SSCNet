from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class LinkedInCallback(BaseModel):
    code: str
    state: Optional[str] = None


class LinkedInAuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: 'UserResponse'


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    user_type: Optional[str] = None
    profile_picture_url: Optional[str] = None
    linkedin_profile_url: Optional[str] = None
    is_verified: bool
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class EmailVerification(BaseModel):
    email: EmailStr


class UserRegistration(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: str
    user_type: str = "buyer"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    profile_picture_url: Optional[str] = None


# Forward reference resolution
LinkedInAuthResponse.model_rebuild()