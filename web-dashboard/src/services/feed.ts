import { apiService } from './api';
import { 
  Feed,
  FeedAnalytics,
  FeedUsageRecord,
  PaginatedResponse,
  QueryParams 
} from '../types/api';

export class FeedService {
  // Get all feed records for a farm
  async getFeedRecords(farmId: string, params?: QueryParams): Promise<PaginatedResponse<Feed>> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, String(value));
        }
      });
    }

    const response = await apiService.get<PaginatedResponse<Feed>>(`/feed?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch feed records');
  }

  // Get low stock feed items
  async getLowStockItems(farmId: string): Promise<Feed[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);

    const response = await apiService.get<Feed[]>(`/feed/low-stock?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch low stock items');
  }

  // Get expiring feed items
  async getExpiringItems(farmId: string, days?: number): Promise<Feed[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    
    if (days) {
      queryParams.set('days', String(days));
    }

    const response = await apiService.get<Feed[]>(`/feed/expiring?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch expiring items');
  }

  // Get single feed record by ID
  async getFeedRecord(feedId: string): Promise<Feed> {
    const response = await apiService.get<Feed>(`/feed/${feedId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch feed record');
  }

  // Create new feed record
  async createFeedRecord(feedData: Omit<Feed, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Feed> {
    const response = await apiService.post<Feed>('/feed', feedData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create feed record');
  }

  // Update feed record
  async updateFeedRecord(feedId: string, feedData: Partial<Feed>): Promise<Feed> {
    const response = await apiService.put<Feed>(`/feed/${feedId}`, feedData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update feed record');
  }

  // Record feed usage
  async recordFeedUsage(feedId: string, usageData: {
    animalId: string;
    quantityUsed: number;
    usageDate: string;
    notes?: string;
  }): Promise<Feed> {
    const response = await apiService.post<Feed>(`/feed/${feedId}/usage`, usageData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to record feed usage');
  }

  // Restock feed
  async restockFeed(feedId: string, restockData: {
    quantity: number;
    cost: number;
    supplier?: string;
    expiryDate?: string;
    notes?: string;
  }): Promise<Feed> {
    const response = await apiService.post<Feed>(`/feed/${feedId}/restock`, restockData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to restock feed');
  }

  // Delete feed record
  async deleteFeedRecord(feedId: string): Promise<void> {
    const response = await apiService.delete(`/feed/${feedId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete feed record');
    }
  }

  // Get feed usage records
  async getFeedUsageRecords(farmId: string, animalId?: string, startDate?: string, endDate?: string): Promise<FeedUsageRecord[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    
    if (animalId) {
      queryParams.set('animalId', animalId);
    }
    if (startDate) {
      queryParams.set('startDate', startDate);
    }
    if (endDate) {
      queryParams.set('endDate', endDate);
    }

  const response = await apiService.get<FeedUsageRecord[]>(`/feed/usage?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch feed usage records');
  }

  // Analytics
  async getFeedAnalytics(farmId: string, year?: number): Promise<FeedAnalytics> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    
    if (year) {
      queryParams.set('year', String(year));
    }

    const response = await apiService.get<FeedAnalytics>(`/feed/analytics/summary?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch feed analytics');
  }

  // Search and filtering
  async searchFeedRecords(farmId: string, searchTerm: string): Promise<Feed[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('search', searchTerm);

    const response = await apiService.get<PaginatedResponse<Feed>>(`/feed?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data.data;
    }
    
    throw new Error(response.message || 'Failed to search feed records');
  }

  async getFeedsByType(farmId: string, type: string): Promise<Feed[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('type', type);

    const response = await apiService.get<PaginatedResponse<Feed>>(`/feed?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data.data;
    }
    
    throw new Error(response.message || 'Failed to fetch feeds by type');
  }

  async getFeedsByCategory(farmId: string, category: string): Promise<Feed[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('category', category);

    const response = await apiService.get<PaginatedResponse<Feed>>(`/feed?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data.data;
    }
    
    throw new Error(response.message || 'Failed to fetch feeds by category');
  }

  async getFeedsBySupplier(farmId: string, supplier: string): Promise<Feed[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('supplier', supplier);

    const response = await apiService.get<PaginatedResponse<Feed>>(`/feed?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data.data;
    }
    
    throw new Error(response.message || 'Failed to fetch feeds by supplier');
  }

  // Get feed consumption by animal
  async getAnimalFeedConsumption(farmId: string, animalId: string, startDate?: string, endDate?: string): Promise<{
    totalConsumption: number;
    dailyAverage: number;
    feedTypes: { feedId: string; feedName: string; consumption: number }[];
    usageHistory: FeedUsageRecord[];
  }> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('animalId', animalId);
    
    if (startDate) {
      queryParams.set('startDate', startDate);
    }
    if (endDate) {
      queryParams.set('endDate', endDate);
    }

  const response = await apiService.get<{ totalConsumption: number; dailyAverage: number; feedTypes: { feedId: string; feedName: string; consumption: number }[]; usageHistory: FeedUsageRecord[] }>(`/feed/consumption/animal?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch animal feed consumption');
  }

  // Get feed recommendations
  async getFeedRecommendations(farmId: string, animalId?: string): Promise<{
    recommendations: {
      feedId: string;
      feedName: string;
      reason: string;
      priority: 'high' | 'medium' | 'low';
    }[];
  }> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    
    if (animalId) {
      queryParams.set('animalId', animalId);
    }

  const response = await apiService.get<{ recommendations: { feedId: string; feedName: string; reason: string; priority: 'high' | 'medium' | 'low' }[] }>(`/feed/recommendations?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch feed recommendations');
  }

  // Batch operations
  async bulkUpdateFeeds(updates: { feedId: string; data: Partial<Feed> }[]): Promise<void> {
    const response = await apiService.post('/feed/bulk-update', { updates });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to bulk update feeds');
    }
  }

  async generateFeedOrder(farmId: string, daysSupply: number = 30): Promise<{
    items: {
      feedId: string;
      feedName: string;
      currentStock: number;
      recommendedOrder: number;
      estimatedCost: number;
    }[];
    totalCost: number;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('daysSupply', String(daysSupply));

  const response = await apiService.get<{ items: { feedId: string; feedName: string; currentStock: number; recommendedOrder: number; estimatedCost: number }[]; totalCost: number }>(`/feed/generate-order?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to generate feed order');
  }

  async exportFeedRecords(farmId: string, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.set('farmId', farmId);
    queryParams.set('format', format);

    const response = await apiService.get(`/feed/export?${queryParams}`, {
      responseType: 'blob'
    });

    if (response instanceof Blob) {
      return response;
    }
    
    throw new Error('Failed to export feed records');
  }
}

export const feedService = new FeedService();