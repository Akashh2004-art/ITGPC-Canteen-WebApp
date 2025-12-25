import { useState } from 'react';
import { MenuItem } from '../types';
import { useCart } from '../context/CartContext';

interface MenuCardProps {
    item: MenuItem;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Badge configuration - Clean and simple
const BADGE_CONFIG = {
    hot: { label: 'HOT DEAL', bg: 'bg-red-600', text: 'text-white' },
    limited: { label: 'LIMITED TIME', bg: 'bg-orange-600', text: 'text-white' },
    new: { label: 'NEW ARRIVAL', bg: 'bg-blue-600', text: 'text-white' },
    bestseller: { label: 'BESTSELLER', bg: 'bg-green-600', text: 'text-white' },
    combo: { label: 'COMBO OFFER', bg: 'bg-purple-600', text: 'text-white' },
};

export default function MenuCard({ item }: MenuCardProps) {
    const { addToCart } = useCart();
    const [imageError, setImageError] = useState(false);

    const imageUrl = item.image ? `${API_URL}/upload/${item.image}` : '';

    // Calculate if item has discount
    const hasDiscount = item.originalPrice && item.originalPrice > item.price;
    const discount = item.discountPercentage ||
        (hasDiscount ? Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100) : 0);

    // Get badge configuration
    const badge = item.specialBadge ? BADGE_CONFIG[item.specialBadge] : null;

    const handleAddToCart = () => {
        if (!item.available) return;
        addToCart(item);
    };

    return (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col h-full relative">

            {/* Image - Larger size */}
            <div className="relative h-56 rounded-xl overflow-hidden mb-4 bg-gray-100">
                {!imageError && imageUrl ? (
                    <img
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        src={imageUrl}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="material-symbols-outlined text-5xl text-gray-400">restaurant</span>
                    </div>
                )}

                {/* Special Badge */}
                {badge && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
                        <div className={`${badge.bg} ${badge.text} text-xs font-bold px-3 py-1.5 rounded-lg shadow-md`}>
                            {badge.label}
                        </div>
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1 rounded-lg border border-gray-200 capitalize">
                    {item.category}
                </div>

                {/* Discount Badge */}
                {hasDiscount && discount > 0 && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md">
                        {discount}% OFF
                    </div>
                )}

                {/* Unavailable Overlay */}
                {!item.available && (
                    <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-red-600 text-white text-sm font-semibold px-5 py-2 rounded-lg shadow-lg">
                            Not Available
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow">
                {/* Name */}
                <h4 className="font-semibold text-lg text-gray-900 leading-tight line-clamp-1 mb-3">
                    {item.name}
                </h4>

                {/* ✅ Description Box with Black Border */}
                <div className="mb-3 pl-4 pr-3 py-3 border-l-4 border-blue-600 bg-blue-50 rounded-r-lg">
                    <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                        {item.description || 'No description available'}
                    </p>
                </div>

                {/* Special Description */}
                {item.isSpecial && item.specialDescription && (
                    <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <p className="text-xs text-blue-700 line-clamp-2">
                            {item.specialDescription}
                        </p>
                    </div>
                )}

                {/* Price & Add Button */}
                <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                        {/* Original Price */}
                        {hasDiscount && item.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                                ₹{item.originalPrice}
                            </span>
                        )}
                        {/* Current Price */}
                        <span className={`font-bold ${hasDiscount ? 'text-2xl text-red-600' : 'text-xl text-gray-900'}`}>
                            ₹{item.price}
                        </span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={!item.available}
                        className={`font-semibold text-sm px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${item.available
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg hover:scale-105'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Add
                        <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                </div>
            </div>
        </div>
    );
}