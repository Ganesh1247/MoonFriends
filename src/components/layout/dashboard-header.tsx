'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { Plus, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function DashboardHeader() {
  const { user, isAdmin, isTreasurer } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 md:px-6 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      {/* Left: Mobile Brand / Page Title */}
      <div className="flex items-center gap-3 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gold/40 shadow-sm">
            <Image
              src="/ganesh-logo.jpg"
              alt="Ganesh"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-xs text-gradient-gold">MOON FRIENDS</span>
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Community Hub:</span>
        <Badge variant="outline" className="border-gold/30 text-gold text-xs">
          Vinayaka Chavithi 2026
        </Badge>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        <Link href="/" target="_blank">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            <Globe className="w-3.5 h-3.5 mr-1" /> Public Site
          </Button>
        </Link>

        {/* Quick Add Collection */}
        <Link href="/dashboard/collections/new">
          <Button
            size="sm"
            className="bg-money-in/20 hover:bg-money-in/30 text-money-in border border-money-in/40 text-xs font-semibold h-9"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Collection
          </Button>
        </Link>

        {/* Quick Add Expense (Treasurer/Admin only) */}
        {(isAdmin || isTreasurer) && (
          <Link href="/dashboard/expenses/new">
            <Button
              size="sm"
              className="bg-saffron/20 hover:bg-saffron/30 text-saffron border border-saffron/40 text-xs font-semibold h-9"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Expense
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
