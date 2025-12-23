import { Clock, Eye, Phone, MapPin } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onViewDetails: (order: Order) => void;
  isDelivered?: boolean;  // ✅ NEW prop
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

// ✅ Handle both Date object and string
function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Unknown';
  }

  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const minutes = Math.floor(diff / (1000 * 60));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function OrderCard({ order, onStatusChange, onViewDetails, isDelivered = false }: OrderCardProps) {
  // ✅ Extract customer info from order
  const customerName = order.user?.name || order.user?.fullName || order.customerName || 'Unknown Customer';
  const customerPhone = order.user?.phone || order.customerPhone || 'N/A';
  const roomNumber = order.roomNumber || extractRoomFromInstructions(order.specialInstructions) || 'N/A';

  return (
    <div className={`order-card animate-fade-in ${isDelivered ? 'opacity-75' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display font-bold text-lg text-foreground">
              #{order.id.slice(-6)}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock size={14} />
            <span>{getRelativeTime(order.createdAt)}</span>
          </div>
        </div>
        <span className="text-xl font-bold text-primary">₹{order.totalAmount}</span>
      </div>

      {/* Customer Info */}
      <div className="space-y-2 mb-4 p-3 rounded-lg bg-muted/50">
        <p className="font-medium text-foreground">{customerName}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Phone size={14} />
            {customerPhone}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {roomNumber}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        <p className="text-sm font-medium text-muted-foreground">Items:</p>
        <div className="space-y-1">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-foreground">
                  {item.quantity}x {item.name || item.menuItem?.name || 'Item'}
                </span>
                <span className="text-muted-foreground">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No items</p>
          )}
        </div>
      </div>

      {/* Special Instructions */}
      {order.specialInstructions && (
        <div className="mb-4 p-2 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-700">
            <span className="font-medium">Note:</span> {order.specialInstructions}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        {/* ✅ Disable status change for delivered/cancelled orders */}
        {isDelivered ? (
          <div className="flex-1 px-4 py-2 rounded-lg bg-muted text-muted-foreground text-center text-sm font-medium">
            Status Locked
          </div>
        ) : (
          <Select
            value={order.status}
            onValueChange={(value: OrderStatus) => onStatusChange(order.id, value)}
          >
            <SelectTrigger className="flex-1 bg-background">
              <SelectValue placeholder="Change Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <button
          onClick={() => onViewDetails(order)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Eye size={16} />
          <span className="font-medium">Details</span>
        </button>
      </div>
    </div>
  );
}

// ✅ Helper function to extract room from special instructions
function extractRoomFromInstructions(instructions?: string): string | null {
  if (!instructions) return null;
  const match = instructions.match(/Room:\s*([^\|]+)/i);
  return match ? match[1].trim() : null;
}