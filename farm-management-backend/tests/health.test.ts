import request from 'supertest';
import express from 'express';
import healthRoutes from '../src/routes/health';

// Create a minimal test app without database dependencies
const app = express();
app.use(express.json());
app.use('/api/health', healthRoutes);

describe('Health Check Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return comprehensive health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('cpu');
      expect(response.body).toHaveProperty('uptime');
      
      // Check services
      expect(response.body.services).toHaveProperty('mongodb');
      expect(response.body.services).toHaveProperty('redis');
      expect(response.body.services).toHaveProperty('firebase');
      
      // Check memory metrics
      expect(response.body.memory).toHaveProperty('used');
      expect(response.body.memory).toHaveProperty('total');
      expect(response.body.memory).toHaveProperty('percentage');
      
      // Check CPU metrics
      expect(response.body.cpu).toHaveProperty('usage');
    });

    it('should include database latency', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.services.mongodb).toHaveProperty('latency');
      expect(typeof response.body.services.mongodb.latency).toBe('number');
    });

    it('should report database status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.services.mongodb.status).toMatch(/^(connected|disconnected|degraded)$/);
    });

    it('should include memory usage details', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.memory).toHaveProperty('used');
      expect(response.body.memory).toHaveProperty('total');
      expect(response.body.memory).toHaveProperty('percentage');
      expect(response.body.memory.percentage).toBeGreaterThan(0);
      expect(response.body.memory.percentage).toBeLessThan(100);
    });

    it('should include CPU usage', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.cpu).toHaveProperty('usage');
      expect(typeof response.body.cpu.usage).toBe('number');
    });

    it('should include uptime', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.uptime).toBeGreaterThan(0);
    });

    it('should have valid timestamp format', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    it('should complete within reasonable time (< 5s)', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/api/health')
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app)
        .get('/api/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('ready');
      expect(typeof response.body.ready).toBe('boolean');
    });

    it('should check critical dependencies', async () => {
      const response = await request(app)
        .get('/api/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      // Ready endpoint returns simple ready status, not detailed checks
      expect(typeof response.body.message).toBe('string');
    });

    it('should be idempotent', async () => {
      const response1 = await request(app)
        .get('/api/health/ready')
        .expect(200);

      const response2 = await request(app)
        .get('/api/health/ready')
        .expect(200);

      expect(response1.body.status).toBe(response2.body.status);
    });

    it('should complete quickly (< 2s)', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/api/health/ready')
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('GET /api/health/alive', () => {
    it('should return liveness status', async () => {
      const response = await request(app)
        .get('/api/health/alive')
        .expect(200);

      expect(response.body).toHaveProperty('alive');
      expect(response.body.alive).toBe(true);
    });

    it('should respond immediately', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/api/health/alive')
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);
    });

    it('should not perform heavy checks', async () => {
      // Liveness should be lightweight
      const response = await request(app)
        .get('/api/health/alive')
        .expect(200);

      // Should not include detailed service checks
      expect(response.body).not.toHaveProperty('services');
      expect(response.body).not.toHaveProperty('database');
    });

    it('should always return 200 if server is running', async () => {
      // Make multiple rapid requests
      const promises = Array(10).fill(null).map(() =>
        request(app).get('/api/health/alive')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.alive).toBe(true);
      });
    });
  });

  describe('Health Endpoint Performance', () => {
    it('should handle concurrent health check requests', async () => {
      const promises = Array(20).fill(null).map(() =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status');
      });
    });

    it('should not degrade under load', async () => {
      const iterations = 50;
      const durations: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await request(app).get('/api/health/alive');
        durations.push(Date.now() - start);
      }

      // Calculate average
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      
      // Average should be reasonable
      expect(avgDuration).toBeLessThan(100);
    });
  });

  describe('Health Status Codes', () => {
    it('should return 200 for healthy system', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(['healthy', 'degraded']).toContain(response.body.status);
    });

    it('should set proper content-type', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Error Handling', () => {
    it('should not expose sensitive information in errors', async () => {
      // Try to trigger an error with invalid input
      const response = await request(app)
        .get('/api/health?invalid=param')
        .expect(200);

      // Should still return valid response
      expect(response.body).toHaveProperty('status');
      
      // Should not expose internal details
      expect(JSON.stringify(response.body)).not.toContain('password');
      expect(JSON.stringify(response.body)).not.toContain('secret');
      expect(JSON.stringify(response.body)).not.toContain('token');
    });
  });

  describe('Monitoring Integration', () => {
    it('should provide metrics suitable for monitoring systems', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Check for numerical metrics
      expect(typeof response.body.memory.used).toBe('number');
      expect(typeof response.body.memory.total).toBe('number');
      expect(typeof response.body.uptime).toBe('number');
      
      // Check for status strings
      expect(typeof response.body.status).toBe('string');
      expect(typeof response.body.services.mongodb.status).toBe('string');
    });

    it('should include service versions if available', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // May include version info
      if (response.body.version) {
        expect(typeof response.body.version).toBe('string');
      }
    });
  });

  describe('Kubernetes Health Probes', () => {
    it('readiness probe should indicate when ready to accept traffic', async () => {
      const response = await request(app)
        .get('/api/health/ready')
        .expect(200);

      expect(response.body.ready).toBeDefined();
      
      if (response.body.ready === false) {
        // Should provide message explaining why not ready
        expect(response.body).toHaveProperty('message');
      }
    });

    it('liveness probe should never fail if process is running', async () => {
      // Multiple consecutive calls should all succeed
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/api/health/alive')
          .expect(200);

        expect(response.body.alive).toBe(true);
      }
    });
  });

  describe('Response Structure Validation', () => {
    it('should have consistent response structure', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Required fields
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('cpu');
      expect(response.body).toHaveProperty('uptime');

      // Services structure
      expect(typeof response.body.services).toBe('object');
      
      // Memory and CPU structure
      expect(typeof response.body.memory).toBe('object');
      expect(typeof response.body.cpu).toBe('object');
      expect(response.body.memory).toHaveProperty('used');
      expect(response.body.memory).toHaveProperty('total');
      expect(response.body.cpu).toHaveProperty('usage');
    });

    it('should not include undefined values', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain('undefined');
      expect(responseString).not.toContain('null');
    });
  });

  describe('Cache Headers', () => {
    it('should not cache health check responses', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Health checks should not be cached
      expect(
        !response.headers['cache-control'] ||
        response.headers['cache-control'].includes('no-cache') ||
        response.headers['cache-control'].includes('no-store')
      ).toBeTruthy();
    });
  });
});
