import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Application } from 'express';
import { logger } from '@/utils/logger';

export const initializeSentry = (app: Application): void => {
  // Only initialize if DSN is provided
  if (!process.env.SENTRY_DSN) {
    logger.info('Sentry DSN not provided - error tracking disabled');
    return;
  }

  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      
      // Performance monitoring
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
      
      // Profiling
      profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
      
      integrations: [
        // Enable HTTP calls tracing
        Sentry.httpIntegration(),
        
        // Enable Express.js middleware tracing
        Sentry.expressIntegration(),
        
        // Enable profiling
        nodeProfilingIntegration(),
      ],
      
      // Filter sensitive data
      beforeSend(event) {
        // Remove password fields
        if (event.request?.data) {
          const data = event.request.data;
          if (typeof data === 'object' && data !== null) {
            if ('password' in data) delete data.password;
            if ('currentPassword' in data) delete data.currentPassword;
            if ('newPassword' in data) delete data.newPassword;
          }
        }
        
        return event;
      },
      
      // Ignore common errors
      ignoreErrors: [
        'Network request failed',
        'NetworkError',
        'Failed to fetch',
        'Load failed',
        'timeout',
      ],
    });

    logger.info('Sentry error tracking initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Sentry:', error);
  }
};

export { Sentry };
