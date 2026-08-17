'use client';

import { useEffect, useState } from 'react';
import { getEvents, createEvent, deleteEvent } from '@/lib/actions/events';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Calendar, Plus, MapPin, Clock, User, Trash2, Loader2, Sparkles } from 'lucide-react';
import type { EventSchedule } from '@/types';

export default function EventsPage() {
  const { isAdmin, isTreasurer } = useAuth();
  const [events, setEvents] = useState<EventSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('2026-08-27');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [location, setLocation] = useState('Main Mandap, Central Park');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadEvents = async () => {
    const res = await getEvents();
    if (res.success && res.data) {
      setEvents(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !responsiblePerson.trim()) {
      toast.error('Event name and responsible person are required');
      return;
    }

    setSaving(true);
    try {
      const res = await createEvent({
        name: name.trim(),
        date,
        startTime,
        endTime,
        location: location.trim(),
        responsiblePerson: responsiblePerson.trim(),
        description: description.trim(),
        status: 'upcoming',
      });

      if (res.success) {
        toast.success('Event scheduled successfully');
        setModalOpen(false);
        setName('');
        setResponsiblePerson('');
        setDescription('');
        loadEvents();
      } else {
        toast.error(res.error || 'Failed to create event');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error scheduling event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const res = await deleteEvent(id);
      if (res.success) {
        toast.success('Event removed');
        loadEvents();
      } else {
        toast.error(res.error || 'Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold mb-1">
            <Calendar className="w-3.5 h-3.5" /> Festival Program Schedule
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Vinayaka Chavithi 10-Day Timeline
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Complete sequence of pooja rituals, annadanam, cultural programs, and visarjan
          </p>
        </div>

        {(isAdmin || isTreasurer) && (
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-gold hover:bg-gold-dark text-night-deep font-bold shadow-lg glow-gold h-11 px-5"
          >
            <Plus className="w-4 h-4 mr-1.5" /> + Schedule New Event
          </Button>
        )}
      </div>

      {/* Timeline view */}
      <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 md:before:left-32 before:w-0.5 before:bg-gold/20 before:h-full">
        {events.map((ev) => (
          <div key={ev.id} className="relative flex flex-col md:flex-row items-start gap-4 md:gap-8 pl-10 md:pl-0">
            {/* Timeline date marker */}
            <div className="hidden md:flex flex-col items-end w-28 text-right shrink-0 pt-3">
              <span className="text-xs font-bold text-gold">{formatDate(ev.date)}</span>
              <span className="text-[11px] text-muted-foreground">{ev.startTime} - {ev.endTime}</span>
            </div>

            {/* Glowing timeline node */}
            <div className="absolute left-2.5 md:left-30 top-4 w-3.5 h-3.5 rounded-full bg-gold ring-4 ring-gold/20 shrink-0 -translate-x-1/2" />

            {/* Event Card */}
            <Card className="flex-1 glass border-border/40 hover:border-gold/30 transition-all p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground">{ev.name}</h3>
                    <Badge variant="outline" className="text-[10px] text-gold border-gold/30 capitalize">
                      {ev.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                    {ev.description || 'Devotional community gathering and holy ceremonies.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gold" /> {ev.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-gold" /> In-Charge: <strong className="text-foreground">{ev.responsiblePerson}</strong>
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(ev.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass border-gold/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gradient-gold">
              Schedule Festival Event
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Event Name *</Label>
              <Input
                placeholder="e.g. Maha Ganapati Sahasranama Archana"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Start Time</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">End Time</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Responsible In-Charge *</Label>
                <Input
                  placeholder="e.g. Suresh Varma"
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                placeholder="Brief description of the event rituals or food arrangements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-gold hover:bg-gold-dark text-night-deep font-bold">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Save Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
