# Backend Deployment to Render

## Quick Deploy Steps

### 1. In Render Dashboard:

**Create New Web Service:**
- Click "New +" → "Web Service"
- Connect GitHub repository: `GMLesov/farm-management-system`
- **Root Directory**: `server` (IMPORTANT!)

**Build & Deploy Settings:**
- **Name**: `farm-management-backend`
- **Region**: Oregon (US West)
- **Branch**: `main`
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free

### 2. Environment Variables (Add these in Render):

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://farmadmin:maranatha%402018@cluster0.674o7z7.mongodb.net/farm-management?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=farm-mgmt-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRE=7d
ADMIN_DEFAULT_EMAIL=admin@farm.com
ADMIN_DEFAULT_PASSWORD=password123
WORKER_DEFAULT_PASSWORD=Farm@2024
```

### 3. After Deployment:

Your backend URL will be: `https://farm-management-backend.onrender.com`

### 4. Update Frontend (Vercel):

Go to Vercel → Project Settings → Environment Variables:
- Update `REACT_APP_API_URL` to: `https://farm-management-backend.onrender.com/api`
- Redeploy the frontend

---

## Troubleshooting

### If you see "Cannot find module '/app/dist/server.js'":

This means Render is looking for the wrong file. Fix:
1. In Render Dashboard → Service Settings → Build & Deploy
2. Change **Start Command** to: `node dist/index.js`
3. Manually deploy again

### If build fails:

1. Check Root Directory is set to `server`
2. Verify Build Command is: `npm install && npm run build`
3. Check logs for TypeScript errors

### If app crashes after deployment:

1. Check Environment Variables are all set
2. Verify MONGODB_URI is correct
3. Check Runtime Logs in Render Dashboard

---

## Testing the Deployment

Once deployed, test these endpoints:

```bash
# Health check
curl https://your-app.onrender.com/api/health

# Login test
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@farm.com","password":"password123"}'
```

---

## Important Notes

- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Logs are available in Render Dashboard
- Auto-deploys on push to main branch

