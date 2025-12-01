# 🚀 Quick Deployment Reference

## ✅ Completed Automatically
- ✅ Code pushed to GitHub
- ✅ Deployment configs created
- ✅ Release tag v1.1 created
- ✅ GitHub Actions building APK
- ✅ demo.html updated with correct links

---

## 📋 Manual Steps Required (5-10 minutes)

### Step 1: Enable GitHub Pages (2 minutes)
**URL**: https://github.com/GMLesov/Farm-Management-System/settings/pages

**Instructions**:
1. Source: Select "Deploy from a branch"
2. Branch: Select "main"
3. Folder: Select "/ (root)"
4. Click "Save"

**Result**: Demo page will be live at:
```
https://gmlesov.github.io/Farm-Management-System/demo.html
```

---

### Step 2: Deploy Frontend to Vercel (3 minutes)
**URL**: https://vercel.com/new

**Instructions**:
1. Click "Add New" → "Project"
2. Import Git Repository
3. Select: `GMLesov/Farm-Management-System`
4. Configure:
   - Framework Preset: **Create React App**
   - Root Directory: **web-dashboard**
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Click "Deploy"

**Environment Variables** (Add after first deploy):
```
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_SOCKET_URL=wss://your-backend.onrender.com
```

**Result**: Web app will be live at:
```
https://farm-management-system-xxx.vercel.app
```

---

### Step 3: Deploy Backend to Render (3 minutes)
**URL**: https://dashboard.render.com/blueprints

**Instructions**:
1. Click "New Blueprint Instance"
2. Connect to GitHub
3. Select: `GMLesov/Farm-Management-System`
4. Render will auto-detect `render.yaml`
5. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farm
   JWT_SECRET=your-secret-key-min-32-chars
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
6. Click "Apply"

**Result**: API will be live at:
```
https://farm-management-api.onrender.com
```

---

### Step 4: Check APK Build Status (Auto)
**URL**: https://github.com/GMLesov/Farm-Management-System/actions

**Status**: GitHub Actions is building the APK automatically

**When complete**, download from:
```
https://github.com/GMLesov/Farm-Management-System/releases/tag/v1.1
```

---

## 🔗 Final URLs (After Deployment)

| Service | URL | Status |
|---------|-----|--------|
| **GitHub Repo** | https://github.com/GMLesov/Farm-Management-System | ✅ Live |
| **Demo Page** | https://gmlesov.github.io/Farm-Management-System/demo.html | ⏳ Pending |
| **Web Dashboard** | https://farm-management-xxx.vercel.app | ⏳ Pending |
| **Backend API** | https://farm-management-api.onrender.com | ⏳ Pending |
| **APK Download** | https://github.com/GMLesov/Farm-Management-System/releases | 🔄 Building |

---

## 📱 Update Demo Page After Deployment

Once you have your live URLs, update `demo.html`:

```html
<!-- Web Dashboard Link -->
<a href="https://your-actual-vercel-url.vercel.app" class="btn">Launch Web Demo</a>
```

Then commit and push:
```bash
git add demo.html
git commit -m "Update demo.html with live URLs"
git push origin main
```

---

## 🎯 Testing Checklist

After all deployments:

- [ ] Visit GitHub Pages demo page
- [ ] Click "Launch Web Demo" button
- [ ] Log in with: admin@farm.com / admin123
- [ ] Test navigation between dashboards
- [ ] Check API connectivity (data loads)
- [ ] Download APK from releases
- [ ] Install APK on Android device
- [ ] Test mobile app login

---

## 🆘 Troubleshooting

**GitHub Pages not working?**
- Wait 2-3 minutes after enabling
- Check Settings → Pages shows green checkmark

**Vercel build failing?**
- Ensure Root Directory is `web-dashboard`
- Check build logs for errors

**Render backend not starting?**
- Verify MongoDB URI is correct
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
- Review Render logs

**APK build failing?**
- Check GitHub Actions logs
- May need to configure signing keys for release builds

---

## 📞 Support

- **Documentation**: [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)
- **Issues**: https://github.com/GMLesov/Farm-Management-System/issues

---

**Total Setup Time**: ~10 minutes
**Cost**: $0 (All free tiers)

🎉 **You're almost there!**
