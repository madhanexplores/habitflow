import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ListTodo,
  Check,
  Plus,
  ArrowRight,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { formatDateKey } from '../../utils/date';
import { TaskPriority } from '../../types';

export const TodayTasksCard: React.FC = () => {
  const { tasks, toggleComplete, addTask } = useTasks();
  const [quickTitle, setQuickTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const todayKey = formatDateKey(new Date());

  // Filter tasks due today or urgent/high pending
  const todayTasks = tasks.filter(
    (t) => t.dueDate === todayKey || (!t.completed && (t.priority === 'urgent' || t.priority === 'high'))
  );

  const completedCount = todayTasks.filter((t) => t.completed).length;

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || isAdding) return;
    setIsAdding(true);
    try {
      await addTask({
        title: quickTitle.trim(),
        dueDate: todayKey,
        priority: 'high',
        category: 'Projects',
      });
      setQuickTitle('');
    } finally {
      setIsAdding(false);
    }
  };

  const priorityBadge: Record<TaskPriority, { color: string; label: string }> = {
    urgent: { color: 'text-rose-400 bg-rose-500/15 border-rose-500/40', label: 'URGENT' },
    high: { color: 'text-amber-400 bg-amber-500/15 border-amber-500/40', label: 'HIGH' },
    medium: { color: 'text-[#36C5F0] bg-[#36C5F0]/15 border-[#36C5F0]/40', label: 'MED' },
    low: { color: 'text-slate-400 bg-slate-800/40 border-slate-700/40', label: 'LOW' },
  };

  return (
    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#7C5CFC]/15 flex items-center justify-center text-[#7C5CFC]">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--text-primary)]">
              Today's Action Tasks
            </h3>
            <p className="text-[10px] text-[var(--text-secondary)]">
              {completedCount}/{todayTasks.length} executed
            </p>
          </div>
        </div>

        <Link
          to="/tasks"
          className="text-[11px] font-mono text-[#36C5F0] hover:underline flex items-center gap-1"
        >
          <span>All Tasks</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleQuickAdd} className="flex items-center gap-1.5">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Quick add task for today..."
          className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
        />
        <button
          type="submit"
          disabled={!quickTitle.trim() || isAdding}
          className="p-1.5 rounded-xl bg-[#7C5CFC]/20 text-[#36C5F0] hover:bg-[#7C5CFC]/30 border border-[#7C5CFC]/30 transition disabled:opacity-40"
          title="Add task"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Tasks List */}
      {todayTasks.length === 0 ? (
        <div className="py-4 text-center rounded-xl bg-slate-900/20 border border-slate-800/40 space-y-1">
          <p className="text-xs text-[var(--text-secondary)]">
            No priority tasks pending for today.
          </p>
          <Link
            to="/tasks"
            className="text-[11px] font-semibold text-[#7C5CFC] hover:underline inline-block"
          >
            + Create a mission task
          </Link>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
          {todayTasks.slice(0, 5).map((task) => {
            const badge = priorityBadge[task.priority] || priorityBadge.medium;
            return (
              <div
                key={task.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/60 transition group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => toggleComplete(task.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                      task.completed
                        ? 'bg-[#35D49A] border-[#35D49A] text-slate-950'
                        : 'border-slate-700 bg-slate-800 hover:border-[#35D49A]'
                    }`}
                    title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span
                    className={`text-xs truncate ${
                      task.completed
                        ? 'line-through text-slate-500'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${badge.color}`}
                >
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
