# PowerShell script to start the frontend
$env:PORT = "3001"
Set-Location "c:\Users\mugod\My PROJECTS\FARM MANAGEMENT APP\web-dashboard"
Write-Host "Starting Farm Management Frontend on port 3001..." -ForegroundColor Green
npm start
