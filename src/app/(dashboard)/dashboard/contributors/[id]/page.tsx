'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getContributorById } from '@/lib/actions/contributors';
import { formatCurrency, formatDate, getPaymentModeLabel } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Phone, Home, Receipt, Loader2, ArrowDownLeft } from 'lucide-react';
import type { Contributor, CollectionTransaction } from '@/types';

export default function ContributorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [transactions, setTransactions] = useState<CollectionTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const res = await getContributorById(resolvedParams.id);
      if (res.success && res.data) {
        setContributor(res.data.contributor);
        setTransactions(res.data.transactions);
      }
      setLoading(false);
    }
    loadProfile();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!contributor) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-bold">Contributor Profile Not Found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/contributors">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <span className="text-xs text-muted-foreground">Devotee Profile</span>
          <h1 className="text-2xl font-extrabold text-foreground">{contributor.name}</h1>
        </div>
      </div>

      {/* Profile Summary Card */}
      <Card className="glass border-gold/30 p-6 shadow-2xl relative overflow-hidden">
        <div className="pattern-overlay absolute inset-0" />
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gold/15 flex items-center justify-center font-bold text-2xl text-gold glow-gold">
              {contributor.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{contributor.name}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Home className="w-3.5 h-3.5 text-gold" /> House: #{contributor.houseNumber}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-gold" /> {contributor.phone}
              </p>
            </div>
          </div>

          <div className="text-center sm:border-x border-border/30 px-4">
            <span className="text-xs text-muted-foreground uppercase tracking-wider block">
              Total Chanda Contribution
            </span>
            <span className="text-3xl font-extrabold text-money-in mt-1 block">
              {formatCurrency(contributor.totalContribution)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-muted-foreground uppercase tracking-wider block">
              Total Transactions
            </span>
            <span className="text-2xl font-bold text-foreground mt-1 block">
              {contributor.contributionCount} {contributor.contributionCount === 1 ? 'Receipt' : 'Receipts'}
            </span>
          </div>
        </div>
      </Card>

      {/* Transaction History Feed */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Receipt className="w-4 h-4 text-gold" /> Complete Contribution History
        </h3>

        {transactions.length === 0 ? (
          <p className="text-xs text-muted-foreground">No recorded transactions.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <Card key={tx.id} className="glass border-border/40 hover:border-gold/30 transition-all p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gold">{tx.transactionId}</span>
                      <Badge variant="outline" className="text-[10px] uppercase">{getPaymentModeLabel(tx.paymentMode)}</Badge>
                      <span className="text-xs text-muted-foreground">· {formatDate(tx.collectionDate)}</span>
                    </div>
                    <p className="text-xs italic text-muted-foreground">&ldquo;{tx.note}&rdquo;</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-lg font-bold text-money-in">
                      +{formatCurrency(tx.amount)}
                    </span>
                    <Link href={`/dashboard/collections/${tx.id}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs border-gold/30 text-gold hover:bg-gold/10">
                        View Receipt →
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
