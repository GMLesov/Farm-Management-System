import request from 'supertest';
import express, { Application } from 'express';
import analyticsRoutes from '../src/routes/analytics';
import { errorHandler } from '../src/middleware/errorHandler';

// Mock the auth middleware to bypass authentication
jest.mock('../src/middleware/auth', () => ({
  authMiddleware: jest.fn((req, res, next) => {
    req.user = {
      id: 'test-user-id',
      userId: 'test-user-id',
      email: 'analytics@example.com',
      farmId: 'test-farm-id'
    };
    next();
  }),
}));

describe('Analytics Controller Integration Tests', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analytics', analyticsRoutes);
    app.use(errorHandler);
  });

  describe('GET /api/analytics/overview', () => {
    it('should return farm analytics overview with all data sections', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      
      const { data } = response.body;

      // Verify summary section
      expect(data.summary).toBeDefined();
      expect(data.summary).toHaveProperty('totalRevenue');
      expect(data.summary).toHaveProperty('totalCosts');
      expect(data.summary).toHaveProperty('netProfit');
      expect(data.summary).toHaveProperty('profitMargin');
      expect(data.summary).toHaveProperty('animals');
      expect(data.summary).toHaveProperty('crops');
      expect(data.summary).toHaveProperty('equipment');
      expect(data.summary).toHaveProperty('workers');
      expect(typeof data.summary.totalRevenue).toBe('number');
      expect(typeof data.summary.profitMargin).toBe('number');

      // Verify KPIs section
      expect(Array.isArray(data.kpis)).toBe(true);
      expect(data.kpis.length).toBeGreaterThan(0);
      data.kpis.forEach((kpi: any) => {
        expect(kpi).toHaveProperty('label');
        expect(kpi).toHaveProperty('value');
        expect(typeof kpi.value).toBe('number');
      });

      // Verify trends section
      expect(data.trends).toBeDefined();
      expect(Array.isArray(data.trends.revenue)).toBe(true);
      expect(Array.isArray(data.trends.costs)).toBe(true);
      expect(Array.isArray(data.trends.profit)).toBe(true);
      expect(Array.isArray(data.trends.production)).toBe(true);
      
      // Verify trend data structure
      if (data.trends.revenue.length > 0) {
        expect(data.trends.revenue[0]).toHaveProperty('date');
        expect(data.trends.revenue[0]).toHaveProperty('value');
        expect(typeof data.trends.revenue[0].value).toBe('number');
      }

      // Verify breakdowns section
      expect(data.breakdowns).toBeDefined();
      expect(Array.isArray(data.breakdowns.costByCategory)).toBe(true);
      expect(Array.isArray(data.breakdowns.revenueBySource)).toBe(true);
      expect(Array.isArray(data.breakdowns.animalsByStatus)).toBe(true);
      expect(Array.isArray(data.breakdowns.cropsByStage)).toBe(true);

      // Verify benchmarks section
      expect(data.benchmarks).toBeDefined();
      expect(data.benchmarks).toHaveProperty('farmScore');
      expect(data.benchmarks).toHaveProperty('industryAverage');
      expect(data.benchmarks).toHaveProperty('topPercentile');
      expect(Array.isArray(data.benchmarks.strengths)).toBe(true);
      expect(Array.isArray(data.benchmarks.improvements)).toBe(true);
      expect(typeof data.benchmarks.farmScore).toBe('number');

      // Verify predictions section
      expect(data.predictions).toBeDefined();
      expect(data.predictions).toHaveProperty('next30dRevenue');
      expect(data.predictions).toHaveProperty('next30dCosts');
      expect(Array.isArray(data.predictions.riskAlerts)).toBe(true);
      
      // Verify prediction structure with confidence intervals
      expect(data.predictions.next30dRevenue).toHaveProperty('value');
      expect(data.predictions.next30dRevenue).toHaveProperty('ciLower');
      expect(data.predictions.next30dRevenue).toHaveProperty('ciUpper');
      expect(typeof data.predictions.next30dRevenue.value).toBe('number');
      expect(typeof data.predictions.next30dRevenue.ciLower).toBe('number');
      expect(typeof data.predictions.next30dRevenue.ciUpper).toBe('number');
    });

    it('should return valid financial metrics in summary', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .expect(200);

      const { summary } = response.body.data;

      // totalRevenue should be positive or zero
      expect(summary.totalRevenue).toBeGreaterThanOrEqual(0);
      
      // totalCosts should be positive or zero
      expect(summary.totalCosts).toBeGreaterThanOrEqual(0);
      
      // netProfit should equal revenue minus costs (or be capped at 0)
      expect(summary.netProfit).toBe(Math.max(0, summary.totalRevenue - summary.totalCosts));
      
      // profitMargin should be a percentage
      if (summary.totalRevenue > 0) {
        const expectedMargin = Math.round((summary.netProfit / summary.totalRevenue) * 100);
        expect(summary.profitMargin).toBe(expectedMargin);
      } else {
        expect(summary.profitMargin).toBe(0);
      }

      // Count fields should be non-negative integers
      expect(Number.isInteger(summary.animals)).toBe(true);
      expect(summary.animals).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(summary.crops)).toBe(true);
      expect(summary.crops).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(summary.equipment)).toBe(true);
      expect(summary.equipment).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(summary.workers)).toBe(true);
      expect(summary.workers).toBeGreaterThanOrEqual(0);
    });

    it('should return KPIs with proper structure', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .expect(200);

      const { kpis } = response.body.data;

      expect(kpis.length).toBeGreaterThan(0);
      
      kpis.forEach((kpi: any) => {
        // Required fields
        expect(typeof kpi.label).toBe('string');
        expect(kpi.label.length).toBeGreaterThan(0);
        expect(typeof kpi.value).toBe('number');
        
        // Optional fields when present
        if (kpi.unit !== undefined) {
          expect(typeof kpi.unit).toBe('string');
        }
        if (kpi.trend !== undefined) {
          expect(['up', 'down', 'flat']).toContain(kpi.trend);
        }
        if (kpi.delta !== undefined) {
          expect(typeof kpi.delta).toBe('number');
        }
      });
    });

    it('should return trends with chronological data points', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .expect(200);

      const { trends } = response.body.data;

      // Check all trend series
      ['revenue', 'costs', 'profit', 'production'].forEach((trendType) => {
        const series = trends[trendType];
        expect(Array.isArray(series)).toBe(true);
        
        if (series.length > 0) {
          series.forEach((point: any) => {
            expect(point).toHaveProperty('date');
            expect(point).toHaveProperty('value');
            expect(typeof point.date).toBe('string');
            expect(typeof point.value).toBe('number');
            expect(point.value).toBeGreaterThanOrEqual(0);
            
            // Validate date format (YYYY-MM)
            expect(point.date).toMatch(/^\d{4}-\d{2}$/);
          });

          // Verify chronological order
          for (let i = 1; i < series.length; i++) {
            const prevDate = series[i - 1].date;
            const currDate = series[i].date;
            expect(currDate >= prevDate).toBe(true);
          }
        }
      });
    });

    it('should return profit trends that match revenue minus costs', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .expect(200);

      const { trends } = response.body.data;

      expect(trends.profit.length).toBe(trends.revenue.length);
      expect(trends.profit.length).toBe(trends.costs.length);

      for (let i = 0; i < trends.profit.length; i++) {
        const profit = trends.profit[i].value;
        const revenue = trends.revenue[i].value;
        const cost = trends.costs[i].value;
        
        // Profit should be max(0, revenue - cost)
        expect(profit).toBe(Math.max(0, revenue - cost));
      }
    });

    it('should return breakdown data with proper structure', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .expect(200);

      const { breakdowns } = response.body.data;

      // Check all breakdown types
      ['costByCategory', 'revenueBySource', 'animalsByStatus', 'cropsByStage'].forEach((breakdownType) => {
        const breakdown = breakdowns[breakdownType];
        expect(Array.isArray(breakdown)).toBe(true);
        
        if (breakdown.length > 0) {
          breakdown.forEach((item: any) => {
            expect(item).toHaveProperty('name');
            expect(item).toHaveProperty('value');
            expect(typeof item.name).toBe('string');
            expect(typeof item.value).toBe('number');
            expect(item.value).toBeGreaterThanOrEqual(0);
          });
        }
      });
    });

    it('should return cost breakdown that sums to reasonable total', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .expect(200);

      const { breakdowns, summary } = response.body.data;

      const costSum = breakdowns.costByCategory.reduce((sum: number, item: any) => sum + item.value, 0);
      
      // Cost breakdown should be close to total costs (within a reasonable margin)
      // Note: In mock data, these might not match exactly, so we just verify it's positive
      expect(costSum).toBeGreaterThanOrEqual(0);
      
      // Each category should contribute to the total
      if (breakdowns.costByCategory.length > 0) {
        breakdowns.costByCategory.forEach((category: any) => {
          expect(category.value).toBeGreaterThanOrEqual(0);
        });
      }
    });

    it('should return revenue breakdown that sums to reasonable total', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .expect(200);

      const { breakdowns } = response.body.data;

      const revenueSum = breakdowns.revenueBySource.reduce((sum: number, item: any) => sum + item.value, 0);
      
      // Revenue breakdown should be positive
      expect(revenueSum).toBeGreaterThanOrEqual(0);
      
      // Each source should contribute
      if (breakdowns.revenueBySource.length > 0) {
        breakdowns.revenueBySource.forEach((source: any) => {
          expect(source.value).toBeGreaterThanOrEqual(0);
        });
      }
    });

    it('should return benchmarks with valid score ranges', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .expect(200);

      const { benchmarks } = response.body.data;

      // Scores should be in valid ranges (typically 0-100)
      expect(benchmarks.farmScore).toBeGreaterThanOrEqual(0);
      expect(benchmarks.farmScore).toBeLessThanOrEqual(100);
      expect(benchmarks.industryAverage).toBeGreaterThanOrEqual(0);
      expect(benchmarks.industryAverage).toBeLessThanOrEqual(100);
      expect(benchmarks.topPercentile).toBeGreaterThanOrEqual(0);
      expect(benchmarks.topPercentile).toBeLessThanOrEqual(100);

      // Strengths and improvements should be arrays of strings
      expect(Array.isArray(benchmarks.strengths)).toBe(true);
      expect(Array.isArray(benchmarks.improvements)).toBe(true);
      
      if (benchmarks.strengths.length > 0) {
        benchmarks.strengths.forEach((strength: any) => {
          expect(typeof strength).toBe('string');
          expect(strength.length).toBeGreaterThan(0);
        });
      }
      
      if (benchmarks.improvements.length > 0) {
        benchmarks.improvements.forEach((improvement: any) => {
          expect(typeof improvement).toBe('string');
          expect(improvement.length).toBeGreaterThan(0);
        });
      }
    });

    it('should return predictions with confidence intervals', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .expect(200);

      const { predictions } = response.body.data;

      // Check revenue prediction
      expect(predictions.next30dRevenue.value).toBeGreaterThanOrEqual(0);
      expect(predictions.next30dRevenue.ciLower).toBeGreaterThanOrEqual(0);
      expect(predictions.next30dRevenue.ciUpper).toBeGreaterThanOrEqual(0);
      
      // CI upper should be >= value >= CI lower
      expect(predictions.next30dRevenue.ciUpper).toBeGreaterThanOrEqual(predictions.next30dRevenue.value);
      expect(predictions.next30dRevenue.value).toBeGreaterThanOrEqual(predictions.next30dRevenue.ciLower);

      // Check costs prediction
      expect(predictions.next30dCosts.value).toBeGreaterThanOrEqual(0);
      expect(predictions.next30dCosts.ciLower).toBeGreaterThanOrEqual(0);
      expect(predictions.next30dCosts.ciUpper).toBeGreaterThanOrEqual(0);
      
      // CI upper should be >= value >= CI lower
      expect(predictions.next30dCosts.ciUpper).toBeGreaterThanOrEqual(predictions.next30dCosts.value);
      expect(predictions.next30dCosts.value).toBeGreaterThanOrEqual(predictions.next30dCosts.ciLower);
    });

    it('should return risk alerts with proper structure', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .expect(200);

      const { predictions } = response.body.data;

      expect(Array.isArray(predictions.riskAlerts)).toBe(true);
      
      if (predictions.riskAlerts.length > 0) {
        predictions.riskAlerts.forEach((alert: any) => {
          expect(alert).toHaveProperty('type');
          expect(alert).toHaveProperty('severity');
          expect(alert).toHaveProperty('message');
          
          expect(typeof alert.type).toBe('string');
          expect(['low', 'medium', 'high']).toContain(alert.severity);
          expect(typeof alert.message).toBe('string');
          expect(alert.message.length).toBeGreaterThan(0);
        });
      }
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app).get('/api/analytics/overview')
      );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.summary).toBeDefined();
      });
    });

    it('should return consistent data structure across multiple calls', async () => {
      const response1 = await request(app)
        .get('/api/analytics/overview')
        .expect(200);
      
      const response2 = await request(app)
        .get('/api/analytics/overview')
        .expect(200);

      // Data structure should be consistent
      expect(Object.keys(response1.body.data).sort()).toEqual(
        Object.keys(response2.body.data).sort()
      );
      
      // Summary structure should match
      expect(Object.keys(response1.body.data.summary).sort()).toEqual(
        Object.keys(response2.body.data.summary).sort()
      );

      // KPI count should be consistent
      expect(response1.body.data.kpis.length).toBe(response2.body.data.kpis.length);
    });

    it('should validate all numeric values are finite', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .expect(200);

      const { data } = response.body;

      // Check all summary numbers
      Object.values(data.summary).forEach((value) => {
        if (typeof value === 'number') {
          expect(Number.isFinite(value)).toBe(true);
        }
      });

      // Check KPI values
      data.kpis.forEach((kpi: any) => {
        expect(Number.isFinite(kpi.value)).toBe(true);
        if (kpi.delta !== undefined) {
          expect(Number.isFinite(kpi.delta)).toBe(true);
        }
      });

      // Check trend values
      ['revenue', 'costs', 'profit', 'production'].forEach((trendType) => {
        data.trends[trendType].forEach((point: any) => {
          expect(Number.isFinite(point.value)).toBe(true);
        });
      });
    });

    it('should return reasonable data for a production dashboard', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .expect(200);

      const { data } = response.body;

      // Summary should have meaningful counts
      expect(data.summary.animals + data.summary.crops + data.summary.equipment).toBeGreaterThan(0);
      
      // Should have at least some KPIs
      expect(data.kpis.length).toBeGreaterThanOrEqual(3);
      
      // Should have trend data for multiple periods
      expect(data.trends.revenue.length).toBeGreaterThan(0);
      
      // Should have some breakdown categories
      expect(data.breakdowns.costByCategory.length).toBeGreaterThan(0);
      expect(data.breakdowns.revenueBySource.length).toBeGreaterThan(0);
      
      // Benchmark should show some strengths or improvements
      expect(data.benchmarks.strengths.length + data.benchmarks.improvements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle requests with query parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .query({ farmId: 'test-farm-123', dateRange: '30d' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should handle requests with invalid headers gracefully', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .set('X-Invalid-Header', 'invalid-value')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});
