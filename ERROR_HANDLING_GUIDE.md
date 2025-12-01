# ERROR HANDLING AND MONITORING GUIDE

## Overview
The Farm Management System includes comprehensive error handling with:
- ✅ Winston logging with daily rotation
- ✅ Sentry error tracking
- ✅ User-friendly error messages
- ✅ Health monitoring
- ✅ Performance tracking

## 🚨 Sentry Error Tracking

### Setup Steps

1. **Create Sentry Account** (Free Tier)
   ```
   Visit: https://sentry.io/signup/
   - Create account
   - Create new project: "Farm Management Backend"
   - Select platform: Node.js/Express
   ```

2. **Get DSN**
   ```
   After project creation, copy your DSN:
   Example: https://abc123def456@o123456.ingest.sentry.io/789012
   ```

3. **Configure Backend**
   ```env
   # Add to farm-management-backend/.env
   SENTRY_DSN=your_sentry_dsn_here
   SENTRY_ENVIRONMENT=development
   SENTRY_TRACES_SAMPLE_RATE=0.1
   ```

4. **Configure Frontend** (Optional)
   ```env
   # Add to web-dashboard/.env
   REACT_APP_SENTRY_DSN=your_frontend_sentry_dsn_here
   ```

### Features

**Backend Error Tracking:**
- Automatic error capture
- Request context (URL, method, headers, body)
- User identification
- Performance monitoring
- Release tracking
- Source maps for stack traces

**Frontend Error Tracking:**
- React error boundaries
- Unhandled promise rejections
- Network errors
- User actions breadcrumbs

## 📊 Health Monitoring

### Endpoint: `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "mongodb": {
      "status": "connected",
      "latency": 5
    },
    "redis": {
      "status": "connected",
      "latency": 2
    },
    "firebase": {
      "status": "connected"
    }
  },
  "memory": {
    "used": 150.5,
    "total": 512.0,
    "percentage": 29.4
  },
  "cpu": {
    "usage": 15.3
  }
}
```

**Status Values:**
- `healthy` - All services operational
- `degraded` - Some services unavailable
- `unhealthy` - Critical services down

### Endpoint: `GET /api/metrics`

**Response:**
```json
{
  "requests": {
    "total": 15423,
    "success": 14892,
    "errors": 531,
    "errorRate": 3.44
  },
  "responseTime": {
    "avg": 125.5,
    "p50": 95.0,
    "p95": 350.0,
    "p99": 1200.0
  },
  "endpoints": [
    {
      "path": "/api/animals",
      "method": "GET",
      "count": 1250,
      "avgTime": 85.3
    }
  ]
}
```

## 🛡️ Error Types

### Operational Errors (Expected)
```javascript
// Client errors (4xx)
- ValidationError: Invalid input data
- UnauthorizedError: Authentication required
- ForbiddenError: Insufficient permissions
- NotFoundError: Resource not found
- ConflictError: Duplicate resource
- RateLimitError: Too many requests
```

### System Errors (Unexpected)
```javascript
// Server errors (5xx)
- DatabaseError: MongoDB connection issues
- ExternalServiceError: Third-party API failures
- InternalServerError: Unexpected errors
```

## 📝 Error Response Format

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Please provide all required fields",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ],
    "statusCode": 400,
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### Development Mode (includes stack trace)
```json
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Validation failed",
    "statusCode": 400,
    "stack": "Error: Validation failed\n at ..."
  }
}
```

## 🔍 Error Monitoring Best Practices

### 1. Error Severity Levels
```
CRITICAL  - System down, data loss risk
ERROR     - Feature broken, user impact
WARNING   - Degraded performance, potential issue
INFO      - Normal operation, significant events
DEBUG     - Detailed diagnostic information
```

### 2. Alert Configuration (Sentry)
```javascript
// Critical errors - immediate notification
- Database connection lost
- Authentication service down
- Data corruption detected

// High priority - within 1 hour
- API endpoint failures (>5% error rate)
- Performance degradation (>2s response time)
- Memory leaks detected

