import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';
import { useCart } from '../context/CartContext';
import Navbar from './Navbar';
import Footer from './Footer';
import MenuCard from './MenuCard';
import Cart from './Cart';
import collegeImage from '../assets/college.webp';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [todayOrderCount, setTodayOrderCount] = useState(0);

  // Get cart data
  const { itemCount, cartItems, totalAmount } = useCart();

  // Fetch featured menu items (first 6)
  const { menuItems: featuredItems, loading } = useMenu({ featured: true });

  // ✅ NEW: Fetch today's order count
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

    // Refresh every 30 seconds
    const interval = setInterval(fetchTodayOrderCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${collegeImage})` }}
      >
        <div className="absolute inset-0 bg-white/60"></div>
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar onCartOpen={() => setIsCartOpen(true)} />

        <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
            {/* Welcome Banner */}
            <div className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 size-40 bg-primary/20 rounded-full blur-3xl"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex flex-col gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/50 text-secondary text-xs font-bold w-fit border border-blue-200/50">
                    <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                    Canteen Open
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
                    Welcome back, <span className="text-secondary">Faculty!</span>
                  </h2>
                  <p className="text-slate-600 font-medium text-lg">Craving something delicious today?</p>
                </div>
                <div className="flex gap-4">
                  {/* ✅ UPDATED: Dynamic order count */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 min-w-[120px] border border-white shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Orders Today</p>
                    <p className="text-2xl font-bold text-slate-800">{todayOrderCount}</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 min-w-[120px] border border-white shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Active Items</p>
                    <p className="text-2xl font-bold text-slate-800">{featuredItems.length}+</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/menu')}
                className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-transform group cursor-pointer border-t-4 border-t-primary"
              >
                <div className="size-12 rounded-full bg-blue-50 text-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-slate-900 transition-colors">
                  <span className="material-symbols-outlined text-2xl">restaurant_menu</span>
                </div>
                <span className="font-bold text-slate-700 text-sm">Browse Menu</span>
              </button>
              <button
                onClick={() => navigate('/track-order')}  // ✅ ADD THIS
                className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-transform group cursor-pointer border-t-4 border-t-green-400"
              >
                <div className="size-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-400 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">location_on</span>
                </div>
                <span className="font-bold text-slate-700 text-sm">Track Order</span>
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-transform group cursor-pointer border-t-4 border-t-accent relative"
              >
                <div className="size-12 rounded-full bg-orange-50 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                </div>
                <span className="font-bold text-slate-700 text-sm">View Cart</span>
                {itemCount > 0 && (
                  <span className="absolute top-2 right-2 size-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {itemCount}
                  </span>
                )}
              </button>
              <button className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-transform group cursor-pointer border-t-4 border-t-red-400">
                <div className="size-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">support_agent</span>
                </div>
                <span className="font-bold text-slate-700 text-sm">Contact</span>
              </button>
            </div>

            {/* Featured Menu */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Featured Menu</h3>
                <button
                  onClick={() => navigate('/menu')}
                  className="text-secondary hover:text-primary text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  View All <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-secondary border-t-transparent"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {featuredItems.slice(0, 3).map((item) => (
                    <MenuCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
            {/* Today's Specials */}
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Today's Specials</h3>
              </div>
              <div className="flex flex-col gap-4">
                {featuredItems.slice(3, 5).map((item) => {
                  const imageUrl = item.image ? `${API_URL}/upload/${item.image}` : '';

                  return (
                    <div key={item.id} className="bg-gradient-to-br from-secondary to-blue-900 rounded-2xl p-4 text-white relative overflow-hidden shadow-lg group cursor-pointer">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                      <div className="relative z-10 flex gap-4">
                        <div className="size-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                          {imageUrl ? (
                            <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="font-bold text-lg leading-tight">{item.name}</h4>
                          <p className="text-blue-200 text-xs mb-2 line-clamp-1">{item.description}</p>
                          <p className="font-bold text-primary">₹{item.price}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Preview */}
            <div className="glass-card rounded-3xl p-6 flex flex-col h-full min-h-[300px]">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">shopping_cart</span>
                Your Cart
                {itemCount > 0 && (
                  <span className="bg-primary text-xs text-black px-2 py-0.5 rounded-full font-bold ml-auto">
                    {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                  </span>
                )}
              </h3>

              {itemCount === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center">
                  <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-3xl text-slate-400">shopping_cart</span>
                  </div>
                  <p className="text-slate-500 text-sm mb-4">Your cart is empty</p>
                  <button
                    onClick={() => navigate('/menu')}
                    className="bg-secondary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-secondary-light transition-colors"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items Preview */}
                  <div className="flex flex-col gap-3 flex-grow mb-4 max-h-[240px] overflow-y-auto">
                    {cartItems.slice(0, 3).map((cartItem) => {
                      const imageUrl = cartItem.menuItem.image
                        ? `${API_URL}/upload/${cartItem.menuItem.image}`
                        : '';

                      return (
                        <div
                          key={cartItem.menuItem.id}
                          className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <div className="size-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                            {imageUrl ? (
                              <img
                                alt={cartItem.menuItem.name}
                                className="w-full h-full object-cover"
                                src={imageUrl}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">
                                🍽️
                              </div>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-sm font-bold text-slate-800 line-clamp-1">
                              {cartItem.menuItem.name}
                            </p>
                            <p className="text-xs text-slate-500">Qty: {cartItem.quantity}</p>
                          </div>
                          <p className="text-sm font-bold text-secondary">
                            ₹{cartItem.menuItem.price * cartItem.quantity}
                          </p>
                        </div>
                      );
                    })}

                    {/* Show more indicator */}
                    {cartItems.length > 3 && (
                      <p className="text-xs text-center text-slate-500 pt-2 font-medium">
                        +{cartItems.length - 3} more {cartItems.length - 3 === 1 ? 'item' : 'items'}
                      </p>
                    )}
                  </div>

                  {/* Total & View Cart Button */}
                  <div className="mt-auto pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-600 font-medium">Total</span>
                      <span className="text-xl font-bold text-secondary">₹{totalAmount}</span>
                    </div>
                    <button
                      onClick={() => setIsCartOpen(true)}
                      className="w-full bg-secondary hover:bg-secondary-light text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 group"
                    >
                      View Cart
                      <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Cart Sidebar */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Dashboard;