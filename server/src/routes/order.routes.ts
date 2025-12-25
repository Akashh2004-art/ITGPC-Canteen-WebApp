import express from 'express';
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getTodayOrderCount,
  getOrderStats,
  getUserRecentOrders,
  getAnalytics,
} from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', createOrder);
router.get('/today-count', getTodayOrderCount);
router.get('/stats', getOrderStats);
router.get('/analytics', getAnalytics);
router.get('/recent', authenticate, getUserRecentOrders);
router.get('/user/:userId', getUserOrders);

router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);

export default router;