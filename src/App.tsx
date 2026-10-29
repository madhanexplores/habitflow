/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { HabitProvider } from './context/HabitContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingModal } from './components/auth/OnboardingModal';

import { DashboardPage } from './pages/DashboardPage';
import { HabitsPage } from './pages/HabitsPage';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotesPage } from './pages/NotesPage';
import { SettingsPage } from './pages/SettingsPage';
import { TaskProvider } from './context/TaskContext';

const AppContent: React.FC = () => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B12] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7C5CFC] to-[#36C5F0] animate-pulse p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-[#080B12] rounded-[14px] flex items-center justify-center">
              <span className="font-extrabold text-lg text-white font-mono">HF</span>
            </div>
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-[#36C5F0] animate-ping opacity-25" />
        </div>
        <div className="flex flex-col items-center space-y-1">
          <p className="text-xs font-mono tracking-widest text-[#98A2B8] uppercase">
            Initializing HabitFlow
          </p>
          <div className="w-32 h-1 bg-slate-900 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-[#7C5CFC] to-[#36C5F0] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated: render modal
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#080B12] flex items-center justify-center p-4">
        <AuthModal isOpen={true} />
      </div>
    );
  }

  // First time onboarding modal
  const showOnboarding = userProfile && !userProfile.onboardingCompleted;

  return (
    <HabitProvider>
      <TaskProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="habits" element={<HabitsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>

        {/* Onboarding Dialog */}
        <OnboardingModal isOpen={!!showOnboarding} />
      </TaskProvider>
    </HabitProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
