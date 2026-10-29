import React, { useState } from 'react';
import { Plus, Search, Filter, CheckCircle2, Archive, Pause, Play } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitFormModal } from '../components/habits/HabitFormModal';
import { Habit, HabitCategory } from '../types';

const CATEGORIES: (HabitCategory | 'All')[] = [
  'All',
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

export const HabitsPage: React.FC = () => {
  const {
    habits,
    completions,
    selectedDateKey,
    addHabit,
    editHabit,
    deleteHabit,
    toggleArchive,
    togglePause,
    toggleCompletion,
    updateMeasurableProgress,
  } = useHabits();

  const [statusTab, setStatusTab] = useState<'active' | 'paused' | 'archived'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewHabitModalOpen, setIsNewHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const filteredHabits = habits.filter((h) => {
    // Status filter
    if (statusTab === 'active' && (h.isArchived || h.isPaused)) return false;
    if (statusTab === 'paused' && (!h.isPaused || h.isArchived)) return false;
    if (statusTab === 'archived' && !h.isArchived) return false;

    // Category filter
    if (selectedCategory !== 'All' && h.category !== selectedCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        h.title.toLowerCase().includes(q) ||
        h.description?.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Habit Matrix & Protocols
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Configure schedules, metrics, cadence, and reminders
          </p>
        </div>

        <button
          onClick={() => setIsNewHabitModalOpen(true)}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F2] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#7C5CFC]/25 hover:brightness-110 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Routine</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] shrink-0">
          <button
            onClick={() => setStatusTab('active')}
            className={`min-h-[36px] px-3.5 py-1.5 text-xs font-medium rounded-lg transition ${
              statusTab === 'active'
                ? 'bg-[#7C5CFC] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            Active ({habits.filter((h) => !h.isArchived && !h.isPaused).length})
          </button>
          <button
            onClick={() => setStatusTab('paused')}
            className={`min-h-[36px] px-3.5 py-1.5 text-xs font-medium rounded-lg transition ${
              statusTab === 'paused'
                ? 'bg-[#7C5CFC] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            Paused ({habits.filter((h) => h.isPaused && !h.isArchived).length})
          </button>
          <button
            onClick={() => setStatusTab('archived')}
            className={`min-h-[36px] px-3.5 py-1.5 text-xs font-medium rounded-lg transition ${
              statusTab === 'archived'
                ? 'bg-[#7C5CFC] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            Archived ({habits.filter((h) => h.isArchived).length})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[36px] px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-[#36C5F0]/20 text-[#36C5F0] border border-[#36C5F0]/40'
                  : 'text-[var(--text-secondary)] hover:text-white bg-[var(--bg-secondary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Habits Grid */}
      {filteredHabits.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
          <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-base font-semibold text-[var(--text-primary)]">
            No routines found
          </h4>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            {searchQuery
              ? 'No habits matched your search filters.'
              : statusTab === 'archived'
              ? 'You have not archived any routines.'
              : statusTab === 'paused'
              ? 'You have no paused routines.'
              : 'Initialize your first habit to begin building unstoppable momentum.'}
          </p>
          {statusTab === 'active' && (
            <button
              onClick={() => setIsNewHabitModalOpen(true)}
              className="min-h-[44px] mt-2 px-4 py-2 rounded-xl bg-[#7C5CFC] text-white text-xs font-semibold hover:bg-[#6848F2] transition"
            >
              Create New Habit
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {filteredHabits.map((habit) => {
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

      {/* Modals */}
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
    </div>
  );
};
