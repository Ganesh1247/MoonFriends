'use client';

import { motion } from 'framer-motion';
import { Moon, Heart, Sparkles, Shield, Users, Trophy } from 'lucide-react';
import { APP_NAME, EVENT_NAME } from '@/lib/constants';

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold">
          <Moon className="w-3.5 h-3.5" /> Devotion · Community · Transparency
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          About <span className="text-gradient-gold">🌙 {APP_NAME}</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Celebrating 10 glorious days of {EVENT_NAME} through unity, cultural vibrancy, community service, and complete financial transparency.
        </p>
      </div>

      {/* Story Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-hero border border-gold/20 shadow-2xl relative overflow-hidden space-y-6">
        <div className="pattern-overlay absolute inset-0" />
        <div className="relative z-10 space-y-4 text-foreground/90 leading-relaxed">
          <h2 className="text-2xl font-bold text-gradient-gold">Our Devotional Journey</h2>
          <p>
            The Moon Friends Organizing Committee was founded by a passionate group of colony residents with a singular vision: to bring neighbours, families, elders, and children together in devotion to Lord Ganesha.
          </p>
          <p>
            What began as a humble mandap celebration has grown into one of the colony’s most anticipated annual landmarks — featuring Vedic rituals, daily bhajans, grand Annadanam community meals serving thousands, children’s cultural competitions, and a joyous Shobha Yatra visarjan procession.
          </p>
          <p>
            In 2026, we take a giant leap forward by launching this digital command platform. Every rupee donated by devotees is accounted for and protected in real time, ensuring absolute honesty, trust, and accountability.
          </p>
        </div>
      </div>

      {/* Core Values Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-card/60 border border-border/40 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Pure Devotion</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Strict adherence to traditional Vedic installation rituals, daily archana, morning & evening aarti, and devotional bhajans.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card/60 border border-border/40 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-money-in/10 flex items-center justify-center text-money-in">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Financial Integrity</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every contribution receives an audited receipt. Zero overspending is guaranteed by real-time automated fund limits.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card/60 border border-border/40 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-saffron/10 flex items-center justify-center text-saffron">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Seva & Togetherness</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Maha Annadanam meals, volunteer-driven activities, cultural dances, games, and support for all community members.
          </p>
        </div>
      </div>
    </div>
  );
}
