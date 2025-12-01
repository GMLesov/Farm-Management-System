# Farm Management System - Docker Deployment Guide

## Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- 10GB disk space

## Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd "FARM MANAGEMENT APP"
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your secure values
```

3. **Build and run containers**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

## Production Deployment

### Security Checklist
- [ ] Change all default passwords in `.env`
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Enable monitoring and logging

### SSL/HTTPS Setup
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

### Scaling

Scale backend instances:
```bash
docker-compose up -d --scale backend=3
```

### Monitoring

View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

Check health:
```bash
curl http://localhost:5000/health
```

### Backup & Restore

**Backup MongoDB:**
```bash
docker exec farm-mongodb mongodump --out /backup --authenticationDatabase admin -u admin -p changeme
docker cp farm-mongodb:/backup ./mongodb-backup
```

**Restore MongoDB:**
```bash
docker cp ./mongodb-backup farm-mongodb:/backup
docker exec farm-mongodb mongorestore /backup --authenticationDatabase admin -u admin -p changeme
```

### Performance Tuning

**Increase MongoDB memory:**
```yaml
mongodb:
  command: --wiredTigerCacheSizeGB 2
```

**Configure Nginx workers:**
```nginx
worker_processes auto;
worker_connections 1024;
```

## Troubleshooting

**Container won't start:**
```bash
docker-compose down
docker-compose up -d --force-recreate
```

**Check container status:**
```bash
docker-compose ps
docker-compose logs backend
```

**Reset everything:**
```bash
docker-compose down -v
docker-compose up -d
```

## Maintenance

**Update containers:**
```bash
docker-compose pull
docker-compose up -d
```

**Clean unused resources:**
```bash
docker system prune -a
```

**Database cleanup:**
```bash
docker exec farm-mongodb mongo --eval "db.adminCommand({pruneDataSize: 1})"
```
