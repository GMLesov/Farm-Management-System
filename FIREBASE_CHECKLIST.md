# 🎯 Firebase Setup Checklist

Use this checklist to track your progress setting up Firebase.

---

## Pre-Setup
- [ ] I have a Google account
- [ ] I can access https://console.firebase.google.com/
- [ ] Backend and frontend are currently running

---

## Firebase Console Setup

### Project Creation
- [ ] Created Firebase project named `farm-management-app`
- [ ] Project creation completed (30-60 seconds)

### Web App Registration  
- [ ] Added web app with nickname
- [ ] **Copied Firebase config** (apiKey, authDomain, etc.)
- [ ] Saved config for later

### Cloud Messaging
- [ ] Navigated to Project Settings → Cloud Messaging
- [ ] Enabled Cloud Messaging API (if needed)
- [ ] **Copied Server Key**
- [ ] **Copied Sender ID**

### Service Account
- [ ] Went to Project Settings → Service Accounts
- [ ] Clicked "Generate new private key"
- [ ] **Downloaded JSON file**
- [ ] Saved as `firebase-service-account.json` in `farm-management-backend/`
- [ ] Added `firebase-service-account.json` to `.gitignore`

### Firestore Database
- [ ] Clicked Build → Firestore Database
- [ ] Clicked "Create database"
- [ ] Selected "Start in test mode"
- [ ] Selected location (nearest region)
- [ ] Database creation completed

### VAPID Key
- [ ] Went back to Project Settings → Cloud Messaging
- [ ] Scrolled to "Web Push certificates"
- [ ] Clicked "Generate key pair"
- [ ] **Copied VAPID key**

---

## Configuration Files

### Backend `.env`
- [ ] Opened `farm-management-backend/.env`
- [ ] Added line: `FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json`
- [ ] Saved file

### Frontend `.env`
- [ ] Created/opened `web-dashboard/.env`
- [ ] Added all Firebase config values:
  - [ ] `REACT_APP_FIREBASE_API_KEY`
  - [ ] `REACT_APP_FIREBASE_AUTH_DOMAIN`
  - [ ] `REACT_APP_FIREBASE_PROJECT_ID`
  - [ ] `REACT_APP_FIREBASE_STORAGE_BUCKET`
  - [ ] `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `REACT_APP_FIREBASE_APP_ID`
  - [ ] `REACT_APP_FIREBASE_VAPID_KEY`
- [ ] Saved file

---

## Testing

### Test Backend Connection
- [ ] Ran: `cd farm-management-backend`
- [ ] Ran: `node test-firebase-connection.js`
- [ ] Saw: "✅ Firebase Admin SDK initialized successfully!"
- [ ] Saw: "🎉 All Firebase tests passed!"

### Restart Servers
- [ ] Stopped backend server (close PowerShell window)
- [ ] Started backend: `node start-dev.js`
- [ ] Saw: "✅ Firebase initialized successfully" in console
- [ ] Frontend auto-reloaded (or manually refreshed browser)
- [ ] No Firebase errors in browser console

### Verify Features
- [ ] Can send test notification via API
- [ ] Push notifications appear in browser
- [ ] Real-time updates working

---

## 🎉 Completion

- [ ] All checkboxes above are checked
- [ ] No errors in backend console
- [ ] No errors in frontend console
- [ ] Firebase features working

---

## 📝 Notes

Write down any issues or questions here:

```
[Your notes here]
```

---

## 🆘 If Something Goes Wrong

### Can't find Firebase console
→ Go to: https://console.firebase.google.com/

### Service account JSON not found
→ Re-download from Project Settings → Service Accounts

### Firebase errors in backend
→ Run `node test-firebase-connection.js` to diagnose

### Firebase errors in frontend
→ Check browser console for specific error message
→ Verify all config values in `.env` are correct

### Still stuck?
→ See FIREBASE_SETUP_GUIDE.md for detailed troubleshooting
→ Check backend terminal logs for specific errors

---

**Ready to start?** Open FIREBASE_QUICK_START.md and begin with Step 1!
