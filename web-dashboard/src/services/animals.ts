import { apiService } from './api';
import { 
  Animal, 
  HealthRecord, 
  ProductionRecord, 
  FeedingSchedule, 
  AnimalAnalytics,
  PaginatedResponse,
  QueryParams 
} from '../types/api';

export class AnimalService {
  // Get all animals for a farm
  async getAnimals(farmId: string, params?: QueryParams): Promise<PaginatedResponse<Animal>> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, String(value));
        }
      });
    }

    const response = await apiService.get<PaginatedResponse<Animal>>(`/animals?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch animals');
  }

  // Get single animal by ID
  async getAnimal(animalId: string): Promise<Animal> {
    const response = await apiService.get<Animal>(`/animals/${animalId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch animal');
  }

  // Create new animal
  async createAnimal(animalData: Omit<Animal, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Animal> {
    const response = await apiService.post<Animal>('/animals', animalData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create animal');
  }

  // Update animal
  async updateAnimal(animalId: string, animalData: Partial<Animal>): Promise<Animal> {
    const response = await apiService.put<Animal>(`/animals/${animalId}`, animalData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update animal');
  }

  // Delete animal
  async deleteAnimal(animalId: string): Promise<void> {
    const response = await apiService.delete(`/animals/${animalId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete animal');
    }
  }

  // Health record management
  async addHealthRecord(animalId: string, healthRecord: Omit<HealthRecord, 'id'>): Promise<Animal> {
    const response = await apiService.post<Animal>(`/animals/${animalId}/health-records`, healthRecord);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to add health record');
  }

  async updateHealthRecord(animalId: string, recordId: string, healthRecord: Partial<HealthRecord>): Promise<Animal> {
    const response = await apiService.put<Animal>(`/animals/${animalId}/health-records/${recordId}`, healthRecord);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update health record');
  }

  async deleteHealthRecord(animalId: string, recordId: string): Promise<Animal> {
    const response = await apiService.delete<Animal>(`/animals/${animalId}/health-records/${recordId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to delete health record');
  }

  // Production record management
  async addProductionRecord(animalId: string, productionRecord: Omit<ProductionRecord, 'id'>): Promise<Animal> {
    const response = await apiService.post<Animal>(`/animals/${animalId}/production-records`, productionRecord);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to add production record');
  }

  async updateProductionRecord(animalId: string, recordId: string, productionRecord: Partial<ProductionRecord>): Promise<Animal> {
    const response = await apiService.put<Animal>(`/animals/${animalId}/production-records/${recordId}`, productionRecord);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update production record');
  }

  async deleteProductionRecord(animalId: string, recordId: string): Promise<Animal> {
    const response = await apiService.delete<Animal>(`/animals/${animalId}/production-records/${recordId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to delete production record');
  }

  // Feeding schedule management
  async updateFeedingSchedule(animalId: string, schedule: FeedingSchedule[]): Promise<Animal> {
    const response = await apiService.put<Animal>(`/animals/${animalId}/feeding-schedule`, { schedule });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update feeding schedule');
  }

  // Analytics
  async getAnimalAnalytics(farmId: string, params?: { year?: number }): Promise<AnimalAnalytics> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    
    if (params?.year) {
      queryParams.set('year', String(params.year));
    }

    const response = await apiService.get<AnimalAnalytics>(`/animals/analytics/summary?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch animal analytics');
  }

  // Search and filtering
  async searchAnimals(farmId: string, searchTerm: string): Promise<Animal[]> {
    const queryParams = new URLSearchParams({
      farmId,
      search: searchTerm
    });

    const response = await apiService.get<PaginatedResponse<Animal>>(`/animals?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data.data;
    }
    
    throw new Error(response.message || 'Failed to search animals');
  }

  async getAnimalsBySpecies(farmId: string, species: string): Promise<Animal[]> {
    const queryParams = new URLSearchParams({
      farmId,
      species
    });

    const response = await apiService.get<PaginatedResponse<Animal>>(`/animals?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data.data;
    }
    
    throw new Error(response.message || 'Failed to fetch animals by species');
  }

  async getAnimalsByHealthStatus(farmId: string, healthStatus: string): Promise<Animal[]> {
    const queryParams = new URLSearchParams({
      farmId,
      healthStatus
    });

    const response = await apiService.get<PaginatedResponse<Animal>>(`/animals?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data.data;
    }
    
    throw new Error(response.message || 'Failed to fetch animals by health status');
  }

  // Batch operations
  async bulkUpdateAnimals(updates: { animalId: string; data: Partial<Animal> }[]): Promise<void> {
    const response = await apiService.post('/animals/bulk-update', { updates });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to bulk update animals');
    }
  }

  async exportAnimals(farmId: string, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const queryParams = new URLSearchParams({
      farmId,
      format
    });

    const response = await apiService.get(`/animals/export?${queryParams}`, {
      responseType: 'blob'
    });

    if (response instanceof Blob) {
      return response;
    }
    
    throw new Error('Failed to export animals');
  }
}

export const animalService = new AnimalService();