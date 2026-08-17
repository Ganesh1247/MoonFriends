'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireRole } from '@/lib/firebase/auth-session';
import { COLLECTIONS, DEFAULT_EXPENSE_CATEGORIES } from '@/lib/constants';
import type { ExpenseCategory, ActionResult } from '@/types';

export async function getExpenseCategories(): Promise<ActionResult<ExpenseCategory[]>> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTIONS.EXPENSE_CATEGORIES)
      .orderBy('sortOrder', 'asc')
      .get();

    let categories: ExpenseCategory[] = [];

    if (snapshot.empty) {
      // Seed default categories if empty
      const batch = adminDb.batch();
      DEFAULT_EXPENSE_CATEGORIES.forEach((cat) => {
        const ref = adminDb.collection(COLLECTIONS.EXPENSE_CATEGORIES).doc();
        batch.set(ref, {
          id: ref.id,
          ...cat,
        });
        categories.push({ id: ref.id, ...cat });
      });
      await batch.commit();
    } else {
      snapshot.forEach((doc) => {
        categories.push({
          ...(doc.data() as ExpenseCategory),
          id: doc.id,
        });
      });
    }

    return { success: true, data: categories };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories',
    };
  }
}

export async function createExpenseCategory(
  name: string,
  icon: string = 'Tag'
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireRole(['admin', 'treasurer']);

    if (!name || !name.trim()) {
      return { success: false, error: 'Category name is required' };
    }

    const docRef = adminDb.collection(COLLECTIONS.EXPENSE_CATEGORIES).doc();
    await docRef.set({
      id: docRef.id,
      name: name.trim(),
      icon,
      isSystem: false,
      isActive: true,
      sortOrder: 50,
    });

    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create category',
    };
  }
}
