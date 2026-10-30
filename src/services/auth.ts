import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, sanitizeFirestoreData } from './firebase';
import { UserProfile, UserSettings } from '../types';

export async function loginAsGuest(displayName?: string): Promise<FirebaseUser> {
  const finalName = displayName?.trim() || 'Commander';
  try {
    const result = await signInAnonymously(auth);
    if (result.user) {
      try {
        await updateProfile(result.user, { displayName: finalName });
      } catch (e) {
        console.warn('Anonymous display name update notice:', e);
      }
      await ensureUserProfile(result.user, finalName);
      return result.user;
    }
    throw new Error('Anonymous sign-in yielded no user credentials');
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('auth/operation-not-allowed') || msg.includes('operation-not-allowed')) {
      throw error;
    }
    console.warn('signInAnonymously failed, trying seamless quick account:', error);
    const guestSeed = Math.random().toString(36).substring(2, 9);
    const guestEmail = `cadet_${guestSeed}@habitflow.app`;
    const guestPass = `HabitFlow!${guestSeed}#2025`;
    const emailResult = await createUserWithEmailAndPassword(auth, guestEmail, guestPass);
    if (emailResult.user) {
      try {
        await updateProfile(emailResult.user, { displayName: finalName });
      } catch (e) {
        console.warn('Profile display name update notice:', e);
      }
      await ensureUserProfile(emailResult.user, finalName);
      return emailResult.user;
    }
    throw error;
  }
}

export async function loginWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  if (!result?.user) {
    throw new Error('Google sign-in completed without returning user data.');
  }
  await ensureUserProfile(result.user);
  return result.user;
}

export async function loginWithGoogleRedirect(): Promise<void> {
  await signInWithRedirect(auth, googleProvider);
}

export async function checkRedirectResult(): Promise<FirebaseUser | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await ensureUserProfile(result.user);
      return result.user;
    }
  } catch (error) {
    console.warn('Redirect sign-in result check:', error);
    throw error;
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
  const now = new Date().toISOString();
  const fallbackProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || displayNameFallback || (user.email ? user.email.split('@')[0] : 'Commander'),
    photoURL: user.photoURL || '',
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, sanitizeFirestoreData(fallbackProfile));

      // Create default user settings
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
      const defaultSettings: UserSettings = {
        userId: user.uid,
        displayName: fallbackProfile.displayName || 'Commander',
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
      try {
        await setDoc(settingsRef, sanitizeFirestoreData(defaultSettings));
      } catch (settingsErr) {
        console.warn('Could not persist default settings doc to Firestore:', settingsErr);
      }

      return fallbackProfile;
    }

    return snap.data() as UserProfile;
  } catch (error) {
    console.warn('Could not load or initialize profile from Firestore, using fallback profile:', error);
    return fallbackProfile;
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
