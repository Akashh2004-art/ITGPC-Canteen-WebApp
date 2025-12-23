import { useState } from 'react';
import { MenuItem } from '../types';
import { useCart } from '../context/CartContext';

interface MenuCardProps {
    item: MenuItem;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MenuCard({ item }: MenuCardProps) {
    const { addToCart } = useCart();
    const [imageError, setImageError] = useState(false);
    // ❌ REMOVED: const [isFavorite, setIsFavorite] = useState(false);

    const imageUrl = item.image ? `${API_URL}/upload/${item.image}` : '';

    const handleAddToCart = () => {
        if (!item.available) return;
        addToCart(item);
    };

    return (
        <div className="glass-card rounded-3xl p-3 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
            {/* Image */}
            <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                {!imageError && imageUrl ? (
                    <img
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        src={imageUrl}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                        <span className="text-4xl">🍽️</span>
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full capitalize">
                    {item.category}
                </div>

                {/* ❌ REMOVED: Favorite Button */}

                {/* Unavailable Overlay */}
                {!item.available && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                            Unavailable
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="px-2 pb-2 flex flex-col flex-grow">
                {/* ✅ UPDATED: Only name, no rating */}
                <h4 className="font-bold text-lg text-slate-800 leading-tight line-clamp-1 mb-2">
                    {item.name}
                </h4>

                <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow">
                    {item.description}
                </p>

                {/* Price & Add Button */}
                <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-bold text-secondary">₹{item.price}</span>
                    <button
                        onClick={handleAddToCart}
                        disabled={!item.available}
                        className={`font-bold text-sm px-4 py-2 rounded-full shadow-lg transition-all flex items-center gap-1 ${item.available
                            ? 'bg-primary hover:bg-primary-dark text-slate-900 shadow-primary/20'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        Add
                        <span className="material-symbols-outlined text-base">add</span>
                    </button>
                </div>
            </div>
        </div>
    );
}