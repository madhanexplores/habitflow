import React from 'react';
import {
  format,
  addDays,
  subDays,
  isToday,
  isSameDay,
  eachDayOfInterval,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { formatDateKey } from '../../utils/date';

interface DateNavigatorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  // Generate 7 day sliding window centered on selected date
  const days = eachDayOfInterval({
    start: subDays(selectedDate, 3),
    end: addDays(selectedDate, 3),
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
      {/* Date controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelectDate(subDays(selectedDate, 1))}
          className="p-1.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:border-[#7C5CFC]/40 transition"
          aria-label="Previous day"
          title="Previous day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 px-2 py-1">
          <CalendarIcon className="w-4 h-4 text-[#36C5F0]" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[var(--text-primary)]">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] font-mono">
              {isToday(selectedDate) ? 'TODAY · ACTIVE SESSION' : 'HISTORICAL INSPECTION'}
            </span>
          </div>
        </div>

        <button
          onClick={() => onSelectDate(addDays(selectedDate, 1))}
          className="p-1.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:border-[#7C5CFC]/40 transition"
          aria-label="Next day"
          title="Next day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {!isToday(selectedDate) && (
          <button
            onClick={() => onSelectDate(new Date())}
            className="ml-2 px-2.5 py-1 rounded-lg bg-[#7C5CFC]/20 text-[#36C5F0] border border-[#7C5CFC]/40 text-xs font-semibold hover:bg-[#7C5CFC]/30 transition"
          >
            Jump to Today
          </button>
        )}
      </div>

      {/* 7-day pill carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {days.map((day) => {
          const selected = isSameDay(day, selectedDate);
          const today = isToday(day);
          return (
            <button
              key={formatDateKey(day)}
              onClick={() => onSelectDate(day)}
              className={`min-h-[44px] min-w-[42px] px-2 py-1.5 rounded-xl flex flex-col items-center justify-center transition ${
                selected
                  ? 'bg-gradient-to-b from-[#7C5CFC] to-[#6848F2] text-white shadow-md shadow-[#7C5CFC]/25'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white hover:bg-slate-800/40 border border-transparent'
              } ${today && !selected ? 'border-[#36C5F0]/50' : ''}`}
            >
              <span className="text-[9px] font-semibold uppercase tracking-wider">
                {format(day, 'EEE')}
              </span>
              <span className="text-xs font-bold font-mono-num mt-0.5">
                {format(day, 'd')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
