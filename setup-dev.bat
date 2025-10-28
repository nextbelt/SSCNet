@echo off
echo 🚀 Setting up Sourcing Supply Chain Net for development...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.11+ and try again.
    pause
    exit /b 1
)

REM Setup Backend
echo 📦 Setting up Backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
echo Installing Python dependencies...
call venv\Scripts\activate
pip install -r requirements.txt

REM Go back to root
cd ..

REM Setup Frontend
echo 📦 Setting up Frontend...
cd frontend

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install

REM Go back to root
cd ..

echo ✅ Development setup complete!
echo.
echo 🚀 To start the development servers:
echo.
echo Backend:
echo   cd backend
echo   venv\Scripts\activate
echo   uvicorn app.main:app --reload --host 0.0.0.0 --port 8100
echo.
echo Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo 📚 Make sure to:
echo 1. Set up your environment variables in backend\.env and frontend\.env.local
echo 2. Set up your PostgreSQL database
echo 3. Run database migrations
echo.
pause