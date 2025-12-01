# 📅 Farm Calendar Feature - Complete Guide

## Overview
A comprehensive calendar system that shows work schedules, days off, leave requests, and special farm events. Admins have full control to add, edit, and delete events, while workers have read-only access to view all calendar information.

---

## 🎯 Key Features

### For Administrators
✅ **Full Calendar Management**
- Add, edit, and delete calendar events
- Create different event types (Work, Off, Leave, Special Events)
- Assign events to specific workers
- Set event descriptions and details
- Month-by-month navigation
- Visual color-coded calendar grid

✅ **Event Types**
1. **Work Schedule** (Green) - Working shifts and task assignments
2. **Day Off** (Gray) - Rest days and scheduled time off
3. **Leave** (Orange) - Annual leave, sick leave, personal leave
4. **Special Events** (Blue/Purple/Red) - Farm events, training, inspections, celebrations

✅ **Calendar Features**
- Monthly grid view with all events
- Upcoming events sidebar
- Event statistics (work days, days off, leave, special events)
- Click on any event to view/edit details
- Today button for quick navigation
- Color-coded legend

### For Workers
✅ **Read-Only Calendar Access**
- View all farm events and special occasions
- See important dates (training, inspections, celebrations)
- Access from mobile dashboard
- No ability to modify events
- Clear event descriptions and dates

---

## 📱 How to Access

### For Administrators:

1. **Login** at: `http://localhost:3002/login`
2. **Navigate** to: "Farm Calendar" in the sidebar menu
3. **Or go directly** to: `http://localhost:3002/calendar`

**Features Available:**
- Click **"Add Event"** button to create new events
- Click **Previous/Next arrows** to change months
- Click **"Today"** button to return to current month
- Click **any event chip** in the calendar to view/edit details
- View **upcoming events** in the right sidebar
- See **monthly statistics** below upcoming events

### For Workers:

1. **Login** at: `http://localhost:3002/worker-login`
2. **Navigate** to: Profile Tab (bottom navigation)
3. **Look for**: "Farm Calendar & Events" card
4. **Click**: "View Calendar" button

**Features Available:**
- View all upcoming farm events
- See event details and descriptions
- Read-only access (cannot modify)

---

## 🎨 Admin Calendar Interface

### Main Calendar View
```
┌─────────────────────────────────────────────────────────────┐
│  Farm Calendar                              [Add Event]      │
├─────────────────────────────────────────────────────────────┤
│  Legend: 🟢 Working  ⚪ Day Off  🟠 Leave  🔵 Special Event │
├─────────────────────────────────────────────────────────────┤
│  [<] [Today] [>]          November 2025                      │
├───┬───┬───┬───┬───┬───┬───────────────┬──────────────────┤
│Sun│Mon│Tue│Wed│Thu│Fri│Sat            │ Upcoming Events  │
├───┼───┼───┼───┼───┼───┼───────────────┼──────────────────┤
│   │   │   │   │ 14│ 15│ 16            │ • Nov 18: Equip  │
│   │   │   │   │🟢│🟢│⚪            │   Maintenance    │
│   │   │   │   │🟢│⚪│🟢            │ • Nov 22: Safety │
│   │   │   │   │   │   │               │   Training       │
│   │   │   │   │   │   │               │ • Nov 25: Farm   │
│ 17│ 18│ 19│ 20│ 21│ 22│ 23            │   Inspection     │
│🟢│🔵│🟢│🟠│🟢│🔵│🟢            │                  │
└───┴───┴───┴───┴───┴───┴───────────────┴──────────────────┘
```

### Add Event Dialog
```
┌─────────────────────────────────────┐
│  Add New Event                      │
├─────────────────────────────────────┤
│  Event Title: [________________]    │
│  Event Type:  [Special Event ▼]    │
│  Date:        [2025-11-18     ]    │
│  Workers:     [Select Workers  ▼]   │
│  Description: [________________]    │
│               [________________]    │
│                                      │
│           [Cancel]  [Add Event]     │
└─────────────────────────────────────┘
```

---

## 📊 Sample Events Included

