import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface IrrigationZone {
  id: string;
  name: string;
  area: number;
  cropType: string;
  status: 'active' | 'inactive' | 'scheduled' | 'maintenance' | 'error';
  soilMoisture: number;
  temperature: number;
  humidity: number;
  lastWatered: string;
  nextScheduled: string;
  waterUsage: number;
  flowRate: number;
  pressure: number;
  valveStatus: 'open' | 'closed' | 'partial';
  sensorBattery: number;
  schedule: IrrigationSchedule[];
  recommendations: string[];
  efficiency: number;
  coordinates: { lat: number; lng: number };
}

export interface IrrigationSchedule {
  id: string;
  name: string;
  startTime: string;
  duration: number; // minutes
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'custom';
  daysOfWeek: number[];
  enabled: boolean;
  conditions: {
    minMoisture?: number;
    maxMoisture?: number;
    minTemperature?: number;
    maxTemperature?: number;
    weatherCondition?: string;
  };
}

export interface SystemStatus {
  enabled: boolean;
  autoMode: boolean;
  emergencyMode: boolean;
  totalZones: number;
  activeZones: number;
  totalWaterUsage: number;
  systemPressure: number;
  lastUpdate: string;
}

export interface WaterUsageData {
  date: string;
  zone: string;
  usage: number;
  efficiency: number;
  cost: number;
}

export interface WeatherConditions {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  forecast: string;
  rainChance: number;
  uvIndex: number;
}

