import express from 'express';
import { 
  signup, 
  login, 
  googleSignup, 
  googleLogin,
  checkAdminAvailability 
} from '../controllers/auth.controller';

const router = express.Router();

// @route   GET /api/auth/admin/availability
// @desc    Check if admin registration is available
// @access  Public
router.get('/admin/availability', checkAdminAvailability);

// @route   POST /api/auth/signup
// @desc    Register new admin with phone/password
// @access  Public
router.post('/signup', signup);

// @route   POST /api/auth/login
// @desc    Login admin with phone/password
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/google-signup
// @desc    Register new admin with Google
// @access  Public
router.post('/google-signup', googleSignup);

// @route   POST /api/auth/google-login
// @desc    Login admin with Google
// @access  Public
router.post('/google-login', googleLogin);

export default router;