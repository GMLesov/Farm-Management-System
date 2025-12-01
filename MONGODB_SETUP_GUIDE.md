# 🗄️ MongoDB Setup Guide - Farm Management Application

## Option 1: MongoDB Atlas (Cloud - Recommended) ☁️

### Why MongoDB Atlas?
- ✅ **Free tier** available (512MB storage)
- ✅ No installation required
- ✅ Automatic backups
- ✅ High availability
- ✅ Easy to scale
- ✅ Built-in monitoring

### Step-by-Step Setup

#### 1. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google account
3. Verify your email address

#### 2. Create a Cluster
1. Click **"Build a Database"** or **"Create"**
2. Choose **FREE** tier (M0 Sandbox)
3. Select cloud provider (AWS recommended)
4. Choose region closest to you (or your users)
5. Cluster Name: `farm-management-cluster`
6. Click **"Create Cluster"** (takes 3-5 minutes)

#### 3. Create Database User
1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `farmadmin` (or your choice)
5. Password: Click **"Autogenerate Secure Password"** and **SAVE IT**
   - Example: `aB3$xYz9Qp2mNvF`
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

#### 4. Configure Network Access
1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, add specific IP addresses only
4. Click **"Confirm"**

#### 5. Get Connection String
1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy the connection string:
   ```
   mongodb+srv://farmadmin:<password>@farm-management-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name after `.net/`: `farm_management`

**Final Connection String Example**:
```
mongodb+srv://farmadmin:aB3$xYz9Qp2mNvF@farm-management-cluster.abc12.mongodb.net/farm_management?retryWrites=true&w=majority
```

#### 6. Update Environment Variables
1. Open your `.env` file in the backend folder
2. Update the `MONGODB_URI`:
   ```bash
   MONGODB_URI=mongodb+srv://farmadmin:YOUR_PASSWORD@farm-management-cluster.xxxxx.mongodb.net/farm_management?retryWrites=true&w=majority
   ```
3. Save the file

#### 7. Test Connection
```bash
cd farm-management-backend
node start-dev.js
```

You should see:
```
info: ✅ Database connected successfully
```

### 🎉 MongoDB Atlas Setup Complete!

---

## Option 2: Local MongoDB Installation 💻

### Windows Installation

#### 1. Download MongoDB
1. Go to https://www.mongodb.com/try/download/community
2. Version: **7.0** (latest)
3. Platform: **Windows x64**
4. Package: **MSI**
5. Click **Download**

#### 2. Install MongoDB
1. Run the `.msi` installer
2. Choose **"Complete"** installation
3. **Install MongoDB as a Service**: ✅ Yes
4. Service Name: `MongoDB`
5. Data Directory: `C:\Program Files\MongoDB\Server\7.0\data`
6. Log Directory: `C:\Program Files\MongoDB\Server\7.0\log`
7. Install **MongoDB Compass** (GUI tool): ✅ Yes
8. Click **Install**

#### 3. Verify Installation
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# Should show: Status "Running"
```

#### 4. Test MongoDB
```powershell
# Connect using MongoDB Shell
mongosh

# You should see:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://127.0.0.1:27017/
# Using MongoDB: 7.0.x
```

#### 5. Create Database and User
```javascript
// In mongosh:

// Switch to farm_management database
use farm_management

// Create admin user
db.createUser({
  user: "farmadmin",
  pwd: "SecurePassword123!",
  roles: [
    { role: "readWrite", db: "farm_management" }
  ]
})

// Exit mongosh
exit
```

#### 6. Update Environment Variables
```bash
# For local MongoDB (no authentication)
MONGODB_URI=mongodb://localhost:27017/farm_management

# Or with authentication
MONGODB_URI=mongodb://farmadmin:SecurePassword123!@localhost:27017/farm_management
```

#### 7. Test Connection
```bash
cd farm-management-backend
node start-dev.js
```

### MongoDB Compass (GUI)
1. Open MongoDB Compass
2. Connection String: `mongodb://localhost:27017`
3. Click **Connect**
4. Explore your `farm_management` database visually

---

## Option 3: Docker MongoDB 🐳

### Quick Start with Docker Compose

#### 1. Start MongoDB Container
```bash
cd farm-management-backend
docker-compose up -d mongodb
```

This starts MongoDB from the existing `docker-compose.yml` file.

#### 2. Check Container Status
```bash
docker-compose ps
```

#### 3. Update Environment Variables
```bash
MONGODB_URI=mongodb://admin:secure-password-change-me@localhost:27017/farm_management?authSource=admin
```

#### 4. Test Connection
```bash
node start-dev.js
```

---

## Verify Database Connection

### Method 1: Check Backend Logs
```bash
cd farm-management-backend
node start-dev.js
```

Look for:
```
✅ Database connected successfully
```

### Method 2: Test with Curl
```bash
# Wait for server to start, then:
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "2025-11-11T...",
  "environment": "development",
  "database": "connected"
}
```

### Method 3: Using MongoDB Compass
1. Open MongoDB Compass
2. Connect to your database
3. You should see collections appear as you use the app:
   - `users`
   - `notifications`
   - `animals`
   - `crops`
   - `equipment`
   - etc.

