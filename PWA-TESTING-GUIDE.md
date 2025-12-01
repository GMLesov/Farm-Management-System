# PWA Setup & Testing Guide 🚀

## Quick Start

### 1. Start the Application

**Backend**:
```powershell
cd "c:\Users\mugod\My PROJECTS\FARM MANAGEMENT APP\server"
npm run dev
```

**Frontend**:
```powershell
cd "c:\Users\mugod\My PROJECTS\FARM MANAGEMENT APP\web-dashboard"
npm start
```

---

## 🧪 Testing PWA Features

### Service Worker Testing

1. **Check Registration**:
```javascript
// Open DevTools Console
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg ? 'Registered' : 'Not registered');
});
```

2. **Test Offline Mode**:
   - Open app in browser
   - Open DevTools → Application → Service Workers
   - Check "Offline" checkbox
   - Reload page - app should still work!
   - Tasks should load from cache

3. **Cache Inspection**:
   - DevTools → Application → Cache Storage
   - See: `static-v1`, `dynamic-v1`, `api-v1`
   - Click each to see cached resources

---

### Push Notifications Testing

1. **Enable Notifications**:
   - Navigate to Profile tab
   - Toggle "Push Notifications" ON
   - Grant permission when prompted

2. **Test Notification**:
```javascript
// In browser console
if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.ready.then(reg => {
    reg.showNotification('Test', {
      body: 'This is a test notification',
      icon: '/logo192.png'
    });
  });
}
```

3. **Verify Permission**:
```javascript
console.log('Permission:', Notification.permission);
```

---

### IndexedDB Testing

1. **Check Database**:
   - DevTools → Application → IndexedDB
   - Expand "FarmManagementDB"
   - See: tasks, leaves, syncQueue, cache, photos

2. **Inspect Data**:
```javascript
// In console
indexedDB.databases().then(dbs => {
  console.log('Databases:', dbs);
});
```

3. **Test Offline Storage**:
   - Complete a task
   - Go offline
   - Complete another task
   - Check syncQueue in IndexedDB
   - Go online - should auto-sync

---

### Camera Testing

1. **Grant Camera Permission**:
   - Click "Report Concern"
   - Click "Open Camera"
   - Allow camera access

2. **Test Capture**:
   - Video preview should appear
   - Click "Capture Photo"
   - Photo thumbnail appears
   - Check photo uploaded to server

3. **Check Devices**:
```javascript
// List cameras
navigator.mediaDevices.enumerateDevices().then(devices => {
  console.log('Cameras:', devices.filter(d => d.kind === 'videoinput'));
});
```

---

### Microphone Testing

1. **Grant Microphone Permission**:
   - Open task dialog
   - Click microphone icon
   - Allow microphone access

2. **Test Recording**:
   - Recording indicator appears
   - Click again to stop
   - Voice note saved message
   - Check upload to server

3. **Check Devices**:
```javascript
// List microphones
navigator.mediaDevices.enumerateDevices().then(devices => {
  console.log('Microphones:', devices.filter(d => d.kind === 'audioinput'));
});
```

---

## 📱 PWA Installation Testing

### Chrome (Desktop):
1. Open app: `http://localhost:3000`
2. Look for install icon in address bar (⊕)
3. Click "Install Farm Manager"
4. App opens in standalone window
5. Check taskbar - app icon appears

### Chrome (Mobile):
1. Open app in Chrome mobile
2. Menu → "Add to Home screen"
3. Confirm installation
4. App icon on home screen
5. Launch - opens fullscreen

### Edge (Desktop):
1. Open app in Edge
2. Settings (⋯) → Apps → "Install Farm Manager"
3. App installs
4. Pin to Start/Taskbar

---

## 🔍 Debugging

### Service Worker Issues:

**Not Registering**:
```powershell
# Check file exists
Test-Path "web-dashboard\public\service-worker.js"

# Check for errors
# DevTools → Console → Look for SW errors
```

**Not Updating**:
```javascript
// Force update
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update();
});
```

