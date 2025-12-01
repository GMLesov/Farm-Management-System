# 🧪 Farm Management System - Testing Checklist

## Test Session: November 14, 2025

---

## 🔐 **1. Admin Login & Authentication**

### Test Admin Login Page (http://localhost:3002/login)
- [ ] Page loads correctly with green header "Farm Manager"
- [ ] Email and password fields are visible
- [ ] Show/hide password toggle works
- [ ] "Remember me" checkbox present
- [ ] "Forgot password?" link present
- [ ] "Register Your Farm" button present
- [ ] "Contact Support" link present
- [ ] "Worker Login" link present (NEW)

### Test Forgot Password
- [ ] Click "Forgot password?" link
- [ ] Dialog opens with email field
- [ ] Enter valid email
- [ ] Click "Send Reset Link"
- [ ] Success message appears
- [ ] Dialog closes automatically after 3 seconds

### Test Admin Login Flow
- [ ] Enter email: `admin@farm.com`
- [ ] Enter password: `password123`
- [ ] Click "Sign In"
- [ ] Redirects to main dashboard
- [ ] User is authenticated

---

## 👷 **2. Worker Login Portal** (NEW)

### Access Worker Login (http://localhost:3002/worker-login)
- [ ] Page loads with green theme "Worker Portal"
- [ ] Username field visible
- [ ] Password field visible
- [ ] Show/hide password toggle works
- [ ] Info alert: "Contact your farm administrator to reset"
- [ ] "Admin Login" link present
- [ ] "Contact Support" link present

### Test Worker Login
- [ ] Enter username: `jsmith`
- [ ] Enter password: `Farm@2024`
- [ ] Click "Sign In"
- [ ] Error message if credentials invalid (expected for now)
- [ ] Would redirect to `/worker-mobile` if valid

---

## 📞 **3. Contact Support** (IMPROVED)

### Test Contact Form (http://localhost:3002/contact)
- [ ] Page loads with back button
- [ ] Form has: Name, Email, Subject, Message fields
- [ ] Contact info sidebar shows:
  - [ ] Email: support@farmmanager.com
  - [ ] Phone: +1 (555) FARM-HELP
  - [ ] Address displayed
  - [ ] Support hours displayed
- [ ] Fill in all fields
- [ ] Click "Send Message"
- [ ] Success alert appears
- [ ] Redirects back after 3 seconds

---

## 👥 **4. Worker Management Dashboard**

### Navigate to Employee Management
- [ ] Login as admin
- [ ] Click "Employees" in sidebar
- [ ] Dashboard loads with worker list

### Test Add New Worker with Login
- [ ] Click "Add New Worker" button
- [ ] Fill in worker details:
  - First Name: Test
  - Last Name: Worker
  - Email: test.worker@farm.com
  - Phone: +1-555-9999
- [ ] Check "Enable System Login"
- [ ] Username field appears
- [ ] Enter username: `tworker`
- [ ] Check "Use default password" OR enter custom password
- [ ] Password fields appear if custom
- [ ] Click "Add Worker"
- [ ] Worker appears in list
- [ ] 🔑 Key icon visible in Actions column

### Test Password Reset (NEW)
- [ ] Find worker with login enabled in list
- [ ] Click 🔑 (key icon) in Actions column
- [ ] "Reset Password" dialog opens
- [ ] Worker name displayed correctly
- [ ] Check "Use default password"
- [ ] Default password shown: `Farm@2024`
- [ ] Click copy icon to copy password
- [ ] Uncheck default password
- [ ] Enter custom password (min 8 chars)
- [ ] Confirm password
- [ ] Passwords match validation works
- [ ] Click "Reset Password"
- [ ] Success message appears at top
- [ ] Dialog closes

---

## 📱 **5. Worker Mobile Dashboard**

### Access Mobile Dashboard (http://localhost:3002/worker-mobile)
- [ ] Page loads with phone simulator
- [ ] iPhone-style notch visible
- [ ] "My Tasks" header visible
- [ ] Task list displays with:
  - [ ] Task titles
  - [ ] Priority badges (High/Medium/Low)
  - [ ] Status chips (Pending/In Progress)
- [ ] Bottom navigation visible (Tasks/Notifications/Profile)

### Test GPS Verification
- [ ] Click "Verify Location" button
- [ ] Browser requests location permission
- [ ] "Location verified" snackbar appears
- [ ] Or error if permission denied

### Test Task Timer
- [ ] Click "Start" button on a task
- [ ] Button changes to "Stop"
- [ ] Timer counts up
- [ ] Click "Stop"
- [ ] "Task completed" snackbar appears
- [ ] Button changes back to "Start"

### Test Concern Reporting
- [ ] Click report icon (bottom left)
- [ ] "Report a Concern" dialog opens
- [ ] Fill in:
  - [ ] Title: "Test concern"
  - [ ] Description: "Testing the system"
  - [ ] Priority: High
- [ ] Click photo upload
- [ ] Select image files (max 5)
- [ ] Photos preview appears
- [ ] Remove photo works
- [ ] Click "Submit Report"
- [ ] Success message appears
- [ ] Dialog closes

### Test Leave Request
- [ ] Click requests icon
- [ ] "Apply for Leave" dialog opens
- [ ] Fill in:
  - [ ] Start date
  - [ ] End date
  - [ ] Type: Annual Leave
  - [ ] Reason: "Testing"
