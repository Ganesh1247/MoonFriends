'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/firebase/auth-session';
import { COLLECTIONS } from '@/lib/constants';
import type { Contributor, ActionResult } from '@/types';

/**
 * Get all contributors with sorting and search.
 */
export async function getContributors(
  searchQuery?: string
): Promise<ActionResult<Contributor[]>> {
  try {
    await requireAuth();

    let query = adminDb
      .collection(COLLECTIONS.CONTRIBUTORS)
      .orderBy('totalContribution', 'desc');

    const snapshot = await query.get();
    let contributors: Contributor[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as Contributor;
      contributors.push({
        ...data,
        id: doc.id,
      });
    });

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      contributors = contributors.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.houseNumber.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }

    return { success: true, data: contributors };
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch contributors',
    };
  }
}

/**
 * Get a single contributor profile by ID with transaction history.
 */
export async function getContributorById(
  id: string
): Promise<ActionResult<{ contributor: Contributor; transactions: any[] }>> {
  try {
    await requireAuth();

    const doc = await adminDb.collection(COLLECTIONS.CONTRIBUTORS).doc(id).get();
    if (!doc.exists) {
      return { success: false, error: 'Contributor not found' };
    }

    const contributor = { ...doc.data(), id: doc.id } as Contributor;

    const txSnapshot = await adminDb
      .collection(COLLECTIONS.COLLECTION_TRANSACTIONS)
      .where('contributorId', '==', id)
      .orderBy('createdAt', 'desc')
      .get();

    const transactions = txSnapshot.docs.map((d) => ({
      ...d.data(),
      id: d.id,
    }));

    return { success: true, data: { contributor, transactions } };
  } catch (error) {
    console.error('Error fetching contributor details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch contributor',
    };
  }
}
