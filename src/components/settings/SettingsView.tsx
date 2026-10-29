import React, { useState } from 'react';
import {
  User,
  Moon,
  Sun,
  Calendar,
  Volume2,
  VolumeX,
  Bell,
  Download,
  Trash2,
  Check,
  Shield,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { exportAllUserData, deleteUserAccountAndData } from '../../services/settings';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const SettingsView: React.FC = () => {
  const { currentUser, userProfile, userSettings, updateSettings, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [displayName, setDisplayName] = useState(
    userSettings?.displayName || userProfile?.displayName || ''
  );
  const [weekStart, setWeekStart] = useState<'monday' | 'sunday'>(
    userSettings?.weekStart || 'monday'
  );
  const [soundEnabled, setSoundEnabled] = useState(
    userSettings?.soundEnabled ?? true
  );
  const [inAppReminders, setInAppReminders] = useState(
    userSettings?.inAppReminders ?? true
  );
  const [pushNotifications, setPushNotifications] = useState(
    userSettings?.pushNotifications ?? false
  );
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFcmInfo, setShowFcmInfo] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        displayName: displayName.trim(),
        weekStart,
        soundEnabled,
        inAppReminders,
        pushNotifications,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!currentUser) return;
    setExporting(true);
    try {
      const data = await exportAllUserData(currentUser.uid);
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HabitFlow_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    try {
      await deleteUserAccountAndData(currentUser.uid);
      await logout();
    } catch (err) {
      console.error('Account deletion error:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Command Center Settings
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Configure profile, notification triggers, theme, and data governance
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
            <User className="w-4 h-4 text-[#7C5CFC]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Personal Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#7C5CFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Account Email
              </label>
              <input
                type="email"
                disabled
                value={currentUser?.email || 'Authenticated User'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 cursor-not-allowed font-mono"
              />
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
            <Calendar className="w-4 h-4 text-[#36C5F0]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Preferences & Interface
            </h3>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-[#7C5CFC]" />
              ) : (
                <Sun className="w-4 h-4 text-[#FFB454]" />
              )}
              <div>
                <span className="text-xs font-medium text-[var(--text-primary)] block">
                  Interface Theme
                </span>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  Futuristic Dark command center (default) or Clean Light mode
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] hover:border-[#7C5CFC]/40 transition"
            >
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>

          {/* Week Start */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <div>
              <span className="text-xs font-medium text-[var(--text-primary)] block">
                Week Start Day
              </span>
              <span className="text-[10px] text-[var(--text-secondary)]">
                Calendar and weekly consistency boundary
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setWeekStart('monday')}
                className={`px-3 py-1 text-xs font-medium rounded transition ${
                  weekStart === 'monday'
                    ? 'bg-[#7C5CFC] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                Monday
              </button>
              <button
                type="button"
                onClick={() => setWeekStart('sunday')}
                className={`px-3 py-1 text-xs font-medium rounded transition ${
                  weekStart === 'sunday'
                    ? 'bg-[#7C5CFC] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                Sunday
              </button>
            </div>
          </div>

          {/* Celebratory Sound Effects */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#35D49A]" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <span className="text-xs font-medium text-[var(--text-primary)] block">
                  Celebration Audio Feedback
                </span>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  Chime synthesizer when completing daily targets
                </span>
              </div>
            </div>

            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-[#7C5CFC] focus:ring-[#7C5CFC] cursor-pointer"
            />
          </div>

          {/* In-App Reminders */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-[#FFB454]" />
              <div>
                <span className="text-xs font-medium text-[var(--text-primary)] block">
                  In-App Reminder Alerts
                </span>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  Active banner notifications when routine times arrive
                </span>
              </div>
            </div>

            <input
              type="checkbox"
              checked={inAppReminders}
              onChange={(e) => setInAppReminders(e.target.checked)}
              className="w-4 h-4 rounded text-[#7C5CFC] focus:ring-[#7C5CFC] cursor-pointer"
            />
          </div>

          {/* Push Notifications & FCM architecture notice */}
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-[var(--text-primary)] block">
                  Background Push Notifications
                </span>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  Browser notification alerts when application is active
                </span>
              </div>

              <button
                type="button"
                onClick={async () => {
                  if ('Notification' in window) {
                    const perm = await Notification.requestPermission();
                    if (perm === 'granted') {
                      setPushNotifications(true);
                    }
                  }
                }}
                className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-medium text-[#36C5F0] hover:border-[#36C5F0]/40 transition"
              >
                {pushNotifications ? 'Active' : 'Request Permission'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFcmInfo(!showFcmInfo)}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-mono pt-1"
            >
              <Info className="w-3 h-3 text-[#36C5F0]" />
              <span>FCM Background Delivery Architecture Specs</span>
            </button>

            {showFcmInfo && (
              <div className="mt-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                <p className="font-semibold text-white">How Background Delivery Works:</p>
                <p>
                  1. In-app alerts work continuously whenever HabitFlow is running.
                </p>
                <p>
                  2. For closed-browser push delivery, Firebase Cloud Messaging (FCM) requires generating VAPID Web Push credentials in the Firebase Console, deploying a <code>firebase-messaging-sw.js</code> service worker, and running a scheduled Cloud Function or server cron to dispatch FCM payloads.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Save Preferences Button */}
        <div className="flex items-center justify-end gap-3">
          {savedSuccess && (
            <span className="text-xs font-medium text-[#35D49A] flex items-center gap-1">
              <Check className="w-4 h-4" /> Preferences Saved
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F2] text-white text-xs font-semibold shadow-lg shadow-[#7C5CFC]/25 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Data Governance & Export */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
          <Shield className="w-4 h-4 text-[#35D49A]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Data Governance & Export
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          <div>
            <span className="text-xs font-medium text-[var(--text-primary)] block">
              Export Full Database Backup
            </span>
            <span className="text-[10px] text-[var(--text-secondary)]">
              Download your complete habits, daily completions, and notes as JSON
            </span>
          </div>

          <button
            type="button"
            onClick={handleExportData}
            disabled={exporting}
            className="min-h-[38px] px-4 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] hover:border-[#35D49A]/40 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-[#35D49A]" />
            <span>{exporting ? 'Exporting...' : 'Export JSON'}</span>
          </button>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-rose-400">
                Permanent Account & Data Wipe
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Permanently deletes your account authentication and cascades deletion across all Firestore habits, completion history, daily debriefs, and preferences. This action is irreversible.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="min-h-[38px] px-4 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-semibold transition shrink-0 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Confirm Account Deletion"
        message="Are you completely sure you want to delete your account and all associated Firestore records? All habit streaks, completions, notes, and settings will be permanently destroyed."
        confirmLabel="Permanently Delete Everything"
      />
    </div>
  );
};
