'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import type { UserRole } from '@/types';

interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL: string;
}

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<UserRole>;
  signInWithGoogle: () => Promise<UserRole>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isTreasurer: boolean;
  isVolunteer: boolean;
  canManageFinances: boolean;
  canManageUsers: boolean;
  canDeleteTransactions: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from Firestore
  const fetchUserProfile = useCallback(async (fbUser: User): Promise<AuthUser | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: data.fullName || fbUser.displayName || '',
          role: (data.role as UserRole) || 'volunteer',
          photoURL: data.avatarUrl || fbUser.photoURL || '',
        };
      }
      // If no Firestore profile, use Firebase Auth data
      return {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || '',
        role: 'volunteer',
        photoURL: fbUser.photoURL || '',
      };
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const profile = await fetchUserProfile(fbUser);
        setUser(profile);
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  const createSession = useCallback(async (fbUser: User): Promise<UserRole> => {
    const idToken = await fbUser.getIdToken();
    const tokenResult = await fbUser.getIdTokenResult();
    const role = (tokenResult.claims.role as UserRole) || 'volunteer';
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      await firebaseSignOut(auth);
      throw new Error(data.error || 'Failed to create a secure session. Please try again.');
    }

    return role;
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return await createSession(credential.user);
    } catch (err) {
      // Firebase's CONFIGURATION_NOT_FOUND response is caused by the Firebase
      // Authentication provider not being configured for this project. The raw
      // SDK message is not useful to committee members trying to sign in.
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String(err.code)
          : '';
      const message =
        code === 'auth/configuration-not-found' ||
        (err instanceof Error && err.message.includes('CONFIGURATION_NOT_FOUND'))
          ? 'Sign-in is not configured yet. An administrator must enable Email/Password sign-in in Firebase Authentication for the Moon Friends project.'
          : err instanceof Error
            ? err.message
            : 'An error occurred during sign in';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createSession]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);
      return await createSession(credential.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createSession]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      // Destroy session cookie on server
      await fetch('/api/auth/session', { method: 'DELETE' });
      // Sign out from Firebase
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }, []);

  // Role-based permissions
  const isAdmin = user?.role === 'admin';
  const isTreasurer = user?.role === 'treasurer';
  const isVolunteer = user?.role === 'volunteer';
  const canManageFinances = isAdmin || isTreasurer;
  const canManageUsers = isAdmin;
  const canDeleteTransactions = isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        error,
        signIn,
        signInWithGoogle,
        signOut,
        isAdmin,
        isTreasurer,
        isVolunteer,
        canManageFinances,
        canManageUsers,
        canDeleteTransactions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
