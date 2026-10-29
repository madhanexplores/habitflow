import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  deleteField,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeFirestoreData } from './firebase';
import { Task, TaskPriority, Subtask } from '../types';

export function subscribeToTasks(
  userId: string,
  onUpdate: (tasks: Task[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const collectionPath = `users/${userId}/tasks`;
  const tasksCol = collection(db, 'users', userId, 'tasks');

  const unsubscribe = onSnapshot(
    tasksCol,
    (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach((docSnap) => {
        tasks.push(docSnap.data() as Task);
      });
      // Sort: incomplete first, then by priority (urgent > high > medium > low), then due date, then createdAt
      const priorityOrder: Record<TaskPriority, number> = {
        urgent: 0,
        high: 1,
        medium: 2,
        low: 3,
      };

      tasks.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        const pDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
        if (pDiff !== 0) return pDiff;
        if (a.dueDate && b.dueDate) {
          const dateDiff = a.dueDate.localeCompare(b.dueDate);
          if (dateDiff !== 0) return dateDiff;
        } else if (a.dueDate) return -1;
        else if (b.dueDate) return 1;
        return b.createdAt.localeCompare(a.createdAt);
      });

      onUpdate(tasks);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );

  return unsubscribe;
}

export async function createTask(
  userId: string,
  taskData: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
    dueTime?: string;
    category?: string;
    linkedHabitId?: string;
    tags?: string[];
    subtasks?: Subtask[];
  }
): Promise<Task> {
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${userId}/tasks/${taskId}`;
  const now = new Date().toISOString();

  const task: Task = {
    id: taskId,
    userId,
    title: taskData.title.trim(),
    description: taskData.description?.trim() || '',
    priority: taskData.priority || 'medium',
    category: taskData.category || 'General',
    completed: false,
    tags: taskData.tags || [],
    subtasks: taskData.subtasks || [],
    createdAt: now,
    updatedAt: now,
  };

  if (taskData.dueDate && taskData.dueDate.trim() !== '') {
    task.dueDate = taskData.dueDate.trim();
  }
  if (taskData.dueTime && taskData.dueTime.trim() !== '') {
    task.dueTime = taskData.dueTime.trim();
  }
  if (taskData.linkedHabitId && taskData.linkedHabitId.trim() !== '') {
    task.linkedHabitId = taskData.linkedHabitId.trim();
  }

  // Clean data so Firestore never receives undefined properties
  const cleanPayload = sanitizeFirestoreData(task);

  try {
    await setDoc(doc(db, 'users', userId, 'tasks', taskId), cleanPayload);
    return task;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTask(
  userId: string,
  taskId: string,
  updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`;
  const now = new Date().toISOString();
  
  const payload: Record<string, unknown> = {
    updatedAt: now,
  };

  const optionalDeleteKeys = ['dueDate', 'dueTime', 'linkedHabitId', 'completedAt'];

  for (const [key, val] of Object.entries(updates)) {
    if (val === undefined || (typeof val === 'string' && val.trim() === '' && optionalDeleteKeys.includes(key))) {
      if (optionalDeleteKeys.includes(key)) {
        payload[key] = deleteField();
      }
    } else {
      payload[key] = val;
    }
  }

  const cleanPayload = sanitizeFirestoreData(payload);

  try {
    await updateDoc(doc(db, 'users', userId, 'tasks', taskId), cleanPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function toggleTaskComplete(
  userId: string,
  task: Task
): Promise<void> {
  const nextCompleted = !task.completed;
  const path = `users/${userId}/tasks/${task.id}`;
  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    completed: nextCompleted,
    updatedAt: now,
  };

  if (nextCompleted) {
    payload.completedAt = now;
  } else {
    payload.completedAt = deleteField();
  }

  try {
    await updateDoc(doc(db, 'users', userId, 'tasks', task.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

