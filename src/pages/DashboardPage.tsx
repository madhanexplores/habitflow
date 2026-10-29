import React, { useState } from 'react';
import { Plus, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';
import { CommandCenterHero } from '../components/dashboard/CommandCenterHero';
import { WeeklyMiniChart } from '../components/dashboard/WeeklyMiniChart';
import { UpcomingRemindersCard } from '../components/dashboard/UpcomingRemindersCard';
import { DailyReviewCard } from '../components/dashboard/DailyReviewCard';
import { DateNavigator } from '../components/habits/DateNavigator';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitFormModal } from '../components/habits/HabitFormModal';
import { DailyReviewTemplateModal } from '../components/notes/DailyReviewTemplateModal';
import { TodayTasksCard } from '../components/dashboard/TodayTasksCard';
import { Habit } from '../types';
import { isHabitScheduledOnDate } from '../utils/date';
import { computeAnalytics } from '../services/analytics';

export const DashboardPage: React.FC = () => {
  const {
    habits,
    completions,
    notes,
    selectedDate,
    setSelectedDate,
    selectedDateKey,
    dailyProgress,
    addHabit,
    editHabit,
    deleteHabit,
    toggleArchive,
    togglePause,
    toggleCompletion,
    updateMeasurableProgress,
    addNote,
  } = useHabits();

  const [isNewHabitModalOpen, setIsNewHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Compute 7-day consistency rate from actual Firestore data
  const weeklyAnalytics = computeAnalytics(habits, completions, 7, selectedDate);

  // Scheduled habits for currently selected date
  const activeHabits = habits.filter((h) => !h.isArchived && !h.isPaused);
  const scheduledForSelectedDate = activeHabits.filter((h) =>
    isHabitScheduledOnDate(h, selectedDate)
  );

  const todayNotes = notes.filter((n) => n.dateKey === selectedDateKey);

  return (
    <div className="space-y-6">
      {/* Hero Command Center Header */}
      <CommandCenterHero
        onOpenNewHabit={() => setIsNewHabitModalOpen(true)}
        onOpenDailyReview={() => setIsReviewModalOpen(true)}
        weeklyConsistencyRate={weeklyAnalytics.averageRate}
      />

      {/* Date Navigator */}
      <DateNavigator
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Main Checklist & Side Telemetry Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Habit Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                Scheduled Protocols
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {scheduledForSelectedDate.length} routines scheduled for this day
              </p>
            </div>

            <button
              onClick={() => setIsNewHabitModalOpen(true)}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs font-semibold text-[#36C5F0] hover:border-[#36C5F0]/40 flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Routine</span>
            </button>
          </div>

          {scheduledForSelectedDate.length === 0 ? (
            <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-8 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                No habits scheduled for this day
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                Take this opportunity to rest or add a new scheduled habit to your daily roster.
              </p>
              <button
                onClick={() => setIsNewHabitModalOpen(true)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#7C5CFC] text-white text-xs font-semibold hover:bg-[#6848F2] transition"
              >
                Create Habit
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledForSelectedDate.map((habit) => {
                const completion = completions.find(
                  (c) => c.habitId === habit.id && c.dateKey === selectedDateKey
                );
                return (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    completion={completion}
                    allCompletions={completions}
                    dateKey={selectedDateKey}
                    onToggle={(h) => toggleCompletion(h, selectedDateKey)}
                    onEdit={(h) => setEditingHabit(h)}
                    onArchive={toggleArchive}
                    onPause={togglePause}
                    onDelete={deleteHabit}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Mini Pulse, Reminders & Review Shortcut */}
        <div className="space-y-6">
          <TodayTasksCard />

          <WeeklyMiniChart
            habits={habits}
            completions={completions}
            referenceDate={selectedDate}
          />

          <UpcomingRemindersCard
            habits={habits}
            completions={completions}
            dateKey={selectedDateKey}
            onToggleCompletion={(h) => toggleCompletion(h, selectedDateKey)}
          />

          <DailyReviewCard
            todayNotes={todayNotes}
            onOpenReviewModal={() => setIsReviewModalOpen(true)}
          />
        </div>
      </div>

      {/* Habit Create / Edit Modals */}
      <HabitFormModal
        isOpen={isNewHabitModalOpen}
        onClose={() => setIsNewHabitModalOpen(false)}
        onSave={async (data) => {
          await addHabit(data);
        }}
      />

      {editingHabit && (
        <HabitFormModal
          isOpen={true}
          onClose={() => setEditingHabit(null)}
          initialHabit={editingHabit}
          onSave={async (data) => {
            await editHabit(editingHabit.id, data);
            setEditingHabit(null);
          }}
        />
      )}

      {/* Daily Review Template Modal */}
      <DailyReviewTemplateModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        selectedDate={selectedDate}
        existingNote={todayNotes.find(
          (n) => n.category === 'reflection' || !!n.reviewAnswers
        )}
        onSave={async (data) => {
          await addNote(data);
        }}
      />
    </div>
  );
};
