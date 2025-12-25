import { useState } from 'react';
import { MenuCategory } from '../types';
import { useMenu } from '../hooks/useMenu';
import { useCart } from '../context/CartContext';
import Navbar from './Navbar';
import CategoryTabs from './CategoryTabs';
import MenuCard from './MenuCard';
import Cart from './Cart';
import collegeImage from '../assets/college.jpg';

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
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Background Image */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${collegeImage})` }}
            >
                <div className="absolute inset-0 bg-white/75"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar onCartOpen={() => setIsCartOpen(true)} />

                <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                                    Browse Menu
                                </h1>
                                <p className="text-gray-600">Discover delicious items from our canteen</p>
                            </div>

                            {/* Cart Button */}
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">shopping_cart</span>
                                View Cart
                                {itemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {itemCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                        {/* Search Bar */}
                        <div className="relative mb-4">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                search
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for dishes..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
                            />
                        </div>

                        {/* Category Tabs */}
                        <CategoryTabs
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                        />
                    </div>

                    {/* Menu Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                                <p className="text-gray-600 font-medium">Loading menu...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl text-red-500">error</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to load menu</h3>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : menuItems.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl text-gray-400">restaurant</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No items found</h3>
                            <p className="text-gray-600">
                                {searchQuery || selectedCategory !== 'all'
                                    ? 'Try adjusting your search or filter'
                                    : 'No menu items available at the moment'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Results Count */}
                            <div className="mb-4 text-gray-600 font-medium">
                                Showing {menuItems.length} {menuItems.length === 1 ? 'item' : 'items'}
                                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                                {searchQuery && ` for "${searchQuery}"`}
                            </div>

                            {/* ✅ Menu Items Grid - More columns for smaller cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {menuItems.map((item) => (
                                    <MenuCard key={item.id} item={item} />
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
                    className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center z-30 lg:hidden transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl">shopping_cart</span>
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {itemCount}
                    </span>
                </button>
            )}
        </div>
    );
}