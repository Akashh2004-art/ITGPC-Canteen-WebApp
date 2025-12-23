import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/user';
import mongoose from 'mongoose';

// Helper function to transform order
const transformOrder = (order: any) => {
  // ✅ Handle user data properly
  const userData = order.user ? {
    _id: order.user._id?.toString(),
    id: order.user._id?.toString(),
    name: order.user.fullName || order.user.name,
    fullName: order.user.fullName || order.user.name,
    email: order.user.email,
    phone: order.user.phone,
  } : null;

  return {
    id: order._id.toString(),
    user: userData,
    items: order.items.map((item: any) => ({
      menuItemId: item.menuItem?.toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    totalAmount: order.totalAmount,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    specialInstructions: order.specialInstructions,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

// Create new order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, items, totalAmount, paymentMethod, specialInstructions } = req.body;

    // Validate required fields
    if (!userId || !items || items.length === 0 || !totalAmount) {
      res.status(400).json({
        success: false,
        message: 'Please provide userId, items, and totalAmount',
      });
      return;
    }

    // ✅ Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Create order
    const order = await Order.create({
      user: userId,
      items: items.map((item: any) => ({
        menuItem: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount,
      paymentMethod: paymentMethod || 'cash',
      specialInstructions,
    });

    // ✅ Populate user details after creation
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'fullName name email phone');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: transformOrder(populatedOrder),
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

// Get all orders (Admin)
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, date } = req.query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    // Filter by date (today, specific date, etc.)
    if (date === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      filter.createdAt = {
        $gte: today,
        $lt: tomorrow,
      };
    }

    // ✅ Populate user with fullName and name
    const orders = await Order.find(filter)
      .populate('user', 'fullName name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(orders.map(transformOrder));
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

// Get user's orders
export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ user: userId })
      .populate('user', 'fullName name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(orders.map(transformOrder));
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

// Get single order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user', 'fullName name email phone');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.status(200).json(transformOrder(order));
  } catch (error: any) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message,
    });
  }
};

// Update order status (Admin)
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ FIX: Add 'delivery' to valid statuses
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivery', 'delivered', 'cancelled'];
    //                                                                     ^^^^^^^^^ ADDED

    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'fullName name email phone');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      order: transformOrder(order),
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

// Get today's order count
export const getTodayOrderCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await Order.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error: any) {
    console.error('Error fetching order count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order count',
      error: error.message,
    });
  }
};

// Get order statistics (Admin)
export const getOrderStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's stats
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    });

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    // Pending orders
    const pendingOrders = await Order.countDocuments({
      status: { $in: ['pending', 'confirmed', 'preparing'] },
    });

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Menu items count
    let totalMenuItems = 0;
    try {
      const MenuItem = (await import('../models/menuItem')).default;
      totalMenuItems = await MenuItem.countDocuments();
    } catch (err) {
      console.error('Error counting menu items:', err);
    }

    res.status(200).json({
      success: true,
      stats: {
        todaysOrders: todayOrders,  // ✅ Changed
        todaysRevenue: todayRevenue[0]?.total || 0,
        pendingOrders,
        totalOrders,
        totalMenuItems,
      },
    });
  } catch (error: any) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order stats',
      error: error.message,
    });
  }
};