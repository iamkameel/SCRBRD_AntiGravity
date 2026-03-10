"use client";

import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string | number;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: 'border-border',
  success: 'border-green-500/50 bg-green-500/5',
  warning: 'border-yellow-500/50 bg-yellow-500/5',
  danger: 'border-red-500/50 bg-red-500/5',
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColors = {
  up: 'text-green-500',
  down: 'text-red-500',
  neutral: 'text-muted-foreground',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  description,
  variant = 'default',
  className,
}: StatCardProps) {
  const TrendIcon = trend ? trendIcons[trend] : null;

  return (
    <Card
      className={cn(
        'p-6 transition-all hover:shadow-lg hover:scale-[1.02]',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">{value}</span>
            {trend && trendValue && (
              <div className={cn('flex items-center gap-1 text-sm font-medium', trendColors[trend])}>
                {TrendIcon && <TrendIcon className="h-4 w-4" />}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </Card>
  );
}
