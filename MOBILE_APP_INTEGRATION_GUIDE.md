# 📱 Mobile App Integration - Complete Guide

## Overview

The Farm Management mobile app has been integrated with the new backend notification system and enhanced with offline-first capabilities, camera integration, GPS tracking, and real-time synchronization.

## 🎯 Key Features Implemented

### 1. **Backend Notification Integration**
- **File**: `src/services/NotificationAPIService.ts`
- **Features**:
  - Full integration with backend `/api/notifications` endpoints
  - Offline queue for notification actions (mark as read, archive)
  - Local caching of notifications for offline access
  - Push notification support with priority-based channels
  - Automatic sync when connection restored
  - Support for 11 notification types and 4 priority levels

### 2. **Camera & Photo Capture**
- **File**: `src/screens/MobileAnimalManagementScreen.tsx`
- **Features**:
  - Native camera integration using `react-native-image-picker`
  - Automatic GPS tagging of photos
  - Offline photo storage with sync queue
  - Photo upload to backend when online
  - Visual indicators for sync status

### 3. **GPS & Location Services**
- **Features**:
  - Real-time location tracking for animals
  - GPS coordinates stored with each photo
  - Location-based farm mapping
  - Offline location caching

### 4. **Offline-First Architecture**
- **Features**:
  - AsyncStorage for local data persistence
  - Automatic offline detection
  - Queue-based sync system
  - Optimistic UI updates
  - Conflict resolution on sync
  - Network status monitoring

## 📦 Required Dependencies

Add these to the existing `FarmManagementApp/package.json`:

