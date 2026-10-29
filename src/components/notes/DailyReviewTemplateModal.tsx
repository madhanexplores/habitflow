import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Clock, Save } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Note, DailyReviewAnswers } from '../../types';
import { formatDateKey } from '../../utils/date';

interface DailyReviewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingNote?: Note | null;
  selectedDate: Date;
  onSave: (data: {
    title: string;
    content: string;
    category: 'reflection';
    dateKey: string;
    tags?: string[];
    reviewAnswers: DailyReviewAnswers;
  }) => Promise<void>;
}

export const DailyReviewTemplateModal: React.FC<DailyReviewTemplateModalProps> = ({
  isOpen,
  onClose,
  existingNote,
  selectedDate,
  onSave,
}) => {
  const [completedToday, setCompletedToday] = useState('');
  const [learnedToday, setLearnedToday] = useState('');
  const [wentWell, setWentWell] = useState('');
  const [distractedBy, setDistractedBy] = useState('');
  const [tomorrowPriority, setTomorrowPriority] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (existingNote?.reviewAnswers) {
      setCompletedToday(existingNote.reviewAnswers.completedToday || '');
      setLearnedToday(existingNote.reviewAnswers.learnedToday || '');
      setWentWell(existingNote.reviewAnswers.wentWell || '');
      setDistractedBy(existingNote.reviewAnswers.distractedBy || '');
      setTomorrowPriority(existingNote.reviewAnswers.tomorrowPriority || '');
    } else {
      setCompletedToday('');
      setLearnedToday('');
      setWentWell('');
      setDistractedBy('');
      setTomorrowPriority('');
    }
    setSavedSuccess(false);
  }, [existingNote, isOpen]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const reviewAnswers: DailyReviewAnswers = {
        completedToday,
        learnedToday,
        wentWell,
        distractedBy,
        tomorrowPriority,
      };

      const dateStr = formatDateKey(selectedDate);
      const summaryContent = [
        `1. Completed: ${completedToday || 'None'}`,
        `2. Learned: ${learnedToday || 'None'}`,
        `3. Wins: ${wentWell || 'None'}`,
        `4. Distractions: ${distractedBy || 'None'}`,
        `5. Priority Tomorrow: ${tomorrowPriority || 'None'}`,
      ].join('\n\n');

      await onSave({
        title: `Daily Review — ${dateStr}`,
        content: summaryContent,
        category: 'reflection',
        dateKey: dateStr,
        tags: ['daily-review', 'reflection'],
        reviewAnswers,
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 800);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Review & Evening Calibration"
      subtitle="Calibrate your progress with 5 core questions"
      maxWidth="xl"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Autosave / Status indicator */}
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)]">
          <span className="font-mono">DATE: {formatDateKey(selectedDate)}</span>
          {savedSuccess ? (
            <span className="text-[#35D49A] flex items-center gap-1 font-semibold">
              <Check className="w-3.5 h-3.5" /> Saved to Firestore
            </span>
          ) : saving ? (
            <span className="text-[#36C5F0] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 animate-spin" /> Saving...
            </span>
          ) : (
            <span>Private and encrypted in your personal command log</span>
          )}
        </div>

        {/* Question 1 */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--text-primary)]">
            1. What did I complete today?
          </label>
          <textarea
            rows={2}
            value={completedToday}
            onChange={(e) => setCompletedToday(e.target.value)}
            placeholder="Key milestones, habits finished, code shipped, study sessions..."
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
          />
        </div>

        {/* Question 2 */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--text-primary)]">
            2. What did I learn?
          </label>
          <textarea
            rows={2}
            value={learnedToday}
            onChange={(e) => setLearnedToday(e.target.value)}
            placeholder="Insights, new technical concepts, book lessons, self-observations..."
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
          />
        </div>

        {/* Question 3 */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--text-primary)]">
            3. What went well?
          </label>
          <textarea
            rows={2}
            value={wentWell}
            onChange={(e) => setWentWell(e.target.value)}
            placeholder="Wins of the day, positive interactions, focused deep work hours..."
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
          />
        </div>

        {/* Question 4 */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--text-primary)]">
            4. What distracted me?
          </label>
          <textarea
            rows={2}
            value={distractedBy}
            onChange={(e) => setDistractedBy(e.target.value)}
            placeholder="Context switches, friction points, social media rabbit holes, fatigue..."
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
          />
        </div>

        {/* Question 5 */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--text-primary)]">
            5. What is my most important task tomorrow?
          </label>
          <textarea
            rows={2}
            value={tomorrowPriority}
            onChange={(e) => setTomorrowPriority(e.target.value)}
            placeholder="The single high-leverage objective that makes tomorrow successful..."
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl text-[var(--text-secondary)] hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F2] text-white flex items-center gap-2 shadow-lg shadow-[#7C5CFC]/25 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Daily Review'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
