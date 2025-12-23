import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user';
import { generateToken } from '../utils/jwt';
import { verifyGoogleToken } from '../utils/googleAuth';

// User Signup (Phone/Password)
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, phone, password } = req.body;

    // Validation
    if (!fullName || !phone || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number'
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      fullName,
      phone,
      password: hashedPassword,
      authProvider: 'phone',
      role: 'user',
      isActive: true
    });

    // Generate JWT token
    const token = generateToken(newUser._id.toString());

    // Send response
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          phone: newUser.phone,
          role: newUser.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// User Login (Phone/Password)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide phone number and password'
      });
      return;
    }

    // Check if user exists
    const user = await User.findOne({ phone });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
      return;
    }

    // Check if password exists (for phone/password users)
    if (!user.password) {
      res.status(401).json({
        success: false,
        message: 'Invalid login method. Please use Google login.'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Google Signup
export const googleSignup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
      return;
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(credential);

    // Check if user already exists with this Google ID
    const existingUserByGoogle = await User.findOne({ googleId: googleUser.googleId });
    if (existingUserByGoogle) {
      res.status(400).json({
        success: false,
        message: 'Account already exists. Please login instead.'
      });
      return;
    }

    // Check if user exists with this email
    const existingUserByEmail = await User.findOne({ email: googleUser.email });
    if (existingUserByEmail) {
      res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
      return;
    }

    // Create new user
    const newUser = await User.create({
      fullName: googleUser.fullName,
      email: googleUser.email,
      googleId: googleUser.googleId,
      authProvider: 'google',
      role: 'user',
      isActive: true
    });

    // Generate JWT token
    const token = generateToken(newUser._id.toString());

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role
        },
        token
      }
    });

  } catch (error: any) {
    console.error('Google signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error. Please try again later.'
    });
  }
};

// Google Login
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
      return;
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(credential);

    // Check if user exists
    const user = await User.findOne({ googleId: googleUser.googleId });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Account not found. Please sign up first.',
        redirectTo: '/signup'
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        },
        token
      }
    });

  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error. Please try again later.'
    });
  }
};


// Get All Users (Admin Only)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page = '1', limit = '10' } = req.query;

    // Build search query
    let query: any = {};
    
    if (search && typeof search === 'string') {
      query = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const totalUsers = await User.countDocuments(query);

    // Get users with pagination
    const users = await User.find(query)
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 }) // Latest first
      .skip(skip)
      .limit(limitNum);

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limitNum);

    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: {
        users: users.map(user => ({
          id: user._id,
          fullName: user.fullName,
          email: user.email || null,
          phone: user.phone || null,
          authProvider: user.authProvider,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalUsers,
          usersPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};