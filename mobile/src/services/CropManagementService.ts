/**
 * Advanced Crop Management Service
 * Comprehensive crop lifecycle tracking, pest monitoring, disease detection,
 * yield prediction, and harvest optimization with weather integration.
 */

// Core Crop Data Models
export interface Crop {
  id: string;
  name: string;
  variety: string;
  category: 'grain' | 'vegetable' | 'fruit' | 'legume' | 'root' | 'herb' | 'forage' | 'fiber';
  plantingDate: Date;
  expectedHarvestDate: Date;
  actualHarvestDate?: Date;
  fieldId: string;
  fieldLocation: {
    latitude: number;
    longitude: number;
    area: number; // in acres
    soilType: string;
  };
  currentStage: GrowthStage;
  status: 'planned' | 'planted' | 'growing' | 'harvested' | 'failed';
  metadata: {
    seedLotNumber?: string;
    supplier: string;
    seedDensity: number; // per acre
    rowSpacing: number; // in inches
    depth: number; // in inches
    certification?: 'organic' | 'conventional' | 'transitional';
  };
  growthHistory: GrowthStageRecord[];
  treatmentHistory: TreatmentRecord[];
  harvestData?: HarvestData;
  predictions: CropPredictions;
  notifications: CropNotification[];
}

export interface GrowthStage {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  expectedDuration: number; // in days
  completionPercentage: number;
  characteristics: string[];
  criticalFactors: string[];
  recommendedActions: string[];
  weatherSensitivity: 'low' | 'medium' | 'high';
}

export interface GrowthStageRecord {
  stageId: string;
  stageName: string;
  startDate: Date;
  endDate?: Date;
  actualDuration?: number;
  observedCharacteristics: string[];
  environmentalConditions: {
    averageTemperature: number;
    totalRainfall: number;
    averageHumidity: number;
    sunlightHours: number;
    soilMoisture: number;
  };
  healthScore: number; // 1-100
  notes: string;
  photos: string[];
  recordedBy: string;
}

export interface TreatmentRecord {
  id: string;
  type: 'pesticide' | 'fertilizer' | 'herbicide' | 'fungicide' | 'irrigation' | 'cultivation' | 'other';
  name: string;
  activeIngredient?: string;
  applicationMethod: 'spray' | 'granular' | 'injection' | 'broadcast' | 'drip' | 'manual';
  applicationDate: Date;
  dosage: {
    amount: number;
    unit: string;
    concentration?: number;
  };
  coverage: {
    area: number; // in acres
    percentage: number; // percentage of total field
  };
  purpose: string;
  conditions: {
    temperature: number;
    windSpeed: number;
    humidity: number;
    soilMoisture: number;
  };
  cost: number;
  supplier: string;
  prehaverestInterval?: number; // days before harvest
  effectiveness: number; // 1-100, evaluated post-treatment
  sideEffects?: string[];
  certificationCompliant: boolean;
  appliedBy: string;
  notes: string;
  photos: string[];
}

export interface PestMonitoring {
  id: string;
  cropId: string;
  monitoringDate: Date;
  pestType: 'insect' | 'disease' | 'weed' | 'vertebrate' | 'nematode';
  pestName: string;
  identificationConfidence: number; // 1-100
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  affectedArea: {
    percentage: number;
    locations: Array<{ x: number; y: number; severity: number }>;
  };
  lifecycle: string; // pest lifecycle stage
  populationDensity: number;
  damageAssessment: {
    type: 'cosmetic' | 'yield_reducing' | 'quality_affecting' | 'plant_killing';
    estimatedYieldLoss: number; // percentage
    economicThreshold: boolean;
  };
  environmentalFactors: {
    temperature: number;
    humidity: number;
    recentWeather: string[];
  };
  identificationMethod: 'visual' | 'trap' | 'lab_test' | 'app_identification' | 'expert_consultation';
  recommendations: TreatmentRecommendation[];
  monitoredBy: string;
  photos: string[];
  notes: string;
}

export interface TreatmentRecommendation {
  id: string;
  type: 'chemical' | 'biological' | 'cultural' | 'mechanical' | 'integrated';
  urgency: 'immediate' | 'within_24h' | 'within_week' | 'monitor' | 'preventive';
  products: Array<{
    name: string;
    activeIngredient: string;
    dosage: string;
    method: string;
    cost: number;
    effectiveness: number; // 1-100
    environmentalImpact: 'low' | 'medium' | 'high';
    organicApproved: boolean;
  }>;
  culturalPractices: string[];
  timing: {
    bestApplicationTime: string;
    weatherRequirements: string[];
    avoidConditions: string[];
  };
  expectedOutcome: {
    controlLevel: number; // percentage
    timeToEffect: number; // days
    residualEffect: number; // days
  };
  risks: string[];
  alternatives: string[];
  costBenefit: {
    treatmentCost: number;
    potentialLossPrevented: number;
    roi: number;
  };
}

export interface YieldPrediction {
  cropId: string;
  predictionDate: Date;
  modelVersion: string;
  predictedYield: {
    amount: number;
    unit: string;
    confidence: number; // 1-100
    range: { min: number; max: number };
  };
  qualityPrediction: {
    grade: string;
    characteristics: { [key: string]: any };
    confidence: number;
  };
  factors: {
    weather: {
      influence: number; // -100 to +100
      criticalPeriods: string[];
      riskFactors: string[];
    };
    soil: {
      influence: number;
      nutrients: { [key: string]: number };
      moisture: number;
      ph: number;
    };
    management: {
      influence: number;
      practicesScore: number;
      timingScore: number;
    };
    pests: {
      influence: number;
      riskLevel: 'low' | 'medium' | 'high';
      threatTypes: string[];
    };
  };
  scenarios: Array<{
    name: string;
    description: string;
    probability: number;
    yieldImpact: number;
    recommendations: string[];
  }>;
  updateFrequency: 'daily' | 'weekly' | 'biweekly';
  lastUpdated: Date;
}

