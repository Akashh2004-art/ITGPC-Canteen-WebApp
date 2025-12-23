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
import { TrendingUp, TrendingDown, Users, ShoppingBag, IndianRupee, UtensilsCrossed } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';

const monthlyRevenue = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
];

const categoryData = [
  { name: 'Breakfast', value: 25, color: 'hsl(38, 92%, 50%)' },
  { name: 'Lunch', value: 35, color: 'hsl(224, 76%, 33%)' },
  { name: 'Dinner', value: 20, color: 'hsl(271, 81%, 56%)' },
  { name: 'Snacks', value: 15, color: 'hsl(160, 84%, 39%)' },
  { name: 'Beverages', value: 5, color: 'hsl(24, 95%, 53%)' },
];

const orderTrend = [
  { day: 'Mon', orders: 24 },
  { day: 'Tue', orders: 31 },
  { day: 'Wed', orders: 28 },
  { day: 'Thu', orders: 42 },
  { day: 'Fri', orders: 38 },
  { day: 'Sat', orders: 22 },
  { day: 'Sun', orders: 15 },
];

const topItems = [
  { name: 'Chicken Biryani', orders: 156, revenue: 23400 },
  { name: 'Paneer Butter Masala', orders: 132, revenue: 15840 },
  { name: 'Masala Chai', orders: 298, revenue: 4470 },
  { name: 'Samosa', orders: 245, revenue: 4900 },
  { name: 'Aloo Paratha', orders: 189, revenue: 8505 },
];

export default function Analytics() {
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
          title="Total Revenue (Month)"
          value="₹67,000"
          icon={IndianRupee}
          trend={{ value: 12, isPositive: true }}
          iconBgClass="bg-status-delivered/10"
          iconClass="text-status-delivered"
        />
        <StatCard
          title="Total Orders (Month)"
          value="892"
          icon={ShoppingBag}
          trend={{ value: 8, isPositive: true }}
          iconBgClass="bg-primary/10"
          iconClass="text-primary"
        />
        <StatCard
          title="Active Faculty"
          value="156"
          icon={Users}
          iconBgClass="bg-status-preparing/10"
          iconClass="text-status-preparing"
        />
        <StatCard
          title="Menu Items"
          value="24"
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
              <span>+12% vs last month</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
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
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card-elevated p-6">
          <h2 className="text-lg font-display font-semibold text-foreground mb-6">
            Orders by Category
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
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
          </div>
        </div>

        {/* Order Trend */}
        <div className="card-elevated p-6">
          <h2 className="text-lg font-display font-semibold text-foreground mb-6">
            Weekly Order Trend
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={orderTrend}>
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
          </div>
        </div>

        {/* Top Items */}
        <div className="card-elevated p-6">
          <h2 className="text-lg font-display font-semibold text-foreground mb-6">
            Top Selling Items
          </h2>
          <div className="space-y-4">
            {topItems.map((item, idx) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
