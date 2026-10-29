import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckCircle2,
  CalendarDays,
  BarChart3,
  BookOpen,
  Settings,
  Flame,
  Plus,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ListTodo,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitContext';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenNewHabit: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onOpenNewHabit,
}) => {
  const { userProfile, userSettings, logout } = useAuth();
  const { globalStreak, dailyProgress } = useHabits();

  const navItems = [
    { to: '/', label: 'Command Center', icon: LayoutDashboard },
    { to: '/habits', label: 'Habit Matrix', icon: CheckCircle2 },
    { to: '/tasks', label: 'Task Matrix', icon: ListTodo },
    { to: '/calendar', label: 'Calendar & Streaks', icon: CalendarDays },
    { to: '/analytics', label: 'Telemetry & Progress', icon: BarChart3 },
    { to: '/notes', label: 'Daily Review & Notes', icon: BookOpen },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-subtle)] shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#36C5F0] p-0.5 shrink-0 shadow-lg shadow-[#7C5CFC]/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#080B12] rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-sm tracking-wider bg-gradient-to-r from-[#7C5CFC] to-[#36C5F0] bg-clip-text text-transparent">
                HF
              </span>
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sm tracking-wide text-[var(--text-primary)]">
                HabitFlow
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                COMMAND CENTER
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-800/40 transition shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <button
          onClick={onOpenNewHabit}
          className={`w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F2] text-white font-medium text-xs py-2.5 px-3 shadow-lg shadow-[#7C5CFC]/25 hover:brightness-110 active:scale-[0.98] transition`}
          title="Create a new habit"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>New Habit</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto pt-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#7C5CFC]/15 text-[#36C5F0] border border-[#7C5CFC]/30 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-800/30'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Stats Mini HUD (when expanded) */}
      {!collapsed && (
        <div className="px-3 py-2.5 mx-3 mb-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#FFB454]" />
              Streak
            </span>
            <span className="font-mono-num font-bold text-[#FFB454]">
              {globalStreak.currentStreak}d
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-[var(--text-secondary)]">
              <span>Today</span>
              <span className="font-mono-num font-semibold text-[#35D49A]">
                {dailyProgress.completedCount}/{dailyProgress.totalScheduled} ({dailyProgress.percentage}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7C5CFC] via-[#36C5F0] to-[#35D49A] transition-all duration-500 rounded-full"
                style={{ width: `${dailyProgress.percentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer Profile & Install */}
      <div className="p-3 border-t border-[var(--border-subtle)] space-y-2 shrink-0">
        {!collapsed && (
          <div className="px-1">
            <PWAInstallButton />
          </div>
        )}

        <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl bg-slate-900/30">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7C5CFC] to-[#36C5F0] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {userProfile?.displayName?.charAt(0).toUpperCase() || 'C'}
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                  {userProfile?.displayName || userSettings?.displayName || 'Commander'}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] truncate">
                  {userProfile?.email}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => logout()}
              className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-rose-400 hover:bg-slate-800/40 transition shrink-0"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
