import { apiService, ApiResponse } from './api';

export type TrendPoint = {
  date: string;
  value: number;
};

export type KPIItem = {
  label: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
  delta?: number; // percentage
};

export interface FarmAnalyticsOverview {
  summary: {
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    profitMargin: number; // percentage
    animals: number;
    crops: number;
    equipment: number;
    workers: number;
  };
  kpis: KPIItem[];
  trends: {
    revenue: TrendPoint[];
    costs: TrendPoint[];
    profit: TrendPoint[];
    production: TrendPoint[]; // combined production index
  };
  breakdowns: {
    costByCategory: Array<{ name: string; value: number }>;
    revenueBySource: Array<{ name: string; value: number }>;
    animalsByStatus: Array<{ name: string; value: number }>;
    cropsByStage: Array<{ name: string; value: number }>;
  };
  benchmarks: {
    farmScore: number; // overall performance 0-100
    industryAverage: number;
    topPercentile: number;
    strengths: string[];
    improvements: string[];
  };
  predictions: {
    next30dRevenue: { value: number; ciLower: number; ciUpper: number };
    next30dCosts: { value: number; ciLower: number; ciUpper: number };
    riskAlerts: Array<{ type: string; severity: 'low' | 'medium' | 'high'; message: string }>;
  };
}

export const AnalyticsService = {
  async getOverview(): Promise<FarmAnalyticsOverview> {
    const res = await apiService.get<FarmAnalyticsOverview>('/analytics/overview');
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to fetch analytics overview');
    }
    return res.data;
  },
};
