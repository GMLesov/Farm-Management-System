import axios, { AxiosInstance } from 'axios';
import {
  EnhancedCrop,
  CropResponse,
  CropsResponse,
  CropTask,
  WorkerAssignment,
  CropAnalytics,
  CropPrediction,
  CropSearchParams,
  HarvestSchedule,
  YieldRecord,
  WorkHourLog,
  HealthStatus,
  Recommendation
} from '../types/crop';

class CropService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
        console.error('Crop API Error:', error);
        throw error;
      }
    );
  }

  // Crop Management
  async getAllCrops(params?: CropSearchParams): Promise<EnhancedCrop[]> {
    try {
      const response = await this.apiClient.get('/crops', { params });
      // Handle different response structures
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('getAllCrops error:', error);
      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockCrops();
      }
      // Return empty array instead of throwing to prevent crashes
      return [];
    }
  }

  async getCropById(cropId: string): Promise<EnhancedCrop> {
    try {
      const response = await this.apiClient.get(`/crops/${cropId}`);
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        const mockCrops = this.getMockCrops();
        const crop = mockCrops.find(c => c.id === cropId);
        if (crop) return crop;
      }
      throw error;
    }
  }

  async createCrop(cropData: Omit<EnhancedCrop, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnhancedCrop> {
    try {
      const response = await this.apiClient.post('/crops', cropData);
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return {
          ...cropData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as EnhancedCrop;
      }
      throw error;
    }
  }

  async updateCrop(cropId: string, cropData: Partial<EnhancedCrop>): Promise<EnhancedCrop> {
    try {
      const response = await this.apiClient.put(`/crops/${cropId}`, cropData);
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        const existingCrop = await this.getCropById(cropId);
        return {
          ...existingCrop,
          ...cropData,
          updatedAt: new Date().toISOString(),
        };
      }
      throw error;
    }
  }

  async deleteCrop(cropId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/crops/${cropId}`);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Mock: Crop deleted successfully');
        return;
      }
      throw error;
    }
  }

  // Task Management
  async getCropTasks(cropId: string): Promise<CropTask[]> {
    try {
      const response = await this.apiClient.get(`/crops/${cropId}/tasks`);
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.getMockCropTasks(cropId);
      }
      throw error;
    }
  }

  async createCropTask(cropId: string, taskData: Omit<CropTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<CropTask> {
    try {
      const response = await this.apiClient.post(`/crops/${cropId}/tasks`, taskData);
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as CropTask;
      }
      throw error;
    }
  }

  async updateCropTask(cropId: string, taskId: string, taskData: Partial<CropTask>): Promise<CropTask> {
    try {
      const response = await this.apiClient.put(`/crops/${cropId}/tasks/${taskId}`, taskData);
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        const existingTasks = await this.getCropTasks(cropId);
        const existingTask = existingTasks.find(t => t.id === taskId);
        if (!existingTask) throw new Error('Task not found');
        
        return {
          ...existingTask,
          ...taskData,
          updatedAt: new Date().toISOString(),
        };
      }
      throw error;
    }
  }

  async deleteCropTask(cropId: string, taskId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/crops/${cropId}/tasks/${taskId}`);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Mock: Task deleted successfully');
        return;
      }
      throw error;
    }
  }

  async scheduleTask(cropId: string, taskData: {
    taskType: string;
    scheduledDate: string;
    description: string;
    recurring?: boolean;
    recurringInterval?: string;
  }): Promise<any> {
    try {
      const response = await this.apiClient.post(`/crops/${cropId}/tasks`, taskData);
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Mock: Task scheduled successfully', taskData);
        return { success: true, message: 'Task scheduled successfully' };
      }
      throw error;
    }
  }

  // Worker Assignment
  async assignWorkerToCrop(cropId: string, assignment: Omit<WorkerAssignment, 'id'>): Promise<WorkerAssignment> {
    try {
      const response = await this.apiClient.post(`/crops/${cropId}/workers`, assignment);
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return {
          ...assignment,
          id: Date.now().toString(),
        };
      }
      throw error;
    }
  }

  async updateWorkerAssignment(cropId: string, assignmentId: string, assignment: Partial<WorkerAssignment>): Promise<WorkerAssignment> {
    try {
      const response = await this.apiClient.put(`/crops/${cropId}/workers/${assignmentId}`, assignment);
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        const crop = await this.getCropById(cropId);
        const existingAssignment = crop.assignedWorkers.find(w => w.id === assignmentId);
        if (!existingAssignment) throw new Error('Assignment not found');
        
        return {
          ...existingAssignment,
          ...assignment,
        };
      }
      throw error;
    }
  }

  async removeWorkerFromCrop(cropId: string, assignmentId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/crops/${cropId}/workers/${assignmentId}`);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Mock: Worker assignment removed successfully');
        return;
      }
      throw error;
    }
  }

  // Work Hour Logging
  async logWorkHours(cropId: string, workHourData: Omit<WorkHourLog, 'id' | 'createdAt'>): Promise<WorkHourLog> {
    try {
      const response = await this.apiClient.post(`/crops/${cropId}/work-hours`, workHourData);
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return {
          ...workHourData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
      }
      throw error;
    }
  }

  async getWorkHours(cropId: string, startDate?: string, endDate?: string): Promise<WorkHourLog[]> {
    try {
      const params = { startDate, endDate };
      const response = await this.apiClient.get(`/crops/${cropId}/work-hours`, { params });
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.getMockWorkHours(cropId);
      }
      throw error;
    }
  }

  // Harvest Management
  async scheduleHarvest(cropId: string, scheduleData: Omit<HarvestSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<HarvestSchedule> {
    try {
      const response = await this.apiClient.post(`/crops/${cropId}/harvest/schedule`, scheduleData);
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return {
          ...scheduleData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      throw error;
    }
  }

  async recordYield(cropId: string, yieldData: Omit<YieldRecord, 'id' | 'createdAt'>): Promise<YieldRecord> {
    try {
      const response = await this.apiClient.post(`/crops/${cropId}/harvest/yield`, yieldData);
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return {
          ...yieldData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
      }
      throw error;
    }
  }

  // Health and Monitoring
  async updateHealthStatus(cropId: string, healthData: HealthStatus): Promise<HealthStatus> {
    try {
      const response = await this.apiClient.put(`/crops/${cropId}/health`, healthData);
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return healthData;
      }
      throw error;
    }
  }

  async addRecommendation(cropId: string, recommendation: Omit<Recommendation, 'id' | 'createdAt'>): Promise<Recommendation> {
    try {
      const response = await this.apiClient.post(`/crops/${cropId}/recommendations`, recommendation);
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return {
          ...recommendation,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
      }
      throw error;
    }
  }

  // Analytics and Insights
  async getCropAnalytics(farmId?: string): Promise<CropAnalytics> {
    try {
      const params = farmId ? { farmId } : {};
      const response = await this.apiClient.get('/crops/analytics', { params });
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.getMockCropAnalytics();
      }
      throw error;
    }
  }

  async getCropPredictions(cropId: string): Promise<CropPrediction> {
    try {
      const response = await this.apiClient.get(`/crops/${cropId}/predictions`);
      return response.data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.getMockCropPrediction(cropId);
      }
      throw error;
    }
  }

  // File Upload
  async uploadCropPhoto(cropId: string, file: File, metadata: any): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await this.apiClient.post(`/crops/${cropId}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data.url;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return `https://example.com/mock-photo-${Date.now()}.jpg`;
      }
      throw error;
    }
  }

  // Mock Data Methods
  private getMockCrops(): EnhancedCrop[] {
    return [
      {
        id: '1',
        farmId: 'farm_1',
        name: 'Premium Tomatoes',
        variety: 'Cherokee Purple',
        category: 'vegetables',
        fieldLocation: 'Greenhouse Block A',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        area: 2.5,
        soilType: 'Loamy',
        plantingDate: '2025-09-15T00:00:00Z',
        expectedHarvestDate: '2025-12-01T00:00:00Z',
        stage: {
          current: 'fruiting',
          progress: 75,
          expectedDuration: 85,
          actualDuration: 63,
          milestones: [
            {
              name: 'First Flowering',
              targetDate: '2025-10-20T00:00:00Z',
              actualDate: '2025-10-18T00:00:00Z',
              status: 'achieved',
              description: 'First flowers appeared',
              requirements: ['Adequate pollination', 'Temperature control']
            }
          ]
        },
        growthProgress: 75,
        assignedWorkers: [
          {
            id: 'wa_1',
            workerId: 'worker_1',
            workerName: 'Maria Rodriguez',
            role: 'supervisor',
            assignedDate: '2025-09-15T00:00:00Z',
            responsibilities: ['Daily monitoring', 'Pest control', 'Harvest coordination'],
            isActive: true,
            performance: {
              efficiency: 92,
              qualityScore: 95,
              tasksCompleted: 28,
              averageTimePerTask: 45,
              lastEvaluation: '2025-10-30T00:00:00Z'
            }
          }
        ],
        taskSchedule: [],
        workHours: [],
        varietyInfo: {
          scientificName: 'Solanum lycopersicum',
          growthHabit: 'Indeterminate',
          maturityDays: 85,
          yieldPotential: 60000,
          climateZone: ['Zone 6', 'Zone 7', 'Zone 8'],
          soilPreference: ['Loamy', 'Sandy Loam'],
          waterRequirement: 'high',
          sunlightRequirement: 'full_sun',
          spacing: {
            rowSpacing: 120,
            plantSpacing: 60
          }
        },
        environmentalConditions: {
          temperature: {
            min: 18,
            max: 28,
            average: 23,
            optimal: { min: 20, max: 26 }
          },
          humidity: {
            current: 65,
            optimal: { min: 60, max: 70 }
          },
          soilMoisture: {
            current: 70,
            optimal: { min: 65, max: 80 }
          },
          ph: {
            current: 6.2,
            optimal: { min: 6.0, max: 6.8 }
          },
          lightHours: 14,
          lastUpdated: '2025-11-03T12:00:00Z'
        },
        fertilizerPlan: [],
        irrigationSchedule: [],
        pestControlLog: [],
        harvestSchedule: [],
        harvestYield: [],
        qualityMetrics: {
          overallGrade: 'A',
          size: {
            average: 150,
            range: { min: 120, max: 180 },
            uniformity: 88
          },
          color: {
            score: 92,
            consistency: 85
          },
          defects: [],
          pestDamage: 5,
          diseasePresence: 2,
          nutritionalValue: {
            vitamins: { 'C': 28, 'K': 7.9 },
            minerals: { 'Potassium': 237, 'Folate': 15 }
          },
          shelfLife: 7,
          lastAssessment: '2025-11-01T00:00:00Z'
        },
        photos: [],
        healthStatus: {
          overall: 'excellent',
          plantVigor: 92,
          diseasePresence: [],
          pestPresence: [],
          nutritionalDeficiency: [],
          stressFactors: [],
          treatmentHistory: [],
          lastAssessment: '2025-11-01T00:00:00Z',
          nextAssessmentDue: '2025-11-08T00:00:00Z'
        },
        riskFactors: [],
        recommendations: [],
        costs: [],
        expectedRevenue: 45000,
        actualRevenue: 0,
        notes: 'High-value heirloom variety for premium market',
        tags: ['premium', 'heirloom', 'organic'],
        createdAt: '2025-09-15T00:00:00Z',
        updatedAt: '2025-11-03T12:00:00Z',
        createdBy: 'user_1'
      },
      {
        id: '2',
        farmId: 'farm_1',
        name: 'Sweet Corn Field',
        variety: 'Honey Select',
        category: 'grains',
        fieldLocation: 'North Field 1',
        coordinates: { lat: 40.7130, lng: -74.0058 },
        area: 5.0,
        soilType: 'Clay Loam',
        plantingDate: '2025-05-01T00:00:00Z',
        expectedHarvestDate: '2025-08-15T00:00:00Z',
        actualHarvestDate: '2025-08-18T00:00:00Z',
        stage: {
          current: 'post_harvest',
          progress: 100,
          expectedDuration: 110,
          actualDuration: 109,
          milestones: []
        },
        growthProgress: 100,
        assignedWorkers: [
          {
            id: 'wa_2',
            workerId: 'worker_2',
            workerName: 'James Wilson',
            role: 'field_worker',
            assignedDate: '2025-05-01T00:00:00Z',
            endDate: '2025-08-20T00:00:00Z',
            responsibilities: ['Field maintenance', 'Irrigation', 'Harvest'],
            isActive: false,
            performance: {
              efficiency: 88,
              qualityScore: 90,
              tasksCompleted: 45,
              averageTimePerTask: 60,
              lastEvaluation: '2025-08-20T00:00:00Z'
            }
          }
        ],
        taskSchedule: [],
        workHours: [],
        varietyInfo: {
          scientificName: 'Zea mays',
          growthHabit: 'Annual',
          maturityDays: 78,
          yieldPotential: 12000,
          climateZone: ['Zone 4', 'Zone 5', 'Zone 6', 'Zone 7'],
          soilPreference: ['Clay Loam', 'Loamy'],
          waterRequirement: 'medium',
          sunlightRequirement: 'full_sun',
          spacing: {
            rowSpacing: 75,
            plantSpacing: 30
          }
        },
        environmentalConditions: {
          temperature: {
            min: 12,
            max: 32,
            average: 22,
            optimal: { min: 16, max: 30 }
          },
          humidity: {
            current: 55,
            optimal: { min: 50, max: 70 }
          },
          soilMoisture: {
            current: 45,
            optimal: { min: 50, max: 70 }
          },
          ph: {
            current: 6.5,
            optimal: { min: 6.0, max: 7.0 }
          },
          lightHours: 13,
          lastUpdated: '2025-11-03T12:00:00Z'
        },
        fertilizerPlan: [],
        irrigationSchedule: [],
        pestControlLog: [],
        harvestSchedule: [],
        harvestYield: [
          {
            id: 'yield_1',
            harvestDate: '2025-08-18T00:00:00Z',
            quantity: 11500,
            unit: 'kg',
            quality: 'grade_a',
            marketPrice: 2.50,
            buyer: 'Local Market Co-op',
            revenue: 28750,
            harvestCost: 3500,
            netProfit: 25250,
            workerHours: 48,
            productivity: 239.6,
            notes: 'Excellent quality harvest, slightly delayed due to weather',
            photos: [],
            storageLocation: 'Cold Storage Unit 2',
            batchNumber: 'CORN-2025-001',
            createdAt: '2025-08-18T00:00:00Z'
          }
        ],
        qualityMetrics: {
          overallGrade: 'A',
          size: {
            average: 20,
            range: { min: 18, max: 22 },
            uniformity: 90
          },
          color: {
            score: 88,
            consistency: 92
          },
          defects: [],
          pestDamage: 3,
          diseasePresence: 1,
          nutritionalValue: {
            carbohydrates: 74,
            fiber: 9,
            vitamins: { 'C': 6.8, 'B6': 0.6 },
            minerals: { 'Magnesium': 127, 'Phosphorus': 89 }
          },
          shelfLife: 3,
          lastAssessment: '2025-08-15T00:00:00Z'
        },
        photos: [],
        healthStatus: {
          overall: 'good',
          plantVigor: 88,
          diseasePresence: [],
          pestPresence: [],
          nutritionalDeficiency: [],
          stressFactors: [],
          treatmentHistory: [],
          lastAssessment: '2025-08-15T00:00:00Z',
          nextAssessmentDue: '2025-11-15T00:00:00Z'
        },
        riskFactors: [],
        recommendations: [],
        costs: [
          {
            id: 'cost_1',
            category: 'seeds',
            description: 'Honey Select corn seeds',
            amount: 850,
            currency: 'USD',
            date: '2025-04-15T00:00:00Z',
            vendor: 'Seeds Plus Inc',
            notes: 'Premium variety seeds',
            allocatedBy: 'user_1',
            createdAt: '2025-04-15T00:00:00Z'
          }
        ],
        expectedRevenue: 30000,
        actualRevenue: 28750,
        profitMargin: 87.8,
        notes: 'Successful harvest completed',
        tags: ['sweet_corn', 'high_yield', 'market_ready'],
        createdAt: '2025-05-01T00:00:00Z',
        updatedAt: '2025-08-20T00:00:00Z',
        createdBy: 'user_1'
      }
    ];
  }

  private getMockCropTasks(cropId: string): CropTask[] {
    return [
      {
        id: 'task_1',
        title: 'Daily Plant Inspection',
        description: 'Check plant health, growth progress, and identify any issues',
        type: 'maintenance',
        priority: 'high',
        status: 'in_progress',
        assignedWorkers: ['worker_1'],
        estimatedHours: 2,
        scheduledDate: '2025-11-03T08:00:00Z',
        dueDate: '2025-11-03T18:00:00Z',
        requirements: [
          {
            skill: 'Plant Health Assessment',
            experienceLevel: 'intermediate'
          }
        ],
        materials: [],
        equipment: [
          {
            name: 'Digital Camera',
            type: 'photography',
            required: true
          }
        ],
        weather: {
          precipitationAllowed: true,
          idealConditions: 'Clear morning for best visibility'
        },
        notes: 'Focus on flowering stage development',
        photos: [],
        createdAt: '2025-11-01T00:00:00Z',
        updatedAt: '2025-11-03T08:00:00Z'
      }
    ];
  }

  private getMockWorkHours(cropId: string): WorkHourLog[] {
    return [
      {
        id: 'wh_1',
        workerId: 'worker_1',
        workerName: 'Maria Rodriguez',
        taskId: 'task_1',
        taskType: 'maintenance',
        date: '2025-11-02',
        startTime: '08:00',
        endTime: '10:30',
        totalHours: 2.5,
        breakHours: 0.5,
        productivity: 95,
        notes: 'Completed thorough inspection of all plants',
        supervisorApproval: true,
        createdAt: '2025-11-02T10:30:00Z'
      }
    ];
  }

  private getMockCropAnalytics(): CropAnalytics {
    return {
      totalCrops: 2,
      cropsByStage: {
        'fruiting': 1,
        'post_harvest': 1
      },
      cropsByCategory: {
        'vegetables': 1,
        'grains': 1
      },
      totalArea: 7.5,
      averageYield: 35750,
      totalRevenue: 57500,
      totalCosts: 12500,
      profitMargin: 78.3,
      productivity: {
        workHoursPerHectare: 32,
        yieldPerWorkerHour: 145.8,
        costPerKg: 1.08,
        revenuePerHectare: 7666.67
      },
      trends: {
        yieldTrend: [
          { date: '2025-08', yield: 11500 },
          { date: '2025-09', yield: 8500 },
          { date: '2025-10', yield: 15500 }
        ],
        costTrend: [
          { date: '2025-08', cost: 3500 },
          { date: '2025-09', cost: 2800 },
          { date: '2025-10', cost: 4200 }
        ],
        profitTrend: [
          { date: '2025-08', profit: 25250 },
          { date: '2025-09', profit: 18750 },
          { date: '2025-10', profit: 28500 }
        ]
      },
      topPerformingCrops: [
        {
          cropId: '2',
          name: 'Sweet Corn Field',
          yield: 11500,
          profit: 25250,
          roi: 296.5
        }
      ],
      workerPerformance: [
        {
          workerId: 'worker_1',
          name: 'Maria Rodriguez',
          efficiency: 92,
          tasksCompleted: 28,
          averageQuality: 95
        }
      ]
    };
  }

  private getMockCropPrediction(cropId: string): CropPrediction {
    return {
      cropId,
      predictedYield: 58500,
      confidence: 87,
      factors: [
        {
          factor: 'Weather Conditions',
          impact: 15,
          description: 'Favorable temperature and rainfall patterns'
        },
        {
          factor: 'Soil Health',
          impact: 12,
          description: 'Optimal nutrient levels and pH balance'
        },
        {
          factor: 'Plant Health',
          impact: 8,
          description: 'Excellent plant vigor with minimal stress'
        }
      ],
      recommendations: [
        'Maintain current irrigation schedule',
        'Apply booster fertilizer in week 3',
        'Monitor for early blight symptoms'
      ],
      riskFactors: [
        'Late season frost risk in December',
        'Potential aphid pressure in warm weather'
      ],
      optimizationOpportunities: [
        'Implement precision irrigation for 5% yield increase',
        'Optimize harvesting timing for premium quality'
      ]
    };
  }
}

const cropService = new CropService();
export default cropService;