# Local Development Setup Guide

## Why Work Locally?

✅ **Instant feedback** - No waiting for Railway deployments (2-3 minutes each)
✅ **Faster iteration** - Make changes and test immediately
✅ **Better debugging** - Full access to logs and error messages
✅ **Cost effective** - No deployment costs during development
✅ **Offline work** - Work without internet connection

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (we'll use Docker for this)
- Git

## Quick Start (5 Minutes)

### 1. Start PostgreSQL Database

```powershell
# Using Docker (recommended)
docker run --name sscn-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sscn_db -p 5432:5432 -d postgres:15

# Or use the docker-compose.yml file
cd "C:\Users\cncha\OneDrive\Desktop\Sourcing Supply Chain Net"
docker-compose up -d postgres
```

### 2. Setup Backend

```powershell
# Navigate to backend
cd "C:\Users\cncha\OneDrive\Desktop\Sourcing Supply Chain Net\backend"

# Create .env file (copy from .env.example)
Copy-Item .env.example .env

# Edit .env file - Update these minimal settings:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sscn_db
# SECRET_KEY=local-dev-secret-key-change-me
# FRONTEND_URL=http://localhost:3000
# DEBUG=True
# ENVIRONMENT=development

# Activate virtual environment (if not already)
..\\.venv\Scripts\Activate.ps1

# Install dependencies (if needed)
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be running at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

### 3. Setup Frontend

Open a **new PowerShell window**:

```powershell
# Navigate to frontend
cd "C:\Users\cncha\OneDrive\Desktop\Sourcing Supply Chain Net\frontend"

# Create .env.local file
@"
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your-linkedin-client-id
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath .env.local -Encoding UTF8

# Install dependencies (if needed)
npm install

# Start frontend dev server
npm run dev
```

Frontend will be running at: **http://localhost:3000**

## Development Workflow

### Making Changes

1. **Edit code locally** in VS Code
2. **Backend auto-reloads** (thanks to `--reload` flag)
3. **Frontend auto-reloads** (thanks to Next.js dev mode)
4. **Test immediately** in browser

### When Ready to Deploy

```powershell
# Test locally first
# Then commit and push
git add .
git commit -m "Your descriptive message"
git push

# Railway will automatically deploy
```

## Testing Your User Account

Since you already registered on Railway's production database, you have two options:

### Option A: Use Production Database Locally (Quick Test)

```env
# In backend/.env, use Railway's DATABASE_URL
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:PORT/railway
```

This lets you login with your existing account immediately.

### Option B: Fresh Local Database (Clean Slate)

Keep local PostgreSQL and register a new test account:
- Email: test@example.com
- Password: TestPassword123!
- Company: Test Company

## Current Frontend Pages

✅ **Authentication**
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/linkedin/callback` - LinkedIn OAuth callback

✅ **Dashboards**
- `/dashboard` - Main dashboard (redirects based on user_type)
- `/dashboard/buyer` - Buyer dashboard
- `/dashboard/supplier` - Supplier dashboard
- `/dashboard/post-rfq` - Create new RFQ
- `/dashboard/supplier-profile` - Supplier profile management
- `/dashboard/supplier-analytics` - Supplier analytics

✅ **Static Pages**
- `/` - Landing page
- `/terms` - Terms of service
- `/privacy` - Privacy policy

## What's Missing (To Build)

### Phase 1: Core Functionality
- [ ] Complete company profile setup flow
- [ ] RFQ listing and detail pages
- [ ] RFQ response submission form
- [ ] Basic messaging interface
- [ ] User profile settings

### Phase 2: Advanced Features
- [ ] LinkedIn verification flow
- [ ] Advanced search and filters
- [ ] Real-time notifications
- [ ] Document upload/management
- [ ] Analytics dashboards

### Phase 3: Polish
- [ ] Email notifications
- [ ] Mobile responsive design
- [ ] Performance optimization
- [ ] Comprehensive testing

## Database Schema Reference

Your existing tables:
- `users` - User accounts (email/password or LinkedIn)
- `companies` - Company information
- `pocs` - Points of contact (links users to companies with roles)
- `rfqs` - Request for Quotes
- `rfq_responses` - Supplier responses to RFQs
- `messages` - Communication between users about RFQs

## Common Commands

```powershell
# Backend - Run tests
cd backend
pytest

# Backend - Check code quality
black .
flake8 .

# Frontend - Run tests
cd frontend
npm test

# Frontend - Build for production
npm run build

# Database - Create new migration
cd backend
alembic revision --autogenerate -m "Description of changes"

# Database - Apply migrations
alembic upgrade head

# Database - Rollback
alembic downgrade -1
```

## Troubleshooting

### Port Already in Use
```powershell
# Backend (8000)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Frontend (3000)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Issues
```powershell
# Check if PostgreSQL is running
docker ps

# Check logs
docker logs sscn-postgres

# Restart database
docker restart sscn-postgres
```

### Module Import Errors
```powershell
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

## Next Steps

1. **Start local servers** (backend + frontend)
2. **Test login** with your existing account (Option A) or create new test account (Option B)
3. **Build missing pages** one at a time
4. **Test locally** until it works perfectly
5. **Push to Railway** only when ready

This way, you iterate 100x faster! 🚀

## Need Help?

- Backend API docs: http://localhost:8000/docs
- Backend logs: Check terminal where `uvicorn` is running
- Frontend logs: Check browser console (F12)
- Database GUI: Use pgAdmin or DBeaver to connect to `postgresql://postgres:postgres@localhost:5432/sscn_db`
