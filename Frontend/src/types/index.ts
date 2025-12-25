export type MenuCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages';

// Badge types for special items
export type SpecialBadge = 'hot' | 'limited' | 'new' | 'bestseller' | 'combo';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivery' | 'delivered' | 'cancelled';

// ✅ UPDATED: Added price discount and badge fields
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  image: string;
  available: boolean;
  isSpecial?: boolean;
  // ✅ NEW: Price and discount fields
  originalPrice?: number;
  discountPercentage?: number;
  // ✅ NEW: Special badge and description
  specialBadge?: SpecialBadge;
  specialDescription?: string;
  validUntil?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department?: string;
  roomNumber?: string;
}

export interface OrderItem {
  menuItem?: MenuItem;
  menuItemId?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  user?: {
    _id?: string;
    id?: string;
    name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
  customerName?: string;
  customerPhone?: string;
  roomNumber?: string;
  department?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentMethod?: 'cash' | 'online';
  specialInstructions?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  roomNumber: string;
  totalOrders: number;
  lastOrderDate: Date | null;
}

export interface DashboardStats {
  todaysOrders: number;
  todaysRevenue: number;
  pendingOrders: number;
  totalMenuItems: number;
}

export interface RevenueData {
  day: string;
  revenue: number;
}