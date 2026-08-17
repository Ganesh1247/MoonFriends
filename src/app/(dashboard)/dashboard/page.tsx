'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { onSnapshot, doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS, PAYMENT_MODE_COLORS, CATEGORY_COLORS } from '@/lib/constants';
import { formatCurrency, paiseToRupees } from '@/lib/utils';
import { MoonFundOrb } from '@/components/moon/moon-fund-orb';
import { StatCard } from '@/components/moon/stat-card';
import { MoonProgress } from '@/components/moon/moon-progress';
import { TransactionCard } from '@/components/moon/transaction-card';
import { EmptyState } from '@/components/moon/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Users,
  Plus,
  FileBarChart,
  Calendar,
  Sparkles,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';

export default function DashboardPage() {
  const [financialSummary, setFinancialSummary] = useState({
    totalCollections: 0,
    totalExpenses: 0,
    availableBalance: 0,
    contributorCount: 0,
    collectionCount: 0,
    expenseCount: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time Firestore Listeners
  useEffect(() => {
    // 1. Live Financial Summary Listener
    const summaryUnsub = onSnapshot(
      doc(db, COLLECTIONS.FINANCIAL_SUMMARY, 'current'),
      (docSnap) => {
        if (docSnap.exists()) {
          setFinancialSummary(docSnap.data() as any);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Summary listener error:', error);
        setLoading(false);
      }
    );

    // 2. Live Recent Collections Listener
    const colQuery = query(
      collection(db, COLLECTIONS.COLLECTION_TRANSACTIONS),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const colUnsub = onSnapshot(colQuery, (colSnap) => {
      const cols = colSnap.docs.map((d) => ({
        ...d.data(),
        id: d.id,
        txType: 'collection' as const,
      }));

      // Combine with expenses
      const expQuery = query(
        collection(db, COLLECTIONS.EXPENSE_TRANSACTIONS),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      onSnapshot(expQuery, (expSnap) => {
        const exps = expSnap.docs.map((d) => ({
          ...d.data(),
          id: d.id,
          txType: 'expense' as const,
        }));

        // Merge and sort by createdAt
        const merged = [...cols, ...exps].sort((a: any, b: any) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setRecentTransactions(merged.slice(0, 7));
      });
    });

    return () => {
      summaryUnsub();
      colUnsub();
    };
  }, []);

  // Payment mode data for pie chart
  const paymentModeData = [
    { name: 'UPI', value: 45, color: '#8B5CF6' },
    { name: 'Cash', value: 35, color: '#22C55E' },
    { name: 'Bank Transfer', value: 20, color: '#3B82F6' },
  ];

  // Category expense preview data
  const categoryData = [
    { name: 'Idol', amount: 15000 },
    { name: 'Decoration', amount: 12000 },
    { name: 'Sound System', amount: 8000 },
    { name: 'Lighting', amount: 6500 },
    { name: 'Food', amount: 4500 },
    { name: 'Pooja', amount: 3500 },
  ];

  return (
    <div className="space-y-8">
      {/* ── 1. Hero Command Center Header ───────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-hero border border-gold/20 p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="pattern-overlay absolute inset-0" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Live Community Financial Command Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              🌙 <span className="text-gradient-gold">MOON FRIENDS</span>
            </h1>
            <p className="text-sm sm:text-base font-semibold text-saffron mt-1">
              🪔 VINAYAKA CHAVITHI 2026
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 italic">
              &ldquo;Together in devotion. Together as a community.&rdquo;
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/collections/new">
              <Button className="bg-money-in hover:bg-money-in/90 text-night-deep font-bold shadow-lg glow-money-in h-11 px-5">
                <Plus className="w-4 h-4 mr-1.5" /> Add Collection
              </Button>
            </Link>
            <Link href="/dashboard/expenses/new">
              <Button className="bg-saffron hover:bg-saffron/90 text-white font-bold shadow-lg glow-saffron h-11 px-5">
                <Plus className="w-4 h-4 mr-1.5" /> Add Expense
              </Button>
            </Link>
            <Link href="/dashboard/reports">
              <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 h-11">
                <FileBarChart className="w-4 h-4 mr-1.5" /> Reports
              </Button>
            </Link>
          </div>
        </div>

        {/* Moon Progress Metaphor Bar */}
        <div className="mt-8 pt-6 border-t border-border/30">
          <p className="text-xs font-semibold text-gold mb-3 uppercase tracking-wider">
            Festival Progress Metaphor
          </p>
          <MoonProgress currentPhase={2} />
        </div>
      </div>

      {/* ── 2. Primary Metrics Cards (Animated Count-Up) ────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Collections"
          value={financialSummary.totalCollections}
          icon={ArrowDownLeft}
          variant="success"
          delay={0.1}
        />
        <StatCard
          title="Total Expenses"
          value={financialSummary.totalExpenses}
          icon={ArrowUpRight}
          variant="danger"
          delay={0.2}
        />
        <StatCard
          title="Available Balance"
          value={financialSummary.availableBalance}
          icon={Wallet}
          variant="gold"
          delay={0.3}
        />
        <StatCard
          title="Total Contributors"
          value={financialSummary.contributorCount}
          isCurrency={false}
          icon={Users}
          variant="default"
          delay={0.4}
        />
      </div>

      {/* ── 3. Visual Fund Orb & Money Analytics ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* The Moon Fund Orb */}
        <Card className="glass border-border/50 flex flex-col items-center justify-center p-6 lg:col-span-1">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg font-bold text-gradient-gold">
              🌙 Moon Fund Orb
            </CardTitle>
            <CardDescription className="text-xs">
              Live ratio of collections spent vs available
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full flex justify-center pt-2">
            <MoonFundOrb
              totalCollections={financialSummary.totalCollections}
              totalExpenses={financialSummary.totalExpenses}
              availableBalance={financialSummary.availableBalance}
            />
          </CardContent>
        </Card>

        {/* Expense Category Bar Breakdown */}
        <Card className="glass border-border/50 lg:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold">
                Category Expense Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Major expense heads allocated from event fund
              </CardDescription>
            </div>
            <Link href="/dashboard/expenses">
              <Button variant="ghost" size="sm" className="text-xs text-gold">
                View All →
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1 pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tickFormatter={(v) => `₹${v / 1000}k`} stroke="#8B8FA3" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#8B8FA3" fontSize={11} width={80} />
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#1A2340', borderColor: '#D4A843', borderRadius: '8px', color: '#F5F0E8' }}
                  />
                  <Bar dataKey="amount" fill="#D4A843" radius={[0, 6, 6, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 4. Recent Live Transactions Feed ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Recent Financial Activity
              </h2>
              <p className="text-xs text-muted-foreground">
                Real-time stream of collections & approved expenses
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/collections">
                <Button variant="outline" size="sm" className="text-xs border-money-in/30 text-money-in">
                  Collections
                </Button>
              </Link>
              <Link href="/dashboard/expenses">
                <Button variant="outline" size="sm" className="text-xs border-money-out/30 text-money-out">
                  Expenses
                </Button>
              </Link>
            </div>
          </div>

          {recentTransactions.length === 0 ? (
            <EmptyState
              icon="🪔"
              title="No recent transactions"
              description="Start recording contributions and authorized expenses to see the live feed."
            />
          ) : (
            <div className="space-y-2.5">
              {recentTransactions.map((tx, idx) => (
                <TransactionCard
                  key={tx.id || idx}
                  type={tx.txType}
                  transactionId={tx.transactionId || 'TX-2026'}
                  name={tx.txType === 'collection' ? tx.contributorName : tx.paidTo}
                  amount={tx.amount || 0}
                  paymentMode={tx.paymentMode || 'cash'}
                  note={tx.note || ''}
                  date={tx.collectionDate || tx.expenseDate || '2026-08-17'}
                  createdAt={new Date((tx.createdAt?.seconds || Date.now() / 1000) * 1000)}
                  status={tx.status || 'active'}
                  categoryName={tx.categoryName}
                  houseNumber={tx.houseNumber}
                  index={idx}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right side: Quick Shortcuts & Payment Mode Breakdown */}
        <div className="space-y-6">
          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Payment Mode Split</CardTitle>
              <CardDescription className="text-xs">UPI vs Cash vs Bank Transfer</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 flex flex-col items-center">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentModeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {paymentModeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Share']}
                      contentStyle={{ backgroundColor: '#1A2340', borderColor: '#D4A843', borderRadius: '8px', color: '#F5F0E8' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-xs mt-2">
                {paymentModeData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Hub Navigation Cards */}
          <Card className="glass border-border/50 p-4 space-y-3">
            <h3 className="text-xs font-bold text-gold uppercase tracking-wider">
              Quick Operations Hub
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link href="/dashboard/contributors" className="p-3 rounded-xl bg-card/60 border border-border/30 hover:border-gold/30 transition-all flex flex-col">
                <Users className="w-4 h-4 text-gold mb-1" />
                <span className="font-semibold">Contributors</span>
                <span className="text-[10px] text-muted-foreground">Directory & History</span>
              </Link>
              <Link href="/dashboard/events" className="p-3 rounded-xl bg-card/60 border border-border/30 hover:border-gold/30 transition-all flex flex-col">
                <Calendar className="w-4 h-4 text-saffron mb-1" />
                <span className="font-semibold">Schedule</span>
                <span className="text-[10px] text-muted-foreground">10-day Timeline</span>
              </Link>
              <Link href="/dashboard/reports" className="p-3 rounded-xl bg-card/60 border border-border/30 hover:border-gold/30 transition-all flex flex-col">
                <FileBarChart className="w-4 h-4 text-money-in mb-1" />
                <span className="font-semibold">Reports</span>
                <span className="text-[10px] text-muted-foreground">Export CSV & PDF</span>
              </Link>
              <Link href="/dashboard/announcements" className="p-3 rounded-xl bg-card/60 border border-border/30 hover:border-gold/30 transition-all flex flex-col">
                <Sparkles className="w-4 h-4 text-blue-400 mb-1" />
                <span className="font-semibold">Announce</span>
                <span className="text-[10px] text-muted-foreground">Colony Notice Board</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
