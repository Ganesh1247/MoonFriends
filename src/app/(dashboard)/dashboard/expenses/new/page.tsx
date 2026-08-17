'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { createExpense } from '@/lib/actions/expenses';
import { getExpenseCategories } from '@/lib/actions/categories';
import { COLLECTIONS, PAYMENT_MODES } from '@/lib/constants';
import { getTodayDate, getCurrentTime, formatCurrency, formatRupees } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Wallet,
  Tag,
  Ban,
} from 'lucide-react';
import type { ExpenseCategory } from '@/types';

const EXPENSE_NOTE_TEMPLATES = [
  'Advance payment for main stage decoration and entrance floral arch.',
  'Purchase of eco-friendly 9ft clay Ganesh idol and transportation charges.',
  'Daily morning/evening pooja samagri, coconuts, flowers and camphor.',
  'Groceries and provisions for community Maha Annadanam feast distribution.',
  'Sound system operator, amplifier and wireless microphones setup rental.',
];

export default function NewExpensePage() {
  const router = useRouter();

  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<string>('cash');
  const [paidTo, setPaidTo] = useState('');
  const [expenseDate, setExpenseDate] = useState(getTodayDate());
  const [expenseTime, setExpenseTime] = useState(getCurrentTime());
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(false);

  // Insufficient Balance Error Modal State
  const [insufficientError, setInsufficientError] = useState<{
    available: string;
    requested: string;
    shortfall: string;
  } | null>(null);

  // Live available balance subscription
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, COLLECTIONS.FINANCIAL_SUMMARY, 'current'),
      (docSnap) => {
        if (docSnap.exists()) {
          setAvailableBalance(docSnap.data().availableBalance || 0);
        }
      }
    );

    async function loadCategories() {
      const res = await getExpenseCategories();
      if (res.success && res.data) {
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategoryId(res.data[0].id);
        }
      }
    }

    loadCategories();
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
      toast.error('Select an Expense Category');
      return;
    }
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!paidTo.trim()) {
      toast.error('Paid To / Vendor name is required');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter a valid positive amount');
      return;
    }
    if (!note.trim()) {
      toast.error('Mandatory Note is required for every transaction');
      return;
    }

    // Client check preview (Backend enforces atomically!)
    const amountPaise = Number(amount) * 100;
    if (amountPaise > availableBalance) {
      setInsufficientError({
        available: formatCurrency(availableBalance),
        requested: formatCurrency(amountPaise),
        shortfall: formatCurrency(amountPaise - availableBalance),
      });
      return;
    }

    setLoading(true);
    try {
      const res = await createExpense({
        categoryId,
        description: description.trim(),
        amount: Number(amount),
        paymentMode,
        paidTo: paidTo.trim(),
        expenseDate,
        expenseTime,
        note: note.trim(),
      });

      if (res.success) {
        toast.success(`Expense ${res.data?.transactionId} recorded successfully!`);
        router.push('/dashboard/expenses');
      } else {
        if (res.details?.type === 'INSUFFICIENT_BALANCE') {
          setInsufficientError({
            available: res.details.available,
            requested: res.details.requested,
            shortfall: res.details.shortfall,
          });
        } else {
          toast.error(res.error || 'Failed to record expense');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Error recording expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button + Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/expenses">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-money-out" />
            Add Event Expense
          </h1>
          <p className="text-xs text-muted-foreground">
            Strictly validated against current available collections fund
          </p>
        </div>
      </div>

      {/* Available Balance Status Ribbon */}
      <div className="p-4 rounded-2xl bg-gradient-hero border border-gold/30 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center glow-gold">
            <Wallet className="w-5 h-5 text-gold" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Current Available Event Fund
            </span>
            <span className="text-2xl font-extrabold text-gradient-gold">
              {formatCurrency(availableBalance)}
            </span>
          </div>
        </div>
        <div className="text-right text-[11px] text-muted-foreground hidden sm:block">
          <p className="text-gold font-semibold">🔒 Balance Protected</p>
          <p>Overspending strictly blocked</p>
        </div>
      </div>

      {/* Expense Form */}
      <Card className="glass border-border/50 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold text-gradient-saffron">
            Expense Details
          </CardTitle>
          <CardDescription className="text-xs">
            Mandatory note and balance verification enforced on both client and server
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {/* Amount Hero Input */}
            <div className="p-4 rounded-2xl bg-money-out-bg/40 border border-money-out/30 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount" className="text-xs font-bold text-money-out uppercase tracking-wider">
                  Expense Amount (₹) *
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Max spendable: <strong className="text-gold">{formatCurrency(availableBalance)}</strong>
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-2 text-2xl font-extrabold text-money-out">₹</span>
                <Input
                  id="amount"
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                  className="pl-10 text-2xl font-extrabold h-14 bg-background/80 border-money-out/40 text-money-out focus:border-money-out"
                  required
                />
              </div>
            </div>

            {/* Category Selector Grid */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-gold" /> Expense Category *
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 rounded-xl bg-card/40 border border-border/30">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-2 rounded-lg text-xs font-semibold text-left transition-all truncate border ${
                      categoryId === cat.id
                        ? 'bg-saffron text-white border-saffron shadow-sm font-bold'
                        : 'bg-background/50 border-border/40 text-muted-foreground hover:bg-accent/40'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Description & Paid To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-xs font-semibold text-foreground">
                  Expense Description *
                </Label>
                <Input
                  id="desc"
                  placeholder="e.g. 9ft Clay Ganesh Idol Advance"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background/50 border-border/60"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paidTo" className="text-xs font-semibold text-foreground">
                  Paid To / Vendor Name *
                </Label>
                <Input
                  id="paidTo"
                  placeholder="e.g. Balaji Mandap Decorators"
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  className="bg-background/50 border-border/60"
                  required
                />
              </div>
            </div>

            {/* Payment Mode */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Payment Mode *
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {PAYMENT_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setPaymentMode(mode.value)}
                    className={`py-2 px-1 rounded-lg text-xs font-semibold border transition-all text-center ${
                      paymentMode === mode.value
                        ? 'bg-gold text-night-deep border-gold shadow-md font-bold'
                        : 'bg-card/60 border-border/40 text-muted-foreground hover:bg-accent/40'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mandatory Note Section */}
            <div className="space-y-2 pt-2 border-t border-border/30">
              <div className="flex items-center justify-between">
                <Label htmlFor="note" className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Mandatory Transaction Note *
                </Label>
                <span className="text-[10px] text-muted-foreground">Required for all expense audits</span>
              </div>
              <Textarea
                id="note"
                placeholder="State the exact reason and verification for this expense (e.g. Approved by committee for main stage decoration and lighting)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="bg-background/50 border-gold/30 focus:border-gold text-xs"
                required
              />

              {/* Note Templates */}
              <div className="space-y-1 pt-1">
                <p className="text-[10px] text-muted-foreground">Quick Templates (click to fill):</p>
                <div className="flex flex-wrap gap-1">
                  {EXPENSE_NOTE_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNote(tmpl)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-card/60 border border-border/30 text-muted-foreground hover:text-gold hover:border-gold/30 truncate max-w-full text-left"
                    >
                      + {tmpl.slice(0, 45)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-saffron hover:bg-saffron/90 text-white font-bold h-12 text-base shadow-xl glow-saffron mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Verifying Balance & Auditing...
                </>
              ) : (
                `Authorize Expense of ${amount ? formatRupees(Number(amount)) : '₹0'}`
              )}
            </Button>
          </CardContent>
        </form>
      </Card>

      {/* ── NON-NEGOTIABLE FINANCIAL RULE: Insufficient Balance Error Modal ── */}
      <Dialog open={!!insufficientError} onOpenChange={() => setInsufficientError(null)}>
        <DialogContent className="glass border-destructive/60 max-w-md p-6 space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/15 flex items-center justify-center glow-money-out border border-destructive/40">
              <Ban className="w-10 h-10 text-destructive" />
            </div>
          </div>

          <DialogHeader className="text-center space-y-1">
            <DialogTitle className="text-xl font-extrabold text-destructive flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Insufficient Event Balance
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Non-negotiable rule: Expenses can only be made from the collected event balance.
            </DialogDescription>
          </DialogHeader>

          {/* Exact Specification Error Breakdown */}
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Available Event Fund:</span>
              <span className="font-bold text-foreground text-sm">{insufficientError?.available}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Requested Expense:</span>
              <span className="font-bold text-destructive text-sm">{insufficientError?.requested}</span>
            </div>
            <div className="pt-2 border-t border-destructive/20 flex justify-between items-center">
              <span className="font-bold text-destructive">Shortfall Deficit:</span>
              <span className="font-extrabold text-destructive text-base">{insufficientError?.shortfall}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-card/60 border border-border/30 text-xs text-muted-foreground leading-relaxed">
            ⚠️ <span className="font-semibold text-foreground">Transaction Blocked:</span> Additional{' '}
            <strong className="text-destructive">{insufficientError?.shortfall}</strong> cannot be spent because the event fund is insufficient. Collect more funds before approving this expenditure.
          </div>

          <DialogFooter>
            <Button
              className="w-full bg-gold hover:bg-gold-dark text-night-deep font-bold"
              onClick={() => setInsufficientError(null)}
            >
              Understood / Adjust Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
