# Firebase Configuration Setup

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `farm-management-app`
4. Enable Google Analytics (optional)
5. Select or create a Google Analytics account

## 2. Add Android App

1. Click "Add app" and select Android
2. Android package name: `com.farmmanagementapp`
3. App nickname: `Farm Management App`
4. Debug signing certificate SHA-1: (optional for now)
5. Download `google-services.json` file
6. Place it in `android/app/` directory

## 3. Configure Firebase Services

### Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider

### Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Start in test mode (we'll add security rules later)
4. Choose a location (preferably closest to your users)

### Storage
1. Go to "Storage"
2. Click "Get started"
3. Start in test mode
4. Choose same location as Firestore

### Cloud Messaging
1. Go to "Cloud Messaging"
2. No additional setup needed for now

## 4. Update Firebase Configuration

Replace the configuration in `src/services/firebase.ts` with your project's config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
};
```

## 5. Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Farm data accessible by members
    match /farms/{farmId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid in resource.data.managersIds || 
         request.auth.uid in resource.data.workersIds);
    }
    
    // Animals, crops, tasks accessible by farm members
    match /{collection}/{document} {
      allow read, write: if request.auth != null && 
        collection in ['animals', 'crops', 'tasks', 'expenses', 'revenue'] &&
        exists(/databases/$(database)/documents/farms/$(resource.data.farmId)) &&
        (request.auth.uid in get(/databases/$(database)/documents/farms/$(resource.data.farmId)).data.managersIds ||
         request.auth.uid in get(/databases/$(database)/documents/farms/$(resource.data.farmId)).data.workersIds);
    }
    
    // Notifications accessible by recipient
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /farms/{farmId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 6. Install Firebase CLI (Optional for Cloud Functions)

```bash
npm install -g firebase-tools
firebase login
firebase init
```

## 7. Environment Variables

Create a `.env` file in the root directory:

```
FIREBASE_API_KEY=your-api-key-here
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

## 8. Test the Setup

1. Start the development server
2. Try creating an account
3. Verify data is being saved to Firestore
4. Test offline functionality

## Next Steps

- [ ] Set up Cloud Functions for automated notifications
- [ ] Configure push notifications
- [ ] Set up analytics
- [ ] Deploy security rules
- [ ] Set up CI/CD pipeline