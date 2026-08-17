'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getContributors } from '@/lib/actions/contributors';
import { formatCurrency, formatPhone } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/moon/empty-state';
import { Users, Search, ChevronRight, Award, Plus } from 'lucide-react';
import type { Contributor } from '@/types';

export default function ContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContributors() {
      const res = await getContributors();
      if (res.success && res.data) {
        setContributors(res.data);
      }
      setLoading(false);
    }
    loadContributors();
  }, []);

  const filtered = contributors.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.houseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const totalContributionsSum = filtered.reduce((s, c) => s + c.totalContribution, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold mb-1">
            <Users className="w-3.5 h-3.5" /> Community Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Devotees & Contributors
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {filtered.length} Families · Total Chanda: <span className="font-bold text-money-in">{formatCurrency(totalContributionsSum)}</span>
          </p>
        </div>

        <Link href="/dashboard/collections/new">
          <Button className="bg-money-in hover:bg-money-in/90 text-night-deep font-bold shadow-lg glow-money-in h-11 px-5">
            <Plus className="w-4 h-4 mr-1.5" /> + New Contribution
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, house no, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card/60 border-border/50"
        />
      </div>

      {/* Contributors Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No contributors found"
          description="Contributors will automatically be created when recording their first collection."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, index) => (
            <Link key={c.id} href={`/dashboard/contributors/${c.id}`}>
              <Card className="glass border-border/40 hover:border-gold/40 transition-all hover:scale-[1.01] cursor-pointer group">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center font-bold text-gold text-sm group-hover:bg-gold group-hover:text-night-deep transition-colors">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-gold transition-colors">
                          {c.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">Door #{c.houseNumber}</p>
                      </div>
                    </div>
                    {index < 3 && (
                      <span title="Top Contributor">
                        <Award className="w-4 h-4 text-gold" />
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                        Total Contribution
                      </span>
                      <span className="text-base font-extrabold text-money-in">
                        {formatCurrency(c.totalContribution)}
                      </span>
                    </div>

                    <div className="text-right flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">
                      <span>{c.contributionCount} {c.contributionCount === 1 ? 'receipt' : 'receipts'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
