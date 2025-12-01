# Farm Management System - Deployment Guide

## 🚀 Quick Deploy (All-in-One)

### Windows
```powershell
.\deploy.ps1
```

### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📋 Manual Deployment Steps

### 1. GitHub Pages (Demo Page)
**Automatic**: Pushes to `main` branch auto-deploy to:
```
https://GMLesov.github.io/farm-management-system/demo.html
```

**Manual Setup**:
1. Go to repo Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / `root`
4. Save

---

### 2. Vercel (Frontend - Web Dashboard)

#### Option A: Vercel CLI
```bash
cd web-dashboard
npm install -g vercel
vercel login
vercel --prod
```

#### Option B: Vercel Dashboard
1. Go to https://vercel.com
2. Import Git Repository
3. Select `farm-management-system`
4. Framework: React
5. Root Directory: `web-dashboard`
6. Environment Variables:
   - `REACT_APP_API_URL`: Your backend URL from Render
   - `REACT_APP_SOCKET_URL`: Your backend WebSocket URL
7. Deploy

**Result**: https://farm-management-system.vercel.app

---

### 3. Netlify (Alternative Frontend Hosting)

#### Option A: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

#### Option B: Netlify Dashboard
1. Go to https://netlify.com
2. Add new site → Import from Git
3. Connect GitHub repo
4. Build command: `cd web-dashboard && npm run build`
5. Publish directory: `web-dashboard/build`
6. Deploy

---

### 4. Render (Backend API)

1. Go to https://render.com
2. Click **New +** → **Blueprint**
3. Connect GitHub repo `farm-management-system`
4. Render will detect `render.yaml` and configure automatically
5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: (auto-generated)
   - `CORS_ORIGIN`: Your frontend URL from Vercel/Netlify
6. Deploy

**Result**: https://farm-management-api.onrender.com

---

### 5. Build Android APK

#### Option A: Local Build
```bash
cd mobile
npm install
cd android
./gradlew assembleRelease  # Linux/Mac
.\gradlew assembleRelease   # Windows
```

**APK Location**: `mobile/android/app/build/outputs/apk/release/app-release.apk`

#### Option B: GitHub Actions (Automatic)
```bash
# Create a tag to trigger APK build
git tag v1.0
git push origin v1.0
```

GitHub Actions will:
1. Build APK automatically
2. Create a GitHub Release
3. Upload APK to release

**Download URL**: 
```
https://github.com/GMLesov/farm-management-system/releases/download/v1.0/app-release.apk
```

---

## 🔗 Update Demo Page Links

After deployment, update `demo.html`:

```html
<!-- Web Dashboard Link -->
<a href="https://your-app.vercel.app" class="btn">Launch Web Demo</a>

<!-- APK Download Link -->
<a href="https://github.com/GMLesov/farm-management-system/releases/download/v1.0/app-release.apk" class="btn" download>Download APK</a>
```

---

## 🌐 Final URLs

After deployment, you'll have:

| Service | URL |
|---------|-----|
| Demo Page | https://GMLesov.github.io/farm-management-system/demo.html |
| Web Dashboard | https://farm-management.vercel.app |
| Backend API | https://farm-api.onrender.com |
| APK Download | https://github.com/GMLesov/farm-management-system/releases |
| GitHub Repo | https://github.com/GMLesov/farm-management-system |

---

## ⚙️ Environment Variables

### Frontend (Vercel/Netlify)
```env
REACT_APP_API_URL=https://farm-api.onrender.com
REACT_APP_SOCKET_URL=wss://farm-api.onrender.com
```

### Backend (Render)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farm
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://farm-management.vercel.app
```

---

## 🐛 Troubleshooting

### Vercel Build Fails
- Check `web-dashboard/package.json` has correct build script
- Ensure `REACT_APP_*` env vars are set

### Render Backend Not Starting
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
- Verify `MONGODB_URI` is correct
- Check logs in Render dashboard

### APK Build Fails
- Ensure Java 17 is installed
- Run `./gradlew clean` first
- Check Android SDK is properly configured

---

## 📦 Deployment Checklist

- [ ] Push code to GitHub
- [ ] Enable GitHub Pages for demo.html
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Deploy backend to Render
- [ ] Update MongoDB Atlas IP whitelist
- [ ] Set environment variables
- [ ] Build Android APK
- [ ] Create GitHub Release with APK
- [ ] Update demo.html with live URLs
- [ ] Test all features in production

---

## 🎉 You're Live!

Share your demo:
- **Demo Page**: https://GMLesov.github.io/farm-management-system/demo.html
- **Live App**: https://farm-management.vercel.app
- **APK**: Share GitHub Release link

Login: admin@farm.com / admin123
