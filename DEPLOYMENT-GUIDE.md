# 🚀 Production Deployment Guide

## Overview

This guide covers deploying the Farm Management System to production using Docker containers.

## Prerequisites

- Docker 24.0+ and Docker Compose 2.0+
- MongoDB Atlas account (or self-hosted MongoDB)
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## Quick Start

### 1. Environment Configuration

Create `.env` file in project root:

```bash
# MongoDB (Use MongoDB Atlas connection string)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farm-management?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secure-random-secret-key-min-32-characters-long
JWT_EXPIRE=7d

# Server
NODE_ENV=production
PORT=5000

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### 2. Build and Run with Docker Compose

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Access Application

- **Frontend**: http://localhost (or your domain)
- **Backend API**: http://localhost/api
- **Health Check**: http://localhost/api/health

## Manual Docker Build

### Backend

```bash
cd "c:\Users\mugod\My PROJECTS\FARM MANAGEMENT APP"
docker build -f Dockerfile.backend -t farm-backend:latest .
docker run -d -p 5000:5000 --env-file .env farm-backend:latest
```

### Frontend

```bash
docker build -f Dockerfile.frontend -t farm-frontend:latest .
docker run -d -p 80:80 farm-frontend:latest
```

## Production Checklist

### Security

- [ ] Change default JWT_SECRET to strong random string
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure CORS to allow only your domain
- [ ] Set up firewall rules
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Implement rate limiting (already configured)
- [ ] Regular security updates

### Performance

- [ ] Enable Nginx gzip compression (already configured)
- [ ] Configure CDN for static assets
- [ ] Set up database indexes (already in models)
- [ ] Enable Redis caching (optional)
- [ ] Configure load balancer (for high traffic)

### Monitoring

- [ ] Set up application logs aggregation
- [ ] Configure error tracking (Sentry recommended)
- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring (New Relic/DataDog)
- [ ] Set up database monitoring

### Backup

- [ ] Configure MongoDB automated backups
- [ ] Set up daily backup verification
- [ ] Test disaster recovery procedures
- [ ] Document backup restoration process

## Environment-Specific Configuration

### Development

```bash
docker-compose -f docker-compose.dev.yml up
```

### Staging

```bash
docker-compose -f docker-compose.staging.yml up
```

### Production

```bash
docker-compose up -d
```

## Scaling

### Horizontal Scaling

```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# Scale with load balancer
# Edit docker-compose.yml to add nginx load balancer
```

### Database Scaling

- Use MongoDB Atlas with auto-scaling
- Configure read replicas for read-heavy workloads
- Set up sharding for large datasets

## SSL/HTTPS Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database connection issues

```bash
# Test MongoDB connection
docker exec -it farm-management-backend node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected'))
    .catch(err => console.error('❌ Error:', err));
"
```

### High memory usage

```bash
# Set memory limits in docker-compose.yml
services:
  backend:
    mem_limit: 512m
  frontend:
    mem_limit: 256m
```

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Clean up old images
docker system prune -af
```

### Database Migration

```bash
# Backup before migration
docker exec farm-management-backend node scripts/backup.js

# Run migration
docker exec farm-management-backend node scripts/migrate.js
```

### Health Checks

```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend health
curl http://localhost/

# Database health
docker exec farm-management-backend node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ DB Healthy'))
    .catch(() => console.error('❌ DB Unhealthy'));
"
```

## CI/CD Pipeline

GitHub Actions workflow is configured in `.github/workflows/ci-cd.yml`:

1. **Build** - Compiles TypeScript, builds React
2. **Test** - Runs automated tests
3. **Docker Build** - Creates container images
4. **Deploy** - Deploys to production server

### Required Secrets

Set these in GitHub repository settings:

- `MONGODB_URI_TEST` - Test database connection
- `JWT_SECRET` - JWT signing key
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub access token
- `DEPLOY_HOST` - Production server IP/domain
- `DEPLOY_USER` - SSH username
- `DEPLOY_SSH_KEY` - SSH private key

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review documentation in `/docs`
- Contact: support@farmmanagement.com

## License

Proprietary - All rights reserved
