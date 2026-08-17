'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Calendar, Users, MapPin, ArrowRight,
  Sparkles, Heart, Star, Bell, Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { APP_NAME, EVENT_NAME, TAGLINE } from '@/lib/constants';
import { getAnnouncements } from '@/lib/actions/announcements';
import { getEvents } from '@/lib/actions/events';
import { formatDate } from '@/lib/utils';
import type { Announcement, EventSchedule } from '@/types';

export default function HomePage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<EventSchedule[]>([]);

  useEffect(() => {
    getAnnouncements().then((res) => {
      if (res.success && res.data) setAnnouncements(res.data.slice(0, 3));
    });
    getEvents().then((res) => {
      if (res.success && res.data) setEvents(res.data.slice(0, 5));
    });
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-hero">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Moon glow */}
          <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-gold/5 blur-[100px]" />
          <div className="absolute bottom-32 left-[5%] w-48 h-48 rounded-full bg-saffron/5 blur-[80px]" />

          {/* Stars */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold/30"
              style={{
                top: `${Math.random() * 80}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          {/* Ganesh idol icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-6 border-4 border-gold/40 shadow-2xl glow-gold"
          >
            <Image
              src="/ganesh-logo.jpg"
              alt="Lord Ganesha"
              width={112}
              height={112}
              className="w-full h-full object-cover"
              priority
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight"
          >
            <span className="text-gradient-gold">🙏 {APP_NAME}</span>
          </motion.h1>

          {/* Event name */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl sm:text-2xl md:text-3xl font-semibold text-saffron mt-4"
          >
            🪔 {EVENT_NAME}
          </motion.h2>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl mx-auto"
          >
            {TAGLINE}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
          >
            <Link href="/schedule">
              <Button size="lg" className="bg-gold hover:bg-gold-dark text-night-deep font-semibold shadow-lg glow-gold px-6">
                <Calendar className="w-4 h-4 mr-2" />
                View Event Schedule
              </Button>
            </Link>
            <Link href="/announcements">
              <Button size="lg" variant="outline" className="border-border/60 hover:bg-accent/50 px-6">
                <Megaphone className="w-4 h-4 mr-2 text-gold" />
                Latest Announcements
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-gold/30 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-gold"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ── Live Announcements Notice Section ────────────────────── */}
      {announcements.length > 0 && (
        <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold animate-ping" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gradient-gold">
                📢 Latest Colony Announcements
              </h2>
            </div>
            <Link href="/announcements" className="text-xs text-gold hover:underline flex items-center gap-1 font-semibold">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {announcements.map((ann) => (
              <Card key={ann.id} className="glass border-gold/30 hover:border-gold/60 p-5 space-y-3 shadow-lg transition-all">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gold shrink-0" />
                  <h3 className="font-bold text-sm text-foreground line-clamp-1">{ann.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {ann.content}
                </p>
                <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/20">
                  By {ann.createdByName}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── About Preview Section ─────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            About Our Celebration
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto text-sm">
            For years, Moon Friends has been uniting our community to celebrate
            Vinayaka Chavithi with unparalleled devotion, cultural richness, and joy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            {
              icon: Sparkles,
              title: 'Sacred Rituals',
              description: 'Daily poojas, aartis, and traditional Vedic chants performed with utmost reverence.',
              color: 'text-gold',
              bgColor: 'bg-gold/10',
            },
            {
              icon: Users,
              title: 'Community Spirit',
              description: 'Bringing families together through cultural programs, feasts, and shared devotion.',
              color: 'text-saffron',
              bgColor: 'bg-saffron/10',
            },
            {
              icon: Heart,
              title: 'Seva & Service',
              description: 'Dedicated volunteers working tirelessly to make every aspect of the celebration special.',
              color: 'text-rose-400',
              bgColor: 'bg-rose-400/10',
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative p-6 rounded-2xl border border-border/30 bg-card/50 hover:border-primary/20 transition-all duration-300 group"
            >
              <div className="pattern-overlay absolute inset-0 rounded-2xl" />
              <div className="relative">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${item.bgColor} mb-4 group-hover:scale-110 transition-transform`}
                >
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Event Schedule Timeline ───────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold">🪔 Festival Schedule & Highlights</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Live schedule of rituals, maha prasadam, and cultural events
          </p>
        </div>

        <div className="space-y-3">
          {events.length > 0 ? (
            events.map((ev, index) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -15 : 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/30 bg-card/40 hover:bg-card/70 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h3 className="font-bold text-base text-foreground">{ev.name}</h3>
                  </div>
                  {ev.description && (
                    <p className="text-xs text-muted-foreground pl-7">{ev.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-gold font-semibold sm:text-right shrink-0 pl-7 sm:pl-0">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(ev.date)}
                  </span>
                  <span className="text-muted-foreground">({ev.startTime} - {ev.endTime})</span>
                </div>
              </motion.div>
            ))
          ) : (
            [
              { icon: '🙏', title: 'Ganesh Sthapana', desc: 'Grand installation ceremony' },
              { icon: '🪔', title: 'Daily Pooja & Bhajans', desc: 'Morning and evening aarti' },
              { icon: '🍚', title: 'Annadanam', desc: 'Community feast for all' },
              { icon: '🌊', title: 'Visarjan / Nimajjanam', desc: 'Grand immersion procession' },
            ].map((event) => (
              <div
                key={event.title}
                className="flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-card/30"
              >
                <span className="text-2xl">{event.icon}</span>
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.desc}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-8">
          <Link href="/schedule">
            <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
              View Full 10-Day Calendar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gold/5 blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold text-gradient-gold">
            🙏 Ganapati Bappa Morya!
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Let us come together as a community to celebrate this auspicious
            festival with devotion, joy, and the spirit of togetherness.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link href="/contact">
              <Button size="lg" className="bg-gold hover:bg-gold-dark text-night-deep font-semibold px-8">
                <MapPin className="w-5 h-5 mr-2" />
                Get In Touch
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
