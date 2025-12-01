import { apiService } from './api';
import { 
  BreedingRecord,
  PaginatedResponse,
  QueryParams 
} from '../types/api';

interface BreedingAnalytics {
  totalBreedings: number;
  successfulBreedings: number;
  pregnancyRate: number;
  birthRate: number;
  averageGestationPeriod: number;
  weaningRate: number;
  monthlyBreedings: { month: string; count: number }[];
  breedingMethodStats: { method: string; count: number; successRate: number }[];
  costAnalysis: {
    totalCosts: number;
    averageCostPerBreeding: number;
    monthlySpending: { month: string; amount: number }[];
  };
}

export class BreedingService {
  // Get all breeding records for a farm
  async getBreedingRecords(farmId: string, params?: QueryParams): Promise<PaginatedResponse<BreedingRecord>> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, String(value));
        }
      });
    }

    const response = await apiService.get<PaginatedResponse<BreedingRecord>>(`/breeding?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch breeding records');
  }

  // Get active breeding cycles
  async getActiveBreedingCycles(farmId: string): Promise<BreedingRecord[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);

    const response = await apiService.get<BreedingRecord[]>(`/breeding/active?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch active breeding cycles');
  }

  // Get upcoming due dates
  async getUpcomingDueDates(farmId: string, days?: number): Promise<BreedingRecord[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    
    if (days) {
      queryParams.set('days', String(days));
    }

    const response = await apiService.get<BreedingRecord[]>(`/breeding/due-dates?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch upcoming due dates');
  }

  // Get pregnancy checks needed
  async getPregnancyChecksNeeded(farmId: string): Promise<BreedingRecord[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);

    const response = await apiService.get<BreedingRecord[]>(`/breeding/pregnancy-checks?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch pregnancy checks needed');
  }

  // Get single breeding record by ID
  async getBreedingRecord(recordId: string): Promise<BreedingRecord> {
    const response = await apiService.get<BreedingRecord>(`/breeding/${recordId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch breeding record');
  }

  // Create new breeding record
  async createBreedingRecord(recordData: Omit<BreedingRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<BreedingRecord> {
    const response = await apiService.post<BreedingRecord>('/breeding', recordData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create breeding record');
  }

  // Update breeding record
  async updateBreedingRecord(recordId: string, recordData: Partial<BreedingRecord>): Promise<BreedingRecord> {
    const response = await apiService.put<BreedingRecord>(`/breeding/${recordId}`, recordData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update breeding record');
  }

  // Update pregnancy status
  async updatePregnancyStatus(recordId: string, pregnancyData: {
    pregnancyStatus: 'confirmed' | 'not_confirmed' | 'failed';
    pregnancyCheckDate: string;
    checkMethod: string;
    notes?: string;
  }): Promise<BreedingRecord> {
    const response = await apiService.patch<BreedingRecord>(`/breeding/${recordId}/pregnancy`, pregnancyData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update pregnancy status');
  }

  // Record birth
  async recordBirth(recordId: string, birthData: {
    actualBirthDate: string;
    outcome: 'successful' | 'difficult' | 'assisted' | 'failed';
    offspring: {
      tag?: string;
      gender: 'male' | 'female';
      birthWeight?: number;
      status: 'alive' | 'stillborn' | 'died_shortly_after';
    }[];
    complications?: string;
    veterinarianPresent?: boolean;
    notes?: string;
  }): Promise<BreedingRecord> {
    const response = await apiService.patch<BreedingRecord>(`/breeding/${recordId}/birth`, birthData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to record birth');
  }

  // Record weaning
  async recordWeaning(recordId: string, weaningData: {
    weaningDate: string;
    weaningWeight?: number;
    notes?: string;
  }): Promise<BreedingRecord> {
    const response = await apiService.patch<BreedingRecord>(`/breeding/${recordId}/weaning`, weaningData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to record weaning');
  }

  // Delete breeding record
  async deleteBreedingRecord(recordId: string): Promise<void> {
    const response = await apiService.delete(`/breeding/${recordId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete breeding record');
    }
  }

  // Analytics
  async getBreedingAnalytics(farmId: string, year?: number): Promise<BreedingAnalytics> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    
    if (year) {
      queryParams.set('year', String(year));
    }

    const response = await apiService.get<BreedingAnalytics>(`/breeding/analytics/summary?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch breeding analytics');
  }

  // Search and filtering
  async searchBreedingRecords(farmId: string, searchTerm: string): Promise<BreedingRecord[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('search', searchTerm);

    const response = await apiService.get<PaginatedResponse<BreedingRecord>>(`/breeding?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data.data;
    }
    
    throw new Error(response.message || 'Failed to search breeding records');
  }

  async getRecordsByStatus(farmId: string, status: string): Promise<BreedingRecord[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('status', status);

    const response = await apiService.get<PaginatedResponse<BreedingRecord>>(`/breeding?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data.data;
    }
    
    throw new Error(response.message || 'Failed to fetch records by status');
  }

  async getRecordsByMethod(farmId: string, method: string): Promise<BreedingRecord[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('method', method);

    const response = await apiService.get<PaginatedResponse<BreedingRecord>>(`/breeding?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data.data;
    }
    
    throw new Error(response.message || 'Failed to fetch records by method');
  }

  async getRecordsByAnimal(farmId: string, animalId: string, role?: 'mother' | 'father'): Promise<BreedingRecord[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('animalId', animalId);
    
    if (role) {
      queryParams.set('role', role);
    }

    const response = await apiService.get<PaginatedResponse<BreedingRecord>>(`/breeding?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data.data;
    }
    
    throw new Error(response.message || 'Failed to fetch records by animal');
  }

  // Breeding calendar and planning
  async getBreedingCalendar(farmId: string, year: number, month?: number): Promise<{
    events: {
      date: string;
      type: 'breeding' | 'pregnancy_check' | 'expected_birth' | 'weaning';
      recordId: string;
      animalTag: string;
      description: string;
    }[];
  }> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('year', String(year));
    
    if (month) {
      queryParams.set('month', String(month));
    }

    const response = await apiService.get<{
      events: {
        date: string;
        type: 'breeding' | 'pregnancy_check' | 'expected_birth' | 'weaning';
        recordId: string;
        animalTag: string;
        description: string;
      }[];
    }>(`/breeding/calendar?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch breeding calendar');
  }

  async getBreedingRecommendations(farmId: string): Promise<{
    recommendations: {
      type: 'optimal_breeding_time' | 'genetic_diversity' | 'breeding_rest' | 'pregnancy_check';
      animalId: string;
      animalTag: string;
      message: string;
      priority: 'high' | 'medium' | 'low';
      suggestedDate?: string;
    }[];
  }> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);

    const response = await apiService.get<{
      recommendations: {
        type: 'optimal_breeding_time' | 'genetic_diversity' | 'breeding_rest' | 'pregnancy_check';
        animalId: string;
        animalTag: string;
        message: string;
        priority: 'high' | 'medium' | 'low';
        suggestedDate?: string;
      }[];
    }>(`/breeding/recommendations?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch breeding recommendations');
  }

  // Genetic tracking
  async getGeneticDiversityReport(farmId: string): Promise<{
    overallDiversity: number;
    inbreedingCoefficient: number;
    recommendations: {
      type: 'introduce_new_genetics' | 'avoid_pairing' | 'optimal_pairing';
      message: string;
      animalIds?: string[];
    }[];
  }> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);

    const response = await apiService.get<{
      overallDiversity: number;
      inbreedingCoefficient: number;
      recommendations: {
        type: 'introduce_new_genetics' | 'avoid_pairing' | 'optimal_pairing';
        message: string;
        animalIds?: string[];
      }[];
    }>(`/breeding/genetic-diversity?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch genetic diversity report');
  }

  async getPedigreeChart(animalId: string, generations?: number): Promise<{
    chart: {
      id: string;
      tag: string;
      breed: string;
      generation: number;
      parentIds: string[];
    }[];
  }> {
    const queryParams = new URLSearchParams();
    queryParams.set('animalId', animalId);
    
    if (generations) {
      queryParams.set('generations', String(generations));
    }

    const response = await apiService.get<{
      chart: {
        id: string;
        tag: string;
        breed: string;
        generation: number;
        parentIds: string[];
      }[];
    }>(`/breeding/pedigree?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch pedigree chart');
  }

  // Batch operations
  async bulkUpdateBreedingRecords(updates: { recordId: string; data: Partial<BreedingRecord> }[]): Promise<void> {
    const response = await apiService.post('/breeding/bulk-update', { updates });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to bulk update breeding records');
    }
  }

  async exportBreedingRecords(farmId: string, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('format', format);

    const response = await apiService.get(`/breeding/export?${queryParams}`, {
      responseType: 'blob'
    });

    if (response instanceof Blob) {
      return response;
    }
    
    throw new Error('Failed to export breeding records');
  }
}

export const breedingService = new BreedingService();