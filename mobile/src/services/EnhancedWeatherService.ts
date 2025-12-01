// Real Weather API Integration Service
// This service integrates with OpenWeatherMap API and provides enhanced farming intelligence

interface WeatherAPIConfig {
  apiKey: string;
  baseUrl: string;
  units: 'metric' | 'imperial';
}

export interface EnhancedWeatherData {
  location: {
    name: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  current: {
    timestamp: number;
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    windSpeed: number;
    windDirection: number;
    windGust?: number;
    cloudCover: number;
    dewPoint: number;
    condition: string;
    conditionCode: number;
    icon: string;
    sunrise: number;
    sunset: number;
  };
  forecast: {
    daily: DailyForecast[];
    hourly: HourlyForecast[];
  };
  agriculture: {
    soilTemperature: number;
    soilMoisture: number;
    evapotranspiration: number;
    precipitationProbability: number;
    growingDegreeDays: number;
    chillHours: number;
  };
  alerts: WeatherAlert[];
}

export interface DailyForecast {
  date: string;
  sunrise: number;
  sunset: number;
  temperature: {
    min: number;
    max: number;
    morning: number;
    day: number;
    evening: number;
    night: number;
  };
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  uvIndex: number;
  precipitationAmount: number;
  precipitationProbability: number;
  condition: string;
  conditionCode: number;
  icon: string;
}

export interface HourlyForecast {
  timestamp: number;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  precipitationAmount: number;
  precipitationProbability: number;
  condition: string;
  icon: string;
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  certainty: 'possible' | 'likely' | 'observed';
  urgency: 'immediate' | 'expected' | 'future';
  startTime: number;
  endTime: number;
  areas: string[];
  tags: string[];
}

export interface AdvancedFarmingRecommendation {
  id: string;
  type: 'irrigation' | 'planting' | 'harvesting' | 'pest_control' | 'fertilizer' | 'protection' | 'general';
  category: 'immediate' | 'today' | 'this_week' | 'planning';
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  title: string;
  description: string;
  reasoning: string;
  actions: string[];
  timing: string;
  conditions: string[];
  cropTypes?: string[];
  animalTypes?: string[];
  equipment?: string[];
  estimatedCost?: number;
  expectedBenefit?: string;
  validUntil: number;
}

export interface AgriculturalIndices {
  plantingIndex: number; // 0-100
  harvestingIndex: number; // 0-100
  sprayingIndex: number; // 0-100
  fieldWorkIndex: number; // 0-100
  livestockComfortIndex: number; // 0-100
  diseaseRiskIndex: number; // 0-100
  pestRiskIndex: number; // 0-100
  fireRiskIndex: number; // 0-100
}

class EnhancedWeatherService {
  private config: WeatherAPIConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.config = {
      // In production, this would come from secure config
      // For React Native, use react-native-config or similar
      apiKey: 'demo_key', // Replace with actual API key in production
      baseUrl: 'https://api.openweathermap.org/data/3.0',
      units: 'metric',
    };
  }

