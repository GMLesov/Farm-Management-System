// Manual mock for services/irrigation
export const irrigationService = {
  getAllZones: jest.fn(),
  getZoneById: jest.fn(),
  createZone: jest.fn(),
  updateZone: jest.fn(),
  deleteZone: jest.fn(),
  startZone: jest.fn(),
  stopZone: jest.fn(),
  getSystemStatus: jest.fn(),
  updateSystemStatus: jest.fn(),
  getSchedule: jest.fn(),
  createSchedule: jest.fn(),
  updateSchedule: jest.fn(),
  deleteSchedule: jest.fn(),
  getSensorData: jest.fn(),
  getWeatherData: jest.fn(),
  getRecommendations: jest.fn(),
  getAnalytics: jest.fn(),
};

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
  schedule: any[];
  recommendations: string[];
  efficiency: number;
  coordinates: { lat: number; lng: number };
}
