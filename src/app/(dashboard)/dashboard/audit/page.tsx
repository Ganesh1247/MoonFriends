'use client';

import { useEffect, useState } from 'react';
import { getAuditLogs } from '@/lib/actions/audit';
import { formatTimestamp } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/moon/empty-state';
import { History, ShieldCheck, Filter, ArrowRight, Clock, User, FileText, AlertCircle } from 'lucide-react';
import type { AuditLog } from '@/types';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    async function loadLogs() {
      const res = await getAuditLogs(100, actionFilter);
      if (res.success && res.data) {
        setLogs(res.data);
      }
      setLoading(false);
    }
    loadLogs();
  }, [actionFilter]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATED':
        return <Badge className="bg-money-in/20 text-money-in border-money-in/40 text-[10px]">CREATED</Badge>;
      case 'UPDATED':
        return <Badge className="bg-gold/20 text-gold border-gold/40 text-[10px]">UPDATED</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/40 text-[10px]">CANCELLED</Badge>;
      case 'APPROVED':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40 text-[10px]">APPROVED</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Immutable Security Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Financial & System Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Strict record of all financial mutations, amount changes, soft-deletions, and operator justifications
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'CREATED', 'UPDATED', 'CANCELLED', 'APPROVED'].map((action) => (
            <Button
              key={action}
              size="sm"
              variant={actionFilter === action ? 'default' : 'outline'}
              onClick={() => setActionFilter(action)}
              className={`text-xs h-9 ${actionFilter === action ? 'bg-gold text-night-deep font-bold' : ''}`}
            >
              {action === 'all' ? 'All Ledger Actions' : action}
            </Button>
          ))}
        </div>
      </div>

      {/* Audit Log Timeline Feed */}
      {logs.length === 0 ? (
        <EmptyState
          icon="📜"
          title="No audit entries found"
          description="Every collection, expense, edit, and cancellation automatically creates an immutable audit record."
        />
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="glass border-border/40 hover:border-gold/30 transition-all p-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getActionBadge(log.action)}
                    {log.transactionId && (
                      <span className="font-mono text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-md">
                        {log.transactionId}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground capitalize">
                      Entity: <strong className="text-foreground">{log.entityType}</strong>
                    </span>
                  </div>

                  {/* Mandatory Reason */}
                  <div className="p-3 rounded-lg bg-background/60 border border-border/30 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold block mb-0.5">
                      Operator Stated Reason / Note:
                    </span>
                    <p className="text-foreground italic font-medium">
                      &ldquo;{log.reason}&rdquo;
                    </p>
                  </div>

                  {/* Before/After Diff if Updated */}
                  {log.action === 'UPDATED' && (log.previousValues || log.newValues) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono p-2.5 rounded-lg bg-card/60 border border-border/30">
                      <div className="text-muted-foreground">
                        <span className="text-destructive font-bold">Previous Values:</span>
                        <pre className="text-[11px] mt-1 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.previousValues, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-money-in font-bold">New Values Applied:</span>
                        <pre className="text-[11px] mt-1 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.newValues, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Operator Meta Footer */}
                <div className="md:text-right space-y-1 text-xs text-muted-foreground shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-border/20">
                  <p className="flex items-center md:justify-end gap-1 font-semibold text-foreground">
                    <User className="w-3.5 h-3.5 text-gold" /> {log.performedByName}
                  </p>
                  <Badge variant="outline" className="text-[10px] capitalize border-border/40">
                    Role: {log.performedByRole}
                  </Badge>
                  <p className="flex items-center md:justify-end gap-1 text-[11px] text-muted-foreground pt-1">
                    <Clock className="w-3 h-3" /> {formatTimestamp(log.createdAt as any)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
