'use client';

import { useEffect, useState } from 'react';
import { getInventory, createInventoryItem, deleteInventoryItem } from '@/lib/actions/inventory';
import { formatCurrency, formatRupees } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Package, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import type { InventoryItem } from '@/types';

export default function InventoryPage() {
  const { isAdmin, isTreasurer } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState('Pieces');
  const [purchasedQty, setPurchasedQty] = useState<number | ''>('');
  const [usedQty, setUsedQty] = useState<number | ''>('');
  const [purchaseCost, setPurchaseCost] = useState<number | ''>('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const res = await getInventory();
    if (res.success && res.data) {
      setItems(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !unit.trim()) {
      toast.error('Item name and unit are required');
      return;
    }

    setSaving(true);
    try {
      const res = await createInventoryItem({
        itemName: itemName.trim(),
        unit: unit.trim(),
        purchasedQty: Number(purchasedQty) || 0,
        usedQty: Number(usedQty) || 0,
        purchaseCost: Number(purchaseCost) || 0,
        supplier: supplier.trim(),
        notes: notes.trim(),
      });

      if (res.success) {
        toast.success('Inventory item recorded');
        setModalOpen(false);
        setItemName('');
        setPurchasedQty('');
        setUsedQty('');
        setPurchaseCost('');
        setSupplier('');
        loadData();
      } else {
        toast.error(res.error || 'Failed to create inventory item');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving inventory item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete inventory item?')) {
      const res = await deleteInventoryItem(id);
      if (res.success) {
        toast.success('Item deleted');
        loadData();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold mb-1">
            <Package className="w-3.5 h-3.5" /> Mandap Stock & Material Tracking
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Festival Inventory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Track chairs, lighting fixtures, prasadam packaging, water cans, and pooja supplies
          </p>
        </div>

        {(isAdmin || isTreasurer) && (
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-gold hover:bg-gold-dark text-night-deep font-bold shadow-lg glow-gold h-11 px-5"
          >
            <Plus className="w-4 h-4 mr-1.5" /> + Add Inventory Item
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/40 overflow-hidden bg-card/40 backdrop-blur-xl">
        <Table>
          <TableHeader className="bg-background/60">
            <TableRow>
              <TableHead className="text-xs font-bold text-gold">Item Name</TableHead>
              <TableHead className="text-xs font-bold">Purchased / Procured</TableHead>
              <TableHead className="text-xs font-bold">Utilized</TableHead>
              <TableHead className="text-xs font-bold">Remaining Stock</TableHead>
              <TableHead className="text-xs font-bold">Total Cost</TableHead>
              <TableHead className="text-xs font-bold">Supplier</TableHead>
              {isAdmin && <TableHead className="text-xs font-bold text-right">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-accent/20">
                <TableCell className="font-semibold text-sm">{item.itemName}</TableCell>
                <TableCell className="text-xs">{item.purchasedQty} {item.unit}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{item.usedQty} {item.unit}</TableCell>
                <TableCell className="font-bold text-xs text-money-in">
                  {item.remainingQty} {item.unit}
                </TableCell>
                <TableCell className="text-xs font-mono">{formatCurrency(item.purchaseCost)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{item.supplier || '—'}</TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Item Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass border-gold/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gradient-gold">
              Record Inventory Stock
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Item Name *</Label>
              <Input
                placeholder="e.g. 20L Water Cans"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Unit *</Label>
                <Input
                  placeholder="Pieces / Boxes / Cans"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Purchased Quantity</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={purchasedQty}
                  onChange={(e) => setPurchasedQty(e.target.value ? Number(e.target.value) : '')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Used Quantity</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={usedQty}
                  onChange={(e) => setUsedQty(e.target.value ? Number(e.target.value) : '')}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Purchase Cost (₹)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value ? Number(e.target.value) : '')}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Supplier / Vendor</Label>
              <Input
                placeholder="e.g. Balaji Stores"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-gold hover:bg-gold-dark text-night-deep font-bold">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Save Inventory
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
