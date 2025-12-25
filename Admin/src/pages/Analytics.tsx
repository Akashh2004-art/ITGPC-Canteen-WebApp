import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, IndianRupee, UtensilsCrossed } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface OrderTrend {
  day: string;
  orders: number;
}

interface TopItem {
  name: string;
  orders: number;
  revenue: number;
}

interface AnalyticsData {
  monthlyRevenue: MonthlyRevenue[];
  categoryData: CategoryData[];
  orderTrend: OrderTrend[];
  topItems: TopItem[];
  stats: {
    totalRevenue: number;
    totalOrders: number;
    activeFaculty: number;
    menuItems: number;
  };
}

const categoryColors: Record<string, string> = {
  breakfast: 'hsl(38, 92%, 50%)',
  lunch: 'hsl(224, 76%, 33%)',
  dinner: 'hsl(271, 81%, 56%)',
  snacks: 'hsl(160, 84%, 39%)',
  beverages: 'hsl(24, 95%, 53%)',
};

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/orders/analytics`);

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;

        // Transform monthly revenue data
        const monthlyRevenue = data.monthlyRevenue.map((item: any) => ({
          month: monthNames[item._id.month - 1],
          revenue: item.revenue
        }));

        // Transform category data
        const totalCategoryOrders = data.categoryData.reduce((sum: number, cat: any) => sum + cat.count, 0);
        const categoryData = data.categoryData.map((item: any) => ({
          name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
          value: Math.round((item.count / totalCategoryOrders) * 100),
          color: categoryColors[item._id] || 'hsl(200, 80%, 50%)'
        }));

        // Transform weekly order trend
        const orderTrend = data.weeklyOrders.map((item: any) => ({
          day: dayNames[item._id - 1],
          orders: item.orders
        }));

        // Transform top items
        const topItems = data.topItems.map((item: any) => ({
          name: item._id,
          orders: item.orders,
          revenue: item.revenue
        }));

        setAnalyticsData({
          monthlyRevenue,
          categoryData,
          orderTrend,
          topItems,
          stats: data.stats
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Insights and statistics for your canteen
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${(analyticsData.stats?.totalRevenue || 0).toLocaleString()}`}
          icon={IndianRupee}
          trend={{ value: 12, isPositive: true }}
          iconBgClass="bg-status-delivered/10"
          iconClass="text-status-delivered"
        />
        <StatCard
          title="Total Orders"
          value={(analyticsData.stats?.totalOrders || 0).toString()}
          icon={ShoppingBag}
          trend={{ value: 8, isPositive: true }}
          iconBgClass="bg-primary/10"
          iconClass="text-primary"
        />
        <StatCard
          title="Active Faculty"
          value={(analyticsData.stats?.activeFaculty || 0).toString()}
          icon={Users}
          iconBgClass="bg-status-preparing/10"
          iconClass="text-status-preparing"
        />
        <StatCard
          title="Menu Items"
          value={(analyticsData.stats?.menuItems || 0).toString()}
          icon={UtensilsCrossed}
          iconBgClass="bg-accent/10"
          iconClass="text-accent"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-semibold text-foreground">
              Monthly Revenue
            </h2>
            <div className="flex items-center gap-1 text-sm text-status-delivered">
              <TrendingUp size={16} />
              <span>Last 6 months</span>
            </div>
          </div>
          <div className="h-72">
            {analyticsData.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No revenue data available
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card-elevated p-6">
          <h2 className="text-lg font-display font-semibold text-foreground mb-6">
            Orders by Category
          </h2>
          <div className="h-72">
            {analyticsData.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Share']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No category data available
              </div>
            )}
          </div>
        </div>

        {/* Order Trend */}
        <div className="card-elevated p-6">
          <h2 className="text-lg font-display font-semibold text-foreground mb-6">
            Weekly Order Trend
          </h2>
          <div className="h-72">
            {analyticsData.orderTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.orderTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [value, 'Orders']}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No order trend data available
              </div>
            )}
          </div>
        </div>

        {/* Top Items */}
        <div className="card-elevated p-6">
          <h2 className="text-lg font-display font-semibold text-foreground mb-6">
            Top Selling Items
          </h2>
          <div className="space-y-4">
            {analyticsData.topItems.length > 0 ? (
              analyticsData.topItems.map((item, idx) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50 animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.orders} orders</p>
                    </div>
                  </div>
                  <span className="font-semibold text-status-delivered">
                    ₹{item.revenue.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No top items data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}