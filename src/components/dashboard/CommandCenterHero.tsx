import React from 'react';
import { Flame, CheckCircle2, TrendingUp, Sparkles, Plus, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitContext';

interface CommandCenterHeroProps {
  onOpenNewHabit: () => void;
  onOpenDailyReview: () => void;
  weeklyConsistencyRate: number;
}

export const CommandCenterHero: React.FC<CommandCenterHeroProps> = ({
  onOpenNewHabit,
  onOpenDailyReview,
  weeklyConsistencyRate,
}) => {
  const { userProfile, userSettings } = useAuth();
  const { dailyProgress, globalStreak } = useHabits();

  // Dynamic greeting based on current local hour
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 18
      ? 'Good afternoon'
      : 'Good evening';

  const displayName = userProfile?.displayName || userSettings?.displayName || 'Commander';

  // Motivational message based on daily percentage
  let motivationalMessage = 'Initialize your momentum. Complete your first routine of the day.';
  if (dailyProgress.percentage === 100 && dailyProgress.totalScheduled > 0) {
    motivationalMessage = 'Exemplary execution. All scheduled command protocols completed for today!';
  } else if (dailyProgress.percentage >= 60) {
    motivationalMessage = 'Outstanding velocity. You have crossed the majority threshold for today.';
  } else if (dailyProgress.percentage > 0) {
    motivationalMessage = 'Momentum established. Keep your focus locked on the remaining targets.';
  }

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-[#101522] via-[#141B2B] to-[#080B12] border border-[var(--border-subtle)] p-6 sm:p-8 overflow-hidden shadow-2xl">
      {/* Subtle futuristic backdrop light rings */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#7C5CFC]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#36C5F0]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Titles & Motivational Coaching */}
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-mono text-[#36C5F0]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COMMAND CENTER // PERSONAL PROGRESS</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Your Day. Your Progress.
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">
              {greeting}, <strong className="text-[var(--text-primary)] font-semibold">{displayName}</strong>. {motivationalMessage}
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onOpenNewHabit}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F2] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-[#7C5CFC]/25 hover:brightness-110 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Quick-Add Habit</span>
            </button>
            <button
              onClick={onOpenDailyReview}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-medium flex items-center gap-2 hover:border-[#36C5F0]/40 transition"
            >
              <BookOpen className="w-4 h-4 text-[#36C5F0]" />
              <span>Daily Notes Shortcut</span>
            </button>
          </div>
        </div>

        {/* Right: Key Telemetry HUD 4-box strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0 lg:w-80">
          {/* Daily Progress */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-subtle)] space-y-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] block">
              Daily Progress
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono-num text-[#35D49A]">
                {dailyProgress.percentage}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7C5CFC] to-[#35D49A] rounded-full transition-all duration-500"
                style={{ width: `${dailyProgress.percentage}%` }}
              />
            </div>
          </div>

          {/* Completed / Total */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-subtle)] space-y-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] block">
              Completed Habits
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold font-mono-num text-[#36C5F0]">
                {dailyProgress.completedCount}
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-mono-num">
                / {dailyProgress.totalScheduled}
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] block truncate">
              {dailyProgress.totalScheduled - dailyProgress.completedCount} remaining
            </span>
          </div>

          {/* Current Streak */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-subtle)] space-y-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#FFB454]" />
              Current Streak
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold font-mono-num text-[#FFB454]">
                {globalStreak.currentStreak}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">days</span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] block truncate">
              Best: {globalStreak.bestStreak} days
            </span>
          </div>

          {/* Weekly Consistency */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-subtle)] space-y-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#7C5CFC]" />
              Weekly Consistency
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold font-mono-num text-[#7C5CFC]">
                {weeklyConsistencyRate}%
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] block truncate">
              Past 7 calendar days
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
