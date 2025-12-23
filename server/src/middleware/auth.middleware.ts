import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import Admin from '../models/auth';
import User from '../models/user';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: 'admin' | 'user';
      };
    }
  }
}

// Verify JWT Token
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
      return;
    }

    // Check if user exists (check both Admin and User collections)
    const admin = await Admin.findById(decoded.userId);
    const user = await User.findById(decoded.userId);

    const foundUser = admin || user;

    if (!foundUser) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (!foundUser.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account has been deactivated'
      });
      return;
    }

    // Attach user to request
    req.user = {
      userId: foundUser._id.toString(),
      role: foundUser.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Check if user is Admin
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
    return;
  }

  next();
};