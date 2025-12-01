import { apiService } from './api';

export interface GeocodeResult {
  displayName: string;
  lat: number;
  lon: number;
  address: {
    road?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export async function searchAddress(q: string): Promise<GeocodeResult[]> {
  if (!q || q.trim().length < 2) return [];
  try {
    const resp = await apiService.get<{ count: number; data: GeocodeResult[] }>(`/geocode/search`, {
      params: { q },
    });
    return (resp as any)?.data?.data ?? [];
  } catch (e) {
    return [];
  }
}
