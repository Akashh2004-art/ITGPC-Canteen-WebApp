import express from 'express';
import { 
  signup, 
  login, 
  googleSignup, 
  googleLogin,
  getAllUsers
} from '../controllers/user.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// @route   POST /api/auth/user/signup
// @desc    Register new user with phone/password
// @access  Public
router.post('/user/signup', signup);

// @route   POST /api/auth/user/login
// @desc    Login user with phone/password
// @access  Public
router.post('/user/login', login);

// @route   POST /api/auth/user/google-signup
// @desc    Register new user with Google
// @access  Public
router.post('/user/google-signup', googleSignup);

// @route   POST /api/auth/user/google-login
// @desc    Login user with Google
// @access  Public
router.post('/user/google-login', googleLogin);

// @route   GET /api/auth/users/all
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/users/all', authenticate, isAdmin, getAllUsers);

export default router;