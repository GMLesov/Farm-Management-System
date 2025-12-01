@echo off
cd /d "c:\Users\mugod\My PROJECTS\FARM MANAGEMENT APP\farm-management-backend"
echo Starting Farm Management Backend on port 3000...
set NODE_ENV=development
set PORT=3000
set USE_INMEMORY_DB=true
set ALLOW_START_WITHOUT_DB=true
set ALLOW_START_WITHOUT_REDIS=true
npm run dev
pause