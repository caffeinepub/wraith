import React, { useState } from 'react';
import { Mission, MissionStatus, ThreatLevel } from '../backend';
import StatusBadge from './StatusBadge';
import ThreatIndicator from './ThreatIndicator';
import { formatTimestamp, missionTypeLabel } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDeleteMission } from '../hooks/useQueries';
import { Eye, Trash2, Loader2, Filter } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

interface MissionListProps {
  missions: Mission[];
  onViewMission: (mission: Mission) => void;
}

export default function MissionList({ missions, onViewMission }: MissionListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [threatFilter, setThreatFilter] = useState<string>('all');
  const deleteMission = useDeleteMission();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = missions.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (threatFilter !== 'all' && m.threatLevel !== threatFilter) return false;
    return true;
  });

  const handleDelete = async (codename: string) => {
    setDeletingId(codename);
    try {
      await deleteMission.mutateAsync(codename);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-ops-border/40">
        <Filter className="w-3.5 h-3.5 text-ops-muted" />
        <span className="text-ops-muted text-xs font-mono tracking-wider">FILTER:</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-7 w-36 ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-xs rounded-none">
            <SelectValue placeholder="STATUS" />
          </SelectTrigger>
          <SelectContent className="bg-ops-surface border-ops-border/60 rounded-none">
            <SelectItem value="all" className="font-mono text-xs">ALL STATUS</SelectItem>
            <SelectItem value={MissionStatus.active} className="font-mono text-xs text-green-ops">ACTIVE</SelectItem>
            <SelectItem value={MissionStatus.compromised} className="font-mono text-xs text-red-ops">COMPROMISED</SelectItem>
            <SelectItem value={MissionStatus.completed} className="font-mono text-xs text-blue-400">COMPLETED</SelectItem>
            <SelectItem value={MissionStatus.aborted} className="font-mono text-xs text-ops-muted">ABORTED</SelectItem>
          </SelectContent>
        </Select>

        <Select value={threatFilter} onValueChange={setThreatFilter}>
          <SelectTrigger className="h-7 w-36 ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-xs rounded-none">
            <SelectValue placeholder="THREAT" />
          </SelectTrigger>
          <SelectContent className="bg-ops-surface border-ops-border/60 rounded-none">
            <SelectItem value="all" className="font-mono text-xs">ALL THREATS</SelectItem>
            <SelectItem value={ThreatLevel.low} className="font-mono text-xs text-amber-ops">LOW</SelectItem>
            <SelectItem value={ThreatLevel.elevated} className="font-mono text-xs text-orange-400">ELEVATED</SelectItem>
            <SelectItem value={ThreatLevel.critical} className="font-mono text-xs text-red-ops">CRITICAL</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-ops-muted text-xs font-mono ml-auto">
          {filtered.length}/{missions.length} MISSIONS
        </span>
      </div>

      {/* Mission rows */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-ops-muted font-mono text-xs tracking-wider border border-dashed border-ops-border/30">
          NO MISSIONS MATCH CURRENT FILTERS
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((mission) => (
            <div
              key={mission.codename}
              className="ops-card p-3 flex items-center gap-3 hover:border-amber-ops/30 transition-all cursor-pointer group"
              onClick={() => onViewMission(mission)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display text-amber-ops text-sm tracking-widest font-bold group-hover:text-glow-amber transition-all">
                    {mission.codename}
                  </span>
                  <span className="text-ops-muted text-xs font-mono hidden sm:inline">
                    [{missionTypeLabel(mission.missionType)}]
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-ops-muted">
                  <span>{mission.assignedOperatives.length} OPERATIVE{mission.assignedOperatives.length !== 1 ? 'S' : ''}</span>
                  <span>{mission.objectives.length} OBJ</span>
                  <span>{mission.fieldReports.length} REPORTS</span>
                  <span className="hidden sm:inline">{formatTimestamp(mission.lastUpdate)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <ThreatIndicator level={mission.threatLevel} showLabel={false} />
                <StatusBadge status={mission.status} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-ops-muted hover:text-amber-ops rounded-none"
                  onClick={(e) => { e.stopPropagation(); onViewMission(mission); }}
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-ops-muted hover:text-red-ops rounded-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {deletingId === mission.codename ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-ops-surface border border-red-ops/30 rounded-none">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display text-red-ops tracking-widest">CONFIRM DELETION</AlertDialogTitle>
                      <AlertDialogDescription className="font-mono text-xs text-ops-muted">
                        PERMANENTLY DELETE MISSION: <span className="text-amber-ops">{mission.codename}</span>?
                        THIS ACTION CANNOT BE UNDONE.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-none font-mono text-xs border-ops-border/60">ABORT</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(mission.codename)}
                        className="rounded-none font-mono text-xs bg-red-ops/20 border border-red-ops/50 text-red-ops hover:bg-red-ops/30"
                      >
                        CONFIRM DELETE
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
  );
}
