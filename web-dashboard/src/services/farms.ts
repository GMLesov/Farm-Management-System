import { apiService } from './api';
import { Farm } from '../types/api';

export class FarmService {
  async getMyFarms(): Promise<Farm[]> {
    const resp = await apiService.get<{ data: Farm[]; success: boolean; message?: string }>(`/farms`);
    if ((resp as any)?.success && (resp as any)?.data) {
      return (resp as any).data as unknown as Farm[];
    }
    // Some backends return array directly
    if (Array.isArray((resp as any))) return resp as any;
    throw new Error((resp as any)?.message || 'Failed to fetch farms');
  }

  async createFarm(payload: Partial<Farm> & { name: string }): Promise<Farm> {
    const resp = await apiService.post<Farm>(`/farms`, payload);
    if ((resp as any)?.success && (resp as any)?.data) {
      return (resp as any).data as unknown as Farm;
    }
    if ((resp as any)?.id || (resp as any)?.name) return resp as any;
    throw new Error((resp as any)?.message || 'Failed to create farm');
  }

  async getFarmById(farmId: string): Promise<Farm> {
    const resp = await apiService.get<Farm>(`/farms/${farmId}`);
    if ((resp as any)?.success && (resp as any)?.data) {
      return (resp as any).data as unknown as Farm;
    }
    return resp as any;
  }

  async updateFarmManagers(farmId: string, managerIds: string[]): Promise<Farm> {
    const resp = await apiService.put<Farm>(`/farms/${farmId}`, { managers: managerIds });
    if ((resp as any)?.success && (resp as any)?.data) {
      return (resp as any).data as unknown as Farm;
    }
    throw new Error((resp as any)?.message || 'Failed to update managers');
  }

  async inviteManagerByEmail(
    farmId: string,
    email: string,
    firstName?: string,
    lastName?: string
  ): Promise<Farm> {
    const payload: any = { email };
    if (firstName) payload.firstName = firstName;
    if (lastName) payload.lastName = lastName;
    const resp = await apiService.post<Farm>(`/farms/${farmId}/managers/invite`, payload);
    if ((resp as any)?.success && (resp as any)?.data) {
      return (resp as any).data as unknown as Farm;
    }
    throw new Error((resp as any)?.message || 'Failed to invite manager');
  }
}

export const farmService = new FarmService();
