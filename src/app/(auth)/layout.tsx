import { Moon } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-hero p-4 sm:p-6 relative overflow-hidden">
      {/* Glow background effects */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-saffron/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-6 text-center z-10">
        <Link href="/" className="inline-flex items-center gap-2 group mb-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gold/10 group-hover:bg-gold/20 transition-all glow-gold">
            <Moon className="w-6 h-6 text-gold" />
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient-gold">
          🌙 MOON FRIENDS
        </h1>
        <p className="text-xs sm:text-sm text-saffron font-medium mt-1">
          🪔 Vinayaka Chavithi 2026
        </p>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md z-10">{children}</div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-muted-foreground z-10">
        <p>© 2026 Moon Friends Organizing Committee</p>
        <p className="mt-1 text-gold/80">Together in devotion. Together as a community.</p>
      </div>
    </div>
  );
}
