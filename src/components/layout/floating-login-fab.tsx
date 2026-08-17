'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, X } from 'lucide-react';

export function FloatingLoginFab() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after scrolling 300px
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2"
        >
          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="w-7 h-7 rounded-full bg-background/80 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors backdrop-blur-sm shadow"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Login FAB */}
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gold hover:bg-gold-dark text-night-deep font-bold text-sm shadow-2xl glow-gold border border-gold/60 transition-colors"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-night-deep/30 flex-shrink-0">
                <img src="/ganesh-logo.jpg" alt="" className="w-full h-full object-cover" />
              </div>
              <span>Committee Login</span>
              <LogIn className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
