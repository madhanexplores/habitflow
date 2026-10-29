import React, { useState } from 'react';
import {
  Check,
  Clock,
  Calendar,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { Task, TaskPriority } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { formatDateKey } from '../../utils/date';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { toggleComplete, deleteTask, toggleSubtask } = useTasks();
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const todayKey = formatDateKey(new Date());

  // Priority color styles
  const priorityConfig: Record<
    TaskPriority,
    { label: string; bg: string; text: string; border: string; glow: string }
  > = {
    urgent: {
      label: 'URGENT',
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/40',
      glow: 'shadow-rose-500/20',
    },
    high: {
      label: 'HIGH',
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/40',
      glow: 'shadow-amber-500/20',
    },
    medium: {
      label: 'MED',
      bg: 'bg-[#36C5F0]/15',
      text: 'text-[#36C5F0]',
      border: 'border-[#36C5F0]/40',
      glow: 'shadow-cyan-500/20',
    },
    low: {
      label: 'LOW',
      bg: 'bg-slate-700/20',
      text: 'text-slate-400',
      border: 'border-slate-700/40',
      glow: 'shadow-slate-500/10',
    },
  };

  const currentPriority = priorityConfig[task.priority] || priorityConfig.medium;

  // Due date indicator
  const getDueDateLabel = () => {
    if (!task.dueDate) return null;
    if (task.dueDate === todayKey) {
      return { text: 'Today', isOverdue: false, isToday: true };
    }
    const isOverdue = !task.completed && task.dueDate < todayKey;
    const tomorrowKey = formatDateKey(new Date(Date.now() + 86400000));
    if (task.dueDate === tomorrowKey) {
      return { text: 'Tomorrow', isOverdue: false, isToday: false };
    }
    return { text: task.dueDate, isOverdue, isToday: false };
  };

  const dueInfo = getDueDateLabel();

  // Subtask progress
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  return (
    <div
      className={`group relative rounded-2xl bg-[var(--bg-card)] border transition-all duration-200 p-4 ${
        task.completed
          ? 'border-slate-800/60 opacity-75 hover:opacity-100'
          : 'border-[var(--border-subtle)] hover:border-[#7C5CFC]/40 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Completion Checkbox */}
        <button
          onClick={() => toggleComplete(task.id)}
          className={`shrink-0 w-6 h-6 mt-0.5 rounded-lg border flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-[#35D49A] border-[#35D49A] text-slate-950 shadow-md shadow-[#35D49A]/30'
              : 'border-slate-700 bg-slate-900/50 hover:border-[#35D49A] hover:bg-[#35D49A]/10 text-transparent'
          }`}
          aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
          title={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h3
                className={`text-sm font-semibold transition-all break-words ${
                  task.completed
                    ? 'line-through text-[var(--text-secondary)]'
                    : 'text-[var(--text-primary)]'
                }`}
              >
                {task.title}
              </h3>

              {task.description && (
                <p
                  className={`text-xs line-clamp-2 leading-relaxed ${
                    task.completed
                      ? 'text-slate-600'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {task.description}
                </p>
              )}
            </div>

            {/* Actions Menu */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg text-slate-500 hover:text-[var(--text-primary)] hover:bg-slate-800/40 transition opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Task options"
                title="Task options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-7 z-50 w-36 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-xl p-1 text-xs space-y-0.5">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(task);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[var(--text-primary)] hover:bg-slate-800/50 transition text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#36C5F0]" />
                      <span>Edit Task</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        deleteTask(task.id);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Badges / Metadata row */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px]">
            {/* Priority Badge */}
            <span
              className={`px-2 py-0.5 rounded-md font-mono font-semibold tracking-wider border ${currentPriority.bg} ${currentPriority.text} ${currentPriority.border}`}
            >
              {currentPriority.label}
            </span>

            {/* Category */}
            {task.category && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800/60 text-[var(--text-secondary)] font-medium border border-slate-700/40">
                {task.category}
              </span>
            )}

            {/* Due Date Indicator */}
            {dueInfo && (
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] border ${
                  dueInfo.isOverdue
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 font-semibold'
                    : dueInfo.isToday
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 font-semibold'
                    : 'bg-slate-800/50 text-[var(--text-secondary)] border-slate-700/40'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>{dueInfo.text}</span>
                {task.dueTime && (
                  <span className="text-[10px] opacity-75">· {task.dueTime}</span>
                )}
              </span>
            )}

            {/* Subtasks summary trigger */}
            {subtasks.length > 0 && (
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-mono transition border ${
                  completedSubtasks === subtasks.length
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700/40 hover:bg-slate-700/60'
                }`}
                title="Toggle subtasks checklist"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>
                  {completedSubtasks}/{subtasks.length}
                </span>
                {showSubtasks ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="hidden sm:flex items-center gap-1 text-slate-500">
                <Tag className="w-3 h-3" />
                <span className="truncate max-w-[140px]">
                  {task.tags.map((t) => `#${t}`).join(' ')}
                </span>
              </div>
            )}
          </div>

          {/* Expandable Subtasks Checklist */}
          {showSubtasks && subtasks.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Subtasks Checklist
              </span>
              <div className="space-y-1.5">
                {subtasks.map((sub) => (
                  <label
                    key={sub.id}
                    className="flex items-center gap-2.5 text-xs text-[var(--text-primary)] hover:bg-slate-800/30 p-1.5 rounded-lg cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => toggleSubtask(task.id, sub.id)}
                      className="rounded border-slate-700 bg-slate-900 text-[#35D49A] focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                    />
                    <span
                      className={`break-words ${
                        sub.completed
                          ? 'line-through text-[var(--text-secondary)]'
                          : ''
                      }`}
                    >
                      {sub.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
