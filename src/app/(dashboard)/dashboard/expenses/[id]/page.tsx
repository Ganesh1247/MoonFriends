'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getExpenseById, cancelExpense } from '@/lib/actions/expenses';
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
  AlertTriangle, Loader2, Tag
} from 'lucide-react';
import type { ExpenseTransaction } from '@/types';

export default function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAdmin, isTreasurer } = useAuth();

  const [expense, setExpense] = useState<ExpenseTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function fetchExpense() {
      try {
        const res = await getExpenseById(resolvedParams.id);
        if (res.success && res.data) {
          setExpense(res.data as ExpenseTransaction);
        } else {
          toast.error(res.error || 'Expense not found');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load expense');
      } finally {
        setLoading(false);
      }
    }

    fetchExpense();
  }, [resolvedParams.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please enter a cancellation reason');
      return;
    }

    setCancelling(true);
    try {
      const res = await cancelExpense(resolvedParams.id, cancelReason.trim());
      if (res.success) {
        toast.success('Expense cancelled and refunded to available balance');
        setCancelModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to cancel expense');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error cancelling expense');
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

  if (!expense) {
    return (
      <div className="text-center py-20 space-y-3">
        <h2 className="text-xl font-bold">Expense Not Found</h2>
        <Link href="/dashboard/expenses">
          <Button variant="outline">Back to Expenses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/expenses">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-saffron">
                {expense.transactionId}
              </span>
              <Badge
                variant={expense.status === 'active' ? 'default' : 'destructive'}
                className="text-[10px] capitalize"
              >
                {expense.status}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Expense Voucher & Audit Details
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="border-border/60">
            <Printer className="w-4 h-4 mr-1.5" /> Print
          </Button>

          {(isAdmin || isTreasurer) && expense.status === 'active' && (
            <Link href={`/dashboard/expenses/${expense.id}/edit`}>
              <Button size="sm" className="bg-gold hover:bg-gold-dark text-night-deep font-bold">
                <Edit3 className="w-4 h-4 mr-1.5" /> Edit
              </Button>
            </Link>
          )}

          {isAdmin && expense.status === 'active' && (
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

      {/* Expense Voucher Card */}
      <Card className="glass border-saffron/30 shadow-2xl p-6 sm:p-8 relative overflow-hidden bg-card/90">
        <CardContent className="p-0 space-y-6">
          {/* Voucher Header */}
          <div className="text-center border-b border-border/30 pb-6 space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <Moon className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-extrabold tracking-tight text-gradient-gold">
                MOON FRIENDS
              </h2>
            </div>
            <p className="text-sm font-semibold text-saffron">
              🪔 VINAYAKA CHAVITHI 2026 EVENT EXPENSE VOUCHER
            </p>
          </div>

          {/* Core Fields Grid */}
          <div className="grid grid-cols-2 gap-4 py-2 text-sm">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                Voucher / Transaction ID
              </span>
              <span className="font-mono font-bold text-base text-saffron">
                {expense.transactionId}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                Date & Time
              </span>
              <span className="font-semibold">
                {formatDate(expense.expenseDate)} at {expense.expenseTime}
              </span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                Expense Category
              </span>
              <Badge variant="outline" className="text-xs mt-1 border-gold/40 text-gold">
                <Tag className="w-3 h-3 mr-1" /> {expense.categoryName}
              </Badge>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                Paid To / Vendor
              </span>
              <span className="font-bold text-base text-foreground block">
                {expense.paidTo}
              </span>
              <span className="text-xs text-muted-foreground">Mode: {getPaymentModeLabel(expense.paymentMode)}</span>
            </div>
          </div>

          {/* Description */}
          <div className="p-3.5 rounded-xl bg-card/70 border border-border/40">
            <span className="text-xs font-semibold text-muted-foreground block mb-1">
              Description of Expenditure:
            </span>
            <p className="text-sm font-medium text-foreground">{expense.description}</p>
          </div>

          {/* Hero Amount Paid */}
          <div className="p-4 rounded-xl bg-money-out-bg/60 border border-money-out/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-money-out block">
                Amount Paid From Event Fund
              </span>
              <span className="text-3xl font-extrabold text-money-out">
                {formatCurrency(expense.amount)}
              </span>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <span>Status: <strong className="text-foreground uppercase">{expense.status}</strong></span>
            </div>
          </div>

          {/* Mandatory Note */}
          <div className="p-4 rounded-xl bg-background/60 border border-border/40 space-y-1">
            <span className="text-xs font-bold text-gold uppercase tracking-wider block">
              Mandatory Note / Committee Authorization
            </span>
            <p className="text-sm italic text-foreground leading-relaxed">
              &ldquo;{expense.note}&rdquo;
            </p>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>Authorized by: <span className="font-semibold text-foreground">{expense.createdByName}</span></p>
            <p>Moon Friends Organizing Committee · Finance Wing</p>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Transaction Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="glass border-destructive/40 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Cancel Expense
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Cancelling this expense will release {formatCurrency(expense.amount)} back into the available event fund. Mandatory reason required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cancel-reason" className="text-xs font-bold text-foreground">
                Mandatory Reason for Cancellation *
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="State the reason (e.g. Order cancelled, vendor refund received, duplicate bill)..."
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
              Confirm & Refund Fund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
