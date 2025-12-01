$body = @{
    name = "Farm Administrator"
    email = "admin@farm.com"
    password = "admin123"
    role = "admin"
    phone = "+1234567890"
} | ConvertTo-Json

Write-Host "Registering admin user..."
try {
    $response = Invoke-RestMethod -Uri http://localhost:5000/api/auth/register -Method Post -Body $body -ContentType "application/json"
    Write-Host "Success!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
