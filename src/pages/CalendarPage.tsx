import React from 'react';
import { useHabits } from '../context/HabitContext';
import { MonthlyCalendarView } from '../components/calendar/MonthlyCalendarView';

export const CalendarPage: React.FC = () => {
  const { habits, completions, toggleCompletion } = useHabits();

  return (
    <div className="space-y-6">
      <MonthlyCalendarView
        habits={habits}
        completions={completions}
        onToggleHabitCompletion={(habit, dateKey) => toggleCompletion(habit, dateKey)}
      />
    </div>
  );
};
