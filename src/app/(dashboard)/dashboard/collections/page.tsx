'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { getCollections } from '@/lib/actions/collections';
import { COLLECTIONS, PAYMENT_MODES } from '@/lib/constants';
import { formatCurrency, formatDate, getPaymentModeLabel } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/moon/empty-state';
import { Plus, Search, Filter, ArrowDownLeft, Eye, Receipt, FileDown, Layers, LayoutGrid } from 'lucide-react';
import type { CollectionTransaction } from '@/types';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  useEffect(() => {
    // Initial fetch via Server Action
    getCollections().then((res) => {
      if (res.success && res.data) {
        setCollections(res.data as CollectionTransaction[]);
      }
      setLoading(false);
    });

    try {
      const q = query(
        collection(db, COLLECTIONS.COLLECTION_TRANSACTIONS),
        orderBy('createdAt', 'desc')
      );

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list: CollectionTransaction[] = [];
          snapshot.forEach((doc) => {
            list.push({ ...doc.data(), id: doc.id } as CollectionTransaction);
          });
          setCollections(list);
          setLoading(false);
        },
        (error) => {
          console.warn('Realtime collection listener error (using server action data):', error);
          setLoading(false);
        }
      );

      return () => unsub();
    } catch {
      // Ignore client listener error
    }
  }, []);

  const filteredCollections = collections.filter((c) => {
    const matchesSearch =
      c.contributorName.toLowerCase().includes(search.toLowerCase()) ||
      c.houseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      c.note.toLowerCase().includes(search.toLowerCase());

    const matchesMode = selectedMode === 'all' || c.paymentMode === selectedMode;

    return matchesSearch && matchesMode;
  });

  const totalCollected = filteredCollections
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-money-in mb-1">
            <ArrowDownLeft className="w-3.5 h-3.5" /> Money Inflow Module
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Chanda Collections
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Total Valid Filtered: <span className="font-bold text-money-in">{formatCurrency(totalCollected)}</span> ({filteredCollections.length} entries)
          </p>
        </div>

        <Link href="/dashboard/collections/new">
          <Button className="bg-money-in hover:bg-money-in/90 text-night-deep font-bold shadow-lg glow-money-in h-11 px-5 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1.5" /> + New Collection Entry
          </Button>
        </Link>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by contributor name, house no, COL ID, or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card/60 border-border/50"
          />
        </div>

        {/* Payment mode filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Button
            size="sm"
            variant={selectedMode === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedMode('all')}
            className={`text-xs h-9 ${selectedMode === 'all' ? 'bg-gold text-night-deep font-bold' : ''}`}
          >
            All Modes
          </Button>
          {PAYMENT_MODES.map((mode) => (
            <Button
              key={mode.value}
              size="sm"
              variant={selectedMode === mode.value ? 'default' : 'outline'}
              onClick={() => setSelectedMode(mode.value)}
              className={`text-xs h-9 ${selectedMode === mode.value ? 'bg-gold text-night-deep font-bold' : ''}`}
            >
              {mode.label}
            </Button>
          ))}
        </div>

        {/* View toggle */}
        <div className="hidden md:flex items-center gap-1 border border-border/40 rounded-lg p-1 bg-card/40">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-md ${viewMode === 'cards' ? 'bg-gold/20 text-gold' : 'text-muted-foreground'}`}
            title="Card View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-gold/20 text-gold' : 'text-muted-foreground'}`}
            title="Table View"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {filteredCollections.length === 0 ? (
        <EmptyState
          icon="🌙"
          title="No contributions match your filters"
          description="The Moon Friends collection journey starts with community love. Record your first collection."
          actionLabel="+ Add Collection"
          onAction={() => window.location.href = '/dashboard/collections/new'}
        />
      ) : viewMode === 'cards' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCollections.map((col) => (
            <Card key={col.id} className="glass border-border/40 hover:border-gold/30 transition-all">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider">
                      {col.transactionId}
                    </span>
                    <h3 className="font-bold text-base text-foreground truncate mt-0.5">
                      {col.contributorName}
                    </h3>
                    <p className="text-xs text-muted-foreground">House: #{col.houseNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-money-in">
                      {formatCurrency(col.amount)}
                    </span>
                    <div>
                      <Badge variant="outline" className="text-[10px] uppercase border-border/40 mt-1">
                        {getPaymentModeLabel(col.paymentMode)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Mandatory Note Box */}
                <div className="p-2.5 rounded-lg bg-background/50 border border-border/30 text-xs">
                  <p className="font-medium text-muted-foreground text-[10px] uppercase">Transaction Note:</p>
                  <p className="text-foreground line-clamp-2 mt-0.5">&ldquo;{col.note}&rdquo;</p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/20">
                  <span>Collected by: {col.collectedByName || 'Volunteer'}</span>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/collections/${col.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-gold hover:text-gold-light px-2">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View / Receipt
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-border/40 overflow-hidden bg-card/40 backdrop-blur-xl">
          <Table>
            <TableHeader className="bg-background/60">
              <TableRow>
                <TableHead className="text-xs font-bold text-gold">TX ID</TableHead>
                <TableHead className="text-xs font-bold">Contributor</TableHead>
                <TableHead className="text-xs font-bold">House</TableHead>
                <TableHead className="text-xs font-bold">Amount</TableHead>
                <TableHead className="text-xs font-bold">Mode</TableHead>
                <TableHead className="text-xs font-bold">Mandatory Note</TableHead>
                <TableHead className="text-xs font-bold">Date</TableHead>
                <TableHead className="text-xs font-bold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollections.map((col) => (
                <TableRow key={col.id} className="hover:bg-accent/20">
                  <TableCell className="font-mono text-xs font-semibold text-gold">
                    {col.transactionId}
                  </TableCell>
                  <TableCell className="font-semibold text-sm">
                    {col.contributorName}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    #{col.houseNumber}
                  </TableCell>
                  <TableCell className="font-bold text-sm text-money-in">
                    {formatCurrency(col.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {getPaymentModeLabel(col.paymentMode)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs max-w-xs truncate text-muted-foreground">
                    {col.note}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(col.collectionDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/collections/${col.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-gold">
                        Details →
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
