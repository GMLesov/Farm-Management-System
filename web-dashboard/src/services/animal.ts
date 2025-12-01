import axios, { AxiosResponse } from 'axios';
import { 
  EnhancedAnimal, 
  AnimalAnalytics, 
  AnimalFilter, 
  AnimalSortOption,
  AnimalResponse,
  AnimalListResponse,
  PhotoUploadResponse,
  AnimalPhoto,
  CareTask,
  MedicalRecord,
  VaccinationRecord,
  ProductionRecord,
  AnimalInsights,
  PredictiveData
} from '../types/animal';

class AnimalService {
  private baseURL: string;
  private isDevelopment: boolean;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
    this.isDevelopment = process.env.NODE_ENV === 'development';
    
    // Setup axios interceptors for authentication
    axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Animal CRUD Operations
  async getAllAnimals(filter?: AnimalFilter, sort?: AnimalSortOption, page = 1, limit = 50): Promise<AnimalListResponse> {
    try {
      if (this.isDevelopment) {
        return this.getMockAnimals(filter, sort, page, limit);
      }

      const params = new URLSearchParams();
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else if (typeof value === 'object') {
              params.append(key, JSON.stringify(value));
            } else {
              params.append(key, String(value));
            }
          }
        });
      }
      if (sort) {
        params.append('sortBy', sort.field);
        params.append('sortOrder', sort.direction);
      }
      params.append('page', String(page));
      params.append('limit', String(limit));

      const response: AxiosResponse<AnimalListResponse> = await axios.get(
        `${this.baseURL}/animals?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching animals:', error);
      throw new Error('Failed to fetch animals');
    }
  }

  async getAnimalById(animalId: string): Promise<AnimalResponse> {
    try {
      if (this.isDevelopment) {
        return this.getMockAnimalById(animalId);
      }

      const response: AxiosResponse<AnimalResponse> = await axios.get(
        `${this.baseURL}/animals/${animalId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching animal:', error);
      throw new Error('Failed to fetch animal details');
    }
  }

  async createAnimal(animalData: Partial<EnhancedAnimal>): Promise<AnimalResponse> {
    try {
      if (this.isDevelopment) {
        return this.getMockCreateAnimal(animalData);
      }

      const response: AxiosResponse<AnimalResponse> = await axios.post(
        `${this.baseURL}/animals`,
        animalData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating animal:', error);
      throw new Error('Failed to create animal');
    }
  }

  async updateAnimal(animalId: string, updates: Partial<EnhancedAnimal>): Promise<AnimalResponse> {
    try {
      if (this.isDevelopment) {
        return this.getMockUpdateAnimal(animalId, updates);
      }

      const response: AxiosResponse<AnimalResponse> = await axios.put(
        `${this.baseURL}/animals/${animalId}`,
        updates
      );
      return response.data;
    } catch (error) {
      console.error('Error updating animal:', error);
      throw new Error('Failed to update animal');
    }
  }

  async deleteAnimal(animalId: string): Promise<{ success: boolean; message: string }> {
    try {
      if (this.isDevelopment) {
        return { success: true, message: 'Animal deleted successfully (mock)' };
      }

      const response: AxiosResponse<{ success: boolean; message: string }> = await axios.delete(
        `${this.baseURL}/animals/${animalId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting animal:', error);
      throw new Error('Failed to delete animal');
    }
  }

  // Photo Management
  async uploadAnimalPhoto(animalId: string, photoFile: File, metadata: Partial<AnimalPhoto>): Promise<PhotoUploadResponse> {
    try {
      if (this.isDevelopment) {
        return this.getMockPhotoUpload(animalId, photoFile, metadata);
      }

      const formData = new FormData();
      formData.append('photo', photoFile);
      formData.append('metadata', JSON.stringify(metadata));

      const response: AxiosResponse<PhotoUploadResponse> = await axios.post(
        `${this.baseURL}/animals/${animalId}/photos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw new Error('Failed to upload photo');
    }
  }

  async getAnimalPhotos(animalId: string, photoType?: string): Promise<{ success: boolean; data: AnimalPhoto[] }> {
    try {
      if (this.isDevelopment) {
        return this.getMockAnimalPhotos(animalId, photoType);
      }

      const params = photoType ? `?type=${photoType}` : '';
      const response: AxiosResponse<{ success: boolean; data: AnimalPhoto[] }> = await axios.get(
        `${this.baseURL}/animals/${animalId}/photos${params}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw new Error('Failed to fetch animal photos');
    }
  }

  async deleteAnimalPhoto(animalId: string, photoId: string): Promise<{ success: boolean; message: string }> {
    try {
      if (this.isDevelopment) {
        return { success: true, message: 'Photo deleted successfully (mock)' };
      }

      const response: AxiosResponse<{ success: boolean; message: string }> = await axios.delete(
        `${this.baseURL}/animals/${animalId}/photos/${photoId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw new Error('Failed to delete photo');
    }
  }

  // Health Management
  async addMedicalRecord(animalId: string, record: Partial<MedicalRecord>): Promise<{ success: boolean; data: MedicalRecord }> {
    try {
      if (this.isDevelopment) {
        return this.getMockAddMedicalRecord(animalId, record);
      }

      const response: AxiosResponse<{ success: boolean; data: MedicalRecord }> = await axios.post(
        `${this.baseURL}/animals/${animalId}/medical-records`,
        record
      );
      return response.data;
    } catch (error) {
      console.error('Error adding medical record:', error);
      throw new Error('Failed to add medical record');
    }
  }

  async addVaccination(animalId: string, vaccination: Partial<VaccinationRecord>): Promise<{ success: boolean; data: VaccinationRecord }> {
    try {
      if (this.isDevelopment) {
        return this.getMockAddVaccination(animalId, vaccination);
      }

      const response: AxiosResponse<{ success: boolean; data: VaccinationRecord }> = await axios.post(
        `${this.baseURL}/animals/${animalId}/vaccinations`,
        vaccination
      );
      return response.data;
    } catch (error) {
      console.error('Error adding vaccination:', error);
      throw new Error('Failed to add vaccination record');
    }
  }

  // Task Management
  async getCareTasks(animalId: string): Promise<{ success: boolean; data: CareTask[] }> {
    try {
      if (this.isDevelopment) {
        return this.getMockCareTasks(animalId);
      }

      const response: AxiosResponse<{ success: boolean; data: CareTask[] }> = await axios.get(
        `${this.baseURL}/animals/${animalId}/tasks`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching care tasks:', error);
      throw new Error('Failed to fetch care tasks');
    }
  }

  async createCareTask(animalId: string, task: Partial<CareTask>): Promise<{ success: boolean; data: CareTask }> {
    try {
      if (this.isDevelopment) {
        return this.getMockCreateCareTask(animalId, task);
      }

      const response: AxiosResponse<{ success: boolean; data: CareTask }> = await axios.post(
        `${this.baseURL}/animals/${animalId}/tasks`,
        task
      );
      return response.data;
    } catch (error) {
      console.error('Error creating care task:', error);
      throw new Error('Failed to create care task');
    }
  }

  // Production Management
  async addProductionRecord(animalId: string, record: Partial<ProductionRecord>): Promise<{ success: boolean; data: ProductionRecord }> {
    try {
      if (this.isDevelopment) {
        return this.getMockAddProductionRecord(animalId, record);
      }

      const response: AxiosResponse<{ success: boolean; data: ProductionRecord }> = await axios.post(
        `${this.baseURL}/animals/${animalId}/production`,
        record
      );
      return response.data;
    } catch (error) {
      console.error('Error adding production record:', error);
      throw new Error('Failed to add production record');
    }
  }

  // Analytics and Reports
  async getAnimalAnalytics(): Promise<{ success: boolean; data: AnimalAnalytics }> {
    try {
      if (this.isDevelopment) {
        return this.getMockAnimalAnalytics();
      }

      const response: AxiosResponse<{ success: boolean; data: AnimalAnalytics }> = await axios.get(
        `${this.baseURL}/animals/analytics`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw new Error('Failed to fetch animal analytics');
    }
  }

  async getAnimalInsights(animalId: string): Promise<{ success: boolean; data: AnimalInsights }> {
    try {
      if (this.isDevelopment) {
        return this.getMockAnimalInsights(animalId);
      }

      const response: AxiosResponse<{ success: boolean; data: AnimalInsights }> = await axios.get(
        `${this.baseURL}/animals/${animalId}/insights`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw new Error('Failed to fetch animal insights');
    }
  }

  async getPredictiveAnalytics(animalId: string): Promise<{ success: boolean; data: PredictiveData }> {
    try {
      if (this.isDevelopment) {
        return this.getMockPredictiveAnalytics(animalId);
      }

      const response: AxiosResponse<{ success: boolean; data: PredictiveData }> = await axios.get(
        `${this.baseURL}/animals/${animalId}/predictions`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching predictions:', error);
      throw new Error('Failed to fetch predictive analytics');
    }
  }

  // Mock data methods for development
  private getMockAnimals(filter?: AnimalFilter, sort?: AnimalSortOption, page = 1, limit = 50): AnimalListResponse {
    const mockAnimals: EnhancedAnimal[] = [
      {
        id: '1',
        farmId: 'farm_1',
        name: 'Bessie',
        tagNumber: 'C001',
        rfidTag: 'RFID001',
        species: {
          type: 'cattle',
          category: 'livestock',
          expectedLifespan: 20,
          maturityAge: 2,
          breedingAge: 15
        },
        breed: 'Holstein',
        gender: 'female',
        birthDate: '2022-03-15T00:00:00Z',
        acquisitionDate: '2022-03-15T00:00:00Z',
        acquisitionSource: 'born_on_farm',
        physicalTraits: {
          weight: [
            {
              id: 'w1',
              weight: 650,
              unit: 'kg',
              date: '2024-11-01T00:00:00Z',
              method: 'scale',
              recordedBy: 'John Smith',
              bodyConditionScore: 7,
              notes: 'Good condition'
            }
          ],
          height: 150,
          color: 'Black and White',
          markings: ['White blaze', 'Black spots'],
          distinguishingFeatures: ['Star on forehead'],
          bodyConditionScore: 7,
          temperament: 'calm'
        },
        identificationMarks: [
          {
            type: 'ear_tag',
            location: 'Left ear',
            value: 'C001',
            date: '2022-03-15T00:00:00Z'
          }
        ],
        currentLocation: {
          fieldId: 'field_1',
          fieldName: 'North Pasture',
          coordinates: { lat: 40.7128, lng: -74.0060 },
          lastMoved: '2024-10-01T00:00:00Z',
          movedBy: 'John Smith',
          reason: 'Seasonal rotation'
        },
        locationHistory: [],
        housing: {
          type: 'pasture',
          capacity: 50,
          currentOccupancy: 35,
          facilities: [
            {
              name: 'Water trough',
              type: 'waterer',
              condition: 'good',
              lastMaintenance: '2024-10-15T00:00:00Z',
              nextMaintenance: '2024-11-15T00:00:00Z'
            }
          ],
          conditions: {
            temperature: 18,
            humidity: 65,
            ventilation: 'excellent',
            cleanliness: 'good',
            waterAccess: true,
            feedAccess: true,
            shelter: true
          },
          lastInspection: '2024-11-01T00:00:00Z',
          inspectionScore: 8.5
        },
        healthStatus: {
          overall: 'excellent',
          lastExamination: '2024-10-15T00:00:00Z',
          nextExamination: '2025-01-15T00:00:00Z',
          examiningVet: 'Dr. Wilson',
          currentConditions: [],
          activeTreatments: [],
          quarantineStatus: false
        },
        medicalHistory: [],
        vaccinations: [],
        treatments: [],
        breedingInfo: {
          breedingStatus: 'available',
          reproductiveHistory: [],
          breedingValue: 8.5,
          geneticMarkers: [],
          lastBreeding: '2024-08-15T00:00:00Z'
        },
        offspring: [],
        parentage: {
          verified: true,
          verificationMethod: 'breeding_records'
        },
        productionRecords: [
          {
            id: 'prod1',
            type: 'milk',
            date: '2024-11-03T00:00:00Z',
            quantity: 25,
            unit: 'liters',
            quality: {
              grade: 'A',
              measurements: { fat: 3.8, protein: 3.2 },
              defects: [],
              testResults: []
            },
            price: 0.45,
            notes: 'Morning milking'
          }
        ],
        performanceMetrics: {
          productionEfficiency: 92,
          healthScore: 95,
          reproductiveEfficiency: 85,
          growthRate: 88,
          feedConversionRatio: 1.4,
          economicValue: 89,
          lastCalculated: '2024-11-03T00:00:00Z',
          trends: {
            production: [
              { date: '2024-10', value: 750 },
              { date: '2024-11', value: 775 }
            ],
            health: [
              { date: '2024-10', value: 94 },
              { date: '2024-11', value: 95 }
            ],
            weight: [
              { date: '2024-10', value: 645 },
              { date: '2024-11', value: 650 }
            ]
          }
        },
        feedConsumption: [],
        photos: [
          {
            id: 'photo1',
            url: 'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=400',
            thumbnail: 'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=200',
            caption: 'Profile photo - November 2024',
            type: 'profile',
            category: 'identification',
            takenAt: '2024-11-01T10:30:00Z',
            takenBy: 'John Smith',
            equipment: 'iPhone 14',
            settings: {
              camera: 'iPhone 14',
              flash: false,
              lighting: 'natural'
            },
            aiAnalysis: {
              confidence: 92,
              detectedFeatures: [
                {
                  feature: 'Body condition',
                  confidence: 95,
                  description: 'Good body condition score estimated at 7/9'
                }
              ],
              healthIndicators: [
                {
                  indicator: 'Coat condition',
                  status: 'normal',
                  confidence: 88,
                  description: 'Healthy, shiny coat observed'
                }
              ],
              bodyConditionScore: 7,
              weightEstimate: 648
            },
            annotations: [],
            quality: {
              resolution: { width: 1920, height: 1080 },
              fileSize: 2.5,
              format: 'jpeg',
              sharpness: 8,
              lighting: 9,
              composition: 7,
              overallScore: 8,
              usableForAI: true
            },
            verified: true,
            verifiedBy: 'Dr. Wilson',
            verifiedAt: '2024-11-01T14:00:00Z',
            tags: ['profile', 'monthly_check'],
            visibility: 'private',
            accessLevel: 'farm_only'
          }
        ],
        photoAnalytics: {
          totalPhotos: 15,
          photosByType: {
            profile: 5,
            identification: 3,
            health_condition: 2,
            injury: 0,
            treatment: 1,
            breeding: 2,
            pregnancy: 0,
            birth: 0,
            growth_progress: 2,
            production: 0,
            before_after: 0,
            x_ray: 0,
            ultrasound: 0,
            general: 0
          },
          photosByMonth: [
            { month: '2024-09', count: 3 },
            { month: '2024-10', count: 7 },
            { month: '2024-11', count: 5 }
          ],
          storageUsed: 45.2,
          aiAnalysisSuccess: 93,
          averageQuality: 8.2,
          lastPhotoDate: '2024-11-01T10:30:00Z',
          mostFrequentType: 'profile',
          photoSeries: [
            {
              id: 'series1',
              name: 'Monthly Health Check',
              type: 'health_monitoring',
              startDate: '2024-08-01T00:00:00Z',
              frequency: 'monthly',
              photoCount: 4,
              lastPhoto: '2024-11-01T10:30:00Z',
              nextScheduled: '2024-12-01T10:00:00Z',
              purpose: 'Regular health monitoring and body condition assessment'
            }
          ]
        },
        documents: [],
        financialData: {
          acquisitionCost: 2500,
          currentValue: 3200,
          insuranceValue: 3500,
          totalMedicalCosts: 350,
          totalFeedCosts: 1200,
          totalProduction: 4500,
          netValue: 1450,
          roi: 58,
          costBreakdown: {
            feed: 1200,
            medical: 350,
            housing: 200,
            breeding: 100,
            labor: 300,
            insurance: 150,
            equipment: 75,
            other: 25
          },
          revenueBreakdown: {
            production: 4200,
            breeding: 300,
            sale: 0,
            insurance: 0,
            other: 0
          },
          projectedValue: 3500,
          depreciationRate: 5
        },
        assignedCaretakers: [
          {
            id: 'caretaker1',
            workerId: 'worker1',
            workerName: 'John Smith',
            role: 'primary_caretaker',
            assignedDate: '2024-01-01T00:00:00Z',
            responsibilities: ['Daily care', 'Health monitoring', 'Milking'],
            isActive: true,
            performance: {
              animalHealthScore: 95,
              taskCompletionRate: 98,
              observationAccuracy: 92,
              emergencyResponseTime: 15,
              lastEvaluation: '2024-10-01T00:00:00Z',
              notes: 'Excellent caretaker with strong attention to detail'
            }
          }
        ],
        careSchedule: [],
        insights: {
          healthTrends: [
            {
              metric: 'Overall Health Score',
              trend: 'improving',
              changePercent: 5.2,
              period: 'Last 3 months',
              significance: 'medium',
              description: 'Steady improvement in health metrics'
            }
          ],
          productionTrends: [
            {
              productType: 'milk',
              averageDaily: 24.5,
              trend: 'increasing',
              changePercent: 8.3,
              seasonalPattern: true,
              peakPeriods: ['Spring', 'Early Summer'],
              projectedAnnual: 8760
            }
          ],
          behaviorPatterns: [],
          costEfficiency: [
            {
              metric: 'Feed Conversion Ratio',
              value: 1.4,
              unit: 'kg feed/kg milk',
              benchmarkValue: 1.6,
              performance: 'above_average',
              improvementPotential: 12
            }
          ],
          riskFactors: [],
          recommendations: [
            {
              id: 'rec1',
              type: 'nutrition',
              priority: 'medium',
              title: 'Optimize mineral supplementation',
              description: 'Consider adding copper and zinc supplements to improve coat quality',
              reasoning: 'Analysis shows potential for improved coat condition',
              expectedBenefit: 'Improved overall health and production',
              implementation: 'Add mineral supplement to daily feed ration',
              cost: 45,
              timeline: '2 weeks',
              status: 'new',
              createdAt: '2024-11-03T00:00:00Z',
              createdBy: 'ai'
            }
          ],
          benchmarkComparison: {
            species: 'cattle',
            breed: 'Holstein',
            region: 'Northeast US',
            farmSize: 'Medium (50-200 head)',
            metrics: {
              milk_production: {
                animalValue: 24.5,
                benchmarkValue: 22.8,
                percentile: 72,
                status: 'above_average',
                unit: 'liters/day'
              }
            },
            lastUpdated: '2024-11-01T00:00:00Z',
            source: 'USDA Dairy Analytics'
          },
          alertsAndWarnings: []
        },
        predictiveAnalytics: {
          healthPredictions: [
            {
              condition: 'Lameness',
              probability: 15,
              timeframe: 'Next 6 months',
              confidenceLevel: 78,
              riskFactors: ['Age', 'Weight', 'Concrete flooring'],
              prevention: ['Regular hoof trimming', 'Improved bedding'],
              earlyWarnings: ['Limping', 'Reluctance to move', 'Uneven weight distribution']
            }
          ],
          productionForecasts: [
            {
              productType: 'milk',
              forecastPeriod: 'Next 3 months',
              predictedQuantity: 2250,
              confidenceInterval: { lower: 2100, upper: 2400 },
              factors: [
                {
                  factor: 'Seasonal variation',
                  impact: -8,
                  confidence: 92,
                  description: 'Expected decrease due to winter season'
                }
              ],
              recommendations: ['Maintain high-quality hay', 'Monitor body condition']
            }
          ],
          breedingPredictions: [
            {
              breedingSuccess: 85,
              optimalBreedingTime: '2024-12-15T00:00:00Z',
              expectedOffspring: 1,
              geneticOutcomes: [
                {
                  trait: 'Milk production',
                  probability: 78,
                  desirability: 'high',
                  impact: 'Above average milk yield expected'
                }
              ],
              recommendations: ['Consider AI with high genetic merit bull']
            }
          ],
          financialProjections: [
            {
              metric: 'Annual Revenue',
              currentValue: 4500,
              projectedValue: 4850,
              timeframe: 'Next 12 months',
              confidence: 82,
              factors: ['Production increase', 'Market prices'],
              scenarios: [
                {
                  name: 'Optimistic',
                  probability: 25,
                  value: 5200,
                  description: 'High milk prices and production'
                },
                {
                  name: 'Expected',
                  probability: 50,
                  value: 4850,
                  description: 'Normal market conditions'
                },
                {
                  name: 'Conservative',
                  probability: 25,
                  value: 4400,
                  description: 'Lower prices or production issues'
                }
              ]
            }
          ],
          riskAssessments: [
            {
              riskType: 'Health',
              currentRisk: 15,
              futureRisk: 20,
              mitigationStrategies: ['Regular vet checks', 'Preventive care'],
              monitoringRequired: ['Body condition', 'Milk production', 'Behavior'],
              costOfInaction: 850
            }
          ],
          optimalActions: [
            {
              action: 'Schedule breeding',
              timing: 'December 15, 2024',
              expectedBenefit: 1200,
              cost: 150,
              roi: 700,
              urgency: 75,
              dependencies: ['Pregnancy check', 'Health assessment']
            }
          ]
        },
        status: 'active',
        lifecycle: [
          {
            id: 'lc1',
            type: 'birth',
            date: '2022-03-15T00:00:00Z',
            description: 'Born on farm',
            significance: 'milestone',
            recordedBy: 'Farm Manager',
            notes: 'Healthy birth, no complications'
          },
          {
            id: 'lc2',
            type: 'weaning',
            date: '2022-09-15T00:00:00Z',
            description: 'Weaned from mother',
            significance: 'milestone',
            recordedBy: 'John Smith',
            notes: 'Smooth transition to solid feed'
          }
        ],
        notes: 'High-producing Holstein with excellent health record',
        tags: ['high_producer', 'excellent_health', 'breeding_candidate'],
        createdAt: '2022-03-15T00:00:00Z',
        updatedAt: '2024-11-03T12:00:00Z',
        createdBy: 'farm_manager'
      }
    ];

    // Apply filters (simplified for mock)
    let filteredAnimals = mockAnimals;
    if (filter?.species?.length) {
      filteredAnimals = filteredAnimals.filter(animal => 
        filter.species!.includes(animal.species.type)
      );
    }

    return {
      success: true,
      data: filteredAnimals.slice((page - 1) * limit, page * limit),
      total: filteredAnimals.length,
      page,
      limit
    };
  }

  private getMockAnimalById(animalId: string): AnimalResponse {
    const animals = this.getMockAnimals().data || [];
    const animal = animals.find(a => a.id === animalId);
    
    if (!animal) {
      return {
        success: false,
        error: 'Animal not found'
      };
    }

    return {
      success: true,
      data: animal
    };
  }

  private getMockCreateAnimal(animalData: Partial<EnhancedAnimal>): AnimalResponse {
    const newAnimal: EnhancedAnimal = {
      id: Date.now().toString(),
      farmId: 'farm_1',
      ...animalData,
      photos: [],
      medicalHistory: [],
      vaccinations: [],
      treatments: [],
      offspring: [],
      productionRecords: [],
      feedConsumption: [],
      documents: [],
      assignedCaretakers: [],
      careSchedule: [],
      locationHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user_1'
    } as EnhancedAnimal;

    return {
      success: true,
      data: newAnimal,
      message: 'Animal created successfully'
    };
  }

  private getMockUpdateAnimal(animalId: string, updates: Partial<EnhancedAnimal>): AnimalResponse {
    return {
      success: true,
      data: { ...updates, id: animalId, updatedAt: new Date().toISOString() } as EnhancedAnimal,
      message: 'Animal updated successfully'
    };
  }

  private getMockPhotoUpload(animalId: string, photoFile: File, metadata: Partial<AnimalPhoto>): PhotoUploadResponse {
    return {
      success: true,
      data: {
        photoId: Date.now().toString(),
        url: URL.createObjectURL(photoFile),
        thumbnail: URL.createObjectURL(photoFile),
        aiAnalysis: {
          confidence: 85,
          detectedFeatures: [
            {
              feature: 'Body condition',
              confidence: 90,
              description: 'Good body condition detected'
            }
          ],
          healthIndicators: [
            {
              indicator: 'Overall health',
              status: 'normal',
              confidence: 88,
              description: 'Animal appears healthy'
            }
          ]
        }
      },
      message: 'Photo uploaded successfully'
    };
  }

  private getMockAnimalPhotos(animalId: string, photoType?: string): { success: boolean; data: AnimalPhoto[] } {
    const animal = this.getMockAnimals().data?.find(a => a.id === animalId);
    let photos = animal?.photos || [];
    
    if (photoType) {
      photos = photos.filter(photo => photo.type === photoType);
    }

    return {
      success: true,
      data: photos
    };
  }

  private getMockAddMedicalRecord(animalId: string, record: Partial<MedicalRecord>): { success: boolean; data: MedicalRecord } {
    const newRecord: MedicalRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: 'routine_checkup',
      veterinarian: 'Dr. Wilson',
      diagnosis: 'Healthy',
      symptoms: [],
      treatment: 'None required',
      medications: [],
      cost: 0,
      followUpRequired: false,
      notes: 'Regular checkup completed',
      photos: [],
      ...record
    };

    return {
      success: true,
      data: newRecord
    };
  }

  private getMockAddVaccination(animalId: string, vaccination: Partial<VaccinationRecord>): { success: boolean; data: VaccinationRecord } {
    const newVaccination: VaccinationRecord = {
      id: Date.now().toString(),
      vaccine: 'Example Vaccine',
      disease: 'Example Disease',
      date: new Date().toISOString(),
      nextDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      administeredBy: 'Dr. Wilson',
      batchNumber: 'BATCH123',
      manufacturer: 'VetPharma',
      site: 'Neck',
      dose: '2ml',
      reactions: [],
      cost: 25,
      notes: 'Vaccination administered successfully',
      ...vaccination
    };

    return {
      success: true,
      data: newVaccination
    };
  }

  private getMockCareTasks(animalId: string): { success: boolean; data: CareTask[] } {
    const tasks: CareTask[] = [
      {
        id: 'task1',
        title: 'Morning Feed',
        description: 'Provide morning feed ration',
        type: 'feeding',
        priority: 'high',
        status: 'pending',
        assignedTo: ['worker1'],
        scheduledTime: new Date().toISOString(),
        estimatedDuration: 30,
        frequency: 'daily',
        nextDue: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        requirements: [
          {
            type: 'feed',
            item: 'Hay',
            quantity: 15,
            notes: 'Good quality hay'
          }
        ],
        notes: 'Check water levels as well',
        photos: [],
        verified: false
      }
    ];

    return {
      success: true,
      data: tasks
    };
  }

  private getMockCreateCareTask(animalId: string, task: Partial<CareTask>): { success: boolean; data: CareTask } {
    const newTask: CareTask = {
      id: Date.now().toString(),
      title: 'New Task',
      description: 'Task description',
      type: 'feeding',
      priority: 'medium',
      status: 'pending',
      assignedTo: [],
      scheduledTime: new Date().toISOString(),
      estimatedDuration: 60,
      frequency: 'once',
      requirements: [],
      notes: '',
      photos: [],
      verified: false,
      ...task
    };

    return {
      success: true,
      data: newTask
    };
  }

  private getMockAddProductionRecord(animalId: string, record: Partial<ProductionRecord>): { success: boolean; data: ProductionRecord } {
    const newRecord: ProductionRecord = {
      id: Date.now().toString(),
      type: 'milk',
      date: new Date().toISOString(),
      quantity: 25,
      unit: 'liters',
      quality: {
        grade: 'A',
        measurements: {},
        defects: [],
        testResults: []
      },
      notes: 'Daily production record',
      ...record
    };

    return {
      success: true,
      data: newRecord
    };
  }

  private getMockAnimalAnalytics(): { success: boolean; data: AnimalAnalytics } {
    const analytics: AnimalAnalytics = {
      totalAnimals: 45,
      animalsBySpecies: {
        cattle: 25,
        sheep: 15,
        goats: 5
      },
      animalsByStatus: {
        active: 40,
        pregnant: 8,
        sick: 2,
        quarantined: 0
      },
      animalsByAge: {
        '0-1 years': 8,
        '1-3 years': 15,
        '3-5 years': 12,
        '5+ years': 10
      },
      healthOverview: {
        healthy: 40,
        sick: 2,
        quarantined: 0,
        averageHealthScore: 92
      },
      productionSummary: {
        totalProduction: 1250,
        averageProduction: 28,
        topProducers: [
          { animalId: '1', name: 'Bessie', production: 785 },
          { animalId: '2', name: 'Molly', production: 720 },
          { animalId: '3', name: 'Daisy', production: 695 }
        ]
      },
      financialSummary: {
        totalValue: 145000,
        totalCosts: 45000,
        totalRevenue: 85000,
        netProfit: 40000,
        roi: 89
      },
      photoSummary: {
        totalPhotos: 675,
        averagePhotosPerAnimal: 15,
        aiAnalysisSuccessRate: 89,
        storageUsed: 2048
      },
      trends: {
        healthTrends: [
          { date: '2024-08', score: 89 },
          { date: '2024-09', score: 91 },
          { date: '2024-10', score: 92 },
          { date: '2024-11', score: 93 }
        ],
        productionTrends: [
          { date: '2024-08', quantity: 1180 },
          { date: '2024-09', quantity: 1220 },
          { date: '2024-10', quantity: 1250 },
          { date: '2024-11', quantity: 1275 }
        ],
        costTrends: [
          { date: '2024-08', cost: 11200 },
          { date: '2024-09', cost: 11500 },
          { date: '2024-10', cost: 11800 },
          { date: '2024-11', cost: 12000 }
        ],
        populationTrends: [
          { date: '2024-08', count: 42 },
          { date: '2024-09', count: 44 },
          { date: '2024-10', count: 45 },
          { date: '2024-11', count: 45 }
        ]
      },
      benchmarks: {
        industryAverage: 85,
        topPercentile: 95,
        farmPerformance: 92,
        improvementAreas: ['Feed efficiency', 'Reproductive performance']
      }
    };

    return {
      success: true,
      data: analytics
    };
  }

  private getMockAnimalInsights(animalId: string): { success: boolean; data: AnimalInsights } {
    // Return the insights from the mock animal data
    const animal = this.getMockAnimals().data?.find(a => a.id === animalId);
    
    return {
      success: true,
      data: animal?.insights || {
        healthTrends: [],
        productionTrends: [],
        behaviorPatterns: [],
        costEfficiency: [],
        riskFactors: [],
        recommendations: [],
        benchmarkComparison: {
          species: '',
          breed: '',
          region: '',
          farmSize: '',
          metrics: {},
          lastUpdated: '',
          source: ''
        },
        alertsAndWarnings: []
      }
    };
  }

  private getMockPredictiveAnalytics(animalId: string): { success: boolean; data: PredictiveData } {
    const animal = this.getMockAnimals().data?.find(a => a.id === animalId);
    
    return {
      success: true,
      data: animal?.predictiveAnalytics || {
        healthPredictions: [],
        productionForecasts: [],
        breedingPredictions: [],
        financialProjections: [],
        riskAssessments: [],
        optimalActions: []
      }
    };
  }
}

export default new AnimalService();