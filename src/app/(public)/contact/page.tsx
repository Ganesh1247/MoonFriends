'use client';

import { Moon, MapPin, Phone, Mail, Clock, Heart, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { APP_NAME, EVENT_NAME } from '@/lib/constants';

export default function ContactPage() {
  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5" /> Mandap Location & Contact
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Visit Us & Get in Touch
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          We welcome all devotees, families, and neighbours to visit the mandap, offer poojas, and join the daily Annadanam feast.
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-border/40 p-6 space-y-3 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base">Mandap Location</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Moon Friends Central Park Mandap, Main Colony Road, Near Clubhouse
          </p>
        </Card>

        <Card className="glass border-border/40 p-6 space-y-3 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-money-in/10 flex items-center justify-center text-money-in">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base">Helpline & Chanda</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            +91 98765 43210 (President)<br />
            +91 98480 12345 (Treasurer)
          </p>
        </Card>

        <Card className="glass border-border/40 p-6 space-y-3 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-saffron/10 flex items-center justify-center text-saffron">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base">Daily Pooja Timings</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Morning Aarti: 08:30 AM<br />
            Evening Aarti: 07:30 PM<br />
            Maha Annadanam: 12:30 PM
          </p>
        </Card>
      </div>

      {/* Devotional Quote */}
      <div className="p-8 rounded-2xl bg-gradient-hero border border-gold/30 text-center space-y-2 shadow-2xl">
        <h2 className="text-xl font-bold text-gradient-gold">🙏 Ganapati Bappa Morya!</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          May Lord Ganesha bestow good health, wisdom, prosperity, and harmony upon all our families.
        </p>
      </div>
    </div>
  );
}
