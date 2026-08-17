'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { updateCollection } from '@/lib/actions/collections';
import { COLLECTIONS, PAYMENT_MODES } from '@/lib/constants';
import { formatCurrency, paiseToRupees, getPaymentModeLabel } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Edit3, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import type { CollectionTransaction } from '@/types';

export default function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [original, setOriginal] = useState<CollectionTransaction | null>(null);
  const [contributorName, setContributorName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<string>('cash');
  const [collectionDate, setCollectionDate] = useState('');
  const [collectionTime, setCollectionTime] = useState('');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchCollection() {
      try {
        const docRef = doc(db, COLLECTIONS.COLLECTION_TRANSACTIONS, resolvedParams.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { ...docSnap.data(), id: docSnap.id } as CollectionTransaction;
          setOriginal(data);
          setContributorName(data.contributorName);
          setHouseNumber(data.houseNumber);
          setPhone('9849012345'); // default fallback if unindexed
          setAmount(paiseToRupees(data.amount));
          setPaymentMode(data.paymentMode);
          setCollectionDate(data.collectionDate);
          setCollectionTime(data.collectionTime);
          setNote(data.note);
        } else {
          toast.error('Collection not found');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCollection();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }
    if (!note.trim()) {
      toast.error('Mandatory transaction note is required');
      return;
    }
    if (!reason.trim()) {
      toast.error('Mandatory Reason for Change is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateCollection(resolvedParams.id, {
        contributorName: contributorName.trim(),
        houseNumber: houseNumber.trim(),
        phone: phone.trim() || '9849012345',
        amount: Number(amount),
        paymentMode,
        collectionDate,
        collectionTime,
        note: note.trim(),
        reason: reason.trim(),
      });

      if (res.success) {
        toast.success('Collection updated and audited successfully');
        router.push(`/dashboard/collections/${resolvedParams.id}`);
      } else {
        toast.error(res.error || 'Failed to update collection');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating collection');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!original) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-bold">Transaction Not Found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/collections/${original.id}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-gold">
              {original.transactionId}
            </span>
            <span className="text-xs text-muted-foreground">· Modifying Record</span>
          </div>
          <h1 className="text-xl font-extrabold text-foreground">
            Edit Financial Collection
          </h1>
        </div>
      </div>

      {/* Side-by-Side Comparison & Form */}
      <Card className="glass border-border/50 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-gradient-gold flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-gold" /> Modification with Mandatory Audit Trail
          </CardTitle>
          <CardDescription className="text-xs">
            Financial transparency rule: All edits preserve original values and require an explicit reason.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Side-by-side Original vs New values */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-card/60 border border-border/40">
              {/* Original Snapshot */}
              <div className="space-y-2 text-xs border-b md:border-b-0 md:border-r border-border/30 pb-3 md:pb-0 md:pr-4">
                <span className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider block">
                  Original Stored Values:
                </span>
                <div className="space-y-1 text-muted-foreground font-mono">
                  <p>Amount: <span className="font-bold text-money-in">{formatCurrency(original.amount)}</span></p>
                  <p>Contributor: <span className="text-foreground">{original.contributorName} (#{original.houseNumber})</span></p>
                  <p>Mode: <span className="uppercase text-foreground">{getPaymentModeLabel(original.paymentMode)}</span></p>
                  <p>Original Note: &ldquo;{original.note}&rdquo;</p>
                </div>
              </div>

              {/* Editable New Values */}
              <div className="space-y-3">
                <span className="font-bold text-[11px] text-gold uppercase tracking-wider block">
                  New Values to Apply:
                </span>
                <div className="space-y-1.5">
                  <Label htmlFor="new-amount" className="text-xs font-semibold">New Amount (₹) *</Label>
                  <Input
                    id="new-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="bg-background/80 font-bold text-money-in"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-mode" className="text-xs font-semibold">New Payment Mode *</Label>
                  <select
                    id="new-mode"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full h-9 rounded-md bg-background/80 border border-border/60 text-xs px-3"
                  >
                    {PAYMENT_MODES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contributor Name & House */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contributor" className="text-xs font-semibold">Contributor Name</Label>
                <Input
                  id="contributor"
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  className="bg-background/50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="house" className="text-xs font-semibold">House No</Label>
                <Input
                  id="house"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  className="bg-background/50"
                  required
                />
              </div>
            </div>

            {/* New Note */}
            <div className="space-y-1.5">
              <Label htmlFor="new-note" className="text-xs font-semibold text-gold">Updated Note *</Label>
              <Textarea
                id="new-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="bg-background/50 text-xs"
                required
              />
            </div>

            {/* MANDATORY Reason for Change */}
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-2">
              <Label htmlFor="reason" className="text-xs font-bold text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                MANDATORY Reason for Change (Audit Requirement) *
              </Label>
              <p className="text-[11px] text-muted-foreground">
                State why this transaction amount, mode, or details are being modified. This will be permanently recorded in the audit log.
              </p>
              <Textarea
                id="reason"
                placeholder="e.g. Corrected typo in amount from ₹1000 to ₹1500 after verifying with bank statement..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="bg-background/80 border-destructive/40 text-xs"
                required
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Link href={`/dashboard/collections/${original.id}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting || !reason.trim()}
                className="flex-1 bg-gold hover:bg-gold-dark text-night-deep font-bold"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save & Audit Changes
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
