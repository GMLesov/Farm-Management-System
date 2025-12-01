# 🚀 Production Deployment Guide

## Quick Deploy Options

### Option 1: Docker Deployment (Recommended)

#### Prerequisites
- Docker and Docker Compose installed
- Domain name configured
- SSL certificates (use Let's Encrypt)

#### Steps
```bash
# 1. Clone the repository
git clone <your-repo-url>
cd farm-management-backend

# 2. Create production environment file
cp .env.production.example .env.production
# Edit .env.production with your values

# 3. Build and start services
docker-compose up -d

# 4. Check logs
docker-compose logs -f api

# 5. Access health check
curl http://localhost:3000/health
```

### Option 2: PM2 Deployment

#### Prerequisites
- Node.js 18+ installed
- MongoDB running
- Redis running (optional but recommended)

#### Steps
```bash
# 1. Install dependencies
npm install

# 2. Build TypeScript
npm run build

# 3. Install PM2 globally
npm install -g pm2

# 4. Start with PM2
pm2 start ecosystem.config.js --env production

# 5. Save PM2 configuration
pm2 save
pm2 startup

# 6. Monitor
pm2 monit
```

### Option 3: Cloud Platforms

#### Heroku
```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
heroku create farm-management-api

# 4. Add MongoDB addon
heroku addons:create mongolab:sandbox

# 5. Add Redis addon
heroku addons:create heroku-redis:hobby-dev

# 6. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# 7. Deploy
git push heroku main

# 8. Scale
heroku ps:scale web=1
```

#### AWS Elastic Beanstalk
```bash
# 1. Install EB CLI
pip install awsebcli

# 2. Initialize
eb init -p node.js farm-management-api

# 3. Create environment
eb create production-env

# 4. Deploy
eb deploy

# 5. Open in browser
eb open
```

#### DigitalOcean App Platform
1. Connect your GitHub repository
2. Select branch (main)
3. Configure build command: `npm run build`
4. Configure run command: `npm start`
5. Add environment variables
6. Deploy

## Environment Configuration

### Required Environment Variables
```bash
# Core
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=<your-mongodb-connection-string>

# Redis (optional but recommended)
REDIS_HOST=<your-redis-host>
REDIS_PORT=6379
REDIS_PASSWORD=<your-redis-password>

# Security
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# External APIs
WEATHER_API_KEY=<your-openweathermap-key>
```

## Database Setup

### MongoDB Atlas (Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for development)
5. Get connection string
6. Replace in MONGODB_URI

### Redis Cloud (Recommended)
1. Go to https://redis.com/try-free/
2. Create free database
3. Get connection details
4. Update REDIS_* variables

## SSL/HTTPS Configuration

### Using Let's Encrypt (Free)
```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d api.your-domain.com

# Certificates will be at:
# /etc/letsencrypt/live/api.your-domain.com/fullchain.pem
# /etc/letsencrypt/live/api.your-domain.com/privkey.pem
```

### Using Nginx
```nginx
server {
    listen 80;
    server_name api.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Performance Optimization

### 1. Enable Compression
Already configured in Express middleware

### 2. Enable Caching
Redis automatically caches frequently accessed data

### 3. Database Indexing
All models have optimized indexes

### 4. Rate Limiting
Configured to prevent abuse

### 5. PM2 Cluster Mode
Uses all CPU cores for maximum performance

## Monitoring

### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# Logs
pm2 logs

# Status
pm2 status

# Restart
pm2 restart farm-api
```

### Health Check Endpoint
```bash
curl https://api.your-domain.com/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-11T19:00:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "uptime": 3600
}
```

## Backup Strategy

### MongoDB Backups
```bash
# Create backup
npm run backup

# Automated backups (add to crontab)
0 2 * * * cd /path/to/app && npm run backup
```

### File Uploads Backup
```bash
# Sync to S3
aws s3 sync ./uploads s3://your-bucket/backups/$(date +%Y%m%d)/

# Or use rsync
rsync -avz ./uploads/ backup-server:/backups/uploads/
```

## Security Checklist

- [ ] Changed all default passwords
- [ ] JWT secrets are strong and unique
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Helmet middleware active
- [ ] HTTPS/SSL configured
- [ ] Database connection uses authentication
- [ ] Environment variables secured
- [ ] File upload restrictions configured
- [ ] MongoDB IP whitelist configured
- [ ] Regular security updates applied

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

### MongoDB Connection Issues
- Check connection string format
- Verify IP whitelist
- Check database user permissions
- Test connection: `mongosh "your-connection-string"`

### Redis Connection Issues
- Verify Redis is running: `redis-cli ping`
- Check password configuration
- Verify port accessibility

### Application Not Starting
```bash
# Check logs
pm2 logs farm-api --lines 100

# Or Docker logs
docker-compose logs -f api

# Check Node version
node --version  # Should be 18+
```

## Scaling

### Horizontal Scaling
1. Use PM2 cluster mode (automatic)
2. Deploy multiple instances behind load balancer
3. Use sticky sessions for Socket.IO

### Vertical Scaling
```javascript
// ecosystem.config.js
node_args: '--max-old-space-size=4096'  // Increase memory
```

### Database Scaling
- Enable MongoDB replica sets
- Use Redis cluster for high availability
- Implement database sharding for large datasets

## Cost Estimates

### Free Tier (Development/Testing)
- MongoDB Atlas: Free (512MB)
- Redis Cloud: Free (30MB)
- Heroku: Free (with limitations)
- **Total: $0/month**

### Production (Small)
- MongoDB Atlas M10: $57/month
- Redis Cloud: $7/month
- DigitalOcean Droplet 2GB: $12/month
- Domain + SSL: $15/year
- **Total: ~$76/month**

### Production (Medium)
- MongoDB Atlas M30: $277/month
- Redis Cloud 5GB: $40/month
- DigitalOcean Droplet 4GB: $24/month
- **Total: ~$341/month**

## Support

For deployment issues:
1. Check logs first
2. Review documentation
3. Check GitHub issues
4. Contact support

---

**Last Updated**: November 11, 2025
