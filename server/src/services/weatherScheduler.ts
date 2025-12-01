// Weather-Based Task Scheduler
// Automatically schedules tasks based on weather forecasts

interface WeatherData {
  date: string;
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  precipitation: number; // percentage
  windSpeed: number;
  humidity: number;
}

interface WeatherBasedTask {
  taskType: string;
  optimalConditions: {
    temperature?: { min: number; max: number };
    condition?: string[];
    maxPrecipitation?: number;
    maxWindSpeed?: number;
  };
  priority: 'urgent' | 'high' | 'medium' | 'low';
}

class WeatherBasedScheduler {
  private weatherRules: WeatherBasedTask[] = [
    {
      taskType: 'planting',
      optimalConditions: {
        temperature: { min: 15, max: 28 },
        condition: ['sunny', 'cloudy'],
        maxPrecipitation: 20,
        maxWindSpeed: 15
      },
      priority: 'high'
    },
    {
      taskType: 'spraying',
      optimalConditions: {
        temperature: { min: 10, max: 30 },
        condition: ['sunny', 'cloudy'],
        maxPrecipitation: 10,
        maxWindSpeed: 10
      },
      priority: 'urgent'
    },
    {
      taskType: 'harvesting',
      optimalConditions: {
        temperature: { min: 10, max: 35 },
        condition: ['sunny', 'cloudy'],
        maxPrecipitation: 30,
        maxWindSpeed: 20
      },
      priority: 'high'
    },
    {
      taskType: 'irrigation',
      optimalConditions: {
        maxPrecipitation: 40
      },
      priority: 'medium'
    },
    {
      taskType: 'fertilizing',
      optimalConditions: {
        temperature: { min: 12, max: 30 },
        condition: ['sunny', 'cloudy'],
        maxPrecipitation: 20
      },
      priority: 'medium'
    }
  ];

