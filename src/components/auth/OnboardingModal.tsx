import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, Shield, Rocket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitContext';

interface OnboardingModalProps {
  isOpen: boolean;
}

const GOALS = [
  'Deep Work & Focus',
  'Consistent Daily Coding',
  'Fitness & Physical Vitality',
  'Reading & Lifelong Learning',
  'Content Creation & Publishing',
  'College & Academic Discipline',
  'Personal Growth & Reflection',
];

const STARTER_HABITS = [
  {
    title: 'Deep Focus Work Sprint',
    description: 'Uninterrupted creative and engineering sprint',
    category: 'Projects',
    habitType: 'binary' as const,
    targetValue: 1,
    unit: 'times',
    frequency: 'daily' as const,
    icon: 'code',
    color: '#7C5CFC',
    selectedWeekdays: [0, 1, 2, 3, 4, 5, 6],
    startDate: new Date().toISOString().slice(0, 10),
    reminderEnabled: true,
    reminderTime: '10:00',
    isArchived: false,
    isPaused: false,
    order: 1,
  },
  {
    title: 'Read Books & Mental Models',
    description: 'Expand mental models and strategic foundations',
    category: 'Learning',
    habitType: 'binary' as const,
    targetValue: 1,
    unit: 'times',
    frequency: 'daily' as const,
    icon: 'book',
    color: '#36C5F0',
    selectedWeekdays: [0, 1, 2, 3, 4, 5, 6],
    startDate: new Date().toISOString().slice(0, 10),
    reminderEnabled: true,
    reminderTime: '21:00',
    isArchived: false,
    isPaused: false,
    order: 2,
  },
  {
    title: 'Workout & Physical Training',
    description: 'Strength training, cardio, or active mobility',
    category: 'Fitness',
    habitType: 'binary' as const,
    targetValue: 1,
    unit: 'times',
    frequency: 'daily' as const,
    icon: 'dumbbell',
    color: '#35D49A',
    selectedWeekdays: [0, 1, 2, 3, 4, 5, 6],
    startDate: new Date().toISOString().slice(0, 10),
    reminderEnabled: false,
    isArchived: false,
    isPaused: false,
    order: 3,
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen }) => {
  const { currentUser, userProfile, completeOnboarding } = useAuth();
  const { addHabit } = useHabits();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [themePreference, setThemePreference] = useState<'dark' | 'light'>('dark');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Deep Work & Focus',
    'Consistent Daily Coding',
  ]);
  const [addStarters, setAddStarters] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await completeOnboarding(
        displayName.trim() || 'Commander',
        themePreference,
        selectedGoals
      );

      // Initialize starter habits if opted-in
      if (addStarters) {
        for (const habit of STARTER_HABITS) {
          await addHabit(habit);
        }
      }
    } catch (err) {
      console.error('Onboarding completion error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#141B2B] border border-[#7C5CFC]/40 shadow-2xl p-6 sm:p-8 text-[#F5F7FF] my-8 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-[#7C5CFC]/20 border border-[#7C5CFC]/50 text-[#36C5F0] flex items-center justify-center mx-auto mb-2">
            <Rocket className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome to HabitFlow
          </h2>
          <p className="text-xs text-[#98A2B8]">
            Calibrate your command center to match your routine and aspirations
          </p>
        </div>

        <form onSubmit={handleFinish} className="space-y-5">
          {/* Callsign / Display Name */}
          <div>
            <label className="block text-xs font-semibold text-[#98A2B8] mb-1">
              Your Callsign / Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Neo, Maya, Alexander"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101522] border border-slate-700 text-xs text-white focus:outline-none focus:border-[#7C5CFC]"
            />
          </div>

          {/* Theme Preference */}
          <div>
            <label className="block text-xs font-semibold text-[#98A2B8] mb-1.5">
              Preferred Command Center Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setThemePreference('dark')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  themePreference === 'dark'
                    ? 'bg-[#101522] border-[#7C5CFC] text-white shadow-lg shadow-[#7C5CFC]/20'
                    : 'bg-[#101522]/40 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-[#080B12] border border-[#7C5CFC]" />
                <span>Futuristic Dark</span>
              </button>

              <button
                type="button"
                onClick={() => setThemePreference('light')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  themePreference === 'light'
                    ? 'bg-[#F4F6FB] border-[#7C5CFC] text-slate-900 shadow-md'
                    : 'bg-[#101522]/40 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-white border border-slate-300" />
                <span>Clean Light</span>
              </button>
            </div>
          </div>

          {/* General Goals */}
          <div>
            <label className="block text-xs font-semibold text-[#98A2B8] mb-1.5">
              Primary Focus & Goals (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GOALS.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isSelected
                        ? 'bg-[#7C5CFC] text-white'
                        : 'bg-[#101522] text-[#98A2B8] hover:text-white border border-slate-800'
                    }`}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preload Starter Habits */}
          <div className="p-3.5 rounded-2xl bg-[#101522] border border-slate-800 flex items-start gap-3">
            <input
              type="checkbox"
              id="starters"
              checked={addStarters}
              onChange={(e) => setAddStarters(e.target.checked)}
              className="w-4 h-4 rounded text-[#7C5CFC] focus:ring-[#7C5CFC] mt-0.5 cursor-pointer"
            />
            <label htmlFor="starters" className="text-xs cursor-pointer">
              <span className="font-semibold text-white block">
                Initialize with 3 Proven High-Performance Routines
              </span>
              <span className="text-[11px] text-[#98A2B8] block mt-0.5">
                Includes Deep Focus (45m), Reading (15 pages), and Physical Workout (30m).
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[44px] px-5 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] via-[#6848F2] to-[#36C5F0] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-[#7C5CFC]/30 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
          >
            <span>{submitting ? 'Setting up Command Station...' : 'Launch Command Center'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
