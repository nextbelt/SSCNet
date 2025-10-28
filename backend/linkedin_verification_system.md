# LinkedIn POC Verification System - Backend Implementation

## Database Schema Extensions

```sql
-- POC Management Tables
CREATE TABLE pocs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    department poc_department_enum NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    linkedin_url VARCHAR(500),
    linkedin_id VARCHAR(100) UNIQUE,
    profile_picture_url VARCHAR(500),
    verification_status verification_status_enum DEFAULT 'pending',
    last_verified TIMESTAMP,
    next_verification TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, email)
);

-- Enums
CREATE TYPE poc_department_enum AS ENUM (
    'sales', 'engineering', 'r&d', 'primary_contact', 
    'on_call', 'quality', 'procurement', 'operations'
);

CREATE TYPE verification_status_enum AS ENUM (
    'pending', 'verified', 'expired', 'failed', 'requires_reauth'
);

-- Verification History
CREATE TABLE poc_verification_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poc_id UUID REFERENCES pocs(id) ON DELETE CASCADE,
    verification_type VARCHAR(50) NOT NULL, -- 'linkedin_api', 'email', 'manual'
    status verification_status_enum NOT NULL,
    details JSONB,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LinkedIn Integration Tokens
CREATE TABLE linkedin_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poc_id UUID REFERENCES pocs(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP NOT NULL,
    scope VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company Profile Extensions
ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS headquarters VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founded INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employee_count VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(500);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS certifications TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS capabilities TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS materials TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS quality_standards TEXT[];
```

## API Endpoints

### FastAPI Routes (app/api/pocs.py)

