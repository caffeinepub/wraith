import React, { useState } from 'react';
import { useGetAllMissions } from '../hooks/useQueries';
import MissionList from '../components/MissionList';
import MissionDetail from '../components/MissionDetail';
import MissionForm from '../components/MissionForm';
import { Mission } from '../backend';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Target, RefreshCw } from 'lucide-react';

export default function MissionDashboard() {
  const { data: missions = [], isLoading, error, refetch } = useGetAllMissions();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const activeMissions = missions.filter(m => m.status === 'active').length;
  const criticalMissions = missions.filter(m => m.threatLevel === 'critical').length;

  if (selectedMission) {
    const currentMission = missions.find(m => m.codename === selectedMission.codename) || selectedMission;
    return (
      <MissionDetail
        mission={currentMission}
        onBack={() => setSelectedMission(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-amber-ops" />
            <h1 className="font-display text-amber-ops text-2xl tracking-widest text-glow-amber">
              MISSION OPS
            </h1>
          </div>
          <p className="text-ops-muted text-xs font-mono tracking-wider">
            COVERT OPERATIONS MANAGEMENT SYSTEM // WRAITH UNIT
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className="text-ops-muted hover:text-amber-ops rounded-none h-8 w-8"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-amber-ops/20 border border-amber-ops/50 text-amber-ops hover:bg-amber-ops/30 font-mono font-bold tracking-widest rounded-none text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> NEW MISSION
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'TOTAL MISSIONS', value: missions.length, color: 'text-foreground' },
          { label: 'ACTIVE', value: activeMissions, color: 'text-green-ops' },
          { label: 'CRITICAL THREAT', value: criticalMissions, color: 'text-red-ops' },
          { label: 'FIELD REPORTS', value: missions.reduce((acc, m) => acc + m.fieldReports.length, 0), color: 'text-amber-ops' },
        ].map(({ label, value, color }) => (
          <div key={label} className="ops-card p-3 text-center">
            <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-ops-muted text-xs font-mono tracking-wider mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Mission list */}
      <div className="ops-card p-4">
        <div className="flex items-center gap-2 mb-4 border-b border-ops-border/40 pb-3">
          <span className="text-amber-ops text-xs font-mono font-bold tracking-widest">ACTIVE OPERATIONS DATABASE</span>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 bg-ops-surface/50 rounded-none" />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-ops text-xs font-mono border border-red-ops/30 bg-red-ops/10 p-3">
            ERROR LOADING MISSIONS: {(error as Error)?.message}
          </div>
        ) : (
          <MissionList missions={missions} onViewMission={setSelectedMission} />
        )}
      </div>

      {/* Create mission dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="bg-ops-surface border border-amber-ops/30 rounded-none max-w-2xl p-0 overflow-hidden">
          <div className="classification-banner-top-secret text-center py-1 text-xs font-display font-bold tracking-widest">
            ⬛ CLASSIFIED // TOP SECRET ⬛
          </div>
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-display text-amber-ops tracking-widest">
                INITIATE NEW OPERATION
              </DialogTitle>
            </DialogHeader>
            <MissionForm onClose={() => setShowCreateForm(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
