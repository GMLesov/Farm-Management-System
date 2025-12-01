# Advanced Automation Features - Complete Documentation

## 🤖 Overview

The Farm Management System now includes three powerful AI/automation services:

1. **AI Task Recommendation Engine** - Smart worker-task matching
2. **Weather-Based Scheduler** - Weather-aware task scheduling  
3. **Predictive Maintenance System** - Proactive alerts and predictions

---

## 1. AI Task Recommendation Engine

### Purpose
Intelligently recommends the best workers for tasks based on historical data, skills, and performance.

### Algorithm
Multi-factor scoring system with weighted criteria:
- **Skill Match (30%)** - Has completed similar tasks before
- **Experience (25%)** - Total experience with task type
- **Quality (20%)** - Average rating from past completions
- **Availability (15%)** - Worker's schedule and day preferences
- **Efficiency (10%)** - Completion time vs. average

### API Endpoints

#### POST /api/tasks/ai-recommend
Get recommendations for a new task (before creation).

**Request:**
```json
{
  "taskType": "planting",
  "location": "Field A",
  "dueDate": "2024-02-15",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "worker": {
        "_id": "...",
        "name": "John Smith",
        "avatar": "..."
      },
      "confidence": 87,
      "reasons": [
        "Skill match: Has done planting before",
        "High quality: Average rating 4.8/5",
        "Efficient: Completes 20% faster than average",
        "Available: Free on scheduled day"
      ],
      "estimatedCompletionTime": 180,
      "optimalStartTime": "2024-02-15T07:00:00Z"
    }
  ]
}
```

#### GET /api/tasks/:id/recommendations
Get recommendations for reassigning an existing task.

**Response:** Same format as above, plus:
```json
{
  "currentAssignment": "worker_id",
  "recommendations": [...]
}
```

### Frontend Integration

```typescript
// In task creation dialog
const getRecommendations = async () => {
  const response = await fetch('/api/tasks/ai-recommend', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      taskType: selectedType,
      location: selectedLocation,
      dueDate: selectedDate,
      priority: selectedPriority
    })
  });
  const data = await response.json();
  setRecommendations(data.recommendations);
};

// Display recommendations
{recommendations.map(rec => (
  <Card key={rec.worker._id}>
    <Typography>{rec.worker.name}</Typography>
    <LinearProgress variant="determinate" value={rec.confidence} />
    <Typography>{rec.confidence}% match</Typography>
    <List>
      {rec.reasons.map(reason => (
        <ListItem>{reason}</ListItem>
      ))}
    </List>
    <Button onClick={() => assignWorker(rec.worker._id)}>
      Assign Worker
    </Button>
  </Card>
))}
```

---

## 2. Weather-Based Scheduler

### Purpose
Analyzes weather forecasts to recommend optimal days for outdoor tasks and alerts about unsuitable conditions.

### Weather Rules

| Task Type | Optimal Temperature | Conditions | Max Precipitation | Max Wind |
|-----------|-------------------|------------|------------------|----------|
| Planting | 15-28°C | Sunny/Cloudy | 20% | 15 km/h |
| Spraying | 10-30°C | Sunny/Cloudy | 10% | 10 km/h |
| Harvesting | 10-35°C | Sunny/Cloudy | 30% | 20 km/h |
| Irrigation | Any | Any | 40% | Any |
| Fertilizing | 12-30°C | Sunny/Cloudy | 20% | Any |

### API Endpoints

#### POST /api/tasks/weather-schedule
Get weather-based recommendations for multiple tasks.

**Request:**
```json
{
  "taskIds": ["task1_id", "task2_id", "task3_id"]
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "taskId": "task1_id",
      "taskTitle": "Plant corn in Field A",
      "taskType": "planting",
      "currentSchedule": "2024-02-10",
      "bestDate": "2024-02-12",
      "shouldReschedule": true,
      "recommendedDates": [
        {
          "date": "2024-02-12",
          "suitable": true,
          "score": 92,
          "weather": {
            "temperature": 22,
            "condition": "sunny",
            "precipitation": 10,
            "windSpeed": 8
          },
          "reasons": [
            "Temperature is optimal",
            "Weather condition is favorable",
            "Precipitation level is acceptable"
          ]
        }
      ]
    }
  ]
}
```

#### GET /api/tasks/weather/alerts
Get alerts for tasks scheduled during unsuitable weather (next 3 days).

**Response:**
```json
{
  "success": true,
  "count": 2,
  "alerts": [
    {
      "taskId": "...",
      "taskTitle": "Spray pesticides",
      "scheduledDate": "2024-02-10",
      "weather": {
        "temperature": 32,
        "condition": "rainy",
        "precipitation": 80,
        "windSpeed": 25
      },
      "issue": [
        "rainy weather is not suitable",
        "Precipitation 80% exceeds maximum 10%",
        "Wind speed 25 km/h exceeds maximum 10 km/h"
      ],
      "severity": "critical",
      "recommendation": "Consider rescheduling to a more suitable day"
    }
  ]
}
```

