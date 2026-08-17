'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Users, Phone, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { getMembers, createMember, updateMember, deleteMember } from '@/lib/actions/members';
import type { CommitteeMember } from '@/lib/actions/members';

interface MemberForm {
  name: string;
  role: string;
  phone: string;
  wing: string;
  sortOrder: string;
}

const emptyForm: MemberForm = { name: '', role: '', phone: '', wing: '', sortOrder: '' };

export default function MembersPage() {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CommitteeMember | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await getMembers();
    if (res.success && res.data) setMembers(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (m: CommitteeMember) => {
    setEditing(m);
    setForm({
      name: m.name,
      role: m.role,
      phone: m.phone || '',
      wing: m.wing || '',
      sortOrder: String(m.sortOrder || ''),
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.role.trim()) {
      setError('Name and role are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        phone: form.phone.trim(),
        wing: form.wing.trim(),
        sortOrder: parseInt(form.sortOrder) || 99,
      };

      let res;
      if (editing) {
        res = await updateMember(editing.id, payload);
      } else {
        res = await createMember(payload);
      }

      if (res.success) {
        setModalOpen(false);
        await load();
      } else {
        setError(res.error || 'Failed to save');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this committee member?')) return;
    await deleteMember(id);
    await load();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Committee Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage the organizing committee displayed on the public website
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={openAdd}
            className="bg-gold hover:bg-gold-dark text-night-deep font-bold shadow-lg glow-gold h-11 px-5"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Member
          </Button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-card/40 border border-border/30 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && members.length === 0 && (
        <Card className="glass border-border/40">
          <CardContent className="py-16 text-center space-y-3">
            <div className="text-4xl">🙏</div>
            <p className="font-semibold text-foreground">No committee members yet</p>
            <p className="text-sm text-muted-foreground">
              Add members to display them on the public Committee page
            </p>
            {isAdmin && (
              <Button onClick={openAdd} className="bg-gold hover:bg-gold-dark text-night-deep font-semibold mt-2">
                <Plus className="w-4 h-4 mr-1.5" /> Add First Member
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Grid */}
      {!loading && members.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="glass border-border/40 hover:border-gold/30 transition-all p-5 space-y-3 h-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gold/15 flex items-center justify-center font-bold text-base text-gold glow-gold flex-shrink-0">
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-foreground truncate">{m.name}</h3>
                      <p className="text-xs text-gold font-semibold truncate">{m.role}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-gold"
                        onClick={() => openEdit(m)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(m.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground gap-2">
                  {m.phone ? (
                    <span className="flex items-center gap-1 truncate">
                      <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span className="truncate">{m.phone}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40 italic">No phone</span>
                  )}
                  {m.wing && (
                    <Badge variant="outline" className="text-[10px] uppercase shrink-0">
                      {m.wing}
                    </Badge>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-card border border-gold/20 rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">
                {editing ? 'Edit Member' : 'Add Committee Member'}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {[
                { key: 'name', label: 'Full Name *', placeholder: 'e.g. Suresh Varma' },
                { key: 'role', label: 'Role / Designation *', placeholder: 'e.g. President & Organizing Lead' },
                { key: 'phone', label: 'Phone Number', placeholder: 'e.g. +91 98765 43210' },
                { key: 'wing', label: 'Wing / Department', placeholder: 'e.g. Executive, Finance, Seva' },
                { key: 'sortOrder', label: 'Display Order', placeholder: '1 = first, 99 = last' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">{label}</label>
                  <input
                    type={key === 'sortOrder' ? 'number' : 'text'}
                    value={(form as any)[key]}
                    onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full h-10 rounded-xl bg-background/60 border border-border/50 focus:border-gold/50 focus:outline-none px-3 text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gold hover:bg-gold-dark text-night-deep font-bold"
              >
                {saving ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-night-deep/30 border-t-night-deep rounded-full animate-spin" />Saving…</span>
                ) : (
                  <span className="flex items-center gap-2"><Save className="w-4 h-4" />{editing ? 'Update' : 'Add Member'}</span>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
