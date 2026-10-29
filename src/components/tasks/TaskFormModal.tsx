import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Tag,
  AlertTriangle,
  Folder,
  Link as LinkIcon,
} from 'lucide-react';
import { Task, TaskPriority, Subtask } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { useHabits } from '../../context/HabitContext';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

const CATEGORIES = [
  'Projects',
  'Learning',
  'Fitness',
  'College',
  'Freelancing',
  'Content Creation',
  'Personal Growth',
  'Health',
  'General',
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
}) => {
  const { addTask, editTask } = useTasks();
  const { habits } = useHabits();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('Projects');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [linkedHabitId, setLinkedHabitId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'medium');
      setCategory(taskToEdit.category || 'General');
      setDueDate(taskToEdit.dueDate || '');
      setDueTime(taskToEdit.dueTime || '');
      setLinkedHabitId(taskToEdit.linkedHabitId || '');
      setTags(taskToEdit.tags || []);
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('Projects');
      setDueDate(new Date().toISOString().split('T')[0]); // default to today
      setDueTime('');
      setLinkedHabitId('');
      setTags([]);
      setSubtasks([]);
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (taskToEdit) {
        await editTask(taskToEdit.id, {
          title: title.trim(),
          description: description.trim(),
          priority,
          category,
          dueDate: dueDate || undefined,
          dueTime: dueTime || undefined,
          linkedHabitId: linkedHabitId || undefined,
          tags,
          subtasks,
        });
      } else {
        await addTask({
          title: title.trim(),
          description: description.trim(),
          priority,
          category,
          dueDate: dueDate || undefined,
          dueTime: dueTime || undefined,
          linkedHabitId: linkedHabitId || undefined,
          tags,
          subtasks,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7C5CFC] to-[#36C5F0] flex items-center justify-center text-white">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              {taskToEdit ? 'Edit Mission Task' : 'Create Mission Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--text-primary)] hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Deploy Firebase security rules & test tokens"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#7C5CFC] transition"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key context, deliverables, or checklist notes..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[#7C5CFC] transition resize-none"
            />
          </div>

          {/* Priority Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase">
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'low', label: 'Low', color: 'border-slate-600 text-slate-400 bg-slate-800/40' },
                  { id: 'medium', label: 'Medium', color: 'border-[#36C5F0]/50 text-[#36C5F0] bg-[#36C5F0]/10' },
                  { id: 'high', label: 'High', color: 'border-amber-500/50 text-amber-400 bg-amber-500/10' },
                  { id: 'urgent', label: 'Urgent', color: 'border-rose-500/60 text-rose-400 bg-rose-500/15' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-semibold font-mono border transition ${
                    priority === p.id
                      ? `${p.color} ring-1 ring-offset-0 ring-current`
                      : 'border-slate-800 text-[var(--text-secondary)] hover:bg-slate-800/40'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Linked Habit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-[#36C5F0]" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[#7C5CFC] transition"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#7C5CFC]" />
                Link to Habit (Optional)
              </label>
              <select
                value={linkedHabitId}
                onChange={(e) => setLinkedHabitId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[#7C5CFC] transition"
              >
                <option value="">None (Independent Task)</option>
                {habits.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Due Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FFB454]" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[#7C5CFC] transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Target Time (Optional)
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[#7C5CFC] transition"
              />
            </div>
          </div>

          {/* Subtasks Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase flex items-center justify-between">
              <span>Subtasks / Action Checklist</span>
              <span className="text-[10px] text-slate-500 font-normal">
                {subtasks.length} item(s)
              </span>
            </label>

            {/* Subtasks list */}
            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs"
                  >
                    <span className="text-[var(--text-primary)] truncate">
                      {st.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-500 hover:text-rose-400 transition"
                      title="Remove subtask"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add subtask input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add a subtask step and press Enter..."
                className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[#7C5CFC] transition"
              />
              <button
                type="button"
                onClick={() => handleAddSubtask()}
                className="p-2 rounded-xl bg-slate-800 text-[var(--text-primary)] hover:bg-slate-700 transition"
                title="Add step"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#35D49A]" />
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#7C5CFC]/15 text-[#36C5F0] text-xs font-mono border border-[#7C5CFC]/30"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-400 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type tag and press Enter (e.g. backend, urgent)..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[#7C5CFC] transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#36C5F0] text-white text-xs font-semibold shadow-lg shadow-[#7C5CFC]/25 hover:brightness-110 active:scale-95 disabled:opacity-50 transition"
            >
              {isSubmitting
                ? 'Saving...'
                : taskToEdit
                ? 'Update Task'
                : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
