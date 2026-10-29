import React from 'react';
import { format, subDays, startOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Habit, HabitCompletion } from '../../types';
import { calculateDailyProgress, formatDateKey } from '../../utils/date';

interface WeeklyMiniChartProps {
  habits: Habit[];
  completions: HabitCompletion[];
  referenceDate?: Date;
}

export const WeeklyMiniChart: React.FC<WeeklyMiniChartProps> = ({
  habits,
  completions,
  referenceDate = new Date(),
}) => {
  const today = startOfDay(referenceDate);

  // Build 7 days data
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const day = subDays(today, i);
    const progress = calculateDailyProgress(habits, completions, day);
    data.push({
      dateKey: formatDateKey(day),
      dayName: format(day, 'EEE'),
      percentage: progress.percentage,
      completed: progress.completedCount,
      total: progress.totalScheduled,
    });
  }

  return (
    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Weekly Activity Pulse
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Daily completion % across active habits
          </p>
        </div>
      </div>

      <div className="h-40 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <XAxis
              dataKey="dayName"
              stroke="#98A2B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#98A2B8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-xl bg-[#141B2B] border border-slate-700 p-2 text-xs shadow-xl font-mono">
                      <p className="font-semibold text-white">{d.dayName} ({d.dateKey})</p>
                      <p className="text-[#35D49A]">Progress: {d.percentage}%</p>
                      <p className="text-slate-400">Completed: {d.completed} / {d.total}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.percentage === 100
                      ? '#35D49A'
                      : entry.percentage >= 50
                      ? '#7C5CFC'
                      : entry.percentage > 0
                      ? '#36C5F0'
                      : '#1e293b'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
