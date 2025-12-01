# 📅 Worker Rota & Schedule Feature Guide

## Overview
Both workers and administrators can now view the team work schedule (rota) to see who is working and who is off duty. This enables better planning and coordination across the farm.

---

## 🎯 Features Implemented

### For Workers (Mobile Dashboard)

#### 1. **My Work Schedule Card**
- Location: Worker Mobile Dashboard → Profile Tab
- Shows your next 3 scheduled shifts
- Highlights:
  - ✅ **Working Days**: Green background with shift times
  - 📅 **Days Off**: Gray background with "Day Off" badge
- Quick access to personal schedule

#### 2. **Full Team Rota Dialog**
- Access: Click "View Full Rota" button
- Features:
  - View team schedule for multiple days
  - See who else is working each day
  - See who is off duty
  - Your shifts are highlighted with blue border
  - Shows shift times for each worker
  - Separate sections for "On Duty" and "Off Duty"

**Worker Benefits:**
- Know your upcoming shifts
- See which colleagues are working
- Plan coordination with team members
- Understand staffing levels
- Be aware of days off in advance

---

### For Administrators (Admin Dashboard)

#### 1. **Team Schedule Tab**
- Location: Worker Rota & Leaves Dashboard → First Tab
- Comprehensive team overview showing:
  - Next 4 days schedule at a glance
  - Workers on duty (green cards with ✓)
  - Workers off duty (gray cards with ✕)
  - Shift times for each worker
  - Reason for time off (Annual Leave, Rest Day, etc.)

#### 2. **Staffing Summary**
- Real-time statistics:
  - Total on-duty shifts
  - Total off-duty periods
  - Total workers
  - Coverage rate percentage
- Helps identify staffing gaps or coverage issues

#### 3. **Date Selector**
- Change dates to view future schedules
- Plan ahead for staffing needs
- Identify busy periods

**Admin Benefits:**
- See complete team availability
- Identify staffing gaps
- Better task allocation planning
- Coordinate leave requests
- Ensure adequate coverage
- Plan for busy periods

---

## 📱 How to Access

### Workers:
1. Login at: `http://localhost:3002/worker-login`
2. Navigate to: Profile Tab (bottom navigation, third icon)
3. Scroll down to: "My Work Schedule" card
4. Click: "View Full Rota" button to see team schedule

### Administrators:
1. Login at: `http://localhost:3002/login`
2. Navigate to: "Worker Rota & Leaves" dashboard (sidebar menu)
3. View: "Team Schedule" tab (first tab)

---

## 🎨 Visual Features

### Color Coding:
- 🟢 **Green**: Workers on duty
- ⚪ **Gray**: Workers off duty
- 🔵 **Blue Border**: Your shifts (workers only)
- ✅ **Check Icon**: On duty status
- 📅 **Calendar Icon**: Off duty status

### Information Displayed:
- Worker names with avatars
- Shift times (7AM-3PM, 3PM-11PM, etc.)
- Reason for time off
- Date formatted clearly (e.g., "Thursday, November 14")

---

## 📊 Sample Schedule Data

### Current Schedule Includes:
- **John Doe**: Morning shifts, some afternoons, rest days
- **Jane Smith**: Mixed shifts with rest days
- **Mike Johnson**: Afternoon and morning shifts
- **Sarah Williams**: Morning shifts, annual leave
- **Tom Brown**: Primarily morning shifts with rest days

### Schedule Pattern:
- 4 days visible at a time
- Clear indication of:
  - Morning shift: 7AM-3PM
  - Afternoon shift: 3PM-11PM
  - Off: Rest Day / Annual Leave / Sick Leave

---

## 🔄 Integration with Other Features

### Connected to:
1. **Leave Requests**: Approved leave shows as "Off - Annual Leave"
2. **Task Allocation**: Admin can see who's available for tasks
3. **Worker Management**: Full team roster accessible
4. **Notifications**: Workers can be alerted of schedule changes

---

## ✅ Benefits

### For Workers:
✓ Know your schedule in advance  
✓ Plan personal commitments  
✓ See team availability  
✓ Coordinate with coworkers  
✓ Understand staffing patterns  
✓ Be aware of busy/quiet periods  

### For Admins:
✓ Complete visibility of team availability  
✓ Better task allocation decisions  
✓ Identify staffing gaps  
✓ Plan for coverage needs  
✓ Coordinate leave approvals  
✓ Optimize workforce utilization  
✓ Ensure operational continuity  

---

## 🎯 Testing the Feature

### Test as Worker:
1. Go to: `http://localhost:3002/worker-login`
2. Login with: Username (any worker username)
3. Navigate to Profile tab
4. View "My Work Schedule" card
5. Click "View Full Rota"
6. Verify:
   - Your shifts are highlighted
   - Team schedule is visible
   - Dates are correct
   - On/Off status is clear

### Test as Admin:
1. Go to: `http://localhost:3002/login`
2. Login with: admin@farm.com / password123
3. Click "Worker Rota & Leaves" in sidebar
4. Click "Team Schedule" tab
5. Verify:
   - All workers listed
   - On/Off duty clearly marked
   - Statistics are accurate
   - Multiple days visible
   - Date selector works

---

## 📝 Notes

- Schedule data is currently mock data for demonstration
- In production, this will integrate with your database
- Schedule can be modified through admin interface
- Workers cannot edit their own schedules
- Only admins can assign shifts and approve changes
- Leave requests automatically update the rota

---

## 🔮 Future Enhancements (Optional)

- Export schedule to PDF/Calendar
- Mobile notifications for shift changes
- Shift swap requests between workers
- Weekly/Monthly calendar view
- Color coding by role/department
- Overtime tracking
- Shift pattern templates
- Integration with time tracking
- Automatic conflict detection
- Shift preferences management

---

## 📞 Support

If workers have questions about their schedule:
- Contact admin through Contact Support form
- View leave request status
- Check notifications for updates

If admins need help:
- All schedule management in Worker Rota dashboard
- Leave approvals affect the rota automatically
- Task allocation considers who's on duty

---

**Status**: ✅ Fully implemented and ready for testing
**Last Updated**: November 14, 2025