- [ ] Click "Submit Request"
- [ ] Success message appears

### Test Offline Mode
- [ ] Open browser DevTools (F12)
- [ ] Go to Network tab
- [ ] Check "Offline" checkbox
- [ ] "Offline Mode" banner appears at top
- [ ] Uncheck "Offline"
- [ ] Banner disappears
- [ ] "Back online" snackbar appears

### Test Pull to Refresh
- [ ] Swipe down on phone content area
- [ ] "Refreshing..." message appears
- [ ] Content refreshes
- [ ] "Tasks updated" snackbar appears

---

## 📊 **6. Worker Rota Dashboard**

### Navigate to Worker Rota
- [ ] Click "Worker Rota" in sidebar
- [ ] Badge shows "3" pending leaves
- [ ] Dashboard loads with two tabs

### Test Task Allocation Tab
- [ ] "Task Allocation" tab active by default
- [ ] Summary cards show:
  - [ ] Total Tasks
  - [ ] Completed
  - [ ] In Progress
  - [ ] Pending
- [ ] View toggle: Daily/Weekly/Monthly
- [ ] Task table displays with:
  - [ ] Worker avatars
  - [ ] Shift badges (Morning/Afternoon/Evening)
  - [ ] Status chips
- [ ] Click "Assign Task" button
- [ ] Dialog opens
- [ ] Fill task details
- [ ] Select worker
- [ ] Select shift
- [ ] Click "Assign"
- [ ] Task appears in table

### Test Leave Requests Tab
- [ ] Click "Leave Requests" tab
- [ ] Leave cards display:
  - [ ] Worker photo
  - [ ] Leave type badge
  - [ ] Date range
  - [ ] Reason
  - [ ] Status (Pending)
- [ ] Click "Approve" button
- [ ] Confirmation dialog appears
- [ ] Confirm approval
- [ ] Status changes to "Approved"
- [ ] Badge count decreases

---

## 🎨 **7. All Dashboard Modules**

### Test Navigation Between Modules
- [ ] Overview Dashboard
- [ ] Livestock Management
- [ ] Crop Management
- [ ] Task Management
- [ ] Inventory Management
- [ ] Equipment Tracking
- [ ] Financial Management
- [ ] Weather Integration
- [ ] Employee Management (✓ tested above)
- [ ] Reports & Analytics
- [ ] Settings
- [ ] Notifications
- [ ] Documents
- [ ] Market Prices
- [ ] Veterinary Records
- [ ] Worker Rota (✓ tested above)

### Test Each Module Loads
- [ ] Click each menu item
- [ ] Dashboard loads without errors
- [ ] Data displays correctly
- [ ] No console errors

---

## 🔄 **8. Error Boundary Testing**

### Test Error Handling
- [ ] Navigate through app
- [ ] No crashes occur
- [ ] Errors display gracefully
- [ ] "Try Again" button works if error occurs

---

## 📱 **9. Responsive Design**

### Test Mobile View
- [ ] Open DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Select iPhone 12 Pro
- [ ] All pages responsive
- [ ] Navigation works
- [ ] Forms are usable

### Test Tablet View
- [ ] Select iPad Pro
- [ ] Layout adjusts correctly
- [ ] All features accessible

---

## 🎯 **10. Integration Testing**

### Complete User Flow - Admin
1. [ ] Login as admin
2. [ ] Add new worker with login
3. [ ] Set default password
4. [ ] Reset worker password
5. [ ] Create task and assign to worker
6. [ ] Approve leave request
7. [ ] Check notifications
8. [ ] Logout

### Complete User Flow - Worker
1. [ ] Go to worker login
2. [ ] Login with credentials
3. [ ] View assigned tasks
4. [ ] Start task timer
5. [ ] Verify GPS location
6. [ ] Report a concern
7. [ ] Apply for leave
8. [ ] Test offline mode

---

## ✅ **Test Results Summary**

### Critical Tests (Must Pass)
- [ ] Admin login works
- [ ] Worker login page accessible
- [ ] Password reset functional
- [ ] Contact support sends messages
- [ ] Worker mobile dashboard loads
- [ ] Task management works
- [ ] No console errors

### Feature Tests (Should Pass)
- [ ] All 16 dashboard modules load
- [ ] Forgot password dialog works
- [ ] GPS verification works
- [ ] Timer functionality works
- [ ] Concern reporting works
- [ ] Leave requests work
- [ ] Offline mode works
- [ ] Responsive design works

### Security Tests
- [ ] Workers cannot reset own passwords
- [ ] Admin-only access to worker management
- [ ] Protected routes require authentication
- [ ] Password validation enforced

---

## 🐛 **Issues Found**

| Issue | Severity | Location | Status |
|-------|----------|----------|--------|
| | | | |
| | | | |

---

## 📝 **Notes**

- Default worker password: `Farm@2024`
- Admin test credentials: `admin@farm.com` / `password123`
- Worker test username: `jsmith`
- Server running on: `http://localhost:3002`

---

## 🎉 **Test Session Complete**

**Date**: November 14, 2025  
**Tester**: _______________  
**Duration**: _______________  
**Overall Status**: ⬜ Pass / ⬜ Fail / ⬜ Pass with Issues

**Next Steps**:
- [ ] Fix any critical issues
- [ ] Backend API integration
- [ ] Deploy to staging
- [ ] User acceptance testing
