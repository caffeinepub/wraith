import React, { useState } from 'react';
import { MissionBriefing } from '../backend';
import { useGetAllMissionBriefings, useDeleteMissionBriefing } from '../hooks/useQueries';
import BriefingForm from '../components/BriefingForm';
import BriefingView from '../components/BriefingView';
import { clearanceLevelLabel, clearanceLevelClass, formatDate } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Loader2, FileText, Eye, RefreshCw, Calendar, User } from 'lucide-react';

export default function FieldOpsBriefing() {
  const { data: briefings = [], isLoading, error, refetch } = useGetAllMissionBriefings();
  const deleteBriefing = useDeleteMissionBriefing();
  const [showForm, setShowForm] = useState(false);
  const [editingBriefing, setEditingBriefing] = useState<MissionBriefing | undefined>();
  const [viewingBriefing, setViewingBriefing] = useState<MissionBriefing | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (codename: string) => {
    setDeletingId(codename);
    try {
      await deleteBriefing.mutateAsync(codename);
    } finally {
      setDeletingId(null);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBriefing(undefined);
  };

  if (viewingBriefing) {
    return <BriefingView briefing={viewingBriefing} onClose={() => setViewingBriefing(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-amber-ops" />
            <h1 className="font-display text-amber-ops text-2xl tracking-widest text-glow-amber">
              FIELD OPS BRIEFINGS
            </h1>
          </div>
          <p className="text-ops-muted text-xs font-mono tracking-wider">
            MISSION BRIEFING DOCUMENTS // CLASSIFIED OPERATIONS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost" size="icon"
            onClick={() => refetch()}
            className="text-ops-muted hover:text-amber-ops rounded-none h-8 w-8"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => { setEditingBriefing(undefined); setShowForm(true); }}
            className="bg-amber-ops/20 border border-amber-ops/50 text-amber-ops hover:bg-amber-ops/30 font-mono font-bold tracking-widest rounded-none text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> NEW BRIEFING
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'TOTAL BRIEFINGS', value: briefings.length, color: 'text-foreground' },
          { label: 'TOP SECRET', value: briefings.filter(b => b.classificationLevel === 'topSecret').length, color: 'text-red-ops' },
          { label: 'TS/SCI', value: briefings.filter(b => b.classificationLevel === 'TS_SCI').length, color: 'text-red-400' },
          { label: 'TOTAL HVTs', value: briefings.reduce((acc, b) => acc + b.hvtProfiles.length, 0), color: 'text-amber-ops' },
        ].map(({ label, value, color }) => (
          <div key={label} className="ops-card p-3 text-center">
            <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-ops-muted text-xs font-mono tracking-wider mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Briefings list */}
      <div className="ops-card p-4">
        <div className="flex items-center gap-2 mb-4 border-b border-ops-border/40 pb-3">
          <span className="text-amber-ops text-xs font-mono font-bold tracking-widest">BRIEFING DOCUMENTS DATABASE</span>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 bg-ops-surface/50 rounded-none" />)}
          </div>
        ) : error ? (
          <div className="text-red-ops text-xs font-mono border border-red-ops/30 bg-red-ops/10 p-3">
            ERROR: {(error as Error)?.message}
          </div>
        ) : briefings.length === 0 ? (
          <div className="text-center py-12 text-ops-muted font-mono text-xs tracking-wider border border-dashed border-ops-border/30">
            NO BRIEFING DOCUMENTS ON FILE
          </div>
        ) : (
          <div className="space-y-2">
            {briefings.map((briefing) => (
              <div
                key={briefing.operationCodename}
                className="ops-card p-3 flex items-center gap-3 hover:border-amber-ops/30 transition-all cursor-pointer group"
                onClick={() => setViewingBriefing(briefing)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-display text-amber-ops text-sm tracking-widest font-bold group-hover:text-glow-amber transition-all">
                      OP: {briefing.operationCodename}
                    </span>
                    <span className={`text-xs font-mono font-bold px-1.5 py-0.5 ${clearanceLevelClass(briefing.classificationLevel)}`}>
                      {clearanceLevelLabel(briefing.classificationLevel)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-ops-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(briefing.missionDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {briefing.leadOfficer}
                    </span>
                    <span>{briefing.objectives.length} OBJ</span>
                    <span>{briefing.hvtProfiles.length} HVT{briefing.hvtProfiles.length !== 1 ? 'S' : ''}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 text-ops-muted hover:text-amber-ops rounded-none"
                    onClick={(e) => { e.stopPropagation(); setViewingBriefing(briefing); }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 text-ops-muted hover:text-amber-ops rounded-none"
                    onClick={(e) => { e.stopPropagation(); setEditingBriefing(briefing); setShowForm(true); }}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-ops-muted hover:text-red-ops rounded-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {deletingId === briefing.operationCodename
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-ops-surface border border-red-ops/30 rounded-none">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display text-red-ops tracking-widest">CONFIRM DELETION</AlertDialogTitle>
                        <AlertDialogDescription className="font-mono text-xs text-ops-muted">
                          DELETE BRIEFING: <span className="text-amber-ops">{briefing.operationCodename}</span>?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-none font-mono text-xs border-ops-border/60">ABORT</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(briefing.operationCodename)}
                          className="rounded-none font-mono text-xs bg-red-ops/20 border border-red-ops/50 text-red-ops hover:bg-red-ops/30"
                        >
                          CONFIRM
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) closeForm(); }}>
        <DialogContent className="bg-ops-surface border border-amber-ops/30 rounded-none max-w-3xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="classification-banner-top-secret text-center py-1 text-xs font-display font-bold tracking-widest sticky top-0 z-10">
            ⬛ CLASSIFIED // TOP SECRET ⬛
          </div>
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-display text-amber-ops tracking-widest">
                {editingBriefing ? 'EDIT MISSION BRIEFING' : 'NEW MISSION BRIEFING'}
              </DialogTitle>
            </DialogHeader>
            <BriefingForm
              existingBriefing={editingBriefing}
              onSuccess={closeForm}
              onCancel={closeForm}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
