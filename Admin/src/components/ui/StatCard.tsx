import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconBgClass?: string;
  iconClass?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  iconBgClass = 'bg-primary/10',
  iconClass = 'text-primary',
}: StatCardProps) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p
              className={`mt-1 text-sm font-medium ${
                trend.isPositive ? 'text-status-delivered' : 'text-status-cancelled'
              }`}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}% from yesterday
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBgClass}`}>
          <Icon className={`w-6 h-6 ${iconClass}`} />
        </div>
      </div>
    </div>
  );
}
