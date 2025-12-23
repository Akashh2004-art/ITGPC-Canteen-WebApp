import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
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

export function MenuCard({ item, onEdit, onDelete, onToggleAvailability }: MenuCardProps) {
  const [imageError, setImageError] = useState(false);

  // Construct image URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const imageUrl = item.image ? `${API_URL}/upload/${item.image}` : '';

  return (
    <div className="menu-card group">
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

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">₹{item.price}</span>

          <div className="flex items-center gap-2">
            <Switch
              checked={item.available}
              onCheckedChange={(checked) => onToggleAvailability(item.id, checked)}
              className="data-[state=checked]:bg-status-delivered"
            />
          </div>
        </div>

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