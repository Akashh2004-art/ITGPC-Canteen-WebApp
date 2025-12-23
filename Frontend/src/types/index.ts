export type MenuCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages';

// ✅ UPDATED: Added 'delivery' to OrderStatus
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivery' | 'delivered' | 'cancelled';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  image: string;
  available: boolean;
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

// ✅ NEW: Order Item interface
export interface OrderItem {
  menuItem?: MenuItem;
  menuItemId?: string;
  name: string;
  price: number;
  quantity: number;
}

// ✅ NEW: Order interface
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

// ✅ NEW: Faculty interface (if needed)
export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  roomNumber: string;
  totalOrders: number;
  lastOrderDate: Date | null;
}

// ✅ NEW: Dashboard Stats interface (if needed)
export interface DashboardStats {
  todaysOrders: number;
  todaysRevenue: number;
  pendingOrders: number;
  totalMenuItems: number;
}

// ✅ NEW: Revenue Data interface (if needed)
export interface RevenueData {
  day: string;
  revenue: number;
}