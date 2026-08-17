'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireAuth, requireRole } from '@/lib/firebase/auth-session';
import { collectionSchema, collectionEditSchema } from '@/lib/validations/collection';
import { rupeesToPaise, generateTransactionId } from '@/lib/utils';
import { COLLECTIONS } from '@/lib/constants';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { ActionResult } from '@/types';

/**
 * Create a new collection transaction.
 * Atomic: validates → creates contributor (if new) → creates transaction →
 *         updates financial summary → generates ID → creates audit log.
 */
export async function createCollection(
  formData: Record<string, unknown>
): Promise<ActionResult<{ transactionId: string; id: string }>> {
  try {
    // 1. Auth check
    const user = await requireRole(['admin', 'treasurer', 'volunteer']);

    // 2. Server-side validation
    const parsed = collectionSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors as Record<string, string>,
      };
    }

    const data = parsed.data;

    // Extra note validation (belt and suspenders)
    if (!data.note || data.note.trim().length === 0) {
      return { success: false, error: 'Note is required for every transaction' };
    }

    const amountPaise = rupeesToPaise(data.amount);

    // 3. Firestore transaction
    const result = await adminDb.runTransaction(async (transaction) => {
      // Read counter
      const counterRef = adminDb.collection(COLLECTIONS.COUNTERS).doc('collections');
      const counterDoc = await transaction.get(counterRef);

      let nextId = 1;
      if (counterDoc.exists) {
        nextId = (counterDoc.data()?.nextId || 0) + 1;
      }

      const txId = generateTransactionId('COL', nextId);

      // Read financial summary
      const summaryRef = adminDb.collection(COLLECTIONS.FINANCIAL_SUMMARY).doc('current');
      const summaryDoc = await transaction.get(summaryRef);

      // Check/create contributor
      const contributorsRef = adminDb.collection(COLLECTIONS.CONTRIBUTORS);
      const existingContributor = await contributorsRef
        .where('name', '==', data.contributorName)
        .where('houseNumber', '==', data.houseNumber)
        .limit(1)
        .get();

      let contributorId: string;

      if (!existingContributor.empty) {
        contributorId = existingContributor.docs[0].id;
        const contributorRef = contributorsRef.doc(contributorId);
        transaction.update(contributorRef, {
          totalContribution: FieldValue.increment(amountPaise),
          contributionCount: FieldValue.increment(1),
          latestContribution: Timestamp.now(),
          phone: data.phone,
          updatedAt: Timestamp.now(),
        });
      } else {
        const newContributorRef = contributorsRef.doc();
        contributorId = newContributorRef.id;
        transaction.set(newContributorRef, {
          id: contributorId,
          name: data.contributorName,
          houseNumber: data.houseNumber,
          phone: data.phone,
          totalContribution: amountPaise,
          contributionCount: 1,
          latestContribution: Timestamp.now(),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      // Create collection document
      const collectionRef = adminDb.collection(COLLECTIONS.COLLECTION_TRANSACTIONS).doc();
      const collectionId = collectionRef.id;

      transaction.set(collectionRef, {
        id: collectionId,
        transactionId: txId,
        contributorId,
        contributorName: data.contributorName,
        houseNumber: data.houseNumber,
        amount: amountPaise,
        paymentMode: data.paymentMode,
        collectionDate: data.collectionDate,
        collectionTime: data.collectionTime,
        note: data.note.trim(),
        receiptNumber: txId,
        receiptImageUrl: null,
        collectedBy: user.uid,
        collectedByName: user.displayName || user.email,
        status: 'active',
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Update financial summary
      if (summaryDoc.exists) {
        const currentData = summaryDoc.data()!;
        const newTotalCollections = (currentData.totalCollections || 0) + amountPaise;
        const newAvailableBalance =
          newTotalCollections - (currentData.totalExpenses || 0);

        transaction.update(summaryRef, {
          totalCollections: newTotalCollections,
          availableBalance: newAvailableBalance,
          contributorCount: FieldValue.increment(
            existingContributor.empty ? 1 : 0
          ),
          collectionCount: FieldValue.increment(1),
          lastUpdated: Timestamp.now(),
        });
      } else {
        transaction.set(summaryRef, {
          totalCollections: amountPaise,
          totalExpenses: 0,
          availableBalance: amountPaise,
          contributorCount: 1,
          collectionCount: 1,
          expenseCount: 0,
          lastUpdated: Timestamp.now(),
        });
      }

      // Update counter
      transaction.set(counterRef, { nextId });

      // Create audit log
      const auditRef = adminDb.collection(COLLECTIONS.AUDIT_LOGS).doc();
      transaction.set(auditRef, {
        id: auditRef.id,
        entityType: 'collection',
        entityId: collectionId,
        transactionId: txId,
        action: 'CREATED',
        previousValues: null,
        newValues: {
          contributorName: data.contributorName,
          amount: amountPaise,
          paymentMode: data.paymentMode,
          note: data.note.trim(),
        },
        reason: data.note.trim(),
        performedBy: user.uid,
        performedByName: user.displayName || user.email,
        performedByRole: user.role,
        createdAt: Timestamp.now(),
      });

      return { transactionId: txId, id: collectionId };
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Create collection error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create collection',
    };
  }
}

/**
 * Update an existing collection transaction.
 * Requires reason for change. Creates audit entry with before/after.
 */
export async function updateCollection(
  collectionId: string,
  formData: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const user = await requireRole(['admin', 'treasurer']);

    const parsed = collectionEditSchema.safeParse(formData);
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
      // Read existing collection
      const collectionRef = adminDb
        .collection(COLLECTIONS.COLLECTION_TRANSACTIONS)
        .doc(collectionId);
      const collectionDoc = await transaction.get(collectionRef);

      if (!collectionDoc.exists) {
        throw new Error('Collection not found');
      }

      const existing = collectionDoc.data()!;

      if (existing.status !== 'active') {
        throw new Error('Cannot edit a cancelled transaction');
      }

      const oldAmountPaise = existing.amount;
      const amountDiff = newAmountPaise - oldAmountPaise;

      // Update financial summary
      const summaryRef = adminDb.collection(COLLECTIONS.FINANCIAL_SUMMARY).doc('current');
      const summaryDoc = await transaction.get(summaryRef);

      if (summaryDoc.exists) {
        const summaryData = summaryDoc.data()!;
        const newTotalCollections = (summaryData.totalCollections || 0) + amountDiff;
        const newAvailableBalance =
          newTotalCollections - (summaryData.totalExpenses || 0);

        // Ensure balance doesn't go negative when reducing a collection
        if (newAvailableBalance < 0) {
          throw new Error(
            `Cannot reduce collection amount. Available balance would become negative. ` +
            `Current expenses: ₹${((summaryData.totalExpenses || 0) / 100).toLocaleString('en-IN')}`
          );
        }

        transaction.update(summaryRef, {
          totalCollections: newTotalCollections,
          availableBalance: newAvailableBalance,
          lastUpdated: Timestamp.now(),
        });
      }

      // Update contributor totals
      if (existing.contributorId) {
        const contributorRef = adminDb
          .collection(COLLECTIONS.CONTRIBUTORS)
          .doc(existing.contributorId);
        transaction.update(contributorRef, {
          totalContribution: FieldValue.increment(amountDiff),
          updatedAt: Timestamp.now(),
        });
      }

      // Update collection
      transaction.update(collectionRef, {
        amount: newAmountPaise,
        paymentMode: data.paymentMode,
        note: data.note.trim(),
        contributorName: data.contributorName,
        houseNumber: data.houseNumber,
        collectionDate: data.collectionDate,
        collectionTime: data.collectionTime,
        updatedBy: user.uid,
        updatedByName: user.displayName || user.email,
        updatedAt: Timestamp.now(),
      });

      // Audit log
      const auditRef = adminDb.collection(COLLECTIONS.AUDIT_LOGS).doc();
      transaction.set(auditRef, {
        id: auditRef.id,
        entityType: 'collection',
        entityId: collectionId,
        transactionId: existing.transactionId,
        action: 'UPDATED',
        previousValues: {
          amount: oldAmountPaise,
          paymentMode: existing.paymentMode,
          note: existing.note,
          contributorName: existing.contributorName,
        },
        newValues: {
          amount: newAmountPaise,
          paymentMode: data.paymentMode,
          note: data.note.trim(),
          contributorName: data.contributorName,
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
    console.error('Update collection error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update collection',
    };
  }
}

/**
 * Cancel a collection transaction (soft delete).
 * Requires reason. Recalculates totals.
 */
export async function cancelCollection(
  collectionId: string,
  reason: string
): Promise<ActionResult> {
  try {
    const user = await requireRole(['admin']);

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: 'Cancellation reason is required' };
    }

    await adminDb.runTransaction(async (transaction) => {
      const collectionRef = adminDb
        .collection(COLLECTIONS.COLLECTION_TRANSACTIONS)
        .doc(collectionId);
      const collectionDoc = await transaction.get(collectionRef);

      if (!collectionDoc.exists) {
        throw new Error('Collection not found');
      }

      const existing = collectionDoc.data()!;

      if (existing.status === 'cancelled') {
        throw new Error('Transaction is already cancelled');
      }

      // Update financial summary (subtract this collection)
      const summaryRef = adminDb.collection(COLLECTIONS.FINANCIAL_SUMMARY).doc('current');
      const summaryDoc = await transaction.get(summaryRef);

      if (summaryDoc.exists) {
        const summaryData = summaryDoc.data()!;
        const newTotalCollections =
          (summaryData.totalCollections || 0) - existing.amount;
        const newAvailableBalance =
          newTotalCollections - (summaryData.totalExpenses || 0);

        if (newAvailableBalance < 0) {
          throw new Error(
            'Cannot cancel this collection. It would cause the available balance to go negative. ' +
            'Cancel related expenses first.'
          );
        }

        transaction.update(summaryRef, {
          totalCollections: newTotalCollections,
          availableBalance: newAvailableBalance,
          collectionCount: FieldValue.increment(-1),
          lastUpdated: Timestamp.now(),
        });
      }

      // Update contributor totals
      if (existing.contributorId) {
        const contributorRef = adminDb
          .collection(COLLECTIONS.CONTRIBUTORS)
          .doc(existing.contributorId);
        transaction.update(contributorRef, {
          totalContribution: FieldValue.increment(-existing.amount),
          contributionCount: FieldValue.increment(-1),
          updatedAt: Timestamp.now(),
        });
      }

      // Cancel the transaction
      transaction.update(collectionRef, {
        status: 'cancelled',
        updatedBy: user.uid,
        updatedByName: user.displayName || user.email,
        updatedAt: Timestamp.now(),
      });

      // Audit log
      const auditRef = adminDb.collection(COLLECTIONS.AUDIT_LOGS).doc();
      transaction.set(auditRef, {
        id: auditRef.id,
        entityType: 'collection',
        entityId: collectionId,
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
    console.error('Cancel collection error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel collection',
    };
  }
}