### Working Shifts
- John Doe - Morning Shift (Nov 14)
- Jane Smith - Morning Shift (Nov 14)
- Mike Johnson - Afternoon Shift (Nov 14)
- Tom Brown - Morning Shift (Nov 14)

### Days Off
- Sarah Williams - Day Off (Nov 14)
- Jane Smith - Rest Day (Nov 15)
- John Doe - Rest Day (Nov 16)

### Leave Requests
- Sarah Williams - Annual Leave (Nov 15)
- Mike Johnson - Sick Leave (Nov 20)

### Special Events
- **Farm Equipment Maintenance Day** (Nov 18)
  - Annual equipment inspection and maintenance
- **Safety Training** (Nov 22)
  - Mandatory safety training for all workers
- **Farm Inspection** (Nov 25)
  - Government regulatory inspection
- **Harvest Festival** (Nov 28)
  - Community harvest celebration

---

## 🔧 Admin Operations

### Adding a New Event

1. Click **"Add Event"** button
2. Fill in event details:
   - **Title**: Name of the event
   - **Type**: Select from Work, Off, Leave, or Special
   - **Date**: Choose the date
   - **Workers** (optional): Select affected workers
   - **Description** (optional): Add details
3. Click **"Add Event"** to save

### Editing an Event

1. Click on any **event chip** in the calendar
2. Event details dialog opens
3. Modify any field:
   - Change title
   - Change type (color updates automatically)
   - Change date
   - Update description
4. Click **"Save Changes"**

### Deleting an Event

1. Click on the event to open details
2. Click **"Delete"** button (red, bottom left)
3. Event is removed immediately

### Navigating the Calendar

- **Previous Month**: Click left arrow (**<**)
- **Next Month**: Click right arrow (**>**)
- **Today**: Click "Today" button
- **View Event**: Click any colored chip in calendar grid

---

## 👷 Worker Calendar View

### Mobile Dashboard Access
Workers see a "Farm Calendar & Events" card showing:
- Next 3 upcoming events
- Event titles and dates
- Brief descriptions
- "View Calendar" button for full list

### Calendar Dialog
When clicking "View Calendar":
- Full list of all upcoming events
- Event titles with icons
- Complete dates and descriptions
- Read-only access (no edit/delete buttons)
- Info message about admin control

### Sample Worker View
```
┌─────────────────────────────────────┐
│  📅 Farm Calendar & Events          │
│                    [View Calendar]  │
├─────────────────────────────────────┤
│  📅 Safety Training                 │
│      Nov 22                         │
│      Mandatory safety training...   │
├─────────────────────────────────────┤
│  📅 Farm Inspection                 │
│      Nov 25                         │
│      Government regulatory...       │
├─────────────────────────────────────┤
│  📅 Harvest Festival                │
│      Nov 28                         │
│      Community harvest...           │
└─────────────────────────────────────┘
```

---

## 🎨 Visual Design

