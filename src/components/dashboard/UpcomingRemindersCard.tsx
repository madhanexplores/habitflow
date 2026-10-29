import React from 'react';
import { Clock, Bell, Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Habit, HabitCompletion } from '../../types';
import { isHabitScheduledOnDate } from '../../utils/date';

interface UpcomingRemindersCardProps {
  habits: Habit[];
  completions: HabitCompletion[];
  dateKey: string;
  onToggleCompletion: (habit: Habit) => void;
}

export const UpcomingRemindersCard: React.FC<UpcomingRemindersCardProps> = ({
  habits,
  completions,
  dateKey,
  onToggleCompletion,
}) => {
  const today = new Date();

  // Find habits with reminders scheduled for today
  const reminderHabits = habits
    .filter(
      (h) =>
        !h.isArchived &&
        !h.isPaused &&
        h.reminderEnabled &&
        h.reminderTime &&
        isHabitScheduledOnDate(h, today)
    )
    .sort((a, b) => (a.reminderTime || '').localeCompare(b.reminderTime || ''));

  return (
    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 space-y-3 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-[#36C5F0]" />
            Upcoming Reminders
          </h3>
          <span className="text-[11px] font-mono text-[var(--text-secondary)]">
            {reminderHabits.length} ACTIVE
          </span>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          Scheduled routines for today's cadence
        </p>

        <div className="space-y-2 mt-3">
          {reminderHabits.length === 0 ? (
            <div className="py-4 text-center">
              <Clock className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
              <p className="text-xs text-[var(--text-secondary)]">
                No reminders scheduled for today.
              </p>
              <Link
                to="/habits"
                className="inline-block mt-2 text-xs text-[#7C5CFC] hover:underline"
              >
                Configure habit reminders →
              </Link>
            </div>
          ) : (
            reminderHabits.slice(0, 3).map((habit) => {
              const comp = completions.find(
                (c) => c.habitId === habit.id && c.dateKey === dateKey
              );
              const isDone = comp?.status === 'completed';

              return (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-mono text-[11px] font-semibold text-[#FFB454] px-1.5 py-0.5 rounded bg-slate-800/80">
                      {habit.reminderTime}
                    </span>
                    <span className="font-medium text-[var(--text-primary)] truncate">
                      {habit.title}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleCompletion(habit)}
                    className={`min-h-[32px] px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                      isDone
                        ? 'bg-[#35D49A]/20 text-[#35D49A]'
                        : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)]'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>{isDone ? 'Done' : 'Check'}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-[var(--border-subtle)] text-right">
        <Link
          to="/habits"
          className="text-xs text-[var(--text-secondary)] hover:text-[#36C5F0] transition inline-flex items-center gap-1"
        >
          <span>Manage all routines</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
