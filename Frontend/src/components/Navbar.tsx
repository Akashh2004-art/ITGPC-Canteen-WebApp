import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import faviconLogo from '../assets/favicon.png';

interface NavbarProps {
  onCartOpen?: () => void;
}

const Navbar = ({ onCartOpen }: NavbarProps) => {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCartClick = () => {
    if (onCartOpen) {
      onCartOpen();
    } else {
      navigate('/menu');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 shadow-md border-b border-slate-100 w-full">
        <div className="w-full flex items-center justify-between gap-4">
          {/* Left Side - Logo & Title */}
          <div
            className="flex items-center gap-3 min-w-0 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="size-10 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0 border-2 border-blue-100">
              <img
                src={faviconLogo}
                alt="ITGPC Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-secondary font-bold text-sm sm:text-base md:text-lg tracking-tight leading-none uppercase truncate">
                Itahar Government Polytechnic
              </h1>
              <span className="text-[10px] md:text-xs text-slate-500 font-medium tracking-wide uppercase">
                Faculty & Staff Canteen Portal
              </span>
            </div>
          </div>

          {/* Right Side - All Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search Bar */}
            <div className="hidden lg:block">
              <label className="relative flex items-center w-48 xl:w-64">
                <div className="absolute left-3 text-slate-400 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-xl">search</span>
                </div>
                <input
                  className="w-full h-9 pl-10 pr-4 bg-slate-100/80 border-none rounded-full text-sm font-medium focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-inner placeholder:text-slate-400"
                  placeholder="Search for food, drinks..."
                  type="text"
                  onClick={() => navigate('/menu')}
                />
              </label>
            </div>

            {/* Track Orders Button - Desktop Only */}
            <button
              onClick={() => navigate('/track-order')}
              className="hidden lg:flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-secondary hover:bg-slate-100 rounded-full text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span className="whitespace-nowrap">Track Orders</span>
            </button>

            {/* Profile Button - Desktop Only */}
            <button
              onClick={() => navigate('/profile')}
              className="hidden lg:flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-secondary hover:bg-slate-100 rounded-full text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              <span className="whitespace-nowrap">Profile</span>
            </button>

            {/* Notification Bell */}
            <button className="relative p-2 bg-white rounded-full hover:bg-primary/20 hover:text-secondary-light transition-colors group shadow-sm flex-shrink-0">
              <span className="material-symbols-outlined text-[20px] text-slate-600 group-hover:text-secondary">
                notifications
              </span>
              <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Cart Button */}
            <button
              onClick={handleCartClick}
              className="relative flex items-center justify-center size-10 bg-primary text-slate-900 rounded-full shadow-lg shadow-primary/30 hover:scale-105 transition-transform active:scale-95 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-xl">shopping_cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full border-2 border-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle - Three Dots */}
            <button
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full flex-shrink-0 relative"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay - Click to close */}
          <div
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Dropdown Menu */}
          <div className="fixed top-[72px] right-4 bg-white rounded-2xl shadow-2xl z-50 lg:hidden border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col min-w-[200px]">
              {/* Profile Option */}
              <button
                className="flex items-center gap-3 px-5 py-4 text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
                onClick={() => {
                  navigate('/profile');
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="material-symbols-outlined text-[22px] text-secondary">account_circle</span>
                <span className="font-medium text-sm">Profile</span>
              </button>

              {/* Track Orders Option - Mobile */}
              <button
                className="flex items-center gap-3 px-5 py-4 text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
                onClick={() => {
                  navigate('/track-order');
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="material-symbols-outlined text-[22px] text-secondary">location_on</span>
                <span className="font-medium text-sm">Track Orders</span>
              </button>

              {/* Cart Option - Mobile */}
              <button
                className="flex items-center gap-3 px-5 py-4 text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => {
                  handleCartClick();
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="material-symbols-outlined text-[22px] text-secondary">shopping_cart</span>
                <div className="flex items-center justify-between flex-1">
                  <span className="font-medium text-sm">Cart</span>
                  {itemCount > 0 && (
                    <span className="bg-secondary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {itemCount}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;