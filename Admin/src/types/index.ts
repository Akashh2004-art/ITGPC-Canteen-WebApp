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
  isSpecial: boolean;
  originalPrice?: number;
  discountPercentage?: number;
  specialBadge?: string;
  specialDescription?: string;
  validUntil?: string;
  createdAt?: string; 
  updatedAt?: string;   
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