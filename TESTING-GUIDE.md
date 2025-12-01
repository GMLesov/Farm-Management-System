# Worker Mobile App - Quick Testing Guide 🧪

## Prerequisites
- Backend server running on port 5000
- Frontend running on port 3000
- MongoDB connection active
- At least one worker user created

---

## 🚀 Quick Start Testing

### 1. Start Backend Server
```powershell
cd "c:\Users\mugod\My PROJECTS\FARM MANAGEMENT APP\server"
npm run dev
```

### 2. Start Frontend
```powershell
cd "c:\Users\mugod\My PROJECTS\FARM MANAGEMENT APP\web-dashboard"
npm start
```

### 3. Access Worker Mobile Dashboard
Navigate to: `http://localhost:3000` and select Worker Mobile Dashboard

---

## 🧪 Feature Testing Checklist

### ✅ Authentication Testing
1. **Login**
   - Navigate to worker login page
   - Enter credentials (username/password)
   - Verify token stored in localStorage
   - Verify redirect to dashboard

2. **Token Persistence**
   - Refresh page
   - Verify still logged in
   - Check localStorage for 'token' and 'user'

3. **Token Expiration**
   - Wait for token to expire (or manually delete it)
   - Try to fetch tasks
   - Verify redirect to login page

---

### ✅ Task Management Testing

1. **Fetch Tasks**
   - Open worker dashboard
   - Verify tasks load from API
   - Check loading spinner appears
   - Verify task cards display correctly

2. **View Task Details**
   - Click on any task card
   - Verify dialog opens with full task details
   - Check all fields display correctly

3. **Start Task**
   - Click "Start Task" on a pending task
   - Verify status changes to "in-progress"
   - Check timer starts
   - Verify API call succeeds

4. **Complete Task**
   - Click "Complete Task" on an in-progress task
   - Add completion notes (optional)
   - Click submit
   - Verify status changes to "completed"
   - Check task moves to completed section

5. **Pull to Refresh**
   - Scroll to top of task list
   - Pull down to trigger refresh
   - Verify loading indicator appears
   - Confirm tasks refresh from server

---

### ✅ Leave Request Testing

1. **View Leave Requests**
   - Navigate to Requests tab
   - Verify leave request list loads
   - Check status badges (pending/approved/rejected)

2. **Submit Leave Request**
   - Click "Request Leave" button
   - Fill in leave type, dates, and reason
   - Submit form
   - Verify success message
   - Check new request appears in list

3. **Cancel Leave Request**
   - Find a pending leave request
   - Click cancel button
   - Confirm cancellation
   - Verify request removed from list

---

### ✅ Report Submission Testing

1. **Submit Concern**
   - Click concern/report button
   - Select category (Animal Health, Equipment, etc.)
   - Enter description
   - Set priority
   - Add location (optional)
   - Submit
   - Verify success message
   - Check new task created from report

2. **Photo Upload**
   - Try adding a photo to report
   - Verify upload progress
   - Check photo URL returned
   - Confirm photo attached to task

---

### ✅ Real-time Updates Testing

1. **Socket Connection**
   - Open browser console
   - Check for "Socket.io connected" message
   - Verify no connection errors

2. **Task Assignment**
   - Have admin assign new task to worker
   - Verify notification appears in worker app
   - Check task list updates automatically
   - Confirm no page refresh needed

3. **Reconnection**
   - Disconnect internet
   - Wait 5 seconds
   - Reconnect internet
   - Verify Socket.io reconnects automatically

---

### ✅ Offline Mode Testing

1. **Go Offline**
   - Open worker dashboard
   - Disconnect internet
   - Verify offline indicator appears
   - Check tasks still visible (cached)

2. **Offline Actions**
   - Try to complete a task while offline
   - Verify action queued in localStorage
   - Check 'offlineChanges' in localStorage

3. **Sync When Online**
   - Reconnect internet
   - Verify sync process starts automatically
   - Check queued actions processed
   - Confirm data updated on server

---

### ✅ Location & Attendance Testing

1. **Location Update**
   - Grant location permissions
   - Click location button
   - Verify GPS coordinates captured
   - Check API call to `/api/workers/location`

2. **Check-in**
   - Click check-in button
   - Verify timestamp recorded
   - Check location captured (if enabled)
   - Confirm success message

