'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireRole } from '@/lib/firebase/auth-session';
import { COLLECTIONS } from '@/lib/constants';
import { Timestamp } from 'firebase-admin/firestore';
import { serializeDoc } from '@/lib/utils';
import type { ActionResult } from '@/types';

export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  wing?: string;
  sortOrder?: number;
  createdAt?: string;
}

export async function getMembers(): Promise<ActionResult<CommitteeMember[]>> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTIONS.MEMBERS)
      .orderBy('sortOrder', 'asc')
      .get();

    const members: CommitteeMember[] = [];
    snapshot.forEach((doc) => {
      members.push(serializeDoc({ ...doc.data(), id: doc.id }));
    });

    return { success: true, data: members };
  } catch (error) {
    // Fallback: try without orderBy in case index doesn't exist
    try {
      const snapshot = await adminDb.collection(COLLECTIONS.MEMBERS).get();
      const members: CommitteeMember[] = [];
      snapshot.forEach((doc) => {
        members.push(serializeDoc({ ...doc.data(), id: doc.id }));
      });
      return { success: true, data: members };
    } catch {
      return { success: false, error: 'Failed to fetch members' };
    }
  }
}

export async function createMember(data: {
  name: string;
  role: string;
  phone?: string;
  wing?: string;
  sortOrder?: number;
}): Promise<ActionResult<{ id: string }>> {
  try {
    await requireRole(['admin']);

    if (!data.name?.trim() || !data.role?.trim()) {
      return { success: false, error: 'Name and role are required' };
    }

    const docRef = adminDb.collection(COLLECTIONS.MEMBERS).doc();
    await docRef.set({
      id: docRef.id,
      name: data.name.trim(),
      role: data.role.trim(),
      phone: data.phone?.trim() || '',
      wing: data.wing?.trim() || '',
      sortOrder: data.sortOrder || 99,
      createdAt: Timestamp.now(),
    });

    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add member',
    };
  }
}

export async function updateMember(
  id: string,
  data: { name?: string; role?: string; phone?: string; wing?: string; sortOrder?: number }
): Promise<ActionResult> {
  try {
    await requireRole(['admin']);

    await adminDb
      .collection(COLLECTIONS.MEMBERS)
      .doc(id)
      .update({ ...data, updatedAt: Timestamp.now() });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update member',
    };
  }
}

export async function deleteMember(id: string): Promise<ActionResult> {
  try {
    await requireRole(['admin']);
    await adminDb.collection(COLLECTIONS.MEMBERS).doc(id).delete();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete member',
    };
  }
}
