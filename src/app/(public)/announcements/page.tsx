'use client';

import { useEffect, useState } from 'react';
import { getAnnouncements } from '@/lib/actions/announcements';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Megaphone, Calendar } from 'lucide-react';
import type { Announcement } from '@/types';

export default function PublicAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    async function load() {
      const res = await getAnnouncements();
      if (res.success && res.data) setAnnouncements(res.data);
    }
    load();
  }, []);

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold">
          <Megaphone className="w-3.5 h-3.5" /> Notice Board
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Community Announcements
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          Official circulars, prasadam timings, sloka competition registrations, and event updates
        </p>
      </div>

      {/* List */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <Card key={ann.id} className="glass border-gold/30 p-6 space-y-3 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{ann.title}</h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed pl-10">
              {ann.content}
            </p>

            <div className="pt-3 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground pl-10">
              <span>Published by: <strong className="text-foreground">{ann.createdByName}</strong></span>
              <span>Moon Friends Committee</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