export interface HarvestData {
  harvestDate: Date;
  actualYield: {
    amount: number;
    unit: string;
    qualityGrade: string;
    moistureContent: number;
    testWeight?: number;
    protein?: number;
    oil?: number;
  };
  harvestConditions: {
    weather: string;
    soilConditions: string;
    equipmentUsed: string[];
  };
  qualityAssessment: {
    overallGrade: string;
    defects: string[];
    marketValue: number;
    premiums: number;
    deductions: number;
  };
  performance: {
    yieldVsPrediction: number; // percentage variance
    yieldVsHistorical: number; // percentage vs 5-year average
    qualityVsExpected: number;
    profitability: number;
  };
  postHarvest: {
    storage: string;
    processing?: string;
    transportation: string;
    finalDestination: string;
  };
  costs: {
    harvest: number;
    transportation: number;
    storage: number;
    processing?: number;
  };
  lessons: {
    successes: string[];
    challenges: string[];
    improvements: string[];
  };
}

export interface CropPredictions {
  yield: YieldPrediction;
  harvest: {
    optimalDate: Date;
    qualityWindow: { start: Date; end: Date };
    weatherRisk: 'low' | 'medium' | 'high';
    marketTiming: {
      priceOutlook: 'bullish' | 'bearish' | 'stable';
      demandForecast: 'high' | 'medium' | 'low';
    };
  };
  risks: Array<{
    type: 'weather' | 'pest' | 'disease' | 'market' | 'operational';
    probability: number;
    impact: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    mitigationStrategies: string[];
  }>;
  opportunities: Array<{
    type: 'market' | 'quality' | 'efficiency' | 'sustainability';
    potential: number;
    description: string;
    actionRequired: string[];
    timeline: string;
  }>;
}

export interface CropNotification {
  id: string;
  cropId: string;
  type: 'stage_change' | 'treatment_due' | 'pest_alert' | 'weather_warning' | 'harvest_ready' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  actionDescription?: string;
  dueDate?: Date;
  createdAt: Date;
  readAt?: Date;
  dismissedAt?: Date;
  relatedData?: any;
}

