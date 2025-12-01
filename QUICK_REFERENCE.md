# 🚀 Farm Management App - Quick Reference

## Start Development Servers

### Backend (API Server)
```bash
cd farm-management-backend
node start-dev.js
```
**URL**: http://localhost:3000

### Frontend (Web Dashboard)
```bash
cd web-dashboard
npm start
```
**URL**: http://localhost:3001

### Mobile App
```bash
cd FarmManagementApp
npx react-native run-ios    # iOS
npx react-native run-android # Android
```

---

## Quick Commands

### Backend Commands
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm test             # Run tests
npm run lint         # Check code quality
npm run seed         # Seed database
```

### Frontend Commands
```bash
npm start            # Start dev server
npm run build        # Production build
npm test             # Run tests
```

### Docker Commands
```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f api        # View API logs
docker-compose restart api        # Restart API
```

### PM2 Commands (Production)
```bash
pm2 start ecosystem.config.js     # Start with PM2
pm2 stop farm-api                 # Stop
pm2 restart farm-api              # Restart
pm2 logs farm-api                 # View logs
pm2 monit                         # Monitor
pm2 status                        # Status
```

---

## API Endpoints Quick Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Financial
- `GET /api/financial/transactions` - List transactions
- `POST /api/financial/transactions` - Create transaction
- `GET /api/financial/summary` - Financial summary

### Workers
- `GET /api/workers` - List workers
- `POST /api/workers` - Add worker
- `PUT /api/workers/:id` - Update worker

### Weather
- `GET /api/weather/current` - Current weather
- `GET /api/weather/forecast` - 7-day forecast
- `GET /api/weather/alerts` - Weather alerts

### Irrigation
- `GET /api/irrigation/zones` - List zones
- `POST /api/irrigation/zones` - Create zone
- `PUT /api/irrigation/zones/:id/control` - Control

### Crops
- `GET /api/crops` - List crops
- `POST /api/crops` - Add crop
- `PUT /api/crops/:id` - Update crop

### Animals
- `GET /api/animals` - List animals
- `POST /api/animals` - Add animal
- `POST /api/animals/:id/photo` - Upload photo

### Equipment
- `GET /api/equipment` - List equipment
- `POST /api/equipment` - Add equipment

### Analytics
- `GET /api/analytics/overview` - Farm overview
- `GET /api/analytics/trends` - Trends

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark as read

---

## Test the API

### Using curl
```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@farm.com","password":"Test123!","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@farm.com","password":"Test123!"}'

# Get notifications (with auth token)
curl http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using PowerShell
```powershell
# Health check
Invoke-RestMethod http://localhost:3000/health

# Register user
$body = @{
    email = "test@farm.com"
    password = "Test123!"
    firstName = "John"
    lastName = "Doe"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/auth/register `
  -Method Post -Body $body -ContentType "application/json"
```

---

## Environment Setup

### Required Environment Variables
```bash
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/farm_management
JWT_SECRET=your-secret-key
```

### Optional Variables
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
WEATHER_API_KEY=your-api-key
FIREBASE_PROJECT_ID=your-project-id
```

---

## Troubleshooting

### Backend won't start
```bash
# Check if port is in use
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F

# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Frontend won't start
```bash
# Clear cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### MongoDB connection issues
```bash
# Check if MongoDB is running
mongosh

# Or use development mode (no MongoDB required)
set ALLOW_START_WITHOUT_DB=true
npm run dev
```

### Tests failing
```bash
# Clear test cache
npm test -- --clearCache

# Run specific test
npm test -- auth.test.ts
```

---

## Database Commands

### MongoDB
```bash
# Connect
mongosh mongodb://localhost:27017/farm_management

# Show collections
show collections

# Query users
db.users.find()

# Clear collection
db.notifications.deleteMany({})

# Create index
db.notifications.createIndex({ userId: 1, createdAt: -1 })
```

### Redis
```bash
# Connect
redis-cli

# Check if running
ping  # Should return PONG

# Get all keys
keys *

# Clear all data
flushall
```

---

## File Locations

### Backend Code
- Controllers: `src/controllers/`
- Models: `src/models/`
- Routes: `src/routes/`
- Services: `src/services/`

### Frontend Code
- Components: `src/components/`
- Pages: `src/pages/`
- Services: `src/services/`

### Configuration
- Backend env: `.env`
- Frontend env: `.env`
- TypeScript: `tsconfig.json`
- PM2: `ecosystem.config.js`

### Documentation
- Complete Summary: `COMPLETE_SUMMARY.md`
- Deployment Guide: `DEPLOYMENT.md`
- Quick Start: `QUICK_START_GUIDE.md`
- This File: `QUICK_REFERENCE.md`

---

## Port Reference

- **3000** - Backend API
- **3001** - Frontend Web Dashboard
- **27017** - MongoDB
- **6379** - Redis
- **8081** - React Native Metro bundler

---

## Useful Links

### Development
- Backend: http://localhost:3000
- Frontend: http://localhost:3001
- API Docs: http://localhost:3000/api-docs
- Health: http://localhost:3000/health

### External Services
- MongoDB Atlas: https://cloud.mongodb.com
- Redis Cloud: https://redis.com/try-free
- Firebase: https://console.firebase.google.com
- OpenWeatherMap: https://openweathermap.org/api

---

## Git Commands

```bash
# Current status
git status

# Commit changes
git add .
git commit -m "Your message"

# Push to remote
git push origin main

# Pull latest
git pull origin main

# Create branch
git checkout -b feature/new-feature

# View branches
git branch -a
```

---

## Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Configure MongoDB URI
- [ ] Set strong JWT secrets
- [ ] Configure Redis
- [ ] Set up Firebase
- [ ] Configure CORS origins
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test all features
- [ ] Load testing
- [ ] Security audit

---

**Keep this file handy for quick reference!**

*Last Updated: November 11, 2025*
