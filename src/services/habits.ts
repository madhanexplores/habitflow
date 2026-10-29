import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeFirestoreData } from './firebase';
import { Habit } from '../types';

export function subscribeToHabits(
  userId: string,
  onUpdate: (habits: Habit[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const collectionPath = `users/${userId}/habits`;
  const habitsCol = collection(db, 'users', userId, 'habits');

  const unsubscribe = onSnapshot(
    habitsCol,
    (snapshot) => {
      const habits: Habit[] = [];
      snapshot.forEach((docSnap) => {
        habits.push(docSnap.data() as Habit);
      });
      // Sort by order ascending or createdAt
      habits.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      onUpdate(habits);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );

  return unsubscribe;
}

export async function createHabit(userId: string, habitData: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Habit> {
  const habitId = `h_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${userId}/habits/${habitId}`;
  const now = new Date().toISOString();

  const habit: Habit = {
    ...habitData,
    id: habitId,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  const cleanPayload = sanitizeFirestoreData(habit);

  try {
    await setDoc(doc(db, 'users', userId, 'habits', habitId), cleanPayload);
    return habit;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateHabit(userId: string, habitId: string, updates: Partial<Habit>): Promise<void> {
  const path = `users/${userId}/habits/${habitId}`;
  const now = new Date().toISOString();
  const cleanPayload = sanitizeFirestoreData({
    ...updates,
    updatedAt: now,
  });
  try {
    await updateDoc(doc(db, 'users', userId, 'habits', habitId), cleanPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleArchiveHabit(userId: string, habitId: string, currentStatus: boolean): Promise<void> {
  await updateHabit(userId, habitId, { isArchived: !currentStatus });
}

export async function togglePauseHabit(userId: string, habitId: string, currentStatus: boolean): Promise<void> {
  await updateHabit(userId, habitId, { isPaused: !currentStatus });
}

export async function deleteHabit(userId: string, habitId: string): Promise<void> {
  const path = `users/${userId}/habits/${habitId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'habits', habitId));

    // Also remove associated completions for this habit
    const completionsCol = collection(db, 'users', userId, 'completions');
    const q = query(completionsCol, where('habitId', '==', habitId));
    const snaps = await getDocs(q);
    const deletePromises = snaps.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
