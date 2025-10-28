@echo off
echo ========================================
echo   SSCN Local Development Quick Start
echo ========================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [1/5] Starting PostgreSQL database...
docker ps -a | findstr sscn-postgres >nul
if %errorlevel% equ 0 (
    echo PostgreSQL container exists, starting...
    docker start sscn-postgres
) else (
    echo Creating new PostgreSQL container...
    docker run --name sscn-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sscn_db -p 5432:5432 -d postgres:15
)
timeout /t 3 >nul

echo.
echo [2/5] Setting up backend .env file...
cd backend
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env >nul
    echo [WARNING] Please edit backend\.env and update:
    echo   - DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sscn_db
    echo   - SECRET_KEY=local-dev-secret-key
    echo   - FRONTEND_URL=http://localhost:3000
)

echo.
echo [3/5] Setting up frontend .env.local file...
cd ..\frontend
if not exist .env.local (
    echo Creating .env.local...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:8000
        echo NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
    ) > .env.local
)

echo.
echo [4/5] Installing dependencies...
echo Checking Python packages...
cd ..\backend
if exist ..\.venv\Scripts\activate.bat (
    call ..\.venv\Scripts\activate.bat
    pip install -q -r requirements.txt
    echo Python packages ready!
) else (
    echo [WARNING] Virtual environment not found. Run setup.bat first.
)

echo.
echo Checking Node packages...
cd ..\frontend
if exist node_modules (
    echo Node packages already installed!
) else (
    echo Installing Node packages (this may take a few minutes)...
    call npm install
)

echo.
echo [5/5] Running database migrations...
cd ..\backend
if exist ..\.venv\Scripts\activate.bat (
    call ..\.venv\Scripts\activate.bat
    alembic upgrade head
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start development:
echo.
echo   Terminal 1 (Backend):
echo     cd backend
echo     ..\.venv\Scripts\activate
echo     uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
echo.
echo   Terminal 2 (Frontend):
echo     cd frontend
echo     npm run dev
echo.
echo Then visit: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
pause
