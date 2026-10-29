import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import { Task, TaskPriority, Subtask } from '../types';
import {
  subscribeToTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  toggleTaskComplete as apiToggleTaskComplete,
} from '../services/tasks';
import { getInitialDemoTasks } from '../utils/demoData';
import { formatDateKey } from '../utils/date';

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  dueToday: number;
  urgentOrHigh: number;
  completionRate: number;
}

interface TaskContextType {
  tasks: Task[];
  loadingTasks: boolean;
  stats: TaskStats;
  addTask: (data: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
    dueTime?: string;
    category?: string;
    linkedHabitId?: string;
    tags?: string[];
    subtasks?: Subtask[];
  }) => Promise<Task | undefined>;
  editTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleComplete: (taskId: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'habitflow_tasks_demo_v1';

function playTaskSuccessSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // Ignore audio context errors if browser blocks sound
  }
}

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isDemoMode } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Load / subscribe to tasks
  useEffect(() => {
    if (isDemoMode || !currentUser) {
      // Local demo storage fallback
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          setTasks(JSON.parse(stored));
        } else {
          const initial = getInitialDemoTasks();
          setTasks(initial);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
        }
      } catch {
        setTasks(getInitialDemoTasks());
      }
      setLoadingTasks(false);
      return;
    }

    setLoadingTasks(true);
    const unsubscribe = subscribeToTasks(
      currentUser.uid,
      (liveTasks) => {
        setTasks(liveTasks);
        setLoadingTasks(false);
      },
      () => {
        setLoadingTasks(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isDemoMode]);

  // Save to localStorage when in demo mode
  const persistDemoTasks = useCallback((updated: Task[]) => {
    setTasks(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore local storage quota limits
    }
  }, []);

  // Compute Task Statistics
  const stats = useMemo<TaskStats>(() => {
    const todayKey = formatDateKey(new Date());
    const total = tasks.length;
    let completed = 0;
    let dueToday = 0;
    let urgentOrHigh = 0;

    tasks.forEach((t) => {
      if (t.completed) {
        completed++;
      } else {
        if (t.dueDate === todayKey) dueToday++;
        if (t.priority === 'urgent' || t.priority === 'high') urgentOrHigh++;
      }
    });

    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      dueToday,
      urgentOrHigh,
      completionRate,
    };
  }, [tasks]);

  // Add Task
  const addTask = useCallback(
    async (data: {
      title: string;
      description?: string;
      priority?: TaskPriority;
      dueDate?: string;
      dueTime?: string;
      category?: string;
      linkedHabitId?: string;
      tags?: string[];
      subtasks?: Subtask[];
    }) => {
      if (!data.title.trim()) return;

      if (isDemoMode || !currentUser) {
        const now = new Date().toISOString();
        const newTask: Task = {
          id: `demo_task_${Date.now()}`,
          userId: 'demo_commander',
          title: data.title.trim(),
          description: data.description?.trim() || '',
          priority: data.priority || 'medium',
          dueDate: data.dueDate || undefined,
          dueTime: data.dueTime || undefined,
          category: data.category || 'General',
          completed: false,
          linkedHabitId: data.linkedHabitId || undefined,
          tags: data.tags || [],
          subtasks: data.subtasks || [],
          createdAt: now,
          updatedAt: now,
        };
        const updated = [newTask, ...tasks];
        persistDemoTasks(updated);
        return newTask;
      }

      return await apiCreateTask(currentUser.uid, data);
    },
    [currentUser, isDemoMode, persistDemoTasks, tasks]
  );

  // Edit Task
  const editTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      if (isDemoMode || !currentUser) {
        const now = new Date().toISOString();
        const updated = tasks.map((t) =>
          t.id === taskId ? { ...t, ...updates, updatedAt: now } : t
        );
        persistDemoTasks(updated);
        return;
      }
      await apiUpdateTask(currentUser.uid, taskId, updates);
    },
    [currentUser, isDemoMode, persistDemoTasks, tasks]
  );

  // Delete Task
  const deleteTask = useCallback(
    async (taskId: string) => {
      if (isDemoMode || !currentUser) {
        const updated = tasks.filter((t) => t.id !== taskId);
        persistDemoTasks(updated);
        return;
      }
      await apiDeleteTask(currentUser.uid, taskId);
    },
    [currentUser, isDemoMode, persistDemoTasks, tasks]
  );

  // Toggle Complete
  const toggleComplete = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const nextCompleted = !task.completed;
      const now = new Date().toISOString();

      if (nextCompleted) {
        playTaskSuccessSound();
        try {
          confetti({
            particleCount: 28,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#35D49A', '#36C5F0', '#7C5CFC'],
            disableForReducedMotion: true,
          });
        } catch {
          // ignore
        }
      }

      if (isDemoMode || !currentUser) {
        const updated = tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                completed: nextCompleted,
                completedAt: nextCompleted ? now : undefined,
                updatedAt: now,
              }
            : t
        );
        persistDemoTasks(updated);
        return;
      }

      await apiToggleTaskComplete(currentUser.uid, task);
    },
    [currentUser, isDemoMode, persistDemoTasks, tasks]
  );

  // Toggle Subtask
  const toggleSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedSubtasks = (task.subtasks || []).map((sub) =>
        sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
      );

      // Check if all subtasks are complete now
      const allSubtasksDone =
        updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.completed);

      if (isDemoMode || !currentUser) {
        const now = new Date().toISOString();
        const updated = tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                subtasks: updatedSubtasks,
                completed: allSubtasksDone ? true : t.completed,
                completedAt: allSubtasksDone && !t.completed ? now : t.completedAt,
                updatedAt: now,
              }
            : t
        );
        persistDemoTasks(updated);
        return;
      }

      await apiUpdateTask(currentUser.uid, taskId, {
        subtasks: updatedSubtasks,
        ...(allSubtasksDone && !task.completed
          ? { completed: true, completedAt: new Date().toISOString() }
          : {}),
      });
    },
    [currentUser, isDemoMode, persistDemoTasks, tasks]
  );

  const value = useMemo(
    () => ({
      tasks,
      loadingTasks,
      stats,
      addTask,
      editTask,
      deleteTask,
      toggleComplete,
      toggleSubtask,
    }),
    [tasks, loadingTasks, stats, addTask, editTask, deleteTask, toggleComplete, toggleSubtask]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export function useTasks(): TaskContextType {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
