@echo off
echo Starting SSCN Local Development Servers...
echo.

REM Start backend in a new window
start "SSCN Backend" cmd /k "cd /d "%~dp0backend" && ..\.venv\Scripts\activate && echo Backend starting on http://localhost:8000 && echo API Docs: http://localhost:8000/docs && echo. && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
start "SSCN Frontend" cmd /k "cd /d "%~dp0frontend" && echo Frontend starting on http://localhost:3000 && echo. && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000 (+ API docs at /docs)
echo Frontend: http://localhost:3000
echo.
echo Press any key to stop both servers...
pause >nul

REM Kill both processes
taskkill /FI "WindowTitle eq SSCN Backend*" /F >nul 2>&1
taskkill /FI "WindowTitle eq SSCN Frontend*" /F >nul 2>&1
echo Servers stopped.
