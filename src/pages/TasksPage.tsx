import React, { useState, useMemo } from 'react';
import {
  ListTodo,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Flame,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { Task, TaskPriority } from '../types';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { formatDateKey } from '../utils/date';

type FilterTab = 'all' | 'today' | 'upcoming' | 'urgent_high' | 'completed';
type SortOption = 'priority' | 'dueDate' | 'createdAt' | 'title';

export const TasksPage: React.FC = () => {
  const { tasks, stats, addTask, loadingTasks } = useTasks();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Quick inline add
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  const todayKey = formatDateKey(new Date());

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  // Filter & Sort Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Tab filter
        if (activeTab === 'today') {
          if (t.dueDate !== todayKey) return false;
        } else if (activeTab === 'upcoming') {
          if (!t.dueDate || t.dueDate <= todayKey || t.completed) return false;
        } else if (activeTab === 'urgent_high') {
          if (t.priority !== 'urgent' && t.priority !== 'high') return false;
        } else if (activeTab === 'completed') {
          if (!t.completed) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && t.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q);
          const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchTag) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Keep incomplete tasks above completed in non-completed tabs
        if (activeTab !== 'completed' && a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        if (sortBy === 'priority') {
          const priorityRank: Record<TaskPriority, number> = {
            urgent: 0,
            high: 1,
            medium: 2,
            low: 3,
          };
          const pA = priorityRank[a.priority] ?? 2;
          const pB = priorityRank[b.priority] ?? 2;
          if (pA !== pB) return pA - pB;
          return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
        }

        if (sortBy === 'dueDate') {
          const dateA = a.dueDate || '9999';
          const dateB = b.dueDate || '9999';
          return dateA.localeCompare(dateB);
        }

        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }

        // Default 'createdAt'
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [tasks, activeTab, selectedCategory, searchQuery, sortBy, todayKey]);

  // Quick inline add handler
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || isQuickAdding) return;

    setIsQuickAdding(true);
    try {
      await addTask({
        title: quickTitle.trim(),
        priority: quickPriority,
        dueDate: activeTab === 'today' ? todayKey : todayKey,
        category: selectedCategory !== 'all' ? selectedCategory : 'General',
      });
      setQuickTitle('');
    } finally {
      setIsQuickAdding(false);
    }
  };

  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#36C5F0] animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest text-[#98A2B8] uppercase">
              MISSION CONTROL // TASKS
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mt-1">
            Task Matrix
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1">
            Capture, prioritize, and execute your daily action items alongside your habits.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#36C5F0] text-white text-xs font-semibold shadow-lg shadow-[#7C5CFC]/25 hover:brightness-110 active:scale-95 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Mission Task</span>
        </button>
      </div>

      {/* Task Telemetry HUD Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Tasks */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <span className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">
            Total Captured
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-num text-[var(--text-primary)]">
              {stats.total}
            </span>
            <ListTodo className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">
            All system tasks
          </span>
        </div>

        {/* Due Today */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-amber-500/20 space-y-1">
          <span className="text-[11px] font-mono text-amber-400 uppercase">
            Due Today
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-num text-amber-400">
              {stats.dueToday}
            </span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">
            Targeted for {todayKey}
          </span>
        </div>

        {/* High & Urgent */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-rose-500/20 space-y-1">
          <span className="text-[11px] font-mono text-rose-400 uppercase">
            High / Urgent
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-num text-rose-400">
              {stats.urgentOrHigh}
            </span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">
            Priority execution items
          </span>
        </div>

        {/* Completion Rate */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[#35D49A]/20 space-y-1">
          <span className="text-[11px] font-mono text-[#35D49A] uppercase">
            Completed
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-num text-[#35D49A]">
              {stats.completed} ({stats.completionRate}%)
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#35D49A]" />
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
            <div
              className="h-full bg-[#35D49A] rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Add Bar */}
      <form
        onSubmit={handleQuickAdd}
        className="flex items-center gap-2 p-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] focus-within:border-[#7C5CFC]/60 transition shadow-sm"
      >
        <div className="flex items-center gap-1 pl-2">
          <select
            value={quickPriority}
            onChange={(e) => setQuickPriority(e.target.value as TaskPriority)}
            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700/60 text-xs font-mono font-medium text-[var(--text-primary)] focus:outline-none"
            title="Set task priority"
          >
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🔵 Medium</option>
            <option value="low">⚪ Low</option>
          </select>
        </div>

        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Quick capture: type task and press Enter..."
          className="flex-1 bg-transparent px-2 py-1.5 text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!quickTitle.trim() || isQuickAdding}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-[#7C5CFC] text-[var(--text-primary)] text-xs font-medium transition disabled:opacity-40"
        >
          {isQuickAdding ? 'Adding...' : 'Add'}
        </button>
      </form>

      {/* Filter Tabs & Search Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {(
            [
              { id: 'all', label: 'All Tasks', count: stats.total },
              { id: 'today', label: 'Today', count: stats.dueToday },
              { id: 'urgent_high', label: 'High Priority', count: stats.urgentOrHigh },
              { id: 'upcoming', label: 'Upcoming', count: undefined },
              { id: 'completed', label: 'Completed', count: stats.completed },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#7C5CFC]/20 text-[#36C5F0] border border-[#7C5CFC]/40'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
            />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* Sort Selector */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]">
            <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
            >
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="createdAt">Recent</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      {loadingTasks ? (
        <div className="space-y-3 py-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-[var(--bg-card)] animate-pulse border border-[var(--border-subtle)]"
            />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#7C5CFC]/10 flex items-center justify-center text-[#7C5CFC]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {activeTab === 'completed'
                ? 'No completed tasks yet'
                : 'All clear! No tasks found'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              {searchQuery
                ? `No tasks matching "${searchQuery}". Try clearing the search.`
                : activeTab === 'today'
                ? 'You have no scheduled tasks due today. Great job keeping your agenda clear!'
                : 'Add a new mission task to stay organized and achieve your goals.'}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-[var(--text-primary)] transition mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={handleOpenEdit} />
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};
