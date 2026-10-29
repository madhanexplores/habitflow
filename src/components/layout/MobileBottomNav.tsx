import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckCircle2,
  CalendarDays,
  BarChart3,
  BookOpen,
  Plus,
  ListTodo,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenNewHabit: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenNewHabit }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-secondary)]/95 backdrop-blur-lg border-t border-[var(--border-subtle)] pb-safe">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
              isActive ? 'text-[#36C5F0]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Today</span>
        </NavLink>

        <NavLink
          to="/habits"
          className={({ isActive }) =>
            `min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
              isActive ? 'text-[#36C5F0]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`
          }
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Habits</span>
        </NavLink>

        {/* Center Quick Action Add Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenNewHabit}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7C5CFC] to-[#36C5F0] text-white flex items-center justify-center shadow-lg shadow-[#7C5CFC]/40 active:scale-95 transition-transform -mt-5"
            aria-label="Add New Habit"
            title="Add New Habit"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
              isActive ? 'text-[#36C5F0]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`
          }
        >
          <ListTodo className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Tasks</span>
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
              isActive ? 'text-[#36C5F0]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`
          }
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Calendar</span>
        </NavLink>
      </div>
    </div>
  );
};
