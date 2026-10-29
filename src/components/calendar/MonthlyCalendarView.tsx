import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  Calendar as CalendarIcon,
  Filter,
  Check,
} from 'lucide-react';
import { Habit, HabitCompletion } from '../../types';
import {
  formatDateKey,
  calculateDailyProgress,
  calculateHabitStreak,
  isHabitScheduledOnDate,
} from '../../utils/date';

interface MonthlyCalendarViewProps {
  habits: Habit[];
  completions: HabitCompletion[];
  onToggleHabitCompletion: (habit: Habit, dateKey: string) => void;
}

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  habits,
  completions,
  onToggleHabitCompletion,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());
  const [filterHabitId, setFilterHabitId] = useState<string>('all');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Filtered habits list
  const activeHabits = habits.filter((h) => !h.isArchived);
  const targetedHabits = filterHabitId === 'all'
    ? activeHabits
    : activeHabits.filter((h) => h.id === filterHabitId);

  // Calculate monthly stats
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  let totalScheduledInMonth = 0;
  let totalCompletedInMonth = 0;

  for (const day of monthDays) {
    const progress = calculateDailyProgress(targetedHabits, completions, day);
    totalScheduledInMonth += progress.totalScheduled;
    totalCompletedInMonth += progress.completedCount;
  }

  const monthlyRate = totalScheduledInMonth > 0
    ? Math.round((totalCompletedInMonth / totalScheduledInMonth) * 100)
    : 0;
  const missedDaysInMonth = Math.max(0, totalScheduledInMonth - totalCompletedInMonth);

  // Selected date details
  const selectedDateKey = formatDateKey(selectedCalendarDate);
  const selectedDayProgress = calculateDailyProgress(targetedHabits, completions, selectedCalendarDate);

  // Habit streak if single habit selected
  const selectedHabit = filterHabitId !== 'all' ? habits.find((h) => h.id === filterHabitId) : null;
  const habitStreakStats = selectedHabit ? calculateHabitStreak(selectedHabit, completions) : null;

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <span className="text-xs text-[var(--text-secondary)]">Monthly Completion</span>
          <p className="text-2xl font-bold font-mono-num text-[#35D49A]">
            {monthlyRate}%
          </p>
          <span className="text-[10px] text-[var(--text-secondary)]">
            {totalCompletedInMonth} / {totalScheduledInMonth} scheduled
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <span className="text-xs text-[var(--text-secondary)]">Missed Routines</span>
          <p className="text-2xl font-bold font-mono-num text-[#FFB454]">
            {missedDaysInMonth}
          </p>
          <span className="text-[10px] text-[var(--text-secondary)]">Scheduled unfulfilled</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <span className="text-xs text-[var(--text-secondary)]">Total Completions</span>
          <p className="text-2xl font-bold font-mono-num text-[#36C5F0]">
            {totalCompletedInMonth}
          </p>
          <span className="text-[10px] text-[var(--text-secondary)]">In {format(currentMonth, 'MMMM')}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#FFB454]" />
            {selectedHabit ? 'Habit Streak' : 'Focus Mode'}
          </span>
          <p className="text-2xl font-bold font-mono-num text-[#FFB454]">
            {selectedHabit && habitStreakStats ? `${habitStreakStats.currentStreak}d` : `${targetedHabits.length} Habits`}
          </p>
          <span className="text-[10px] text-[var(--text-secondary)]">
            {selectedHabit && habitStreakStats ? `Best: ${habitStreakStats.longestStreak}d` : 'Tracking active'}
          </span>
        </div>
      </div>

      {/* Calendar Controls & Habit Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:border-[#7C5CFC]/40 transition"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-bold text-[var(--text-primary)] font-mono min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:border-[#7C5CFC]/40 transition"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="text-xs text-[#36C5F0] hover:underline font-mono"
          >
            Current Month
          </button>
        </div>

        {/* Habit Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <select
            value={filterHabitId}
            onChange={(e) => setFilterHabitId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#7C5CFC]"
          >
            <option value="all">All Active Habits ({activeHabits.length})</option>
            {activeHabits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.title} ({h.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Calendar Grid and Day Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 space-y-3">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs text-[var(--text-secondary)] font-semibold pb-2 border-b border-[var(--border-subtle)]">
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
            <span>SUN</span>
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((day) => {
              const inMonth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selectedCalendarDate);
              const today = isToday(day);
              const progress = calculateDailyProgress(targetedHabits, completions, day);

              let badgeColor = 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]';
              let ringColor = '';

              if (progress.totalScheduled > 0) {
                if (progress.percentage === 100) {
                  badgeColor = 'bg-[#35D49A]/20 text-[#35D49A] border border-[#35D49A]/50';
                } else if (progress.percentage >= 50) {
                  badgeColor = 'bg-[#7C5CFC]/25 text-[#A855F7] border border-[#7C5CFC]/50';
                } else if (progress.percentage > 0) {
                  badgeColor = 'bg-[#36C5F0]/20 text-[#36C5F0] border border-[#36C5F0]/50';
                } else {
                  badgeColor = 'bg-slate-900/60 text-slate-500 border border-slate-800';
                }
              }

              if (isSelected) {
                ringColor = 'ring-2 ring-[#7C5CFC] scale-[1.03] z-10';
              } else if (today) {
                ringColor = 'ring-1 ring-[#36C5F0]';
              }

              return (
                <button
                  key={formatDateKey(day)}
                  onClick={() => setSelectedCalendarDate(day)}
                  className={`min-h-[58px] sm:min-h-[70px] p-1.5 sm:p-2 rounded-xl flex flex-col justify-between transition relative ${
                    inMonth ? '' : 'opacity-30'
                  } ${badgeColor} ${ringColor}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs sm:text-sm font-bold font-mono-num">
                      {format(day, 'd')}
                    </span>
                    {today && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#36C5F0]" title="Today" />
                    )}
                  </div>

                  {progress.totalScheduled > 0 ? (
                    <div className="text-[10px] font-mono-num font-semibold text-right w-full">
                      {progress.completedCount}/{progress.totalScheduled}
                    </div>
                  ) : (
                    <div className="text-[9px] text-slate-600 font-mono text-right w-full">
                      —
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#35D49A]/30 border border-[#35D49A]/60" />
              <span>100% Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#7C5CFC]/30 border border-[#7C5CFC]/60" />
              <span>50–99%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#36C5F0]/30 border border-[#36C5F0]/60" />
              <span>1–49%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-900 border border-slate-800" />
              <span>0% / Uncompleted</span>
            </div>
          </div>
        </div>

        {/* Selected Date Inspector / Habit Quick Toggle Panel */}
        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-[11px] font-mono text-[#36C5F0] block">
                  {format(selectedCalendarDate, 'EEEE')}
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {format(selectedCalendarDate, 'MMMM d, yyyy')}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-[#35D49A]">
                  {selectedDayProgress.percentage}%
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] block">
                  {selectedDayProgress.completedCount} / {selectedDayProgress.totalScheduled}
                </span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mt-3">
              Inspect and adjust completions for this historical date:
            </p>

            <div className="space-y-2.5 mt-3 max-h-[360px] overflow-y-auto pr-1">
              {selectedDayProgress.scheduledHabits.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--text-secondary)]">
                  No habits were scheduled for this date.
                </div>
              ) : (
                selectedDayProgress.scheduledHabits.map((habit) => {
                  const comp = completions.find(
                    (c) => c.habitId === habit.id && c.dateKey === selectedDateKey
                  );
                  const isDone = comp?.status === 'completed';

                  return (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: habit.color }}
                        />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                            {habit.title}
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)]">
                            {habit.category} · {habit.frequency === 'daily' ? 'Daily' : 'Scheduled'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleHabitCompletion(habit, selectedDateKey)}
                        className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                          isDone
                            ? 'bg-[#35D49A] text-[#080B12]'
                            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)]'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isDone ? 'Done' : 'Check'}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400">
            Historical corrections automatically recalculate all streak chains safely without data loss.
          </div>
        </div>
      </div>
    </div>
  );
};
