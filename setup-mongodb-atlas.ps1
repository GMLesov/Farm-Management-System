# MongoDB Atlas Setup - Quick Start
# This guide will help you set up MongoDB Atlas in 5 minutes

Write-Host "MongoDB Atlas Setup for Farm Management App" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1
Write-Host "STEP 1: Create MongoDB Atlas Account" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Yellow
Write-Host "1. Open: https://www.mongodb.com/cloud/atlas/register" -ForegroundColor Green
Write-Host "2. Sign up with email or Google account" -ForegroundColor White
Write-Host "3. Verify your email" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter when you've created your account"

# Step 2
Write-Host ""
Write-Host "STEP 2: Create a FREE Cluster" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Yellow
Write-Host "1. Click 'Build a Database' or 'Create'" -ForegroundColor Green
Write-Host "2. Choose FREE tier (M0 Sandbox)" -ForegroundColor White
Write-Host "3. Select AWS as provider" -ForegroundColor White
Write-Host "4. Choose region closest to you" -ForegroundColor White
Write-Host "5. Cluster Name: farm-management-cluster" -ForegroundColor White
Write-Host "6. Click 'Create Cluster' (takes 3-5 minutes)" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter when cluster is created"

# Step 3
Write-Host ""
Write-Host "STEP 3: Create Database User" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow
Write-Host "1. Go to 'Database Access' in left sidebar" -ForegroundColor Green
Write-Host "2. Click 'Add New Database User'" -ForegroundColor White
Write-Host "3. Authentication: Password" -ForegroundColor White
Write-Host "4. Username: farmadmin" -ForegroundColor White
Write-Host "5. Click 'Autogenerate Secure Password' and SAVE IT!" -ForegroundColor Red
Write-Host "6. Privileges: 'Read and write to any database'" -ForegroundColor White
Write-Host "7. Click 'Add User'" -ForegroundColor White
Write-Host ""
Write-Host "Enter the password you saved:" -ForegroundColor Cyan
$dbPassword = Read-Host -AsSecureString
$dbPasswordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

# Step 4
Write-Host ""
Write-Host "STEP 4: Configure Network Access" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow
Write-Host "1. Go to 'Network Access' in left sidebar" -ForegroundColor Green
Write-Host "2. Click 'Add IP Address'" -ForegroundColor White
Write-Host "3. Click 'Allow Access from Anywhere' (0.0.0.0/0)" -ForegroundColor White
Write-Host "4. Click 'Confirm'" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter when network access is configured"

# Step 5
Write-Host ""
Write-Host "STEP 5: Get Connection String" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow
Write-Host "1. Go to 'Database' in left sidebar" -ForegroundColor Green
Write-Host "2. Click 'Connect' on your cluster" -ForegroundColor White
Write-Host "3. Choose 'Connect your application'" -ForegroundColor White
Write-Host "4. Driver: Node.js, Version: 4.1 or later" -ForegroundColor White
Write-Host "5. Copy the connection string (looks like mongodb+srv://...)" -ForegroundColor White
Write-Host ""
Write-Host "Enter your cluster address (e.g., farm-management-cluster.abc12.mongodb.net):" -ForegroundColor Cyan
$clusterAddress = Read-Host

# Build connection string
$connectionString = "mongodb+srv://farmadmin:$dbPasswordText@$clusterAddress/farm_management?retryWrites=true&w=majority"

# Update .env file
Write-Host ""
Write-Host "Updating .env file..." -ForegroundColor Yellow

$envPath = ".\farm-management-backend\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    $newContent = $envContent | ForEach-Object {
        if ($_ -match "^MONGODB_URI=") {
            "MONGODB_URI=$connectionString"
        } else {
            $_
        }
    }
    $newContent | Set-Content $envPath
    
    Write-Host "SUCCESS - .env file updated successfully!" -ForegroundColor Green
} else {
    Write-Host "ERROR - .env file not found at $envPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Your connection string is:" -ForegroundColor Yellow
    Write-Host $connectionString -ForegroundColor White
    Write-Host ""
    Write-Host "Manually add this to your .env file:" -ForegroundColor Yellow
    Write-Host "MONGODB_URI=$connectionString" -ForegroundColor White
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "SUCCESS - MongoDB Atlas Setup Complete!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test connection: cd farm-management-backend; node start-dev.js" -ForegroundColor White
Write-Host "2. You should see: Database connected successfully" -ForegroundColor White
Write-Host "3. Open the app: http://localhost:3000/health" -ForegroundColor White
Write-Host ""
Write-Host "Your connection string has been saved to .env file" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
