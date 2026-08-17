'use client';

import { useEffect, useState } from 'react';
import { Users, Phone, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getMembers } from '@/lib/actions/members';
import type { CommitteeMember } from '@/lib/actions/members';
import { motion } from 'framer-motion';

export default function CommitteePage() {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMembers().then((res) => {
      if (res.success && res.data) setMembers(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold">
          <Users className="w-3.5 h-3.5" /> Organizing Leadership
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          🙏 Moon Friends Committee
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          Meet the dedicated committee members and volunteers working selflessly to make Vinayaka Chavithi 2026 a grand success.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-card/40 border border-border/30 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && members.length === 0 && (
        <div className="text-center py-20 space-y-3">
          <div className="text-5xl">🌙</div>
          <h3 className="text-lg font-bold text-foreground">Committee details coming soon</h3>
          <p className="text-sm text-muted-foreground">
            The organizing committee will be announced shortly. Check back soon!
          </p>
        </div>
      )}

      {/* Members Grid */}
      {!loading && members.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <Card className="glass border-border/40 hover:border-gold/30 transition-all p-5 space-y-3 h-full">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center font-bold text-lg text-gold glow-gold flex-shrink-0">
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-foreground truncate">{m.name}</h3>
                    <p className="text-xs text-gold font-semibold truncate">{m.role}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground gap-2">
                  {m.phone ? (
                    <span className="flex items-center gap-1 truncate">
                      <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span className="truncate">{m.phone}</span>
                    </span>
                  ) : (
                    <span />
                  )}
                  {m.wing && (
                    <Badge variant="outline" className="text-[10px] uppercase shrink-0">
                      {m.wing} Wing
                    </Badge>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
