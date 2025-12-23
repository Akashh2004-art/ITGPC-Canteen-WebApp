import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Admin from '../models/auth';
import { generateToken } from '../utils/jwt';
import { verifyGoogleToken } from '../utils/googleAuth';

// Admin Signup (Phone/Password)
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

    // Check if maximum admin limit reached (2 admins only)
    const adminCount = await Admin.countDocuments();
    if (adminCount >= 2) {
      res.status(403).json({
        success: false,
        message: 'Maximum admin limit reached. Only 2 admins are allowed to register.'
      });
      return;
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ phone });
    if (existingAdmin) {
      res.status(400).json({
        success: false,
        message: 'Admin with this phone number already exists'
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const newAdmin = await Admin.create({
      fullName,
      phone,
      password: hashedPassword,
      authProvider: 'phone',
      role: 'admin',
      isActive: true
    });

    // Generate JWT token
    const token = generateToken(newAdmin._id.toString());

    // Send response
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: newAdmin._id,
          fullName: newAdmin.fullName,
          phone: newAdmin.phone,
          role: newAdmin.role
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

// Admin Login (Phone/Password)
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

    // Check if admin exists
    const admin = await Admin.findOne({ phone });
    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    if (!admin.isActive) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
      return;
    }

    // Check if password exists (for phone/password users)
    if (!admin.password) {
      res.status(401).json({
        success: false,
        message: 'Invalid login method. Please use Google login.'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(admin._id.toString());

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: admin._id,
          fullName: admin.fullName,
          phone: admin.phone,
          role: admin.role
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

    // Check if maximum admin limit reached (2 admins only)
    const adminCount = await Admin.countDocuments();
    if (adminCount >= 2) {
      res.status(403).json({
        success: false,
        message: 'Maximum admin limit reached. Only 2 admins are allowed to register.'
      });
      return;
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(credential);

    // Check if admin already exists with this Google ID
    const existingAdminByGoogle = await Admin.findOne({ googleId: googleUser.googleId });
    if (existingAdminByGoogle) {
      res.status(400).json({
        success: false,
        message: 'Account already exists. Please login instead.'
      });
      return;
    }

    // Check if admin exists with this email
    const existingAdminByEmail = await Admin.findOne({ email: googleUser.email });
    if (existingAdminByEmail) {
      res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
      return;
    }

    // Create new admin
    const newAdmin = await Admin.create({
      fullName: googleUser.fullName,
      email: googleUser.email,
      googleId: googleUser.googleId,
      authProvider: 'google',
      role: 'admin',
      isActive: true
    });

    // Generate JWT token
    const token = generateToken(newAdmin._id.toString());

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: newAdmin._id,
          fullName: newAdmin.fullName,
          email: newAdmin.email,
          role: newAdmin.role
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

    // Check if admin exists
    const admin = await Admin.findOne({ googleId: googleUser.googleId });
    
    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Account not found. Please sign up first.',
        redirectTo: '/signup'
      });
      return;
    }

    if (!admin.isActive) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(admin._id.toString());

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role
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

// Check admin availability (for frontend to check before showing signup form)
export const checkAdminAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminCount = await Admin.countDocuments();
    const canRegister = adminCount < 2;
    const remainingSlots = Math.max(0, 2 - adminCount);

    res.status(200).json({
      success: true,
      data: {
        canRegister,
        remainingSlots,
        currentAdminCount: adminCount,
        maxAdmins: 2
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};