# 🔥 Firebase Setup Guide - Farm Management App

Complete guide to set up Firebase for push notifications, real-time sync, and mobile integration.

---

## 📋 Prerequisites

- Google account
- Firebase console access
- Farm Management App backend running

---

## 🚀 Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
```
https://console.firebase.google.com/
```

### 1.2 Create New Project
1. Click **"Add project"** or **"Create a project"**
2. **Project name**: `farm-management-app`
3. Click **"Continue"**

### 1.3 Google Analytics (Optional)
- You can enable or disable Google Analytics
- **Recommended**: Disable for now (simpler setup)
- Click **"Create project"**

⏳ Wait 30-60 seconds for project creation...

---

## 📱 Step 2: Register Your Apps

### 2.1 Add Web App
1. Click the **web icon** (`</>`) to add a web app
2. **App nickname**: `Farm Management Web Dashboard`
3. ✅ Check **"Also set up Firebase Hosting"** (optional)
4. Click **"Register app"**
5. **Copy the Firebase config** (you'll need this!)

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "farm-management-app.firebaseapp.com",
  projectId: "farm-management-app",
  storageBucket: "farm-management-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. Click **"Continue to console"**

### 2.2 Add Android App (Optional - for mobile)
1. Click **Android icon** to add Android app
2. **Android package name**: `com.farmmanagement.app`
3. Download `google-services.json`
4. Click **"Continue"** → **"Continue"** → **"Continue to console"**

### 2.3 Add iOS App (Optional - for mobile)
1. Click **iOS icon** to add iOS app
2. **iOS bundle ID**: `com.farmmanagement.app`
3. Download `GoogleService-Info.plist`
4. Click **"Continue"** → **"Continue"** → **"Continue to console"**

---

## 🔔 Step 3: Enable Cloud Messaging (Push Notifications)

### 3.1 Navigate to Cloud Messaging
1. In Firebase console, click **"Build"** in left sidebar
2. Click **"Cloud Messaging"**

### 3.2 Get Server Key
1. Click on the **⚙️ (Settings gear icon)** → **"Project settings"**
2. Go to **"Cloud Messaging"** tab
3. Under **"Cloud Messaging API (Legacy)"**:
   - If disabled: Click **"Enable"** (may need to enable in Google Cloud Console)
4. **Copy the "Server key"** - you'll need this for backend!

### 3.3 Get Sender ID
- Still in Cloud Messaging tab
- **Copy "Sender ID"** (also visible as `messagingSenderId` in config)

---

## 🔐 Step 4: Generate Service Account Key

### 4.1 Create Service Account
1. Go to **"Project settings"** (⚙️ icon)
2. Click **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** in the popup
5. A JSON file will download (e.g., `farm-management-app-firebase-adminsdk-xxxxx.json`)

### 4.2 Save the JSON file
```bash
# Save it in your backend directory (DON'T commit to git!)
farm-management-backend/
  └── firebase-service-account.json
```

⚠️ **IMPORTANT**: Add to `.gitignore`:
```
firebase-service-account.json
```

---

## 🔥 Step 5: Enable Firestore (Real-time Database)

### 5.1 Create Firestore Database
1. Click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. **Choose mode**:
   - 🟢 **Start in test mode** (for development)
   - 🔒 Start in production mode (for production)
4. **Select location**: Choose closest to your users
   - Example: `us-central1` or `europe-west1`
5. Click **"Enable"**

### 5.2 Set Security Rules (Important!)

For **Development** (test mode):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

For **Production** (secure):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /farms/{farmId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /notifications/{notificationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## ⚙️ Step 6: Configure Your Backend

### 6.1 Update `.env` file

Add these Firebase configuration variables:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=farm-management-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@farm-management-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://farm-management-app-default-rtdb.firebaseio.com
FIREBASE_STORAGE_BUCKET=farm-management-app.appspot.com

# Or use service account file path (easier)
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

**To extract from service account JSON:**
```bash
# Open the downloaded firebase-service-account.json
# Copy these values:
# - project_id → FIREBASE_PROJECT_ID
# - client_email → FIREBASE_CLIENT_EMAIL
# - private_key → FIREBASE_PRIVATE_KEY (keep the \n characters!)
```

### 6.2 Verify Firebase Config

Test that backend can connect:
```bash
cd farm-management-backend
node -e "const admin = require('firebase-admin'); const serviceAccount = require('./firebase-service-account.json'); admin.initializeApp({ credential: admin.credential.cert(serviceAccount) }); console.log('✅ Firebase initialized!');"
```

---

## 🌐 Step 7: Configure Frontend

### 7.1 Update Web Dashboard `.env`

Create/update `web-dashboard/.env`:

```env
# Firebase Web Configuration
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=farm-management-app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=farm-management-app
REACT_APP_FIREBASE_STORAGE_BUCKET=farm-management-app.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
REACT_APP_FIREBASE_VAPID_KEY=BN...  # For push notifications
```

### 7.2 Get VAPID Key for Push Notifications

1. Go to **Project settings** → **Cloud Messaging**
2. Scroll to **"Web configuration"**
3. Under **"Web Push certificates"**:
   - If no key exists: Click **"Generate key pair"**
4. **Copy the key** → This is your `REACT_APP_FIREBASE_VAPID_KEY`

---

## 🧪 Step 8: Test Firebase Connection

### 8.1 Test Backend Connection
```bash
cd farm-management-backend
npm run test:firebase  # Or create this test script
```

### 8.2 Test Frontend Connection
```bash
cd web-dashboard
npm start
# Open browser console
# Should see: "Firebase initialized successfully"
```

### 8.3 Send Test Notification

Using backend API:
```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Notification",
    "message": "Firebase is working!",
    "type": "info"
  }'
```

---

## 📲 Step 9: Mobile App Configuration (React Native)

### 9.1 Android Setup

1. Copy `google-services.json` to:
   ```
   FarmManagementApp/android/app/google-services.json
   ```

2. Update `android/build.gradle`:
   ```gradle
   dependencies {
       classpath 'com.google.gms:google-services:4.3.15'
   }
   ```

3. Update `android/app/build.gradle`:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

### 9.2 iOS Setup

1. Open Xcode workspace: `FarmManagementApp/ios/FarmManagementApp.xcworkspace`
2. Drag `GoogleService-Info.plist` into project
3. Add to **Targets** → Select your app → Check **"Copy items if needed"**

### 9.3 Install React Native Firebase

```bash
cd FarmManagementApp
npm install @react-native-firebase/app @react-native-firebase/messaging
cd ios && pod install && cd ..
```

---

## ✅ Step 10: Verify Everything Works

### Checklist:

- [ ] Firebase project created
- [ ] Web app registered
- [ ] Cloud Messaging enabled
- [ ] Service account key downloaded
- [ ] Firestore database created
- [ ] Backend `.env` configured
- [ ] Frontend `.env` configured
- [ ] Backend can connect to Firebase
- [ ] Frontend can connect to Firebase
- [ ] Test notification sent successfully

---

## 🎯 Features Now Enabled

### Push Notifications
- ✅ Real-time alerts for irrigation issues
- ✅ Animal health reminders
- ✅ Weather warnings
- ✅ Task assignments
- ✅ Equipment maintenance alerts

### Real-time Sync
- ✅ Live data updates across devices
- ✅ Multi-user collaboration
- ✅ Offline support
- ✅ Automatic conflict resolution

### File Storage
- ✅ Animal photos
- ✅ Crop images
- ✅ Document uploads
- ✅ Report PDFs

---

## 🐛 Troubleshooting

### "Firebase Admin SDK not initialized"
```bash
# Check service account path in .env
# Verify JSON file exists and is valid
```

### "Permission denied" errors
```bash
# Update Firestore security rules
# Check user authentication
```

### Push notifications not working
```bash
# Verify VAPID key is correct
# Check browser notification permissions
# Ensure service worker is registered
```

### "Invalid API key"
```bash
# Double-check all config values
# Ensure no extra spaces or quotes
# Regenerate keys if necessary
```

---

## 📚 Next Steps

1. **Test push notifications** in your app
2. **Enable Firebase Analytics** for insights
3. **Set up Firebase Performance Monitoring**
4. **Configure Firebase Crashlytics** for error tracking
5. **Set up Firebase Remote Config** for feature flags

---

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Cloud Messaging Guide](https://firebase.google.com/docs/cloud-messaging)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [React Native Firebase](https://rnfirebase.io/)

---

**Need help?** Check the Firebase console logs or backend terminal for detailed error messages!
