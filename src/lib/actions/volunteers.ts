'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireAuth, requireRole } from '@/lib/firebase/auth-session';
import { volunteerSchema } from '@/lib/validations/volunteer';
import { COLLECTIONS } from '@/lib/constants';
import { Timestamp } from 'firebase-admin/firestore';
import { serializeDoc } from '@/lib/utils';
import type { Volunteer, ActionResult } from '@/types';

export async function getVolunteers(): Promise<ActionResult<Volunteer[]>> {
  try {
    await requireAuth();
    const snapshot = await adminDb
      .collection(COLLECTIONS.VOLUNTEERS)
      .orderBy('createdAt', 'desc')
      .get();

    const volunteers: Volunteer[] = [];
    snapshot.forEach((doc) => {
      volunteers.push(
        serializeDoc({
          ...doc.data(),
          id: doc.id,
        })
      );
    });

    return { success: true, data: volunteers };
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch volunteers',
    };
  }
}

export async function createVolunteer(
  formData: Record<string, unknown>
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireRole(['admin']);

    const parsed = volunteerSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors as Record<string, string>,
      };
    }

    const data = parsed.data;

    let assignedEventName = '';
    if (data.assignedEventId) {
      const eventDoc = await adminDb
        .collection(COLLECTIONS.EVENTS)
        .doc(data.assignedEventId)
        .get();
      if (eventDoc.exists) {
        assignedEventName = eventDoc.data()?.name || '';
      }
    }

    const docRef = adminDb.collection(COLLECTIONS.VOLUNTEERS).doc();
    await docRef.set({
      id: docRef.id,
      ...data,
      assignedEventName,
      createdAt: Timestamp.now(),
    });

    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error('Error creating volunteer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create volunteer',
    };
  }
}

export async function deleteVolunteer(id: string): Promise<ActionResult> {
  try {
    await requireRole(['admin']);
    await adminDb.collection(COLLECTIONS.VOLUNTEERS).doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete volunteer',
    };
  }
}
