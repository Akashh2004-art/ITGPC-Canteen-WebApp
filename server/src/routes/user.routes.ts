import express from 'express';
import { 
  signup, 
  login, 
  googleSignup, 
  googleLogin,
  getAllUsers,
  getUserProfile,
  getUserRecentOrders
} from '../controllers/user.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/user/signup', signup);
router.post('/user/login', login);
router.post('/user/google-signup', googleSignup);
router.post('/user/google-login', googleLogin);
router.get('/user/profile', authenticate, getUserProfile);
router.get('/user/orders/recent', authenticate, getUserRecentOrders);
router.get('/users/all', authenticate, isAdmin, getAllUsers);

export default router;