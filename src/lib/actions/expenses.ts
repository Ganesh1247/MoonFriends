'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireRole } from '@/lib/firebase/auth-session';
import { expenseSchema, expenseEditSchema } from '@/lib/validations/expense';
import { rupeesToPaise, generateTransactionId, formatCurrency } from '@/lib/utils';
import { COLLECTIONS } from '@/lib/constants';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { ActionResult } from '@/types';

/**
 * Create a new expense transaction.
 * CRITICAL: Validates available balance before allowing expense.
 * Uses Firestore runTransaction for atomicity — prevents overspending.
 */
export async function createExpense(
  formData: Record<string, unknown>
): Promise<ActionResult<{ transactionId: string; id: string }>> {
  try {
    // 1. Auth check — only admin and treasurer can create expenses
    const user = await requireRole(['admin', 'treasurer']);

    // 2. Server-side validation
    const parsed = expenseSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors as Record<string, string>,
      };
    }

    const data = parsed.data;

    // Extra note validation
    if (!data.note || data.note.trim().length === 0) {
      return { success: false, error: 'Note is required for every transaction' };
    }

    const amountPaise = rupeesToPaise(data.amount);

    // 3. Firestore transaction — atomically validates balance + creates expense
    const result = await adminDb.runTransaction(async (transaction) => {
      // ── Read phase (all reads must come before writes) ──

      // Read financial summary
      const summaryRef = adminDb.collection(COLLECTIONS.FINANCIAL_SUMMARY).doc('current');
      const summaryDoc = await transaction.get(summaryRef);

      // Read counter
      const counterRef = adminDb.collection(COLLECTIONS.COUNTERS).doc('expenses');
      const counterDoc = await transaction.get(counterRef);

      // Read expense category for name
      const categoryRef = adminDb
        .collection(COLLECTIONS.EXPENSE_CATEGORIES)
        .doc(data.categoryId);
      const categoryDoc = await transaction.get(categoryRef);

      // ── Validation phase ──

      // Check financial summary exists
      if (!summaryDoc.exists) {
        throw new Error(
          'No collections have been made yet. You must collect funds before spending them.'
        );
      }

      const summaryData = summaryDoc.data()!;
      const availableBalance = summaryData.availableBalance || 0;

      // ★ NON-NEGOTIABLE: Check balance before allowing expense ★
      if (amountPaise > availableBalance) {
        const available = formatCurrency(availableBalance);
        const requested = formatCurrency(amountPaise);
        const shortfall = formatCurrency(amountPaise - availableBalance);
        throw new Error(
          `INSUFFICIENT_BALANCE|${available}|${requested}|${shortfall}`
        );
      }

      const categoryName = categoryDoc.exists
        ? categoryDoc.data()?.name || 'Unknown'
        : 'Unknown';

      let nextId = 1;
      if (counterDoc.exists) {
        nextId = (counterDoc.data()?.nextId || 0) + 1;
      }

      const txId = generateTransactionId('EXP', nextId);

      // ── Write phase ──

      // Create expense document
      const expenseRef = adminDb.collection(COLLECTIONS.EXPENSE_TRANSACTIONS).doc();
      const expenseId = expenseRef.id;

      transaction.set(expenseRef, {
        id: expenseId,
        transactionId: txId,
        categoryId: data.categoryId,
        categoryName,
        description: data.description,
        amount: amountPaise,
        paymentMode: data.paymentMode,
        paidTo: data.paidTo,
        expenseDate: data.expenseDate,
        expenseTime: data.expenseTime,
        note: data.note.trim(),
        billImageUrl: null,
        status: 'active',
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Update financial summary
      const newTotalExpenses = (summaryData.totalExpenses || 0) + amountPaise;
      const newAvailableBalance =
        (summaryData.totalCollections || 0) - newTotalExpenses;

      transaction.update(summaryRef, {
        totalExpenses: newTotalExpenses,
        availableBalance: newAvailableBalance,
        expenseCount: FieldValue.increment(1),
        lastUpdated: Timestamp.now(),
      });

      // Update counter
      transaction.set(counterRef, { nextId });

      // Create audit log
      const auditRef = adminDb.collection(COLLECTIONS.AUDIT_LOGS).doc();
      transaction.set(auditRef, {
        id: auditRef.id,
        entityType: 'expense',
        entityId: expenseId,
        transactionId: txId,
        action: 'CREATED',
        previousValues: null,
        newValues: {
          categoryName,
          description: data.description,
          amount: amountPaise,
          paymentMode: data.paymentMode,
          paidTo: data.paidTo,
          note: data.note.trim(),
        },
        reason: data.note.trim(),
        performedBy: user.uid,
        performedByName: user.displayName || user.email,
        performedByRole: user.role,
        createdAt: Timestamp.now(),
      });

      return { transactionId: txId, id: expenseId };
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Create expense error:', error);

    // Handle insufficient balance with structured error
    if (error instanceof Error && error.message.startsWith('INSUFFICIENT_BALANCE|')) {
      const parts = error.message.split('|');
      return {
        success: false,
        error: 'Insufficient Event Balance',
        details: {
          available: parts[1],
          requested: parts[2],
          shortfall: parts[3],
          type: 'INSUFFICIENT_BALANCE',
        },
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create expense',
    };
  }
}

/**
 * Update an existing expense transaction.
 * Re-validates balance if amount changes.
 */
export async function updateExpense(
  expenseId: string,
  formData: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const user = await requireRole(['admin', 'treasurer']);

    const parsed = expenseEditSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors as Record<string, string>,
      };
    }

    const data = parsed.data;
    const newAmountPaise = rupeesToPaise(data.amount);

    await adminDb.runTransaction(async (transaction) => {
      // Read existing expense
      const expenseRef = adminDb
        .collection(COLLECTIONS.EXPENSE_TRANSACTIONS)
        .doc(expenseId);
      const expenseDoc = await transaction.get(expenseRef);

      if (!expenseDoc.exists) {
        throw new Error('Expense not found');
      }

      const existing = expenseDoc.data()!;

      if (existing.status !== 'active') {
        throw new Error('Cannot edit a cancelled transaction');
      }

      const oldAmountPaise = existing.amount;
      const amountDiff = newAmountPaise - oldAmountPaise;

      // If amount increased, check balance
      if (amountDiff > 0) {
        const summaryRef = adminDb.collection(COLLECTIONS.FINANCIAL_SUMMARY).doc('current');
        const summaryDoc = await transaction.get(summaryRef);

        if (summaryDoc.exists) {
          const summaryData = summaryDoc.data()!;
          const availableBalance = summaryData.availableBalance || 0;

          if (amountDiff > availableBalance) {
            const available = formatCurrency(availableBalance);
            const additional = formatCurrency(amountDiff);
            throw new Error(
              `INSUFFICIENT_BALANCE|${available}|${additional}|${formatCurrency(amountDiff - availableBalance)}`
            );
          }

          transaction.update(summaryRef, {
            totalExpenses: FieldValue.increment(amountDiff),
            availableBalance: FieldValue.increment(-amountDiff),
            lastUpdated: Timestamp.now(),
          });
        }
      } else if (amountDiff < 0) {
        // Amount decreased — release funds back
        const summaryRef = adminDb.collection(COLLECTIONS.FINANCIAL_SUMMARY).doc('current');
        transaction.update(summaryRef, {
          totalExpenses: FieldValue.increment(amountDiff),
          availableBalance: FieldValue.increment(-amountDiff),
          lastUpdated: Timestamp.now(),
        });
      }

      // Read category name
      const categoryRef = adminDb
        .collection(COLLECTIONS.EXPENSE_CATEGORIES)
        .doc(data.categoryId);
      const categoryDoc = await transaction.get(categoryRef);
      const categoryName = categoryDoc.exists
        ? categoryDoc.data()?.name || existing.categoryName
        : existing.categoryName;

      // Update expense
      transaction.update(expenseRef, {
        categoryId: data.categoryId,
        categoryName,
        description: data.description,
        amount: newAmountPaise,
        paymentMode: data.paymentMode,
        paidTo: data.paidTo,
        expenseDate: data.expenseDate,
        expenseTime: data.expenseTime,
        note: data.note.trim(),
        updatedBy: user.uid,
        updatedByName: user.displayName || user.email,
        updatedAt: Timestamp.now(),
      });

      // Audit log
      const auditRef = adminDb.collection(COLLECTIONS.AUDIT_LOGS).doc();
      transaction.set(auditRef, {
        id: auditRef.id,
        entityType: 'expense',
        entityId: expenseId,
        transactionId: existing.transactionId,
        action: 'UPDATED',
        previousValues: {
          amount: oldAmountPaise,
          categoryName: existing.categoryName,
          description: existing.description,
          paymentMode: existing.paymentMode,
          paidTo: existing.paidTo,
          note: existing.note,
        },
        newValues: {
          amount: newAmountPaise,
          categoryName,
          description: data.description,
          paymentMode: data.paymentMode,
          paidTo: data.paidTo,
          note: data.note.trim(),
        },
        reason: data.reason.trim(),
        performedBy: user.uid,
        performedByName: user.displayName || user.email,
        performedByRole: user.role,
        createdAt: Timestamp.now(),
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Update expense error:', error);

    if (error instanceof Error && error.message.startsWith('INSUFFICIENT_BALANCE|')) {
      const parts = error.message.split('|');
      return {
        success: false,
        error: 'Insufficient Event Balance',
        details: {
          available: parts[1],
          requested: parts[2],
          shortfall: parts[3],
          type: 'INSUFFICIENT_BALANCE',
        },
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update expense',
    };
  }
}

/**
 * Cancel an expense transaction (soft delete).
 * Releases funds back to available balance.
 */
export async function cancelExpense(
  expenseId: string,
  reason: string
): Promise<ActionResult> {
  try {
    const user = await requireRole(['admin']);

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: 'Cancellation reason is required' };
    }

    await adminDb.runTransaction(async (transaction) => {
      const expenseRef = adminDb
        .collection(COLLECTIONS.EXPENSE_TRANSACTIONS)
        .doc(expenseId);
      const expenseDoc = await transaction.get(expenseRef);

      if (!expenseDoc.exists) {
        throw new Error('Expense not found');
      }

      const existing = expenseDoc.data()!;

      if (existing.status === 'cancelled') {
        throw new Error('Transaction is already cancelled');
      }

      // Release funds back — update financial summary
      const summaryRef = adminDb.collection(COLLECTIONS.FINANCIAL_SUMMARY).doc('current');
      transaction.update(summaryRef, {
        totalExpenses: FieldValue.increment(-existing.amount),
        availableBalance: FieldValue.increment(existing.amount),
        expenseCount: FieldValue.increment(-1),
        lastUpdated: Timestamp.now(),
      });

      // Cancel the expense
      transaction.update(expenseRef, {
        status: 'cancelled',
        updatedBy: user.uid,
        updatedByName: user.displayName || user.email,
        updatedAt: Timestamp.now(),
      });

      // Audit log
      const auditRef = adminDb.collection(COLLECTIONS.AUDIT_LOGS).doc();
      transaction.set(auditRef, {
        id: auditRef.id,
        entityType: 'expense',
        entityId: expenseId,
        transactionId: existing.transactionId,
        action: 'CANCELLED',
        previousValues: { status: existing.status, amount: existing.amount },
        newValues: { status: 'cancelled' },
        reason: reason.trim(),
        performedBy: user.uid,
        performedByName: user.displayName || user.email,
        performedByRole: user.role,
        createdAt: Timestamp.now(),
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Cancel expense error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel expense',
    };
  }
}