// Medium priority - daily digest
- Validation errors spike
- Rate limit triggers
- External API timeouts
```

### 3. Error Context
Always include:
- User ID (if authenticated)
- Request ID (for tracing)
- Timestamp
- Environment (dev/staging/prod)
- Version/release
- User action leading to error

### 4. Performance Monitoring
```javascript
// Track slow operations
- Database queries >100ms
- API endpoints >500ms
- File uploads >5s
- Report generation >10s
```

## 🚀 Using Error Handling

### Backend (Express Route)
```javascript
import { asyncHandler } from '@/middleware/asyncHandler';
import { AppError } from '@/middleware/errorHandler';

// Automatic error handling
router.get('/animals/:id', asyncHandler(async (req, res) => {
  const animal = await Animal.findById(req.params.id);
  
  if (!animal) {
    throw new AppError('Animal not found', 404);
  }
  
  res.json({ success: true, data: animal });
}));

// Validation errors
router.post('/animals', asyncHandler(async (req, res) => {
  const { name, type } = req.body;
  
  if (!name || !type) {
    throw new AppError('Name and type are required', 400);
  }
  
  const animal = await Animal.create(req.body);
  res.json({ success: true, data: animal });
}));
```

### Frontend (React Component)
```javascript
import { useErrorHandler } from '@/hooks/useErrorHandler';

function AnimalList() {
  const { handleError, ErrorDisplay } = useErrorHandler();
  
  const loadAnimals = async () => {
    try {
      const response = await api.get('/animals');
      setAnimals(response.data);
    } catch (error) {
      handleError(error, {
        title: 'Failed to load animals',
        retry: () => loadAnimals()
      });
    }
  };
  
  return (
    <div>
      <ErrorDisplay />
      {/* Component content */}
    </div>
  );
}
```

## 📈 Monitoring Dashboard

### Sentry Dashboard
Access your Sentry dashboard at:
```
https://sentry.io/organizations/your-org/issues/
```

**Key Metrics:**
- Error frequency and trends
- Affected users count
- Error distribution by endpoint
- Performance bottlenecks
- Release comparison

### Winston Logs
Logs are stored in `farm-management-backend/logs/`:
```
logs/
├── error-2025-01-15.log      # Error level logs
├── combined-2025-01-15.log   # All logs
└── [older archived logs].gz  # Rotated logs
```

**View Logs:**
```powershell
# Latest errors
Get-Content logs\error-2025-01-15.log -Tail 50

# All recent activity
Get-Content logs\combined-2025-01-15.log -Tail 100

# Search for specific error
Select-String -Path "logs\*.log" -Pattern "ValidationError"
```

## 🔧 Troubleshooting

### High Error Rate
1. Check Sentry for error patterns
2. Review logs for stack traces
3. Verify external service status
4. Check database connection
5. Monitor memory usage

### Performance Issues
1. Check health endpoint for latency
2. Review slow query logs
3. Monitor memory and CPU usage
4. Check for memory leaks
5. Profile code execution

### Service Unavailable
1. Check health endpoint
2. Verify MongoDB connection
3. Check Redis connection
4. Verify Firebase credentials
5. Review error logs

## 📚 Additional Resources

- **Sentry Documentation**: https://docs.sentry.io/
- **Winston Logging**: https://github.com/winstonjs/winston
- **Express Error Handling**: https://expressjs.com/en/guide/error-handling.html
- **Node.js Error Best Practices**: https://nodejs.org/api/errors.html

## 🎯 Quick Actions

### Enable Sentry
```bash
# 1. Sign up at https://sentry.io
# 2. Get your DSN
# 3. Add to .env:
SENTRY_DSN=your_dsn_here

# 4. Restart server
npm run dev
```

### Test Error Tracking
```bash
# Trigger test error
curl http://localhost:3000/api/test-error

# Check Sentry dashboard for captured error
```

### View Health Status
```bash
# Check all services
curl http://localhost:3000/api/health

# Check metrics
curl http://localhost:3000/api/metrics
```

## ✅ Checklist

- [ ] Sentry account created
- [ ] DSN added to .env
- [ ] Test error captured in Sentry
- [ ] Health endpoint responding
- [ ] Logs rotating properly
- [ ] Error alerts configured
- [ ] Performance monitoring active
- [ ] Frontend error boundaries working
