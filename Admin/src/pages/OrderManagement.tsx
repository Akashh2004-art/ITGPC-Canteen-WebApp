import { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderDetailModal } from '@/components/orders/OrderDetailModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from 'sonner';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const statusTabs: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'delivery', label: 'Out for Delivery' },
];

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDelivered, setShowDelivered] = useState(false); // ✅ Toggle for delivered section

  useEffect(() => {
    fetchOrders();
    // Auto refresh every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch orders');

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Separate active and delivered orders
  const activeOrders = orders.filter((order) =>
    order.status !== 'delivered' && order.status !== 'cancelled'
  );

  const deliveredOrders = orders.filter((order) =>
    order.status === 'delivered'
  );

  const cancelledOrders = orders.filter((order) =>
    order.status === 'cancelled'
  );

  // ✅ Filter based on active tab (excluding delivered)
  const filteredOrders = activeOrders.filter((order) =>
    activeTab === 'all' ? true : order.status === activeTab
  );

  const getTabCount = (status: OrderStatus | 'all') => {
    if (status === 'all') return activeOrders.length;
    return activeOrders.filter((o) => o.status === status).length;
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Order Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all customer orders
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Status Tabs - ✅ Removed 'Delivered' */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === tab.value
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
          >
            {tab.label}
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.value
                  ? 'bg-primary-foreground/20'
                  : 'bg-background'
                }`}
            >
              {getTabCount(tab.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Active Orders Grid */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order, idx) => (
            <div
              key={order.id}
              className="animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <OrderCard
                order={order}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewDetails}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No active orders"
          description={
            activeTab === 'all'
              ? 'No active orders at the moment'
              : `No ${activeTab} orders at the moment`
          }
        />
      )}

      {/* ✅ Delivered Orders Section */}
      {deliveredOrders.length > 0 && (
        <div className="mt-12 border-t-2 border-dashed border-border pt-8">
          <button
            onClick={() => setShowDelivered(!showDelivered)}
            className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted rounded-xl transition-colors mb-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <h2 className="text-lg font-bold text-foreground">
                  Delivered Orders
                </h2>
                <p className="text-sm text-muted-foreground">
                  {deliveredOrders.length} completed order{deliveredOrders.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                {deliveredOrders.length}
              </span>
              {showDelivered ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </button>

          {/* Delivered Orders List */}
          {showDelivered && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {deliveredOrders.map((order, idx) => (
                <div
                  key={order.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <OrderCard
                    order={order}
                    onStatusChange={handleStatusChange}
                    onViewDetails={handleViewDetails}
                    isDelivered={true}  // ✅ Flag to disable status change
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ✅ Optional: Cancelled Orders Section */}
      {cancelledOrders.length > 0 && (
        <div className="mt-8">
          <details className="group">
            <summary className="cursor-pointer list-none p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-red-600 font-bold">⚠️ Cancelled Orders</span>
                  <span className="px-2 py-1 bg-red-200 text-red-700 rounded-full text-xs font-semibold">
                    {cancelledOrders.length}
                  </span>
                </div>
                <ChevronDown className="w-5 h-5 text-red-600 group-open:rotate-180 transition-transform" />
              </div>
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
              {cancelledOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  onViewDetails={handleViewDetails}
                  isDelivered={true}  // ✅ Also disable for cancelled
                />
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}