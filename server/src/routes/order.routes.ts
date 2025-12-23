import express from 'express';
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getTodayOrderCount,
  getOrderStats,
} from '../controllers/order.controller';

const router = express.Router();

// Public routes
router.post('/', createOrder);
router.get('/today-count', getTodayOrderCount);
router.get('/stats', getOrderStats);

// User routes
router.get('/user/:userId', getUserOrders);

// Admin routes
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);

export default router;