  // Get weather forecast (mock implementation - integrate with real API)
  async getWeatherForecast(days: number = 7): Promise<WeatherData[]> {
    const forecast: WeatherData[] = [];
    const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'stormy'];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        temperature: Math.round(Math.random() * 20 + 15), // 15-35°C
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        precipitation: Math.round(Math.random() * 100),
        windSpeed: Math.round(Math.random() * 30),
        humidity: Math.round(Math.random() * 40 + 40) // 40-80%
      });
    }
    
    return forecast;
  }

  // Check if weather is suitable for task
  isWeatherSuitableForTask(taskType: string, weather: WeatherData): { suitable: boolean; reasons: string[] } {
    const rule = this.weatherRules.find(r => r.taskType === taskType);
    if (!rule) {
      return { suitable: true, reasons: ['No specific weather requirements'] };
    }

    const reasons: string[] = [];
    let suitable = true;

    // Check temperature
    if (rule.optimalConditions.temperature) {
      const { min, max } = rule.optimalConditions.temperature;
      if (weather.temperature < min || weather.temperature > max) {
        suitable = false;
        reasons.push(`Temperature ${weather.temperature}°C is outside optimal range ${min}-${max}°C`);
      } else {
        reasons.push('Temperature is optimal');
      }
    }

    // Check weather condition
    if (rule.optimalConditions.condition) {
      if (!rule.optimalConditions.condition.includes(weather.condition)) {
        suitable = false;
        reasons.push(`${weather.condition} weather is not suitable`);
      } else {
        reasons.push('Weather condition is favorable');
      }
    }

    // Check precipitation
    if (rule.optimalConditions.maxPrecipitation !== undefined) {
      if (weather.precipitation > rule.optimalConditions.maxPrecipitation) {
        suitable = false;
        reasons.push(`Precipitation ${weather.precipitation}% exceeds maximum ${rule.optimalConditions.maxPrecipitation}%`);
      } else {
        reasons.push('Precipitation level is acceptable');
      }
    }

    // Check wind speed
    if (rule.optimalConditions.maxWindSpeed !== undefined) {
      if (weather.windSpeed > rule.optimalConditions.maxWindSpeed) {
        suitable = false;
        reasons.push(`Wind speed ${weather.windSpeed} km/h exceeds maximum ${rule.optimalConditions.maxWindSpeed} km/h`);
      } else {
        reasons.push('Wind conditions are suitable');
      }
    }

    return { suitable, reasons };
  }

  // Recommend best days for tasks
  async recommendTaskSchedule(tasks: any[]): Promise<any[]> {
    const forecast = await this.getWeatherForecast(7);
    const recommendations: any[] = [];

    for (const task of tasks) {
      const taskType = task.type || 'general';
      const bestDays: any[] = [];

      for (const weather of forecast) {
        const suitability = this.isWeatherSuitableForTask(taskType, weather);
        bestDays.push({
          date: weather.date,
          weather,
          suitable: suitability.suitable,
          reasons: suitability.reasons,
          score: this.calculateWeatherScore(taskType, weather)
        });
      }

      // Sort by score (best weather first)
      bestDays.sort((a, b) => b.score - a.score);

      recommendations.push({
        taskId: task._id,
        taskTitle: task.title,
        taskType,
        currentSchedule: task.dueDate,
        recommendedDates: bestDays.slice(0, 3),
        bestDate: bestDays[0].date,
        shouldReschedule: !this.isWeatherSuitableForTask(taskType, 
          forecast.find(f => f.date === new Date(task.dueDate).toISOString().split('T')[0]) || forecast[0]
        ).suitable
      });
    }

    return recommendations;
  }

  // Calculate weather score (0-100)
  private calculateWeatherScore(taskType: string, weather: WeatherData): number {
    const rule = this.weatherRules.find(r => r.taskType === taskType);
    if (!rule) return 50; // Neutral score

    let score = 0;

    // Temperature score (30 points)
    if (rule.optimalConditions.temperature) {
      const { min, max } = rule.optimalConditions.temperature;
      const mid = (min + max) / 2;
      const range = max - min;
      const deviation = Math.abs(weather.temperature - mid) / (range / 2);
      score += Math.max(0, 30 * (1 - deviation));
    } else {
      score += 30;
    }

    // Condition score (30 points)
    if (rule.optimalConditions.condition) {
      score += rule.optimalConditions.condition.includes(weather.condition) ? 30 : 0;
    } else {
      score += 30;
    }

    // Precipitation score (20 points)
    if (rule.optimalConditions.maxPrecipitation !== undefined) {
      const ratio = Math.min(weather.precipitation / rule.optimalConditions.maxPrecipitation, 1);
      score += Math.max(0, 20 * (1 - ratio));
    } else {
      score += 20;
    }

    // Wind score (20 points)
    if (rule.optimalConditions.maxWindSpeed !== undefined) {
      const ratio = Math.min(weather.windSpeed / rule.optimalConditions.maxWindSpeed, 1);
      score += Math.max(0, 20 * (1 - ratio));
    } else {
      score += 20;
    }

    return Math.round(score);
  }

  // Get alerts for upcoming unsuitable weather
  async getWeatherAlerts(tasks: any[]): Promise<any[]> {
    const forecast = await this.getWeatherForecast(3); // Next 3 days
    const alerts: any[] = [];

    for (const task of tasks) {
      if (task.status === 'completed') continue;

      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      const weatherOnTaskDate = forecast.find(f => f.date === taskDate);

      if (weatherOnTaskDate) {
        const suitability = this.isWeatherSuitableForTask(task.type, weatherOnTaskDate);
        
        if (!suitability.suitable) {
          alerts.push({
            taskId: task._id,
            taskTitle: task.title,
            scheduledDate: taskDate,
            weather: weatherOnTaskDate,
            issue: suitability.reasons.filter(r => r.includes('not suitable') || r.includes('exceeds')),
            severity: this.getAlertSeverity(task, weatherOnTaskDate),
            recommendation: 'Consider rescheduling to a more suitable day'
          });
        }
      }
    }

    return alerts;
  }

  private getAlertSeverity(task: any, weather: WeatherData): 'low' | 'medium' | 'high' | 'critical' {
    if (weather.condition === 'stormy') return 'critical';
    if (weather.precipitation > 80) return 'high';
    if (weather.windSpeed > 40) return 'high';
    
    const rule = this.weatherRules.find(r => r.taskType === task.type);
    if (rule?.priority === 'urgent') return 'high';
    if (rule?.priority === 'high') return 'medium';
    
    return 'low';
  }
}

export const weatherScheduler = new WeatherBasedScheduler();
export default weatherScheduler;
