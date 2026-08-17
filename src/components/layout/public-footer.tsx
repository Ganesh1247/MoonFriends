import Link from 'next/link';
import { Moon, Heart } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="border-t border-border/30 bg-night-deep/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gold/10">
                <Moon className="w-5 h-5 text-gold" />
              </div>
              <div>
                <span className="text-sm font-bold text-gradient-gold">MOON FRIENDS</span>
                <p className="text-[10px] text-muted-foreground">Vinayaka Chavithi 2026</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Together in devotion. Together as a community. Celebrating the
              auspicious festival of Vinayaka Chavithi with love and togetherness.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/schedule', label: 'Event Schedule' },
                { href: '/announcements', label: 'Announcements' },
                { href: '/committee', label: 'Committee' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
              Contact
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Moon Friends Community</p>
              <p>Vinayaka Chavithi 2026</p>
              <p className="text-gold">🪔 Ganapati Bappa Morya!</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © 2026 Moon Friends. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-saffron" /> by the community
          </p>
        </div>
      </div>
    </footer>
  );
}
