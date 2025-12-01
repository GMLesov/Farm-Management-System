# PowerShell Deployment Script for Windows

Write-Host "Deploying Farm Management System..." -ForegroundColor Cyan
Write-Host ""

# 1. Deploy Frontend to Vercel
Write-Host "Deploying Frontend to Vercel..." -ForegroundColor Blue
Set-Location web-dashboard
vercel --prod
Set-Location ..
Write-Host "Frontend deployed!" -ForegroundColor Green
Write-Host ""

# 2. Deploy Backend to Render
Write-Host "Deploying Backend to Render..." -ForegroundColor Blue
Write-Host "Please go to https://render.com and:"
Write-Host "1. Click New + and select Blueprint"
Write-Host "2. Connect your GitHub repo"
Write-Host "3. Render will auto-deploy using render.yaml"
Write-Host ""

# 3. Build Android APK
Write-Host "Building Android APK..." -ForegroundColor Blue
Set-Location mobile
npm install
Set-Location android
.\gradlew assembleRelease
Set-Location ..\..
Write-Host "APK built at: mobile\android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Green
Write-Host ""

# 4. Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Blue
git add .
git commit -m "Deploy: Update all deployment configs"
git push origin main
Write-Host "Pushed to GitHub!" -ForegroundColor Green
Write-Host ""

Write-Host "Deployment complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:"
Write-Host "1. Frontend: Check Vercel dashboard for URL"
Write-Host "2. Backend: Go to https://render.com to connect repo"
Write-Host "3. GitHub Pages: Will auto-deploy demo.html"
Write-Host "4. APK: Create git tag v1.0 and push to trigger GitHub Actions build"
