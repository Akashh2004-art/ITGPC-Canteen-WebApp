export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivery' | 'delivered' | 'cancelled';

export type MenuCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages';

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

export interface OrderItem {
  menuItem?: MenuItem;  // ✅ Optional
  menuItemId?: string;  // ✅ Added
  name: string;         // ✅ Direct name
  price: number;        // ✅ Direct price
  quantity: number;
}

export interface Order {
  id: string;
  user?: {              // ✅ Added user object from backend
    _id?: string;
    id?: string;
    name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
  customerName?: string;  // ✅ Fallback
  customerPhone?: string; // ✅ Fallback
  roomNumber?: string;
  department?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentMethod?: 'cash' | 'online';
  specialInstructions?: string;
  createdAt: Date | string;  // ✅ Support both
  updatedAt?: Date | string; // ✅ Support both
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