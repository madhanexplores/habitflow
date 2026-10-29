export type HabitCategory =
  | 'Content Creation'
  | 'Learning'
  | 'College'
  | 'Freelancing'
  | 'Projects'
  | 'Fitness'
  | 'Personal Growth'
  | 'Health'
  | 'Custom';

export type HabitType = 'binary' | 'measurable';

export type HabitFrequency = 'daily' | 'weekly_target' | 'custom_days';

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: HabitCategory | string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  selectedWeekdays: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  habitType: HabitType;
  targetValue: number; // e.g., 30 for 30 minutes, 1 for binary
  unit: string; // e.g., "minutes", "pages", "sessions", "reps", "check"
  startDate: string; // YYYY-MM-DD
  endDate?: string | null;
  reminderEnabled: boolean;
  reminderTime?: string; // HH:MM
  isArchived: boolean;
  isPaused: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type CompletionStatus = 'completed' | 'partial' | 'skipped';

export interface HabitCompletion {
  id: string; // usually habitId_dateKey for atomic deduplication
  userId: string;
  habitId: string;
  dateKey: string; // YYYY-MM-DD
  status: CompletionStatus;
  progressValue: number;
  targetValue: number;
  completedAt?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type NoteCategory =
  | 'reflection'
  | 'content_idea'
  | 'tech_note'
  | 'project_idea'
  | 'tomorrow_task'
  | 'win'
  | 'challenge';

export interface DailyReviewAnswers {
  completedToday?: string;
  learnedToday?: string;
  wentWell?: string;
  distractedBy?: string;
  tomorrowPriority?: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: NoteCategory;
  dateKey: string; // YYYY-MM-DD
  tags: string[];
  reviewAnswers?: DailyReviewAnswers;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  userId: string;
  displayName: string;
  theme: 'dark' | 'light' | 'system';
  weekStart: 'monday' | 'sunday';
  timezone: string;
  goals: string[];
  soundEnabled: boolean;
  inAppReminders: boolean;
  pushNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // 0-100%
  missedScheduledDays: number;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  category: string;
  completed: boolean;
  completedAt?: string;
  linkedHabitId?: string;
  tags: string[];
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}