3. **Check-out**
   - Click check-out button
   - Verify timestamp recorded
   - Check success message

---

### ✅ File Upload Testing

1. **Photo Upload**
   - Select task completion
   - Add photo
   - Verify upload progress
   - Check file size validation (max 10MB)
   - Confirm file type validation (images only)

2. **Multiple Photos**
   - Try uploading multiple photos
   - Verify all uploads succeed
   - Check URLs returned

---

## 🔧 API Testing (Using curl or Postman)

### Login
```bash
curl -X POST http://localhost:5000/api/auth/worker-login \
  -H "Content-Type: application/json" \
  -d '{"username":"worker1","password":"password123"}'
```

### Get Tasks
```bash
curl http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Task Status
```bash
curl -X PUT http://localhost:5000/api/tasks/TASK_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed","notes":"Task finished successfully"}'
```

### Create Leave Request
```bash
curl -X POST http://localhost:5000/api/leaves \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type":"vacation",
    "startDate":"2025-11-20",
    "endDate":"2025-11-22",
    "reason":"Family vacation"
  }'
```

### Update Location
```bash
curl -X POST http://localhost:5000/api/workers/location \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":40.7128,"longitude":-74.0060}'
```

### Check-in
```bash
curl -X POST http://localhost:5000/api/workers/checkin \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"timestamp":"2025-11-16T07:00:00Z"}'
```

### Upload Photo
```bash
curl -X POST http://localhost:5000/api/upload/photo \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/image.jpg"
```

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to load data"
**Solution**: 
- Check backend is running on port 5000
- Verify MongoDB connection
- Check browser console for errors
- Verify token is valid

### Issue: Socket.io not connecting
**Solution**:
- Check backend Socket.io initialization
- Verify CORS settings allow frontend origin
- Check token is stored in localStorage
- Look for connection errors in console

### Issue: Offline sync not working
**Solution**:
- Check 'offlineChanges' in localStorage
- Verify online/offline events firing
- Ensure sync endpoint exists
- Check network tab for sync API call

### Issue: File upload fails
**Solution**:
- Check file size (max 10MB)
- Verify file type (images/audio only)
- Ensure uploads directory exists
- Check multer configuration

### Issue: Token expired
**Solution**:
- This is expected behavior
- User should be redirected to login
- Generate new token by logging in again
- Check interceptor is handling 401 errors

---

## 📊 Expected Results

### Performance Benchmarks:
- Task list load: < 500ms
- API requests: < 200ms
- File upload (1MB): < 2s
- Socket.io connection: < 100ms
- Offline sync: < 1s

### Browser Console:
- No errors in production build
- Socket.io connection confirmed
- API calls successful (200 status)
- State updates logged

### Network Tab:
- All API calls return 200 status
- Token in Authorization header
- CORS headers present
- WebSocket upgrade successful

---

## ✅ Test Completion Checklist

### Basic Functionality
- [ ] Login works
- [ ] Tasks load from API
- [ ] Task status updates
- [ ] Leave requests submit
- [ ] Reports create tasks
- [ ] Logout clears data

### Real-time Features
- [ ] Socket.io connects
- [ ] Notifications appear
- [ ] Auto-reconnection works
- [ ] Real-time task updates

### Offline Features
- [ ] Offline indicator shows
- [ ] Tasks cached locally
- [ ] Actions queue offline
- [ ] Sync works when online

### File Uploads
- [ ] Photo upload works
- [ ] File size validated
- [ ] File type validated
- [ ] URLs returned correctly

### Security
- [ ] Token required for API calls
- [ ] Expired token redirects
- [ ] Logout clears token
- [ ] Unauthorized requests blocked

---

## 🎯 Success Criteria

**All features working**: Worker mobile app is production-ready ✅  
**Zero TypeScript errors**: Code compiles cleanly ✅  
**API integration complete**: All endpoints connected ✅  
**Real-time working**: Socket.io functional ✅  
**Offline support active**: localStorage sync operational ✅  

---

## 📞 Need Help?

Check these resources:
1. `WORKER-APP-COMPLETE.md` - Full feature documentation
2. Browser console - Error messages
3. Network tab - API request/response details
4. Backend logs - Server-side errors
5. Sentry dashboard - Production error tracking

---

**Happy Testing! 🚀**
