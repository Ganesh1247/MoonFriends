'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireAuth, requireRole } from '@/lib/firebase/auth-session';
import { COLLECTIONS, DEFAULT_EXPENSE_CATEGORIES } from '@/lib/constants';
import { Timestamp } from 'firebase-admin/firestore';
import type { FinancialSummary, DailyClosing, ActionResult } from '@/types';

/**
 * Get the live aggregated financial summary.
 */
export async function getFinancialSummary(): Promise<ActionResult<FinancialSummary>> {
  try {
    await requireAuth();

    const summaryRef = adminDb.collection(COLLECTIONS.FINANCIAL_SUMMARY).doc('current');
    const doc = await summaryRef.get();

    if (!doc.exists) {
      return {
        success: true,
        data: {
          totalCollections: 0,
          totalExpenses: 0,
          availableBalance: 0,
          contributorCount: 0,
          collectionCount: 0,
          expenseCount: 0,
          lastUpdated: Timestamp.now() as any,
        },
      };
    }

    return {
      success: true,
      data: doc.data() as FinancialSummary,
    };
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch summary',
    };
  }
}

/**
 * Get daily closing report.
 */
export async function getDailyClosings(): Promise<ActionResult<DailyClosing[]>> {
  try {
    await requireAuth();

    const snapshot = await adminDb
      .collection(COLLECTIONS.DAILY_CLOSINGS)
      .orderBy('date', 'desc')
      .get();

    const closings: DailyClosing[] = [];
    snapshot.forEach((doc) => {
      closings.push({
        ...(doc.data() as DailyClosing),
        id: doc.id,
      });
    });

    return { success: true, data: closings };
  } catch (error) {
    console.error('Error fetching daily closings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch closings',
    };
  }
}

/**
 * Confirm daily closing.
 */
export async function confirmDailyClosing(
  date: string,
  notes?: string
): Promise<ActionResult> {
  try {
    const user = await requireRole(['admin', 'treasurer']);

    // Fetch today's collections and expenses
    const colSnapshot = await adminDb
      .collection(COLLECTIONS.COLLECTION_TRANSACTIONS)
      .where('collectionDate', '==', date)
      .where('status', '==', 'active')
      .get();

    let todayCollections = 0;
    colSnapshot.forEach((doc) => {
      todayCollections += doc.data().amount || 0;
    });

    const expSnapshot = await adminDb
      .collection(COLLECTIONS.EXPENSE_TRANSACTIONS)
      .where('expenseDate', '==', date)
      .where('status', '==', 'active')
      .get();

    let todayExpenses = 0;
    expSnapshot.forEach((doc) => {
      todayExpenses += doc.data().amount || 0;
    });

    // Get current financial summary for closing balance
    const summaryRef = adminDb.collection(COLLECTIONS.FINANCIAL_SUMMARY).doc('current');
    const summaryDoc = await summaryRef.get();
    const summaryData = summaryDoc.data() || {};
    const closingBalance = summaryData.availableBalance || 0;
    const openingBalance = closingBalance - (todayCollections - todayExpenses);

    const closingRef = adminDb.collection(COLLECTIONS.DAILY_CLOSINGS).doc(date);
    await closingRef.set({
      id: date,
      date,
      openingBalance,
      collectionsTotal: todayCollections,
      expensesTotal: todayExpenses,
      closingBalance,
      confirmedBy: user.uid,
      confirmedByName: user.displayName || user.email,
      confirmedAt: Timestamp.now(),
      notes: notes?.trim() || '',
      createdAt: Timestamp.now(),
    });

    // Audit log
    const auditRef = adminDb.collection(COLLECTIONS.AUDIT_LOGS).doc();
    await auditRef.set({
      id: auditRef.id,
      entityType: 'daily_closing',
      entityId: date,
      action: 'APPROVED',
      newValues: {
        date,
        openingBalance,
        todayCollections,
        todayExpenses,
        closingBalance,
      },
      reason: `Daily closing confirmed for ${date}`,
      performedBy: user.uid,
      performedByName: user.displayName || user.email,
      performedByRole: user.role,
      createdAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error confirming daily closing:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm daily closing',
    };
  }
}

/**
 * Get category breakdown for reports.
 */
export async function getCategoryReport(): Promise<
  ActionResult<
    Array<{
      categoryName: string;
      totalAmount: number;
      count: number;
    }>
  >
> {
  try {
    await requireAuth();

    const snapshot = await adminDb
      .collection(COLLECTIONS.EXPENSE_TRANSACTIONS)
      .where('status', '==', 'active')
      .get();

    const categoryMap: Record<string, { totalAmount: number; count: number }> = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const cat = data.categoryName || 'Miscellaneous';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { totalAmount: 0, count: 0 };
      }
      categoryMap[cat].totalAmount += data.amount || 0;
      categoryMap[cat].count += 1;
    });

    const result = Object.entries(categoryMap).map(([categoryName, stats]) => ({
      categoryName,
      totalAmount: stats.totalAmount,
      count: stats.count,
    }));

    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching category report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch category report',
    };
  }
}
