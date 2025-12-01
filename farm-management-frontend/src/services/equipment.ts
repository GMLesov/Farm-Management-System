import axios from 'axios';
import { 
  Equipment, 
  EquipmentAnalytics, 
  EquipmentListResponse, 
  EquipmentResponse, 
  EquipmentAnalyticsResponse,
  MaintenanceScheduleResponse,
  EquipmentCostResponse,
  MaintenanceRecord,
  UsageRecord,
  InspectionRecord,
  UpcomingMaintenanceTask,
  EquipmentRecommendation,
  EquipmentType,
  EquipmentCategory,
  EquipmentStatus,
  MaintenanceType
} from '../types/equipment';

// Development mode flag
const isDevelopment = process.env.NODE_ENV === 'development';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Equipment API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock data for development
const mockEquipment: Equipment[] = [
  {
    id: '1',
    farmId: 'farm_1',
    name: 'John Deere 6155R',
    category: 'tractors',
    type: 'tractor',
    brand: 'John Deere',
    model: '6155R',
    serialNumber: 'JD155R2023001',
    year: 2023,
    purchaseInfo: {
      purchaseDate: '2023-03-15T00:00:00Z',
      purchasePrice: 185000,
      vendor: 'John Deere Dealer',
      purchaseMethod: 'finance',
      financingDetails: {
        lender: 'John Deere Financial',
        loanAmount: 148000,
        interestRate: 4.5,
        termMonths: 60,
        monthlyPayment: 2756,
        remainingBalance: 122000,
        nextPaymentDue: '2024-12-01T00:00:00Z'
      },
      invoiceNumber: 'JD-2023-001',
      warrantyPeriod: 24,
      purchaseNotes: 'Package deal with loader attachment'
    },
    currentValue: 165000,
    depreciationInfo: {
      method: 'straight_line',
      usefulLife: 15,
      salvageValue: 25000,
      depreciationRate: 10666.67,
      accumulatedDepreciation: 16000,
      currentBookValue: 169000,
      annualDepreciation: 10666.67,
      depreciationSchedule: [
        { year: 2023, beginningValue: 185000, depreciation: 10666.67, endingValue: 174333.33, accumulatedDepreciation: 10666.67 },
        { year: 2024, beginningValue: 174333.33, depreciation: 10666.67, endingValue: 163666.66, accumulatedDepreciation: 21333.34 }
      ]
    },
    specifications: {
      dimensions: {
        length: 4.8,
        width: 2.5,
        height: 3.2,
        weight: 8500
      },
      engine: {
        type: 'PowerTech PWL 6.8L',
        horsepower: 155,
        displacement: 6.8,
        fuelType: 'diesel',
        emissions: 'Tier 4 Final',
        coolingSystem: 'Liquid'
      },
      capacity: {
        workingWidth: 3.0,
        tankCapacity: 260,
        liftCapacity: 3200,
        groundSpeed: 40
      },
      operatingConditions: {
        temperatureRange: { min: -20, max: 50 },
        humidityRange: { min: 10, max: 90 },
        terrainTypes: ['flat', 'rolling', 'steep'],
        weatherLimitations: ['Heavy rain', 'Ice conditions'],
        safetyRequirements: ['ROPS certified', 'Seatbelt required']
      },
      attachments: [
        {
          id: 'att1',
          name: 'Front End Loader',
          type: 'loader',
          compatibility: ['6155R'],
          currentlyAttached: true,
          condition: 'excellent',
          maintenanceRequired: false
        }
      ],
      technicalSpecs: {
        'PTO Power': 134,
        'Hydraulic Flow': 98,
        'Fuel Tank': 260,
        'DEF Tank': 18.5
      }
    },
    currentLocation: {
      fieldId: 'field_1',
      fieldName: 'North Field',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      address: 'North Field, Farm Property',
      lastMoved: '2024-11-01T08:00:00Z',
      movedBy: 'John Smith',
      locationHistory: []
    },
    assignedTo: 'worker_1',
    availability: {
      status: 'available',
      availableFrom: '2024-11-04T06:00:00Z',
      availableUntil: '2024-11-04T18:00:00Z'
    },
    maintenanceSchedule: {
      intervals: [
        {
          id: 'int1',
          type: 'oil_change',
          description: 'Engine oil and filter change',
          intervalHours: 500,
          priority: 'high',
          estimatedDuration: 120,
          estimatedCost: 285,
          requiredParts: [
            {
              partNumber: 'RE529643',
              description: 'Engine Oil Filter',
              quantity: 1,
              unitCost: 35,
              supplier: 'John Deere',
              inStock: true,
              leadTime: 0
            }
          ],
          requiredSkills: ['Basic maintenance'],
          safetyPrecautions: ['Engine cool down', 'Proper lifting'],
          isActive: true
        }
      ],
      customSchedules: [],
      seasonalMaintenance: [],
      upcomingTasks: []
    },
    maintenanceHistory: [],
    nextMaintenanceDue: '2024-11-15T00:00:00Z',
    usageRecords: [],
    totalHours: 847,
    hoursThisMonth: 45,
    usageAnalytics: {
      totalHours: 847,
      averageHoursPerDay: 8.5,
      averageHoursPerMonth: 185,
      peakUsageMonths: ['April', 'May', 'September', 'October'],
      utilizationRate: 65,
      fuelEfficiencyTrend: [
        { date: '2024-08', value: 8.2, trend: 'stable' },
        { date: '2024-09', value: 8.1, trend: 'improving' },
        { date: '2024-10', value: 8.3, trend: 'stable' },
        { date: '2024-11', value: 8.1, trend: 'improving' }
      ],
      productivityTrend: [
        { date: '2024-08', value: 92, trend: 'stable' },
        { date: '2024-09', value: 94, trend: 'improving' },
        { date: '2024-10', value: 93, trend: 'stable' },
        { date: '2024-11', value: 95, trend: 'improving' }
      ],
      costPerHourTrend: [
        { date: '2024-08', value: 45.20, trend: 'stable' },
        { date: '2024-09', value: 44.80, trend: 'improving' },
        { date: '2024-10', value: 45.50, trend: 'declining' },
        { date: '2024-11', value: 44.20, trend: 'improving' }
      ],
      predictedLifeRemaining: 12500,
      predictedMaintenanceDates: [
        {
          type: 'oil_change',
          predictedDate: '2024-11-15T00:00:00Z',
          confidence: 95,
          estimatedCost: 285,
          criticality: 'medium'
        }
      ],
      costProjections: [
        {
          category: 'maintenance',
          period: 'year',
          projectedCost: 8500,
          confidence: 88,
          factors: ['Usage patterns', 'Historical costs', 'Equipment age']
        }
      ],
      industryBenchmarks: {
        category: 'Tractors',
        metric: 'Fuel Efficiency',
        farmValue: 8.2,
        industryAverage: 7.8,
        topPercentile: 8.5,
        performanceRating: 'above_average'
      },
      farmBenchmarks: {
        bestPerformingEquipment: 'John Deere 6155R',
        averageUtilization: 65,
        totalMaintenanceCost: 6200,
        averageAge: 1.7,
        replacementRecommendations: []
      }
    },
    condition: {
      overall: 'excellent',
      components: [
        {
          component: 'Engine',
          condition: 'excellent',
          wearPercentage: 5,
          lastInspected: '2024-11-01T00:00:00Z',
          inspector: 'John Smith',
          notes: 'Running smooth, no leaks',
          photos: [],
          maintenanceRequired: false,
          replacementRequired: false,
          estimatedReplacementCost: 0
        }
      ],
      lastAssessment: '2024-11-01T00:00:00Z',
      nextAssessment: '2024-12-01T00:00:00Z',
      assessedBy: 'John Smith',
      wearIndicators: [
        {
          indicator: 'Engine Hours',
          currentValue: 847,
          thresholdValue: 10000,
          unit: 'hours',
          trend: 'stable',
          alertLevel: 'green'
        }
      ],
      remainingLife: 92,
      criticalWearPoints: [],
      performanceImpact: 2,
      reliabilityScore: 98,
      safetyRating: 'safe'
    },
    inspectionHistory: [],
    lastInspection: '2024-11-01T00:00:00Z',
    nextInspection: '2024-12-01T00:00:00Z',
    documents: [],
    warranties: [
      {
        id: 'war1',
        type: 'manufacturer',
        provider: 'John Deere',
        startDate: '2023-03-15T00:00:00Z',
        endDate: '2025-03-15T00:00:00Z',
        coverage: ['Engine', 'Transmission', 'Hydraulics'],
        exclusions: ['Wear items', 'Abuse damage'],
        claimsProcedure: 'Contact dealer service department',
        contactInfo: {
          phone: '1-800-DEERE',
          email: 'warranty@deere.com'
        },
        documentsIds: ['doc1'],
        claimsHistory: [],
        isActive: true,
        remainingValue: 15000
      }
    ],
    insurance: [
      {
        id: 'ins1',
        provider: 'Farm Insurance Co',
        policyNumber: 'FIC-2023-001',
        startDate: '2023-03-15T00:00:00Z',
        endDate: '2024-03-15T00:00:00Z',
        coverage: {
          replacement: true,
          actualCashValue: false,
          liability: true,
          theft: true,
          damage: true,
          breakdown: false,
          coverageAmount: 185000,
          limitations: ['Flood damage excluded']
        },
        premium: 2100,
        deductible: 2500,
        contactInfo: {
          phone: '1-800-FARM-INS',
          email: 'claims@farminsurance.com'
        },
        claimsHistory: [],
        isActive: true
      }
    ],
    alerts: [],
    notifications: [],
    performanceMetrics: {
      efficiency: {
        fuelEfficiency: 8.2,
        workRate: 12.5,
        downtime: 15,
        productivityScore: 94,
        operatorPerformance: 92
      },
      utilization: {
        hoursPerYear: 1200,
        utilizationRate: 65,
        peakUtilization: 85,
        averageUtilization: 65,
        seasonalVariation: 25,
        downtimeHours: 48,
        downtimeReasons: {
          'Maintenance': 32,
          'Weather': 12,
          'Repairs': 4
        }
      },
      reliability: {
        mtbf: 850,
        mttr: 4.2,
        availabilityRate: 98.5,
        failureRate: 0.12,
        criticalFailures: 0,
        minorFailures: 2,
        reliabilityScore: 98
      },
      productivity: {
        workRate: 12.5,
        qualityScore: 94,
        costPerUnit: 15.25,
        revenuePerHour: 165,
        profitMargin: 78,
        benchmarkComparison: 112
      },
      safety: {
        safetyScore: 98,
        incidentCount: 0,
        nearMissCount: 1,
        safetyTrainingCompliance: 100,
        safetyRating: 'excellent'
      },
      environmental: {
        fuelConsumption: 8.2,
        emissions: 2.1,
        noiseLevel: 78,
        environmentalCompliance: true,
        efficiencyRating: 'A',
        carbonFootprint: 18.5
      },
      lastCalculated: '2024-11-03T12:00:00Z'
    },
    costAnalysis: {
      acquisitionCost: 185000,
      totalOwnershipCost: 198500,
      annualOperatingCost: 18500,
      costBreakdown: {
        fuel: 8200,
        maintenance: 3500,
        repairs: 1200,
        labor: 3800,
        insurance: 2100,
        depreciation: 10666,
        financing: 6750,
        storage: 450,
        other: 350
      },
      roi: {
        totalInvestment: 185000,
        totalReturn: 245000,
        netReturn: 60000,
        roiPercentage: 32.4,
        paybackPeriod: 38,
        npv: 42000,
        irr: 18.5
      },
      lifecycleCosts: {
        phase1_acquisition: 185000,
        phase2_operation: 185000,
        phase3_maintenance: 45000,
        phase4_disposal: -15000,
        totalLifecycleCost: 400000,
        averageAnnualCost: 26667
      },
      costProjections: [
        {
          category: 'maintenance',
          period: 'year',
          projectedCost: 4200,
          confidence: 85,
          factors: ['Usage patterns', 'Age', 'Historical data']
        }
      ],
      costBenchmarks: {
        industryAverage: 28000,
        topPercentile: 22000,
        farmAverage: 26667,
        costPerformanceRating: 'above_average',
        improvementOpportunities: ['Fuel efficiency optimization', 'Preventive maintenance scheduling']
      }
    },
    status: 'active',
    tags: ['primary_tractor', 'high_performance', 'field_work'],
    notes: 'Primary field tractor with excellent performance record',
    photos: [
      {
        id: 'photo1',
        url: 'https://example.com/equipment/tractor1.jpg',
        thumbnail: 'https://example.com/equipment/tractor1_thumb.jpg',
        caption: 'John Deere 6155R in field',
        type: 'general',
        takenAt: '2024-11-01T14:30:00Z',
        takenBy: 'John Smith',
        equipment: '1',
        tags: ['field_work', 'side_view'],
        verified: true
      }
    ],
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2024-11-03T12:00:00Z',
    createdBy: 'farm_manager'
  },
  {
    id: '2',
    farmId: 'farm_1',
    name: 'Case IH Axial-Flow 8250',
    category: 'harvesting',
    type: 'combine_harvester',
    brand: 'Case IH',
    model: 'Axial-Flow 8250',
    serialNumber: 'CIH8250-2022-003',
    year: 2022,
    purchaseInfo: {
      purchaseDate: '2022-08-15T00:00:00Z',
      purchasePrice: 485000,
      vendor: 'Case IH Dealer',
      purchaseMethod: 'finance',
      financingDetails: {
        lender: 'CNH Capital',
        loanAmount: 388000,
        interestRate: 5.2,
        termMonths: 72,
        monthlyPayment: 6425,
        remainingBalance: 285000,
        nextPaymentDue: '2024-12-01T00:00:00Z'
      },
      invoiceNumber: 'CIH-2022-003',
      warrantyPeriod: 24,
      purchaseNotes: 'Includes grain header and chopper'
    },
    currentValue: 420000,
    depreciationInfo: {
      method: 'declining_balance',
      usefulLife: 12,
      salvageValue: 65000,
      depreciationRate: 16.67,
      accumulatedDepreciation: 85000,
      currentBookValue: 400000,
      annualDepreciation: 42000,
      depreciationSchedule: [
        { year: 2022, beginningValue: 485000, depreciation: 40000, endingValue: 445000, accumulatedDepreciation: 40000 },
        { year: 2023, beginningValue: 445000, depreciation: 45000, endingValue: 400000, accumulatedDepreciation: 85000 }
      ]
    },
    specifications: {
      dimensions: {
        length: 11.2,
        width: 4.3,
        height: 4.8,
        weight: 18500
      },
      engine: {
        type: 'FPT Cursor 9',
        horsepower: 375,
        displacement: 8.7,
        fuelType: 'diesel',
        emissions: 'Tier 4 Final',
        coolingSystem: 'Liquid'
      },
      capacity: {
        tankCapacity: 14100,
        throughput: 35000,
        groundSpeed: 25
      },
      operatingConditions: {
        temperatureRange: { min: -10, max: 45 },
        humidityRange: { min: 20, max: 85 },
        terrainTypes: ['flat', 'rolling'],
        weatherLimitations: ['Wet conditions', 'High winds'],
        safetyRequirements: ['Fire suppression system', 'Emergency stops']
      },
      attachments: [
        {
          id: 'att2',
          name: '35-foot Grain Header',
          type: 'header',
          compatibility: ['8250'],
          currentlyAttached: true,
          condition: 'good',
          maintenanceRequired: false
        }
      ],
      technicalSpecs: {
        'Grain Tank': 14100,
        'Unloading Rate': 4.2,
        'Cleaning Area': 5479,
        'Rotor Diameter': 30
      }
    },
    currentLocation: {
      fieldId: 'storage_1',
      fieldName: 'Equipment Barn',
      coordinates: { lat: 40.7140, lng: -74.0070 },
      address: 'Equipment Storage Barn',
      lastMoved: '2024-10-28T16:00:00Z',
      movedBy: 'Mike Johnson',
      locationHistory: []
    },
    assignedTo: 'worker_2',
    availability: {
      status: 'maintenance',
      availableFrom: '2024-11-10T00:00:00Z',
      downtimeReason: 'Scheduled maintenance',
      estimatedRepairCompletion: '2024-11-10T00:00:00Z'
    },
    maintenanceSchedule: {
      intervals: [
        {
          id: 'int2',
          type: 'inspection',
          description: 'Pre-season inspection',
          intervalDays: 365,
          priority: 'high',
          estimatedDuration: 480,
          estimatedCost: 1250,
          requiredParts: [],
          requiredSkills: ['Certified technician'],
          safetyPrecautions: ['Lockout/Tagout', 'Fall protection'],
          isActive: true
        }
      ],
      customSchedules: [],
      seasonalMaintenance: [
        {
          season: 'fall',
          tasks: [
            {
              id: 'task1',
              title: 'Harvest season prep',
              description: 'Complete pre-harvest inspection and service',
              type: 'inspection',
              priority: 'critical',
              estimatedDuration: 240,
              requiredParts: [],
              instructions: ['Check all systems', 'Calibrate sensors'],
              safetyNotes: ['Follow LOTO procedures'],
              completionCriteria: ['All systems operational', 'Calibration verified']
            }
          ],
          startDate: '2024-08-15T00:00:00Z',
          endDate: '2024-09-15T00:00:00Z',
          isCompleted: true
        }
      ],
      upcomingTasks: []
    },
    maintenanceHistory: [
      {
        id: 'maint1',
        date: '2024-09-01T00:00:00Z',
        type: 'inspection',
        description: 'Pre-harvest inspection and service',
        performedBy: {
          type: 'external',
          technicianName: 'Bob Wilson',
          company: 'Case IH Service',
          certification: ['Certified Combine Technician'],
          contact: {
            phone: '555-0123',
            email: 'bob.wilson@caseih.com'
          }
        },
        hoursAtMaintenance: 1250,
        tasksCompleted: [
          {
            taskId: 'task1',
            description: 'Complete system inspection',
            startTime: '2024-09-01T08:00:00Z',
            endTime: '2024-09-01T12:00:00Z',
            status: 'completed',
            notes: 'All systems operating within specifications',
            followUpRequired: false
          }
        ],
        proceduresFollowed: ['Pre-harvest checklist', 'Calibration procedure'],
        partsUsed: [
          {
            partNumber: 'CIH-F001',
            description: 'Engine Air Filter',
            quantity: 1,
            unitCost: 125,
            totalCost: 125,
            supplier: 'Case IH',
            warrantyPeriod: 12
          }
        ],
        fluidsAdded: [
          {
            type: 'oil',
            brand: 'Case IH',
            grade: '15W-40',
            quantity: 28,
            unit: 'liters',
            cost: 186,
            replaced: true,
            topped_off: false
          }
        ],
        laborHours: 8,
        laborCost: 720,
        partsCost: 311,
        totalCost: 1031,
        qualityChecks: [
          {
            checkType: 'Engine Performance',
            description: 'Engine running smooth at all RPMs',
            passed: true,
            measurements: { 'Oil Pressure': 45, 'Temperature': 185 },
            notes: 'Within specifications',
            inspector: 'Bob Wilson'
          }
        ],
        verified: true,
        verifiedBy: 'Mike Johnson',
        verificationDate: '2024-09-01T16:00:00Z',
        photos: ['maint_photo1.jpg'],
        documents: ['inspection_report_001.pdf'],
        notes: 'Combine ready for harvest season',
        nextMaintenanceRecommended: '2025-09-01T00:00:00Z',
        recommendedActions: ['Monitor engine oil levels', 'Check grain tank sensors'],
        performanceImprovement: 5,
        expectedLifeExtension: 200,
        warrantyWork: false,
        complianceChecks: [
          {
            regulation: 'EPA Tier 4',
            requirement: 'Emissions compliance',
            compliant: true,
            notes: 'DEF system functioning properly',
            inspector: 'Bob Wilson',
            certificationRequired: false
          }
        ]
      }
    ],
    nextMaintenanceDue: '2025-08-15T00:00:00Z',
    usageRecords: [
      {
        id: 'usage1',
        date: '2024-10-15T00:00:00Z',
        operatorId: 'worker_2',
        operatorName: 'Mike Johnson',
        startTime: '2024-10-15T07:00:00Z',
        endTime: '2024-10-15T18:00:00Z',
        hoursUsed: 11,
        acresCovered: 185,
        fuelConsumed: 145,
        startLocation: 'Equipment Barn',
        endLocation: 'South Field',
        activities: [
          {
            type: 'harvesting',
            description: 'Corn harvest',
            startTime: '2024-10-15T08:00:00Z',
            endTime: '2024-10-15T17:00:00Z',
            location: 'South Field',
            quantityCompleted: 185,
            unit: 'acres',
            quality: 'excellent',
            notes: 'Good yield, dry conditions'
          }
        ],
        fieldsWorked: ['South Field'],
        efficiency: {
          fuelEfficiency: 13.2,
          workRate: 16.8,
          downtime: 35,
          productivityScore: 92,
          operatorPerformance: 94
        },
        conditions: {
          temperatureRange: { min: 12, max: 22 },
          humidityRange: { min: 45, max: 65 },
          terrainTypes: ['flat'],
          weatherLimitations: [],
          safetyRequirements: ['Safety training completed']
        },
        issues: [],
        maintenanceNeeded: false,
        notes: 'Excellent harvest day, no issues',
        operatingCost: 125.50,
        fuelCost: 87.25,
        revenueGenerated: 4625
      }
    ],
    totalHours: 1275,
    hoursThisMonth: 85,
    usageAnalytics: {
      totalHours: 1275,
      averageHoursPerDay: 12.5,
      averageHoursPerMonth: 85,
      peakUsageMonths: ['September', 'October'],
      utilizationRate: 45,
      fuelEfficiencyTrend: [
        { date: '2024-09', value: 13.5, trend: 'stable' },
        { date: '2024-10', value: 13.2, trend: 'improving' }
      ],
      productivityTrend: [
        { date: '2024-09', value: 88, trend: 'stable' },
        { date: '2024-10', value: 92, trend: 'improving' }
      ],
      costPerHourTrend: [
        { date: '2024-09', value: 135.50, trend: 'stable' },
        { date: '2024-10', value: 125.50, trend: 'improving' }
      ],
      predictedLifeRemaining: 8500,
      predictedMaintenanceDates: [],
      costProjections: [
        {
          category: 'maintenance',
          period: 'year',
          projectedCost: 15000,
          confidence: 82,
          factors: ['Seasonal usage', 'Equipment age', 'Usage intensity']
        }
      ],
      industryBenchmarks: {
        category: 'Combines',
        metric: 'Productivity',
        farmValue: 92,
        industryAverage: 85,
        topPercentile: 95,
        performanceRating: 'above_average'
      },
      farmBenchmarks: {
        bestPerformingEquipment: 'Case IH Axial-Flow 8250',
        averageUtilization: 45,
        totalMaintenanceCost: 12500,
        averageAge: 2.2,
        replacementRecommendations: []
      }
    },
    condition: {
      overall: 'good',
      components: [
        {
          component: 'Engine',
          condition: 'good',
          wearPercentage: 15,
          lastInspected: '2024-09-01T00:00:00Z',
          inspector: 'Bob Wilson',
          notes: 'Some wear expected for age and usage',
          photos: [],
          maintenanceRequired: false,
          replacementRequired: false,
          estimatedReplacementCost: 0
        },
        {
          component: 'Rotor',
          condition: 'good',
          wearPercentage: 12,
          lastInspected: '2024-09-01T00:00:00Z',
          inspector: 'Bob Wilson',
          notes: 'Normal wear, good performance',
          photos: [],
          maintenanceRequired: false,
          replacementRequired: false,
          estimatedReplacementCost: 0
        }
      ],
      lastAssessment: '2024-09-01T00:00:00Z',
      nextAssessment: '2025-08-15T00:00:00Z',
      assessedBy: 'Bob Wilson',
      wearIndicators: [
        {
          indicator: 'Engine Hours',
          currentValue: 1275,
          thresholdValue: 8000,
          unit: 'hours',
          trend: 'stable',
          alertLevel: 'green'
        }
      ],
      remainingLife: 85,
      criticalWearPoints: [],
      performanceImpact: 8,
      reliabilityScore: 92,
      safetyRating: 'safe'
    },
    inspectionHistory: [],
    lastInspection: '2024-09-01T00:00:00Z',
    nextInspection: '2025-08-15T00:00:00Z',
    documents: [],
    warranties: [
      {
        id: 'war2',
        type: 'manufacturer',
        provider: 'Case IH',
        startDate: '2022-08-15T00:00:00Z',
        endDate: '2024-08-15T00:00:00Z',
        coverage: ['Powertrain', 'Hydraulics', 'Electronics'],
        exclusions: ['Wear items', 'Operator damage'],
        claimsProcedure: 'Contact authorized dealer',
        contactInfo: {
          phone: '1-800-CASE-IH',
          email: 'warranty@caseih.com'
        },
        documentsIds: ['doc2'],
        claimsHistory: [],
        isActive: false,
        remainingValue: 0
      }
    ],
    insurance: [
      {
        id: 'ins2',
        provider: 'AgriGuard Insurance',
        policyNumber: 'AGI-2024-002',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T00:00:00Z',
        coverage: {
          replacement: true,
          actualCashValue: false,
          liability: true,
          theft: true,
          damage: true,
          breakdown: true,
          coverageAmount: 485000,
          limitations: ['War damage excluded']
        },
        premium: 4250,
        deductible: 5000,
        contactInfo: {
          phone: '1-800-AGRI-GUARD',
          email: 'claims@aguriguard.com'
        },
        claimsHistory: [],
        isActive: true
      }
    ],
    alerts: [
      {
        id: 'alert1',
        type: 'warranty_expiring',
        severity: 'warning',
        title: 'Warranty Expired',
        message: 'Manufacturer warranty has expired. Consider extended coverage.',
        equipmentId: '2',
        triggered: '2024-08-15T00:00:00Z',
        acknowledged: true,
        acknowledgedBy: 'farm_manager',
        acknowledgedAt: '2024-08-16T09:00:00Z',
        resolved: false,
        action: {
          required: false,
          description: 'Review extended warranty options',
          priority: 'medium'
        },
        autoResolve: false
      }
    ],
    notifications: [],
    performanceMetrics: {
      efficiency: {
        fuelEfficiency: 13.2,
        workRate: 16.8,
        downtime: 35,
        productivityScore: 92,
        operatorPerformance: 94
      },
      utilization: {
        hoursPerYear: 650,
        utilizationRate: 45,
        peakUtilization: 95,
        averageUtilization: 45,
        seasonalVariation: 80,
        downtimeHours: 125,
        downtimeReasons: {
          'Maintenance': 85,
          'Weather': 35,
          'Seasonal': 5
        }
      },
      reliability: {
        mtbf: 1200,
        mttr: 6.5,
        availabilityRate: 96.8,
        failureRate: 0.08,
        criticalFailures: 0,
        minorFailures: 1,
        reliabilityScore: 92
      },
      productivity: {
        workRate: 16.8,
        qualityScore: 92,
        costPerUnit: 125.50,
        revenuePerHour: 385,
        profitMargin: 68,
        benchmarkComparison: 108
      },
      safety: {
        safetyScore: 95,
        incidentCount: 0,
        nearMissCount: 0,
        safetyTrainingCompliance: 100,
        safetyRating: 'excellent'
      },
      environmental: {
        fuelConsumption: 13.2,
        emissions: 3.8,
        noiseLevel: 85,
        environmentalCompliance: true,
        efficiencyRating: 'B',
        carbonFootprint: 28.5
      },
      lastCalculated: '2024-11-03T12:00:00Z'
    },
    costAnalysis: {
      acquisitionCost: 485000,
      totalOwnershipCost: 545000,
      annualOperatingCost: 35000,
      costBreakdown: {
        fuel: 15500,
        maintenance: 8500,
        repairs: 2500,
        labor: 4800,
        insurance: 4250,
        depreciation: 42000,
        financing: 12500,
        storage: 850,
        other: 650
      },
      roi: {
        totalInvestment: 485000,
        totalReturn: 625000,
        netReturn: 140000,
        roiPercentage: 28.9,
        paybackPeriod: 42,
        npv: 85000,
        irr: 22.5
      },
      lifecycleCosts: {
        phase1_acquisition: 485000,
        phase2_operation: 350000,
        phase3_maintenance: 85000,
        phase4_disposal: -45000,
        totalLifecycleCost: 875000,
        averageAnnualCost: 72917
      },
      costProjections: [
        {
          category: 'maintenance',
          period: 'year',
          projectedCost: 15000,
          confidence: 78,
          factors: ['Seasonal usage', 'Equipment age']
        }
      ],
      costBenchmarks: {
        industryAverage: 78000,
        topPercentile: 65000,
        farmAverage: 72917,
        costPerformanceRating: 'above_average',
        improvementOpportunities: ['Optimize seasonal storage', 'Reduce downtime']
      }
    },
    status: 'active',
    tags: ['harvest_equipment', 'seasonal_use', 'high_capacity'],
    notes: 'Primary combine harvester, excellent for corn and soybean',
    photos: [
      {
        id: 'photo2',
        url: 'https://example.com/equipment/combine1.jpg',
        thumbnail: 'https://example.com/equipment/combine1_thumb.jpg',
        caption: 'Case IH Axial-Flow 8250 during harvest',
        type: 'general',
        takenAt: '2024-10-15T15:30:00Z',
        takenBy: 'Mike Johnson',
        equipment: '2',
        tags: ['harvest', 'field_operation'],
        verified: true
      }
    ],
    createdAt: '2022-08-15T00:00:00Z',
    updatedAt: '2024-11-03T12:00:00Z',
    createdBy: 'farm_manager'
  }
];

