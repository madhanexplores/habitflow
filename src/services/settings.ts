import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType, sanitizeFirestoreData } from './firebase';
import { UserSettings } from '../types';

export function subscribeToSettings(
  userId: string,
  onUpdate: (settings: UserSettings) => void,
  onError?: (err: unknown) => void
): () => void {
  const path = `users/${userId}/settings/preferences`;
  const docRef = doc(db, 'users', userId, 'settings', 'preferences');

  const unsubscribe = onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as UserSettings);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

export async function updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<void> {
  const path = `users/${userId}/settings/preferences`;
  const now = new Date().toISOString();
  try {
    const docRef = doc(db, 'users', userId, 'settings', 'preferences');
    const cleanPayload = sanitizeFirestoreData({
      ...updates,
      updatedAt: now,
    });
    await setDoc(docRef, cleanPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function exportAllUserData(userId: string) {
  try {
    const habitsSnap = await getDocs(collection(db, 'users', userId, 'habits'));
    const completionsSnap = await getDocs(collection(db, 'users', userId, 'completions'));
    const notesSnap = await getDocs(collection(db, 'users', userId, 'notes'));
    const tasksSnap = await getDocs(collection(db, 'users', userId, 'tasks'));
    const settingsSnap = await getDoc(doc(db, 'users', userId, 'settings', 'preferences'));

    const habits = habitsSnap.docs.map((d) => d.data());
    const completions = completionsSnap.docs.map((d) => d.data());
    const notes = notesSnap.docs.map((d) => d.data());
    const tasks = tasksSnap.docs.map((d) => d.data());
    const settings = settingsSnap.exists() ? settingsSnap.data() : null;

    return {
      exportTimestamp: new Date().toISOString(),
      userId,
      settings,
      habits,
      completions,
      notes,
      tasks,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
  }
}

export async function deleteUserAccountAndData(userId: string): Promise<void> {
  try {
    // 1. Delete all user habits
    const habitsSnap = await getDocs(collection(db, 'users', userId, 'habits'));
    for (const d of habitsSnap.docs) {
      await deleteDoc(d.ref);
    }

    // 2. Delete all user completions
    const completionsSnap = await getDocs(collection(db, 'users', userId, 'completions'));
    for (const d of completionsSnap.docs) {
      await deleteDoc(d.ref);
    }

    // 3. Delete all user notes
    const notesSnap = await getDocs(collection(db, 'users', userId, 'notes'));
    for (const d of notesSnap.docs) {
      await deleteDoc(d.ref);
    }

    // 4. Delete all user tasks
    const tasksSnap = await getDocs(collection(db, 'users', userId, 'tasks'));
    for (const d of tasksSnap.docs) {
      await deleteDoc(d.ref);
    }

    // 5. Delete user settings
    await deleteDoc(doc(db, 'users', userId, 'settings', 'preferences'));

    // 6. Delete root user profile doc
    await deleteDoc(doc(db, 'users', userId));

    // 7. Delete authentication record
    if (auth.currentUser && auth.currentUser.uid === userId) {
      await deleteUser(auth.currentUser);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
  }
}
