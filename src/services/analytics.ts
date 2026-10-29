import {
  subDays,
  eachDayOfInterval,
  format,
  startOfDay,
  parseISO,
} from 'date-fns';
import { Habit, HabitCompletion, StreakStats } from '../types';
import {
  formatDateKey,
  calculateDailyProgress,
  calculateHabitStreak,
  isHabitScheduledOnDate,
} from '../utils/date';

export interface DayTrendPoint {
  dateKey: string;
  displayDate: string;
  dayOfWeek: string;
  completed: number;
  total: number;
  rate: number;
}

export interface CategoryStat {
  category: string;
  completed: number;
  total: number;
  rate: number;
  investedUnits: number;
  unit: string;
}

export interface HabitPerformance {
  habit: Habit;
  stats: StreakStats;
  totalInvested: number;
}

export interface AnalyticsSummary {
  rangeDays: 7 | 30 | 90;
  trendData: DayTrendPoint[];
  averageRate: number;
  previousPeriodRate: number;
  rateDelta: number; // current - previous
  categoryStats: CategoryStat[];
  habitPerformances: HabitPerformance[];
  mostConsistentHabit: HabitPerformance | null;
  leastConsistentHabit: HabitPerformance | null;
  totalSessionsCompleted: number;
  totalTimeInvestedMinutes: number;
}

export function computeAnalytics(
  habits: Habit[],
  completions: HabitCompletion[],
  rangeDays: 7 | 30 | 90,
  referenceDate: Date = new Date()
): AnalyticsSummary {
  const today = startOfDay(referenceDate);
  const activeHabits = habits.filter((h) => !h.isArchived);

  // Current period days
  const startDate = subDays(today, rangeDays - 1);
  const daysInPeriod = eachDayOfInterval({ start: startDate, end: today });

  // Previous period days for comparison
  const prevStartDate = subDays(startDate, rangeDays);
  const prevEndDate = subDays(startDate, 1);
  const prevDays = eachDayOfInterval({ start: prevStartDate, end: prevEndDate });

  // Trend data
  const trendData: DayTrendPoint[] = daysInPeriod.map((day) => {
    const progress = calculateDailyProgress(activeHabits, completions, day);
    const dateKey = formatDateKey(day);
    return {
      dateKey,
      displayDate: format(day, 'MMM d'),
      dayOfWeek: format(day, 'EEE'),
      completed: progress.completedCount,
      total: progress.totalScheduled,
      rate: progress.percentage,
    };
  });

  // Average completion rate in current period
  const totalScheduledSum = trendData.reduce((acc, d) => acc + d.total, 0);
  const totalCompletedSum = trendData.reduce((acc, d) => acc + d.completed, 0);
  const averageRate = totalScheduledSum > 0 ? Math.round((totalCompletedSum / totalScheduledSum) * 100) : 0;

  // Previous period rate
  let prevScheduledSum = 0;
  let prevCompletedSum = 0;
  for (const prevDay of prevDays) {
    const p = calculateDailyProgress(activeHabits, completions, prevDay);
    prevScheduledSum += p.totalScheduled;
    prevCompletedSum += p.completedCount;
  }
  const previousPeriodRate = prevScheduledSum > 0 ? Math.round((prevCompletedSum / prevScheduledSum) * 100) : 0;
  const rateDelta = averageRate - previousPeriodRate;

  // Habit performances
  const habitPerformances: HabitPerformance[] = activeHabits.map((habit) => {
    const stats = calculateHabitStreak(habit, completions, referenceDate);
    // Calculate total measurable progress invested
    let totalInvested = 0;
    const habitCompletions = completions.filter((c) => c.habitId === habit.id);
    for (const c of habitCompletions) {
      if (c.progressValue) {
        totalInvested += c.progressValue;
      } else if (c.status === 'completed') {
        totalInvested += habit.targetValue || 1;
      }
    }
    return {
      habit,
      stats,
      totalInvested,
    };
  });

  // Sort by consistency (completion rate, then current streak)
  const sortedByConsistency = [...habitPerformances].sort((a, b) => {
    if (b.stats.completionRate !== a.stats.completionRate) {
      return b.stats.completionRate - a.stats.completionRate;
    }
    return b.stats.currentStreak - a.stats.currentStreak;
  });

  const mostConsistentHabit = sortedByConsistency.length > 0 && sortedByConsistency[0].stats.totalCompletions > 0
    ? sortedByConsistency[0]
    : null;

  const leastConsistentHabit = sortedByConsistency.length > 1
    ? sortedByConsistency[sortedByConsistency.length - 1]
    : null;

  // Category stats
  const categoryMap = new Map<string, { completed: number; total: number; invested: number; unit: string }>();

  for (const day of daysInPeriod) {
    const dKey = formatDateKey(day);
    for (const h of activeHabits) {
      if (isHabitScheduledOnDate(h, day)) {
        const cat = h.category || 'General';
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, { completed: 0, total: 0, invested: 0, unit: h.unit || 'times' });
        }
        const current = categoryMap.get(cat)!;
        current.total++;

        const comp = completions.find((c) => c.habitId === h.id && c.dateKey === dKey);
        if (comp?.status === 'completed') {
          current.completed++;
        }
        if (comp?.progressValue) {
          current.invested += comp.progressValue;
        }
      }
    }
  }

  const categoryStats: CategoryStat[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    completed: data.completed,
    total: data.total,
    rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    investedUnits: data.invested,
    unit: data.unit,
  }));

  // Total time invested in minutes (habits with unit 'minutes' or 'mins')
  let totalTimeInvestedMinutes = 0;
  for (const h of activeHabits) {
    const isMinuteUnit = /min/i.test(h.unit);
    if (isMinuteUnit) {
      const hCompletions = completions.filter((c) => c.habitId === h.id);
      for (const c of hCompletions) {
        totalTimeInvestedMinutes += c.progressValue || (c.status === 'completed' ? h.targetValue : 0);
      }
    }
  }

  return {
    rangeDays,
    trendData,
    averageRate,
    previousPeriodRate,
    rateDelta,
    categoryStats,
    habitPerformances,
    mostConsistentHabit,
    leastConsistentHabit,
    totalSessionsCompleted: totalCompletedSum,
    totalTimeInvestedMinutes,
  };
}
