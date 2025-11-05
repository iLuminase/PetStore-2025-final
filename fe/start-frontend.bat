@echo off
echo Starting PetStore Microfrontends...
echo.

cd /d "D:\DoAnVNPT_LTUDJava\petStore-new\fe"

echo Starting Shared service on port 4201...
start "Shared Service" cmd /k "npm run start:shared"
timeout /t 15

echo Starting Products service on port 4202...
start "Products Service" cmd /k "npm run start:products"  
timeout /t 15

echo Starting Shell service on port 4200...
start "Shell Service" cmd /k "npm run start:shell"

echo.
echo All services are starting...
echo Shared: http://localhost:4201
echo Products: http://localhost:4202  
echo Shell: http://localhost:4200
echo.
pause