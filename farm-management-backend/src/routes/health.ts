import { Router } from 'express';
import { healthCheck, readinessCheck, livenessCheck } from '@/controllers/healthController';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Comprehensive health check with service status
 * @access  Public
 */
router.get('/', healthCheck);

/**
 * @route   GET /api/ready
 * @desc    Kubernetes readiness probe
 * @access  Public
 */
router.get('/ready', readinessCheck);

/**
 * @route   GET /api/alive
 * @desc    Kubernetes liveness probe
 * @access  Public
 */
router.get('/alive', livenessCheck);

export default router;
