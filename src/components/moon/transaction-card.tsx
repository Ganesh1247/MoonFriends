'use client';

import { motion } from 'framer-motion';
import { cn, formatCurrency, formatDate, formatRelativeTime, getInitials, getPaymentModeLabel } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Banknote, Smartphone, Building2, FileText, Wallet,
  ArrowDownLeft, ArrowUpRight,
} from 'lucide-react';
import type { PaymentMode } from '@/types';

interface TransactionCardProps {
  type: 'collection' | 'expense';
  transactionId: string;
  name: string; // contributor name or paid to
  amount: number; // paise
  paymentMode: PaymentMode;
  note: string;
  date: string;
  createdAt: Date;
  status: string;
  categoryName?: string;
  houseNumber?: string;
  onClick?: () => void;
  index?: number;
}

const paymentIcons: Record<PaymentMode, typeof Banknote> = {
  cash: Banknote,
  upi: Smartphone,
  bank_transfer: Building2,
  cheque: FileText,
  other: Wallet,
};

export function TransactionCard({
  type,
  transactionId,
  name,
  amount,
  paymentMode,
  note,
  date,
  createdAt,
  status,
  categoryName,
  houseNumber,
  onClick,
  index = 0,
}: TransactionCardProps) {
  const isCollection = type === 'collection';
  const PaymentIcon = paymentIcons[paymentMode] || Wallet;
  const isCancelled = status === 'cancelled';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        'group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer',
        'hover:border-primary/20 hover:bg-accent/30',
        isCancelled
          ? 'opacity-60 border-border/30'
          : isCollection
            ? 'border-money-in/10 bg-money-in-bg/30'
            : 'border-money-out/10 bg-money-out-bg/30'
      )}
    >
      {/* Type indicator */}
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-xl shrink-0',
          isCollection ? 'bg-money-in/15' : 'bg-money-out/15'
        )}
      >
        {isCollection ? (
          <ArrowDownLeft className="w-5 h-5 text-money-in" />
        ) : (
          <ArrowUpRight className="w-5 h-5 text-money-out" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate">{name}</span>
              {houseNumber && (
                <span className="text-xs text-muted-foreground">#{houseNumber}</span>
              )}
            </div>
            {categoryName && (
              <span className="text-xs text-muted-foreground">{categoryName}</span>
            )}
          </div>
          <div className="text-right shrink-0">
            <span
              className={cn(
                'font-bold text-sm',
                isCancelled
                  ? 'text-muted-foreground line-through'
                  : isCollection
                    ? 'text-money-in'
                    : 'text-money-out'
              )}
            >
              {isCollection ? '+' : '−'}{formatCurrency(amount)}
            </span>
          </div>
        </div>

        {/* Note */}
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
          &ldquo;{note}&rdquo;
        </p>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <PaymentIcon className="w-3 h-3" />
            <span>{getPaymentModeLabel(paymentMode)}</span>
          </div>
          <span className="opacity-30">·</span>
          <span>{transactionId}</span>
          <span className="opacity-30">·</span>
          <span>{formatRelativeTime(createdAt)}</span>
          {isCancelled && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              Cancelled
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}
