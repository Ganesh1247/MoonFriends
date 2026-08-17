'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { updateExpense } from '@/lib/actions/expenses';
import { getExpenseCategories } from '@/lib/actions/categories';
import { COLLECTIONS, PAYMENT_MODES } from '@/lib/constants';
import { formatCurrency, paiseToRupees, getPaymentModeLabel } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Edit3, Loader2, AlertCircle } from 'lucide-react';
import type { ExpenseTransaction, ExpenseCategory } from '@/types';

export default function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [original, setOriginal] = useState<ExpenseTransaction | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<string>('cash');
  const [paidTo, setPaidTo] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [expenseTime, setExpenseTime] = useState('');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const catRes = await getExpenseCategories();
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }

        const docRef = doc(db, COLLECTIONS.EXPENSE_TRANSACTIONS, resolvedParams.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { ...docSnap.data(), id: docSnap.id } as ExpenseTransaction;
          setOriginal(data);
          setCategoryId(data.categoryId);
          setDescription(data.description);
          setAmount(paiseToRupees(data.amount));
          setPaymentMode(data.paymentMode);
          setPaidTo(data.paidTo);
          setExpenseDate(data.expenseDate);
          setExpenseTime(data.expenseTime);
          setNote(data.note);
        } else {
          toast.error('Expense not found');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
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
      const res = await updateExpense(resolvedParams.id, {
        categoryId,
        description: description.trim(),
        amount: Number(amount),
        paymentMode,
        paidTo: paidTo.trim(),
        expenseDate,
        expenseTime,
        note: note.trim(),
        reason: reason.trim(),
      });

      if (res.success) {
        toast.success('Expense updated and audited successfully');
        router.push(`/dashboard/expenses/${resolvedParams.id}`);
      } else {
        toast.error(res.error || 'Failed to update expense');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating expense');
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
        <h2 className="text-lg font-bold">Expense Not Found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/expenses/${original.id}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-saffron">
              {original.transactionId}
            </span>
            <span className="text-xs text-muted-foreground">· Modifying Expense</span>
          </div>
          <h1 className="text-xl font-extrabold text-foreground">
            Edit Expense Voucher
          </h1>
        </div>
      </div>

      {/* Side-by-Side Comparison & Form */}
      <Card className="glass border-border/50 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-gradient-saffron flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-saffron" /> Modification with Mandatory Audit Trail
          </CardTitle>
          <CardDescription className="text-xs">
            Any increase in amount is strictly validated against the current available event balance.
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
                  <p>Amount: <span className="font-bold text-money-out">{formatCurrency(original.amount)}</span></p>
                  <p>Category: <span className="text-foreground">{original.categoryName}</span></p>
                  <p>Paid To: <span className="text-foreground">{original.paidTo}</span></p>
                  <p>Description: &ldquo;{original.description}&rdquo;</p>
                  <p>Original Note: &ldquo;{original.note}&rdquo;</p>
                </div>
              </div>

              {/* Editable New Values */}
              <div className="space-y-3">
                <span className="font-bold text-[11px] text-saffron uppercase tracking-wider block">
                  New Values to Apply:
                </span>
                <div className="space-y-1.5">
                  <Label htmlFor="new-amount" className="text-xs font-semibold">New Amount (₹) *</Label>
                  <Input
                    id="new-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="bg-background/80 font-bold text-money-out"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-cat" className="text-xs font-semibold">Category</Label>
                  <select
                    id="new-cat"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-9 rounded-md bg-background/80 border border-border/60 text-xs px-3"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description & Paid To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-xs font-semibold">Description</Label>
                <Input
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background/50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paidTo" className="text-xs font-semibold">Paid To</Label>
                <Input
                  id="paidTo"
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
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
                Explain why this expense voucher amount or category is being modified.
              </p>
              <Textarea
                id="reason"
                placeholder="e.g. Final decoration bill increased after additional flower arches were ordered at main entrance..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="bg-background/80 border-destructive/40 text-xs"
                required
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Link href={`/dashboard/expenses/${original.id}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting || !reason.trim()}
                className="flex-1 bg-saffron hover:bg-saffron/90 text-white font-bold"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Re-validate & Save Changes
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