---

## Common Issues & Solutions

### Issue 1: "connect ECONNREFUSED 127.0.0.1:27017"
**Solution**: MongoDB is not running
```bash
# Windows - Start MongoDB service
net start MongoDB

# Or check service status
Get-Service MongoDB
```

### Issue 2: "Authentication failed"
**Solution**: Check username/password in connection string
- Ensure password has no special characters that need URL encoding
- Or URL-encode special characters: `@` → `%40`, `#` → `%23`, etc.

### Issue 3: "IP not whitelisted" (MongoDB Atlas)
**Solution**: Add your IP address in Network Access
1. Go to MongoDB Atlas → Network Access
2. Add your current IP or use 0.0.0.0/0 for development

### Issue 4: Connection string format error
**Correct Format**:
```
mongodb+srv://username:password@cluster.mongodb.net/database?options
```

**Common Mistakes**:
- Missing database name
- Wrong password (has `<` `>` brackets)
- Missing `?retryWrites=true&w=majority`

---

## Database Seeding (Optional)

### Seed Sample Data
```bash
cd farm-management-backend
npm run seed
```

This will create:
- Sample users
- Demo farm data
- Test animals, crops, equipment
- Sample notifications

### Clear Database
```bash
# Using mongosh
mongosh "your-connection-string"
use farm_management
db.dropDatabase()
```

---

## Database Backup

### MongoDB Atlas
- Automatic backups included in free tier
- Manual backup: **Database → Cluster → ... → Download Backup**

### Local MongoDB
```bash
# Backup
mongodump --uri="mongodb://localhost:27017/farm_management" --out=./backup

# Restore
mongorestore --uri="mongodb://localhost:27017/farm_management" ./backup/farm_management
```

### Using npm script
```bash
npm run backup
```

---

## MongoDB Monitoring

### MongoDB Atlas
- Built-in monitoring dashboard
- Real-time metrics
- Query performance insights
- Alerts and notifications

### Local MongoDB
```bash
# Check database status
mongosh
use farm_management
db.stats()

# Check collections
show collections

# Check collection size
db.users.stats()
```

### MongoDB Compass
- Visual query builder
- Performance metrics
- Index optimization suggestions
- Schema analyzer

---

## Production Recommendations

### Security
- ✅ Use strong passwords (20+ characters)
- ✅ Enable authentication
- ✅ Whitelist specific IP addresses only
- ✅ Use connection string encryption
- ✅ Enable SSL/TLS
- ✅ Regular security updates

### Performance
- ✅ Create proper indexes (already done in models)
- ✅ Enable connection pooling
- ✅ Use projection to limit returned fields
- ✅ Monitor slow queries
- ✅ Set up read replicas for scaling

### Backup Strategy
- ✅ Enable automatic backups (Atlas)
- ✅ Schedule regular manual backups
- ✅ Test restore procedures
- ✅ Store backups in multiple locations
- ✅ Keep backups for 30+ days

---

## Cost Comparison

### MongoDB Atlas
- **Free (M0)**: 512MB storage, shared CPU, perfect for development
- **M10**: $0.08/hour (~$57/month), 10GB storage, dedicated cluster
- **M30**: $0.54/hour (~$277/month), 40GB storage, production-ready

### Local MongoDB
- **Free**: Unlimited storage (limited by disk)
- **Requires**: Your own server, maintenance, backups
- **Best for**: Development, small projects

### MongoDB Atlas Recommendation
✅ **Start with Free tier** for development and small production
✅ **Upgrade to M10** when you have consistent users
✅ **M30 or higher** for high-traffic production apps

---

## Next Steps After Setup

1. ✅ **Test Connection** - Verify database is accessible
2. ✅ **Run Seed Script** - Populate with sample data
3. ✅ **Test API Endpoints** - Create user, add data
4. ✅ **Monitor Performance** - Watch query times
5. ✅ **Set Up Backups** - Enable automatic backups
6. ⏭️ **Move to Task #3** - Configure Redis for caching

---

## Quick Command Reference

```bash
# Start backend with MongoDB
cd farm-management-backend
node start-dev.js

# Test connection
curl http://localhost:3000/health

# Seed database
npm run seed

# Backup database
npm run backup

# Connect with mongosh
mongosh "your-connection-string"

# View database
use farm_management
show collections
db.users.find().pretty()
```

---

## Support Resources

### Documentation
- MongoDB Atlas: https://docs.atlas.mongodb.com/
- MongoDB Node Driver: https://docs.mongodb.com/drivers/node/
- Mongoose ODM: https://mongoosejs.com/docs/

### Community
- MongoDB Community Forums: https://community.mongodb.com/
- Stack Overflow: [mongodb] tag

### Tools
- MongoDB Compass: Visual database explorer
- MongoDB Atlas CLI: Command-line management
- Studio 3T: Advanced GUI tool

---

**Ready to proceed?** Once MongoDB is set up, we can move to Redis configuration! 🚀

*Last Updated: November 11, 2025*
