import { X, Printer, Phone, MapPin, Building, Clock } from 'lucide-react';
import { Order } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-xl shadow-xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card rounded-t-xl">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              Order #{order.id}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {order.createdAt.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            <StatusBadge status={order.status} />
          </div>

          {/* Customer Details */}
          <div className="p-4 rounded-xl bg-muted/50 space-y-3">
            <h3 className="font-semibold text-foreground">Customer Details</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">{order.customerName}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} />
                <span>{order.customerPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={14} />
                <span>{order.roomNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building size={14} />
                <span>{order.department}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={item.menuItem.imageUrl}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.menuItem.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.menuItem.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground">
                    ₹{item.menuItem.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">Special Instructions</h3>
              <p className="text-sm text-amber-700">{order.specialInstructions}</p>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-lg font-semibold text-foreground">Total Amount</span>
            <span className="text-2xl font-bold text-primary">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 p-6 border-t border-border bg-card rounded-b-xl">
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handlePrint}
            >
              <Printer size={16} className="mr-2" />
              Print Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
