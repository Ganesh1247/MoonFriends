'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCollectionById, cancelCollection } from '@/lib/actions/collections';
import { COLLECTIONS } from '@/lib/constants';
import { formatCurrency, formatDate, getPaymentModeLabel } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Moon, ArrowLeft, Printer, Share2, Edit3, Trash2,
  CheckCircle2, AlertTriangle, Loader2, Sparkles, Building2
} from 'lucide-react';
import type { CollectionTransaction } from '@/types';

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAdmin, isTreasurer } = useAuth();

  const [collection, setCollection] = useState<CollectionTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function fetchCollection() {
      try {
        const res = await getCollectionById(resolvedParams.id);
        if (res.success && res.data) {
          setCollection(res.data as CollectionTransaction);
        } else {
          toast.error(res.error || 'Collection not found');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load collection');
      } finally {
        setLoading(false);
      }
    }

    fetchCollection();
  }, [resolvedParams.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share && collection) {
      try {
        await navigator.share({
          title: `Moon Friends Chanda Receipt ${collection.transactionId}`,
          text: `Chanda receipt of ${formatCurrency(collection.amount)} received from ${collection.contributorName} for Vinayaka Chavithi 2026.`,
          url: window.location.href,
        });
      } catch (err) {
        // Share cancelled or unsupported
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Receipt link copied to clipboard!');
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please enter a cancellation reason');
      return;
    }

    setCancelling(true);
    try {
      const res = await cancelCollection(resolvedParams.id, cancelReason.trim());
      if (res.success) {
        toast.success('Transaction cancelled and audited');
        setCancelModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to cancel transaction');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error cancelling transaction');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-20 space-y-3">
        <h2 className="text-xl font-bold">Collection Not Found</h2>
        <Link href="/dashboard/collections">
          <Button variant="outline">Back to Collections</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/collections">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-gold">
                {collection.transactionId}
              </span>
              <Badge
                variant={collection.status === 'active' ? 'default' : 'destructive'}
                className="text-[10px] capitalize"
              >
                {collection.status}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Contribution Details & Official Receipt
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="border-border/60">
            <Printer className="w-4 h-4 mr-1.5" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="border-border/60">
            <Share2 className="w-4 h-4 mr-1.5" /> Share
          </Button>

          {(isAdmin || isTreasurer) && collection.status === 'active' && (
            <Link href={`/dashboard/collections/${collection.id}/edit`}>
              <Button size="sm" className="bg-gold hover:bg-gold-dark text-night-deep font-bold">
                <Edit3 className="w-4 h-4 mr-1.5" /> Edit
              </Button>
            </Link>
          )}

          {isAdmin && collection.status === 'active' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Cancel TX
            </Button>
          )}
        </div>
      </div>

      {/* ── Official Printable Chanda Receipt Card ──────────────── */}
      <Card className="glass border-gold/30 shadow-2xl p-6 sm:p-8 relative overflow-hidden bg-card/90">
        {/* Subtle Watermark */}
        <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
          <Moon className="w-64 h-64 text-gold" />
        </div>

        <CardContent className="p-0 space-y-6">
          {/* Receipt Header */}
          <div className="text-center border-b border-gold/20 pb-6 space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <Moon className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-extrabold tracking-tight text-gradient-gold">
                MOON FRIENDS
              </h2>
            </div>
            <p className="text-sm font-semibold text-saffron">
              🪔 VINAYAKA CHAVITHI 2026 CELEBRATIONS
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest pt-1">
              Official Community Chanda Receipt
            </p>
          </div>

          {/* Receipt Core Fields Grid */}
          <div className="grid grid-cols-2 gap-4 py-2 text-sm">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                Receipt / Transaction ID
              </span>
              <span className="font-mono font-bold text-base text-gold">
                {collection.transactionId}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                Date & Time
              </span>
              <span className="font-semibold">
                {formatDate(collection.collectionDate)} at {collection.collectionTime}
              </span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                Received With Thanks From
              </span>
              <span className="font-bold text-lg text-foreground">
                {collection.contributorName}
              </span>
              <p className="text-xs text-muted-foreground">Door/House No: #{collection.houseNumber}</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                Payment Mode
              </span>
              <span className="font-bold uppercase text-foreground">
                {getPaymentModeLabel(collection.paymentMode)}
              </span>
            </div>
          </div>

          {/* Hero Amount Highlight Box */}
          <div className="p-4 rounded-xl bg-money-in-bg/60 border border-money-in/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-money-in block">
                Amount Received
              </span>
              <span className="text-3xl font-extrabold text-money-in">
                {formatCurrency(collection.amount)}
              </span>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 text-money-in ml-auto mb-1" />
              <span>Valid Event Fund</span>
            </div>
          </div>

          {/* Mandatory Note Display */}
          <div className="p-4 rounded-xl bg-background/60 border border-border/40 space-y-1">
            <span className="text-xs font-bold text-gold uppercase tracking-wider block">
              Mandatory Note / Devotional Purpose
            </span>
            <p className="text-sm italic text-foreground leading-relaxed">
              &ldquo;{collection.note}&rdquo;
            </p>
          </div>

          {/* Receipt Footer */}
          <div className="pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div>
              <p>Collected by: <span className="font-semibold text-foreground">{collection.collectedByName || 'Authorized Volunteer'}</span></p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Moon Friends Organizing Committee</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-gold font-semibold">🙏 Thank you for supporting the celebration!</p>
              <p className="text-[10px] text-muted-foreground">Ganapati Bappa Morya!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Transaction Modal (Soft Delete with Audit) */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="glass border-destructive/40 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Cancel Transaction
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This action will soft-delete the transaction and recalculate the available balance. A mandatory reason is required for the audit trail.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="p-3 rounded-lg bg-card/80 text-xs space-y-1 font-mono">
              <div>Transaction: <span className="font-bold text-gold">{collection.transactionId}</span></div>
              <div>Contributor: {collection.contributorName}</div>
              <div>Amount: <span className="text-money-in font-bold">{formatCurrency(collection.amount)}</span></div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cancel-reason" className="text-xs font-bold text-foreground">
                Mandatory Reason for Cancellation *
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="State the explicit reason (e.g. Duplicate entry by volunteer, Cheque bounced, etc.)..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="bg-background/50 border-destructive/40 text-xs"
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Back
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={cancelling || !cancelReason.trim()}
              onClick={handleCancel}
            >
              {cancelling ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
