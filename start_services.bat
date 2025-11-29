@echo off
REM ============================================
REM AI Attack & Defense System - Service Starter
REM Windows Batch Script to Start Backend and Frontend
REM ============================================

echo.
echo ============================================
echo AI Шабуыл және Қорғаныс Жүйесі
echo Серверлерді іске қосу...
echo ============================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ҚАТЕ] Python орнатылмаған!
    echo Python орнатыңыз: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ҚАТЕ] Node.js орнатылмаған!
    echo Node.js орнатыңыз: https://nodejs.org/
    pause
    exit /b 1
)

echo [АҚПАРАТ] Python және Node.js табылды
echo.

REM Check if backend venv exists
if not exist "backend\venv\" (
    echo [ЕСКЕРТУ] Backend виртуалды орта табылмады
    echo [АҚПАРАТ] Виртуалды ортаны құру...
    cd backend
    python -m venv venv
    cd ..
    echo [СӘТТІ] Виртуалды орта құрылды
    echo.
)

REM Check if backend dependencies are installed
if not exist "backend\venv\Scripts\pip.exe" (
    echo [ҚАТЕ] Backend виртуалды орта дұрыс құрылмаған
    pause
    exit /b 1
)

REM Check if frontend node_modules exists
if not exist "frontend\node_modules\" (
    echo [ЕСКЕРТУ] Frontend dependencies орнатылмаған
    echo [АҚПАРАТ] Dependencies орнату...
    cd frontend
    call npm install
    cd ..
    echo [СӘТТІ] Dependencies орнатылды
    echo.
)

REM Check if .env file exists in backend
if not exist "backend\.env" (
    echo [ЕСКЕРТУ] Backend .env файлы табылмады
    echo [АҚПАРАТ] .env файлын құру...
    (
        echo CURSOR_API_KEY=
        echo OPENAI_API_KEY=
        echo API_KEY=demo-api-key-12345
        echo DEFAULT_TARGET_URL=
    ) > backend\.env
    echo [СӘТТІ] .env файлы құрылды
    echo [ЕСКЕРТУ] .env файлына API ключтерін қосыңыз!
    echo.
)

echo ============================================
echo Серверлерді іске қосу...
echo ============================================
echo.

REM Start Backend Server
echo [АҚПАРАТ] Backend серверін іске қосу (http://localhost:8000)...
start "AI Attack & Defense - Backend" cmd /k "cd /d %SCRIPT_DIR%backend && venv\Scripts\activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend Server
echo [АҚПАРАТ] Frontend серверін іске қосу (http://localhost:3000)...
start "AI Attack & Defense - Frontend" cmd /k "cd /d %SCRIPT_DIR%frontend && npm run dev"

echo.
echo ============================================
echo [СӘТТІ] Серверлер іске қосылды!
echo ============================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo API Documentation: http://localhost:8000/docs
echo.
echo Серверлерді тоқтату үшін терезені жабыңыз немесе Ctrl+C басыңыз
echo.
pause

