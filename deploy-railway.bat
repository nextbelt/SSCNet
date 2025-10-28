@echo off
echo 🚂 Setting up Railway deployment for SSCN B2B Marketplace...

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Railway CLI not found. Installing...
    npm install -g @railway/cli
    if errorlevel 1 (
        echo [ERROR] Failed to install Railway CLI. Please install manually.
        pause
        exit /b 1
    )
    echo [SUCCESS] Railway CLI installed successfully!
) else (
    echo [SUCCESS] Railway CLI found!
)

REM Check Railway authentication
echo [INFO] Checking Railway authentication...
railway whoami >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Not logged in to Railway. Please log in...
    railway login
    if errorlevel 1 (
        echo [ERROR] Failed to log in to Railway.
        pause
        exit /b 1
    )
) else (
    echo [SUCCESS] Already logged in to Railway!
)

echo.
echo 📋 Project Configuration
set /p PROJECT_NAME="Enter your project name (default: sscn-marketplace): "
if "%PROJECT_NAME%"=="" set PROJECT_NAME=sscn-marketplace

set /p GITHUB_REPO="Enter your GitHub repository URL: "
if "%GITHUB_REPO%"=="" (
    echo [ERROR] GitHub repository URL is required!
    pause
    exit /b 1
)

echo.
echo 🔗 LinkedIn OAuth Configuration
echo You'll need a LinkedIn Developer App. Get one at: https://developer.linkedin.com/
set /p LINKEDIN_CLIENT_ID="Enter LinkedIn Client ID: "
set /p LINKEDIN_CLIENT_SECRET="Enter LinkedIn Client Secret: "

if "%LINKEDIN_CLIENT_ID%"=="" (
    echo [ERROR] LinkedIn credentials are required!
    pause
    exit /b 1
)

if "%LINKEDIN_CLIENT_SECRET%"=="" (
    echo [ERROR] LinkedIn credentials are required!
    pause
    exit /b 1
)

REM Generate a simple secret key
for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(32, 8)"') do set SECRET_KEY=%%i
if "%SECRET_KEY%"=="" set SECRET_KEY=fallback-secret-key-change-this-in-production

echo [INFO] Generated SECRET_KEY

echo.
echo 🚀 Starting Railway Deployment...

REM Create Railway project
echo [INFO] Creating Railway project: %PROJECT_NAME%
railway new "%PROJECT_NAME%"
if errorlevel 1 (
    echo [ERROR] Failed to create Railway project
    pause
    exit /b 1
)

echo [SUCCESS] Railway project created!

echo.
echo 🐍 Deploying Backend Service...

REM Add PostgreSQL
echo [INFO] Adding PostgreSQL database...
railway add postgresql

REM Set backend environment variables
echo [INFO] Setting backend environment variables...
railway variables set SECRET_KEY="%SECRET_KEY%"
railway variables set LINKEDIN_CLIENT_ID="%LINKEDIN_CLIENT_ID%"
railway variables set LINKEDIN_CLIENT_SECRET="%LINKEDIN_CLIENT_SECRET%"
railway variables set ENVIRONMENT="production"
railway variables set DEBUG="false"

echo.
echo ⚛️ Next: Deploy Frontend Service...
echo.
echo 📋 Manual Steps Required:
echo 1. Go to railway.app dashboard
echo 2. Add GitHub repo: %GITHUB_REPO%
echo 3. Create two services: backend (from /backend folder) and frontend (from /frontend folder)
echo 4. Set environment variables as shown in RAILWAY_DEPLOYMENT.md
echo 5. Add PostgreSQL plugin to backend service
echo.
echo 🔗 Don't forget to update LinkedIn redirect URI once deployed!
echo.
pause