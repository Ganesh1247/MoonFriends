'use client';

import { useEffect, useState } from 'react';
import { getFinancialSummary, getCategoryReport, getDailyClosings, confirmDailyClosing } from '@/lib/actions/reports';
import { formatCurrency, formatDate, getTodayDate } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  FileBarChart,
  Download,
  Calendar,
  CheckCircle2,
  PieChart,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Loader2,
  Clock,
} from 'lucide-react';
import type { FinancialSummary, DailyClosing } from '@/types';

export default function FinancialReportsPage() {
  const { isAdmin, isTreasurer } = useAuth();

  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [closings, setClosings] = useState<DailyClosing[]>([]);
  const [loading, setLoading] = useState(true);

  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closingNotes, setClosingNotes] = useState('');
  const [closingDate, setClosingDate] = useState(getTodayDate());
  const [confirming, setConfirming] = useState(false);

  const loadData = async () => {
    const [sRes, cRes, dRes] = await Promise.all([
      getFinancialSummary(),
      getCategoryReport(),
      getDailyClosings(),
    ]);

    if (sRes.success && sRes.data) setSummary(sRes.data);
    if (cRes.success && cRes.data) setCategories(cRes.data);
    if (dRes.success && dRes.data) setClosings(dRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmClosing = async () => {
    setConfirming(true);
    try {
      const res = await confirmDailyClosing(closingDate, closingNotes);
      if (res.success) {
        toast.success(`Daily closing confirmed for ${closingDate}`);
        setCloseModalOpen(false);
        setClosingNotes('');
        loadData();
      } else {
        toast.error(res.error || 'Failed to confirm daily closing');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error confirming closing');
    } finally {
      setConfirming(false);
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ['Metric', 'Amount (₹)'],
      ['Total Valid Collections', (summary?.totalCollections || 0) / 100],
      ['Total Valid Expenses', (summary?.totalExpenses || 0) / 100],
      ['Current Available Balance', (summary?.availableBalance || 0) / 100],
      [''],
      ['Category Breakdown', 'Amount (₹)'],
      ...categories.map((c) => [c.categoryName, c.totalAmount / 100]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MoonFriends_Financial_Report_${getTodayDate()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Financial Report CSV exported!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold mb-1">
            <FileBarChart className="w-3.5 h-3.5" /> Financial Accounting & Auditing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Financial Reports & Daily Closings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Complete reconciliation of event funds, category spending, and authenticated end-of-day balances
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="border-gold/30 text-gold hover:bg-gold/10 h-11"
          >
            <Download className="w-4 h-4 mr-1.5" /> Export CSV Report
          </Button>

          {(isAdmin || isTreasurer) && (
            <Button
              onClick={() => setCloseModalOpen(true)}
              className="bg-gold hover:bg-gold-dark text-night-deep font-bold shadow-lg glow-gold h-11 px-5"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm Today&apos;s Daily Closing
            </Button>
          )}
        </div>
      </div>

      {/* ── 1. Overall Balance Reconciliation Ribbon ────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-money-in/30 p-5 bg-money-in-bg/20">
          <span className="text-xs font-bold text-money-in uppercase tracking-wider block">
            1. Total Collections (Money In)
          </span>
          <span className="text-3xl font-extrabold text-money-in mt-1 block">
            {formatCurrency(summary?.totalCollections || 0)}
          </span>
          <p className="text-xs text-muted-foreground mt-1">From {summary?.contributorCount || 0} Devotee Families</p>
        </Card>

        <Card className="glass border-money-out/30 p-5 bg-money-out-bg/20">
          <span className="text-xs font-bold text-money-out uppercase tracking-wider block">
            2. Total Expenses (Money Out)
          </span>
          <span className="text-3xl font-extrabold text-money-out mt-1 block">
            {formatCurrency(summary?.totalExpenses || 0)}
          </span>
          <p className="text-xs text-muted-foreground mt-1">Across {summary?.expenseCount || 0} Authorized Vouchers</p>
        </Card>

        <Card className="glass border-gold/40 p-5 bg-gold/5 shadow-xl glow-gold">
          <span className="text-xs font-bold text-gold uppercase tracking-wider block">
            3. Available Event Fund (Balance)
          </span>
          <span className="text-3xl font-extrabold text-gradient-gold mt-1 block">
            {formatCurrency(summary?.availableBalance || 0)}
          </span>
          <p className="text-xs text-gold/80 mt-1">🔒 Collections − Expenses (Auto Calculated)</p>
        </Card>
      </div>

      {/* ── 2. Category-Wise Distribution Breakdown ────────────── */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gradient-gold flex items-center gap-2">
            <PieChart className="w-5 h-5 text-gold" /> Category-Wise Expenditure Breakdown
          </CardTitle>
          <CardDescription className="text-xs">
            Detailed itemization of where community funds have been spent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/30 overflow-hidden">
            <Table>
              <TableHeader className="bg-background/60">
                <TableRow>
                  <TableHead className="text-xs font-bold text-gold">Expense Category</TableHead>
                  <TableHead className="text-xs font-bold">Voucher Count</TableHead>
                  <TableHead className="text-xs font-bold">Total Spent</TableHead>
                  <TableHead className="text-xs font-bold text-right">% of Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => {
                  const totalExp = summary?.totalExpenses || 1;
                  const pct = ((cat.totalAmount / totalExp) * 100).toFixed(1);
                  return (
                    <TableRow key={cat.categoryName} className="hover:bg-accent/20">
                      <TableCell className="font-bold text-sm text-foreground">
                        {cat.categoryName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {cat.count} {cat.count === 1 ? 'voucher' : 'vouchers'}
                      </TableCell>
                      <TableCell className="font-bold text-sm text-money-out">
                        {formatCurrency(cat.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-gold">
                        {pct}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Daily Closing Ledger ────────────────────────────── */}
      <Card className="glass border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold" /> Daily Closing Audit Records
            </CardTitle>
            <CardDescription className="text-xs">
              Authenticated daily reconciliation ledger confirmed by Treasurer/Admin
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {closings.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No daily closings confirmed yet. Confirm today&apos;s closing using the button above.
            </p>
          ) : (
            <div className="rounded-xl border border-border/30 overflow-hidden">
              <Table>
                <TableHeader className="bg-background/60">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-gold">Closing Date</TableHead>
                    <TableHead className="text-xs font-bold">Opening Balance</TableHead>
                    <TableHead className="text-xs font-bold text-money-in">+ Day Collections</TableHead>
                    <TableHead className="text-xs font-bold text-money-out">− Day Expenses</TableHead>
                    <TableHead className="text-xs font-bold text-gold">Closing Balance</TableHead>
                    <TableHead className="text-xs font-bold">Confirmed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closings.map((d) => (
                    <TableRow key={d.id} className="hover:bg-accent/20">
                      <TableCell className="font-bold text-xs">{formatDate(d.date)}</TableCell>
                      <TableCell className="font-mono text-xs">{formatCurrency(d.openingBalance)}</TableCell>
                      <TableCell className="font-mono text-xs text-money-in">+{formatCurrency(d.collectionsTotal)}</TableCell>
                      <TableCell className="font-mono text-xs text-money-out">−{formatCurrency(d.expensesTotal)}</TableCell>
                      <TableCell className="font-mono font-bold text-xs text-gradient-gold">{formatCurrency(d.closingBalance)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{d.confirmedByName || 'Treasurer'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Closing Modal */}
      <Dialog open={closeModalOpen} onOpenChange={setCloseModalOpen}>
        <DialogContent className="glass border-gold/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gradient-gold">
              Confirm Daily Closing Ledger
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Locks today&apos;s financial snapshot into the official daily closing audit record.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-card/80 border border-gold/20 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span>Closing Date:</span>
                <span className="font-bold text-foreground">{closingDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Available Closing Fund:</span>
                <span className="font-bold text-gradient-gold text-sm">{formatCurrency(summary?.availableBalance || 0)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Treasurer Reconciliation Notes</Label>
              <Textarea
                placeholder="e.g. Physical cash counted and matches ledger. Bank and UPI reconciliations verified..."
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                rows={3}
                className="bg-background/50 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCloseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={confirming}
              onClick={handleConfirmClosing}
              className="bg-gold hover:bg-gold-dark text-night-deep font-bold"
            >
              {confirming ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Confirm & Lock Daily Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
