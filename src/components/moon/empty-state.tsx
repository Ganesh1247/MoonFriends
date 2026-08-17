'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: string; // Emoji
  lucideIcon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  lucideIcon: LucideIconComponent,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
    >
      {/* Icon/Emoji */}
      {icon && (
        <motion.span
          className="text-5xl mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
        >
          {icon}
        </motion.span>
      )}
      {LucideIconComponent && (
        <motion.div
          className="mb-4 p-4 rounded-2xl bg-primary/10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
        >
          <LucideIconComponent className="w-8 h-8 text-primary" />
        </motion.div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        {description}
      </p>

      {/* Action button */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mt-6 bg-gold hover:bg-gold-dark text-night-deep"
          size="lg"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
