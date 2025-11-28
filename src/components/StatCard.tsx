import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: boolean;
  trend?: string;
}

export default function StatCard({ title, value, icon: Icon, gradient, trend }: StatCardProps) {
  return (
    <Card className={`p-4 sm:p-6 ${gradient ? 'gradient-primary text-white' : 'gradient-card'} shadow-card animate-fade-in`}>
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
          <p className={`text-xs sm:text-sm ${gradient ? 'text-white/80' : 'text-muted-foreground'} truncate`}>
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold truncate">{value}</p>
          {trend && (
            <p className={`text-xs sm:text-sm ${gradient ? 'text-white/90' : 'text-muted-foreground'} truncate`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${gradient ? 'bg-white/20' : 'bg-primary/10'}`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>
    </Card>
  );
}
