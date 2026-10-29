import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Calendar,
  Sparkles,
  Tag,
} from 'lucide-react';
import { Note, NoteCategory } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface NotesListProps {
  notes: Note[];
  onOpenNewNote: () => void;
  onOpenDailyReview: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

const CATEGORY_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Notes' },
  { id: 'reflection', label: 'Daily Reviews' },
  { id: 'content_idea', label: 'Content Ideas' },
  { id: 'tech_note', label: 'Tech Notes' },
  { id: 'project_idea', label: 'Projects' },
  { id: 'tomorrow_task', label: 'Tomorrow Tasks' },
  { id: 'win', label: 'Wins' },
  { id: 'challenge', label: 'Challenges' },
];

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  onOpenNewNote,
  onOpenDailyReview,
  onEditNote,
  onDeleteNote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const filteredNotes = notes.filter((n) => {
    const matchesCat = selectedCategory === 'all' || n.category === selectedCategory;
    const matchesQuery =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Journal & Command Notes
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Reflections, content outlines, project plans, and daily reviews
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenDailyReview}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs font-semibold text-[#36C5F0] hover:border-[#36C5F0]/40 flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Review Template</span>
          </button>
          <button
            onClick={onOpenNewNote}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F2] text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-[#7C5CFC]/25 hover:brightness-110 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search notes, reflections, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                selectedCategory === tab.id
                  ? 'bg-[#7C5CFC] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-white bg-[var(--bg-secondary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-base font-semibold text-[var(--text-primary)]">
            No notes found
          </h4>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            {searchQuery
              ? 'No reflections matched your search criteria.'
              : 'Start your personal command log by recording your thoughts, wins, and daily review.'}
          </p>
          <button
            onClick={onOpenNewNote}
            className="min-h-[44px] mt-2 px-4 py-2 rounded-xl bg-[#7C5CFC] text-white text-xs font-semibold hover:bg-[#6848F2] transition"
          >
            Create First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#7C5CFC]/30 transition p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span className="font-mono text-[#36C5F0]">
                    {note.category.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="font-mono">{note.dateKey}</span>
                </div>

                <h4 className="text-base font-bold text-[var(--text-primary)] line-clamp-1">
                  {note.title}
                </h4>

                <p className="text-xs text-[var(--text-secondary)] line-clamp-4 leading-relaxed font-mono whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                {/* Tags */}
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {note.tags && note.tags.length > 0 ? (
                    note.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono text-slate-400 bg-[var(--bg-secondary)] px-2 py-0.5 rounded"
                      >
                        #{t}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-600 font-mono">No tags</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEditNote(note)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Edit Note"
                    aria-label="Edit Note"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setNoteToDelete(note)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete Note"
                    aria-label="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) onDeleteNote(noteToDelete.id);
        }}
        title="Delete Note"
        message={`Are you sure you want to permanently delete "${noteToDelete?.title}"?`}
        confirmLabel="Delete Note"
      />
    </div>
  );
};