const mockAnalytics: EquipmentAnalytics = {
  totalEquipment: 15,
  equipmentByCategory: {
    'tractors': 5,
    'harvesting': 2,
    'tillage': 3,
    'planting': 2,
    'irrigation': 1,
    'transport': 2
  },
  equipmentByCondition: {
    'excellent': 8,
    'good': 5,
    'fair': 2,
    'poor': 0,
    'critical': 0
  },
  equipmentByAge: {
    '0-2 years': 6,
    '3-5 years': 5,
    '6-10 years': 3,
    '10+ years': 1
  },
  totalValue: 1650000,
  totalMaintenanceCost: 45000,
  totalOperatingCost: 185000,
  averageAge: 4.2,
  averageUtilization: 58,
  fleetEfficiency: 87,
  fleetReliability: 94,
  fleetSafety: 96,
  upcomingMaintenance: [
    {
      id: 'upcoming1',
      equipmentId: '1',
      taskId: 'task1',
      type: 'oil_change',
      description: 'Engine oil and filter change',
      dueDate: '2024-11-15T00:00:00Z',
      priority: 'high',
      estimatedDuration: 120,
      estimatedCost: 285,
      assignedTo: 'worker_1',
      status: 'scheduled',
      notifications: []
    }
  ],
  expiringWarranties: [],
  overdueInspections: [],
  trends: {
    utilizationTrend: [
      { date: '2024-08', value: 62, trend: 'stable' },
      { date: '2024-09', value: 58, trend: 'declining' },
      { date: '2024-10', value: 55, trend: 'declining' },
      { date: '2024-11', value: 58, trend: 'improving' }
    ],
    maintenanceCostTrend: [
      { date: '2024-08', value: 8500, trend: 'stable' },
      { date: '2024-09', value: 9200, trend: 'declining' },
      { date: '2024-10', value: 8800, trend: 'improving' },
      { date: '2024-11', value: 8200, trend: 'improving' }
    ],
    reliabilityTrend: [
      { date: '2024-08', value: 92, trend: 'stable' },
      { date: '2024-09', value: 94, trend: 'improving' },
      { date: '2024-10', value: 95, trend: 'improving' },
      { date: '2024-11', value: 94, trend: 'stable' }
    ],
    efficiencyTrend: [
      { date: '2024-08', value: 85, trend: 'stable' },
      { date: '2024-09', value: 87, trend: 'improving' },
      { date: '2024-10', value: 88, trend: 'improving' },
      { date: '2024-11', value: 87, trend: 'stable' }
    ]
  },
  recommendations: [
    {
      id: 'rec1',
      type: 'maintenance',
      priority: 'medium',
      equipmentId: '1',
      title: 'Optimize Oil Change Intervals',
      description: 'Consider extending oil change intervals based on oil analysis results',
      reasoning: 'Oil analysis shows good condition at current intervals',
      expectedBenefit: 'Reduce maintenance costs by 15%',
      estimatedCost: 150,
      estimatedSavings: 400,
      implementation: 'Implement oil analysis program and adjust intervals accordingly',
      timeline: '3 months',
      status: 'new',
      createdAt: '2024-11-01T00:00:00Z',
      createdBy: 'ai'
    }
  ],
  benchmarks: {
    industryBenchmarks: {
      averageUtilization: 65,
      averageMaintenanceCost: 35000,
      averageLifespan: 15,
      averageEfficiency: 82
    },
    farmPerformance: {
      utilization: 58,
      maintenanceCost: 45000,
      efficiency: 87,
      reliability: 94
    },
    performanceRatings: {
      utilization: 'average',
      maintenance: 'below_average',
      efficiency: 'above_average',
      cost: 'average'
    }
  }
};

