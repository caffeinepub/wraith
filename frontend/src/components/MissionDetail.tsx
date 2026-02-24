import React, { useState } from 'react';
import { Mission } from '../backend';
import { formatTimestamp, missionTypeLabel } from '../lib/utils';
import StatusBadge from './StatusBadge';
import ThreatIndicator from './ThreatIndicator';
import FieldReportsLog from './FieldReportsLog';
import MissionForm from './MissionForm';
import { Button } from '@/components/ui/button';
import { Edit, ArrowLeft, Target, Users, Clock } from 'lucide-react';

interface MissionDetailProps {
  mission: Mission;
  onBack: () => void;
}

export default function MissionDetail({ mission, onBack }: MissionDetailProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing(false)} className="text-ops-muted hover:text-amber-ops text-xs font-mono flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> BACK TO DETAIL
          </button>
        </div>
        <div className="ops-card p-4">
          <h3 className="text-amber-ops font-display text-sm tracking-widest mb-4">EDIT MISSION: {mission.codename}</h3>
          <MissionForm mission={mission} onClose={() => setEditing(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-ops-muted hover:text-amber-ops text-xs font-mono flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3 h-3" /> BACK TO MISSIONS
        </button>
        <Button
          onClick={() => setEditing(true)}
          variant="outline"
          size="sm"
          className="border-amber-ops/40 text-amber-ops hover:bg-amber-ops/10 rounded-none text-xs font-mono"
        >
          <Edit className="w-3 h-3 mr-1" /> EDIT
        </Button>
      </div>

      <div className="ops-card p-4 space-y-4">
        {/* Header */}
        <div className="border-b border-ops-border/40 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-amber-ops" />
                <h2 className="font-display text-amber-ops text-xl tracking-widest text-glow-amber">
                  OP: {mission.codename}
                </h2>
              </div>
              <div className="text-ops-muted text-xs font-mono">{missionTypeLabel(mission.missionType)}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={mission.status} />
              <ThreatIndicator level={mission.threatLevel} />
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div>
            <div className="text-ops-muted tracking-wider mb-1">LAST UPDATE</div>
            <div className="flex items-center gap-1 text-foreground">
              <Clock className="w-3 h-3 text-amber-ops" />
              {formatTimestamp(mission.lastUpdate)}
            </div>
          </div>
          <div>
            <div className="text-ops-muted tracking-wider mb-1">OPERATIVES</div>
            <div className="flex items-center gap-1 text-foreground">
              <Users className="w-3 h-3 text-amber-ops" />
              {mission.assignedOperatives.length > 0 ? mission.assignedOperatives.join(', ') : 'NONE ASSIGNED'}
            </div>
          </div>
        </div>

        {/* Objectives */}
        {mission.objectives.length > 0 && (
          <div>
            <div className="text-amber-ops text-xs font-mono tracking-widest mb-2">OBJECTIVES</div>
            <div className="space-y-1">
              {mission.objectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2 text-xs font-mono">
                  <span className="text-amber-ops flex-shrink-0">{String(i + 1).padStart(2, '0')}.</span>
                  <span className="text-foreground">{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Field Reports */}
        <FieldReportsLog codename={mission.codename} reports={mission.fieldReports} />
      </div>
    </div>
  );
}
