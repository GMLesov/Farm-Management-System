# Error Handling & Monitoring - Quick Reference

## ✅ What's Implemented

### 1. **Winston Logging** (Already Working)
- Daily rotating log files in `logs/`
- 5 log levels: error, warn, info, http, debug
- 14-day retention, 20MB max per file
- Structured logging with request context

### 2. **Sentry Error Tracking** (New - Optional)
- Real-time error monitoring
- Stack traces and user context
- Performance profiling
- Release tracking

### 3. **Health Monitoring** (New)
- `/api/health` - Comprehensive health check
- `/api/ready` - Kubernetes readiness probe
- `/api/alive` - Kubernetes liveness probe
- Service status (MongoDB, Redis, Firebase)
- Memory and CPU usage

### 4. **User-Friendly Errors** (Enhanced)
- Consistent error format
- Type-specific error classes
- Helpful error messages
- Development vs production modes

## 🚀 Quick Start

### Test Health Endpoint
```bash
curl http://localhost:3000/api/health
```

### View Logs
```powershell
# Latest errors
Get-Content farm-management-backend\logs\error-*.log -Tail 50

# All activity
Get-Content farm-management-backend\logs\combined-*.log -Tail 100
```

### Enable Sentry (Optional)
1. Sign up at https://sentry.io (free tier)
2. Create project "Farm Management Backend"
3. Copy your DSN
4. Add to `.env`:
```env
SENTRY_DSN=https://your-key@o123.ingest.sentry.io/456
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1
```
5. Restart server

## 📊 What You Get

### Error Types
```javascript
ValidationError      // 400 - Invalid input
UnauthorizedError   // 401 - Not logged in
ForbiddenError      // 403 - No permission
NotFoundError       // 404 - Resource not found
ConflictError       // 409 - Duplicate resource
RateLimitError      // 429 - Too many requests
DatabaseError       // 500 - DB issues
ExternalServiceError // 502 - Third-party API failures
```

### Health Check Response
```json
{
  "status": "healthy",
  "uptime": 3600,
  "services": {
    "mongodb": { "status": "connected", "latency": 5 },
    "redis": { "status": "connected", "latency": 2 },
    "firebase": { "status": "connected" }
  },
  "memory": { "used": 150.5, "total": 512.0, "percentage": 29.4 },
  "cpu": { "usage": 15.3 }
}
```

## 📖 Full Documentation

See `ERROR_HANDLING_GUIDE.md` for complete details on:
- Setting up Sentry
- Error monitoring best practices
- Alert configuration
- Performance monitoring
- Troubleshooting guides

## 🔍 Testing

### Trigger Test Error
```bash
# Will be captured in logs and Sentry (if configured)
curl http://localhost:3000/api/test-error
```

### Check Services
```bash
# MongoDB status
curl http://localhost:3000/api/health | jq .services.mongodb

# Overall health
curl http://localhost:3000/api/health | jq .status
```

## ✨ Benefits

- **Faster Debugging**: Real-time error notifications with full context
- **Better Uptime**: Health checks for monitoring and auto-recovery
- **User Experience**: Friendly error messages, not technical jargon
- **Production Ready**: Comprehensive error tracking and logging
- **Cost**: Free tier (Winston is free, Sentry has generous free plan)

## 🎯 Next Steps

1. ✅ Health endpoints are working
2. ⏩ (Optional) Sign up for Sentry for production monitoring
3. ⏩ Configure alerts in Sentry for critical errors
4. ⏩ Set up log aggregation (optional) for production

---

**Current Status**: 
- ✅ Winston logging active
- ✅ Health monitoring active
- ⏸️ Sentry ready (add DSN to enable)
- ✅ User-friendly errors configured
