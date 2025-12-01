import { apiService } from './api';

export interface BasicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

class UsersService {
  async searchByEmail(email: string): Promise<BasicUser[]> {
    const resp = await apiService.get<{ success: boolean; data: any[]; count: number; message?: string }>(`/users/search?email=${encodeURIComponent(email)}`);
    if ((resp as any)?.success && Array.isArray((resp as any).data)) {
      return (resp as any).data.map((u: any) => ({
        id: u.id || u._id,
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        email: u.email || '',
        role: u.role,
      }));
    }
    return [];
  }
}

export const usersService = new UsersService();
