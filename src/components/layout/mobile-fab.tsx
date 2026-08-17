'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export function MobileFAB() {
  const [open, setOpen] = useState(false);
  const { isAdmin, isTreasurer } = useAuth();

  return (
    <div className="md:hidden fixed bottom-18 right-4 z-40 flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            className="flex flex-col items-end gap-2.5 mb-3"
          >
            {/* Add Collection Button */}
            <Link
              href="/dashboard/collections/new"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-money-in text-night-deep font-bold text-xs shadow-lg glow-money-in active:scale-95 transition-transform"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>+ Add Collection</span>
            </Link>

            {/* Add Expense Button (Admin/Treasurer only) */}
            {(isAdmin || isTreasurer) && (
              <Link
                href="/dashboard/expenses/new"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-saffron text-white font-bold text-xs shadow-lg glow-saffron active:scale-95 transition-transform"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>+ Add Expense</span>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Quick financial action"
        className="flex items-center justify-center w-13 h-13 rounded-full bg-gold text-night-deep font-bold shadow-2xl glow-gold active:scale-90 transition-transform"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </motion.div>
      </button>
    </div>
  );
}
