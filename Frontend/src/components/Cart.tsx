import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { User, Phone, MapPin, ShoppingBag, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface CartProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
    const { cartItems, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);

    // Checkout form state
    const [checkoutData, setCheckoutData] = useState({
        name: '',
        phone: '',
        roomNumber: '',
        specialInstructions: ''
    });

    // ✅ Load user data on component mount
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsedUser = JSON.parse(user);
                console.log('👤 Loaded user from localStorage:', parsedUser);
                setCheckoutData(prev => ({
                    ...prev,
                    name: parsedUser.fullName || parsedUser.name || '',
                    phone: parsedUser.phone || ''
                }));
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        }
    }, []);

    const handleCheckoutClick = () => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login first to place an order');
            onClose();
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setShowCheckoutForm(true);
    };

    const handleBackToCart = () => {
        setShowCheckoutForm(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCheckoutData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleConfirmOrder = async () => {
        // Validation
        if (!checkoutData.name.trim()) {
            toast.error('Please enter your name');
            return;
        }

        if (!checkoutData.phone.trim()) {
            toast.error('Please enter your phone number');
            return;
        }

        if (!/^\d{10}$/.test(checkoutData.phone.trim())) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }

        if (!checkoutData.roomNumber.trim()) {
            toast.error('Please enter your room number');
            return;
        }

        setIsCheckingOut(true);

        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            console.log('🔍 User from localStorage:', user);
            console.log('🔍 User ID:', user.id || user._id);

            // Prepare order data
            const orderData = {
                userId: user.id || user._id,
                items: cartItems.map(item => ({
                    menuItemId: item.menuItem.id,
                    name: item.menuItem.name,
                    price: item.menuItem.price,
                    quantity: item.quantity
                })),
                totalAmount: totalAmount,
                paymentMethod: 'cash',
                specialInstructions: `Room: ${checkoutData.roomNumber}${checkoutData.specialInstructions ? ` | ${checkoutData.specialInstructions}` : ''}`
            };

            console.log('📦 Sending order data:', orderData);

            const response = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            console.log('✅ Order response:', data);

            if (response.ok && data.success) {
                toast.success('🎉 Order placed successfully!', {
                    description: `Your food will be delivered to Room ${checkoutData.roomNumber}`,
                    duration: 5000
                });

                // Clear cart and close
                clearCart();
                setShowCheckoutForm(false);
                setCheckoutData(prev => ({
                    ...prev,
                    roomNumber: '',
                    specialInstructions: ''
                }));

                // Close cart after 1 second
                setTimeout(() => {
                    onClose();
                }, 1000);
            } else {
                toast.error(data.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('❌ Order error:', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Cart/Checkout Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-secondary to-blue-900 text-white">
                    <div className="flex items-center gap-3">
                        {showCheckoutForm ? (
                            <>
                                <button
                                    onClick={handleBackToCart}
                                    className="size-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold">Checkout</h2>
                                    <p className="text-sm text-blue-200">Complete your order</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                                <div>
                                    <h2 className="text-xl font-bold">Your Cart</h2>
                                    <p className="text-sm text-blue-200">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                                </div>
                            </>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="size-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content - Cart or Checkout Form */}
                <div className="flex-grow overflow-y-auto p-6">
                    {showCheckoutForm ? (
                        /* CHECKOUT FORM */
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5" />
                                    Order Summary
                                </h3>
                                <div className="space-y-2 mb-3">
                                    {cartItems.map((item) => (
                                        <div key={item.menuItem.id} className="flex justify-between text-sm">
                                            <span className="text-slate-600">
                                                {item.menuItem.name} x{item.quantity}
                                            </span>
                                            <span className="font-semibold text-slate-800">
                                                ₹{item.menuItem.price * item.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="h-px bg-slate-200 my-2" />
                                <div className="flex justify-between font-bold text-secondary">
                                    <span>Total</span>
                                    <span>₹{totalAmount}</span>
                                </div>
                            </div>

                            {/* Customer Details Form */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-800">Delivery Details</h3>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={checkoutData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your name"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none transition-colors"
                                        required
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={checkoutData.phone}
                                        onChange={handleInputChange}
                                        placeholder="10-digit mobile number"
                                        maxLength={10}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none transition-colors"
                                        required
                                    />
                                </div>

                                {/* Room Number */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-2" />
                                        Room Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="roomNumber"
                                        value={checkoutData.roomNumber}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 101, A-Block"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none transition-colors"
                                        required
                                    />
                                </div>

                                {/* Special Instructions */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Special Instructions (Optional)
                                    </label>
                                    <textarea
                                        name="specialInstructions"
                                        value={checkoutData.specialInstructions}
                                        onChange={handleInputChange}
                                        placeholder="Any special requests..."
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none transition-colors resize-none"
                                    />
                                </div>

                                {/* Payment Method */}
                                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-green-800">
                                        💵 Payment Method: Cash on Delivery
                                    </p>
                                </div>
                            </div>

                            {/* Confirm Button */}
                            <button
                                onClick={handleConfirmOrder}
                                disabled={isCheckingOut}
                                className="w-full bg-secondary hover:bg-secondary-light text-white font-bold py-4 rounded-xl shadow-lg shadow-secondary/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCheckingOut ? (
                                    <>
                                        <span className="animate-spin material-symbols-outlined">progress_activity</span>
                                        Placing Order...
                                    </>
                                ) : (
                                    <>
                                        Confirm Order - ₹{totalAmount}
                                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                                            arrow_forward
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        /* CART ITEMS */
                        <>
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="size-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-5xl text-slate-400">shopping_cart</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">Your cart is empty</h3>
                                    <p className="text-slate-500 text-sm mb-6">Add some delicious items to get started!</p>
                                    <button
                                        onClick={onClose}
                                        className="bg-secondary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-secondary-light transition-colors"
                                    >
                                        Browse Menu
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item) => {
                                        const imageUrl = item.menuItem.image ? `${API_URL}/upload/${item.menuItem.image}` : '';

                                        return (
                                            <div
                                                key={item.menuItem.id}
                                                className="flex gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"
                                            >
                                                {/* Image */}
                                                <div className="size-20 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={item.menuItem.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <span className="text-2xl">🍽️</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-grow">
                                                    <h4 className="font-bold text-slate-800 mb-1 line-clamp-1">
                                                        {item.menuItem.name}
                                                    </h4>
                                                    <p className="text-sm font-bold text-secondary mb-2">
                                                        ₹{item.menuItem.price}
                                                    </p>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-sm">
                                                            <button
                                                                onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                                                                className="size-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                                                            >
                                                                <span className="material-symbols-outlined text-base">remove</span>
                                                            </button>
                                                            <span className="font-bold text-slate-800 min-w-[20px] text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                                                                className="size-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                                                            >
                                                                <span className="material-symbols-outlined text-base">add</span>
                                                            </button>
                                                        </div>

                                                        {/* Remove Button */}
                                                        <button
                                                            onClick={() => removeFromCart(item.menuItem.id)}
                                                            className="ml-auto text-red-500 hover:text-red-600 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Clear Cart */}
                                    {cartItems.length > 0 && (
                                        <button
                                            onClick={clearCart}
                                            className="w-full text-red-500 hover:text-red-600 text-sm font-semibold py-2 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-base">delete_sweep</span>
                                            Clear Cart
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer - Checkout Button (only show in cart view) */}
                {!showCheckoutForm && cartItems.length > 0 && (
                    <div className="border-t border-slate-200 p-6 bg-slate-50">
                        {/* Subtotal */}
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-semibold">₹{totalAmount}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Delivery Fee</span>
                                <span className="font-semibold text-green-600">Free</span>
                            </div>
                            <div className="h-px bg-slate-200 my-2" />
                            <div className="flex justify-between text-lg font-bold text-slate-800">
                                <span>Total</span>
                                <span className="text-secondary">₹{totalAmount}</span>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <button
                            onClick={handleCheckoutClick}
                            className="w-full bg-secondary hover:bg-secondary-light text-white font-bold py-4 rounded-xl shadow-lg shadow-secondary/30 transition-all flex items-center justify-center gap-2 group"
                        >
                            Proceed to Checkout
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                                arrow_forward
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}