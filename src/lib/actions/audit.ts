'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireRole } from '@/lib/firebase/auth-session';
import { COLLECTIONS } from '@/lib/constants';
import type { AuditLog, ActionResult } from '@/types';

export async function getAuditLogs(
  limitCount: number = 100,
  actionFilter?: string
): Promise<ActionResult<AuditLog[]>> {
  try {
    // Only admin can view audit logs
    await requireRole(['admin']);

    let query = adminDb
      .collection(COLLECTIONS.AUDIT_LOGS)
      .orderBy('createdAt', 'desc')
      .limit(limitCount);

    if (actionFilter && actionFilter !== 'all') {
      query = query.where('action', '==', actionFilter);
    }

    const snapshot = await query.get();
    const logs: AuditLog[] = [];

    snapshot.forEach((doc) => {
      logs.push({
        ...(doc.data() as AuditLog),
        id: doc.id,
      });
    });

    return { success: true, data: logs };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch audit logs',
    };
  }
}
