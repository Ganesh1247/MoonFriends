'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireRole } from '@/lib/firebase/auth-session';
import { eventSchema } from '@/lib/validations/event';
import { COLLECTIONS } from '@/lib/constants';
import { Timestamp } from 'firebase-admin/firestore';
import { serializeDoc } from '@/lib/utils';
import type { EventSchedule, ActionResult } from '@/types';

export async function getEvents(): Promise<ActionResult<EventSchedule[]>> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTIONS.EVENTS)
      .orderBy('date', 'asc')
      .get();

    const events: EventSchedule[] = [];
    snapshot.forEach((doc) => {
      events.push(
        serializeDoc({
          ...doc.data(),
          id: doc.id,
        })
      );
    });

    return { success: true, data: events };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch events',
    };
  }
}

export async function createEvent(
  formData: Record<string, unknown>
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireRole(['admin']);

    const parsed = eventSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors as Record<string, string>,
      };
    }

    const data = parsed.data;
    const docRef = adminDb.collection(COLLECTIONS.EVENTS).doc();

    await docRef.set({
      id: docRef.id,
      ...data,
      sortOrder: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error('Error creating event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create event',
    };
  }
}

export async function updateEvent(
  id: string,
  formData: Record<string, unknown>
): Promise<ActionResult> {
  try {
    await requireRole(['admin']);

    const parsed = eventSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors as Record<string, string>,
      };
    }

    await adminDb
      .collection(COLLECTIONS.EVENTS)
      .doc(id)
      .update({
        ...parsed.data,
        updatedAt: Timestamp.now(),
      });

    return { success: true };
  } catch (error) {
    console.error('Error updating event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update event',
    };
  }
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  try {
    await requireRole(['admin']);

    await adminDb.collection(COLLECTIONS.EVENTS).doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete event',
    };
  }
}
