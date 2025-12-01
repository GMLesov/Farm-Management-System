# 📚 API Documentation Guide

## Overview

The Farm Management System API is fully documented using **Swagger/OpenAPI 3.0**.

## Accessing the Documentation

### Interactive Documentation (Swagger UI)
```
http://localhost:3000/api-docs
```

**Features**:
- Browse all endpoints by category
- Test endpoints directly in browser
- View request/response examples
- Authenticate with JWT tokens
- Export API specification

### JSON Specification
```
http://localhost:3000/api-docs.json
```

Download the complete OpenAPI 3.0 specification in JSON format.

## Quick Start

### 1. Open Swagger UI
Navigate to `http://localhost:3000/api-docs` in your browser.

### 2. Authenticate
1. Click "Authorize" button (🔒 icon at top right)
2. Login or register to get a JWT token
3. Enter token in format: `Bearer <your-token>`
4. Click "Authorize" and "Close"
5. All subsequent requests will include your token

### 3. Test Endpoints
1. Expand any endpoint category (Health, Authentication, Farms, etc.)
2. Click on an endpoint to view details
3. Click "Try it out"
4. Fill in parameters (if required)
5. Click "Execute"
6. View response below

## API Structure

### Base URL
```
http://localhost:3000
```

### Response Format
All responses follow a consistent structure:

**Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Validation failed",
    "statusCode": 400,
    "details": [...]
  }
}
```

## Endpoint Categories

### 🏥 Health Monitoring
Monitor system health and service status.

**Endpoints**:
- `GET /api/health` - Comprehensive health check
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/alive` - Liveness probe

**Authentication**: Not required

**Example**:
```bash
curl http://localhost:3000/api/health
```

### 🔐 Authentication
User registration, login, and token management.

**Endpoints**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT token
- `POST /api/auth/refresh` - Refresh expired token
- `POST /api/auth/logout` - Invalidate token

**Authentication**: Not required (except refresh/logout)

**Example Register**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Farmer"
  }'
```

**Example Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "SecurePass123!"
  }'
```

### 👤 Users
User profile and account management.

**Endpoints**:
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users
- `POST /api/users/switch-farm/:farmId` - Switch active farm

**Authentication**: Required

**Example**:
```bash
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 🏡 Farms
Farm creation and management.

**Endpoints**:
- `GET /api/farms` - List all farms
- `POST /api/farms` - Create new farm
- `GET /api/farms/:id` - Get farm details
- `PUT /api/farms/:id` - Update farm
- `DELETE /api/farms/:id` - Delete farm
- `POST /api/farms/:id/staff` - Add staff member
- `DELETE /api/farms/:id/staff/:userId` - Remove staff member

**Authentication**: Required

**Example Create Farm**:
```bash
curl -X POST http://localhost:3000/api/farms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Green Valley Farm",
    "location": {
      "address": "123 Farm Road",
      "city": "Farmville",
      "state": "CA"
    },
    "size": 50.5,
    "soilType": "Loamy"
  }'
```

### 🐄 Animals (Livestock)
Complete livestock management system.

**Endpoints**:
- `GET /api/animals` - List all animals (with filters)
- `POST /api/animals` - Register new animal
- `GET /api/animals/:id` - Get animal details
- `PUT /api/animals/:id` - Update animal info
- `DELETE /api/animals/:id` - Remove animal
- `POST /api/animals/:id/weight` - Record weight measurement
- `POST /api/animals/:id/health` - Update health status
- `GET /api/animals/analytics/summary` - Get livestock analytics

**Authentication**: Required

**Query Parameters** (List endpoint):
- `species` - Filter by species (cattle, sheep, goat, etc.)
- `healthStatus` - Filter by health (healthy, sick, injured, etc.)
- `farm` - Filter by farm ID
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example**:
```bash
# List all cattle
curl "http://localhost:3000/api/animals?species=cattle" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Register new animal
curl -X POST http://localhost:3000/api/animals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tagId": "COW-001",
    "name": "Bessie",
    "species": "cattle",
    "breed": "Holstein",
    "gender": "female",
    "dateOfBirth": "2020-05-15",
    "weight": 650,
    "farm": "FARM_ID_HERE"
  }'
