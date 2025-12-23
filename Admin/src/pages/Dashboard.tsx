import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  UtensilsCrossed,
  Plus,
  ArrowRight,
  Users,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaysOrders: 0,
    todaysRevenue: 0,
    pendingOrders: 0,
    totalMenuItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  // ✅ Fetch Dashboard Data
  useEffect(() => {
    fetchDashboardData();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      // Fetch stats
      const statsResponse = await fetch(`${API_URL}/api/orders/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!statsResponse.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsResponse.json();

      console.log('📊 Stats data:', statsData); // ✅ Debug log

      // ✅ FIX: Handle nested stats object
      const stats = statsData.stats || statsData;

      // Fetch recent orders
      const ordersResponse = await fetch(`${API_URL}/api/orders?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!ordersResponse.ok) throw new Error('Failed to fetch orders');
      const ordersData = await ordersResponse.json();

      console.log('📦 Orders data:', ordersData); // ✅ Debug log

      // ✅ Set stats with default values
      setStats({
        todaysOrders: stats.todaysOrders || 0,
        todaysRevenue: stats.todaysRevenue || 0,
        pendingOrders: stats.pendingOrders || 0,
        totalMenuItems: stats.totalMenuItems || 0,
      });

      setRecentOrders(ordersData.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="hidden lg:block">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Welcome back! Here's what's happening today.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:ml-auto">
            <Button
              onClick={() => fetchDashboardData()}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              Refresh
            </Button>
            <Button
              onClick={() => navigate('/menu')}
              className="bg-primary hover:bg-primary/90 text-sm md:text-base px-3 md:px-4 h-9 md:h-10"
            >
              <Plus size={16} className="mr-1.5 md:mr-2" />
              <span className="hidden sm:inline">Add Menu Item</span>
              <span className="sm:hidden">Add Item</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        <StatCard
          title="Today's Orders"
          value={stats.todaysOrders}
          icon={ShoppingBag}
          iconBgClass="bg-primary/10"
          iconClass="text-primary"
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${(stats.todaysRevenue || 0).toLocaleString()}`}  // ✅ Default 0
          icon={IndianRupee}
          iconBgClass="bg-status-delivered/10"
          iconClass="text-status-delivered"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          iconBgClass="bg-status-pending/10"
          iconClass="text-status-pending"
        />
        <StatCard
          title="Total Menu Items"
          value={stats.totalMenuItems}
          icon={UtensilsCrossed}
          iconBgClass="bg-status-preparing/10"
          iconClass="text-status-preparing"
        />
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 card-elevated p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-display font-semibold text-foreground">
              Recent Orders
            </h2>
            <button
              onClick={() => navigate('/orders')}
              className="text-xs md:text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight size={14} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="block md:hidden space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-sm font-semibold text-foreground">
                          #{order.id.slice(-6)}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTime(order.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          User #{order.user?._id?.slice(-6) || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.items?.length || 0} item{order.items?.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-header">
                      <th className="text-left py-3 px-4">Order ID</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Items</th>
                      <th className="text-right py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="table-row">
                        <td className="py-4 px-4">
                          <span className="font-semibold text-foreground">
                            #{order.id.slice(-6)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-foreground">
                            {order.user?.name || order.user?.fullName || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.user?.phone || 'N/A'}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-muted-foreground">
                            {order.items?.length || 0} item{order.items?.length > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-semibold text-foreground">
                            ₹{order.totalAmount}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-muted-foreground">
                            {formatTime(order.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card-elevated p-4 md:p-6">
          <h2 className="text-base md:text-lg font-display font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders')}
              className="w-full p-3 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors text-left"
            >
              <ShoppingBag className="w-6 h-6 text-primary mb-2" />
              <h3 className="text-sm font-semibold text-foreground">View All Orders</h3>
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="w-full p-3 rounded-lg bg-status-preparing/5 hover:bg-status-preparing/10 border border-status-preparing/20 transition-colors text-left"
            >
              <UtensilsCrossed className="w-6 h-6 text-status-preparing mb-2" />
              <h3 className="text-sm font-semibold text-foreground">Manage Menu</h3>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}