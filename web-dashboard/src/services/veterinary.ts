import { apiService } from './api';
import { 
  VeterinaryRecord,
  VeterinaryAnalytics,
  PaginatedResponse,
  QueryParams 
} from '../types/api';

export class VeterinaryService {
  // Get all veterinary records for a farm
  async getVeterinaryRecords(farmId: string, params?: QueryParams): Promise<PaginatedResponse<VeterinaryRecord>> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, String(value));
        }
      });
    }

    const response = await apiService.get<PaginatedResponse<VeterinaryRecord>>(`/veterinary?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch veterinary records');
  }

  // Get upcoming appointments
  async getUpcomingAppointments(farmId: string, days?: number): Promise<VeterinaryRecord[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    
    if (days) {
      queryParams.set('days', String(days));
    }

    const response = await apiService.get<VeterinaryRecord[]>(`/veterinary/upcoming?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch upcoming appointments');
  }

  // Get overdue follow-ups
  async getOverdueFollowUps(farmId: string): Promise<VeterinaryRecord[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);

    const response = await apiService.get<VeterinaryRecord[]>(`/veterinary/overdue-followups?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch overdue follow-ups');
  }

  // Get single veterinary record by ID
  async getVeterinaryRecord(recordId: string): Promise<VeterinaryRecord> {
    const response = await apiService.get<VeterinaryRecord>(`/veterinary/${recordId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch veterinary record');
  }

  // Create new veterinary record
  async createVeterinaryRecord(recordData: Omit<VeterinaryRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<VeterinaryRecord> {
    const response = await apiService.post<VeterinaryRecord>('/veterinary', recordData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create veterinary record');
  }

  // Update veterinary record
  async updateVeterinaryRecord(recordId: string, recordData: Partial<VeterinaryRecord>): Promise<VeterinaryRecord> {
    const response = await apiService.put<VeterinaryRecord>(`/veterinary/${recordId}`, recordData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update veterinary record');
  }

  // Complete appointment
  async completeAppointment(recordId: string, completionData: {
    actualDate?: string;
    examination?: Partial<VeterinaryRecord['examination']>;
    treatment?: Partial<VeterinaryRecord['treatment']>;
    costs?: Partial<VeterinaryRecord['costs']>;
    notes?: string;
  }): Promise<VeterinaryRecord> {
    const response = await apiService.patch<VeterinaryRecord>(`/veterinary/${recordId}/complete`, completionData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to complete appointment');
  }

  // Add document to veterinary record
  async addDocument(recordId: string, document: {
    type: 'prescription' | 'lab_report' | 'xray' | 'certificate' | 'other';
    name: string;
    url: string;
  }): Promise<VeterinaryRecord> {
    const response = await apiService.post<VeterinaryRecord>(`/veterinary/${recordId}/documents`, document);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to add document');
  }

  // Update payment status
  async updatePaymentStatus(recordId: string, paymentData: {
    paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'overdue';
    paymentDate?: string;
  }): Promise<VeterinaryRecord> {
    const response = await apiService.patch<VeterinaryRecord>(`/veterinary/${recordId}/payment`, paymentData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update payment status');
  }

  // Delete veterinary record
  async deleteVeterinaryRecord(recordId: string): Promise<void> {
    const response = await apiService.delete(`/veterinary/${recordId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete veterinary record');
    }
  }

  // Analytics
  async getVeterinaryAnalytics(farmId: string, year?: number): Promise<VeterinaryAnalytics> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    
    if (year) {
      queryParams.set('year', String(year));
    }

    const response = await apiService.get<VeterinaryAnalytics>(`/veterinary/analytics/summary?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch veterinary analytics');
  }

  // Search and filtering
  async searchVeterinaryRecords(farmId: string, searchTerm: string): Promise<VeterinaryRecord[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('search', searchTerm);

    const response = await apiService.get<PaginatedResponse<VeterinaryRecord>>(`/veterinary?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data.data;
    }
    
    throw new Error(response.message || 'Failed to search veterinary records');
  }

  async getRecordsByStatus(farmId: string, status: string): Promise<VeterinaryRecord[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('status', status);

    const response = await apiService.get<PaginatedResponse<VeterinaryRecord>>(`/veterinary?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data.data;
    }
    
    throw new Error(response.message || 'Failed to fetch records by status');
  }

  async getRecordsByType(farmId: string, type: string): Promise<VeterinaryRecord[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('type', type);

    const response = await apiService.get<PaginatedResponse<VeterinaryRecord>>(`/veterinary?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data.data;
    }
    
    throw new Error(response.message || 'Failed to fetch records by type');
  }

  async getRecordsByAnimal(farmId: string, animalId: string): Promise<VeterinaryRecord[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('animalId', animalId);

    const response = await apiService.get<PaginatedResponse<VeterinaryRecord>>(`/veterinary?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data.data;
    }
    
    throw new Error(response.message || 'Failed to fetch records by animal');
  }

  // Batch operations
  async bulkUpdateAppointments(updates: { recordId: string; data: Partial<VeterinaryRecord> }[]): Promise<void> {
    const response = await apiService.post('/veterinary/bulk-update', { updates });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to bulk update appointments');
    }
  }

  async exportVeterinaryRecords(farmId: string, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('format', format);

    const response = await apiService.get(`/veterinary/export?${queryParams}`, {
      responseType: 'blob'
    });

    if (response instanceof Blob) {
      return response;
    }
    
    throw new Error('Failed to export veterinary records');
  }
}

export const veterinaryService = new VeterinaryService();