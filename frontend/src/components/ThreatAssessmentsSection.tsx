import React, { useState } from 'react';
import { ThreatAssessment } from '../backend';
import { useGetAllThreatAssessments, useDeleteThreatAssessment } from '../hooks/useQueries';
import ThreatAssessmentForm from './ThreatAssessmentForm';
import { threatCategoryLabel, formatTimestamp } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';

export default function ThreatAssessmentsSection() {
  const { data: assessments = [], isLoading, error } = useGetAllThreatAssessments();
  const deleteAssessment = useDeleteThreatAssessment();
  const [showForm, setShowForm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<ThreatAssessment | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (subjectName: string) => {
    setDeletingId(subjectName);
    try {
      await deleteAssessment.mutateAsync(subjectName);
    } finally {
      setDeletingId(null);
    }
  };

  const getRiskColor = (score: bigint) => {
    const n = Number(score);
    if (n <= 3) return 'text-amber-ops';
    if (n <= 6) return 'text-orange-400';
    return 'text-red-ops';
  };

  const getRiskBg = (score: bigint) => {
    const n = Number(score);
    if (n <= 3) return 'bg-amber-ops/20 border-amber-ops/40';
    if (n <= 6) return 'bg-orange-400/20 border-orange-400/40';
    return 'bg-red-ops/20 border-red-ops/40 glow-red';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-ops" />
          <span className="text-amber-ops text-xs font-mono font-bold tracking-widest">
            THREAT ASSESSMENTS — {assessments.length} ON FILE
          </span>
        </div>
        <Button
          onClick={() => { setEditingAssessment(undefined); setShowForm(true); }}
          className="bg-amber-ops/20 border border-amber-ops/50 text-amber-ops hover:bg-amber-ops/30 font-mono font-bold tracking-widest rounded-none text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> NEW ASSESSMENT
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
      ) : assessments.length === 0 ? (
        <div className="text-center py-10 text-ops-muted font-mono text-xs tracking-wider border border-dashed border-ops-border/30">
          NO THREAT ASSESSMENTS ON FILE
        </div>
      ) : (
        <div className="space-y-2">
          {assessments.map((assessment) => (
            <div key={assessment.subjectName} className="ops-card p-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-display text-amber-ops text-sm tracking-widest font-bold">
                    {assessment.subjectName}
                  </span>
                  <span className="text-xs font-mono text-ops-muted bg-ops-bg/60 border border-ops-border/30 px-1.5 py-0.5">
                    {threatCategoryLabel(assessment.threatCategory)}
                  </span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 border ${getRiskBg(assessment.riskScore)} ${getRiskColor(assessment.riskScore)}`}>
                    RISK: {Number(assessment.riskScore)}/10
                  </span>
                </div>
                {assessment.summary && (
                  <p className="text-ops-muted text-xs font-mono line-clamp-2 mb-1">{assessment.summary}</p>
                )}
                <div className="flex items-center gap-3 text-xs font-mono text-ops-muted">
                  {assessment.linkedMissions.length > 0 && (
                    <span>{assessment.linkedMissions.length} LINKED MISSION{assessment.linkedMissions.length !== 1 ? 'S' : ''}</span>
                  )}
                  <span>UPDATED: {formatTimestamp(assessment.lastUpdate)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 text-ops-muted hover:text-amber-ops rounded-none"
                  onClick={() => { setEditingAssessment(assessment); setShowForm(true); }}
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-ops-muted hover:text-red-ops rounded-none">
                      {deletingId === assessment.subjectName
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-ops-surface border border-red-ops/30 rounded-none">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display text-red-ops tracking-widest">CONFIRM DELETION</AlertDialogTitle>
                      <AlertDialogDescription className="font-mono text-xs text-ops-muted">
                        DELETE THREAT ASSESSMENT: <span className="text-amber-ops">{assessment.subjectName}</span>?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-none font-mono text-xs border-ops-border/60">ABORT</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(assessment.subjectName)}
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

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingAssessment(undefined); } }}>
        <DialogContent className="bg-ops-surface border border-amber-ops/30 rounded-none max-w-2xl p-0 overflow-hidden">
          <div className="classification-banner-top-secret text-center py-1 text-xs font-display font-bold tracking-widest">
            ⬛ CLASSIFIED // TOP SECRET ⬛
          </div>
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-display text-amber-ops tracking-widest">
                {editingAssessment ? 'EDIT THREAT ASSESSMENT' : 'NEW THREAT ASSESSMENT'}
              </DialogTitle>
            </DialogHeader>
            <ThreatAssessmentForm
              assessment={editingAssessment}
              onClose={() => { setShowForm(false); setEditingAssessment(undefined); }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
