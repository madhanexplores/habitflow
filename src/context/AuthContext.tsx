import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, verifyFirestoreConnection } from '../services/firebase';
import {
  loginWithGoogle as authLoginGoogle,
  loginWithEmail as authLoginEmail,
  registerWithEmail as authRegisterEmail,
  resetPassword as authResetPassword,
  logoutUser as authLogout,
  getUserProfile,
  ensureUserProfile,
  completeUserOnboarding as authCompleteOnboarding,
} from '../services/auth';
import { subscribeToSettings, updateUserSettings } from '../services/settings';
import { UserProfile, UserSettings } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  userSettings: UserSettings | null;
  loading: boolean;
  isDemoMode: boolean;
  firestoreConnected: boolean;
  enableDemoMode: () => void;
  exitDemoMode: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (displayName: string, theme: 'dark' | 'light', goals: string[]) => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  reloadProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('habitflow_demo_active') === 'true';
  });
  const [loading, setLoading] = useState(true);
  const [firestoreConnected, setFirestoreConnected] = useState(true);

  useEffect(() => {
    // Verify connection on boot
    verifyFirestoreConnection().then((ok) => setFirestoreConnected(ok));

    if (isDemoMode) {
      setCurrentUser({
        uid: 'demo_commander',
        email: 'commander@habitflow.demo',
        displayName: 'Commander Alex',
      } as FirebaseUser);
      setUserProfile({
        uid: 'demo_commander',
        email: 'commander@habitflow.demo',
        displayName: 'Commander Alex',
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setUserSettings({
        userId: 'demo_commander',
        displayName: 'Commander Alex',
        theme: 'dark',
        weekStart: 'monday',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        goals: ['Master focused deep work', 'Consistent daily momentum'],
        soundEnabled: true,
        inAppReminders: true,
        pushNotifications: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await ensureUserProfile(user);
          setUserProfile(profile);
        } catch (e) {
          console.error('Failed to load user profile:', e);
        }
      } else {
        setUserProfile(null);
        setUserSettings(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [isDemoMode]);

  const enableDemoMode = () => {
    localStorage.setItem('habitflow_demo_active', 'true');
    setIsDemoMode(true);
  };

  const exitDemoMode = () => {
    localStorage.removeItem('habitflow_demo_active');
    setIsDemoMode(false);
    setCurrentUser(null);
    setUserProfile(null);
    setUserSettings(null);
  };

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeSettings = subscribeToSettings(
      currentUser.uid,
      (settings) => {
        setUserSettings(settings);
      },
      (err) => {
        console.error('Error listening to user settings:', err);
      }
    );

    return () => unsubscribeSettings();
  }, [currentUser]);

  const reloadProfile = async () => {
    if (!currentUser) return;
    const p = await getUserProfile(currentUser.uid);
    if (p) setUserProfile(p);
  };

  const loginWithGoogle = async () => {
    const user = await authLoginGoogle();
    const p = await ensureUserProfile(user);
    setUserProfile(p);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const user = await authLoginEmail(email, pass);
    const p = await ensureUserProfile(user);
    setUserProfile(p);
  };

  const registerWithEmail = async (email: string, pass: string, displayName: string) => {
    const user = await authRegisterEmail(email, pass, displayName);
    const p = await ensureUserProfile(user, displayName);
    setUserProfile(p);
  };

  const resetPassword = async (email: string) => {
    await authResetPassword(email);
  };

  const logout = async () => {
    await authLogout();
    setCurrentUser(null);
    setUserProfile(null);
    setUserSettings(null);
  };

  const completeOnboarding = async (displayName: string, theme: 'dark' | 'light', goals: string[]) => {
    if (!currentUser) return;
    await authCompleteOnboarding(currentUser.uid, displayName, theme, goals);
    await reloadProfile();
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!currentUser) return;
    await updateUserSettings(currentUser.uid, updates);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        userSettings,
        loading,
        isDemoMode,
        enableDemoMode,
        exitDemoMode,
        firestoreConnected,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        completeOnboarding,
        updateSettings,
        reloadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
