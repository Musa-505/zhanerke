@echo off
REM ============================================
REM AI Attack & Defense System - Service Stopper
REM Windows Batch Script to Stop Backend and Frontend
REM ============================================

echo.
echo ============================================
echo AI Шабуыл және Қорғаныс Жүйесі
echo Серверлерді тоқтату...
echo ============================================
echo.

REM Stop Python/uvicorn processes
echo [АҚПАРАТ] Backend серверлерін тоқтату...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq AI Attack & Defense - Backend*" >nul 2>&1
taskkill /F /IM uvicorn.exe >nul 2>&1

REM Stop Node.js processes
echo [АҚПАРАТ] Frontend серверлерін тоқтату...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq AI Attack & Defense - Frontend*" >nul 2>&1

REM Kill processes on specific ports
echo [АҚПАРАТ] Порттарды босату...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

echo.
echo [СӘТТІ] Барлық серверлер тоқтатылды
echo.
pause

