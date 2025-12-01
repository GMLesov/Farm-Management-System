// Simple weather service for farm management
// This would integrate with a real weather API in production

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy';
  description: string;
  uvIndex: number;
  soilMoisture: number; // Estimated based on recent rainfall
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy';
  chanceOfRain: number;
}

export interface FarmingRecommendation {
  type: 'irrigation' | 'planting' | 'harvesting' | 'pest_control' | 'general';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  action?: string;
}

class WeatherService {
  // Mock weather data - in production, this would call a real weather API
  async getCurrentWeather(farmLocation: string): Promise<WeatherData> {
    // Simulate API delay
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
    
    // Mock data - replace with real API call
    const mockWeather: WeatherData = {
      location: farmLocation || 'Farm Location',
      temperature: 22 + Math.random() * 10, // 22-32°C
      humidity: 60 + Math.random() * 30, // 60-90%
      windSpeed: 5 + Math.random() * 15, // 5-20 km/h
      condition: this.getRandomCondition(),
      description: 'Partly cloudy with occasional sunshine',
      uvIndex: 3 + Math.random() * 8, // 3-11
      soilMoisture: 40 + Math.random() * 40, // 40-80%
      forecast: this.generateForecast(),
    };

    return mockWeather;
  }

  private getRandomCondition(): WeatherData['condition'] {
    const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  private generateForecast(): WeatherForecast[] {
    const forecast: WeatherForecast[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        high: 20 + Math.random() * 15,
        low: 10 + Math.random() * 10,
        condition: this.getRandomCondition(),
        chanceOfRain: Math.random() * 100,
      });
    }
    
    return forecast;
  }

  generateFarmingRecommendations(weather: WeatherData): FarmingRecommendation[] {
    const recommendations: FarmingRecommendation[] = [];

    // Temperature-based recommendations
    if (weather.temperature > 30) {
      recommendations.push({
        type: 'irrigation',
        priority: 'high',
        title: 'High Temperature Alert',
        message: 'Consider increasing irrigation frequency due to high temperatures',
        action: 'Schedule extra watering sessions',
      });
    }

    // Humidity-based recommendations
    if (weather.humidity > 80) {
      recommendations.push({
        type: 'pest_control',
        priority: 'medium',
        title: 'High Humidity Warning',
        message: 'Monitor crops for fungal diseases due to high humidity',
        action: 'Inspect plants for signs of mold or fungus',
      });
    }

    // Wind-based recommendations
    if (weather.windSpeed > 20) {
      recommendations.push({
        type: 'general',
        priority: 'medium',
        title: 'Strong Wind Advisory',
        message: 'Secure loose items and check plant supports',
        action: 'Reinforce plant stakes and covers',
      });
    }

    // Weather condition recommendations
    switch (weather.condition) {
      case 'rainy':
        recommendations.push({
          type: 'irrigation',
          priority: 'low',
          title: 'Rainfall Detected',
          message: 'Reduce irrigation schedules due to natural rainfall',
          action: 'Adjust automatic watering systems',
        });
        break;
      
      case 'sunny':
        if (weather.uvIndex > 8) {
          recommendations.push({
            type: 'general',
            priority: 'medium',
            title: 'High UV Index',
            message: 'Provide shade for sensitive crops and livestock',
            action: 'Deploy shade cloths or move animals to shelter',
          });
        }
        break;
      
      case 'stormy':
        recommendations.push({
          type: 'general',
          priority: 'high',
          title: 'Storm Warning',
          message: 'Prepare for severe weather and secure all equipment',
          action: 'Move animals to shelter and secure farm equipment',
        });
        break;
    }

    // Soil moisture recommendations
    if (weather.soilMoisture < 30) {
      recommendations.push({
        type: 'irrigation',
        priority: 'high',
        title: 'Low Soil Moisture',
        message: 'Soil moisture levels are low, increase irrigation',
        action: 'Schedule immediate watering',
      });
    } else if (weather.soilMoisture > 80) {
      recommendations.push({
        type: 'general',
        priority: 'medium',
        title: 'High Soil Moisture',
        message: 'Monitor for waterlogging and drainage issues',
        action: 'Check drainage systems',
      });
    }

    return recommendations;
  }

  getWeatherIcon(condition: WeatherData['condition']): string {
    switch (condition) {
      case 'sunny': return 'weather-sunny';
      case 'cloudy': return 'weather-cloudy';
      case 'rainy': return 'weather-rainy';
      case 'stormy': return 'weather-lightning';
      case 'foggy': return 'weather-fog';
      default: return 'weather-cloudy';
    }
  }

  getRecommendationIcon(type: FarmingRecommendation['type']): string {
    switch (type) {
      case 'irrigation': return 'water';
      case 'planting': return 'seed';
      case 'harvesting': return 'corn';
      case 'pest_control': return 'bug';
      case 'general': return 'information';
      default: return 'information';
    }
  }

  getPriorityColor(priority: FarmingRecommendation['priority']): string {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#4CAF50';
    }
  }
}

export default new WeatherService();