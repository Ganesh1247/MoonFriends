'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MOON_PHASES } from '@/lib/constants';

interface MoonProgressProps {
  currentPhase?: number; // 0-5 index
  className?: string;
}

export function MoonProgress({ currentPhase = 2, className }: MoonProgressProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {MOON_PHASES.map((phase, index) => (
          <div key={phase.label} className="flex flex-col items-center relative">
            {/* Connection line */}
            {index < MOON_PHASES.length - 1 && (
              <div
                className={cn(
                  'absolute top-4 left-1/2 w-full h-0.5',
                  index < currentPhase ? 'bg-gold' : 'bg-border/30'
                )}
                style={{ transform: 'translateX(50%)' }}
              />
            )}

            {/* Moon phase icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              className={cn(
                'relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-lg',
                index <= currentPhase
                  ? 'bg-gold/20 ring-2 ring-gold/40'
                  : 'bg-muted/50'
              )}
            >
              {phase.phase}
            </motion.div>

            {/* Label */}
            <span
              className={cn(
                'text-[10px] mt-1.5 font-medium text-center leading-tight',
                index <= currentPhase ? 'text-gold' : 'text-muted-foreground'
              )}
            >
              {phase.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
