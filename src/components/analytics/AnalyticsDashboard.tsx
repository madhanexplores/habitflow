import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Habit, HabitCompletion } from '../../types';
import { computeAnalytics } from '../../services/analytics';

interface AnalyticsDashboardProps {
  habits: Habit[];
  completions: HabitCompletion[];
}

const CATEGORY_COLORS = ['#7C5CFC', '#36C5F0', '#35D49A', '#FFB454', '#F43F5E', '#A855F7', '#14B8A6'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  habits,
  completions,
}) => {
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(30);

  const analytics = computeAnalytics(habits, completions, rangeDays);

  return (
    <div className="space-y-6">
      {/* Time Range Selector & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Telemetry & Progress Analytics
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Calculated in real-time from your Firestore habit executions
          </p>
        </div>

        {/* 7d / 30d / 90d buttons */}
        <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
          <button
            onClick={() => setRangeDays(7)}
            className={`min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              rangeDays === 7
                ? 'bg-[#7C5CFC] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setRangeDays(30)}
            className={`min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              rangeDays === 30
                ? 'bg-[#7C5CFC] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setRangeDays(90)}
            className={`min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              rangeDays === 90
                ? 'bg-[#7C5CFC] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Completion Rate with Delta */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <span className="text-xs text-[var(--text-secondary)]">Period Completion Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono-num text-[#35D49A]">
              {analytics.averageRate}%
            </span>
            <div
              className={`flex items-center text-xs font-semibold font-mono ${
                analytics.rateDelta >= 0 ? 'text-[#35D49A]' : 'text-rose-400'
              }`}
            >
              {analytics.rateDelta >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              )}
              {analytics.rateDelta >= 0 ? `+${analytics.rateDelta}%` : `${analytics.rateDelta}%`}
            </div>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] block">
            vs previous {rangeDays} days ({analytics.previousPeriodRate}%)
          </span>
        </div>

        {/* Total Completed Sessions */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <span className="text-xs text-[var(--text-secondary)]">Total Sessions Completed</span>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono-num text-[#36C5F0]">
            {analytics.totalSessionsCompleted}
          </p>
          <span className="text-[10px] text-[var(--text-secondary)] block">
            Across all scheduled routines
          </span>
        </div>

        {/* Invested Time in Minutes / Hours */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#FFB454]" />
            Time Invested
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono-num text-[#FFB454]">
              {analytics.totalTimeInvestedMinutes >= 60
                ? `${(analytics.totalTimeInvestedMinutes / 60).toFixed(1)}h`
                : `${analytics.totalTimeInvestedMinutes}m`}
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] block">
            Focus & fitness routines logged
          </span>
        </div>

        {/* Consistency Standout */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-[#7C5CFC]" />
            Top Routine
          </span>
          <p className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate">
            {analytics.mostConsistentHabit?.habit.title || 'In Progress'}
          </p>
          <span className="text-[10px] text-[var(--text-secondary)] block font-mono">
            {analytics.mostConsistentHabit
              ? `${analytics.mostConsistentHabit.stats.completionRate}% consistency`
              : 'Add habits to compute'}
          </span>
        </div>
      </div>

      {/* Completion Trends Chart */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Execution Velocity & Completion Trends
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Daily consistency percentage across {rangeDays} days
          </p>
        </div>

        <div className="h-64 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#98A2B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={rangeDays > 30 ? 25 : 10}
              />
              <YAxis
                stroke="#98A2B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="rounded-xl bg-[#141B2B] border border-slate-700 p-2.5 text-xs shadow-2xl font-mono">
                        <p className="font-semibold text-white">{pt.displayDate} ({pt.dayOfWeek})</p>
                        <p className="text-[#35D49A]">Completion: {pt.rate}%</p>
                        <p className="text-slate-400">Completed: {pt.completed} / {pt.total}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#7C5CFC"
                strokeWidth={3}
                dot={{ r: rangeDays <= 7 ? 4 : 2, fill: '#36C5F0' }}
                activeDot={{ r: 6, fill: '#35D49A' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown and Habit Performance Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Category Distribution
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Completion rates by life & work categories
            </p>
          </div>

          {analytics.categoryStats.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-secondary)]">
              No category history recorded yet in this window.
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.categoryStats.map((cat, idx) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--text-primary)]">
                      {cat.category}
                    </span>
                    <span className="font-mono-num font-semibold text-[#36C5F0]">
                      {cat.completed} / {cat.total} ({cat.rate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.rate}%`,
                        backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Habit-by-Habit Consistency Ranking */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Routine Consistency Ranking
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Ranked by adherence percentage & active streak length
            </p>
          </div>

          {analytics.habitPerformances.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-secondary)]">
              No routines configured.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {analytics.habitPerformances.map((hp) => (
                <div
                  key={hp.habit.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: hp.habit.color }}
                    />
                    <div className="truncate">
                      <p className="font-semibold text-[var(--text-primary)] truncate">
                        {hp.habit.title}
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)]">
                        {hp.habit.category} · {hp.stats.totalCompletions} total completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 font-mono text-[#FFB454]">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{hp.stats.currentStreak}d</span>
                    </div>
                    <span className="font-mono-num font-bold text-[#35D49A] min-w-[36px] text-right">
                      {hp.stats.completionRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
