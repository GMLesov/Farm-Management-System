import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { sign, verify, Secret, JwtPayload, SignOptions } from 'jsonwebtoken';
import type { StringValue as MsStringValue } from 'ms';
import { body, validationResult } from 'express-validator';
import { User } from '@/models/User';
import { AppError, asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { firebaseService } from '@/config/firebase';
import { cacheService } from '@/config/redis';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { email, password, firstName, lastName, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User already exists with this email', 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    phone,
    role: 'farmer',
    isVerified: false,
  });

  await user.save();

  // Generate JWT token
  const jwtSecretEnv = process.env.JWT_SECRET;
  if (!jwtSecretEnv) {
    throw new AppError('JWT_SECRET not configured', 500);
  }
  const jwtSecret: Secret = jwtSecretEnv;

  const expiresInEnv = process.env.JWT_EXPIRES_IN || '7d';
  const signOptions: SignOptions = { expiresIn: expiresInEnv as MsStringValue | number };
  const token = sign(
    { id: user._id, email: user.email, role: user.role },
    jwtSecret,
    signOptions
  );

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  logger.info(`New user registered: ${email}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: userResponse,
  });
}));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Please provide valid email and password', 400);
  }

  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check password
  const userPassword = user.password;
  if (!userPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, userPassword);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT token
  const jwtSecretEnv = process.env.JWT_SECRET;
  if (!jwtSecretEnv) {
    throw new AppError('JWT_SECRET not configured', 500);
  }
  const jwtSecret: Secret = jwtSecretEnv;

  const expiresInEnv = process.env.JWT_EXPIRES_IN || '7d';
  const signOptions: SignOptions = { expiresIn: expiresInEnv as MsStringValue | number };
  const token = sign(
    { id: user._id, email: user.email, role: user.role, farmId: user.currentFarm },
    jwtSecret,
    signOptions
  );

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Cache user session
  await cacheService.set(`user:${user._id}`, { id: user._id, email: user.email, role: user.role }, 86400);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  logger.info(`User logged in: ${email}`);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: userResponse,
  });
}));

/**
 * @swagger
 * /api/auth/firebase-login:
 *   post:
 *     summary: Login with Firebase ID token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Firebase login successful
 *       401:
 *         description: Invalid Firebase token
 */
router.post('/firebase-login', [
  body('idToken').notEmpty().withMessage('Firebase ID token is required'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Firebase ID token is required', 400);
  }

  const { idToken } = req.body;

  // Verify Firebase ID token
  const decodedToken = await firebaseService.verifyIdToken(idToken);
  
  // Find or create user
  let user = await User.findOne({ firebaseUid: decodedToken.uid });
  
  if (!user) {
    user = new User({
      email: decodedToken.email,
      firstName: decodedToken.name?.split(' ')[0] || '',
      lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
      firebaseUid: decodedToken.uid,
      isVerified: decodedToken.email_verified || false,
      role: 'farmer',
    });
    await user.save();
    logger.info(`New user created from Firebase: ${decodedToken.email}`);
  }

  // Generate JWT token
  const jwtSecretEnv = process.env.JWT_SECRET;
  if (!jwtSecretEnv) {
    throw new AppError('JWT_SECRET not configured', 500);
  }
  const jwtSecret: Secret = jwtSecretEnv;

  const expiresInEnv = process.env.JWT_EXPIRES_IN || '7d';
  const signOptions: SignOptions = { expiresIn: expiresInEnv as MsStringValue | number };
  const token = sign(
    { id: user._id, email: user.email, role: user.role, farmId: user.currentFarm },
    jwtSecret,
    signOptions
  );

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.json({
    success: true,
    message: 'Firebase login successful',
    token,
    user: userResponse,
  });
}));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired token
 */
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new AppError('Access token required', 401);
  }

  try {
    const jwtSecretEnv = process.env.JWT_SECRET;
    if (!jwtSecretEnv) {
      throw new AppError('JWT_SECRET not configured', 500);
    }
    const jwtSecret: Secret = jwtSecretEnv;
  const decoded = verify(token, jwtSecret) as JwtPayload;
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate new token
  const expiresInEnv = process.env.JWT_EXPIRES_IN || '7d';
  const signOptions: SignOptions = { expiresIn: expiresInEnv as MsStringValue | number };
    const newToken = sign(
      { id: user._id, email: user.email, role: user.role, farmId: user.currentFarm },
      jwtSecret,
      signOptions
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
    });
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
}));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const jwtSecretEnv = process.env.JWT_SECRET;
      if (!jwtSecretEnv) {
        logger.warn('JWT_SECRET not configured');
        return;
      }
      const jwtSecret: Secret = jwtSecretEnv;
      const decoded = verify(token, jwtSecret) as JwtPayload;
      // Remove user from cache
      await cacheService.del(`user:${decoded.id}`);
      logger.info(`User logged out: ${decoded.email}`);
    } catch (error) {
      // Token might be invalid, but we still want to log them out
      logger.warn('Invalid token during logout');
    }
  }

  res.json({
    success: true,
    message: 'Logout successful',
  });
}));

export default router;