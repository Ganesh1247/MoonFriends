'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/announcements', label: 'Announcements' },
  { href: '/committee', label: 'Committee' },
  { href: '/contact', label: 'Contact' },
];

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300',
      scrolled ? 'glass border-border/40 shadow-lg' : 'bg-transparent border-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setIsOpen(false)}>
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gold/40 group-hover:border-gold transition-colors shadow-md glow-gold">
              <Image
                src="/ganesh-logo.jpg"
                alt="Ganesh"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gradient-gold leading-tight">
                MOON FRIENDS
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
                Vinayaka Chavithi 2026
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/50"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login">
              <Button
                size="sm"
                className="ml-3 bg-gold hover:bg-gold-dark text-night-deep font-semibold"
              >
                Committee Login
              </Button>
            </Link>
          </div>

          {/* Mobile: Login btn + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/login">
              <Button size="sm" className="bg-gold hover:bg-gold-dark text-night-deep font-semibold text-xs px-3 h-8">
                Login
              </Button>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-accent/50 transition-colors"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border/30 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-accent/50 transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
