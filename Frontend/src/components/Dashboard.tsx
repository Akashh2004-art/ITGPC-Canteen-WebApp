import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';
import { useCart } from '../context/CartContext';
import Navbar from './Navbar';
import Footer from './Footer';
import MenuCard from './MenuCard';
import Cart from './Cart';
import collegeImage from '../assets/college.jpg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Badge configuration
const BADGE_CONFIG = {
  hot: { label: 'HOT DEAL', bg: 'bg-red-600' },
  limited: { label: 'LIMITED TIME', bg: 'bg-orange-600' },
  new: { label: 'NEW', bg: 'bg-blue-600' },
  bestseller: { label: 'BESTSELLER', bg: 'bg-green-600' },
  combo: { label: 'COMBO OFFER', bg: 'bg-purple-600' },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [todayOrderCount, setTodayOrderCount] = useState(0);

  const { itemCount, cartItems, totalAmount, addToCart } = useCart();

  const { menuItems: featuredItems, loading: featuredLoading } = useMenu({ featured: true });
  const { menuItems: specialItems, loading: specialLoading } = useMenu({ special: true });

  useEffect(() => {
    const fetchTodayOrderCount = async () => {
      try {
        const response = await fetch(`${API_URL}/api/orders/today-count`);
        if (response.ok) {
          const data = await response.json();
          setTodayOrderCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching order count:', error);
      }
    };

    fetchTodayOrderCount();
    const interval = setInterval(fetchTodayOrderCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate discount percentage
  const calculateDiscount = (original: number, current: number) => {
    const discount = ((original - current) / original) * 100;
    return Math.round(discount);
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-gray-50">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${collegeImage})` }}
      >
        <div className="absolute inset-0 bg-white/80"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar onCartOpen={() => setIsCartOpen(true)} />

        <main className="flex-grow w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm mb-3">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="font-medium">Canteen Open</span>
                  </div>
                  <h1 className="text-3xl font-semibold text-gray-900 mb-1.5">
                    Welcome back, Faculty
                  </h1>
                  <p className="text-base text-gray-600">Order your favorite meals today</p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl px-5 py-3.5 min-w-[110px] hover:shadow-md transition-shadow">
                    <p className="text-xs text-blue-600 uppercase font-medium mb-1">Today's Orders</p>
                    <p className="text-2xl font-bold text-blue-700">{todayOrderCount}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl px-5 py-3.5 min-w-[110px] hover:shadow-md transition-shadow">
                    <p className="text-xs text-purple-600 uppercase font-medium mb-1">Menu Items</p>
                    <p className="text-2xl font-bold text-purple-700">{featuredItems.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <button
                onClick={() => navigate('/menu')}
                className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <span className="material-symbols-outlined text-2xl">restaurant_menu</span>
                </div>
                <span className="block text-sm font-medium text-gray-700">Browse Menu</span>
              </button>
              <button
                onClick={() => navigate('/track-order')}
                className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-green-400 hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 text-green-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <span className="material-symbols-outlined text-2xl">location_on</span>
                </div>
                <span className="block text-sm font-medium text-gray-700">Track Order</span>
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-orange-400 hover:shadow-lg hover:scale-105 transition-all duration-200 relative"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                </div>
                <span className="block text-sm font-medium text-gray-700">View Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    {itemCount}
                  </span>
                )}
              </button>
              <button className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-lg hover:scale-105 transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <span className="material-symbols-outlined text-2xl">support_agent</span>
                </div>
                <span className="block text-sm font-medium text-gray-700">Support</span>
              </button>
            </div>

            {/* Featured Menu */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-semibold text-gray-900">Featured Menu</h2>
                <button
                  onClick={() => navigate('/menu')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                  View All
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>

              {featuredLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredItems.slice(0, 6).map((item) => (
                    <MenuCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Today's Specials - Scrollable */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col max-h-[550px]">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">Today's Specials</h3>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {specialLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                  </div>
                ) : specialItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-gray-400">restaurant</span>
                    </div>
                    <p className="text-sm text-gray-500">No specials available today</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3.5">
                    {specialItems.map((item) => {
                      const imageUrl = item.image ? `${API_URL}/upload/${item.image}` : '';
                      const hasDiscount = item.originalPrice && item.originalPrice > item.price;
                      const discountPercent = hasDiscount && item.originalPrice
                        ? calculateDiscount(item.originalPrice, item.price)
                        : 0;
                      const badge = item.specialBadge ? BADGE_CONFIG[item.specialBadge] : null;

                      return (
                        <div
                          key={item.id}
                          className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50"
                        >
                          {/* Badge & Discount Row */}
                          <div className="flex items-center justify-between mb-3">
                            {badge && (
                              <span className={`${badge.bg} text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm`}>
                                {badge.label}
                              </span>
                            )}

                            {/* Discount Percentage Display */}
                            {hasDiscount && discountPercent > 0 && (
                              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm ml-auto">
                                {discountPercent}% OFF
                              </span>
                            )}
                          </div>

                          <div className="flex gap-3 mb-3">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-200">
                              {imageUrl ? (
                                <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="material-symbols-outlined text-2xl text-gray-400">restaurant</span>
                                </div>
                              )}
                            </div>

                            <div className="flex-grow min-w-0">
                              <h4 className="font-semibold text-base text-gray-900 mb-1 line-clamp-1">{item.name}</h4>
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                              <div className="flex items-center gap-2">
                                {hasDiscount && item.originalPrice && (
                                  <span className="text-sm text-gray-400 line-through">₹{item.originalPrice}</span>
                                )}
                                <span className="font-bold text-lg text-gray-900">₹{item.price}</span>
                              </div>
                            </div>
                          </div>

                          {item.specialDescription && (
                            <p className="text-xs text-gray-600 mb-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 line-clamp-2">
                              {item.specialDescription}
                            </p>
                          )}

                          <button
                            onClick={() => addToCart(item)}
                            disabled={!item.available}
                            className={`w-full text-sm font-semibold py-2.5 rounded-lg transition-all duration-200 ${item.available
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg hover:scale-105'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                          >
                            {item.available ? 'Add to Cart' : 'Not Available'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Cart Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                <span>Your Cart</span>
                {itemCount > 0 && (
                  <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                  </span>
                )}
              </h3>

              {itemCount === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-3xl text-gray-400">shopping_cart</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Your cart is empty</p>
                  <button
                    onClick={() => navigate('/menu')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all hover:shadow-lg hover:scale-105"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2.5 mb-4 max-h-[240px] overflow-y-auto pr-1">
                    {cartItems.slice(0, 3).map((cartItem) => {
                      const imageUrl = cartItem.menuItem.image
                        ? `${API_URL}/upload/${cartItem.menuItem.image}`
                        : '';

                      return (
                        <div
                          key={cartItem.menuItem.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-all"
                        >
                          <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border-2 border-gray-200">
                            {imageUrl ? (
                              <img
                                alt={cartItem.menuItem.name}
                                className="w-full h-full object-cover"
                                src={imageUrl}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg text-gray-400">restaurant</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                              {cartItem.menuItem.name}
                            </p>
                            <p className="text-xs text-gray-500">Quantity: {cartItem.quantity}</p>
                          </div>
                          <p className="text-base font-bold text-gray-900">
                            ₹{cartItem.menuItem.price * cartItem.quantity}
                          </p>
                        </div>
                      );
                    })}

                    {cartItems.length > 3 && (
                      <p className="text-xs text-center text-gray-500 pt-2 font-medium">
                        +{cartItems.length - 3} more {cartItems.length - 3 === 1 ? 'item' : 'items'}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-base text-gray-600">Total Amount</span>
                      <span className="text-2xl font-bold text-gray-900">₹{totalAmount}</span>
                    </div>
                    <button
                      onClick={() => setIsCartOpen(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all hover:shadow-lg hover:scale-105"
                    >
                      View Full Cart
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Dashboard;