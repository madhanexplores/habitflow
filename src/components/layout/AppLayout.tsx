import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Bell, X, Check } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { MobileBottomNav } from './MobileBottomNav';
import { OfflineIndicator } from '../common/OfflineIndicator';
import { HabitFormModal } from '../habits/HabitFormModal';
import { useHabits } from '../../context/HabitContext';
import { useAuth } from '../../context/AuthContext';
import { useReminders } from '../../hooks/useReminders';

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const { habits, addHabit, toggleCompletion } = useHabits();
  const { userSettings } = useAuth();

  const { activeNotification, dismissNotification } = useReminders(
    habits,
    userSettings?.inAppReminders !== false
  );

  const handleSaveNewHabit = async (habitData: any) => {
    await addHabit(habitData);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenNewHabit={() => setIsHabitModalOpen(true)}
      />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar />

        {/* In-App Reminder Alert Toast */}
        {activeNotification && (
          <div className="mx-4 mt-3 z-30">
            <div className="rounded-xl bg-[#141B2B] border border-[#7C5CFC]/40 p-3 shadow-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#7C5CFC]/20 text-[#36C5F0]">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-[var(--text-primary)]">
                    Reminder: {activeNotification.habitTitle}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] block">
                    Scheduled for {activeNotification.reminderTime} · {activeNotification.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const habit = habits.find((h) => h.id === activeNotification.habitId);
                    if (habit) toggleCompletion(habit);
                    dismissNotification();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#35D49A] text-[#080B12] font-semibold flex items-center gap-1 hover:bg-[#35D49A]/90 transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>
                <button
                  onClick={dismissNotification}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 pb-24 md:pb-12 px-4 md:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav onOpenNewHabit={() => setIsHabitModalOpen(true)} />

        {/* Offline Indicator */}
        <OfflineIndicator />

        {/* New Habit Modal */}
        <HabitFormModal
          isOpen={isHabitModalOpen}
          onClose={() => setIsHabitModalOpen(false)}
          onSave={handleSaveNewHabit}
        />
      </div>
    </div>
  );
};