```

### 🌾 Feed Inventory
Animal feed stock management.

**Endpoints**:
- `GET /api/feed` - List feed inventory
- `POST /api/feed` - Add feed stock
- `PUT /api/feed/:id` - Update feed record
- `DELETE /api/feed/:id` - Remove feed record
- `POST /api/feed/:id/distribute` - Record feed distribution
- `GET /api/feed/alerts` - Get low stock alerts

**Authentication**: Required

**Example**:
```bash
curl -X POST http://localhost:3000/api/feed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Hay",
    "type": "hay",
    "quantity": 1000,
    "unit": "kg",
    "costPerUnit": 2.50,
    "supplier": "Farm Supply Co.",
    "purchaseDate": "2025-01-01",
    "farm": "FARM_ID_HERE"
  }'
```

### 💉 Veterinary Records
Animal health records and treatments.

**Endpoints**:
- `GET /api/veterinary` - List all vet records
- `POST /api/veterinary` - Create new record
- `GET /api/veterinary/:id` - Get record details
- `PUT /api/veterinary/:id` - Update record
- `DELETE /api/veterinary/:id` - Delete record
- `GET /api/veterinary/animal/:animalId` - Get animal's health history

**Authentication**: Required

**Example**:
```bash
curl -X POST http://localhost:3000/api/veterinary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "animal": "ANIMAL_ID_HERE",
    "date": "2025-11-12T10:00:00Z",
    "type": "vaccination",
    "diagnosis": "Routine vaccination",
    "treatment": "Administered annual vaccine",
    "medications": [{
      "name": "Vaccine XYZ",
      "dosage": "5ml",
      "frequency": "Once"
    }],
    "veterinarian": "Dr. Smith",
    "cost": 150.00,
    "farm": "FARM_ID_HERE"
  }'
```

### 🌧️ Irrigation Management
Automated irrigation zone control and scheduling.

**Endpoints**:
- `GET /api/irrigation/zones` - List irrigation zones
- `POST /api/irrigation/zones` - Create new zone
- `GET /api/irrigation/zones/:id` - Get zone details
- `PUT /api/irrigation/zones/:id` - Update zone
- `DELETE /api/irrigation/zones/:id` - Delete zone
- `POST /api/irrigation/zones/:id/start` - Start watering
- `POST /api/irrigation/zones/:id/stop` - Stop watering
- `POST /api/irrigation/zones/:id/schedule` - Schedule watering
- `GET /api/irrigation/schedules` - List all schedules
- `GET /api/irrigation/history` - View watering history

**Authentication**: Required

**Example**:
```bash
# Start watering a zone
curl -X POST http://localhost:3000/api/irrigation/zones/ZONE_ID/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "duration": 30 }'

# Schedule automatic watering
curl -X POST http://localhost:3000/api/irrigation/zones/ZONE_ID/schedule \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "06:00",
    "duration": 30,
    "frequency": "daily"
  }'
```

### 🔔 Notifications
Alert system for farm events.

**Endpoints**:
- `GET /api/notifications` - List user notifications
- `GET /api/notifications/unread` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/preferences` - Get notification settings
- `PUT /api/notifications/preferences` - Update settings

**Authentication**: Required

**Example**:
```bash
# Get unread notifications
curl http://localhost:3000/api/notifications?isRead=false \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Mark notification as read
curl -X PUT http://localhost:3000/api/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 📊 Analytics
Farm performance analytics and reports.

**Endpoints**:
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/livestock` - Livestock statistics
- `GET /api/analytics/feed-consumption` - Feed usage trends
- `GET /api/analytics/health-trends` - Animal health trends
- `GET /api/analytics/irrigation-efficiency` - Water usage stats
- `GET /api/analytics/financial` - Cost and revenue analysis

**Authentication**: Required

