import React, { useState, useEffect } from 'react';
import {
  Check,
  Calendar,
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
import { Modal } from '../common/Modal';
import { Habit, HabitCategory, HabitFrequency, HabitType } from '../../types';
import { formatDateKey } from '../../utils/date';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialHabit?: Habit | null;
}

const CATEGORIES: HabitCategory[] = [
  'Learning',
  'Fitness',
  'Projects',
  'Content Creation',
  'College',
  'Freelancing',
  'Personal Growth',
  'Health',
  'Custom',
];

export const AVAILABLE_ICONS = [
  { id: 'target', label: 'Target', Icon: Target },
  { id: 'dumbbell', label: 'Fitness', Icon: Dumbbell },
  { id: 'activity', label: 'Exercise', Icon: Activity },
  { id: 'footprints', label: 'Walk', Icon: Footprints },
  { id: 'bike', label: 'Cycling', Icon: Bike },
  { id: 'book', label: 'Reading', Icon: BookOpen },
  { id: 'code', label: 'Coding', Icon: Code2 },
  { id: 'brain', label: 'Mind / Study', Icon: Brain },
  { id: 'pencil', label: 'Writing', Icon: Pencil },
  { id: 'droplets', label: 'Water', Icon: Droplets },
  { id: 'apple', label: 'Nutrition', Icon: Apple },
  { id: 'heart', label: 'Health', Icon: Heart },
  { id: 'coffee', label: 'Coffee', Icon: Coffee },
  { id: 'sun', label: 'Morning', Icon: Sun },
  { id: 'moon', label: 'Sleep', Icon: Moon },
  { id: 'music', label: 'Music', Icon: Music },
  { id: 'video', label: 'Video', Icon: Video },
  { id: 'briefcase', label: 'Work', Icon: Briefcase },
  { id: 'graduation', label: 'College', Icon: GraduationCap },
  { id: 'sparkles', label: 'Growth', Icon: Sparkles },
  { id: 'shield', label: 'Discipline', Icon: Shield },
  { id: 'zap', label: 'Energy', Icon: Zap },
  { id: 'smile', label: 'Wellness', Icon: Smile },
];

const COLORS = [
  '#7C5CFC', // Violet
  '#36C5F0', // Cyan
  '#35D49A', // Emerald
  '#FFB454', // Amber
  '#F43F5E', // Rose
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#3B82F6', // Blue
  '#EAB308', // Gold
];

const WEEKDAYS = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
];

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHabit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory | string>('Learning');
  const [icon, setIcon] = useState('target');
  const [color, setColor] = useState('#7C5CFC');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title);
      setCategory(initialHabit.category);
      setIcon(initialHabit.icon || 'target');
      setColor(initialHabit.color || '#7C5CFC');
      setFrequency(initialHabit.frequency || 'daily');
      setSelectedWeekdays(initialHabit.selectedWeekdays || [0, 1, 2, 3, 4, 5, 6]);
      setReminderEnabled(initialHabit.reminderEnabled || false);
      setReminderTime(initialHabit.reminderTime || '09:00');
    } else {
      setTitle('');
      setCategory('Learning');
      setIcon('target');
      setColor('#7C5CFC');
      setFrequency('daily');
      setSelectedWeekdays([0, 1, 2, 3, 4, 5, 6]);
      setReminderEnabled(false);
      setReminderTime('09:00');
    }
    setError(null);
  }, [initialHabit, isOpen]);

  const toggleWeekday = (day: number) => {
    if (selectedWeekdays.includes(day)) {
      if (selectedWeekdays.length === 1) return;
      setSelectedWeekdays(selectedWeekdays.filter((d) => d !== day));
    } else {
      setSelectedWeekdays([...selectedWeekdays, day].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a habit name.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        description: '',
        category,
        icon,
        color,
        habitType: 'binary',
        targetValue: 1,
        unit: 'times',
        frequency,
        selectedWeekdays: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : selectedWeekdays,
        startDate: initialHabit ? initialHabit.startDate : formatDateKey(new Date()),
        endDate: null,
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : undefined,
        isArchived: initialHabit ? initialHabit.isArchived : false,
        isPaused: initialHabit ? initialHabit.isPaused : false,
        order: initialHabit?.order ?? Date.now(),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save habit');
    } finally {
      setSaving(false);
    }
  };

  const SelectedIconComponent = AVAILABLE_ICONS.find((i) => i.id === icon)?.Icon || Target;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialHabit ? 'Edit Habit' : 'New Habit'}
      subtitle="Select an icon, choose a name, and start tracking"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Live Preview Card */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-all"
            style={{
              backgroundColor: `${color}20`,
              borderColor: `${color}40`,
              borderWidth: '1.5px',
              color: color,
            }}
          >
            <SelectedIconComponent className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">
              Preview
            </span>
            <p className="text-base font-bold text-[var(--text-primary)] truncate">
              {title || 'Your Habit Name'}
            </p>
            <span className="text-xs text-[var(--text-secondary)]">
              {category} · {frequency === 'daily' ? 'Daily' : 'Custom Days'}
            </span>
          </div>
        </div>

        {/* Habit Name Input */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
            Habit Name *
          </label>
          <input
            type="text"
            required
            maxLength={160}
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Read 20 mins, Gym Workout, Coding, Hydrate, Meditate"
            className="w-full px-3.5 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
          />
        </div>

        {/* Select Icon (Rich Grid) */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            Select Habit Icon
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] max-h-44 overflow-y-auto">
            {AVAILABLE_ICONS.map(({ id, label, Icon }) => {
              const isSelected = icon === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setIcon(id)}
                  title={label}
                  className={`min-h-[44px] rounded-xl flex flex-col items-center justify-center gap-1 p-1 transition ${
                    isSelected
                      ? 'bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/30 scale-105'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-medium truncate w-full text-center">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            Accent Color
          </label>
          <div className="flex items-center gap-2.5 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              >
                {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Category & Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#7C5CFC]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Frequency
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`py-1.5 text-xs font-medium rounded-lg transition ${
                  frequency === 'daily'
                    ? 'bg-[#7C5CFC] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                Every Day
              </button>
              <button
                type="button"
                onClick={() => setFrequency('custom_days')}
                className={`py-1.5 text-xs font-medium rounded-lg transition ${
                  frequency === 'custom_days'
                    ? 'bg-[#7C5CFC] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                Specific Days
              </button>
            </div>
          </div>
        </div>

        {/* Specific Weekdays Selector */}
        {frequency === 'custom_days' && (
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Select Days
            </label>
            <div className="grid grid-cols-7 gap-1.5 p-2 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
              {WEEKDAYS.map(({ day, label }) => {
                const active = selectedWeekdays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWeekday(day)}
                    className={`min-h-[40px] rounded-lg text-xs font-bold transition flex items-center justify-center ${
                      active
                        ? 'bg-[#36C5F0] text-[#080B12] shadow-sm'
                        : 'bg-[var(--bg-card)] text-slate-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Optional Reminder */}
        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[#FFB454]" />
            <div>
              <span className="text-xs font-medium text-[var(--text-primary)] block">
                Daily Reminder Alert
              </span>
              <span className="text-[10px] text-[var(--text-secondary)]">
                Notify when it's time for this routine
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {reminderEnabled && (
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-2 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            )}
            <input
              type="checkbox"
              id="reminderEnabled"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-[#7C5CFC] focus:ring-[#7C5CFC] cursor-pointer"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl text-[var(--text-secondary)] hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F2] text-white shadow-lg shadow-[#7C5CFC]/25 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : initialHabit ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
