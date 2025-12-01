# Farm Management Mobile App - Release Build Script
# This builds a working APK with embedded JavaScript bundle

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Farm Management Mobile - Release Build" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean
Write-Host "[1/4] Cleaning previous builds..." -ForegroundColor Yellow
Set-Location android
.\gradlew.bat clean | Out-Null

# Step 2: Build Release APK (includes bundled JS automatically)
Write-Host "[2/4] Building release APK..." -ForegroundColor Yellow
.\gradlew.bat assembleRelease --no-daemon
if ($LASTEXITCODE -ne 0) {
    Write-Host " Build failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Install
Write-Host "[3/4] Installing on device/emulator..." -ForegroundColor Yellow
Set-Location app\build\outputs\apk\release
adb uninstall com.farmmanager 2>&1 | Out-Null
adb install app-release.apk

# Step 4: Launch
Write-Host "[4/4] Launching app..." -ForegroundColor Yellow
adb shell am start -n com.farmmanager/.MainActivity 2>&1 | Out-Null

Write-Host ""
Write-Host " BUILD COMPLETE!" -ForegroundColor Green
Write-Host "   APK: C:\FarmApp\mobile\android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor White
Write-Host "   No Metro server needed" -ForegroundColor White
Write-Host "   JavaScript bundle embedded" -ForegroundColor White
