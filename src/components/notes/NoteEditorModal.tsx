import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Note, NoteCategory } from '../../types';
import { formatDateKey } from '../../utils/date';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingNote?: Note | null;
  onSave: (data: {
    title: string;
    content: string;
    category: NoteCategory;
    dateKey: string;
    tags?: string[];
  }) => Promise<void>;
}

const CATEGORY_LABELS: { id: NoteCategory; label: string }[] = [
  { id: 'reflection', label: 'Daily Reflection' },
  { id: 'content_idea', label: 'Content Idea' },
  { id: 'tech_note', label: 'Technology Note' },
  { id: 'project_idea', label: 'Project Idea' },
  { id: 'tomorrow_task', label: 'Tomorrow Task' },
  { id: 'win', label: 'Win of the Day' },
  { id: 'challenge', label: 'Challenge & Solution' },
];

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  existingNote,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('tech_note');
  const [dateKey, setDateKey] = useState(formatDateKey(new Date()));
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
      setCategory(existingNote.category);
      setDateKey(existingNote.dateKey);
      setTagsInput(existingNote.tags?.join(', ') || '');
    } else {
      setTitle('');
      setContent('');
      setCategory('tech_note');
      setDateKey(formatDateKey(new Date()));
      setTagsInput('');
    }
    setError(null);
  }, [existingNote, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for this note.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      await onSave({
        title: title.trim(),
        content: content.trim(),
        category,
        dateKey,
        tags,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingNote ? 'Edit Journal Note' : 'Create Note or Reflection'}
      subtitle="Synchronized privately to your Firestore workspace"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
            Note Title *
          </label>
          <input
            type="text"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Next Architecture Phase, React Concurrency Insight"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
          />
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NoteCategory)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#7C5CFC]"
            >
              {CATEGORY_LABELS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Log Date
            </label>
            <input
              type="date"
              required
              value={dateKey}
              onChange={(e) => setDateKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#7C5CFC]"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
            Note Body & Reflections
          </label>
          <textarea
            rows={7}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Document technical ideas, content outlines, tasks, wins, or thoughts..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC] leading-relaxed font-mono"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="productivity, coding, video-ideas, books"
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
          />
        </div>

        {/* Submit */}
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
            className="min-h-[44px] px-5 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F2] text-white shadow-lg shadow-[#7C5CFC]/25 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : existingNote ? 'Update Note' : 'Create Note'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
