import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import { Habit, HabitCompletion, Note, CompletionStatus } from '../types';
import {
  subscribeToHabits,
  createHabit as apiCreateHabit,
  updateHabit as apiUpdateHabit,
  toggleArchiveHabit as apiToggleArchive,
  togglePauseHabit as apiTogglePause,
  deleteHabit as apiDeleteHabit,
} from '../services/habits';
import {
  subscribeToCompletions,
  recordHabitCompletion,
  removeHabitCompletion,
} from '../services/completions';
import {
  subscribeToNotes,
  createNote as apiCreateNote,
  updateNote as apiUpdateNote,
  deleteNote as apiDeleteNote,
} from '../services/notes';
import {
  formatDateKey,
  calculateDailyProgress,
  calculateGlobalStreak,
} from '../utils/date';
import {
  getInitialDemoHabits,
  getInitialDemoCompletions,
  getInitialDemoNotes,
} from '../utils/demoData';

interface DailySummary {
  totalScheduled: number;
  completedCount: number;
  partialCount: number;
  percentage: number;
  scheduledHabits: Habit[];
}

interface HabitContextType {
  habits: Habit[];
  completions: HabitCompletion[];
  notes: Note[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedDateKey: string;
  loadingData: boolean;
  syncing: boolean;
  dailyProgress: DailySummary;
  globalStreak: { currentStreak: number; bestStreak: number };
  // Habit actions
  addHabit: (habitData: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Habit | undefined>;
  editHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>;
  toggleArchive: (habitId: string, current: boolean) => Promise<void>;
  togglePause: (habitId: string, current: boolean) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  // Completion actions
  toggleCompletion: (habit: Habit, dateKey?: string) => Promise<void>;
  updateMeasurableProgress: (habit: Habit, progressValue: number, dateKey?: string) => Promise<void>;
  undoCompletion: (habitId: string, dateKey?: string) => Promise<void>;
  // Note actions
  addNote: (data: { title: string; content: string; category: any; dateKey: string; tags?: string[]; reviewAnswers?: any }) => Promise<Note | undefined>;
  editNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Web Audio subtle chime/click synthesizer
function playCelebrationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Arpeggio
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16); // G5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.24); // C6

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch {
    // Ignore audio context errors if blocked by browser policy
  }
}

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userSettings } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loadingData, setLoadingData] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const selectedDateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);

  useEffect(() => {
    if (!currentUser) {
      setHabits([]);
      setCompletions([]);
      setNotes([]);
      setLoadingData(false);
      return;
    }

    // Demo Mode handling
    if (currentUser.uid === 'demo_commander') {
      try {
        const savedHabits = localStorage.getItem('habitflow_demo_habits');
        const savedCompletions = localStorage.getItem('habitflow_demo_completions');
        const savedNotes = localStorage.getItem('habitflow_demo_notes');

        setHabits(savedHabits ? JSON.parse(savedHabits) : getInitialDemoHabits());
        setCompletions(savedCompletions ? JSON.parse(savedCompletions) : getInitialDemoCompletions());
        setNotes(savedNotes ? JSON.parse(savedNotes) : getInitialDemoNotes());
      } catch (e) {
        setHabits(getInitialDemoHabits());
        setCompletions(getInitialDemoCompletions());
        setNotes(getInitialDemoNotes());
      }
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    let unsubHabits: (() => void) | null = null;
    let unsubCompletions: (() => void) | null = null;
    let unsubNotes: (() => void) | null = null;

    let habitsLoaded = false;
    let completionsLoaded = false;
    let notesLoaded = false;

    const checkAllLoaded = () => {
      if (habitsLoaded && completionsLoaded && notesLoaded) {
        setLoadingData(false);
      }
    };

    unsubHabits = subscribeToHabits(
      currentUser.uid,
      (data) => {
        setHabits(data);
        habitsLoaded = true;
        checkAllLoaded();
      },
      () => {
        habitsLoaded = true;
        checkAllLoaded();
      }
    );

    unsubCompletions = subscribeToCompletions(
      currentUser.uid,
      (data) => {
        setCompletions(data);
        completionsLoaded = true;
        checkAllLoaded();
      },
      () => {
        completionsLoaded = true;
        checkAllLoaded();
      }
    );

    unsubNotes = subscribeToNotes(
      currentUser.uid,
      (data) => {
        setNotes(data);
        notesLoaded = true;
        checkAllLoaded();
      },
      () => {
        notesLoaded = true;
        checkAllLoaded();
      }
    );

    return () => {
      if (unsubHabits) unsubHabits();
      if (unsubCompletions) unsubCompletions();
      if (unsubNotes) unsubNotes();
    };
  }, [currentUser]);

  // Daily progress for the currently selected date
  const dailyProgress = useMemo(() => {
    return calculateDailyProgress(habits, completions, selectedDate);
  }, [habits, completions, selectedDate]);

  // Overall streak
  const globalStreak = useMemo(() => {
    return calculateGlobalStreak(habits, completions, new Date());
  }, [habits, completions]);

  // Habit operations
  const addHabit = async (habitData: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return;
    setSyncing(true);
    try {
      if (currentUser.uid === 'demo_commander') {
        const newHabit: Habit = {
          ...habitData,
          id: `demo_h_${Date.now()}`,
          userId: 'demo_commander',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const next = [newHabit, ...habits];
        setHabits(next);
        localStorage.setItem('habitflow_demo_habits', JSON.stringify(next));
        return newHabit;
      }
      const created = await apiCreateHabit(currentUser.uid, habitData);
      return created;
    } finally {
      setSyncing(false);
    }
  };

  const editHabit = async (habitId: string, updates: Partial<Habit>) => {
    if (!currentUser) return;
    setSyncing(true);
    try {
      if (currentUser.uid === 'demo_commander') {
        const next = habits.map((h) =>
          h.id === habitId ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h
        );
        setHabits(next);
        localStorage.setItem('habitflow_demo_habits', JSON.stringify(next));
        return;
      }
      await apiUpdateHabit(currentUser.uid, habitId, updates);
    } finally {
      setSyncing(false);
    }
  };

  const toggleArchive = async (habitId: string, current: boolean) => {
    if (!currentUser) return;
    setSyncing(true);
    try {
      if (currentUser.uid === 'demo_commander') {
        const next = habits.map((h) =>
          h.id === habitId ? { ...h, isArchived: !current, updatedAt: new Date().toISOString() } : h
        );
        setHabits(next);
        localStorage.setItem('habitflow_demo_habits', JSON.stringify(next));
        return;
      }
      await apiToggleArchive(currentUser.uid, habitId, current);
    } finally {
      setSyncing(false);
    }
  };

  const togglePause = async (habitId: string, current: boolean) => {
    if (!currentUser) return;
    setSyncing(true);
    try {
      if (currentUser.uid === 'demo_commander') {
        const next = habits.map((h) =>
          h.id === habitId ? { ...h, isPaused: !current, updatedAt: new Date().toISOString() } : h
        );
        setHabits(next);
        localStorage.setItem('habitflow_demo_habits', JSON.stringify(next));
        return;
      }
      await apiTogglePause(currentUser.uid, habitId, current);
    } finally {
      setSyncing(false);
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!currentUser) return;
    setSyncing(true);
    try {
      if (currentUser.uid === 'demo_commander') {
        const nextHabits = habits.filter((h) => h.id !== habitId);
        const nextCompletions = completions.filter((c) => c.habitId !== habitId);
        setHabits(nextHabits);
        setCompletions(nextCompletions);
        localStorage.setItem('habitflow_demo_habits', JSON.stringify(nextHabits));
        localStorage.setItem('habitflow_demo_completions', JSON.stringify(nextCompletions));
        return;
      }
      await apiDeleteHabit(currentUser.uid, habitId);
    } finally {
      setSyncing(false);
    }
  };

  // Completion operations
  const toggleCompletion = useCallback(async (habit: Habit, dateKey?: string) => {
    if (!currentUser) return;
    const targetDateKey = dateKey || selectedDateKey;
    const existing = completions.find((c) => c.habitId === habit.id && c.dateKey === targetDateKey);

    setSyncing(true);
    try {
      if (currentUser.uid === 'demo_commander') {
        let nextCompletions: HabitCompletion[];
        if (existing?.status === 'completed') {
          nextCompletions = completions.filter(
            (c) => !(c.habitId === habit.id && c.dateKey === targetDateKey)
          );
        } else {
          const newComp: HabitCompletion = {
            id: `demo_${habit.id}_${targetDateKey}`,
            userId: 'demo_commander',
            habitId: habit.id,
            dateKey: targetDateKey,
            status: 'completed',
            progressValue: habit.targetValue || 1,
            targetValue: habit.targetValue || 1,
            completedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          nextCompletions = [
            ...completions.filter((c) => !(c.habitId === habit.id && c.dateKey === targetDateKey)),
            newComp,
          ];

          if (userSettings?.soundEnabled !== false) {
            playCelebrationSound();
          }
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#7C5CFC', '#36C5F0', '#35D49A'],
            disableForReducedMotion: true,
          });
        }
        setCompletions(nextCompletions);
        localStorage.setItem('habitflow_demo_completions', JSON.stringify(nextCompletions));
        return;
      }

      if (existing?.status === 'completed') {
        // Toggle to undone
        await removeHabitCompletion(currentUser.uid, habit.id, targetDateKey);
      } else {
        // Mark completed
        await recordHabitCompletion(
          currentUser.uid,
          habit.id,
          targetDateKey,
          habit.targetValue || 1,
          habit.targetValue || 1,
          'completed'
        );

        // Confetti and sound feedback
        if (userSettings?.soundEnabled !== false) {
          playCelebrationSound();
        }
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#7C5CFC', '#36C5F0', '#35D49A'],
          disableForReducedMotion: true,
        });
      }
    } finally {
      setSyncing(false);
    }
  }, [currentUser, completions, selectedDateKey, userSettings]);

  const updateMeasurableProgress = useCallback(async (habit: Habit, progressValue: number, dateKey?: string) => {
    if (!currentUser) return;
    const targetDateKey = dateKey || selectedDateKey;
    const target = habit.targetValue || 1;

    let status: CompletionStatus = 'partial';
    if (progressValue >= target) {
      status = 'completed';
    } else if (progressValue <= 0) {
      if (currentUser.uid === 'demo_commander') {
        const next = completions.filter((c) => !(c.habitId === habit.id && c.dateKey === targetDateKey));
        setCompletions(next);
        localStorage.setItem('habitflow_demo_completions', JSON.stringify(next));
        return;
      }
      await removeHabitCompletion(currentUser.uid, habit.id, targetDateKey);
      return;
    }

    setSyncing(true);
    try {
      if (currentUser.uid === 'demo_commander') {
        const newComp: HabitCompletion = {
          id: `demo_${habit.id}_${targetDateKey}`,
          userId: 'demo_commander',
          habitId: habit.id,
          dateKey: targetDateKey,
          status,
          progressValue,
          targetValue: target,
          completedAt: status === 'completed' ? new Date().toISOString() : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const next = [
          ...completions.filter((c) => !(c.habitId === habit.id && c.dateKey === targetDateKey)),
          newComp,
        ];
        setCompletions(next);
        localStorage.setItem('habitflow_demo_completions', JSON.stringify(next));

        if (status === 'completed') {
          if (userSettings?.soundEnabled !== false) playCelebrationSound();
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#7C5CFC', '#36C5F0', '#35D49A'],
            disableForReducedMotion: true,
          });
        }
        return;
      }

      await recordHabitCompletion(
        currentUser.uid,
        habit.id,
        targetDateKey,
        target,
        progressValue,
        status
      );

      if (status === 'completed') {
        if (userSettings?.soundEnabled !== false) {
          playCelebrationSound();
        }
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#7C5CFC', '#36C5F0', '#35D49A'],
          disableForReducedMotion: true,
        });
      }
    } finally {
      setSyncing(false);
    }
  }, [currentUser, completions, selectedDateKey, userSettings]);

  const undoCompletion = useCallback(async (habitId: string, dateKey?: string) => {
    if (!currentUser) return;
    const targetDateKey = dateKey || selectedDateKey;
    setSyncing(true);
    try {
      if (currentUser.uid === 'demo_commander') {
        const next = completions.filter((c) => !(c.habitId === habitId && c.dateKey === targetDateKey));
        setCompletions(next);
        localStorage.setItem('habitflow_demo_completions', JSON.stringify(next));
        return;
      }
      await removeHabitCompletion(currentUser.uid, habitId, targetDateKey);
    } finally {
      setSyncing(false);
    }
  }, [currentUser, completions, selectedDateKey]);

  // Note operations
  const addNote = async (data: { title: string; content: string; category: any; dateKey: string; tags?: string[]; reviewAnswers?: any }) => {
    if (!currentUser) return;
    setSyncing(true);
    try {
      if (currentUser.uid === 'demo_commander') {
        const newNote: Note = {
          ...data,
          id: `demo_note_${Date.now()}`,
          userId: 'demo_commander',
          tags: data.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const next = [newNote, ...notes];
        setNotes(next);
        localStorage.setItem('habitflow_demo_notes', JSON.stringify(next));
        return newNote;
      }
      return await apiCreateNote(currentUser.uid, data);
    } finally {
      setSyncing(false);
    }
  };

  const editNote = async (noteId: string, updates: Partial<Note>) => {
    if (!currentUser) return;
    setSyncing(true);
    try {
      if (currentUser.uid === 'demo_commander') {
        const next = notes.map((n) =>
          n.id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
        );
        setNotes(next);
        localStorage.setItem('habitflow_demo_notes', JSON.stringify(next));
        return;
      }
      await apiUpdateNote(currentUser.uid, noteId, updates);
    } finally {
      setSyncing(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!currentUser) return;
    setSyncing(true);
    try {
      if (currentUser.uid === 'demo_commander') {
        const next = notes.filter((n) => n.id !== noteId);
        setNotes(next);
        localStorage.setItem('habitflow_demo_notes', JSON.stringify(next));
        return;
      }
      await apiDeleteNote(currentUser.uid, noteId);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        completions,
        notes,
        selectedDate,
        setSelectedDate,
        selectedDateKey,
        loadingData,
        syncing,
        dailyProgress,
        globalStreak,
        addHabit,
        editHabit,
        toggleArchive,
        togglePause,
        deleteHabit,
        toggleCompletion,
        updateMeasurableProgress,
        undoCompletion,
        addNote,
        editNote,
        deleteNote,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export function useHabits() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within HabitProvider');
  }
  return context;
}
