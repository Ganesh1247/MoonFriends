'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/constants';
import { formatCurrency, formatDate, getPaymentModeLabel } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/moon/empty-state';
import { Plus, Search, ArrowUpRight, Eye, LayoutGrid, Layers } from 'lucide-react';
import type { ExpenseTransaction } from '@/types';

export default function ExpensesPage() {
  const { isAdmin, isTreasurer } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.EXPENSE_TRANSACTIONS),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list: ExpenseTransaction[] = [];
      snapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id } as ExpenseTransaction);
      });
      setExpenses(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const categories = Array.from(new Set(expenses.map((e) => e.categoryName).filter(Boolean)));

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.paidTo.toLowerCase().includes(search.toLowerCase()) ||
      e.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      e.note.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || e.categoryName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalSpent = filteredExpenses
    .filter((e) => e.status === 'active')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-money-out mb-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Money Outflow Module
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Event Expenses
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Total Authorized Filtered: <span className="font-bold text-money-out">{formatCurrency(totalSpent)}</span> ({filteredExpenses.length} entries)
          </p>
        </div>

        {(isAdmin || isTreasurer) && (
          <Link href="/dashboard/expenses/new">
            <Button className="bg-saffron hover:bg-saffron/90 text-white font-bold shadow-lg glow-saffron h-11 px-5 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1.5" /> + New Expense Entry
            </Button>
          </Link>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by description, paid to, EXP ID, or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card/60 border-border/50"
          />
        </div>

        {/* Category filter dropdown/chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className={`text-xs h-9 ${selectedCategory === 'all' ? 'bg-gold text-night-deep font-bold' : ''}`}
          >
            All Categories
          </Button>
          {categories.slice(0, 5).map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs h-9 ${selectedCategory === cat ? 'bg-gold text-night-deep font-bold' : ''}`}
            >
              {cat}
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
      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon="🪔"
          title="No expenses recorded"
          description="Your event fund is currently untouched. Expenses can only be created from available collections."
          actionLabel={(isAdmin || isTreasurer) ? "+ Add Expense" : undefined}
          onAction={() => window.location.href = '/dashboard/expenses/new'}
        />
      ) : viewMode === 'cards' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExpenses.map((exp) => (
            <Card key={exp.id} className="glass border-border/40 hover:border-saffron/30 transition-all">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-saffron uppercase tracking-wider">
                      {exp.transactionId}
                    </span>
                    <h3 className="font-bold text-base text-foreground truncate mt-0.5">
                      {exp.description}
                    </h3>
                    <p className="text-xs text-muted-foreground">Paid To: {exp.paidTo}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-money-out">
                      {formatCurrency(exp.amount)}
                    </span>
                    <div>
                      <Badge variant="outline" className="text-[10px] uppercase border-border/40 mt-1">
                        {exp.categoryName}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Mandatory Note Box */}
                <div className="p-2.5 rounded-lg bg-background/50 border border-border/30 text-xs">
                  <p className="font-medium text-muted-foreground text-[10px] uppercase">Transaction Note:</p>
                  <p className="text-foreground line-clamp-2 mt-0.5">&ldquo;{exp.note}&rdquo;</p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/20">
                  <span>{formatDate(exp.expenseDate)} · {getPaymentModeLabel(exp.paymentMode)}</span>
                  <Link href={`/dashboard/expenses/${exp.id}`}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-gold hover:text-gold-light px-2">
                      <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                    </Button>
                  </Link>
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
                <TableHead className="text-xs font-bold">Category</TableHead>
                <TableHead className="text-xs font-bold">Description</TableHead>
                <TableHead className="text-xs font-bold">Paid To</TableHead>
                <TableHead className="text-xs font-bold">Amount</TableHead>
                <TableHead className="text-xs font-bold">Mandatory Note</TableHead>
                <TableHead className="text-xs font-bold">Date</TableHead>
                <TableHead className="text-xs font-bold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((exp) => (
                <TableRow key={exp.id} className="hover:bg-accent/20">
                  <TableCell className="font-mono text-xs font-semibold text-saffron">
                    {exp.transactionId}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{exp.categoryName}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-sm">
                    {exp.description}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {exp.paidTo}
                  </TableCell>
                  <TableCell className="font-bold text-sm text-money-out">
                    {formatCurrency(exp.amount)}
                  </TableCell>
                  <TableCell className="text-xs max-w-xs truncate text-muted-foreground">
                    {exp.note}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(exp.expenseDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/expenses/${exp.id}`}>
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
