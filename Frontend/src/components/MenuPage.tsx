import { useState } from 'react';
import { MenuCategory } from '../types';
import { useMenu } from '../hooks/useMenu';
import { useCart } from '../context/CartContext';
import Navbar from './Navbar';
import CategoryTabs from './CategoryTabs';
import MenuCard from './MenuCard';
import Cart from './Cart';
import collegeImage from '../assets/college.webp';

export default function MenuPage() {
    const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);

    const { itemCount } = useCart();
    const { menuItems, loading, error } = useMenu({
        category: selectedCategory,
        search: searchQuery
    });

    return (
        <div className="min-h-screen flex flex-col relative">
            {/* Background Image */}
            <div
                className="fixed inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${collegeImage})` }}
            >
                <div className="absolute inset-0 bg-white/70"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col min-h-screen w-full">
                {/* ✅ FIX: Added onCartOpen prop */}
                <Navbar onCartOpen={() => setIsCartOpen(true)} />

                <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                    {/* Header */}
                    <div className="glass-card rounded-3xl p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                                    Browse Menu
                                </h1>
                                <p className="text-slate-600">Discover delicious items from our canteen</p>
                            </div>

                            {/* Cart Button */}
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative bg-secondary hover:bg-secondary-light text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-secondary/30 transition-all flex items-center gap-2 group"
                            >
                                <span className="material-symbols-outlined">shopping_cart</span>
                                View Cart
                                {itemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 size-7 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                                        {itemCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="glass-card rounded-3xl p-6 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Bar */}
                            <div className="relative flex-grow">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    search
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for dishes..."
                                    className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur border-2 border-slate-200 rounded-xl focus:outline-none focus:border-secondary transition-colors font-medium text-slate-800"
                                />
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="mt-4">
                            <CategoryTabs
                                selectedCategory={selectedCategory}
                                onSelectCategory={setSelectedCategory}
                            />
                        </div>
                    </div>

                    {/* Menu Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center h-96">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
                                <p className="text-slate-600 font-medium">Loading menu...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="glass-card rounded-3xl p-12 text-center">
                            <div className="size-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-4xl text-red-500">error</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to load menu</h3>
                            <p className="text-slate-600 mb-6">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary-light transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : menuItems.length === 0 ? (
                        <div className="glass-card rounded-3xl p-12 text-center">
                            <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-4xl text-slate-400">restaurant</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No items found</h3>
                            <p className="text-slate-600">
                                {searchQuery || selectedCategory !== 'all'
                                    ? 'Try adjusting your search or filter'
                                    : 'No menu items available at the moment'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Results Count */}
                            <div className="mb-4 text-slate-600 font-medium">
                                Showing {menuItems.length} {menuItems.length === 1 ? 'item' : 'items'}
                                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                                {searchQuery && ` for "${searchQuery}"`}
                            </div>

                            {/* Menu Items Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {menuItems.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className="animate-fade-in"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <MenuCard item={item} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* Cart Sidebar */}
            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* Floating Cart Button (Mobile) */}
            {itemCount > 0 && !isCartOpen && (
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-6 right-6 size-16 bg-secondary hover:bg-secondary-light text-white rounded-full shadow-2xl flex items-center justify-center z-30 animate-bounce-subtle lg:hidden"
                >
                    <span className="material-symbols-outlined text-2xl">shopping_cart</span>
                    <span className="absolute -top-2 -right-2 size-6 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {itemCount}
                    </span>
                </button>
            )}
        </div>
    );
}