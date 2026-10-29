import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { HabitCompletion, CompletionStatus } from '../types';

export function getCompletionDocId(habitId: string, dateKey: string): string {
  return `${habitId}_${dateKey}`;
}

export function subscribeToCompletions(
  userId: string,
  onUpdate: (completions: HabitCompletion[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const collectionPath = `users/${userId}/completions`;
  const completionsCol = collection(db, 'users', userId, 'completions');

  const unsubscribe = onSnapshot(
    completionsCol,
    (snapshot) => {
      const completions: HabitCompletion[] = [];
      snapshot.forEach((docSnap) => {
        completions.push(docSnap.data() as HabitCompletion);
      });
      onUpdate(completions);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );

  return unsubscribe;
}

export async function recordHabitCompletion(
  userId: string,
  habitId: string,
  dateKey: string,
  targetValue: number,
  progressValue: number,
  status: CompletionStatus,
  note?: string
): Promise<HabitCompletion> {
  const completionId = getCompletionDocId(habitId, dateKey);
  const path = `users/${userId}/completions/${completionId}`;
  const now = new Date().toISOString();

  const record: HabitCompletion = {
    id: completionId,
    userId,
    habitId,
    dateKey,
    status,
    progressValue,
    targetValue,
    note: note || '',
    createdAt: now,
    updatedAt: now,
  };

  if (status === 'completed') {
    record.completedAt = now;
  }

  try {
    await setDoc(doc(db, 'users', userId, 'completions', completionId), record);
    return record;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeHabitCompletion(
  userId: string,
  habitId: string,
  dateKey: string
): Promise<void> {
  const completionId = getCompletionDocId(habitId, dateKey);
  const path = `users/${userId}/completions/${completionId}`;

  try {
    await deleteDoc(doc(db, 'users', userId, 'completions', completionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
