@echo off
echo 🚀 Starting Sourcing Supply Chain Net setup...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker and try again.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose and try again.
    pause
    exit /b 1
)

REM Create environment files if they don't exist
if not exist backend\.env (
    echo 📝 Creating backend environment file...
    copy backend\.env.example backend\.env
    echo ⚠️  Please edit backend\.env with your configuration before starting the services
)

if not exist frontend\.env.local (
    echo 📝 Creating frontend environment file...
    copy frontend\.env.local.example frontend\.env.local
    echo ⚠️  Please edit frontend\.env.local with your configuration before starting the services
)

REM Create necessary directories
if not exist nginx\ssl mkdir nginx\ssl

echo 🐳 Starting Docker services...
docker-compose up -d

echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak

echo 🔍 Checking service health...

REM Check if services are running
curl -f http://localhost:8100/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running at http://localhost:8100
) else (
    echo ❌ Backend health check failed
)

curl -f http://localhost:3100 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is running at http://localhost:3100
) else (
    echo ❌ Frontend health check failed
)

echo.
echo 🎉 Setup complete!
echo.
echo 📱 Application URLs:
echo    Frontend: http://localhost:3100
echo    Backend API: http://localhost:8100
echo    API Docs: http://localhost:8100/docs
echo.
echo 🔧 Development URLs:
echo    PostgreSQL: localhost:5433
echo    Redis: localhost:6380
echo    Elasticsearch: http://localhost:9201
echo.
echo 📚 Next steps:
echo 1. Configure your environment variables in backend\.env and frontend\.env.local
echo 2. Set up your LinkedIn OAuth application
echo 3. Configure your third-party API keys (SendGrid, AWS, etc.)
echo 4. Run database migrations: docker-compose exec backend alembic upgrade head
echo 5. Visit http://localhost:3100 to start using the application
echo.
echo 📖 For more information, see README.md
pause