// Default Growth Stages for Common Crops
export const DEFAULT_GROWTH_STAGES: { [cropType: string]: GrowthStage[] } = {
  corn: [
    {
      id: 'emergence',
      name: 'Emergence (VE)',
      description: 'Seedling emergence from soil surface',
      startDate: new Date(),
      expectedDuration: 7,
      completionPercentage: 0,
      characteristics: ['Coleoptile visible', 'First leaves unfurling'],
      criticalFactors: ['Soil temperature', 'Moisture', 'Planting depth'],
      recommendedActions: ['Monitor emergence rate', 'Check for pests', 'Ensure adequate moisture'],
      weatherSensitivity: 'high'
    },
    {
      id: 'vegetative',
      name: 'Vegetative Growth (V1-V18)',
      description: 'Leaf development and plant establishment',
      startDate: new Date(),
      expectedDuration: 50,
      completionPercentage: 0,
      characteristics: ['Leaf collar development', 'Root establishment', 'Stalk elongation'],
      criticalFactors: ['Nitrogen availability', 'Water stress', 'Temperature'],
      recommendedActions: ['Monitor growth rate', 'Apply fertilizer', 'Scout for pests'],
      weatherSensitivity: 'medium'
    },
    {
      id: 'reproductive',
      name: 'Reproductive (R1-R6)',
      description: 'Tasseling, pollination, and grain filling',
      startDate: new Date(),
      expectedDuration: 60,
      completionPercentage: 0,
      characteristics: ['Tassel emergence', 'Silk development', 'Kernel formation'],
      criticalFactors: ['Water stress', 'Heat stress', 'Pollination success'],
      recommendedActions: ['Monitor pollination', 'Ensure water availability', 'Pest management'],
      weatherSensitivity: 'high'
    },
    {
      id: 'maturity',
      name: 'Maturity (R6)',
      description: 'Physiological maturity and harvest readiness',
      startDate: new Date(),
      expectedDuration: 30,
      completionPercentage: 0,
      characteristics: ['Black layer formation', 'Moisture reduction', 'Husk drying'],
      criticalFactors: ['Moisture content', 'Weather conditions', 'Lodging risk'],
      recommendedActions: ['Monitor moisture', 'Plan harvest', 'Prepare equipment'],
      weatherSensitivity: 'medium'
    }
  ],
  soybeans: [
    {
      id: 'emergence',
      name: 'Emergence (VE)',
      description: 'Cotyledons emergence above soil surface',
      startDate: new Date(),
      expectedDuration: 5,
      completionPercentage: 0,
      characteristics: ['Cotyledons unfolded', 'Hypocotyl arch'],
      criticalFactors: ['Soil crusting', 'Temperature', 'Moisture'],
      recommendedActions: ['Monitor emergence', 'Check stand count', 'Scout for damping-off'],
      weatherSensitivity: 'high'
    },
    {
      id: 'vegetative',
      name: 'Vegetative (V1-V16)',
      description: 'Trifoliate leaf development',
      startDate: new Date(),
      expectedDuration: 45,
      completionPercentage: 0,
      characteristics: ['Trifoliate leaves', 'Node development', 'Branching'],
      criticalFactors: ['Nitrogen fixation', 'Water availability', 'Light interception'],
      recommendedActions: ['Monitor growth', 'Pest scouting', 'Weed management'],
      weatherSensitivity: 'medium'
    },
    {
      id: 'reproductive',
      name: 'Reproductive (R1-R8)',
      description: 'Flowering, pod development, and seed filling',
      startDate: new Date(),
      expectedDuration: 55,
      completionPercentage: 0,
      characteristics: ['Flowering', 'Pod set', 'Seed development'],
      criticalFactors: ['Water stress', 'Temperature', 'Nutrient availability'],
      recommendedActions: ['Monitor pod set', 'Disease management', 'Water management'],
      weatherSensitivity: 'high'
    },
    {
      id: 'maturity',
      name: 'Maturity (R8)',
      description: 'Physiological maturity and harvest readiness',
      startDate: new Date(),
      expectedDuration: 20,
      completionPercentage: 0,
      characteristics: ['Pod yellowing', 'Leaf senescence', 'Moisture reduction'],
      criticalFactors: ['Moisture content', 'Shattering risk', 'Weather'],
      recommendedActions: ['Monitor moisture', 'Prepare for harvest', 'Equipment check'],
      weatherSensitivity: 'medium'
    }
  ],
  wheat: [
    {
      id: 'germination',
      name: 'Germination',
      description: 'Seed germination and seedling emergence',
      startDate: new Date(),
      expectedDuration: 10,
      completionPercentage: 0,
      characteristics: ['Radicle emergence', 'Coleoptile growth'],
      criticalFactors: ['Soil temperature', 'Moisture', 'Seed depth'],
      recommendedActions: ['Monitor emergence', 'Check stand establishment'],
      weatherSensitivity: 'high'
    },
    {
      id: 'tillering',
      name: 'Tillering',
      description: 'Tiller development and plant establishment',
      startDate: new Date(),
      expectedDuration: 90,
      completionPercentage: 0,
      characteristics: ['Tiller emergence', 'Root development', 'Leaf production'],
      criticalFactors: ['Temperature', 'Day length', 'Nitrogen'],
      recommendedActions: ['Monitor tiller count', 'Apply fertilizer', 'Disease scouting'],
      weatherSensitivity: 'medium'
    },
    {
      id: 'stem_elongation',
      name: 'Stem Elongation',
      description: 'Rapid stem growth and node development',
      startDate: new Date(),
      expectedDuration: 30,
      completionPercentage: 0,
      characteristics: ['Internode elongation', 'Flag leaf emergence'],
      criticalFactors: ['Water availability', 'Temperature', 'Lodging risk'],
      recommendedActions: ['Monitor growth rate', 'Plant growth regulator application'],
      weatherSensitivity: 'medium'
    },
    {
      id: 'heading',
      name: 'Heading and Flowering',
      description: 'Head emergence and pollination',
      startDate: new Date(),
      expectedDuration: 20,
      completionPercentage: 0,
      characteristics: ['Head emergence', 'Anthesis', 'Pollination'],
      criticalFactors: ['Temperature', 'Moisture', 'Disease pressure'],
      recommendedActions: ['Monitor head health', 'Fungicide application', 'Weather monitoring'],
      weatherSensitivity: 'high'
    },
    {
      id: 'grain_filling',
      name: 'Grain Filling',
      description: 'Kernel development and maturation',
      startDate: new Date(),
      expectedDuration: 35,
      completionPercentage: 0,
      characteristics: ['Kernel formation', 'Starch accumulation', 'Moisture reduction'],
      criticalFactors: ['Temperature', 'Water stress', 'Disease'],
      recommendedActions: ['Monitor kernel development', 'Water management'],
      weatherSensitivity: 'high'
    },
    {
      id: 'maturity',
      name: 'Maturity',
      description: 'Physiological maturity and harvest readiness',
      startDate: new Date(),
      expectedDuration: 15,
      completionPercentage: 0,
      characteristics: ['Hard dough stage', 'Moisture reduction', 'Yellowing'],
      criticalFactors: ['Moisture content', 'Weather conditions'],
      recommendedActions: ['Monitor moisture', 'Harvest planning'],
      weatherSensitivity: 'medium'
    }
  ]
};

// Treatment Application Guidelines
export const TREATMENT_GUIDELINES = {
  pesticides: {
    weatherRequirements: {
      windSpeed: { max: 10, unit: 'mph' },
      temperature: { min: 50, max: 85, unit: 'F' },
      humidity: { min: 40, max: 90, unit: '%' },
      rainfall: { hours_after: 6, hours_before: 24 }
    },
    safetyRequirements: [
      'Personal protective equipment required',
      'Buffer zones near water sources',
      'Pre-harvest interval compliance',
      'Application rate limits',
      'Drift prevention measures'
    ]
  },
  fertilizers: {
    soilRequirements: {
      temperature: { min: 50, unit: 'F' },
      moisture: { min: 30, max: 80, unit: '%' },
      compaction: 'minimal'
    },
    timingGuidelines: [
      'Based on soil test recommendations',
      'Growth stage appropriate',
      'Weather window suitable',
      'Equipment calibrated'
    ]
  }
};

/**
 * Advanced Crop Management Service
 * Central service for managing all crop-related operations
 */
