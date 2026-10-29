import React from 'react';
import { useHabits } from '../context/HabitContext';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';

export const AnalyticsPage: React.FC = () => {
  const { habits, completions } = useHabits();

  return (
    <div className="space-y-6">
      <AnalyticsDashboard habits={habits} completions={completions} />
    </div>
  );
};