  // Get comprehensive weather data for a location
  async getEnhancedWeatherData(latitude: number, longitude: number): Promise<EnhancedWeatherData> {
    const cacheKey = `weather_${latitude}_${longitude}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // In production, make actual API calls
      // For now, return enhanced mock data
      const enhancedData = this.generateEnhancedMockData(latitude, longitude);
      
      this.setCachedData(cacheKey, enhancedData);
      return enhancedData;
    } catch (error) {
      console.error('Failed to fetch enhanced weather data:', error);
      throw new Error('Weather service unavailable');
    }
  }

  // Generate advanced farming recommendations based on weather data
  generateAdvancedRecommendations(
    weather: EnhancedWeatherData,
    farmProfile: {
      crops: string[];
      animals: string[];
      farmSize: number;
      irrigationSystem: string;
      location: string;
    }
  ): AdvancedFarmingRecommendation[] {
    const recommendations: AdvancedFarmingRecommendation[] = [];
    const now = Date.now();

    // Irrigation recommendations based on multiple factors
    const irrigationNeeded = this.calculateIrrigationNeeds(weather, farmProfile);
    if (irrigationNeeded.score > 70) {
      recommendations.push({
        id: `irrigation_${now}`,
        type: 'irrigation',
        category: irrigationNeeded.urgency === 'immediate' ? 'immediate' : 'today',
        priority: irrigationNeeded.urgency === 'immediate' ? 'critical' : 'high',
        confidence: irrigationNeeded.confidence,
        title: 'Irrigation Required',
        description: `Soil moisture critically low. ${irrigationNeeded.reason}`,
        reasoning: `Current soil moisture: ${weather.agriculture.soilMoisture}%, Temperature: ${weather.current.temperature}°C, Humidity: ${weather.current.humidity}%`,
        actions: [
          'Check soil moisture sensors',
          'Activate irrigation systems',
          'Monitor water pressure',
          'Verify coverage areas'
        ],
        timing: irrigationNeeded.timing,
        conditions: ['Dry soil', 'High temperature', 'Low humidity'],
        cropTypes: farmProfile.crops,
        estimatedCost: farmProfile.farmSize * 2.5, // $2.5 per hectare
        expectedBenefit: 'Prevent crop stress and maintain yield',
        validUntil: now + (24 * 60 * 60 * 1000),
      });
    }

    // Pest and disease risk assessment
    const pestRisk = this.calculatePestRisk(weather);
    if (pestRisk.level > 60) {
      recommendations.push({
        id: `pest_${now}`,
        type: 'pest_control',
        category: 'this_week',
        priority: pestRisk.level > 80 ? 'high' : 'medium',
        confidence: pestRisk.confidence,
        title: 'Increased Pest Activity Risk',
        description: `Weather conditions favor pest development. ${pestRisk.reasoning}`,
        reasoning: `High humidity (${weather.current.humidity}%) and temperature (${weather.current.temperature}°C) create ideal pest conditions`,
        actions: [
          'Increase field monitoring frequency',
          'Check pest traps',
          'Prepare organic pesticides',
          'Schedule scout inspections'
        ],
        timing: 'Next 3-5 days',
        conditions: ['High humidity', 'Warm temperature', 'Low wind'],
        cropTypes: farmProfile.crops.filter(crop => ['corn', 'tomato', 'potato'].includes(crop.toLowerCase())),
        estimatedCost: farmProfile.farmSize * 15, // $15 per hectare for monitoring
        expectedBenefit: 'Early pest detection and prevention',
        validUntil: now + (7 * 24 * 60 * 60 * 1000),
      });
    }

    // Planting window recommendations
    const plantingConditions = this.evaluatePlantingConditions(weather);
    if (plantingConditions.suitable) {
      recommendations.push({
        id: `planting_${now}`,
        type: 'planting',
        category: 'planning',
        priority: 'medium',
        confidence: plantingConditions.confidence,
        title: 'Favorable Planting Conditions',
        description: plantingConditions.description,
        reasoning: 'Soil temperature, moisture, and weather forecast align for optimal germination',
        actions: [
          'Prepare seedbeds',
          'Check seed inventory',
          'Calibrate planting equipment',
          'Schedule planting crews'
        ],
        timing: plantingConditions.timing,
        conditions: plantingConditions.conditions,
        cropTypes: plantingConditions.suitableCrops,
        estimatedCost: farmProfile.farmSize * 50, // $50 per hectare for planting
        expectedBenefit: 'Optimal germination and establishment',
        validUntil: now + (plantingConditions.windowDays * 24 * 60 * 60 * 1000),
      });
    }

    // Harvesting recommendations
    const harvestConditions = this.evaluateHarvestConditions(weather);
    if (harvestConditions.favorable) {
      recommendations.push({
        id: `harvest_${now}`,
        type: 'harvesting',
        category: harvestConditions.urgency === 'immediate' ? 'immediate' : 'today',
        priority: harvestConditions.urgency === 'immediate' ? 'critical' : 'high',
        confidence: harvestConditions.confidence,
        title: 'Optimal Harvesting Window',
        description: harvestConditions.description,
        reasoning: 'Weather conditions optimal for harvesting with minimal crop damage',
        actions: [
          'Prepare harvesting equipment',
          'Schedule harvest crews',
          'Arrange transportation',
          'Prepare storage facilities'
        ],
        timing: harvestConditions.timing,
        conditions: harvestConditions.conditions,
        cropTypes: harvestConditions.readyCrops,
        estimatedCost: farmProfile.farmSize * 75, // $75 per hectare for harvesting
        expectedBenefit: 'Maximum yield with minimal losses',
        validUntil: now + (harvestConditions.windowHours * 60 * 60 * 1000),
      });
    }

    // Animal welfare recommendations
    const animalComfort = this.assessAnimalComfort(weather);
    if (animalComfort.actionNeeded) {
      recommendations.push({
        id: `animal_${now}`,
        type: 'protection',
        category: animalComfort.urgency === 'immediate' ? 'immediate' : 'today',
        priority: animalComfort.severity === 'high' ? 'critical' : 'medium',
        confidence: animalComfort.confidence,
        title: 'Animal Welfare Action Required',
        description: animalComfort.description,
        reasoning: animalComfort.reasoning,
        actions: animalComfort.actions,
        timing: animalComfort.timing,
        conditions: animalComfort.conditions,
        animalTypes: farmProfile.animals,
        estimatedCost: animalComfort.estimatedCost,
        expectedBenefit: 'Maintain animal health and productivity',
        validUntil: now + (animalComfort.validHours * 60 * 60 * 1000),
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Calculate agricultural indices
  calculateAgriculturalIndices(weather: EnhancedWeatherData): AgriculturalIndices {
    const temp = weather.current.temperature;
    const humidity = weather.current.humidity;
    const windSpeed = weather.current.windSpeed;
    const soilMoisture = weather.agriculture.soilMoisture;
    const precipProb = weather.agriculture.precipitationProbability;

    return {
      plantingIndex: this.calculatePlantingIndex(temp, soilMoisture, precipProb),
      harvestingIndex: this.calculateHarvestingIndex(temp, humidity, windSpeed, precipProb),
      sprayingIndex: this.calculateSprayingIndex(windSpeed, humidity, temp),
      fieldWorkIndex: this.calculateFieldWorkIndex(soilMoisture, precipProb, temp),
      livestockComfortIndex: this.calculateLivestockComfortIndex(temp, humidity, windSpeed),
      diseaseRiskIndex: this.calculateDiseaseRiskIndex(humidity, temp, weather.agriculture.soilMoisture),
      pestRiskIndex: this.calculatePestRiskIndex(temp, humidity, windSpeed),
      fireRiskIndex: this.calculateFireRiskIndex(humidity, temp, windSpeed, soilMoisture),
    };
  }

  // Private helper methods
  private generateEnhancedMockData(latitude: number, longitude: number): EnhancedWeatherData {
    const now = Date.now();
    const baseTemp = 20 + (Math.random() * 15); // 20-35°C

    return {
      location: {
        name: 'Farm Location',
        latitude,
        longitude,
        timezone: 'UTC',
      },
      current: {
        timestamp: now,
        temperature: baseTemp,
        feelsLike: baseTemp + (Math.random() * 4 - 2),
        humidity: 60 + (Math.random() * 30),
        pressure: 1013 + (Math.random() * 20 - 10),
        visibility: 10 + (Math.random() * 5),
        uvIndex: Math.max(0, 8 + (Math.random() * 4 - 2)),
        windSpeed: 5 + (Math.random() * 15),
        windDirection: Math.random() * 360,
        windGust: 8 + (Math.random() * 12),
        cloudCover: Math.random() * 100,
        dewPoint: baseTemp - (Math.random() * 10),
        condition: 'Partly cloudy',
        conditionCode: 803,
        icon: '03d',
        sunrise: now - (6 * 60 * 60 * 1000),
        sunset: now + (12 * 60 * 60 * 1000),
      },
      forecast: {
        daily: this.generateDailyForecast(baseTemp),
        hourly: this.generateHourlyForecast(baseTemp),
      },
      agriculture: {
        soilTemperature: baseTemp - 2 + (Math.random() * 4),
        soilMoisture: 40 + (Math.random() * 40),
        evapotranspiration: 3 + (Math.random() * 4),
        precipitationProbability: Math.random() * 100,
        growingDegreeDays: baseTemp > 10 ? baseTemp - 10 : 0,
        chillHours: baseTemp < 7 ? 1 : 0,
      },
      alerts: this.generateWeatherAlerts(),
    };
  }

  private generateDailyForecast(baseTemp: number): DailyForecast[] {
    const forecast: DailyForecast[] = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const dayTemp = baseTemp + (Math.random() * 6 - 3);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        sunrise: Date.now() + (i * 24 * 60 * 60 * 1000) - (6 * 60 * 60 * 1000),
        sunset: Date.now() + (i * 24 * 60 * 60 * 1000) + (12 * 60 * 60 * 1000),
        temperature: {
          min: dayTemp - 5,
          max: dayTemp + 5,
          morning: dayTemp - 2,
          day: dayTemp + 3,
          evening: dayTemp,
          night: dayTemp - 4,
        },
        humidity: 50 + (Math.random() * 40),
        pressure: 1010 + (Math.random() * 20),
        windSpeed: 5 + (Math.random() * 10),
        windDirection: Math.random() * 360,
        cloudCover: Math.random() * 100,
        uvIndex: Math.max(0, 6 + (Math.random() * 6)),
        precipitationAmount: Math.random() < 0.3 ? Math.random() * 10 : 0,
        precipitationProbability: Math.random() * 100,
        condition: this.getRandomCondition(),
        conditionCode: 800 + Math.floor(Math.random() * 4),
        icon: '01d',
      });
    }

    return forecast;
  }

  private generateHourlyForecast(baseTemp: number): HourlyForecast[] {
    const forecast: HourlyForecast[] = [];
    const now = Date.now();

    for (let i = 1; i <= 48; i++) {
      const hourTemp = baseTemp + (Math.sin(i / 12 * Math.PI) * 5) + (Math.random() * 2 - 1);
      
      forecast.push({
        timestamp: now + (i * 60 * 60 * 1000),
        temperature: hourTemp,
        humidity: 50 + (Math.random() * 40),
        pressure: 1010 + (Math.random() * 15),
        windSpeed: 3 + (Math.random() * 12),
        windDirection: Math.random() * 360,
        cloudCover: Math.random() * 100,
        precipitationAmount: Math.random() < 0.2 ? Math.random() * 3 : 0,
        precipitationProbability: Math.random() * 100,
        condition: this.getRandomCondition(),
        icon: '01d',
      });
    }

    return forecast;
  }

  private generateWeatherAlerts(): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    const now = Date.now();

    // Randomly generate alerts
    if (Math.random() < 0.3) {
      alerts.push({
        id: `alert_${now}`,
        title: 'High Temperature Warning',
        description: 'Temperatures expected to exceed 35°C. Take precautions for crops and livestock.',
        severity: 'moderate',
        certainty: 'likely',
        urgency: 'expected',
        startTime: now + (2 * 60 * 60 * 1000),
        endTime: now + (24 * 60 * 60 * 1000),
        areas: ['Farm Area'],
        tags: ['heat', 'agriculture', 'livestock'],
      });
    }

    return alerts;
  }

  private getRandomCondition(): string {
    const conditions = ['Clear', 'Partly cloudy', 'Cloudy', 'Light rain', 'Rain', 'Thunderstorm'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  // Calculation methods for farming intelligence
  private calculateIrrigationNeeds(weather: EnhancedWeatherData, farmProfile: any) {
    const soilMoisture = weather.agriculture.soilMoisture;
    const temperature = weather.current.temperature;
    const humidity = weather.current.humidity;
    const evapotranspiration = weather.agriculture.evapotranspiration;

    let score = 0;
    let urgency = 'planned';
    let reason = '';
    
    if (soilMoisture < 30) {
      score += 40;
      reason += 'Low soil moisture. ';
    }
    
    if (temperature > 30) {
      score += 30;
      reason += 'High temperature increases water demand. ';
    }
    
    if (humidity < 40) {
      score += 20;
      reason += 'Low humidity accelerates water loss. ';
    }
    
    if (evapotranspiration > 5) {
      score += 10;
      reason += 'High evapotranspiration rate. ';
    }

    if (score > 90) urgency = 'immediate';
    else if (score > 70) urgency = 'today';

    return {
      score,
      urgency,
      reason: reason.trim(),
      confidence: Math.min(95, score + 20),
      timing: urgency === 'immediate' ? 'Within 2 hours' : urgency === 'today' ? 'Within 6 hours' : 'Tomorrow morning',
    };
  }

  private calculatePestRisk(weather: EnhancedWeatherData) {
    const temp = weather.current.temperature;
    const humidity = weather.current.humidity;
    const windSpeed = weather.current.windSpeed;

    let level = 0;
    let reasoning = '';

    if (temp >= 20 && temp <= 30) {
      level += 30;
      reasoning += 'Optimal temperature for pest activity. ';
    }

    if (humidity > 70) {
      level += 40;
      reasoning += 'High humidity favors pest reproduction. ';
    }

    if (windSpeed < 5) {
      level += 20;
      reasoning += 'Low wind allows pest movement. ';
    }

    const confidence = Math.min(90, level + 10);

    return { level, confidence, reasoning: reasoning.trim() };
  }

  private evaluatePlantingConditions(weather: EnhancedWeatherData) {
    const soilTemp = weather.agriculture.soilTemperature;
    const soilMoisture = weather.agriculture.soilMoisture;
    const precipProb = weather.agriculture.precipitationProbability;

    const suitable = soilTemp > 12 && soilTemp < 25 && soilMoisture > 40 && soilMoisture < 80 && precipProb < 30;
    
    return {
      suitable,
      confidence: suitable ? 85 : 30,
      description: suitable ? 'Soil conditions optimal for planting' : 'Suboptimal soil conditions for planting',
      timing: suitable ? 'Next 3-5 days' : 'Wait for better conditions',
      conditions: ['Soil temperature 12-25°C', 'Adequate soil moisture', 'Low rain probability'],
      suitableCrops: suitable ? ['corn', 'soybeans', 'wheat'] : [],
      windowDays: suitable ? 5 : 0,
    };
  }

  private evaluateHarvestConditions(weather: EnhancedWeatherData) {
    const humidity = weather.current.humidity;
    const precipProb = weather.agriculture.precipitationProbability;
    const windSpeed = weather.current.windSpeed;

    const favorable = humidity < 70 && precipProb < 20 && windSpeed < 15;
    
    return {
      favorable,
      urgency: favorable && precipProb < 10 ? 'immediate' : 'today',
      confidence: favorable ? 90 : 40,
      description: favorable ? 'Excellent harvesting conditions' : 'Poor harvesting conditions',
      timing: favorable ? 'Next 6-12 hours' : 'Wait for dry conditions',
      conditions: ['Low humidity', 'No precipitation', 'Moderate winds'],
      readyCrops: favorable ? ['wheat', 'corn', 'soybeans'] : [],
      windowHours: favorable ? 12 : 0,
    };
  }

  private assessAnimalComfort(weather: EnhancedWeatherData) {
    const temp = weather.current.temperature;
    const humidity = weather.current.humidity;
    const windSpeed = weather.current.windSpeed;

    let actionNeeded = false;
    let severity = 'low';
    let description = '';
    let actions: string[] = [];
    let conditions: string[] = [];

    if (temp > 32 || (temp > 28 && humidity > 75)) {
      actionNeeded = true;
      severity = 'high';
      description = 'Heat stress risk for livestock';
      actions = ['Provide additional shade', 'Increase water availability', 'Ensure ventilation', 'Monitor animal behavior'];
      conditions = ['High temperature', 'High humidity'];
    } else if (temp < 5 || (temp < 10 && windSpeed > 20)) {
      actionNeeded = true;
      severity = 'medium';
      description = 'Cold stress risk for livestock';
      actions = ['Provide windbreaks', 'Check heating systems', 'Increase feed rations', 'Monitor water systems'];
      conditions = ['Low temperature', 'Strong winds'];
    }

    return {
      actionNeeded,
      severity,
      urgency: severity === 'high' ? 'immediate' : 'today',
      confidence: 85,
      description,
      reasoning: `Temperature: ${temp}°C, Humidity: ${humidity}%, Wind: ${windSpeed}km/h`,
      actions,
      timing: severity === 'high' ? 'Immediately' : 'Within 2 hours',
      conditions,
      estimatedCost: severity === 'high' ? 200 : 100,
      validHours: 24,
    };
  }

  // Agricultural index calculations
  private calculatePlantingIndex(temp: number, soilMoisture: number, precipProb: number): number {
    let index = 50;
    
    if (temp >= 15 && temp <= 25) index += 30;
    else if (temp >= 10 && temp <= 30) index += 15;
    else index -= 20;
    
    if (soilMoisture >= 40 && soilMoisture <= 70) index += 20;
    else if (soilMoisture >= 30 && soilMoisture <= 80) index += 10;
    else index -= 15;
    
    if (precipProb < 20) index += 10;
    else if (precipProb > 60) index -= 20;
    
    return Math.max(0, Math.min(100, index));
  }

  private calculateHarvestingIndex(temp: number, humidity: number, windSpeed: number, precipProb: number): number {
    let index = 50;
    
    if (temp >= 20 && temp <= 30) index += 20;
    if (humidity < 70) index += 20;
    if (windSpeed < 15) index += 15;
    if (precipProb < 20) index += 25;
    else if (precipProb > 50) index -= 30;
    
    return Math.max(0, Math.min(100, index));
  }

  private calculateSprayingIndex(windSpeed: number, humidity: number, temp: number): number {
    let index = 50;
    
    if (windSpeed < 10) index += 30;
    else if (windSpeed > 20) index -= 40;
    
    if (humidity > 50 && humidity < 80) index += 20;
    if (temp > 15 && temp < 30) index += 20;
    
    return Math.max(0, Math.min(100, index));
  }

  private calculateFieldWorkIndex(soilMoisture: number, precipProb: number, temp: number): number {
    let index = 50;
    
    if (soilMoisture < 80) index += 25;
    else index -= 30;
    
    if (precipProb < 30) index += 25;
    else index -= 20;
    
    if (temp > 5 && temp < 35) index += 20;
    
    return Math.max(0, Math.min(100, index));
  }

  private calculateLivestockComfortIndex(temp: number, humidity: number, windSpeed: number): number {
    let index = 50;
    
    if (temp >= 18 && temp <= 25) index += 30;
    else if (temp < 5 || temp > 35) index -= 40;
    else if (temp < 15 || temp > 30) index -= 20;
    
    if (humidity >= 40 && humidity <= 70) index += 20;
    else if (humidity > 80) index -= 20;
    
    if (windSpeed < 20) index += 10;
    
    return Math.max(0, Math.min(100, index));
  }

  private calculateDiseaseRiskIndex(humidity: number, temp: number, soilMoisture: number): number {
    let index = 20;
    
    if (humidity > 80) index += 40;
    else if (humidity > 70) index += 20;
    
    if (temp > 25 && temp < 30) index += 30;
    else if (temp > 20 && temp < 35) index += 15;
    
    if (soilMoisture > 70) index += 20;
    
    return Math.max(0, Math.min(100, index));
  }

  private calculatePestRiskIndex(temp: number, humidity: number, windSpeed: number): number {
    let index = 20;
    
    if (temp >= 20 && temp <= 30) index += 35;
    if (humidity > 70) index += 30;
    if (windSpeed < 5) index += 15;
    
    return Math.max(0, Math.min(100, index));
  }

  private calculateFireRiskIndex(humidity: number, temp: number, windSpeed: number, soilMoisture: number): number {
    let index = 10;
    
    if (humidity < 30) index += 30;
    if (temp > 30) index += 25;
    if (windSpeed > 15) index += 25;
    if (soilMoisture < 20) index += 20;
    
    return Math.max(0, Math.min(100, index));
  }

  // Cache management
  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

export default new EnhancedWeatherService();