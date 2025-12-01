import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, authorize, farmOwnership, optionalAuth } from '../src/middleware/auth';
import { User } from '../src/models/User';
import { cacheService } from '../src/config/redis';
import { AppError } from '../src/middleware/errorHandler';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../src/models/User');
jest.mock('../src/config/redis');
jest.mock('../src/models/Farm', () => ({
  Farm: {
    findOne: jest.fn(),
  },
}));

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    farmId?: string;
  };
}

describe('Auth Middleware Tests', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock request
    mockRequest = {
      headers: {},
      params: {},
      body: {},
    };

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Setup mock next function
    mockNext = jest.fn();

    // Set JWT_SECRET for tests
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('authMiddleware', () => {
    const validToken = 'valid.jwt.token';
    const validUserId = '507f1f77bcf86cd799439011';
    const decodedToken = { id: validUserId };
    const mockUser = {
      _id: validUserId,
      email: 'test@example.com',
      role: 'user',
      currentFarm: '507f1f77bcf86cd799439012',
    };

    it('should authenticate user with valid token from cache', async () => {
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      const cachedUser = {
        id: validUserId,
        email: 'test@example.com',
        role: 'user',
        farmId: '507f1f77bcf86cd799439012',
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      (cacheService.get as jest.Mock).mockResolvedValue(cachedUser);

      await authMiddleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(jwt.verify).toHaveBeenCalledWith(validToken, 'test-secret-key');
      expect(cacheService.get).toHaveBeenCalledWith(`user:${validUserId}`);
      expect(mockRequest.user).toEqual(cachedUser);
      expect(mockNext).toHaveBeenCalledWith();
      expect(User.findById).not.toHaveBeenCalled();
    });

    it('should authenticate user with valid token from database', async () => {
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      (cacheService.get as jest.Mock).mockResolvedValue(null); // Not in cache
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (cacheService.set as jest.Mock).mockResolvedValue(undefined);

      await authMiddleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(jwt.verify).toHaveBeenCalledWith(validToken, 'test-secret-key');
      expect(cacheService.get).toHaveBeenCalledWith(`user:${validUserId}`);
      expect(User.findById).toHaveBeenCalledWith(validUserId);
      expect(mockRequest.user).toEqual({
        id: validUserId,
        email: 'test@example.com',
        role: 'user',
        farmId: '507f1f77bcf86cd799439012',
      });
      expect(cacheService.set).toHaveBeenCalledWith(
        `user:${validUserId}`,
        expect.any(Object),
        3600
      );
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw error when no token provided', async () => {
      mockRequest.headers = {};

      await expect(
        authMiddleware(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow('Access token required');
    });

    it('should throw error when authorization header is malformed', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat',
      };

      await expect(
        authMiddleware(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow('Access token required');
    });

    it('should throw error when JWT_SECRET is not configured', async () => {
      delete process.env.JWT_SECRET;
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      await expect(
        authMiddleware(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow('JWT_SECRET not configured');
    });

    it('should throw error for invalid token', async () => {
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('invalid token');
      });

      await expect(
        authMiddleware(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow('Invalid token');
    });

    it('should throw error for expired token', async () => {
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      });

      await expect(
        authMiddleware(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow('Token expired');
    });

    it('should throw error when user not found in database', async () => {
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        authMiddleware(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow('User not found');
    });

    it('should handle user without currentFarm', async () => {
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      const userWithoutFarm = {
        _id: validUserId,
        email: 'test@example.com',
        role: 'user',
        currentFarm: null,
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (User.findById as jest.Mock).mockResolvedValue(userWithoutFarm);
      (cacheService.set as jest.Mock).mockResolvedValue(undefined);

      await authMiddleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toEqual({
        id: validUserId,
        email: 'test@example.com',
        role: 'user',
      });
      expect(mockRequest.user?.farmId).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should propagate other errors', async () => {
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      const customError = new Error('Database connection failed');
      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (User.findById as jest.Mock).mockRejectedValue(customError);

      await expect(
        authMiddleware(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('authorize middleware', () => {
    it('should allow access for authorized role', () => {
      mockRequest.user = {
        id: '123',
        email: 'admin@example.com',
        role: 'admin',
      };

      const authorizeAdmin = authorize('admin', 'superadmin');
      authorizeAdmin(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow access when user has one of multiple allowed roles', () => {
      mockRequest.user = {
        id: '123',
        email: 'manager@example.com',
        role: 'manager',
      };

      const authorizeMultiple = authorize('admin', 'manager', 'supervisor');
      authorizeMultiple(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw error when user not authenticated', () => {
      delete mockRequest.user;

      const authorizeAdmin = authorize('admin');
      
      expect(() => {
        authorizeAdmin(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );
      }).toThrow('Access denied');
    });

    it('should throw error for unauthorized role', () => {
      mockRequest.user = {
        id: '123',
        email: 'user@example.com',
        role: 'user',
      };

      const authorizeAdmin = authorize('admin', 'superadmin');
      
      expect(() => {
        authorizeAdmin(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );
      }).toThrow('Insufficient permissions');
    });

    it('should work with single role', () => {
      mockRequest.user = {
        id: '123',
        email: 'moderator@example.com',
        role: 'moderator',
      };

      const authorizeModerator = authorize('moderator');
      authorizeModerator(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('farmOwnership middleware', () => {
    const mockFarm = {
      _id: '507f1f77bcf86cd799439012',
      name: 'Test Farm',
      owner: '507f1f77bcf86cd799439011',
      managers: [],
    };

    beforeEach(() => {
      mockRequest.user = {
        id: '507f1f77bcf86cd799439011',
        email: 'owner@example.com',
        role: 'user',
      };
    });

    it('should grant access to farm owner', async () => {
      mockRequest.params = { farmId: '507f1f77bcf86cd799439012' };

      const { Farm } = await import('../src/models/Farm');
      (Farm.findOne as jest.Mock).mockResolvedValue(mockFarm);

      await farmOwnership(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(Farm.findOne).toHaveBeenCalledWith({
        _id: '507f1f77bcf86cd799439012',
        $or: [
          { owner: '507f1f77bcf86cd799439011' },
          { managers: '507f1f77bcf86cd799439011' }
        ]
      });
      expect((mockRequest as any).farm).toEqual(mockFarm);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should grant access to farm manager', async () => {
      mockRequest.params = { farmId: '507f1f77bcf86cd799439012' };
      mockRequest.user!.id = '507f1f77bcf86cd799439099';

      const farmWithManager = {
        ...mockFarm,
        managers: ['507f1f77bcf86cd799439099'],
      };

      const { Farm } = await import('../src/models/Farm');
      (Farm.findOne as jest.Mock).mockResolvedValue(farmWithManager);

      await farmOwnership(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect((mockRequest as any).farm).toEqual(farmWithManager);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should use id param if farmId not present', async () => {
      mockRequest.params = { id: '507f1f77bcf86cd799439012' };

      const { Farm } = await import('../src/models/Farm');
      (Farm.findOne as jest.Mock).mockResolvedValue(mockFarm);

      await farmOwnership(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(Farm.findOne).toHaveBeenCalledWith({
        _id: '507f1f77bcf86cd799439012',
        $or: expect.any(Array)
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw error when user not authenticated', async () => {
      delete mockRequest.user;
      mockRequest.params = { farmId: '507f1f77bcf86cd799439012' };

      await farmOwnership(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
    });

    it('should throw error when farmId not provided', async () => {
      mockRequest.params = {};

      await farmOwnership(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toBe('Farm ID required');
      expect(error.statusCode).toBe(400);
    });

    it('should throw error when farm not found', async () => {
      mockRequest.params = { farmId: '507f1f77bcf86cd799439012' };

      const { Farm } = await import('../src/models/Farm');
      (Farm.findOne as jest.Mock).mockResolvedValue(null);

      await farmOwnership(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toBe('Farm not found or access denied');
      expect(error.statusCode).toBe(404);
    });

    it('should throw error when user has no access to farm', async () => {
      mockRequest.params = { farmId: '507f1f77bcf86cd799439012' };
      mockRequest.user!.id = 'unauthorized-user';

      const { Farm } = await import('../src/models/Farm');
      (Farm.findOne as jest.Mock).mockResolvedValue(null);

      await farmOwnership(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toBe('Farm not found or access denied');
    });

    it('should handle database errors gracefully', async () => {
      mockRequest.params = { farmId: '507f1f77bcf86cd799439012' };

      const dbError = new Error('Database connection failed');
      const { Farm } = await import('../src/models/Farm');
      (Farm.findOne as jest.Mock).mockRejectedValue(dbError);

      await farmOwnership(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(dbError);
    });
  });

  describe('optionalAuth middleware', () => {
    const validToken = 'valid.jwt.token';
    const validUserId = '507f1f77bcf86cd799439011';
    const decodedToken = { id: validUserId };
    const mockUser = {
      _id: validUserId,
      email: 'test@example.com',
      role: 'user',
      currentFarm: '507f1f77bcf86cd799439012',
    };

    it('should authenticate user with valid token', async () => {
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      const cachedUser = {
        id: validUserId,
        email: 'test@example.com',
        role: 'user',
        farmId: '507f1f77bcf86cd799439012',
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      (cacheService.get as jest.Mock).mockResolvedValue(cachedUser);

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toEqual(cachedUser);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without error when no token provided', async () => {
      mockRequest.headers = {};

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should continue without error when JWT_SECRET not configured', async () => {
      delete process.env.JWT_SECRET;
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should continue without error for invalid token', async () => {
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('invalid token');
      });

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without error for expired token', async () => {
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      });

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should fetch user from database if not in cache', async () => {
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (cacheService.set as jest.Mock).mockResolvedValue(undefined);

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(User.findById).toHaveBeenCalledWith(validUserId);
      expect(mockRequest.user).toEqual({
        id: validUserId,
        email: 'test@example.com',
        role: 'user',
        farmId: '507f1f77bcf86cd799439012',
      });
      expect(cacheService.set).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without error when user not found in database', async () => {
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (User.findById as jest.Mock).mockResolvedValue(null);

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle user without currentFarm', async () => {
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      const userWithoutFarm = {
        _id: validUserId,
        email: 'test@example.com',
        role: 'user',
        currentFarm: null,
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (User.findById as jest.Mock).mockResolvedValue(userWithoutFarm);
      (cacheService.set as jest.Mock).mockResolvedValue(undefined);

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toEqual({
        id: validUserId,
        email: 'test@example.com',
        role: 'user',
      });
      expect(mockRequest.user?.farmId).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without error on database errors', async () => {
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      (cacheService.get as jest.Mock).mockRejectedValue(new Error('Redis error'));

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
