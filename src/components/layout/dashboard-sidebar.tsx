'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  Calendar,
  UserCheck,
  Package,
  FileBarChart,
  History,
  Settings,
  Moon,
  LogOut,
  Bell,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, role: 'volunteer' },
  { href: '/dashboard/collections', label: 'Collections', icon: ArrowDownLeft, role: 'volunteer' },
  { href: '/dashboard/expenses', label: 'Expenses', icon: ArrowUpRight, role: 'treasurer' },
  { href: '/dashboard/contributors', label: 'Contributors', icon: Users, role: 'volunteer' },
  { href: '/dashboard/events', label: 'Events & Schedule', icon: Calendar, role: 'volunteer' },
  { href: '/dashboard/volunteers', label: 'Volunteers', icon: UserCheck, role: 'volunteer' },
  { href: '/dashboard/inventory', label: 'Inventory', icon: Package, role: 'treasurer' },
  { href: '/dashboard/reports', label: 'Financial Reports', icon: FileBarChart, role: 'treasurer' },
  { href: '/dashboard/announcements', label: 'Announcements', icon: Bell, role: 'volunteer' },
  { href: '/dashboard/audit', label: 'Audit Trail', icon: History, role: 'admin' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, role: 'admin' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, signOut, isAdmin, isTreasurer } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (item.role === 'admin') return isAdmin;
    if (item.role === 'treasurer') return isAdmin || isTreasurer;
    return true; // volunteer accessible
  });

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border/40 bg-sidebar/90 backdrop-blur-xl h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-border/30 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold/10 glow-gold">
          <Moon className="w-5 h-5 text-gold" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-gradient-gold">MOON FRIENDS</span>
          <span className="text-[10px] text-muted-foreground">Vinayaka Chavithi 2026</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group',
                isActive
                  ? 'bg-gold/15 text-gold font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-colors',
                  isActive ? 'text-gold' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-border/30 bg-background/30">
        <div className="flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold truncate text-foreground">
              {user?.displayName || 'User'}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] px-1.5 py-0 capitalize',
                  isAdmin
                    ? 'border-gold/40 text-gold bg-gold/5'
                    : isTreasurer
                    ? 'border-money-in/40 text-money-in bg-money-in/5'
                    : 'border-blue-400/40 text-blue-400 bg-blue-500/5'
                )}
              >
                {user?.role || 'volunteer'}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            title="Sign Out"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
