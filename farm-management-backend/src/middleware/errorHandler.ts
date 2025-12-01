import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import * as Sentry from '@sentry/node';

interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Set default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let stack = err.stack;

  // Capture error in Sentry for server errors (5xx)
  if (statusCode >= 500) {
    Sentry.withScope((scope) => {
      if ((req as any).user?.id) {
        scope.setUser({
          id: (req as any).user.id,
          ip_address: req.ip || null,
        });
      }
      scope.setExtras({
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
      });
      Sentry.captureException(err);
    });
  }

  // Log error details
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  if (err.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
  }

  // Don't show stack trace in production
  if (process.env.NODE_ENV === 'production') {
    stack = undefined;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack }),
  });
};

// Custom error class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};