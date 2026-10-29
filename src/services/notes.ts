import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeFirestoreData } from './firebase';
import { Note, NoteCategory, DailyReviewAnswers } from '../types';

export function subscribeToNotes(
  userId: string,
  onUpdate: (notes: Note[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const collectionPath = `users/${userId}/notes`;
  const notesCol = collection(db, 'users', userId, 'notes');

  const unsubscribe = onSnapshot(
    notesCol,
    (snapshot) => {
      const notes: Note[] = [];
      snapshot.forEach((docSnap) => {
        notes.push(docSnap.data() as Note);
      });
      // Sort newest dateKey first, then newest createdAt
      notes.sort((a, b) => b.dateKey.localeCompare(a.dateKey) || b.createdAt.localeCompare(a.createdAt));
      onUpdate(notes);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );

  return unsubscribe;
}

export async function createNote(
  userId: string,
  noteData: {
    title: string;
    content: string;
    category: NoteCategory;
    dateKey: string;
    tags?: string[];
    reviewAnswers?: DailyReviewAnswers;
  }
): Promise<Note> {
  const noteId = `n_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${userId}/notes/${noteId}`;
  const now = new Date().toISOString();

  const note: Note = {
    id: noteId,
    userId,
    title: noteData.title,
    content: noteData.content,
    category: noteData.category,
    dateKey: noteData.dateKey,
    tags: noteData.tags || [],
    createdAt: now,
    updatedAt: now,
  };

  if (noteData.reviewAnswers) {
    note.reviewAnswers = noteData.reviewAnswers;
  }

  const cleanPayload = sanitizeFirestoreData(note);

  try {
    await setDoc(doc(db, 'users', userId, 'notes', noteId), cleanPayload);
    return note;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateNote(
  userId: string,
  noteId: string,
  updates: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const path = `users/${userId}/notes/${noteId}`;
  const now = new Date().toISOString();
  const cleanPayload = sanitizeFirestoreData({
    ...updates,
    updatedAt: now,
  });
  try {
    await updateDoc(doc(db, 'users', userId, 'notes', noteId), cleanPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  const path = `users/${userId}/notes/${noteId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'notes', noteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
