import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import { AppError } from '@/middleware/errorHandler';
import { cacheService } from '@/config/redis';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    farmId?: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Access token required', 401);
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT_SECRET not configured', 500);
    }

    const decoded = jwt.verify(token, jwtSecret) as any;

    // Check if user exists in cache first
    let user = await cacheService.get<{id: string; email: string; role: string; farmId?: string}>(`user:${decoded.id}`);
    
    if (!user) {
      // If not in cache, get from database
      const dbUser = await User.findById(decoded.id);
      if (!dbUser) {
        throw new AppError('User not found', 401);
      }
      
      user = {
        id: (dbUser._id as any).toString(),
        email: dbUser.email,
        role: dbUser.role,
        ...(dbUser.currentFarm && { farmId: dbUser.currentFarm.toString() }),
      };
      
      // Cache user data
      if (user) {
        await cacheService.set(`user:${user.id}`, user, 3600); // Cache for 1 hour
      }
    }

    // Attach user to request
    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid token', 401);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expired', 401);
    }
    throw error;
  }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Access denied', 403);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    next();
  };
};

// Farm ownership middleware
export const farmOwnership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const farmId = req.params.farmId || req.params.id;
    if (!farmId) {
      throw new AppError('Farm ID required', 400);
    }

    // Check if user has access to this farm
    const { Farm } = await import('@/models/Farm');
    const farm = await Farm.findOne({
      _id: farmId,
      $or: [
        { owner: req.user.id },
        { managers: req.user.id }
      ]
    });

    if (!farm) {
      throw new AppError('Farm not found or access denied', 404);
    }

    // Attach farm to request for later use
    (req as any).farm = farm;
    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication middleware (for public endpoints that can benefit from auth)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // No token, continue without authentication
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next(); // No JWT secret, continue without authentication
    }

    const decoded = jwt.verify(token, jwtSecret) as any;

    // Get user from cache or database
    let user = await cacheService.get<{id: string; email: string; role: string; farmId?: string}>(`user:${decoded.id}`);
    
    if (!user) {
      const dbUser = await User.findById(decoded.id);
      if (dbUser) {
        user = {
          id: (dbUser._id as any).toString(),
          email: dbUser.email,
          role: dbUser.role,
          ...(dbUser.currentFarm && { farmId: dbUser.currentFarm.toString() }),
        };
        if (user) {
          await cacheService.set(`user:${user.id}`, user, 3600);
        }
      }
    }

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    next();
  }
};