\`\`\`json
{
  "dependencies": {
    "@react-native-community/geolocation": "^3.0.6",
    "axios": "^1.6.2"
  }
}
\`\`\`

### Installation Commands

\`\`\`bash
# Navigate to React Native app
cd FarmManagementApp

# Install dependencies
npm install @react-native-community/geolocation axios

# iOS specific (if building for iOS)
cd ios && pod install && cd ..

# Android permissions are already configured
\`\`\`

## 🔧 Configuration Required

### 1. Android Permissions

Add to `android/app/src/main/AndroidManifest.xml`:

\`\`\`xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
\`\`\`

### 2. iOS Permissions

Add to `ios/FarmManagementApp/Info.plist`:

\`\`\`xml
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to capture animal photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library to save animal photos</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to tag photos with GPS coordinates</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>We need your location to track farm activities</string>
\`\`\`

### 3. API Configuration

Update `src/services/NotificationAPIService.ts`:

\`\`\`typescript
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api'  // Android emulator
  // OR 'http://localhost:3000/api'  // iOS simulator
  : 'https://your-production-api.com/api';
\`\`\`

## 🚀 Usage Examples

### Notification Service

\`\`\`typescript
import NotificationAPIService from './services/NotificationAPIService';

// Get notifications
const notifications = await NotificationAPIService.getNotifications({
  unreadOnly: true,
  limit: 50,
});

// Mark as read
await NotificationAPIService.markAsRead(notificationId);

// Show local notification
NotificationAPIService.showLocalNotification(notification);
\`\`\`

### Mobile Animal Management

\`\`\`typescript
import { MobileAnimalManagementScreen } from './screens/MobileAnimalManagementScreen';

// Use in navigation
<Stack.Screen 
  name="AnimalManagement" 
  component={MobileAnimalManagementScreen} 
/>
\`\`\`

## 🔄 Offline Sync Flow

### 1. **Data Creation (Offline)**
\`\`\`
User Action → Local Storage → Queue for Sync → Continue Working
\`\`\`

### 2. **Connection Restored**
\`\`\`
Network Online → Process Queue → Sync to Backend → Update Local IDs → Refresh UI
\`\`\`

### 3. **Photo Upload**
\`\`\`
Capture Photo → Add GPS → Save Locally → Queue Upload → Sync When Online → Mark Synced
\`\`\`

## 📊 Sync Status Indicators

- **✓ Synced** (Green): Data successfully synced with backend
- **⟳ Pending** (Orange): Data waiting to be synced
- **● Online** (Green): Connected to backend
- **○ Offline** (Red): Working offline, data queued

## 🔐 Security Considerations

1. **Authentication**: All API calls include bearer token from AsyncStorage
2. **Data Encryption**: Sensitive data should be encrypted in AsyncStorage
3. **Photo Privacy**: Photos stored locally until explicitly synced
4. **Location Privacy**: GPS coordinates only captured with user permission

## 📱 Testing Guide

### Test Offline Functionality

\`\`\`bash
# 1. Start the app with internet ON
npm run android  # or npm run ios

# 2. Create some animals and photos
# 3. Turn OFF WiFi/Data on device
# 4. Continue creating animals and taking photos
# 5. Observe "Pending" sync indicators
# 6. Turn ON WiFi/Data
# 7. Watch automatic sync happen
\`\`\`

### Test Notifications

\`\`\`bash
# 1. Ensure backend is running on localhost:3000
# 2. Create notifications via backend API or web dashboard
# 3. Open mobile app
# 4. Pull to refresh notifications
# 5. Test mark as read, archive
# 6. Test offline notification actions
\`\`\`

## 🎨 UI Components

### Notification Center (To be created)

Create `src/components/MobileNotificationCenter.tsx`:

\`\`\`typescript
import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import NotificationAPIService from '../services/NotificationAPIService';

export const MobileNotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    // Poll every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    const result = await NotificationAPIService.getNotifications({
      limit: 50,
    });
    setNotifications(result.data);
    
    const count = await NotificationAPIService.getUnreadCount();
    setUnreadCount(count);
  };

  return (
    <View>
      <Text>Unread: {unreadCount}</Text>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleNotificationTap(item)}>
            <Text>{item.title}</Text>
            <Text>{item.message}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
\`\`\`

## 🐛 Troubleshooting

### Common Issues

1. **Camera not working**
   - Check permissions in device settings
   - Verify AndroidManifest.xml/Info.plist entries
   - Ensure app is built with correct permissions

2. **GPS not accurate**
   - Enable high accuracy mode in device settings
   - Test in open area (not indoors)
   - Check location permissions

3. **Sync not happening**
   - Verify backend URL is correct
   - Check network connectivity
   - Review AsyncStorage for queued items
   - Check auth token validity

4. **Photos not uploading**
   - Verify file permissions
   - Check multipart/form-data headers
   - Ensure backend accepts file uploads
   - Review backend file size limits

## 📈 Performance Optimization

### Already Implemented

- ✅ Image compression before upload (quality: 0.8)
- ✅ Lazy loading of images
- ✅ AsyncStorage for fast local access
- ✅ Efficient FlatList rendering
- ✅ Network status caching

### Recommended Additions

- [ ] Image thumbnail generation
- [ ] Background sync service
- [ ] SQLite for larger datasets
- [ ] Image CDN integration
- [ ] Progressive photo upload

## 🔄 Next Steps

1. **Install dependencies**:
   \`\`\`bash
   npm install @react-native-community/geolocation axios
   \`\`\`

2. **Add permissions** to AndroidManifest.xml and Info.plist

3. **Update API base URL** in NotificationAPIService.ts

4. **Test on physical device** for camera and GPS features

5. **Integrate MobileNotificationCenter** into main navigation

6. **Add similar screens** for:
   - Crop Management with GPS
   - Irrigation Control
   - Task Management
   - Field Mapping

## 📚 Additional Resources

- [React Native Image Picker Docs](https://github.com/react-native-image-picker/react-native-image-picker)
- [Geolocation API](https://github.com/react-native-geolocation/react-native-geolocation)
- [AsyncStorage Guide](https://react-native-async-storage.github.io/async-storage/)
- [Push Notification Setup](https://github.com/zo0r/react-native-push-notification)

## ✅ Implementation Checklist

- [x] Backend notification API integration
- [x] Offline notification queue
- [x] Push notification service
- [x] Camera integration with GPS tagging
- [x] Offline-first animal management
- [x] Photo sync with backend
- [x] Network status monitoring
- [x] Optimistic UI updates
- [ ] Install additional dependencies
- [ ] Configure platform permissions
- [ ] Test on physical devices
- [ ] Add notification center UI
- [ ] Extend to other farm modules
- [ ] Implement background sync

---

**Status**: Core mobile features implemented. Ready for dependency installation and testing.
