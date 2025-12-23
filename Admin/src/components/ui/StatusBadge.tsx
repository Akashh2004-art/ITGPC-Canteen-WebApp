import { OrderStatus } from '@/types';

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'status-pending' },
  preparing: { label: 'Preparing', className: 'status-preparing' },
  delivery: { label: 'Out for Delivery', className: 'status-delivery' },
  delivered: { label: 'Delivered', className: 'status-delivered' },
  cancelled: { label: 'Cancelled', className: 'status-cancelled' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
}