class CropManagementService {
  private crops: Map<string, Crop> = new Map();
  private pestMonitoring: Map<string, PestMonitoring[]> = new Map();
  private notifications: CropNotification[] = [];

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    // Initialize with sample data if needed
    this.loadCropsFromStorage();
    this.setupAutomaticMonitoring();
  }

  // Crop Management Methods
  public createCrop(cropData: Omit<Crop, 'id' | 'growthHistory' | 'treatmentHistory' | 'notifications' | 'predictions'>): string {
    const cropId = `crop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newCrop: Crop = {
      id: cropId,
      ...cropData,
      growthHistory: [],
      treatmentHistory: [],
      notifications: [],
      predictions: this.generateInitialPredictions(cropId, cropData)
    };

    // Set initial growth stage
    const defaultStages = DEFAULT_GROWTH_STAGES[cropData.name.toLowerCase()] || 
                          DEFAULT_GROWTH_STAGES['corn']; // fallback
    
    newCrop.currentStage = {
      ...defaultStages[0],
      startDate: cropData.plantingDate
    };

    this.crops.set(cropId, newCrop);
    this.createNotification(cropId, 'stage_change', 'medium', 
      'Crop Planted Successfully', 
      `${newCrop.name} (${newCrop.variety}) has been planted in field ${newCrop.fieldId}`
    );

    this.saveCropsToStorage();
    return cropId;
  }

  public getCrop(cropId: string): Crop | null {
    return this.crops.get(cropId) || null;
  }

  public getAllCrops(): Crop[] {
    return Array.from(this.crops.values());
  }

  public getCropsByStatus(status: Crop['status']): Crop[] {
    return this.getAllCrops().filter(crop => crop.status === status);
  }

  public getCropsByField(fieldId: string): Crop[] {
    return this.getAllCrops().filter(crop => crop.fieldId === fieldId);
  }

  public updateCrop(cropId: string, updates: Partial<Crop>): boolean {
    const crop = this.crops.get(cropId);
    if (!crop) return false;

    const updatedCrop = { ...crop, ...updates };
    this.crops.set(cropId, updatedCrop);
    this.saveCropsToStorage();
    return true;
  }

  public deleteCrop(cropId: string): boolean {
    const success = this.crops.delete(cropId);
    if (success) {
      this.pestMonitoring.delete(cropId);
      this.notifications = this.notifications.filter(n => n.cropId !== cropId);
      this.saveCropsToStorage();
    }
    return success;
  }

  // Growth Stage Management
  public advanceGrowthStage(cropId: string, observationData: Omit<GrowthStageRecord, 'stageId' | 'stageName'>): boolean {
    const crop = this.crops.get(cropId);
    if (!crop) return false;

    // Complete current stage
    const currentStageRecord: GrowthStageRecord = {
      stageId: crop.currentStage.id,
      stageName: crop.currentStage.name,
      endDate: new Date(),
      actualDuration: Math.ceil((new Date().getTime() - crop.currentStage.startDate.getTime()) / (1000 * 60 * 60 * 24)),
      ...observationData
    };

    crop.growthHistory.push(currentStageRecord);

    // Move to next stage
    const cropType = crop.name.toLowerCase();
    const defaultStages = DEFAULT_GROWTH_STAGES[cropType] || DEFAULT_GROWTH_STAGES['corn'];
    const currentStageIndex = defaultStages.findIndex(stage => stage.id === crop.currentStage.id);
    
    if (currentStageIndex < defaultStages.length - 1) {
      const nextStage = defaultStages[currentStageIndex + 1];
      crop.currentStage = {
        ...nextStage,
        startDate: new Date(),
        completionPercentage: 0
      };

      this.createNotification(cropId, 'stage_change', 'medium',
        'Growth Stage Advanced',
        `${crop.name} has advanced to ${nextStage.name}`
      );
    }

    // Update predictions based on new stage
    crop.predictions = this.updatePredictions(crop);
    
    this.crops.set(cropId, crop);
    this.saveCropsToStorage();
    return true;
  }

  public updateGrowthStageProgress(cropId: string, percentage: number): boolean {
    const crop = this.crops.get(cropId);
    if (!crop) return false;

    crop.currentStage.completionPercentage = Math.min(100, Math.max(0, percentage));
    this.crops.set(cropId, crop);
    this.saveCropsToStorage();
    return true;
  }

  // Treatment Management
  public addTreatment(cropId: string, treatment: Omit<TreatmentRecord, 'id'>): string {
    const crop = this.crops.get(cropId);
    if (!crop) throw new Error('Crop not found');

    const treatmentId = `treatment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const treatmentRecord: TreatmentRecord = {
      id: treatmentId,
      ...treatment
    };

    crop.treatmentHistory.push(treatmentRecord);
    
    this.createNotification(cropId, 'treatment_due', 'medium',
      'Treatment Applied',
      `${treatment.type} treatment "${treatment.name}" applied to ${crop.name}`
    );

    this.crops.set(cropId, crop);
    this.saveCropsToStorage();
    return treatmentId;
  }

  public getTreatmentHistory(cropId: string): TreatmentRecord[] {
    const crop = this.crops.get(cropId);
    return crop ? crop.treatmentHistory : [];
  }

  public updateTreatmentEffectiveness(cropId: string, treatmentId: string, effectiveness: number, sideEffects?: string[]): boolean {
    const crop = this.crops.get(cropId);
    if (!crop) return false;

    const treatment = crop.treatmentHistory.find(t => t.id === treatmentId);
    if (!treatment) return false;

    treatment.effectiveness = effectiveness;
    if (sideEffects) {
      treatment.sideEffects = sideEffects;
    }

    this.crops.set(cropId, crop);
    this.saveCropsToStorage();
    return true;
  }

  // Pest Monitoring
  public addPestObservation(observation: Omit<PestMonitoring, 'id'>): string {
    const observationId = `pest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pestRecord: PestMonitoring = {
      id: observationId,
      ...observation
    };

    const cropPests = this.pestMonitoring.get(observation.cropId) || [];
    cropPests.push(pestRecord);
    this.pestMonitoring.set(observation.cropId, cropPests);

    // Create notification based on severity
    const priority = observation.severityLevel === 'critical' ? 'critical' :
                    observation.severityLevel === 'high' ? 'high' : 'medium';

    this.createNotification(observation.cropId, 'pest_alert', priority,
      `${observation.pestType} Detection: ${observation.pestName}`,
      `${observation.severityLevel} severity ${observation.pestType} detected affecting ${observation.affectedArea.percentage}% of the crop`
    );

    return observationId;
  }

  public getPestHistory(cropId: string): PestMonitoring[] {
    return this.pestMonitoring.get(cropId) || [];
  }

  public getActivePests(cropId: string): PestMonitoring[] {
    const pests = this.getPestHistory(cropId);
    const recentPests = pests.filter(pest => {
      const daysSince = (Date.now() - pest.monitoringDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 14; // Active within last 2 weeks
    });
    return recentPests;
  }

  // Yield Prediction
  public updateYieldPrediction(cropId: string, weatherData?: any, soilData?: any): YieldPrediction | null {
    const crop = this.crops.get(cropId);
    if (!crop) return null;

    const prediction = this.calculateYieldPrediction(crop, weatherData, soilData);
    crop.predictions.yield = prediction;
    
    this.crops.set(cropId, crop);
    this.saveCropsToStorage();
    
    return prediction;
  }

  private calculateYieldPrediction(crop: Crop, weatherData?: any, soilData?: any): YieldPrediction {
    // Advanced yield prediction algorithm
    const baseYield = this.getHistoricalAverageYield(crop.name, crop.fieldId);
    const stageMultiplier = this.getStageYieldMultiplier(crop.currentStage);
    const weatherMultiplier = this.getWeatherImpactMultiplier(crop, weatherData);
    const managementMultiplier = this.getManagementMultiplier(crop);
    const pestMultiplier = this.getPestImpactMultiplier(crop);
    
    const predictedYield = baseYield * stageMultiplier * weatherMultiplier * 
                          managementMultiplier * pestMultiplier;

    const confidence = this.calculatePredictionConfidence(crop, weatherData, soilData);

    return {
      cropId: crop.id,
      predictionDate: new Date(),
      modelVersion: '2.1.0',
      predictedYield: {
        amount: Math.round(predictedYield * 100) / 100,
        unit: this.getYieldUnit(crop.name),
        confidence: confidence,
        range: {
          min: predictedYield * 0.8,
          max: predictedYield * 1.2
        }
      },
      qualityPrediction: {
        grade: this.predictQualityGrade(crop, weatherData),
        characteristics: this.predictQualityCharacteristics(crop),
        confidence: confidence * 0.9
      },
      factors: {
        weather: {
          influence: (weatherMultiplier - 1) * 100,
          criticalPeriods: this.getWeatherCriticalPeriods(crop),
          riskFactors: this.getWeatherRiskFactors(crop, weatherData)
        },
        soil: {
          influence: 0, // Would be calculated with soil data
          nutrients: soilData?.nutrients || {},
          moisture: soilData?.moisture || 50,
          ph: soilData?.ph || 6.5
        },
        management: {
          influence: (managementMultiplier - 1) * 100,
          practicesScore: this.calculateManagementScore(crop),
          timingScore: this.calculateTimingScore(crop)
        },
        pests: {
          influence: (pestMultiplier - 1) * 100,
          riskLevel: this.assessPestRiskLevel(crop),
          threatTypes: this.getActivePestTypes(crop)
        }
      },
      scenarios: this.generateYieldScenarios(crop, predictedYield),
      updateFrequency: 'weekly',
      lastUpdated: new Date()
    };
  }

  // Harvest Management
  public recordHarvest(cropId: string, harvestData: HarvestData): boolean {
    const crop = this.crops.get(cropId);
    if (!crop) return false;

    crop.harvestData = harvestData;
    crop.actualHarvestDate = harvestData.harvestDate;
    crop.status = 'harvested';

    this.createNotification(cropId, 'harvest_ready', 'high',
      'Harvest Completed',
      `${crop.name} harvest completed with ${harvestData.actualYield.amount} ${harvestData.actualYield.unit}`
    );

    this.crops.set(cropId, crop);
    this.saveCropsToStorage();
    return true;
  }

  public getHarvestReadyCrops(): Crop[] {
    const today = new Date();
    return this.getAllCrops().filter(crop => {
      if (crop.status !== 'growing') return false;
      
      const daysToHarvest = Math.ceil(
        (crop.expectedHarvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return daysToHarvest <= 7 && daysToHarvest >= 0;
    });
  }

  // Notification Management
  public createNotification(
    cropId: string, 
    type: CropNotification['type'], 
    priority: CropNotification['priority'],
    title: string, 
    message: string,
    actionRequired: boolean = false,
    actionDescription?: string,
    dueDate?: Date
  ): string {
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: CropNotification = {
      id: notificationId,
      cropId,
      type,
      priority,
      title,
      message,
      actionRequired,
      actionDescription,
      dueDate,
      createdAt: new Date()
    };

    this.notifications.push(notification);
    return notificationId;
  }

  public getNotifications(cropId?: string, unreadOnly: boolean = false): CropNotification[] {
    let filteredNotifications = this.notifications;

    if (cropId) {
      filteredNotifications = filteredNotifications.filter(n => n.cropId === cropId);
    }

    if (unreadOnly) {
      filteredNotifications = filteredNotifications.filter(n => !n.readAt);
    }

    return filteredNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public markNotificationRead(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) return false;

    notification.readAt = new Date();
    return true;
  }

  public dismissNotification(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) return false;

    notification.dismissedAt = new Date();
    return true;
  }

  // Analytics and Reporting
  public getCropAnalytics(cropId: string): any {
    const crop = this.crops.get(cropId);
    if (!crop) return null;

    const growthRate = this.calculateGrowthRate(crop);
    const healthScore = this.calculateHealthScore(crop);
    const riskAssessment = this.assessCropRisks(crop);
    const performance = this.calculatePerformanceMetrics(crop);

    return {
      crop: {
        id: crop.id,
        name: crop.name,
        variety: crop.variety,
        status: crop.status,
        daysPlanted: Math.ceil((Date.now() - crop.plantingDate.getTime()) / (1000 * 60 * 60 * 24))
      },
      currentStage: {
        ...crop.currentStage,
        daysInStage: Math.ceil((Date.now() - crop.currentStage.startDate.getTime()) / (1000 * 60 * 60 * 24))
      },
      metrics: {
        growthRate,
        healthScore,
        performance
      },
      predictions: crop.predictions,
      riskAssessment,
      recentActivity: {
        treatments: crop.treatmentHistory.slice(-5),
        observations: crop.growthHistory.slice(-3),
        pests: this.getActivePests(cropId).slice(-3)
      },
      recommendations: this.generateRecommendations(crop)
    };
  }

  public getFieldAnalytics(fieldId: string): any {
    const fieldCrops = this.getCropsByField(fieldId);
    if (fieldCrops.length === 0) return null;

    const totalArea = fieldCrops.reduce((sum, crop) => sum + crop.fieldLocation.area, 0);
    const avgHealthScore = fieldCrops.reduce((sum, crop) => sum + this.calculateHealthScore(crop), 0) / fieldCrops.length;
    const totalYieldPrediction = fieldCrops.reduce((sum, crop) => sum + (crop.predictions.yield?.predictedYield.amount || 0), 0);

    return {
      fieldId,
      summary: {
        totalCrops: fieldCrops.length,
        totalArea,
        avgHealthScore: Math.round(avgHealthScore),
        totalPredictedYield: Math.round(totalYieldPrediction * 100) / 100
      },
      crops: fieldCrops.map(crop => ({
        id: crop.id,
        name: crop.name,
        status: crop.status,
        stage: crop.currentStage.name,
        healthScore: this.calculateHealthScore(crop),
        predictedYield: crop.predictions.yield?.predictedYield.amount || 0
      })),
      risks: this.assessFieldRisks(fieldCrops),
      recommendations: this.generateFieldRecommendations(fieldCrops)
    };
  }

  // Helper Methods
  private generateInitialPredictions(cropId: string, cropData: any): CropPredictions {
    // Generate initial predictions based on crop type and planting data
    const baseYield = this.getHistoricalAverageYield(cropData.name, cropData.fieldId);
    
    return {
      yield: {
        cropId,
        predictionDate: new Date(),
        modelVersion: '2.1.0',
        predictedYield: {
          amount: baseYield,
          unit: this.getYieldUnit(cropData.name),
          confidence: 60, // Initial confidence is lower
          range: { min: baseYield * 0.7, max: baseYield * 1.3 }
        },
        qualityPrediction: {
          grade: 'Good',
          characteristics: {},
          confidence: 60
        },
        factors: {
          weather: { influence: 0, criticalPeriods: [], riskFactors: [] },
          soil: { influence: 0, nutrients: {}, moisture: 50, ph: 6.5 },
          management: { influence: 0, practicesScore: 70, timingScore: 70 },
          pests: { influence: 0, riskLevel: 'low', threatTypes: [] }
        },
        scenarios: [],
        updateFrequency: 'weekly',
        lastUpdated: new Date()
      },
      harvest: {
        optimalDate: cropData.expectedHarvestDate,
        qualityWindow: {
          start: new Date(cropData.expectedHarvestDate.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: new Date(cropData.expectedHarvestDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        },
        weatherRisk: 'medium',
        marketTiming: {
          priceOutlook: 'stable',
          demandForecast: 'medium'
        }
      },
      risks: [
        {
          type: 'weather',
          probability: 30,
          impact: 'medium',
          description: 'Weather-related stress during critical growth periods',
          mitigationStrategies: ['Monitor weather forecasts', 'Ensure adequate irrigation']
        }
      ],
      opportunities: [
        {
          type: 'quality',
          potential: 15,
          description: 'Potential for premium quality grade',
          actionRequired: ['Optimal nutrition timing', 'Pest management'],
          timeline: 'Throughout growing season'
        }
      ]
    };
  }

  private updatePredictions(crop: Crop): CropPredictions {
    // Update predictions based on current crop state
    return {
      ...crop.predictions,
      yield: this.calculateYieldPrediction(crop)
    };
  }

  private getHistoricalAverageYield(cropName: string, fieldId: string): number {
    // In a real implementation, this would query historical data
    const yieldDefaults: { [key: string]: number } = {
      'corn': 160, // bushels per acre
      'soybeans': 50,
      'wheat': 60,
      'cotton': 800 // pounds per acre
    };
    
    return yieldDefaults[cropName.toLowerCase()] || 100;
  }

  private getYieldUnit(cropName: string): string {
    const unitDefaults: { [key: string]: string } = {
      'corn': 'bu/acre',
      'soybeans': 'bu/acre',
      'wheat': 'bu/acre',
      'cotton': 'lbs/acre'
    };
    
    return unitDefaults[cropName.toLowerCase()] || 'units/acre';
  }

  private getStageYieldMultiplier(stage: GrowthStage): number {
    // Yield potential changes based on growth stage
    const stageMultipliers: { [key: string]: number } = {
      'emergence': 1.0,
      'vegetative': 1.0,
      'reproductive': 0.95, // Some stress during reproductive stage
      'maturity': 0.9
    };
    
    return stageMultipliers[stage.id] || 1.0;
  }

  private getWeatherImpactMultiplier(crop: Crop, weatherData?: any): number {
    // In a real implementation, this would analyze weather patterns
    // and their impact on the specific crop and growth stage
    return 1.0; // Neutral weather impact for now
  }

  private getManagementMultiplier(crop: Crop): number {
    // Calculate impact of management practices
    const treatmentScore = crop.treatmentHistory.length > 0 ? 1.1 : 0.95;
    const timingScore = 1.0; // Would be calculated based on treatment timing
    
    return Math.min(1.2, treatmentScore * timingScore);
  }

  private getPestImpactMultiplier(crop: Crop): number {
    const activePests = this.getActivePests(crop.id);
    if (activePests.length === 0) return 1.0;
    
    const severityImpact = activePests.reduce((impact, pest) => {
      const severityMultiplier = {
        'low': 0.98,
        'medium': 0.95,
        'high': 0.90,
        'critical': 0.80
      }[pest.severityLevel];
      
      return impact * severityMultiplier;
    }, 1.0);
    
    return severityImpact;
  }

  private calculatePredictionConfidence(crop: Crop, weatherData?: any, soilData?: any): number {
    let confidence = 60; // Base confidence
    
    // Increase confidence based on available data
    if (crop.growthHistory.length > 0) confidence += 10;
    if (crop.treatmentHistory.length > 0) confidence += 5;
    if (weatherData) confidence += 10;
    if (soilData) confidence += 10;
    
    // Decrease confidence based on risks
    const activePests = this.getActivePests(crop.id);
    confidence -= activePests.length * 5;
    
    return Math.min(95, Math.max(30, confidence));
  }

  private predictQualityGrade(crop: Crop, weatherData?: any): string {
    const healthScore = this.calculateHealthScore(crop);
    
    if (healthScore >= 90) return 'Premium';
    if (healthScore >= 80) return 'Good';
    if (healthScore >= 70) return 'Average';
    return 'Below Average';
  }

  private predictQualityCharacteristics(crop: Crop): { [key: string]: any } {
    // Predict specific quality characteristics based on crop type
    const characteristics: { [key: string]: any } = {};
    
    switch (crop.name.toLowerCase()) {
      case 'corn':
        characteristics.moistureContent = 15.5;
        characteristics.testWeight = 56;
        characteristics.protein = 8.5;
        break;
      case 'soybeans':
        characteristics.protein = 35;
        characteristics.oil = 19;
        characteristics.moistureContent = 13;
        break;
      case 'wheat':
        characteristics.protein = 12;
        characteristics.testWeight = 60;
        characteristics.moistureContent = 14;
        break;
    }
    
    return characteristics;
  }

  private getWeatherCriticalPeriods(crop: Crop): string[] {
    const periods: { [key: string]: string[] } = {
      'corn': ['Pollination', 'Grain filling'],
      'soybeans': ['Flowering', 'Pod filling'],
      'wheat': ['Heading', 'Grain filling']
    };
    
    return periods[crop.name.toLowerCase()] || [];
  }

  private getWeatherRiskFactors(crop: Crop, weatherData?: any): string[] {
    // Analysis would be based on actual weather data and forecasts
    return ['Drought stress', 'Heat stress', 'Excessive moisture'];
  }

  private calculateManagementScore(crop: Crop): number {
    let score = 70; // Base score
    
    // Adjust based on treatment history
    const recentTreatments = crop.treatmentHistory.filter(t => {
      const daysSince = (Date.now() - t.applicationDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    });
    
    score += Math.min(20, recentTreatments.length * 5);
    
    return Math.min(100, score);
  }

  private calculateTimingScore(crop: Crop): number {
    // Calculate how well treatments were timed
    // This would analyze treatment timing vs optimal windows
    return 75; // Placeholder
  }

  private assessPestRiskLevel(crop: Crop): 'low' | 'medium' | 'high' {
    const activePests = this.getActivePests(crop.id);
    
    if (activePests.length === 0) return 'low';
    
    const highSeverityPests = activePests.filter(p => 
      p.severityLevel === 'high' || p.severityLevel === 'critical'
    );
    
    if (highSeverityPests.length > 0) return 'high';
    if (activePests.length > 2) return 'medium';
    
    return 'low';
  }

  private getActivePestTypes(crop: Crop): string[] {
    const activePests = this.getActivePests(crop.id);
    return [...new Set(activePests.map(p => p.pestName))];
  }

  private generateYieldScenarios(crop: Crop, baseYield: number): Array<any> {
    return [
      {
        name: 'Optimal Conditions',
        description: 'Favorable weather and no major pest pressure',
        probability: 30,
        yieldImpact: 15,
        recommendations: ['Continue current management', 'Monitor for opportunities']
      },
      {
        name: 'Average Conditions',
        description: 'Normal weather patterns and minor pest pressure',
        probability: 50,
        yieldImpact: 0,
        recommendations: ['Maintain vigilant monitoring', 'Follow treatment schedule']
      },
      {
        name: 'Challenging Conditions',
        description: 'Weather stress or significant pest pressure',
        probability: 20,
        yieldImpact: -20,
        recommendations: ['Implement stress mitigation', 'Increase monitoring frequency']
      }
    ];
  }

  private calculateGrowthRate(crop: Crop): number {
    // Calculate current growth rate based on stage progress
    const daysInStage = Math.ceil((Date.now() - crop.currentStage.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const expectedProgress = (daysInStage / crop.currentStage.expectedDuration) * 100;
    
    return Math.min(100, expectedProgress);
  }

  private calculateHealthScore(crop: Crop): number {
    let score = 100;
    
    // Reduce score based on pest pressure
    const activePests = this.getActivePests(crop.id);
    activePests.forEach(pest => {
      const severityPenalty = {
        'low': 5,
        'medium': 10,
        'high': 20,
        'critical': 35
      }[pest.severityLevel];
      
      score -= severityPenalty;
    });
    
    // Increase score based on recent treatments
    const recentTreatments = crop.treatmentHistory.filter(t => {
      const daysSince = (Date.now() - t.applicationDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 14 && t.effectiveness > 70;
    });
    
    score += Math.min(15, recentTreatments.length * 3);
    
    return Math.min(100, Math.max(0, score));
  }

  private calculatePerformanceMetrics(crop: Crop): any {
    const daysPlanted = Math.ceil((Date.now() - crop.plantingDate.getTime()) / (1000 * 60 * 60 * 24));
    const expectedDays = Math.ceil((crop.expectedHarvestDate.getTime() - crop.plantingDate.getTime()) / (1000 * 60 * 60 * 24));
    const seasonProgress = (daysPlanted / expectedDays) * 100;
    
    return {
      seasonProgress: Math.min(100, seasonProgress),
      stageProgress: crop.currentStage.completionPercentage,
      healthScore: this.calculateHealthScore(crop),
      treatmentEfficiency: this.calculateTreatmentEfficiency(crop)
    };
  }

  private calculateTreatmentEfficiency(crop: Crop): number {
    const treatments = crop.treatmentHistory.filter(t => t.effectiveness > 0);
    if (treatments.length === 0) return 0;
    
    const avgEffectiveness = treatments.reduce((sum, t) => sum + t.effectiveness, 0) / treatments.length;
    return Math.round(avgEffectiveness);
  }

  private assessCropRisks(crop: Crop): Array<{type: string; level: string; description: string}> {
    const risks: Array<{type: string; level: string; description: string}> = [];
    
    // Weather risks
    if (crop.currentStage.weatherSensitivity === 'high') {
      risks.push({
        type: 'weather',
        level: 'medium',
        description: 'Current growth stage is highly weather sensitive'
      });
    }
    
    // Pest risks
    const activePests = this.getActivePests(crop.id);
    if (activePests.length > 0) {
      risks.push({
        type: 'pest',
        level: this.assessPestRiskLevel(crop),
        description: `${activePests.length} active pest(s) detected`
      });
    }
    
    // Timing risks
    const daysToHarvest = Math.ceil((crop.expectedHarvestDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysToHarvest < 30 && crop.status === 'growing') {
      risks.push({
        type: 'timing',
        level: 'medium',
        description: 'Approaching harvest window'
      });
    }
    
    return risks;
  }

  private assessFieldRisks(crops: Crop[]): Array<{type: string; level: string; description: string}> {
    const risks: Array<{type: string; level: string; description: string}> = [];
    
    // Check for widespread pest issues
    const allPests = crops.flatMap(crop => this.getActivePests(crop.id));
    const pestCounts = allPests.reduce((counts, pest) => {
      counts[pest.pestName] = (counts[pest.pestName] || 0) + 1;
      return counts;
    }, {} as { [key: string]: number });
    
    Object.entries(pestCounts).forEach(([pestName, count]) => {
      if (count >= crops.length * 0.5) { // Affecting 50% or more of crops
        risks.push({
          type: 'widespread_pest',
          level: 'high',
          description: `${pestName} affecting multiple crops in field`
        });
      }
    });
    
    return risks;
  }

  private generateRecommendations(crop: Crop): string[] {
    const recommendations = [];
    
    // Stage-based recommendations
    recommendations.push(...crop.currentStage.recommendedActions);
    
    // Pest-based recommendations
    const activePests = this.getActivePests(crop.id);
    activePests.forEach(pest => {
      if (pest.recommendations.length > 0) {
        recommendations.push(`Address ${pest.pestName}: ${pest.recommendations[0].type} treatment recommended`);
      }
    });
    
    // Weather-based recommendations (would be based on forecast)
    if (crop.currentStage.weatherSensitivity === 'high') {
      recommendations.push('Monitor weather forecasts closely during this sensitive growth stage');
    }
    
    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private generateFieldRecommendations(crops: Crop[]): string[] {
    const recommendations = [];
    
    // Check for common issues across crops
    const allHealthScores = crops.map(crop => this.calculateHealthScore(crop));
    const avgHealthScore = allHealthScores.reduce((sum, score) => sum + score, 0) / allHealthScores.length;
    
    if (avgHealthScore < 70) {
      recommendations.push('Overall field health is below optimal - consider comprehensive field assessment');
    }
    
    // Check for synchronized treatments
    const cropsByStage = crops.reduce((groups, crop) => {
      const stageName = crop.currentStage.name;
      groups[stageName] = groups[stageName] || [];
      groups[stageName].push(crop);
      return groups;
    }, {} as { [key: string]: Crop[] });
    
    Object.entries(cropsByStage).forEach(([stageName, stageCrops]) => {
      if (stageCrops.length > 1) {
        recommendations.push(`Consider synchronized treatment for ${stageCrops.length} crops in ${stageName} stage`);
      }
    });
    
    return recommendations.slice(0, 3);
  }

  private setupAutomaticMonitoring(): void {
    // Set up periodic monitoring for crop stages and notifications
    setInterval(() => {
      this.checkForStageUpdates();
      this.checkForTreatmentReminders();
      // updatePredictions would be called individually for each crop as needed
    }, 24 * 60 * 60 * 1000); // Daily check
  }

  private checkForStageUpdates(): void {
    this.getAllCrops().forEach(crop => {
      if (crop.status !== 'growing') return;
      
      const daysInStage = Math.ceil((Date.now() - crop.currentStage.startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysInStage >= crop.currentStage.expectedDuration) {
        this.createNotification(crop.id, 'stage_change', 'medium',
          'Growth Stage Update Due',
          `${crop.name} may be ready to advance to the next growth stage`,
          true,
          'Observe crop and update growth stage if appropriate'
        );
      }
    });
  }

  private checkForTreatmentReminders(): void {
    this.getAllCrops().forEach(crop => {
      if (crop.status !== 'growing') return;
      
      // Check for pest monitoring
      const lastPestCheck = this.getActivePests(crop.id).sort((a, b) => 
        b.monitoringDate.getTime() - a.monitoringDate.getTime()
      )[0];
      
      if (!lastPestCheck || 
          (Date.now() - lastPestCheck.monitoringDate.getTime()) > (7 * 24 * 60 * 60 * 1000)) {
        this.createNotification(crop.id, 'maintenance', 'low',
          'Pest Monitoring Due',
          `${crop.name} should be checked for pests and diseases`,
          true,
          'Conduct field inspection and record observations'
        );
      }
    });
  }

  private loadCropsFromStorage(): void {
    // In a real app, this would load from persistent storage
    // For now, initialize with empty data
  }

  private saveCropsToStorage(): void {
    // In a real app, this would save to persistent storage
    // For now, just keep in memory
  }
}

// Export singleton instance
export const cropManagementService = new CropManagementService();
export default CropManagementService;