class IrrigationService {
  private apiClient = axios.create({
    baseURL: `${API_BASE_URL}/irrigation`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add auth interceptor
    this.apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Irrigation API Error:', error);
        throw error;
      }
    );
  }

  // Zone Management
  async getAllZones(): Promise<IrrigationZone[]> {
    try {
      const response = await this.apiClient.get('/zones');
      // Handle both array and object responses
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.zones)) {
        return data.zones;
      } else if (data && Array.isArray(data.data)) {
        return data.data;
      }
      return this.getMockZones();
    } catch (error) {
      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockZones();
      }
      throw error;
    }
  }

  async getZoneById(zoneId: string): Promise<IrrigationZone> {
    try {
      const response = await this.apiClient.get(`/zones/${zoneId}`);
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        const zones = this.getMockZones();
        const zone = zones.find(z => z.id === zoneId);
        if (zone) return zone;
      }
      throw error;
    }
  }

  async createZone(zone: Omit<IrrigationZone, 'id' | 'status' | 'lastWatered' | 'nextScheduled' | 'waterUsage' | 'pressure' | 'valveStatus' | 'sensorBattery' | 'schedule' | 'recommendations' | 'efficiency'>): Promise<IrrigationZone> {
    try {
      const response = await this.apiClient.post('/zones', zone);
      return response.data;
    } catch (error) {
      // Mock success in development
      if (process.env.NODE_ENV === 'development') {
        return {
          ...zone,
          id: Date.now().toString(),
          status: 'inactive',
          lastWatered: new Date().toISOString(),
          nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          waterUsage: 0,
          pressure: 40,
          valveStatus: 'closed',
          sensorBattery: 100,
          schedule: [],
          recommendations: ['New zone created', 'Configure initial schedule'],
          efficiency: 85,
        };
      }
      throw error;
    }
  }

  async updateZone(zoneId: string, updates: Partial<IrrigationZone>): Promise<IrrigationZone> {
    try {
      const response = await this.apiClient.put(`/zones/${zoneId}`, updates);
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        const zone = await this.getZoneById(zoneId);
        return { ...zone, ...updates };
      }
      throw error;
    }
  }

  async deleteZone(zoneId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/zones/${zoneId}`);
    } catch (error) {
      if (process.env.NODE_ENV !== 'development') {
        throw error;
      }
      // Mock success in development
    }
  }

  // Zone Control Operations
  async startZone(zoneId: string, duration?: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiClient.post(`/zones/${zoneId}/start`, { duration });
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        return { success: true, message: 'Zone started successfully' };
      }
      throw error;
    }
  }

  async stopZone(zoneId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiClient.post(`/zones/${zoneId}/stop`);
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, message: 'Zone stopped successfully' };
      }
      throw error;
    }
  }

  async pauseZone(zoneId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiClient.post(`/zones/${zoneId}/pause`);
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true, message: 'Zone paused successfully' };
      }
      throw error;
    }
  }

  // System Control
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const response = await this.apiClient.get('/system/status');
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return {
          enabled: true,
          autoMode: true,
          emergencyMode: false,
          totalZones: 3,
          activeZones: 1,
          totalWaterUsage: 2220,
          systemPressure: 42,
          lastUpdate: new Date().toISOString(),
        };
      }
      throw error;
    }
  }

  async enableSystem(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiClient.post('/system/enable');
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return { success: true, message: 'System enabled successfully' };
      }
      throw error;
    }
  }

  async disableSystem(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiClient.post('/system/disable');
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return { success: true, message: 'System disabled successfully' };
      }
      throw error;
    }
  }

  async enableAutoMode(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiClient.post('/system/auto-mode/enable');
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return { success: true, message: 'Auto mode enabled successfully' };
      }
      throw error;
    }
  }

  async disableAutoMode(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiClient.post('/system/auto-mode/disable');
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return { success: true, message: 'Auto mode disabled successfully' };
      }
      throw error;
    }
  }

  async activateEmergencyMode(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiClient.post('/system/emergency/activate');
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true, message: 'Emergency irrigation activated' };
      }
      throw error;
    }
  }

  async deactivateEmergencyMode(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiClient.post('/system/emergency/deactivate');
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true, message: 'Emergency mode deactivated' };
      }
      throw error;
    }
  }

  async stopAllZones(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiClient.post('/system/stop-all');
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true, message: 'All zones stopped successfully' };
      }
      throw error;
    }
  }

  // Schedule Management
  async createSchedule(zoneId: string, schedule: Omit<IrrigationSchedule, 'id'>): Promise<IrrigationSchedule> {
    try {
      const response = await this.apiClient.post(`/zones/${zoneId}/schedules`, schedule);
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return {
          ...schedule,
          id: Date.now().toString(),
        };
      }
      throw error;
    }
  }

  async updateSchedule(zoneId: string, scheduleId: string, updates: Partial<IrrigationSchedule>): Promise<IrrigationSchedule> {
    try {
      const response = await this.apiClient.put(`/zones/${zoneId}/schedules/${scheduleId}`, updates);
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return { id: scheduleId, ...updates } as IrrigationSchedule;
      }
      throw error;
    }
  }

  async deleteSchedule(zoneId: string, scheduleId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/zones/${zoneId}/schedules/${scheduleId}`);
    } catch (error) {
      if (process.env.NODE_ENV !== 'development') {
        throw error;
      }
    }
  }

  // Analytics and Reporting
  async getWaterUsageData(startDate: string, endDate: string): Promise<WaterUsageData[]> {
    try {
      const response = await this.apiClient.get('/analytics/water-usage', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.getMockWaterUsageData();
      }
      throw error;
    }
  }

  async getEfficiencyReport(zoneId?: string): Promise<{ zone: string; efficiency: number; recommendations: string[] }[]> {
    try {
      const response = await this.apiClient.get('/analytics/efficiency', {
        params: zoneId ? { zoneId } : {}
      });
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return [
          { zone: 'North Field Alpha', efficiency: 92, recommendations: ['Optimal performance', 'Continue current settings'] },
          { zone: 'South Greenhouse Beta', efficiency: 88, recommendations: ['Check for leaks', 'Adjust flow rate'] },
          { zone: 'East Orchard Gamma', efficiency: 95, recommendations: ['Excellent efficiency', 'Model for other zones'] },
        ];
      }
      throw error;
    }
  }

  // Weather Integration
  async getWeatherConditions(): Promise<WeatherConditions> {
    try {
      const response = await this.apiClient.get('/weather/current');
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return {
          temperature: 22,
          humidity: 65,
          windSpeed: 8,
          precipitation: 0,
          forecast: 'Partly Cloudy',
          rainChance: 15,
          uvIndex: 6,
        };
      }
      throw error;
    }
  }

  async getWeatherBasedRecommendations(): Promise<{ message: string; action: string; priority: 'low' | 'medium' | 'high' }[]> {
    try {
      const response = await this.apiClient.get('/weather/recommendations');
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return [
          { message: 'Low chance of rain expected', action: 'Continue normal irrigation schedule', priority: 'low' },
          { message: 'High temperature forecast', action: 'Consider increasing watering frequency', priority: 'medium' },
        ];
      }
      throw error;
    }
  }

  // Real-time Data
  async getRealTimeData(): Promise<{ zones: IrrigationZone[]; system: SystemStatus }> {
    try {
      const response = await this.apiClient.get('/realtime');
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return {
          zones: this.getMockZones(),
          system: await this.getSystemStatus(),
        };
      }
      throw error;
    }
  }

  // Mock Data for Development
  private getMockZones(): IrrigationZone[] {
    return [
      {
        id: '1',
        name: 'North Field Alpha',
        area: 10.5,
        cropType: 'Corn',
        status: 'active',
        soilMoisture: 65,
        temperature: 22,
        humidity: 68,
        lastWatered: '2025-11-02T14:30:00',
        nextScheduled: '2025-11-03T06:00:00',
        waterUsage: 850,
        flowRate: 15.2,
        pressure: 45,
        valveStatus: 'open',
        sensorBattery: 85,
        schedule: [],
        recommendations: ['Optimal moisture level', 'Continue current schedule'],
        efficiency: 92,
        coordinates: { lat: 40.7128, lng: -74.0060 },
      },
      {
        id: '2',
        name: 'South Greenhouse Beta',
        area: 2.1,
        cropType: 'Tomatoes',
        status: 'scheduled',
        soilMoisture: 35,
        temperature: 25,
        humidity: 75,
        lastWatered: '2025-11-02T08:00:00',
        nextScheduled: '2025-11-03T18:00:00',
        waterUsage: 120,
        flowRate: 8.5,
        pressure: 38,
        valveStatus: 'closed',
        sensorBattery: 92,
        schedule: [],
        recommendations: ['Low moisture detected', 'Increase watering frequency', 'Check for leaks'],
        efficiency: 88,
        coordinates: { lat: 40.7130, lng: -74.0062 },
      },
      {
        id: '3',
        name: 'East Orchard Gamma',
        area: 15.8,
        cropType: 'Apple Trees',
        status: 'inactive',
        soilMoisture: 75,
        temperature: 18,
        humidity: 60,
        lastWatered: '2025-11-01T16:00:00',
        nextScheduled: '2025-11-04T12:00:00',
        waterUsage: 1250,
        flowRate: 12.8,
        pressure: 42,
        valveStatus: 'closed',
        sensorBattery: 78,
        schedule: [],
        recommendations: ['Optimal conditions', 'Reduce frequency in winter'],
        efficiency: 95,
        coordinates: { lat: 40.7135, lng: -74.0058 },
      },
    ];
  }

  private getMockWaterUsageData(): WaterUsageData[] {
    return [
      { date: '2025-11-01', zone: 'North Field Alpha', usage: 850, efficiency: 92, cost: 12.75 },
      { date: '2025-11-01', zone: 'South Greenhouse Beta', usage: 120, efficiency: 88, cost: 1.80 },
      { date: '2025-11-01', zone: 'East Orchard Gamma', usage: 1250, efficiency: 95, cost: 18.75 },
      { date: '2025-11-02', zone: 'North Field Alpha', usage: 820, efficiency: 94, cost: 12.30 },
      { date: '2025-11-02', zone: 'South Greenhouse Beta', usage: 115, efficiency: 90, cost: 1.73 },
      { date: '2025-11-02', zone: 'East Orchard Gamma', usage: 1180, efficiency: 96, cost: 17.70 },
    ];
  }
}

export const irrigationService = new IrrigationService();
export default irrigationService;