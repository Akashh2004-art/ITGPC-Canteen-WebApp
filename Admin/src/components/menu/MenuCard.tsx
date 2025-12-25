import { useState } from 'react';
import { Pencil, Trash2, Tag, Percent } from 'lucide-react';
import { MenuItem, MenuCategory } from '@/types';
import { Switch } from '@/components/ui/switch';

interface MenuCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggleAvailability: (id: string, available: boolean) => void;
}

const categoryColors: Record<MenuCategory, string> = {
  breakfast: 'bg-amber-100 text-amber-700',
  lunch: 'bg-blue-100 text-blue-700',
  dinner: 'bg-purple-100 text-purple-700',
  snacks: 'bg-green-100 text-green-700',
  beverages: 'bg-pink-100 text-pink-700',
};

// ✅ Badge colors
const specialBadgeColors: Record<string, string> = {
  hot: 'bg-gradient-to-r from-red-500 to-orange-500',
  limited: 'bg-gradient-to-r from-purple-500 to-pink-500',
  new: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  bestseller: 'bg-gradient-to-r from-yellow-500 to-amber-500',
  combo: 'bg-gradient-to-r from-green-500 to-emerald-500',
};

const specialBadgeLabels: Record<string, string> = {
  hot: '🔥 HOT',
  limited: '⏰ LIMITED',
  new: '✨ NEW',
  bestseller: '⭐ BEST',
  combo: '🎁 COMBO',
};

export function MenuCard({ item, onEdit, onDelete, onToggleAvailability }: MenuCardProps) {
  const [imageError, setImageError] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const imageUrl = item.image ? `${API_URL}/upload/${item.image}` : '';

  // ✅ Check if special offer is still valid
  const isSpecialValid = item.isSpecial && item.validUntil
    ? new Date(item.validUntil) >= new Date()
    : false;

  return (
    <div className="menu-card group relative">
      {/* ✅ Special Badge - Top Right */}
      {item.isSpecial && isSpecialValid && (
        <div className="absolute top-3 right-3 z-10">
          <div className={`${specialBadgeColors[item.specialBadge || 'hot']} text-white px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1 animate-pulse`}>
            <span>{specialBadgeLabels[item.specialBadge || 'hot']}</span>
          </div>
        </div>
      )}

      {/* ✅ Discount Badge - Top Left */}
      {item.isSpecial && isSpecialValid && item.discountPercentage && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
            <Percent className="w-3 h-3" />
            {item.discountPercentage}% OFF
          </div>
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {!imageError && imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-4xl">🍽️</span>
          </div>
        )}

        {!item.available && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <span className="text-primary-foreground font-semibold px-3 py-1 bg-status-cancelled rounded-lg">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
          <span className={`status-badge ${categoryColors[item.category]}`}>
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.description}
        </p>

        {/* ✅ Price Display - With or Without Discount */}
        <div className="flex items-center justify-between mb-3">
          {item.isSpecial && isSpecialValid && item.originalPrice ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground line-through">₹{item.originalPrice}</span>
              <span className="text-xl font-bold text-green-600">₹{item.price}</span>
            </div>
          ) : (
            <span className="text-xl font-bold text-primary">₹{item.price}</span>
          )}

          <div className="flex items-center gap-2">
            {item.isSpecial && <Tag className="w-4 h-4 text-orange-500" />}
            <Switch
              checked={item.available}
              onCheckedChange={(checked) => onToggleAvailability(item.id, checked)}
              className="data-[state=checked]:bg-status-delivered"
            />
          </div>
        </div>

        {/* ✅ Special Description - If exists */}
        {item.isSpecial && isSpecialValid && item.specialDescription && (
          <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-xs text-orange-700 line-clamp-2">{item.specialDescription}</p>
          </div>
        )}

        {/* ✅ Validity Display */}
        {item.isSpecial && isSpecialValid && item.validUntil && (
          <div className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
            <span className="material-symbols-outlined text-sm">schedule</span>
            Valid until: {new Date(item.validUntil).toLocaleDateString('en-IN')}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Pencil size={16} />
            <span className="text-sm font-medium">Edit</span>
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          >
            <Trash2 size={16} />
            <span className="text-sm font-medium">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}