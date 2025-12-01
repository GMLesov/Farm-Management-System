# Install all production dependencies

Write-Host "Installing Farm Management System Dependencies..." -ForegroundColor Green

# Backend dependencies
Write-Host "`nInstalling Backend Dependencies..." -ForegroundColor Cyan
Set-Location "server"
npm install express cors morgan dotenv mongoose bcryptjs jsonwebtoken
npm install express-validator helmet express-rate-limit sanitize-html validator
npm install winston swagger-jsdoc swagger-ui-express
npm install --save-dev @types/express @types/node @types/cors @types/morgan
npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/validator
npm install --save-dev @types/swagger-jsdoc @types/swagger-ui-express
npm install --save-dev typescript ts-node nodemon
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
Set-Location ..

# Frontend dependencies  
Write-Host "`nInstalling Frontend Dependencies..." -ForegroundColor Cyan
Set-Location "web-dashboard"
npm install
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev jest jest-environment-jsdom ts-jest
npm install --save-dev cypress identity-obj-proxy
Set-Location ..

Write-Host "`n✅ Installation Complete!" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Copy .env.example to .env and configure" -ForegroundColor White
Write-Host "2. Run 'docker-compose up -d' for production" -ForegroundColor White
Write-Host "3. Or run 'npm run dev' in server and 'npm start' in web-dashboard" -ForegroundColor White
