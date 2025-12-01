@echo off
echo Starting Farm Management API Server and Tests...
echo.

cd /d "c:\Users\mugod\My PROJECTS\FARM MANAGEMENT APP\server"

echo Starting server in background...
start "Farm API Server" cmd /k "npm run dev"

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo Running API tests...
node test-api.js

echo.
echo Tests complete! Press any key to exit...
pause >nul
