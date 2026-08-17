'use client';

import { motion } from 'framer-motion';
import { useCountUp } from '@/hooks/use-debounce';
import { formatCurrency } from '@/lib/utils';

interface MoonFundOrbProps {
  totalCollections: number; // paise
  totalExpenses: number; // paise
  availableBalance: number; // paise
}

export function MoonFundOrb({
  totalCollections,
  totalExpenses,
  availableBalance,
}: MoonFundOrbProps) {
  const total = totalCollections || 1; // prevent division by zero
  const spentPercentage = (totalExpenses / total) * 100;
  const availablePercentage = (availableBalance / total) * 100;

  // SVG parameters
  const size = 280;
  const center = size / 2;
  const radius = 110;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  const spentDash = (spentPercentage / 100) * circumference;
  const availableDash = (availablePercentage / 100) * circumference;

  const animatedCollections = useCountUp(totalCollections);
  const animatedExpenses = useCountUp(totalExpenses);
  const animatedBalance = useCountUp(availableBalance);

  return (
    <div className="relative flex flex-col items-center">
      {/* Glow backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(212, 168, 67, 0.08)"
          strokeWidth={strokeWidth}
        />

        {/* Available balance arc (gold) */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - availableDash }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />

        {/* Spent arc (saffron/red) */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#spentGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - spentDash}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference - spentDash,
          }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.6 }}
          style={{
            transform: `rotate(${(availablePercentage / 100) * 360}deg)`,
            transformOrigin: 'center',
          }}
        />

        {/* Inner glow circle */}
        <circle
          cx={center}
          cy={center}
          r={radius - strokeWidth}
          fill="rgba(212, 168, 67, 0.03)"
        />

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A843" />
            <stop offset="100%" stopColor="#E8C76B" />
          </linearGradient>
          <linearGradient id="spentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B2B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          Available
        </span>
        <motion.span
          className="text-3xl font-bold text-gradient-gold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {formatCurrency(animatedBalance)}
        </motion.span>
        <span className="text-xs text-muted-foreground mt-1">Event Fund</span>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-gold" />
          <div className="text-sm">
            <span className="text-muted-foreground">Collected</span>
            <p className="font-semibold text-foreground">
              {formatCurrency(animatedCollections)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-saffron" />
          <div className="text-sm">
            <span className="text-muted-foreground">Spent</span>
            <p className="font-semibold text-foreground">
              {formatCurrency(animatedExpenses)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
