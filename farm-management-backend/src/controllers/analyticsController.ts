import { Request, Response } from 'express';

// NOTE: This controller aggregates high-level farm analytics across domains.
// For now, it uses lightweight computations and safe fallbacks so the UI can render immediately.

interface KPIItem {
  label: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
  delta?: number; // percentage
}

interface TrendPoint {
  date: string;
  value: number;
}

interface FarmAnalyticsOverview {
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
    riskAlerts: Array<{ type: string; severity: 'low'|'medium'|'high'; message: string }>;
  };
}

const mockOverview = (): FarmAnalyticsOverview => {
  // Simple synthesized dataset consistent with other modules' mock data
  const now = new Date();
  const monthKey = (offset: number) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const revenueSeries: TrendPoint[] = [3, 2, 1, 0].map((m) => ({
    date: monthKey(m),
    value: [118000, 122500, 128400, 132750][3 - m] || 0,
  }));
  const costSeries: TrendPoint[] = [3, 2, 1, 0].map((m) => ({
    date: monthKey(m),
    value: [82000, 84500, 83250, 81500][3 - m] || 0,
  }));
  const profitSeries: TrendPoint[] = revenueSeries.map((r, i) => ({
    date: r.date,
    value: Math.max(0, r.value - (costSeries[i]?.value || 0)),
  }));
  const productionSeries: TrendPoint[] = [3, 2, 1, 0].map((m) => ({
    date: monthKey(m),
    value: [960, 980, 1025, 1050][3 - m] || 0, // index combining milk, crops, eggs, etc.
  }));

  const totalRevenue = revenueSeries[revenueSeries.length - 1]?.value || 0;
  const totalCosts = costSeries[costSeries.length - 1]?.value || 0;
  const netProfit = Math.max(0, totalRevenue - totalCosts);
  const profitMargin = totalRevenue ? Math.round((netProfit / totalRevenue) * 100) : 0;

  return {
    summary: {
      totalRevenue,
      totalCosts,
      netProfit,
      profitMargin,
      animals: 45,
      crops: 26,
      equipment: 15,
      workers: 12,
    },
    kpis: [
      { label: 'Revenue (MTD)', value: totalRevenue, unit: 'USD', trend: 'up', delta: 3.4 },
      { label: 'Costs (MTD)', value: totalCosts, unit: 'USD', trend: 'down', delta: -2.1 },
      { label: 'Net Profit', value: netProfit, unit: 'USD', trend: 'up', delta: 4.7 },
      { label: 'Water Use', value: 12850, unit: 'm³', trend: 'down', delta: -1.2 },
      { label: 'Health Score', value: 93, unit: '%', trend: 'flat', delta: 0.0 },
      { label: 'Utilization', value: 58, unit: '%', trend: 'up', delta: 1.5 },
    ],
    trends: {
      revenue: revenueSeries,
      costs: costSeries,
      profit: profitSeries,
      production: productionSeries,
    },
    breakdowns: {
      costByCategory: [
        { name: 'Feed', value: 24500 },
        { name: 'Labor', value: 18250 },
        { name: 'Maintenance', value: 8200 },
        { name: 'Water', value: 3100 },
        { name: 'Energy', value: 5400 },
        { name: 'Other', value: 3050 },
      ],
      revenueBySource: [
        { name: 'Crops', value: 64500 },
        { name: 'Milk', value: 38250 },
        { name: 'Livestock', value: 18250 },
        { name: 'Other', value: 11800 },
      ],
      animalsByStatus: [
        { name: 'Active', value: 38 },
        { name: 'Breeding', value: 3 },
        { name: 'Lactating', value: 2 },
        { name: 'Sick', value: 1 },
        { name: 'Quarantined', value: 1 },
      ],
      cropsByStage: [
        { name: 'Planting', value: 4 },
        { name: 'Growing', value: 12 },
        { name: 'Harvest', value: 6 },
        { name: 'Post-harvest', value: 4 },
      ],
    },
    benchmarks: {
      farmScore: 89,
      industryAverage: 82,
      topPercentile: 95,
      strengths: ['Animal health', 'Irrigation efficiency', 'Revenue growth'],
      improvements: ['Feed efficiency', 'Labor cost ratio'],
    },
    predictions: {
      next30dRevenue: { value: 136400, ciLower: 130000, ciUpper: 142800 },
      next30dCosts: { value: 82800, ciLower: 79000, ciUpper: 86500 },
      riskAlerts: [
        { type: 'weather', severity: 'medium', message: 'Rain deficit likely in 2 weeks—monitor irrigation schedule.' },
        { type: 'health', severity: 'low', message: 'Seasonal parasite risk rising—ensure deworming protocol current.' },
      ],
    },
  };
};

export class AnalyticsController {
  static async getOverview(req: Request, res: Response): Promise<void> {
    try {
      // In a full implementation, query Mongo for real aggregates by farm
      const data = mockOverview();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve farm analytics overview',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
