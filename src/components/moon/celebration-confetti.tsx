'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

const FESTIVAL_COLORS = [
  '#D4A843', '#E8C76B', '#FF6B2B', '#FF8A55',
  '#22C55E', '#7B2D3A', '#8B5CF6', '#F59E0B',
];

interface CelebrationConfettiProps {
  active: boolean;
  duration?: number;
  onComplete?: () => void;
}

export function CelebrationConfetti({
  active,
  duration = 3000,
  onComplete,
}: CelebrationConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const generateConfetti = useCallback(() => {
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 30; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.8,
        color: FESTIVAL_COLORS[Math.floor(Math.random() * FESTIVAL_COLORS.length)],
        delay: Math.random() * 0.5,
      });
    }
    return newPieces;
  }, []);

  useEffect(() => {
    if (active) {
      // Check for reduced motion
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (prefersReducedMotion) {
        onComplete?.();
        return;
      }

      setPieces(generateConfetti());

      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setPieces([]);
    }
  }, [active, duration, onComplete, generateConfetti]);

  return (
    <AnimatePresence>
      {pieces.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: `${piece.x}vw`,
                y: `${piece.y}vh`,
                rotate: 0,
                scale: piece.scale,
                opacity: 1,
              }}
              animate={{
                y: '110vh',
                rotate: piece.rotation + 720,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: piece.delay,
                ease: 'easeIn',
              }}
              exit={{ opacity: 0 }}
              className="absolute"
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
