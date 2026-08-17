'use client';

import { useEffect, useState } from 'react';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '@/lib/actions/announcements';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Bell, Plus, Trash2, Loader2, Sparkles, Megaphone } from 'lucide-react';
import type { Announcement } from '@/types';

export default function AnnouncementsPage() {
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const res = await getAnnouncements();
    if (res.success && res.data) {
      setAnnouncements(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and message content are required');
      return;
    }

    setSaving(true);
    try {
      const res = await createAnnouncement({ title, content });
      if (res.success) {
        toast.success('Announcement broadcasted');
        setModalOpen(false);
        setTitle('');
        setContent('');
        loadData();
      } else {
        toast.error(res.error || 'Failed to post announcement');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error publishing notice');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this announcement?')) {
      const res = await deleteAnnouncement(id);
      if (res.success) {
        toast.success('Announcement removed');
        loadData();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold mb-1">
            <Megaphone className="w-3.5 h-3.5" /> Colony Bulletin & Notice Board
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Festival Announcements
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Public circulars, pooja timings, laddu auction updates, and important notices
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="bg-gold hover:bg-gold-dark text-night-deep font-bold shadow-lg glow-gold h-11 px-5"
        >
          <Plus className="w-4 h-4 mr-1.5" /> + New Announcement
        </Button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <Card key={ann.id} className="glass border-gold/30 hover:border-gold/50 transition-all p-6 shadow-xl relative overflow-hidden">
            <div className="pattern-overlay absolute inset-0" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{ann.title}</h3>
                </div>

                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(ann.id)}
                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed pl-10">
                {ann.content}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/20 pl-10">
                <span>Announced by: <strong className="text-foreground">{ann.createdByName}</strong></span>
                <span>Moon Friends Official Circular</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* New Notice Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass border-gold/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gradient-gold">
              Broadcast Community Announcement
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notice Title *</Label>
              <Input
                placeholder="e.g. 🪔 Annadanam Timings Update"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Announcement Content *</Label>
              <Textarea
                placeholder="Full message for the residents and devotees..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-gold hover:bg-gold-dark text-night-deep font-bold">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Publish Announcement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