**Query Parameters**:
- `startDate` - Filter start date (ISO 8601)
- `endDate` - Filter end date (ISO 8601)
- `farm` - Filter by farm ID
- `period` - Aggregation period (daily, weekly, monthly)

**Example**:
```bash
curl "http://localhost:3000/api/analytics/overview?period=monthly&farm=FARM_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 🗺️ Geocoding
Location and address services.

**Endpoints**:
- `POST /api/geocode/address` - Convert address to coordinates
- `POST /api/geocode/reverse` - Convert coordinates to address

**Authentication**: Required

## Authentication Flow

### 1. Register New Account
```javascript
POST /api/auth/register
{
  "email": "farmer@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Farmer"
}

// Response includes JWT token
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 2. Use Token in Requests
```javascript
// Include in Authorization header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Refresh Token (When Expired)
```javascript
POST /api/auth/refresh
Authorization: Bearer <expired-token>

// Response includes new token
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

## Rate Limiting

**Limits**:
- **Unauthenticated**: 100 requests / 15 minutes
- **Authenticated**: 1000 requests / 15 minutes

**Response when limited**:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## Pagination

List endpoints support pagination:

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sort` - Sort field (e.g., `createdAt`, `-createdAt` for descending)

**Response Format**:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering

Most list endpoints support filtering:

**Query Parameters**:
- Field-specific filters (e.g., `species=cattle`, `status=active`)
- Date range filters (e.g., `startDate=2025-01-01`, `endDate=2025-12-31`)
- Search (e.g., `search=keyword`)

## Error Codes

| Code | Type | Description |
|------|------|-------------|
| 200 | Success | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |
| 503 | Service Unavailable | Service temporarily down |

## Testing with Postman

### Import Collection
1. Download OpenAPI spec: `http://localhost:3000/api-docs.json`
2. Open Postman
3. Click "Import" → "Upload Files"
4. Select downloaded JSON file
5. Collection will be imported with all endpoints

### Environment Variables
Create a Postman environment with:
```
base_url = http://localhost:3000
token = (will be set after login)
farm_id = (your farm ID)
```

### Example Workflow
1. Register/Login → Save token to environment
2. Create Farm → Save farm ID to environment
3. Use saved variables in subsequent requests

## Code Examples

### JavaScript/TypeScript (Axios)
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
const login = async () => {
  const { data } = await api.post('/api/auth/login', {
    email: 'farmer@example.com',
    password: 'SecurePass123!'
  });
  
  // Save token
  api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  return data;
};

// Get animals
const getAnimals = async () => {
  const { data } = await api.get('/api/animals', {
    params: { species: 'cattle' }
  });
  return data;
};
```

### Python (Requests)
```python
import requests

BASE_URL = 'http://localhost:3000'

# Login
response = requests.post(f'{BASE_URL}/api/auth/login', json={
    'email': 'farmer@example.com',
    'password': 'SecurePass123!'
})
token = response.json()['token']

# Get animals
headers = {'Authorization': f'Bearer {token}'}
response = requests.get(f'{BASE_URL}/api/animals', 
                       params={'species': 'cattle'},
                       headers=headers)
animals = response.json()['data']
```

### cURL
```bash
# Login and save token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer@example.com","password":"SecurePass123!"}' \
  | jq -r '.token')

# Use token in requests
curl http://localhost:3000/api/animals \
  -H "Authorization: Bearer $TOKEN"
```

## WebSocket (Socket.IO)

Real-time updates via Socket.IO:

**Connection**:
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Listen for notifications
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

// Listen for irrigation updates
socket.on('irrigation-update', (data) => {
  console.log('Irrigation status:', data);
});
```

## Support

- **Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health
- **Issues**: Report bugs or request features on GitHub

## Additional Resources

- **Swagger Editor**: https://editor.swagger.io/ (validate/edit OpenAPI spec)
- **Postman**: https://www.postman.com/ (API testing)
- **Insomnia**: https://insomnia.rest/ (Alternative API client)

---

**Last Updated**: November 12, 2025  
**API Version**: 1.0.0  
**Server**: http://localhost:3000
