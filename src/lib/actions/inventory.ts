'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireAuth, requireRole } from '@/lib/firebase/auth-session';
import { COLLECTIONS } from '@/lib/constants';
import { rupeesToPaise, serializeDoc } from '@/lib/utils';
import { Timestamp } from 'firebase-admin/firestore';
import type { InventoryItem, ActionResult } from '@/types';

export async function getInventory(): Promise<ActionResult<InventoryItem[]>> {
  try {
    await requireAuth();
    const snapshot = await adminDb
      .collection(COLLECTIONS.INVENTORY)
      .orderBy('createdAt', 'desc')
      .get();

    const items: InventoryItem[] = [];
    snapshot.forEach((doc) => {
      items.push(
        serializeDoc({
          ...doc.data(),
          id: doc.id,
        })
      );
    });

    return { success: true, data: items };
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch inventory',
    };
  }
}

export async function createInventoryItem(
  formData: Record<string, any>
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireRole(['admin']);

    if (!formData.itemName || !formData.unit) {
      return { success: false, error: 'Item name and unit are required' };
    }

    const docRef = adminDb.collection(COLLECTIONS.INVENTORY).doc();
    const costPaise = rupeesToPaise(Number(formData.purchaseCost) || 0);
    const purchasedQty = Number(formData.purchasedQty) || 0;
    const usedQty = Number(formData.usedQty) || 0;
    const remainingQty = purchasedQty - usedQty;

    await docRef.set({
      id: docRef.id,
      itemName: formData.itemName.trim(),
      quantity: remainingQty,
      unit: formData.unit.trim(),
      purchasedQty,
      usedQty,
      remainingQty,
      purchaseCost: costPaise,
      supplier: formData.supplier?.trim() || '',
      expenseId: formData.expenseId || null,
      notes: formData.notes?.trim() || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create item',
    };
  }
}

export async function updateInventoryItem(
  id: string,
  formData: Record<string, any>
): Promise<ActionResult> {
  try {
    await requireRole(['admin']);

    const purchasedQty = Number(formData.purchasedQty) || 0;
    const usedQty = Number(formData.usedQty) || 0;
    const remainingQty = purchasedQty - usedQty;
    const costPaise = rupeesToPaise(Number(formData.purchaseCost) || 0);

    await adminDb.collection(COLLECTIONS.INVENTORY).doc(id).update({
      itemName: formData.itemName.trim(),
      quantity: remainingQty,
      unit: formData.unit.trim(),
      purchasedQty,
      usedQty,
      remainingQty,
      purchaseCost: costPaise,
      supplier: formData.supplier?.trim() || '',
      expenseId: formData.expenseId || null,
      notes: formData.notes?.trim() || '',
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update item',
    };
  }
}

export async function deleteInventoryItem(id: string): Promise<ActionResult> {
  try {
    await requireRole(['admin']);
    await adminDb.collection(COLLECTIONS.INVENTORY).doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete item',
    };
  }
}
