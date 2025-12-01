import { Request, Response, NextFunction } from 'express';

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    
    // Maintains proper stack trace for where error was thrown (only in V8)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error types
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, true, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, true);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, true);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, false);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service error') {
    super(message, 502, false);
  }
}

/**
 * Format error response
 */
const formatErrorResponse = (err: AppError, includeStack: boolean = false) => {
  const response: any = {
    success: false,
    error: {
      type: err.constructor.name,
      message: err.message,
      statusCode: err.statusCode,
      timestamp: new Date().toISOString(),
    },
  };

  if (err.details) {
    response.error.details = err.details;
  }

  if (includeStack && err.stack) {
    response.error.stack = err.stack;
  }

  return response;
};

/**
 * Send user-friendly error message
 */
const getUserFriendlyMessage = (err: AppError): string => {
  const messages: Record<string, string> = {
    ValidationError: 'Please check your input and try again.',
    UnauthorizedError: 'Please log in to continue.',
    ForbiddenError: 'You don\'t have permission to perform this action.',
    NotFoundError: 'The requested resource could not be found.',
    ConflictError: 'This resource already exists.',
    RateLimitError: 'Too many requests. Please try again later.',
    DatabaseError: 'A database error occurred. Please try again later.',
    ExternalServiceError: 'An external service is temporarily unavailable.',
  };

  return messages[err.constructor.name] || 'An unexpected error occurred. Please try again.';
};

/**
 * Error handler middleware
 * Must be defined last, after all other routes
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Determine if this is an operational error
  const appError = err instanceof AppError 
    ? err 
    : new AppError(err.message || 'Internal Server Error', 500, false);

  // Log error details (will be captured by Sentry if configured)
  const errorLog = {
    type: appError.constructor.name,
    message: appError.message,
    statusCode: appError.statusCode,
    isOperational: appError.isOperational,
    stack: appError.stack,
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body,
      params: req.params,
      query: req.query,
    },
    user: (req as any).user?.id,
    timestamp: new Date().toISOString(),
  };

  // Use appropriate log level
  if (appError.statusCode >= 500) {
    console.error('🔴 Server Error:', errorLog);
  } else if (appError.statusCode >= 400) {
    console.warn('🟡 Client Error:', errorLog);
  }

  // Format error response
  const response = formatErrorResponse(
    appError,
    process.env.NODE_ENV === 'development'
  );

  // Add user-friendly message in production
  if (process.env.NODE_ENV === 'production') {
    response.error.friendlyMessage = getUserFriendlyMessage(appError);
  }

  // Send response
  res.status(appError.statusCode).json(response);
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
  next(error);
};
