import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const resolvedConfig = {
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || firebaseConfig.projectId,
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || firebaseConfig.appId,
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || firebaseConfig.apiKey,
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || firebaseConfig.authDomain,
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_DATABASE_ID as string) || firebaseConfig.firestoreDatabaseId,
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || firebaseConfig.storageBucket,
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || firebaseConfig.messagingSenderId,
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(resolvedConfig) : getApp();

// CRITICAL: Initialize Firestore with custom firestoreDatabaseId from config
export const db = getFirestore(app, resolvedConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Operation Types for error diagnosis
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Standardized Firestore error handler adhering to security rules diagnosis protocols
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('[Firestore Error Details]:', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Check if a value is a plain JavaScript object
 */
export function isPlainObject(item: unknown): item is Record<string, unknown> {
  return (
    item !== null &&
    typeof item === 'object' &&
    (Object.getPrototypeOf(item) === Object.prototype || Object.getPrototypeOf(item) === null)
  );
}

/**
 * Strips all undefined fields recursively from objects/arrays so Firestore operations
 * (setDoc, addDoc) never fail with "Unsupported field value: undefined".
 * Preserves FieldValue sentinels (deleteField, serverTimestamp), dates, primitives, and null.
 */
export function sanitizeFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeFirestoreData(item)) as unknown as T;
  }
  if (isPlainObject(data)) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeFirestoreData(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

/**
 * Verify server connection
 */
export async function verifyFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_probe'));
    return true;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('the client is offline')) {
      console.warn('Firestore connection: Client is currently in offline mode.');
      return false;
    }
    // Connection succeeded at network level even if document doesn't exist
    return true;
  }
}

