import express, { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register admin user
// @access  Public
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, username } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'admin',
      username
    });

    // Generate token
    const token = generateToken((user._id as any).toString());

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user (admin)
// @access  Public
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user and include password
    const user = await User.findOne({ email, role: 'admin' }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken((user._id as any).toString());

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/worker-login
// @desc    Login worker
// @access  Public
router.post('/worker-login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    // Find worker and include password
    const user = await User.findOne({ username, role: 'worker' }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken((user._id as any).toString());

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    console.error('Worker login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, role: 'admin' });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email' });
    }

    // In production, send email with reset link
    // For now, just return success
    return res.json({
      success: true,
      message: 'Password reset instructions sent to email'
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const decoded: any = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'default-secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone
      }
    });
  } catch (error: any) {
    console.error('Get me error:', error);
    // If it's a JWT error, return 401, otherwise 500
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