class EquipmentService {
  // Equipment CRUD Operations
  async getAllEquipment(): Promise<EquipmentListResponse> {
    if (isDevelopment) {
      return {
        success: true,
        data: mockEquipment,
        total: mockEquipment.length,
        page: 1,
        totalPages: 1
      };
    }

    try {
      const response = await api.get('/equipment/enhanced');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
      throw error;
    }
  }

  async getEquipmentById(id: string): Promise<EquipmentResponse> {
    if (isDevelopment) {
      const equipment = mockEquipment.find(e => e.id === id);
      if (!equipment) {
        throw new Error('Equipment not found');
      }
      return {
        success: true,
        data: equipment
      };
    }

    try {
      const response = await api.get(`/equipment/enhanced/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
      throw error;
    }
  }

  async createEquipment(equipmentData: Partial<Equipment>): Promise<EquipmentResponse> {
    if (isDevelopment) {
      const newEquipment: Equipment = {
        id: Date.now().toString(),
        farmId: 'farm_1',
        ...equipmentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user_1',
      } as Equipment;

      mockEquipment.push(newEquipment);
      return {
        success: true,
        data: newEquipment,
        message: 'Equipment created successfully'
      };
    }

    try {
      const response = await api.post('/equipment/enhanced', equipmentData);
      return response.data;
    } catch (error) {
      console.error('Failed to create equipment:', error);
      throw error;
    }
  }

  async updateEquipment(id: string, updates: Partial<Equipment>): Promise<EquipmentResponse> {
    if (isDevelopment) {
      const index = mockEquipment.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error('Equipment not found');
      }

      mockEquipment[index] = {
        ...mockEquipment[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      return {
        success: true,
        data: mockEquipment[index],
        message: 'Equipment updated successfully'
      };
    }

    try {
      const response = await api.put(`/equipment/enhanced/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Failed to update equipment:', error);
      throw error;
    }
  }

  async deleteEquipment(id: string): Promise<{ success: boolean; message: string }> {
    if (isDevelopment) {
      const index = mockEquipment.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error('Equipment not found');
      }

      mockEquipment.splice(index, 1);
      return {
        success: true,
        message: 'Equipment deleted successfully'
      };
    }

    try {
      const response = await api.delete(`/equipment/enhanced/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete equipment:', error);
      throw error;
    }
  }

  // Maintenance Operations
  async addMaintenanceRecord(equipmentId: string, record: Partial<MaintenanceRecord>): Promise<EquipmentResponse> {
    if (isDevelopment) {
      const equipment = mockEquipment.find(e => e.id === equipmentId);
      if (!equipment) {
        throw new Error('Equipment not found');
      }

      const newRecord: MaintenanceRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        ...record,
      } as MaintenanceRecord;

      equipment.maintenanceHistory.push(newRecord);
      equipment.updatedAt = new Date().toISOString();

      return {
        success: true,
        data: equipment,
        message: 'Maintenance record added successfully'
      };
    }

    try {
      const response = await api.post(`/equipment/enhanced/${equipmentId}/maintenance`, record);
      return response.data;
    } catch (error) {
      console.error('Failed to add maintenance record:', error);
      throw error;
    }
  }

  async addUsageRecord(equipmentId: string, record: Partial<UsageRecord>): Promise<EquipmentResponse> {
    if (isDevelopment) {
      const equipment = mockEquipment.find(e => e.id === equipmentId);
      if (!equipment) {
        throw new Error('Equipment not found');
      }

      const newRecord: UsageRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        ...record,
      } as UsageRecord;

      equipment.usageRecords.push(newRecord);
      equipment.totalHours += record.hoursUsed || 0;
      equipment.updatedAt = new Date().toISOString();

      return {
        success: true,
        data: equipment,
        message: 'Usage record added successfully'
      };
    }

    try {
      const response = await api.post(`/equipment/enhanced/${equipmentId}/usage`, record);
      return response.data;
    } catch (error) {
      console.error('Failed to add usage record:', error);
      throw error;
    }
  }

  async addInspectionRecord(equipmentId: string, record: Partial<InspectionRecord>): Promise<EquipmentResponse> {
    if (isDevelopment) {
      const equipment = mockEquipment.find(e => e.id === equipmentId);
      if (!equipment) {
        throw new Error('Equipment not found');
      }

      const newRecord: InspectionRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        ...record,
      } as InspectionRecord;

      equipment.inspectionHistory.push(newRecord);
      equipment.lastInspection = newRecord.date;
      equipment.updatedAt = new Date().toISOString();

      return {
        success: true,
        data: equipment,
        message: 'Inspection record added successfully'
      };
    }

    try {
      const response = await api.post(`/equipment/enhanced/${equipmentId}/inspections`, record);
      return response.data;
    } catch (error) {
      console.error('Failed to add inspection record:', error);
      throw error;
    }
  }

  // Analytics and Reporting
  async getEquipmentAnalytics(): Promise<EquipmentAnalyticsResponse> {
    if (isDevelopment) {
      return {
        success: true,
        data: mockAnalytics
      };
    }

    try {
      const response = await api.get('/equipment/enhanced/analytics/overview');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch equipment analytics:', error);
      throw error;
    }
  }

  async getMaintenanceSchedule(): Promise<MaintenanceScheduleResponse> {
    if (isDevelopment) {
      return {
        success: true,
        data: mockAnalytics.upcomingMaintenance
      };
    }

    try {
      const response = await api.get('/equipment/enhanced/maintenance/schedule');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch maintenance schedule:', error);
      throw error;
    }
  }

  async getEquipmentCostAnalysis(equipmentId: string): Promise<EquipmentCostResponse> {
    if (isDevelopment) {
      const equipment = mockEquipment.find(e => e.id === equipmentId);
      if (!equipment) {
        throw new Error('Equipment not found');
      }

      return {
        success: true,
        data: equipment.costAnalysis
      };
    }

    try {
      const response = await api.get(`/equipment/enhanced/${equipmentId}/cost-analysis`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch cost analysis:', error);
      throw error;
    }
  }

  // Utility methods
  async uploadEquipmentPhoto(equipmentId: string, file: File): Promise<{ success: boolean; photoUrl: string }> {
    if (isDevelopment) {
      // Mock photo upload
      return {
        success: true,
        photoUrl: `https://example.com/equipment/${equipmentId}/${Date.now()}.jpg`
      };
    }

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post(`/equipment/enhanced/${equipmentId}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to upload photo:', error);
      throw error;
    }
  }

  async getEquipmentByCategory(category: EquipmentCategory): Promise<EquipmentListResponse> {
    if (isDevelopment) {
      const filteredEquipment = mockEquipment.filter(e => e.category === category);
      return {
        success: true,
        data: filteredEquipment,
        total: filteredEquipment.length,
        page: 1,
        totalPages: 1
      };
    }

    try {
      const response = await api.get(`/equipment/enhanced?category=${category}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch equipment by category:', error);
      throw error;
    }
  }

  async getEquipmentByStatus(status: EquipmentStatus): Promise<EquipmentListResponse> {
    if (isDevelopment) {
      const filteredEquipment = mockEquipment.filter(e => e.status === status);
      return {
        success: true,
        data: filteredEquipment,
        total: filteredEquipment.length,
        page: 1,
        totalPages: 1
      };
    }

    try {
      const response = await api.get(`/equipment/enhanced?status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch equipment by status:', error);
      throw error;
    }
  }
}

export const equipmentService = new EquipmentService();