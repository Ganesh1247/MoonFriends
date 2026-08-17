'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Moon, Calendar, Users, MapPin, ArrowRight,
  Sparkles, Heart, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME, EVENT_NAME, TAGLINE } from '@/lib/constants';

export default function HomePage() {
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
          {/* Moon icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gold/10 mb-8 glow-gold"
          >
            <Moon className="w-10 h-10 text-gold" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight"
          >
            <span className="text-gradient-gold">🌙 {APP_NAME}</span>
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
            className="text-lg text-muted-foreground mt-6 max-w-xl mx-auto leading-relaxed"
          >
            &ldquo;{TAGLINE}&rdquo;
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <Link href="/schedule">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold-dark text-night-deep font-semibold px-8 h-12 text-base"
              >
                <Calendar className="w-5 h-5 mr-2" />
                View Schedule
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10 px-8 h-12 text-base"
              >
                About the Celebration
                <ArrowRight className="w-4 h-4 ml-2" />
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

      {/* ── Highlights Section ────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-night-sky/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-gradient-festival">
              Celebrate Together
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Join the Moon Friends community in celebrating the grand Vinayaka Chavithi
              festival with devotion, joy, and togetherness.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'Grand Celebrations',
                description:
                  'Beautiful idol installation, daily poojas, bhajans, cultural programs, and a grand visarjan procession.',
                color: 'text-gold',
                bgColor: 'bg-gold/10',
              },
              {
                icon: Users,
                title: 'Community Spirit',
                description:
                  'Bringing neighbours together through devotion, shared meals, cultural activities, and volunteer service.',
                color: 'text-saffron',
                bgColor: 'bg-saffron/10',
              },
              {
                icon: Heart,
                title: 'Transparent Management',
                description:
                  'Every contribution is tracked transparently. Our digital platform ensures accountability and trust.',
                color: 'text-money-in',
                bgColor: 'bg-money-in/10',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
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
        </div>
      </section>

      {/* ── Event Schedule Preview ────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">🪔 Festival Highlights</h2>
            <p className="text-muted-foreground mt-3">
              A glimpse of what awaits during the celebration
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              { icon: '🙏', title: 'Ganesh Sthapana', desc: 'Grand installation ceremony' },
              { icon: '🪔', title: 'Daily Pooja & Bhajans', desc: 'Morning and evening aarti' },
              { icon: '🍚', title: 'Annadanam', desc: 'Community feast for all' },
              { icon: '🎭', title: 'Cultural Programs', desc: 'Dance, music, and drama' },
              { icon: '🎮', title: 'Games & Activities', desc: 'Fun for children and families' },
              { icon: '🌊', title: 'Visarjan / Nimajjanam', desc: 'Grand immersion procession' },
            ].map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-card/30 hover:bg-card/60 transition-all"
              >
                <span className="text-2xl">{event.icon}</span>
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.desc}</p>
                </div>
                <Star className="w-4 h-4 text-gold ml-auto opacity-50" />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/schedule">
              <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                View Full Schedule
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
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
