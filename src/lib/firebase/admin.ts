import { initializeApp, getApps, cert, type ServiceAccount, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

let adminAppInstance: App | null = null;
let adminAuthInstance: Auth | null = null;
let adminDbInstance: Firestore | null = null;
let adminStorageInstance: Storage | null = null;

export function getFirebaseAdminApp(): App {
  if (adminAppInstance) {
    return adminAppInstance;
  }
  if (getApps().length > 0) {
    adminAppInstance = getApps()[0];
    return adminAppInstance;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!raw || raw.trim() === '' || raw.trim() === '{}') {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is missing in Vercel. Please add it in Project Settings -> Environment Variables.'
    );
  }

  let serviceAccount: ServiceAccount;
  try {
    let cleaned = raw.trim();
    // Handle base64 encoded service account
    if (!cleaned.startsWith('{') && !cleaned.startsWith('"')) {
      try {
        cleaned = Buffer.from(cleaned, 'base64').toString('utf-8').trim();
      } catch {
        // Not base64, proceed
      }
    }

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
    } catch {
      // If direct parse failed, fix unescaped or double escaped newlines
      const fixed = cleaned.replace(/\\n/g, '\n');
      parsed = JSON.parse(fixed);
    }

    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }

    serviceAccount = parsed as ServiceAccount;
  } catch (err) {
    throw new Error(
      `Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  adminAppInstance = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return adminAppInstance;
}

export function getAdminAuth(): Auth {
  if (!adminAuthInstance) {
    adminAuthInstance = getAuth(getFirebaseAdminApp());
  }
  return adminAuthInstance;
}

export function getAdminDb(): Firestore {
  if (!adminDbInstance) {
    adminDbInstance = getFirestore(getFirebaseAdminApp());
  }
  return adminDbInstance;
}

export function getAdminStorage(): Storage {
  if (!adminStorageInstance) {
    adminStorageInstance = getStorage(getFirebaseAdminApp());
  }
  return adminStorageInstance;
}

// Proxies allow existing code importing adminAuth / adminDb / adminStorage to continue working without changes
export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    const instance = getAdminAuth();
    const value = Reflect.get(instance as any, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop, receiver) {
    const instance = getAdminDb();
    const value = Reflect.get(instance as any, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

export const adminStorage = new Proxy({} as Storage, {
  get(_target, prop, receiver) {
    const instance = getAdminStorage();
    const value = Reflect.get(instance as any, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

export default adminAuth;

