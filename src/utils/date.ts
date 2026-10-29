import {
  format,
  parseISO,
  isBefore,
  isAfter,
  addDays,
  subDays,
  startOfDay,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getDay,
  differenceInCalendarDays,
} from 'date-fns';
import { Habit, HabitCompletion, StreakStats } from '../types';

export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseDateKey(dateKey: string): Date {
  return parseISO(dateKey);
}

export function getTodayDateKey(): string {
  return formatDateKey(new Date());
}

/**
 * Determines whether a habit is scheduled on a specific date
 */
export function isHabitScheduledOnDate(habit: Habit, date: Date): boolean {
  if (habit.isArchived || habit.isPaused) return false;

  const dateDay = startOfDay(date);
  const startDay = startOfDay(parseISO(habit.startDate));

  if (isBefore(dateDay, startDay)) {
    return false;
  }

  if (habit.endDate) {
    const endDay = startOfDay(parseISO(habit.endDate));
    if (isAfter(dateDay, endDay)) {
      return false;
    }
  }

  if (habit.frequency === 'daily') {
    return true;
  }

  if (habit.frequency === 'custom_days') {
    const weekday = getDay(date); // 0=Sun, 1=Mon, ..., 6=Sat
    return habit.selectedWeekdays?.includes(weekday) ?? true;
  }

  // weekly_target defaults to everyday unless specific days provided
  if (habit.frequency === 'weekly_target') {
    if (habit.selectedWeekdays && habit.selectedWeekdays.length > 0) {
      return habit.selectedWeekdays.includes(getDay(date));
    }
    return true;
  }

  return true;
}

/**
 * Calculate streak stats for a single habit
 */
