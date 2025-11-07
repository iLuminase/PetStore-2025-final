@echo off
echo Starting PetStore Frontend - Optimized...
echo.

REM Set Node.js memory optimization  
set NODE_OPTIONS=--max-old-space-size=2048

REM Kill existing Node processes to free memory
taskkill /f /im node.exe 2>nul

echo [1/3] Starting Shared Module on port 4201...
start "Shared" cmd /c "ng serve shared --port 4201"

REM Wait for shared module to start
echo Waiting 15 seconds for Shared module...
timeout /t 15 /nobreak >nul

echo [2/3] Starting Products Module on port 4202...
start "Products" cmd /c "ng serve products --port 4202"

REM Wait for products module to start
echo Waiting 15 seconds for Products module...
timeout /t 15 /nobreak >nul

echo [3/3] Starting Shell Module on port 4200...
start "Shell" cmd /c "ng serve shell --port 4200"

echo.
echo ====================================
echo PetStore Frontend Services Started:
echo - Shared:   http://localhost:4201
echo - Products: http://localhost:4202  
echo - Shell:    http://localhost:4200 (Main App)
echo ====================================
echo.
echo Note: Wait 30-60 seconds for all services to be ready
echo Press any key to stop all services...
pause >nul

REM Stop all services
echo Stopping all services...
taskkill /f /im node.exe 2>nul
echo All services stopped.