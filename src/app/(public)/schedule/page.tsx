'use client';

import { useEffect, useState } from 'react';
import { getEvents } from '@/lib/actions/events';
import { formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, User, Star, Moon } from 'lucide-react';
import type { EventSchedule } from '@/types';

export default function PublicSchedulePage() {
  const [events, setEvents] = useState<EventSchedule[]>([]);

  useEffect(() => {
    async function load() {
      const res = await getEvents();
      if (res.success && res.data) setEvents(res.data);
    }
    load();
  }, []);

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5" /> 10-Day Festival Calendar
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          🪔 Event & Pooja Schedule
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          Join us daily for divine pooja rituals, maha prasadam, musical bhajans, and celebrations
        </p>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {events.map((ev, index) => (
          <Card key={ev.id} className="glass border-border/40 hover:border-gold/30 transition-all p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <h3 className="font-bold text-lg text-foreground">{ev.name}</h3>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-8">
                  {ev.description || 'Special pooja rituals and community gatherings.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pl-8 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-gold">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(ev.date)} ({ev.startTime} - {ev.endTime})
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {ev.location}
                  </span>
                </div>
              </div>

              <div className="text-right pl-8 sm:pl-0">
                <Badge variant="outline" className="text-xs text-gold border-gold/30">
                  {ev.responsiblePerson}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
