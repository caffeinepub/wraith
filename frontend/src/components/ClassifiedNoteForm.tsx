import React, { useState } from 'react';
import { ClassifiedNote, ClearanceLevel } from '../backend';
import { useCreateClassifiedNote, useUpdateClassifiedNote, useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface ClassifiedNoteFormProps {
  note?: ClassifiedNote;
  onClose: () => void;
}

export default function ClassifiedNoteForm({ note, onClose }: ClassifiedNoteFormProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const [title, setTitle] = useState(note?.title || '');
  const [body, setBody] = useState(note?.body || '');
  const [classification, setClassification] = useState<ClearanceLevel>(
    note?.classification || ClearanceLevel.confidential
  );
  const [author, setAuthor] = useState(note?.author || userProfile?.callsign || userProfile?.name || '');

  const createNote = useCreateClassifiedNote();
  const updateNote = useUpdateClassifiedNote();
  const isEditing = !!note;
  const isPending = createNote.isPending || updateNote.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const params = {
      title: title.trim(),
      body: body.trim(),
      classification,
      author: author.trim() || 'UNKNOWN',
    };

    try {
      if (isEditing) {
        await updateNote.mutateAsync({ ...params, title: note.title });
      } else {
        await createNote.mutateAsync(params);
      }
      onClose();
    } catch (err) {
      // error shown below
    }
  };

  const error = createNote.error || updateNote.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">NOTE TITLE *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Classified note title"
            disabled={isEditing}
            className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none focus:border-amber-ops/70"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">CLASSIFICATION</Label>
          <Select value={classification} onValueChange={(v) => setClassification(v as ClearanceLevel)}>
            <SelectTrigger className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-ops-surface border-ops-border/60 rounded-none">
              <SelectItem value={ClearanceLevel.confidential} className="font-mono text-xs text-amber-ops">CONFIDENTIAL</SelectItem>
              <SelectItem value={ClearanceLevel.secret} className="font-mono text-xs text-orange-400">SECRET</SelectItem>
              <SelectItem value={ClearanceLevel.topSecret} className="font-mono text-xs text-red-ops">TOP SECRET</SelectItem>
              <SelectItem value={ClearanceLevel.TS_SCI} className="font-mono text-xs text-red-400">TS/SCI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">AUTHOR</Label>
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author callsign"
            className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none focus:border-amber-ops/70"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-amber-ops text-xs font-mono tracking-widest">NOTE BODY *</Label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Enter classified note content..."
          rows={6}
          className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-xs rounded-none focus:border-amber-ops/70 resize-none"
          required
        />
      </div>

      {error && (
        <div className="text-red-ops text-xs font-mono border border-red-ops/30 bg-red-ops/10 p-2">
          ERROR: {(error as Error)?.message}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={isPending || !title.trim() || !body.trim()}
          className="flex-1 bg-amber-ops/20 border border-amber-ops/50 text-amber-ops hover:bg-amber-ops/30 font-mono font-bold tracking-widest rounded-none"
        >
          {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> PROCESSING...</> : isEditing ? 'UPDATE NOTE' : 'CREATE NOTE'}
        </Button>
        <Button type="button" onClick={onClose} variant="outline"
          className="border-ops-border/60 text-ops-muted hover:text-foreground rounded-none">
          CANCEL
        </Button>
      </div>
    </form>
  );
}
