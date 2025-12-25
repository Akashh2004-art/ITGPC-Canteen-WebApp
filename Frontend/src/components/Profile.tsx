import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from './Navbar';
import Footer from './Footer';
import { User, Phone, Mail, LogOut, ShoppingBag, Calendar } from 'lucide-react';
import collegeImage from '../assets/college.jpg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface UserData {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    role: string;
    authProvider: string;
    createdAt: string;
}

interface RecentOrder {
    id: string;
    items: Array<{
        name: string;
        price: number;
        quantity: number;
        image?: string;
    }>;
    totalAmount: number;
    status: string;
    createdAt: string;
}

const Profile = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkLoginAndFetchData();
    }, []);

    const checkLoginAndFetchData = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setIsLoggedIn(false);
            setIsLoading(false);
            return;
        }

        setIsLoggedIn(true);
        await Promise.all([
            fetchUserProfile(token),
            fetchRecentOrders(token)
        ]);
        setIsLoading(false);
    };

    const fetchUserProfile = async (token: string) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch profile');

            const data = await response.json();
            setUserData(data.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        }
    };

    const fetchRecentOrders = async (token: string) => {
        try {
            // ✅ Changed from /api/auth/user/orders/recent to /api/orders/recent
            const response = await fetch(`${API_URL}/api/orders/recent`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();

            if (data.data && data.data.length > 0) {
            }

            setRecentOrders(data.data || []);
        } catch (error) {
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;

        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { bg: string; text: string; label: string }> = {
            pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
            confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' },
            preparing: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Preparing' },
            ready: { bg: 'bg-green-100', text: 'text-green-700', label: 'Ready' },
            delivery: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Out for Delivery' },
            delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'Delivered' },
        };

        const statusStyle = statusMap[status] || statusMap.pending;
        return (
            <span className={`text-xs ${statusStyle.bg} ${statusStyle.text} px-3 py-1 rounded-full font-semibold`}>
                {statusStyle.label}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600 text-sm font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Background Image */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${collegeImage})` }}
            >
                <div className="absolute inset-0 bg-white/60"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8">
                    {!isLoggedIn ? (
                        // Not Logged In State
                        <div className="max-w-xl mx-auto">
                            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-10 text-center">
                                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <User className="w-8 h-8 text-gray-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Not Logged In</h2>
                                <p className="text-gray-600 mb-6">Please login to view your profile</p>

                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => navigate('/signup')}
                                        className="px-6 py-2.5 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-lg border-2 border-blue-600 transition-colors"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Logged In State
                        <div className="max-w-5xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Profile Card */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 sticky top-24">
                                        {/* Avatar */}
                                        <div className="text-center mb-6">
                                            <div className="w-24 h-24 mx-auto bg-blue-600 rounded-full flex items-center justify-center text-white mb-3">
                                                <span className="text-3xl font-bold">
                                                    {userData?.fullName?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800">
                                                {userData?.fullName || 'User'}
                                            </h3>
                                            <p className="text-sm text-gray-500 uppercase tracking-wide mt-1">
                                                {userData?.role || 'Faculty'}
                                            </p>
                                            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-2">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>
                                                    {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Logout Button */}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                </div>

                                {/* Details Column */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Personal Information */}
                                    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h3>

                                        <div className="space-y-3">
                                            {/* Phone */}
                                            {userData?.phone && (
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Phone className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase font-medium">Phone</p>
                                                        <p className="text-sm text-gray-800 font-medium">+91 {userData.phone}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Email */}
                                            {userData?.email && (
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Mail className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase font-medium">Email</p>
                                                        <p className="text-sm text-gray-800 font-medium break-all">
                                                            {userData.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Login Method */}
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <User className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-medium">Login Method</p>
                                                    <p className="text-sm text-gray-800 font-medium">
                                                        {userData?.authProvider === 'google' ? 'Google Account' : 'Phone Number'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Orders */}
                                    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                <ShoppingBag className="w-5 h-5 text-blue-600" />
                                                Recent Orders
                                            </h3>
                                            <button
                                                onClick={() => navigate('/track-order')}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
                                            >
                                                View All
                                            </button>
                                        </div>

                                        {recentOrders.length === 0 ? (
                                            <div className="text-center py-10">
                                                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500 mb-4">No orders yet</p>
                                                <button
                                                    onClick={() => navigate('/menu')}
                                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                                                >
                                                    Order Now
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {recentOrders.map((order) => {
                                                    const firstItem = order.items[0];
                                                    const imageUrl = firstItem?.image
                                                        ? `${API_URL}/upload/${firstItem.image}`
                                                        : '';

                                                    return (
                                                        <div
                                                            key={order.id}
                                                            className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 cursor-pointer transition-colors"
                                                            onClick={() => navigate('/track-order')}
                                                        >
                                                            {/* Order Image */}
                                                            <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                                                {imageUrl ? (
                                                                    <img
                                                                        src={imageUrl}
                                                                        alt={firstItem.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <ShoppingBag className="w-6 h-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Order Details */}
                                                            <div className="flex-grow min-w-0">
                                                                <h4 className="font-semibold text-gray-800 text-sm truncate">
                                                                    {firstItem?.name}
                                                                    {order.items.length > 1 && (
                                                                        <span className="text-gray-500 font-normal ml-1">
                                                                            +{order.items.length - 1} more
                                                                        </span>
                                                                    )}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {formatDate(order.createdAt)}
                                                                </p>
                                                            </div>

                                                            {/* Price & Status */}
                                                            <div className="text-right flex-shrink-0">
                                                                <p className="font-bold text-gray-800 text-sm mb-1">
                                                                    ₹{order.totalAmount}
                                                                </p>
                                                                {getStatusBadge(order.status)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => navigate('/track-order')}
                                            className="w-full mt-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                                        >
                                            View Order History
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default Profile;