### Frontend Integration

```typescript
// Weather alerts widget
const WeatherAlerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchWeatherAlerts();
  }, []);

  const fetchWeatherAlerts = async () => {
    const response = await fetch('/api/tasks/weather/alerts', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setAlerts(data.alerts);
  };

  return (
    <Card>
      <CardHeader title="Weather Alerts" />
      <CardContent>
        {alerts.map(alert => (
          <Alert 
            severity={alert.severity === 'critical' ? 'error' : 'warning'}
            key={alert.taskId}
          >
            <AlertTitle>{alert.taskTitle}</AlertTitle>
            <Typography>Scheduled: {alert.scheduledDate}</Typography>
            <Typography>Issues:</Typography>
            <ul>
              {alert.issue.map(i => <li>{i}</li>)}
            </ul>
            <Button onClick={() => rescheduleTask(alert.taskId)}>
              Reschedule
            </Button>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};
```

---

## 3. Predictive Maintenance System

### Purpose
Proactively identifies maintenance needs, health issues, and resource shortages before they become critical problems.

### Alert Categories

#### 1. Equipment Maintenance
- Routine maintenance overdue (>90 days)
- Oil change needed (>500 usage hours)
- Parts replacement due
- Safety inspection required

#### 2. Animal Health
- Vaccination schedule overdue (>300 days)
- Weight loss detected (>10kg drop)
- Breeding cycle monitoring (calving due soon)
- Health checkup reminders

#### 3. Crop Health
- Harvest approaching (<14 days)
- Irrigation overdue (>7 days without water)
- Pest control needed (>30 days since treatment)
- Growth monitoring alerts

#### 4. Resource Management
- Low stock alerts (below reorder point)
- Predicted stockout (estimated days until empty)
- Reorder recommendations
- Cost estimates

### API Endpoints

#### GET /api/alerts
Get all predictive alerts across all categories.

**Query Parameters:**
- `severity` - Filter by severity (low/medium/high/critical)
- `type` - Filter by type (maintenance/health/crop/resource)

**Response:**
```json
{
  "success": true,
  "count": 15,
  "alerts": [
    {
      "id": "maint-equipment123",
      "type": "maintenance",
      "severity": "high",
      "title": "Tractor XYZ Requires Maintenance",
      "description": "Last maintenance was 185 days ago",
      "affectedItem": {
        "id": "equipment123",
        "name": "Tractor XYZ",
        "type": "equipment"
      },
      "predictedDate": "2024-02-17T00:00:00Z",
      "recommendations": [
        "Schedule routine maintenance",
        "Inspect for wear and tear",
        "Check fluid levels and filters"
      ],
      "estimatedCost": 150
    }
  ]
}
```

#### GET /api/alerts/equipment
Get only equipment maintenance alerts.

#### GET /api/alerts/animals
Get only animal health alerts.

#### GET /api/alerts/crops
Get only crop health alerts.

#### GET /api/alerts/resources
Get only inventory/resource alerts.

#### GET /api/alerts/critical
Get only critical and high severity alerts.

### Frontend Integration

```typescript
// Alerts Dashboard Component
const AlertsDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    const url = filter === 'all' 
      ? '/api/alerts' 
      : `/api/alerts/${filter}`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setAlerts(data.alerts);
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'success';
    }
  };

  return (
    <Box>
      <Typography variant="h4">Predictive Alerts</Typography>
      
      <Tabs value={filter} onChange={(e, v) => setFilter(v)}>
        <Tab value="all" label="All" />
        <Tab value="critical" label="Critical" />
        <Tab value="equipment" label="Equipment" />
        <Tab value="animals" label="Animals" />
        <Tab value="crops" label="Crops" />
        <Tab value="resources" label="Resources" />
      </Tabs>

      <Grid container spacing={2}>
        {alerts.map(alert => (
          <Grid item xs={12} md={6} key={alert.id}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: getSeverityColor(alert.severity) }}>
                    <WarningIcon />
                  </Avatar>
                }
                title={alert.title}
                subheader={`${alert.type} • ${alert.severity}`}
              />
              <CardContent>
                <Typography color="text.secondary">
                  {alert.description}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Predicted: {new Date(alert.predictedDate).toLocaleDateString()}
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Recommendations:
                </Typography>
                <List dense>
                  {alert.recommendations.map((rec, i) => (
                    <ListItem key={i}>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>

                {alert.estimatedCost && (
                  <Chip 
                    label={`Est. Cost: $${alert.estimatedCost}`}
                    color="primary"
                    size="small"
                  />
                )}
              </CardContent>
              <CardActions>
                <Button size="small">View Details</Button>
                <Button size="small">Create Task</Button>
                <Button size="small">Dismiss</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
```

