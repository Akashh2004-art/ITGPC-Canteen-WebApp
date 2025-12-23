import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from './Navbar';
import Footer from './Footer';
import { Package, Clock, CheckCircle, XCircle, MapPin, Phone, ShoppingBag, Truck, ChevronDown, ChevronUp } from 'lucide-react';
import collegeImage from '../assets/college.webp';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ✅ OrderStatus type with 'delivery'
type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivery' | 'delivered' | 'cancelled';

interface Order {
    id: string;
    user?: {
        name?: string;
        fullName?: string;
        phone?: string;
    };
    items: Array<{
        name: string;
        price: number;
        quantity: number;
    }>;
    totalAmount: number;
    status: OrderStatus;
    paymentMethod: string;
    specialInstructions?: string;
    createdAt: string;
}

const TrackOrder = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
    const [showDelivered, setShowDelivered] = useState(false); // ✅ Toggle delivered
    const [showCancelled, setShowCancelled] = useState(false); // ✅ Toggle cancelled

    useEffect(() => {
        fetchUserOrders();
        // ✅ Auto refresh every 30 seconds
        const interval = setInterval(fetchUserOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUserOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            if (!token || !user.id) {
                toast.error('Please login to view orders');
                navigate('/login');
                return;
            }

            const response = await fetch(`${API_URL}/api/orders/user/${user.id}`, {
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

    const getStatusInfo = (status: string) => {
        const statusMap: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
            pending: {
                icon: Clock,
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
                label: 'Order Placed',
            },
            confirmed: {
                icon: CheckCircle,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                label: 'Confirmed',
            },
            preparing: {
                icon: Package,
                color: 'text-orange-600',
                bgColor: 'bg-orange-50',
                label: 'Preparing',
            },
            ready: {
                icon: CheckCircle,
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                label: 'Ready for Pickup',
            },
            delivery: {
                icon: Truck,
                color: 'text-purple-600',
                bgColor: 'bg-purple-50',
                label: 'Out for Delivery',
            },
            delivered: {
                icon: CheckCircle,
                color: 'text-green-700',
                bgColor: 'bg-green-100',
                label: 'Delivered',
            },
            cancelled: {
                icon: XCircle,
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                label: 'Cancelled',
            },
        };

        return statusMap[status] || statusMap.pending;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const extractRoom = (instructions?: string) => {
        if (!instructions) return 'N/A';
        const match = instructions.match(/Room:\s*([^\|]+)/i);
        return match ? match[1].trim() : 'N/A';
    };

    // ✅ Separate orders into active, delivered, and cancelled
    const activeOrders = orders.filter(order =>
        order.status !== 'delivered' && order.status !== 'cancelled'
    );
    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    const cancelledOrders = orders.filter(order => order.status === 'cancelled');

    // ✅ Filter only active orders
    const filteredOrders = filter === 'all'
        ? activeOrders
        : activeOrders.filter(order => order.status === filter);

    // ✅ Render Order Card Component
    const renderOrderCard = (order: Order) => {
        const statusInfo = getStatusInfo(order.status);
        const StatusIcon = statusInfo.icon;

        return (
            <div
                key={order.id}
                className="glass-card rounded-3xl p-6 hover:shadow-lg transition-all"
            >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className={`size-12 rounded-xl ${statusInfo.bgColor} flex items-center justify-center`}>
                            <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">
                                Order #{order.id.slice(-6)}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
                            </p>
                        </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full ${statusInfo.bgColor} ${statusInfo.color} font-bold text-sm`}>
                        {statusInfo.label}
                    </span>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Order Items
                    </h4>
                    <div className="space-y-2">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                                <span className="text-slate-700">
                                    {item.quantity}x {item.name}
                                </span>
                                <span className="font-semibold text-slate-800">
                                    ₹{item.price * item.quantity}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-600">Room: {extractRoom(order.specialInstructions)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-600">{order.user?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-slate-500 text-lg">payments</span>
                        <span className="text-slate-600 capitalize">{order.paymentMethod}</span>
                    </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="font-semibold text-slate-700">Total Amount</span>
                    <span className="text-2xl font-bold text-secondary">₹{order.totalAmount}</span>
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">Note:</span> {order.specialInstructions}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col relative">
            {/* Background Image */}
            <div
                className="fixed inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${collegeImage})` }}
            >
                <div className="absolute inset-0 bg-white/60"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col min-h-screen w-full">
                <Navbar />

                <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="glass-card rounded-3xl p-6 md:p-8 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                                        Track Your Orders
                                    </h1>
                                    <p className="text-slate-600">View and track all your food orders</p>
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                                    Back
                                </button>
                            </div>

                            {/* Filter Tabs - ✅ Active orders only */}
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {[
                                    { value: 'all', label: 'All Active' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'confirmed', label: 'Confirmed' },
                                    { value: 'preparing', label: 'Preparing' },
                                    { value: 'ready', label: 'Ready' },
                                    { value: 'delivery', label: 'Out for Delivery' },
                                ].map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() => setFilter(tab.value as OrderStatus | 'all')}
                                        className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${filter === tab.value
                                                ? 'bg-secondary text-white'
                                                : 'bg-white text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Active Orders List */}
                        {filteredOrders.length === 0 ? (
                            <div className="glass-card rounded-3xl p-12 text-center">
                                <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                    <ShoppingBag className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No active orders</h3>
                                <p className="text-slate-600 mb-6">
                                    {filter === 'all'
                                        ? "You don't have any active orders at the moment"
                                        : `No ${filter} orders at the moment`}
                                </p>
                                <button
                                    onClick={() => navigate('/menu')}
                                    className="bg-secondary hover:bg-secondary-light text-white px-6 py-3 rounded-xl font-bold transition-colors"
                                >
                                    Browse Menu
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredOrders.map(order => renderOrderCard(order))}
                            </div>
                        )}

                        {/* ✅ Delivered Orders Section */}
                        {deliveredOrders.length > 0 && (
                            <div className="mt-12 border-t-2 border-dashed border-slate-300 pt-8">
                                <button
                                    onClick={() => setShowDelivered(!showDelivered)}
                                    className="w-full flex items-center justify-between p-4 glass-card hover:shadow-md rounded-2xl transition-all mb-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                        <div className="text-left">
                                            <h2 className="text-lg font-bold text-slate-800">
                                                Delivered Orders
                                            </h2>
                                            <p className="text-sm text-slate-600">
                                                {deliveredOrders.length} completed order{deliveredOrders.length > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                            {deliveredOrders.length}
                                        </span>
                                        {showDelivered ? (
                                            <ChevronUp className="w-5 h-5 text-slate-600" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-slate-600" />
                                        )}
                                    </div>
                                </button>

                                {showDelivered && (
                                    <div className="space-y-4 opacity-75">
                                        {deliveredOrders.map(order => renderOrderCard(order))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ✅ Cancelled Orders Section */}
                        {cancelledOrders.length > 0 && (
                            <div className="mt-8">
                                <button
                                    onClick={() => setShowCancelled(!showCancelled)}
                                    className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-2xl transition-all mb-4 border border-red-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <XCircle className="w-6 h-6 text-red-600" />
                                        <div className="text-left">
                                            <h2 className="text-lg font-bold text-red-800">
                                                Cancelled Orders
                                            </h2>
                                            <p className="text-sm text-red-600">
                                                {cancelledOrders.length} cancelled order{cancelledOrders.length > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-red-200 text-red-700 rounded-full text-sm font-semibold">
                                            {cancelledOrders.length}
                                        </span>
                                        {showCancelled ? (
                                            <ChevronUp className="w-5 h-5 text-red-600" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                </button>

                                {showCancelled && (
                                    <div className="space-y-4 opacity-75">
                                        {cancelledOrders.map(order => renderOrderCard(order))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default TrackOrder;