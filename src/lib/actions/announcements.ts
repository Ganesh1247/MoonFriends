'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireRole } from '@/lib/firebase/auth-session';
import { COLLECTIONS } from '@/lib/constants';
import { Timestamp } from 'firebase-admin/firestore';
import { serializeDoc } from '@/lib/utils';
import type { Announcement, ActionResult } from '@/types';

export async function getAnnouncements(): Promise<ActionResult<Announcement[]>> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTIONS.ANNOUNCEMENTS)
      .orderBy('createdAt', 'desc')
      .get();

    const announcements: Announcement[] = [];
    snapshot.forEach((doc) => {
      announcements.push(
        serializeDoc({
          ...doc.data(),
          id: doc.id,
        })
      );
    });

    return { success: true, data: announcements };
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch announcements',
    };
  }
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireRole(['admin']);

    if (!data.title?.trim() || !data.content?.trim()) {
      return { success: false, error: 'Title and content are required' };
    }

    const docRef = adminDb.collection(COLLECTIONS.ANNOUNCEMENTS).doc();
    await docRef.set({
      id: docRef.id,
      title: data.title.trim(),
      content: data.content.trim(),
      isPublished: true,
      publishedAt: Timestamp.now(),
      createdBy: user.uid,
      createdByName: user.displayName || user.email,
      createdAt: Timestamp.now(),
    });

    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error('Error creating announcement:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create announcement',
    };
  }
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  try {
    await requireRole(['admin']);
    await adminDb.collection(COLLECTIONS.ANNOUNCEMENTS).doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete announcement',
    };
  }
}
