import React from 'react';
import { BookOpen, Sparkles, ChevronRight, Check } from 'lucide-react';
import { Note } from '../../types';

interface DailyReviewCardProps {
  todayNotes: Note[];
  onOpenReviewModal: () => void;
}

export const DailyReviewCard: React.FC<DailyReviewCardProps> = ({
  todayNotes,
  onOpenReviewModal,
}) => {
  const reviewNote = todayNotes.find(
    (n) => n.category === 'reflection' || !!n.reviewAnswers
  );

  return (
    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 space-y-3 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#7C5CFC]" />
            Daily Debrief & Review
          </h3>
          {reviewNote ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#35D49A]/20 text-[#35D49A] flex items-center gap-1">
              <Check className="w-2.5 h-2.5" /> LOGGED
            </span>
          ) : (
            <span className="text-[10px] font-mono text-[#FFB454]">PENDING</span>
          )}
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          5-Question evening reflection to calibrate tomorrow's velocity
        </p>

        {reviewNote ? (
          <div className="mt-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs space-y-1.5">
            <p className="font-semibold text-[var(--text-primary)] truncate">
              {reviewNote.title}
            </p>
            <p className="text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {reviewNote.content || reviewNote.reviewAnswers?.completedToday || 'Debrief recorded.'}
            </p>
          </div>
        ) : (
          <div className="mt-3 p-3 rounded-xl bg-slate-900/30 border border-dashed border-slate-800 text-xs space-y-1.5">
            <p className="text-slate-400">
              Reflect on wins, insights, and define your #1 priority for tomorrow.
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onOpenReviewModal}
        className="w-full min-h-[44px] mt-3 px-4 py-2 rounded-xl bg-[#7C5CFC]/20 hover:bg-[#7C5CFC]/30 border border-[#7C5CFC]/40 text-[#F5F7FF] text-xs font-semibold flex items-center justify-center gap-2 transition"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#36C5F0]" />
        <span>{reviewNote ? 'Review / Edit Today’s Debrief' : 'Start Daily Review'}</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
