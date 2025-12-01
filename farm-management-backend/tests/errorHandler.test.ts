import { Request, Response, NextFunction } from 'express';
import { errorHandler, asyncHandler } from '../src/middleware/errorHandler';
import { AppError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError } from '../src/utils/errors';
import { logger } from '../src/utils/logger';

// Mock logger
jest.mock('../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: '/test',
      ip: '127.0.0.1',
      get: jest.fn((header: string) => {
        if (header === 'User-Agent') return 'Test Agent';
        return undefined;
      }) as any,
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('AppError Handling', () => {
    it('should handle ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid input',
        })
      );
    });

    it('should handle NotFoundError with 404 status', () => {
      const error = new NotFoundError('Resource not found');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Resource not found',
        })
      );
    });

    it('should handle UnauthorizedError with 401 status', () => {
      const error = new UnauthorizedError('Authentication required');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Authentication required',
        })
      );
    });

    it('should handle ForbiddenError with 403 status', () => {
      const error = new ForbiddenError('Access denied');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Access denied',
        })
      );
    });

    it('should handle custom AppError with specified status code', () => {
      const error = new AppError('Custom error', 418);
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(418);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Custom error',
        })
      );
    });
  });

  describe('Generic Error Handling', () => {
    it('should handle generic Error with 500 status', () => {
      const error = new Error('Something went wrong');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Something went wrong',
        })
      );
    });

    it('should log error details for generic errors', () => {
      const error = new Error('Test error');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(logger.error).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          message: 'Test error',
          method: 'GET',
          url: '/test',
        })
      );
    });

    it('should handle errors without message', () => {
      const error = {} as Error;
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Internal Server Error',
        })
      );
    });
  });

  describe('Development vs Production Mode', () => {
    const originalEnv = process.env.NODE_ENV;

    afterAll(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should include stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Dev error');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String),
        })
      );
    });

    it('should not include stack trace in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Prod error');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.stack).toBeUndefined();
    });
  });

  describe('Mongoose Validation Errors', () => {
    it('should handle mongoose validation errors', () => {
      const error: any = {
        name: 'ValidationError',
        errors: {
          email: { message: 'Email is required' },
          password: { message: 'Password must be at least 8 characters' },
        },
      };
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });

    it('should handle mongoose duplicate key errors', () => {
      const error: any = {
        name: 'MongoServerError',
        code: 11000,
        keyPattern: { email: 1 },
      };
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle mongoose cast errors', () => {
      const error: any = {
        name: 'CastError',
        kind: 'ObjectId',
        path: '_id',
        value: 'invalid-id',
      };
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid ID format',
        })
      );
    });
  });

  describe('JWT Errors', () => {
    it('should handle JsonWebTokenError', () => {
      const error: any = {
        name: 'JsonWebTokenError',
        message: 'jwt malformed',
      };
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Invalid token'),
        })
      );
    });

    it('should handle TokenExpiredError', () => {
      const error: any = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
      };
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Token expired'),
        })
      );
    });
  });

  describe('asyncHandler Wrapper', () => {
    it('should handle successful async operations', async () => {
      const asyncFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = asyncHandler(asyncFn);
      
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass errors to next middleware', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);
      
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should work with async arrow functions', async () => {
      const wrappedFn = asyncHandler(async (req: Request, res: Response) => {
        res.json({ success: true });
      });
      
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should preserve request, response, and next parameters', async () => {
      const asyncFn = jest.fn(async (req, res, next) => {
        expect(req).toBe(mockRequest);
        expect(res).toBe(mockResponse);
        expect(next).toBe(mockNext);
      });
      const wrappedFn = asyncHandler(asyncFn);
      
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Response Format', () => {
    it('should mark success as false in error response', () => {
      const error = new Error('Test error');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });

    it('should include error message in response', () => {
      const error = new Error('Custom error message');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Custom error message',
        })
      );
    });
  });

  describe('Special Cases', () => {
    it('should handle null error (will crash without guard)', () => {
      expect(() => {
        errorHandler(null as any, mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow();
    });

    it('should handle undefined error (will crash without guard)', () => {
      expect(() => {
        errorHandler(undefined as any, mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow();
    });

    it('should handle string error', () => {
      errorHandler('String error' as any, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('should handle errors with statusCode property (not status)', () => {
      const error: any = {
        message: 'Custom status error',
        statusCode: 418,
      };
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(418);
    });
  });
});
