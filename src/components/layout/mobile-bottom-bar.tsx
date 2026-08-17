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
  MoreHorizontal,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  UserCheck,
  Package,
  FileBarChart,
  History,
  Settings,
  Bell,
  LogOut,
} from 'lucide-react';

export function MobileBottomBar() {
  const pathname = usePathname();
  const { user, signOut, isAdmin, isTreasurer } = useAuth();

  const mainTabs = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/dashboard/collections', label: 'Collections', icon: ArrowDownLeft },
    { href: '/dashboard/expenses', label: 'Expenses', icon: ArrowUpRight, hide: !isAdmin && !isTreasurer },
    { href: '/dashboard/contributors', label: 'Contributors', icon: Users },
  ].filter((t) => !t.hide);

  const moreTabs = [
    { href: '/dashboard/events', label: 'Events & Schedule', icon: Calendar },
    { href: '/dashboard/volunteers', label: 'Volunteers', icon: UserCheck },
    { href: '/dashboard/members', label: 'Committee Members', icon: Users, hide: !isAdmin },
    { href: '/dashboard/inventory', label: 'Inventory', icon: Package, hide: !isAdmin && !isTreasurer },
    { href: '/dashboard/reports', label: 'Financial Reports', icon: FileBarChart, hide: !isAdmin && !isTreasurer },
    { href: '/dashboard/announcements', label: 'Announcements', icon: Bell },
    { href: '/dashboard/audit', label: 'Audit Trail', icon: History, hide: !isAdmin },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings, hide: !isAdmin },
  ].filter((t) => !t.hide);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around">
      {mainTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-gold font-bold' : 'text-muted-foreground'
            )}
          >
            <Icon className={cn('w-5 h-5 mb-0.5', isActive ? 'text-gold' : 'text-muted-foreground')} />
            <span>{tab.label}</span>
          </Link>
        );
      })}

      {/* More Sheet Trigger */}
      <Sheet>
        <SheetTrigger className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium text-muted-foreground">
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl glass border-t border-gold/20 p-6 max-h-[80vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-sm font-bold text-gradient-gold">
              🌙 Moon Friends Menu
            </SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3">
            {moreTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-card/60 border border-border/30 hover:border-gold/30 text-xs font-medium"
                >
                  <Icon className="w-4 h-4 text-gold" />
                  <span className="truncate">{tab.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Signed in as <span className="font-semibold text-foreground">{user?.displayName}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 text-xs text-destructive hover:underline"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
