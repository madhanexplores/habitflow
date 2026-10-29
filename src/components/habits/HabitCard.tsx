import React, { useState } from 'react';
import {
  Check,
  Flame,
  MoreVertical,
  Edit2,
  Archive,
  Trash2,
  Pause,
  Play,
  Clock,
  Target,
  Dumbbell,
  BookOpen,
  Code2,
  Video,
  Heart,
  Briefcase,
  GraduationCap,
  Brain,
  Droplets,
  Coffee,
  Moon,
  Sun,
  Bike,
  Music,
  Sparkles,
  Shield,
  Zap,
  Smile,
  Activity,
  Footprints,
  Pencil,
  Apple,
} from 'lucide-react';
import { Habit, HabitCompletion } from '../../types';
import { calculateHabitStreak } from '../../utils/date';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface HabitCardProps {
  habit: Habit;
  completion?: HabitCompletion;
  allCompletions: HabitCompletion[];
  dateKey: string;
  onToggle: (habit: Habit) => void;
  onUpdateProgress?: (habit: Habit, value: number) => void;
  onEdit: (habit: Habit) => void;
  onArchive: (habitId: string, current: boolean) => void;
  onPause: (habitId: string, current: boolean) => void;
  onDelete: (habitId: string) => void;
}

export const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  target: Target,
  dumbbell: Dumbbell,
  activity: Activity,
  book: BookOpen,
  code: Code2,
  brain: Brain,
  droplets: Droplets,
  flame: Flame,
  heart: Heart,
  coffee: Coffee,
  sun: Sun,
  moon: Moon,
  video: Video,
  briefcase: Briefcase,
  graduation: GraduationCap,
  pencil: Pencil,
  bike: Bike,
  footprints: Footprints,
  music: Music,
  sparkles: Sparkles,
  shield: Shield,
  zap: Zap,
  smile: Smile,
  apple: Apple,
};

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  completion,
  allCompletions,
  dateKey,
  onToggle,
  onEdit,
  onArchive,
  onPause,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const IconComponent = ICON_MAP[habit.icon] || Target;
  const isCompleted = completion?.status === 'completed';

  const stats = calculateHabitStreak(habit, allCompletions);

  // Friendly schedule string
  let scheduleText = 'Daily';
  if (habit.frequency === 'custom_days' && habit.selectedWeekdays) {
    if (habit.selectedWeekdays.length === 7) {
      scheduleText = 'Daily';
    } else {
      scheduleText = habit.selectedWeekdays
        .map((d) => WEEKDAY_NAMES[d])
        .join(', ');
    }
  } else if (habit.frequency === 'weekly_target') {
    scheduleText = 'Flexible Weekly';
  }

  return (
    <div
      className={`relative rounded-2xl bg-[var(--bg-card)] border transition-all duration-200 overflow-hidden ${
        isCompleted
          ? 'border-[#35D49A]/40 bg-gradient-to-r from-[var(--bg-card)] to-[#35D49A]/5 shadow-sm shadow-[#35D49A]/10'
          : 'border-[var(--border-subtle)] hover:border-[#7C5CFC]/30'
      } ${habit.isPaused ? 'opacity-60' : ''}`}
    >
      <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
        {/* Left: Icon + Title & Clean Subtitle */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Distinct Custom Icon */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform"
            style={{
              backgroundColor: isCompleted ? '#35D49A20' : `${habit.color}20`,
              borderColor: isCompleted ? '#35D49A60' : `${habit.color}40`,
              borderWidth: '1.5px',
              color: isCompleted ? '#35D49A' : habit.color,
            }}
          >
            <IconComponent className="w-6 h-6" />
          </div>

          {/* Name & Metadata */}
          <div className="min-w-0 flex-1">
            <h4
              className={`text-base font-bold tracking-tight truncate transition-colors ${
                isCompleted
                  ? 'text-[var(--text-primary)] line-through decoration-[#35D49A]/60 opacity-80'
                  : 'text-[var(--text-primary)]'
              }`}
            >
              {habit.title}
            </h4>

            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1 truncate">
              <span className="font-medium">{habit.category}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{scheduleText}</span>
              {habit.reminderEnabled && habit.reminderTime && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-[#FFB454]">
                    <Clock className="w-3 h-3" />
                    {habit.reminderTime}
                  </span>
                </>
              )}
              {habit.isPaused && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-[#FFB454] font-mono text-[10px] font-bold">PAUSED</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Streak & Clean Complete Button */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Streak Counter */}
          <div
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
            title={`Current Streak: ${stats.currentStreak} days (Best: ${stats.longestStreak} days)`}
          >
            <Flame className="w-4 h-4 text-[#FFB454]" />
            <span className="text-xs font-mono-num font-bold text-[#FFB454]">
              {stats.currentStreak}d
            </span>
          </div>

          {/* Single Touch Complete Button */}
          <button
            type="button"
            onClick={() => onToggle(habit)}
            className={`min-h-[44px] min-w-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 shadow-md ${
              isCompleted
                ? 'bg-[#35D49A] text-[#080B12] shadow-[#35D49A]/20 hover:brightness-105'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[#35D49A]/50 border border-[var(--border-subtle)] hover:text-[#35D49A]'
            }`}
            aria-label={isCompleted ? `Mark ${habit.title} incomplete` : `Mark ${habit.title} complete`}
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                isCompleted
                  ? 'border-[#080B12] bg-[#080B12] text-[#35D49A]'
                  : 'border-slate-500 bg-transparent'
              }`}
            >
              {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <span className="hidden sm:inline font-bold">
              {isCompleted ? 'Done' : 'Complete'}
            </span>
          </button>

          {/* Overflow Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="min-h-[44px] min-w-[36px] flex items-center justify-center p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-slate-800/40 transition"
              aria-label="Habit options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-10 z-50 w-44 rounded-xl bg-[#141B2B] border border-slate-700 shadow-2xl py-1 text-xs">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(habit);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Habit</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onPause(habit.id, habit.isPaused);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                  >
                    {habit.isPaused ? (
                      <>
                        <Play className="w-3.5 h-3.5 text-[#35D49A]" />
                        <span>Resume Habit</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5 text-[#FFB454]" />
                        <span>Pause Habit</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onArchive(habit.id, habit.isArchived);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>{habit.isArchived ? 'Unarchive' : 'Archive Habit'}</span>
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Habit</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete(habit.id)}
        title="Delete Habit"
        message={`Are you sure you want to permanently delete "${habit.title}"?`}
        confirmLabel="Delete Habit"
      />
    </div>
  );
};