### Color Coding
- 🟢 **Green (#4caf50)**: Work schedules - active working days
- ⚪ **Gray (#9e9e9e)**: Days off - rest days
- 🟠 **Orange (#ff9800)**: Leave requests - vacations, sick leave
- 🔵 **Blue (#2196f3)**: Special events - training, meetings
- 🟣 **Purple (#9c27b0)**: Celebrations - festivals
- 🔴 **Red (#f44336)**: Important events - inspections

### Icons
- 💼 **WorkIcon**: Working shifts
- ❌ **OffIcon**: Days off
- 🏖️ **LeaveIcon**: Leave requests
- 🎉 **SpecialIcon**: Special events
- 📅 **EventIcon**: General calendar events
- 👤 **PersonIcon**: Worker-specific events

### Layout
- **Grid View**: 7-column week layout (Sun-Sat)
- **Today Highlight**: Blue border around current date
- **Event Chips**: Small colored badges showing event titles
- **Hover Effects**: Calendar cells highlight on hover
- **Sidebar**: Upcoming events and statistics

---

## 📋 Integration with Other Features

### Connected Systems
1. **Worker Rota Dashboard**: Work schedules sync with rota
2. **Leave Requests**: Approved leaves appear on calendar
3. **Worker Management**: Worker assignments link to calendar
4. **Task Management**: Tasks can be scheduled on calendar
5. **Notifications**: Workers notified of upcoming events

### Data Flow
```
Admin creates event → Calendar updates → Workers see event
Worker requests leave → Admin approves → Appears on calendar
Rota schedule created → Auto-syncs to calendar
Special event added → All users notified
```

---

## ✅ Benefits

### For Farm Managers
✓ Centralized event management  
✓ Visual overview of all activities  
✓ Easy scheduling and planning  
✓ Track worker availability  
✓ Coordinate farm events  
✓ Reduce scheduling conflicts  
✓ Improve communication  

### For Workers
✓ Know upcoming events in advance  
✓ See important farm dates  
✓ Plan personal schedules  
✓ Stay informed about training  
✓ Aware of special occasions  
✓ Never miss important events  
✓ Easy mobile access  

---

## 🎯 Use Cases

### 1. Equipment Maintenance Planning
- Admin adds "Equipment Maintenance Day"
- All workers see the event
- Workers know to prepare equipment
- Reduces downtime

### 2. Training Coordination
- Admin schedules "Safety Training"
- Workers receive notification
- Everyone attends on correct date
- Compliance maintained

### 3. Government Inspections
- Admin adds "Farm Inspection" event
- Workers prepare in advance
- Farm passes inspection
- Regulatory compliance

### 4. Celebration Events
- Admin adds "Harvest Festival"
- Workers see community event
- Team participation
- Morale boost

### 5. Leave Management
- Approved leaves appear on calendar
- Other workers see coverage gaps
- Better shift planning
- Reduced conflicts

---

## 🔮 Future Enhancements (Optional)

- Export calendar to PDF
- Sync with Google Calendar / Outlook
- Email reminders for upcoming events
- Recurring events (weekly, monthly)
- Multi-day events
- Event categories and filtering
- Mobile push notifications
- iCal/ICS export
- Event attachments (documents, images)
- Weather integration on calendar
- Automatic conflict detection
- Event approval workflow
- Color customization per event
- Print calendar view

---

## 📞 Support & Help

### For Administrators
**Common Tasks:**
- Add Event: Click "Add Event" button
- Edit Event: Click on event chip
- Delete Event: Click event → Delete button
- Navigate: Use arrows or Today button

**Troubleshooting:**
- Events not showing: Check date range
- Can't edit: Click directly on event chip
- Colors wrong: Change event type to fix

### For Workers
**Common Questions:**
- Where is calendar? Profile tab → "View Calendar"
- Can I edit events? No, read-only access
- How to request leave? Use "Request Leave" feature
- Who manages calendar? Your farm administrator

**Support:**
- Questions about events: Contact admin
- Technical issues: Use Contact Support form
- Schedule conflicts: Speak with manager

---

## 🎓 Training Tips

### For New Admins
1. Start by viewing the current month
2. Practice adding a test event
3. Try editing and deleting test events
4. Experiment with different event types
5. Check how events appear to workers

### For Workers
1. Open your mobile dashboard
2. Find the "Farm Calendar" card
3. Click "View Calendar"
4. Review upcoming events
5. Note important dates

---

## ✨ Summary

**Calendar System Status**: ✅ Fully Implemented

**Admin Features:**
- Full calendar management ✅
- Add/Edit/Delete events ✅
- Multiple event types ✅
- Worker assignment ✅
- Monthly navigation ✅
- Statistics dashboard ✅

**Worker Features:**
- Read-only calendar view ✅
- Upcoming events list ✅
- Mobile access ✅
- Event descriptions ✅
- Quick calendar button ✅

**Location:**
- Admin: `http://localhost:3002/calendar`
- Worker: Mobile Dashboard → Profile → Calendar

**Access Control:**
- Admins: Full control ✅
- Workers: Read-only ✅

---

**Status**: ✅ Ready for Testing  
**Last Updated**: November 14, 2025  
**Version**: 1.0
