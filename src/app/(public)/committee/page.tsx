'use client';

import { Moon, Users, Phone, Award, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const committeeMembers = [
  { name: 'Suresh Varma', role: 'President & Organizing Lead', phone: '+91 98765 43210', wing: 'Executive' },
  { name: 'Ramesh Naidu', role: 'Treasurer & Finance Head', phone: '+91 98480 12345', wing: 'Finance' },
  { name: 'P. Venkat Rao', role: 'Annadanam & Prasadam Lead', phone: '+91 98852 33445', wing: 'Seva' },
  { name: 'K. Satyanarayana', role: 'Pooja & Vedic Rituals Lead', phone: '+91 98490 11223', wing: 'Spiritual' },
  { name: 'Kiran Kumar', role: 'Mandap & Lighting Coordinator', phone: '+91 99887 76655', wing: 'Logistics' },
  { name: 'K. Durga Prasad', role: 'Visarjan & Procession Lead', phone: '+91 99593 44556', wing: 'Procession' },
  { name: 'V. Lakshmi Devi', role: 'Cultural & Women Wing Lead', phone: '+91 94401 22334', wing: 'Cultural' },
  { name: 'Y. Appa Rao', role: 'Audio & Stage Management', phone: '+91 98852 33445', wing: 'Technical' },
];

export default function CommitteePage() {
  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold">
          <Users className="w-3.5 h-3.5" /> Organizing Leadership
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          🌙 Moon Friends Committee
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          Meet the dedicated committee members and volunteers working selflessly to make Vinayaka Chavithi 2026 a grand success.
        </p>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {committeeMembers.map((m) => (
          <Card key={m.name} className="glass border-border/40 hover:border-gold/30 transition-all p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center font-bold text-lg text-gold glow-gold">
                {m.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base text-foreground truncate">{m.name}</h3>
                <p className="text-xs text-gold font-semibold truncate">{m.role}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gold" /> {m.phone}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase">
                {m.wing} Wing
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
