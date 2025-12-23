import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from './Navbar';
import Footer from './Footer';
import { User, Phone, Mail, Calendar, LogOut, Edit, ShoppingBag } from 'lucide-react';
import collegeImage from '../assets/college.webp';

interface UserData {
    name: string;
    email?: string;
    phone: string;
    role?: string;
    department?: string;
    createdAt?: string;
}

const Profile = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            try {
                const parsedUser = JSON.parse(user);
                setUserData(parsedUser);
                setIsLoggedIn(true);
            } catch (error) {
                console.error('Error parsing user data:', error);
                setIsLoggedIn(false);
            }
        } else {
            setIsLoggedIn(false);
        }
        setIsLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully!');
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin"></div>
                    <p className="text-slate-600 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col relative">
            {/* Background Image Fixed */}
            <div
                className="fixed inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${collegeImage})` }}
            >
                <div className="absolute inset-0 bg-white/60"></div>
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col min-h-screen w-full">
                <Navbar />

                <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                    {!isLoggedIn ? (
                        // Not Logged In State
                        <div className="max-w-2xl mx-auto">
                            <div className="glass-card rounded-3xl p-8 md:p-12 text-center">
                                <div className="mb-6">
                                    <div className="size-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <User className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Not Logged In</h2>
                                    <p className="text-slate-600 text-lg">Please login to view your profile and order food</p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                    <button
                                        onClick={handleLoginRedirect}
                                        className="px-8 py-3 bg-secondary hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <User className="w-5 h-5" />
                                        Login Now
                                    </button>
                                    <button
                                        onClick={() => navigate('/signup')}
                                        className="px-8 py-3 bg-white hover:bg-slate-50 text-secondary font-bold rounded-xl border-2 border-secondary shadow-lg transition-all"
                                    >
                                        Create Account
                                    </button>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-200">
                                    <p className="text-slate-500 text-sm">
                                        By logging in, you can browse menu, place orders, and track your food delivery
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Logged In State
                        <div className="max-w-5xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                                {/* Left Column - Profile Card */}
                                <div className="lg:col-span-1">
                                    <div className="glass-card rounded-3xl p-6 text-center sticky top-24">
                                        {/* Profile Picture */}
                                        <div className="mb-6">
                                            <div className="size-32 mx-auto bg-gradient-to-br from-secondary to-blue-900 rounded-full flex items-center justify-center text-white shadow-xl mb-4">
                                                <span className="text-5xl font-bold">
                                                    {userData?.name?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-800 mb-1">{userData?.name || 'User'}</h3>
                                            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">
                                                {userData?.role || 'Faculty Member'}
                                            </p>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="bg-white/60 rounded-xl p-3">
                                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Orders</p>
                                                <p className="text-2xl font-bold text-secondary">12</p>
                                            </div>
                                            <div className="bg-white/60 rounded-xl p-3">
                                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Points</p>
                                                <p className="text-2xl font-bold text-accent">350</p>
                                            </div>
                                        </div>

                                        {/* Logout Button */}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Logout
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column - Details */}
                                <div className="lg:col-span-2 flex flex-col gap-6">
                                    {/* Personal Information */}
                                    <div className="glass-card rounded-3xl p-6 md:p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold text-slate-800">Personal Information</h3>
                                            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                                <Edit className="w-5 h-5 text-slate-600" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Phone */}
                                            <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl">
                                                <div className="size-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Phone className="w-5 h-5 text-secondary" />
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Phone Number</p>
                                                    <p className="text-slate-800 font-medium">+91 {userData?.phone || 'Not provided'}</p>
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl">
                                                <div className="size-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Mail className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Email Address</p>
                                                    <p className="text-slate-800 font-medium break-all">
                                                        {userData?.email || 'Not provided'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Department */}
                                            {userData?.department && (
                                                <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl">
                                                    <div className="size-10 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <User className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Department</p>
                                                        <p className="text-slate-800 font-medium">{userData.department}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Member Since */}
                                            <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl">
                                                <div className="size-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Calendar className="w-5 h-5 text-accent" />
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Member Since</p>
                                                    <p className="text-slate-800 font-medium">{formatDate(userData?.createdAt)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Orders */}
                                    <div className="glass-card rounded-3xl p-6 md:p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                                <ShoppingBag className="w-6 h-6 text-secondary" />
                                                Recent Orders
                                            </h3>
                                            <button className="text-secondary hover:text-primary text-sm font-semibold">
                                                View All
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Order Item 1 */}
                                            <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl hover:shadow-md transition-shadow">
                                                <div className="size-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                                    <img
                                                        src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format"
                                                        alt="Order"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="font-bold text-slate-800">Chicken Burger Combo</h4>
                                                    <p className="text-xs text-slate-500">2 days ago</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-secondary">₹150</p>
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                                        Delivered
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Order Item 2 */}
                                            <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl hover:shadow-md transition-shadow">
                                                <div className="size-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                                    <img
                                                        src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&auto=format"
                                                        alt="Order"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="font-bold text-slate-800">Pizza & Cold Drink</h4>
                                                    <p className="text-xs text-slate-500">5 days ago</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-secondary">₹120</p>
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                                        Delivered
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button className="w-full mt-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
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