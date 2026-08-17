'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCountUp } from '@/hooks/use-debounce';
import { formatCurrency } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number; // paise for currency, raw number for counts
  isCurrency?: boolean;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: 'default' | 'success' | 'danger' | 'gold';
  delay?: number;
  className?: string;
}

const variantStyles = {
  default: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    glow: '',
  },
  success: {
    iconBg: 'bg-money-in/10',
    iconColor: 'text-money-in',
    glow: 'glow-money-in',
  },
  danger: {
    iconBg: 'bg-money-out/10',
    iconColor: 'text-money-out',
    glow: 'glow-money-out',
  },
  gold: {
    iconBg: 'bg-gold/10',
    iconColor: 'text-gold',
    glow: 'glow-gold',
  },
};

export function StatCard({
  title,
  value,
  isCurrency = true,
  icon: Icon,
  trend,
  variant = 'default',
  delay = 0,
  className,
}: StatCardProps) {
  const animatedValue = useCountUp(value);
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/50 bg-card p-5',
        'hover:border-primary/20 transition-all duration-300',
        styles.glow,
        className
      )}
    >
      {/* Subtle pattern overlay */}
      <div className="pattern-overlay absolute inset-0" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl md:text-3xl font-bold mt-2 tracking-tight">
            {isCurrency ? formatCurrency(animatedValue) : animatedValue.toLocaleString('en-IN')}
          </p>
          {trend && (
            <p
              className={cn(
                'text-xs mt-2 flex items-center gap-1',
                trend.value >= 0 ? 'text-money-in' : 'text-money-out'
              )}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-xl',
            styles.iconBg
          )}
        >
          <Icon className={cn('w-6 h-6', styles.iconColor)} />
        </div>
      </div>
    </motion.div>
  );
}
