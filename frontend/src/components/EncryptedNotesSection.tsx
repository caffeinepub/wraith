import React, { useState } from 'react';
import { ClassifiedNote } from '../backend';
import { useGetAllClassifiedNotes, useDeleteClassifiedNote } from '../hooks/useQueries';
import ClassifiedNoteForm from './ClassifiedNoteForm';
import { clearanceLevelLabel, clearanceLevelClass, formatTimestamp } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Loader2, Lock, Eye, EyeOff } from 'lucide-react';

export default function EncryptedNotesSection() {
  const { data: notes = [], isLoading, error } = useGetAllClassifiedNotes();
  const deleteNote = useDeleteClassifiedNote();
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<ClassifiedNote | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  const handleDelete = async (title: string) => {
    setDeletingId(title);
    try {
      await deleteNote.mutateAsync(title);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-ops" />
          <span className="text-amber-ops text-xs font-mono font-bold tracking-widest">
            ENCRYPTED NOTES — {notes.length} ON FILE
          </span>
        </div>
        <Button
          onClick={() => { setEditingNote(undefined); setShowForm(true); }}
          className="bg-amber-ops/20 border border-amber-ops/50 text-amber-ops hover:bg-amber-ops/30 font-mono font-bold tracking-widest rounded-none text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> NEW NOTE
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 bg-ops-surface/50 rounded-none" />)}
        </div>
      ) : error ? (
        <div className="text-red-ops text-xs font-mono border border-red-ops/30 bg-red-ops/10 p-3">
          ERROR: {(error as Error)?.message}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-10 text-ops-muted font-mono text-xs tracking-wider border border-dashed border-ops-border/30">
          NO CLASSIFIED NOTES ON FILE
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note.title} className="ops-card p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-display text-amber-ops text-sm tracking-widest font-bold">{note.title}</span>
                    <span className={`text-xs font-mono font-bold px-1.5 py-0.5 ${clearanceLevelClass(note.classification)}`}>
                      {clearanceLevelLabel(note.classification)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-ops-muted mb-2">
                    <span>BY: {note.author || 'UNKNOWN'}</span>
                    <span>{formatTimestamp(note.timestamp)}</span>
                  </div>
                  {expandedNote === note.title ? (
                    <div className="bg-ops-bg/60 border border-ops-border/30 p-3 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                      {note.body}
                    </div>
                  ) : (
                    <p className="text-ops-muted text-xs font-mono line-clamp-2">{note.body}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 text-ops-muted hover:text-amber-ops rounded-none"
                    onClick={() => setExpandedNote(expandedNote === note.title ? null : note.title)}
                  >
                    {expandedNote === note.title ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 text-ops-muted hover:text-amber-ops rounded-none"
                    onClick={() => { setEditingNote(note); setShowForm(true); }}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-ops-muted hover:text-red-ops rounded-none">
                        {deletingId === note.title
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-ops-surface border border-red-ops/30 rounded-none">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display text-red-ops tracking-widest">CONFIRM DELETION</AlertDialogTitle>
                        <AlertDialogDescription className="font-mono text-xs text-ops-muted">
                          DELETE NOTE: <span className="text-amber-ops">{note.title}</span>?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-none font-mono text-xs border-ops-border/60">ABORT</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(note.title)}
                          className="rounded-none font-mono text-xs bg-red-ops/20 border border-red-ops/50 text-red-ops hover:bg-red-ops/30"
                        >
                          CONFIRM
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingNote(undefined); } }}>
        <DialogContent className="bg-ops-surface border border-amber-ops/30 rounded-none max-w-2xl p-0 overflow-hidden">
          <div className="classification-banner-top-secret text-center py-1 text-xs font-display font-bold tracking-widest">
            ⬛ CLASSIFIED // TOP SECRET ⬛
          </div>
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-display text-amber-ops tracking-widest">
                {editingNote ? 'EDIT CLASSIFIED NOTE' : 'NEW CLASSIFIED NOTE'}
              </DialogTitle>
            </DialogHeader>
            <ClassifiedNoteForm
              note={editingNote}
              onClose={() => { setShowForm(false); setEditingNote(undefined); }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
