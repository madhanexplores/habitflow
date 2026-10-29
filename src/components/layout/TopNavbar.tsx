import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  Moon,
  Settings,
  RefreshCw,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useHabits } from '../../context/HabitContext';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const TopNavbar: React.FC = () => {
  const { userProfile, userSettings, isDemoMode, exitDemoMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { syncing, globalStreak, dailyProgress } = useHabits();

  return (
    <header className="sticky top-0 z-30 h-14 bg-[var(--bg-main)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Mobile Brand Wordmark */}
      <div className="flex items-center gap-2.5 md:hidden">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C5CFC] to-[#36C5F0] p-0.5 flex items-center justify-center">
          <div className="w-full h-full bg-[#080B12] rounded-[6px] flex items-center justify-center">
            <span className="font-extrabold text-[10px] text-white">HF</span>
          </div>
        </div>
        <span className="font-bold text-sm tracking-wide text-[var(--text-primary)]">
          HabitFlow
        </span>
      </div>

      {/* Desktop Breadcrumb/Status */}
      <div className="hidden md:flex items-center gap-4 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-[#35D49A]" />
          <span>{isDemoMode ? 'DEMO COMMAND STATION' : 'HQ SYSTEM ACTIVE'}</span>
        </div>
        <span aria-hidden="true" className="text-slate-700">·</span>
        <span className="font-medium text-[var(--text-primary)]">
          Streak: <strong className="text-[#FFB454] font-mono-num">{globalStreak.currentStreak} days</strong>
        </span>
        <span aria-hidden="true" className="text-slate-700">·</span>
        <span>
          Today: <strong className="text-[#35D49A] font-mono-num">{dailyProgress.percentage}%</strong>
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {isDemoMode && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#FFB454]/15 border border-[#FFB454]/30 text-[#FFB454] text-[10px] font-mono font-bold">
              PREVIEW
            </span>
            <button
              onClick={exitDemoMode}
              className="hidden sm:inline-flex text-xs font-semibold text-[#36C5F0] hover:underline"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Syncing indicator */}
        {!isDemoMode && (
          syncing ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 text-xs font-mono text-[#36C5F0]" title="Syncing changes with Cloud Firestore">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline text-[11px]">Syncing</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono text-[#35D49A]/80">
              <CheckCircle className="w-3 h-3" />
              <span>Synced</span>
            </div>
          )
        )}

        {/* PWA Install Button on mobile header */}
        <div className="md:hidden">
          <PWAInstallButton compact />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-800/40 transition"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FFB454]" /> : <Moon className="w-4 h-4 text-[#7C5CFC]" />}
        </button>

        {/* Settings Link */}
        <Link
          to="/settings"
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-800/40 transition"
          title="Account and App Settings"
          aria-label="Account Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* User Avatar */}
        <Link
          to="/settings"
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C5CFC] to-[#36C5F0] p-0.5 shadow-md flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
          title={userProfile?.displayName || 'User Profile'}
        >
          <div className="w-full h-full bg-[#101522] rounded-full flex items-center justify-center text-xs font-bold text-white">
            {userProfile?.displayName?.charAt(0).toUpperCase() || 'C'}
          </div>
        </Link>
      </div>
    </header>
  );
};