---

## Dashboard Widgets

### AI Recommendations Widget
Shows top worker recommendations for pending tasks.

```typescript
<Card>
  <CardHeader title="🤖 AI Recommendations" />
  <CardContent>
    <List>
      {pendingTasks.slice(0, 3).map(task => (
        <ListItem>
          <ListItemText 
            primary={task.title}
            secondary={`Best match: ${task.recommendedWorker} (${task.confidence}%)`}
          />
          <Button>Assign</Button>
        </ListItem>
      ))}
    </List>
  </CardContent>
</Card>
```

### Weather Alerts Widget
Displays weather issues for upcoming tasks.

```typescript
<Card>
  <CardHeader title="🌤️ Weather Alerts" />
  <CardContent>
    {weatherAlerts.map(alert => (
      <Alert severity={alert.severity}>
        {alert.taskTitle} - {alert.issue}
      </Alert>
    ))}
  </CardContent>
</Card>
```

### Maintenance Alerts Widget
Shows critical maintenance and health alerts.

```typescript
<Card>
  <CardHeader title="⚠️ Urgent Alerts" />
  <CardContent>
    <Chip label={`${criticalCount} Critical`} color="error" />
    <Chip label={`${highCount} High`} color="warning" />
    
    <List>
      {criticalAlerts.map(alert => (
        <ListItem button onClick={() => handleAlert(alert)}>
          <ListItemIcon>
            <WarningIcon color="error" />
          </ListItemIcon>
          <ListItemText 
            primary={alert.title}
            secondary={alert.description}
          />
        </ListItem>
      ))}
    </List>
  </CardContent>
</Card>
```

---

## Performance Optimization

### Caching Strategy
- Cache worker profiles for 1 hour
- Cache weather forecasts for 30 minutes
- Cache historical task analysis for 6 hours
- Invalidate on new task completion

### Background Processing
Consider running these processes in background jobs:
- Daily weather alert generation (6 AM)
- Weekly maintenance analysis (Sunday midnight)
- Monthly worker profile updates

### Database Indexes
Recommended indexes for optimal performance:

```javascript
// Tasks
Task.index({ status: 1, assignedTo: 1, dueDate: 1 });
Task.index({ type: 1, completedAt: 1 });

// Equipment
Equipment.index({ lastMaintenance: 1, usageHours: 1 });

// Animals
Animal.index({ lastVaccination: 1, lastCheckup: 1 });

// Inventory
Inventory.index({ quantity: 1, reorderPoint: 1 });
```

---

## Testing

### AI Recommendations
```bash
curl -X POST http://localhost:5000/api/tasks/ai-recommend \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskType": "planting",
    "location": "Field A",
    "dueDate": "2024-02-15",
    "priority": "high"
  }'
```

### Weather Alerts
```bash
curl http://localhost:5000/api/tasks/weather/alerts \
  -H "Authorization: Bearer $TOKEN"
```

### Predictive Alerts
```bash
curl http://localhost:5000/api/alerts/critical \
  -H "Authorization: Bearer $TOKEN"
```

---

## Future Enhancements

### Phase 2
- [ ] Integrate real weather API (OpenWeather, Weather.com)
- [ ] Machine learning model training from historical data
- [ ] Seasonal pattern detection
- [ ] Cost optimization recommendations

### Phase 3
- [ ] Predictive yield forecasting
- [ ] Equipment failure prediction using IoT sensors
- [ ] Automated task creation from alerts
- [ ] Mobile push notifications for critical alerts

---

## Configuration

### Environment Variables
```env
# Weather API (optional)
WEATHER_API_KEY=your_openweather_api_key
WEATHER_LOCATION=your_farm_coordinates

# AI Settings
AI_CONFIDENCE_THRESHOLD=70
AI_MAX_RECOMMENDATIONS=5

# Alert Settings
ALERT_CHECK_INTERVAL=3600000  # 1 hour in ms
CRITICAL_ALERT_NOTIFY=true
```

---

## Summary

✅ **3 AI/Automation Services Created**
- AI Task Recommendation Engine (aiTaskRecommendation.ts)
- Weather-Based Scheduler (weatherScheduler.ts)
- Predictive Maintenance System (predictiveMaintenance.ts)

✅ **11 New API Endpoints Added**
- 4 AI recommendation endpoints
- 2 weather scheduling endpoints
- 5 predictive alert endpoints

✅ **Multi-Factor Intelligence**
- Skill matching, quality scoring, efficiency analysis
- Weather condition analysis with 7-day forecasting
- Predictive maintenance across equipment, animals, crops, resources

✅ **Proactive Alerts**
- Critical, high, medium, and low severity levels
- Cost estimation for maintenance
- Actionable recommendations
- Dashboard integration ready

**Status: Advanced Automation Complete ✅**