**Clear & Reset**:
```javascript
// Unregister
navigator.serviceWorker.getRegistration().then(reg => {
  reg.unregister();
});

// Clear caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

---

### Push Notification Issues:

**Permission Denied**:
- Reset: Chrome Settings → Privacy → Site Settings → Notifications
- Remove site and retry

**No Token**:
- Check console for Firebase errors
- Verify Firebase config (if using production)

---

### Camera/Microphone Issues:

**Permission Denied**:
- Must use HTTPS (or localhost)
- Check browser settings
- Reset permissions in site settings

**No Devices Found**:
```javascript
navigator.mediaDevices.enumerateDevices().then(devices => {
  console.log('All devices:', devices);
});
```

---

### IndexedDB Issues:

**Not Opening**:
```javascript
// Check quota
navigator.storage.estimate().then(est => {
  console.log('Storage:', est);
});
```

**Clear Database**:
```javascript
indexedDB.deleteDatabase('FarmManagementDB');
```

---

## 📊 Performance Testing

### Lighthouse Audit:
1. DevTools → Lighthouse tab
2. Select "Progressive Web App"
3. Click "Generate report"
4. Should score 90+ in all categories

### Expected Scores:
- **Performance**: 90+
- **PWA**: 100
- **Accessibility**: 90+
- **Best Practices**: 90+
- **SEO**: 90+

---

## 🌐 Network Testing

### Offline Mode:
```powershell
# Simulate offline
DevTools → Network → Offline checkbox
```

**Should Work**:
- ✅ View cached tasks
- ✅ Complete tasks (queued)
- ✅ Navigate all tabs
- ✅ View profile

**Should Queue**:
- ⏳ New API requests
- ⏳ File uploads
- ⏳ Status updates

### Slow 3G:
```powershell
# Simulate slow network
DevTools → Network → Slow 3G
```

**Should Work**:
- ✅ Instant UI from cache
- ✅ Loading indicators for API
- ✅ Progressive image loading

---

## 🔒 Security Testing

### HTTPS Check:
- Localhost: ✅ Works
- Production: ⚠️ Must use HTTPS

### Permissions:
- Camera: Request on use
- Microphone: Request on use
- Notifications: Request on enable
- Location: Request on use

---

## 📝 Production Checklist

### Before Deployment:

- [ ] Update manifest.json with production URLs
- [ ] Configure Firebase (if using push)
- [ ] Set up HTTPS certificate
- [ ] Test on real mobile devices
- [ ] Update service worker scope
- [ ] Set production API URLs
- [ ] Generate production icons (512x512)
- [ ] Test PWA installation on mobile
- [ ] Verify offline functionality
- [ ] Check cache size limits

### Environment Variables:
```bash
REACT_APP_API_URL=https://your-api.com
REACT_APP_FIREBASE_API_KEY=your-key
# ... other Firebase config
```

---

## 🎯 Success Criteria

### PWA Checklist:
- [x] Installable on mobile
- [x] Works offline
- [x] Fast load times (<3s)
- [x] Responsive design
- [x] HTTPS (production)
- [x] Service worker registered
- [x] Manifest configured
- [x] Icons provided

### Feature Checklist:
- [x] Push notifications working
- [x] Camera capture functional
- [x] Voice recording functional
- [x] IndexedDB storing data
- [x] Offline sync working
- [x] Background sync enabled

---

## 💡 Tips

1. **Always test in incognito** - Clean slate each time
2. **Check mobile first** - PWA is mobile-focused
3. **Use real devices** - Emulators can be unreliable
4. **Monitor console** - Watch for errors/warnings
5. **Test offline early** - Don't assume it works

---

## 🆘 Common Issues

### "Service Worker not found":
```powershell
# Check file location
# Must be in: web-dashboard/public/service-worker.js
```

### "Push notifications not working":
- Requires HTTPS in production
- Firebase setup needed for production
- Test notification works immediately

### "Camera not found":
- Check HTTPS (required except localhost)
- Verify device permissions
- Try different browsers

### "IndexedDB quota exceeded":
```javascript
// Check quota
navigator.storage.estimate().then(console.log);
```

---

## 📞 Support

- Documentation: `PWA-FEATURES-COMPLETE.md`
- Testing: This file
- API Reference: `WORKER-APP-COMPLETE.md`

---

**Happy Testing!** 🎉
