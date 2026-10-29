import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, UserSettings } from '../types';

export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result?.user) {
      await ensureUserProfile(result.user);
      return result.user;
    }
    return null;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    // If popup is blocked by browser, iframe, or COOP policy, fallback to redirect
    if (
      err?.code === 'auth/popup-blocked' ||
      err?.code === 'auth/cancelled-popup-request' ||
      err?.message?.includes('Cross-Origin-Opener-Policy') ||
      err?.message?.includes('window.closed')
    ) {
      console.warn('Popup blocked or COOP restricted, falling back to redirect sign-in...');
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

export async function checkRedirectResult(): Promise<FirebaseUser | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await ensureUserProfile(result.user);
      return result.user;
    }
  } catch (error) {
    console.warn('Redirect sign-in check:', error);
  }
  return null;
}

export async function registerWithEmail(email: string, pass: string, displayName: string): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName) {
    await updateProfile(result.user, { displayName });
  }
  await ensureUserProfile(result.user, displayName);
  return result.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  await ensureUserProfile(result.user);
  return result.user;
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function ensureUserProfile(user: FirebaseUser, displayNameFallback?: string): Promise<UserProfile> {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    const now = new Date().toISOString();
    if (!snap.exists()) {
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || displayNameFallback || 'Commander',
        photoURL: user.photoURL || '',
        onboardingCompleted: false,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(userRef, profile);

      // Create default user settings
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
      const defaultSettings: UserSettings = {
        userId: user.uid,
        displayName: profile.displayName || 'Commander',
        theme: 'dark',
        weekStart: 'monday',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        goals: ['Build consistent daily momentum', 'Master high-leverage skills'],
        soundEnabled: true,
        inAppReminders: true,
        pushNotifications: false,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(settingsRef, defaultSettings);

      return profile;
    }

    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function completeUserOnboarding(
  uid: string,
  displayName: string,
  theme: 'dark' | 'light',
  goals: string[]
): Promise<void> {
  const path = `users/${uid}`;
  const now = new Date().toISOString();
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(
      userRef,
      {
        displayName,
        onboardingCompleted: true,
        updatedAt: now,
      },
      { merge: true }
    );

    const settingsRef = doc(db, 'users', uid, 'settings', 'preferences');
    await setDoc(
      settingsRef,
      {
        displayName,
        theme,
        goals,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