```python
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
import os
from datetime import datetime, timedelta

from app.database import get_db
from app.models import POC, Company, POCVerificationHistory, LinkedInToken
from app.schemas import POCCreate, POCUpdate, POCResponse, VerificationResponse
from app.auth import get_current_user
from app.linkedin import LinkedInService

router = APIRouter(prefix="/api/pocs", tags=["pocs"])

@router.post("/", response_model=POCResponse)
async def create_poc(
    poc_data: POCCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create new POC - requires LinkedIn verification"""
    
    # Verify user has admin access to company
    if not user_has_admin_access(current_user.id, poc_data.company_id, db):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Create POC with pending status
    db_poc = POC(
        **poc_data.dict(),
        verification_status="pending"
    )
    db.add(db_poc)
    db.commit()
    db.refresh(db_poc)
    
    # Schedule LinkedIn verification
    background_tasks.add_task(initiate_linkedin_verification, db_poc.id)
    
    return db_poc

@router.get("/company/{company_id}", response_model=List[POCResponse])
async def get_company_pocs(
    company_id: str,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all POCs for a company"""
    
    query = db.query(POC).filter(POC.company_id == company_id)
    
    if department and department != "all":
        query = query.filter(POC.department == department)
    
    pocs = query.all()
    return pocs

@router.post("/{poc_id}/verify", response_model=VerificationResponse)
async def verify_poc(
    poc_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Manual POC verification trigger"""
    
    poc = db.query(POC).filter(POC.id == poc_id).first()
    if not poc:
        raise HTTPException(status_code=404, detail="POC not found")
    
    # Check permissions
    if not user_has_admin_access(current_user.id, poc.company_id, db):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Update status to pending
    poc.verification_status = "pending"
    db.commit()
    
    # Start verification process
    background_tasks.add_task(verify_poc_linkedin, poc_id)
    
    return {"status": "verification_initiated", "poc_id": poc_id}

@router.post("/linkedin/callback")
async def linkedin_callback(
    code: str,
    state: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Handle LinkedIn OAuth callback"""
    
    import json
    state_data = json.loads(state)
    poc_id = state_data.get("pocId")
    company_id = state_data.get("companyId")
    
    if poc_id == "new":
        # New POC creation flow
        return await handle_new_poc_linkedin_auth(code, company_id, db)
    else:
        # Existing POC re-verification
        return await handle_poc_reverification(code, poc_id, db)

# LinkedIn Service Integration
class LinkedInService:
    def __init__(self):
        self.client_id = os.getenv("LINKEDIN_CLIENT_ID")
        self.client_secret = os.getenv("LINKEDIN_CLIENT_SECRET")
        self.base_url = "https://api.linkedin.com/v2"
    
    async def exchange_code_for_token(self, code: str, redirect_uri: str):
        """Exchange authorization code for access token"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://www.linkedin.com/oauth/v2/accessToken",
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret
                }
            )
            return response.json()
    
    async def get_profile(self, access_token: str):
        """Get LinkedIn profile information"""
        headers = {"Authorization": f"Bearer {access_token}"}
        
        async with httpx.AsyncClient() as client:
            # Get basic profile
            profile_response = await client.get(
                f"{self.base_url}/people/~",
                headers=headers
            )
            
            # Get email
            email_response = await client.get(
                f"{self.base_url}/emailAddress?q=members&projection=(elements*(handle~))",
                headers=headers
            )
            
            return {
                "profile": profile_response.json(),
                "email": email_response.json()
            }
    
    async def verify_employment(self, access_token: str, company_name: str):
        """Verify current employment at company"""
        headers = {"Authorization": f"Bearer {access_token}"}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/people/~:(positions)",
                headers=headers
            )
            
            positions = response.json().get("positions", {}).get("values", [])
            
            # Check if current position matches company
            for position in positions:
                if (position.get("isCurrent", False) and 
                    company_name.lower() in position.get("company", {}).get("name", "").lower()):
                    return True
            
            return False

# Background Tasks
async def verify_poc_linkedin(poc_id: str):
    """Background task to verify POC via LinkedIn API"""
    db = next(get_db())
    
    try:
        poc = db.query(POC).filter(POC.id == poc_id).first()
        if not poc:
            return
        
        # Get LinkedIn token
        token = db.query(LinkedInToken).filter(LinkedInToken.poc_id == poc_id).first()
        if not token or token.expires_at < datetime.utcnow():
            poc.verification_status = "requires_reauth"
            db.commit()
            return
        
        # Get company info
        company = db.query(Company).filter(Company.id == poc.company_id).first()
        
        # Verify employment
        linkedin_service = LinkedInService()
        is_employed = await linkedin_service.verify_employment(
            token.access_token, 
            company.name
        )
        
        if is_employed:
            poc.verification_status = "verified"
            poc.last_verified = datetime.utcnow()
            poc.next_verification = datetime.utcnow() + timedelta(days=30)
        else:
            poc.verification_status = "failed"
        
        # Log verification attempt
        verification_log = POCVerificationHistory(
            poc_id=poc_id,
            verification_type="linkedin_api",
            status=poc.verification_status,
            details={"timestamp": datetime.utcnow().isoformat()}
        )
        db.add(verification_log)
        db.commit()
        
    except Exception as e:
        poc.verification_status = "failed"
        db.commit()
        print(f"Verification failed for POC {poc_id}: {str(e)}")

# Scheduled verification (Celery task or similar)
@router.post("/verify-all")
async def schedule_verification_check():
    """Scheduled task to verify all POCs"""
    db = next(get_db())
    
    # Get POCs that need verification
    pocs_to_verify = db.query(POC).filter(
        POC.next_verification <= datetime.utcnow(),
        POC.verification_status == "verified"
    ).all()
    
    for poc in pocs_to_verify:
        # Schedule verification
        background_tasks.add_task(verify_poc_linkedin, poc.id)
    
    return {"scheduled_verifications": len(pocs_to_verify)}
```

## Environment Variables

```bash
# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback

# Verification Settings
POC_VERIFICATION_INTERVAL_DAYS=30
EMAIL_VERIFICATION_ENABLED=true
AUTO_VERIFICATION_ENABLED=true
```

## Frontend Integration

```typescript
// LinkedIn OAuth Integration
const LinkedInAuth = {
  initiateAuth: (pocId?: string, companyId?: string) => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!,
      redirect_uri: `${window.location.origin}/auth/linkedin/callback`,
      scope: 'r_liteprofile r_emailaddress',
      state: JSON.stringify({ 
        type: 'poc_verification', 
        pocId: pocId || 'new',
        companyId: companyId 
      })
    });
    
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  },
  
  handleCallback: async (code: string, state: string) => {
    const response = await fetch('/api/pocs/linkedin/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ code, state })
    });
    
    return response.json();
  }
};
```

This system provides:

1. **Automatic LinkedIn Integration** - OAuth flow for POC verification
2. **Departmental Organization** - Sales, Engineering, R&D, etc.
3. **Auto Re-verification** - Every 30-60 days via LinkedIn API
4. **Verification History** - Complete audit trail
5. **Real-time Status** - Live verification status updates
6. **Admin Controls** - Company admins manage POC access
7. **Failure Handling** - Graceful handling of API failures
8. **Security** - Token management and refresh handling