export function calculateHabitStreak(
  habit: Habit,
  allCompletions: HabitCompletion[],
  currentDate: Date = new Date()
): StreakStats {
  const completionMap = new Map<string, HabitCompletion>();
  allCompletions
    .filter((c) => c.habitId === habit.id)
    .forEach((c) => {
      completionMap.set(c.dateKey, c);
    });

  const todayKey = formatDateKey(currentDate);
  const startDate = parseISO(habit.startDate);
  const today = startOfDay(currentDate);

  // If habit starts in the future, streaks are 0
  if (isAfter(startOfDay(startDate), today)) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: completionMap.size,
      completionRate: 0,
      missedScheduledDays: 0,
    };
  }

  // Calculate current streak walking backwards
  let currentStreak = 0;
  let checkDate = today;
  let isTodayChecked = false;

  // Check today first: if completed today, current streak starts at 1
  const todayCompletion = completionMap.get(todayKey);
  const isScheduledToday = isHabitScheduledOnDate(habit, today);

  if (isScheduledToday && todayCompletion?.status === 'completed') {
    currentStreak = 1;
    checkDate = subDays(today, 1);
  } else if (!isScheduledToday) {
    // If not scheduled today, check from yesterday
    checkDate = subDays(today, 1);
  } else {
    // Scheduled today but not yet completed. The streak isn't broken yet today!
    // Start checking from yesterday to see current ongoing streak
    checkDate = subDays(today, 1);
    isTodayChecked = true;
  }

  while (!isBefore(checkDate, startDate)) {
    const dateKey = formatDateKey(checkDate);
    const scheduled = isHabitScheduledOnDate(habit, checkDate);

    if (scheduled) {
      const comp = completionMap.get(dateKey);
      if (comp?.status === 'completed') {
        currentStreak++;
      } else {
        // Scheduled but missed in the past: streak ends
        break;
      }
    }
    // If not scheduled, continue to previous day without breaking streak
    checkDate = subDays(checkDate, 1);
  }

  // Calculate longest streak and totals walking forward from startDate
  let longestStreak = 0;
  let runningStreak = 0;
  let scheduledDaysCount = 0;
  let completedDaysCount = 0;

  const daysInterval = eachDayOfInterval({
    start: startDate,
    end: today,
  });

  for (const day of daysInterval) {
    const dateKey = formatDateKey(day);
    const scheduled = isHabitScheduledOnDate(habit, day);

    if (scheduled) {
      scheduledDaysCount++;
      const comp = completionMap.get(dateKey);
      if (comp?.status === 'completed') {
        completedDaysCount++;
        runningStreak++;
        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
      } else {
        // Only break running streak if not today
        if (dateKey !== todayKey) {
          runningStreak = 0;
        }
      }
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  const completionRate = scheduledDaysCount > 0
    ? Math.round((completedDaysCount / scheduledDaysCount) * 100)
    : 0;

  const missedScheduledDays = Math.max(0, scheduledDaysCount - completedDaysCount);

  return {
    currentStreak,
    longestStreak,
    totalCompletions: completedDaysCount,
    completionRate,
    missedScheduledDays,
  };
}

/**
 * Calculate overall daily progress for an array of habits and completions
 */
export function calculateDailyProgress(
  habits: Habit[],
  completions: HabitCompletion[],
  date: Date
): {
  totalScheduled: number;
  completedCount: number;
  partialCount: number;
  percentage: number;
  scheduledHabits: Habit[];
} {
  const dateKey = formatDateKey(date);
  const activeHabits = habits.filter((h) => !h.isArchived && !h.isPaused);
  const scheduledHabits = activeHabits.filter((h) => isHabitScheduledOnDate(h, date));

  const completionMap = new Map<string, HabitCompletion>();
  completions
    .filter((c) => c.dateKey === dateKey)
    .forEach((c) => completionMap.set(c.habitId, c));

  let completedCount = 0;
  let partialCount = 0;

  for (const habit of scheduledHabits) {
    const comp = completionMap.get(habit.id);
    if (comp?.status === 'completed') {
      completedCount++;
    } else if (comp && comp.progressValue > 0) {
      partialCount++;
    }
  }

  const percentage = scheduledHabits.length > 0
    ? Math.round((completedCount / scheduledHabits.length) * 100)
    : 0;

  return {
    totalScheduled: scheduledHabits.length,
    completedCount,
    partialCount,
    percentage,
    scheduledHabits,
  };
}

/**
 * Calculates global streaks across all active habits
 */
export function calculateGlobalStreak(
  habits: Habit[],
  completions: HabitCompletion[],
  currentDate: Date = new Date()
): { currentStreak: number; bestStreak: number } {
  const activeHabits = habits.filter((h) => !h.isArchived && !h.isPaused);
  if (activeHabits.length === 0) return { currentStreak: 0, bestStreak: 0 };

  const today = startOfDay(currentDate);
  const todayKey = formatDateKey(today);

  // Find earliest habit start date
  let earliestDate = today;
  for (const h of activeHabits) {
    const s = parseISO(h.startDate);
    if (isBefore(s, earliestDate)) {
      earliestDate = s;
    }
  }

  // Map completions by dateKey
  const completionsByDate = new Map<string, Set<string>>();
  for (const c of completions) {
    if (c.status === 'completed') {
      if (!completionsByDate.has(c.dateKey)) {
        completionsByDate.set(c.dateKey, new Set());
      }
      completionsByDate.get(c.dateKey)!.add(c.habitId);
    }
  }

  // Check today's progress
  const todayProgress = calculateDailyProgress(activeHabits, completions, today);
  const todayDone = todayProgress.totalScheduled > 0 && todayProgress.completedCount > 0;

  let currentStreak = 0;
  let checkDate = today;

  if (todayDone) {
    currentStreak = 1;
    checkDate = subDays(today, 1);
  } else {
    // Check if yesterday had completions
    checkDate = subDays(today, 1);
  }

  // Count backwards
  while (!isBefore(checkDate, earliestDate)) {
    const progress = calculateDailyProgress(activeHabits, completions, checkDate);
    // If a day had scheduled habits and at least 1 completed (or majority)
    if (progress.totalScheduled > 0) {
      if (progress.completedCount > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    checkDate = subDays(checkDate, 1);
  }

  // Best streak over interval
  let bestStreak = 0;
  let run = 0;
  const allDays = eachDayOfInterval({ start: earliestDate, end: today });
  for (const day of allDays) {
    const dKey = formatDateKey(day);
    const progress = calculateDailyProgress(activeHabits, completions, day);
    if (progress.totalScheduled > 0) {
      if (progress.completedCount > 0) {
        run++;
        if (run > bestStreak) bestStreak = run;
      } else {
        if (dKey !== todayKey) {
          run = 0;
        }
      }
    }
  }

  if (currentStreak > bestStreak) bestStreak = currentStreak;

  return { currentStreak, bestStreak };
}
