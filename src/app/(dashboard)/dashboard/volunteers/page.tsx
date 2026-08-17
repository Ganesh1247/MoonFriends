'use client';

import { useEffect, useState } from 'react';
import { getVolunteers, createVolunteer, deleteVolunteer } from '@/lib/actions/volunteers';
import { getEvents } from '@/lib/actions/events';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { UserCheck, Plus, Phone, Calendar, Trash2, Loader2, Award } from 'lucide-react';
import type { Volunteer, EventSchedule } from '@/types';

export default function VolunteersPage() {
  const { isAdmin } = useAuth();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [events, setEvents] = useState<EventSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [responsibility, setResponsibility] = useState('');
  const [assignedEventId, setAssignedEventId] = useState('');
  const [availabilityStart, setAvailabilityStart] = useState('2026-08-25');
  const [availabilityEnd, setAvailabilityEnd] = useState('2026-09-06');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const [vRes, eRes] = await Promise.all([getVolunteers(), getEvents()]);
    if (vRes.success && vRes.data) setVolunteers(vRes.data);
    if (eRes.success && eRes.data) setEvents(eRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !responsibility.trim()) {
      toast.error('Name, phone, and responsibility are required');
      return;
    }

    setSaving(true);
    try {
      const res = await createVolunteer({
        name: name.trim(),
        phone: phone.trim(),
        responsibility: responsibility.trim(),
        assignedEventId: assignedEventId || undefined,
        availabilityStart,
        availabilityEnd,
        notes: notes.trim(),
      });

      if (res.success) {
        toast.success('Volunteer registered successfully');
        setModalOpen(false);
        setName('');
        setPhone('');
        setResponsibility('');
        setNotes('');
        loadData();
      } else {
        toast.error(res.error || 'Failed to add volunteer');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error adding volunteer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove volunteer from registry?')) {
      const res = await deleteVolunteer(id);
      if (res.success) {
        toast.success('Volunteer removed');
        loadData();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 mb-1">
            <UserCheck className="w-3.5 h-3.5" /> Seva & Volunteer Wing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Festival Volunteers
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {volunteers.length} Dedicated volunteers managing pooja, food, procession, and mandap logistics
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-gold hover:bg-gold-dark text-night-deep font-bold shadow-lg glow-gold h-11 px-5"
          >
            <Plus className="w-4 h-4 mr-1.5" /> + Register Volunteer
          </Button>
        )}
      </div>

      {/* Volunteer Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {volunteers.map((v) => (
          <Card key={v.id} className="glass border-border/40 hover:border-gold/30 transition-all p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center font-bold text-lg text-blue-400">
                  {v.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">{v.name}</h3>
                  <p className="text-xs font-semibold text-gold mt-0.5">{v.responsibility}</p>
                </div>
              </div>

              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(v.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="p-3 rounded-xl bg-card/60 border border-border/30 space-y-1.5 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gold" /> {v.phone}
              </p>
              <p className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gold" /> Available: {formatDate(v.availabilityStart)} - {formatDate(v.availabilityEnd)}
              </p>
              {v.assignedEventName && (
                <p className="flex items-center gap-1.5 pt-1 text-foreground font-medium border-t border-border/20">
                  <Award className="w-3.5 h-3.5 text-saffron" /> Assigned: {v.assignedEventName}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Register Volunteer Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass border-gold/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gradient-gold">
              Register Community Volunteer
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Volunteer Full Name *</Label>
              <Input
                placeholder="e.g. Prasad Reddy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone Number *</Label>
                <Input
                  placeholder="9849012345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Lead Responsibility *</Label>
                <Input
                  placeholder="e.g. Annadanam Coordinator"
                  value={responsibility}
                  onChange={(e) => setResponsibility(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assign to Event</Label>
              <select
                value={assignedEventId}
                onChange={(e) => setAssignedEventId(e.target.value)}
                className="w-full h-9 rounded-md bg-background/80 border border-border/60 text-xs px-3"
              >
                <option value="">General Volunteer Duty</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Available From</Label>
                <Input type="date" value={availabilityStart} onChange={(e) => setAvailabilityStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Available To</Label>
                <Input type="date" value={availabilityEnd} onChange={(e) => setAvailabilityEnd(e.target.value)} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-gold hover:bg-gold-dark text-night-deep font-bold">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Register Volunteer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
