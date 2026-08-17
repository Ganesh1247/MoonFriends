'use server';

import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { requireRole } from '@/lib/firebase/auth-session';
import { COLLECTIONS } from '@/lib/constants';
import { Timestamp } from 'firebase-admin/firestore';
import type { AppUser, UserRole, ActionResult } from '@/types';

export async function getUsers(): Promise<ActionResult<AppUser[]>> {
  try {
    await requireRole(['admin']);

    const snapshot = await adminDb
      .collection(COLLECTIONS.USERS)
      .orderBy('createdAt', 'desc')
      .get();

    const users: AppUser[] = [];
    snapshot.forEach((doc) => {
      users.push({
        ...(doc.data() as AppUser),
        uid: doc.id,
      });
    });

    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch users',
    };
  }
}

export async function createUser(data: {
  email: string;
  password?: string;
  fullName: string;
  phone: string;
  role: UserRole;
}): Promise<ActionResult<{ uid: string }>> {
  try {
    const adminUser = await requireRole(['admin']);

    // 1. Create in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: data.email,
      password: data.password || 'MoonFriends2026!',
      displayName: data.fullName,
      phoneNumber: data.phone.startsWith('+91') ? data.phone : `+91${data.phone}`,
    });

    // 2. Set Custom Claims for role
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: data.role,
    });

    // 3. Store user in Firestore
    await adminDb.collection(COLLECTIONS.USERS).doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      role: data.role,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // 4. Audit log
    const auditRef = adminDb.collection(COLLECTIONS.AUDIT_LOGS).doc();
    await auditRef.set({
      id: auditRef.id,
      entityType: 'user',
      entityId: userRecord.uid,
      action: 'CREATED',
      newValues: { email: data.email, fullName: data.fullName, role: data.role },
      reason: `Created user ${data.fullName} with role ${data.role}`,
      performedBy: adminUser.uid,
      performedByName: adminUser.displayName || adminUser.email,
      performedByRole: adminUser.role,
      createdAt: Timestamp.now(),
    });

    return { success: true, data: { uid: userRecord.uid } };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user',
    };
  }
}

export async function updateUserRole(
  uid: string,
  newRole: UserRole
): Promise<ActionResult> {
  try {
    const adminUser = await requireRole(['admin']);

    // Update custom claim
    await adminAuth.setCustomUserClaims(uid, { role: newRole });

    // Update Firestore doc
    await adminDb.collection(COLLECTIONS.USERS).doc(uid).update({
      role: newRole,
      updatedAt: Timestamp.now(),
    });

    // Audit log
    const auditRef = adminDb.collection(COLLECTIONS.AUDIT_LOGS).doc();
    await auditRef.set({
      id: auditRef.id,
      entityType: 'user',
      entityId: uid,
      action: 'UPDATED',
      newValues: { role: newRole },
      reason: `Updated user role to ${newRole}`,
      performedBy: adminUser.uid,
      performedByName: adminUser.displayName || adminUser.email,
      performedByRole: adminUser.role,
      createdAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update role',
    };
  }
}
