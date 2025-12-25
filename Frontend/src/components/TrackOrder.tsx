import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from './Navbar';
import Footer from './Footer';
import { Package, Clock, CheckCircle, XCircle, MapPin, Phone, ShoppingBag, Truck, ChevronDown, ChevronUp } from 'lucide-react';
import collegeImage from '../assets/college.jpg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
        image?: string;
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
    const [showDelivered, setShowDelivered] = useState(false);
    const [showCancelled, setShowCancelled] = useState(false);

    useEffect(() => {
        fetchUserOrders();
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
                color: 'text-yellow-700',
                bgColor: 'bg-yellow-100',
                label: 'Order Placed',
            },
            confirmed: {
                icon: CheckCircle,
                color: 'text-blue-700',
                bgColor: 'bg-blue-100',
                label: 'Confirmed',
            },
            preparing: {
                icon: Package,
                color: 'text-orange-700',
                bgColor: 'bg-orange-100',
                label: 'Preparing',
            },
            ready: {
                icon: CheckCircle,
                color: 'text-green-700',
                bgColor: 'bg-green-100',
                label: 'Ready for Pickup',
            },
            delivery: {
                icon: Truck,
                color: 'text-purple-700',
                bgColor: 'bg-purple-100',
                label: 'Out for Delivery',
            },
            delivered: {
                icon: CheckCircle,
                color: 'text-green-800',
                bgColor: 'bg-green-200',
                label: 'Delivered',
            },
            cancelled: {
                icon: XCircle,
                color: 'text-red-700',
                bgColor: 'bg-red-100',
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

    const activeOrders = orders.filter(order =>
        order.status !== 'delivered' && order.status !== 'cancelled'
    );
    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    const cancelledOrders = orders.filter(order => order.status === 'cancelled');

    const filteredOrders = filter === 'all'
        ? activeOrders
        : activeOrders.filter(order => order.status === filter);

    const renderOrderCard = (order: Order) => {
        const statusInfo = getStatusInfo(order.status);
        const StatusIcon = statusInfo.icon;

        return (
            <div
                key={order.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg ${statusInfo.bgColor} flex items-center justify-center`}>
                            <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base">
                                Order #{order.id.slice(-6)}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
                            </p>
                        </div>
                    </div>
                    <span className={`px-4 py-2 rounded-lg ${statusInfo.bgColor} ${statusInfo.color} font-medium text-sm border ${statusInfo.color.replace('text-', 'border-')}`}>
                        {statusInfo.label}
                    </span>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4" />
                        Order Items
                    </h4>
                    <div className="space-y-2">
                        {order.items.map((item, idx) => {
                            const itemImageUrl = item.image ? `${API_URL}/upload/${item.image}` : '';

                            return (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    {/* Item Image */}
                                    <div className="w-14 h-14 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                        {itemImageUrl ? (
                                            <img
                                                src={itemImageUrl}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-xl text-gray-400">restaurant</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-grow min-w-0">
                                        <span className="text-gray-700 text-sm font-medium block">
                                            {item.name}
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            Qty: {item.quantity}
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <span className="font-semibold text-gray-900 flex-shrink-0">
                                        ₹{item.price * item.quantity}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Room: {extractRoom(order.specialInstructions)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{order.user?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-500 text-base">payments</span>
                        <span className="text-gray-600 capitalize">{order.paymentMethod}</span>
                    </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="font-medium text-gray-700">Total Amount</span>
                    <span className="text-xl font-bold text-blue-600">₹{order.totalAmount}</span>
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <span className="font-medium">Note:</span> {order.specialInstructions}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col relative bg-gray-50">
            {/* Background Image */}
            <div
                className="fixed inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${collegeImage})` }}
            >
                <div className="absolute inset-0 bg-white/75"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col min-h-screen w-full">
                <Navbar />

                <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                    {/* Header */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                                    Track Your Orders
                                </h1>
                                <p className="text-gray-600">View and track all your food orders</p>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                Back
                            </button>
                        </div>

                        {/* Filter Tabs */}
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
                                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all border ${filter === tab.value
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Orders List */}
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center shadow-sm">
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No active orders</h3>
                            <p className="text-gray-600 mb-6">
                                {filter === 'all'
                                    ? "You don't have any active orders at the moment"
                                    : `No ${filter} orders at the moment`}
                            </p>
                            <button
                                onClick={() => navigate('/menu')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                Browse Menu
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredOrders.map(order => renderOrderCard(order))}
                        </div>
                    )}

                    {/* Delivered Orders Section */}
                    {deliveredOrders.length > 0 && (
                        <div className="mt-12 border-t-2 border-dashed border-gray-300 pt-8">
                            <button
                                onClick={() => setShowDelivered(!showDelivered)}
                                className="w-full flex items-center justify-between p-5 bg-white border-2 border-gray-200 hover:border-green-300 hover:shadow-md rounded-xl transition-all mb-4"
                            >
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                    <div className="text-left">
                                        <h2 className="text-base font-semibold text-gray-900">
                                            Delivered Orders
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            {deliveredOrders.length} completed order{deliveredOrders.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                                        {deliveredOrders.length}
                                    </span>
                                    {showDelivered ? (
                                        <ChevronUp className="w-5 h-5 text-gray-600" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-600" />
                                    )}
                                </div>
                            </button>

                            {showDelivered && (
                                <div className="space-y-4">
                                    {deliveredOrders.map(order => renderOrderCard(order))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cancelled Orders Section */}
                    {cancelledOrders.length > 0 && (
                        <div className="mt-8">
                            <button
                                onClick={() => setShowCancelled(!showCancelled)}
                                className="w-full flex items-center justify-between p-5 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl transition-all mb-4"
                            >
                                <div className="flex items-center gap-3">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                    <div className="text-left">
                                        <h2 className="text-base font-semibold text-red-900">
                                            Cancelled Orders
                                        </h2>
                                        <p className="text-sm text-red-700">
                                            {cancelledOrders.length} cancelled order{cancelledOrders.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-red-200 text-red-800 rounded-lg text-sm font-medium">
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
                                <div className="space-y-4">
                                    {cancelledOrders.map(order => renderOrderCard(order))}
                                </div>
                            )}
                        </div>
                    )}
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default TrackOrder;