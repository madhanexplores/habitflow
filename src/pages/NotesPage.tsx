import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { NotesList } from '../components/notes/NotesList';
import { NoteEditorModal } from '../components/notes/NoteEditorModal';
import { DailyReviewTemplateModal } from '../components/notes/DailyReviewTemplateModal';
import { Note } from '../types';

export const NotesPage: React.FC = () => {
  const { notes, addNote, editNote, deleteNote, selectedDate } = useHabits();

  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <NotesList
        notes={notes}
        onOpenNewNote={() => setIsNewNoteModalOpen(true)}
        onOpenDailyReview={() => setIsReviewModalOpen(true)}
        onEditNote={(n) => setEditingNote(n)}
        onDeleteNote={deleteNote}
      />

      <NoteEditorModal
        isOpen={isNewNoteModalOpen}
        onClose={() => setIsNewNoteModalOpen(false)}
        onSave={async (data) => {
          await addNote(data);
        }}
      />

      {editingNote && (
        <NoteEditorModal
          isOpen={true}
          onClose={() => setEditingNote(null)}
          existingNote={editingNote}
          onSave={async (data) => {
            await editNote(editingNote.id, data);
            setEditingNote(null);
          }}
        />
      )}

      <DailyReviewTemplateModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        selectedDate={selectedDate}
        onSave={async (data) => {
          await addNote(data);
        }}
      />
    </div>
  );
};
