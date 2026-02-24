import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mission, MissionStatus, ThreatLevel, MissionType } from '../backend';
import { useCreateMission, useUpdateMission } from '../hooks/useQueries';
import { Plus, Trash2, Loader2, X } from 'lucide-react';

interface MissionFormProps {
  mission?: Mission;
  onClose: () => void;
}

export default function MissionForm({ mission, onClose }: MissionFormProps) {
  const [codename, setCodename] = useState(mission?.codename || '');
  const [status, setStatus] = useState<MissionStatus>(mission?.status || MissionStatus.active);
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>(mission?.threatLevel || ThreatLevel.low);
  const [missionType, setMissionType] = useState<MissionType>(mission?.missionType || MissionType.recon);
  const [operativeInput, setOperativeInput] = useState('');
  const [operatives, setOperatives] = useState<string[]>(mission?.assignedOperatives || []);
  const [objectiveInput, setObjectiveInput] = useState('');
  const [objectives, setObjectives] = useState<string[]>(mission?.objectives || []);

  const createMission = useCreateMission();
  const updateMission = useUpdateMission();
  const isEditing = !!mission;
  const isPending = createMission.isPending || updateMission.isPending;

  const addOperative = () => {
    if (operativeInput.trim() && !operatives.includes(operativeInput.trim().toUpperCase())) {
      setOperatives([...operatives, operativeInput.trim().toUpperCase()]);
      setOperativeInput('');
    }
  };

  const addObjective = () => {
    if (objectiveInput.trim()) {
      setObjectives([...objectives, objectiveInput.trim()]);
      setObjectiveInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codename.trim()) return;

    const params = {
      codename: codename.trim().toUpperCase(),
      status,
      threatLevel,
      assignedOperatives: operatives,
      missionType,
      objectives,
    };

    try {
      if (isEditing) {
        await updateMission.mutateAsync({ ...params, codename: mission.codename });
      } else {
        await createMission.mutateAsync(params);
      }
      onClose();
    } catch (err) {
      // error shown below
    }
  };

  const error = createMission.error || updateMission.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">OPERATION CODENAME *</Label>
          <Input
            value={codename}
            onChange={(e) => setCodename(e.target.value)}
            placeholder="e.g. IRON GHOST"
            disabled={isEditing}
            className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none focus:border-amber-ops/70 uppercase"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">MISSION TYPE</Label>
          <Select value={missionType} onValueChange={(v) => setMissionType(v as MissionType)}>
            <SelectTrigger className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-ops-surface border-ops-border/60 rounded-none">
              <SelectItem value={MissionType.recon} className="font-mono text-xs">RECON</SelectItem>
              <SelectItem value={MissionType.cyber} className="font-mono text-xs">CYBER</SelectItem>
              <SelectItem value={MissionType.counterTerror} className="font-mono text-xs">COUNTER-TERROR</SelectItem>
              <SelectItem value={MissionType.inPersonOp} className="font-mono text-xs">IN-PERSON OP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">STATUS</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as MissionStatus)}>
            <SelectTrigger className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-ops-surface border-ops-border/60 rounded-none">
              <SelectItem value={MissionStatus.active} className="font-mono text-xs text-green-ops">ACTIVE</SelectItem>
              <SelectItem value={MissionStatus.compromised} className="font-mono text-xs text-red-ops">COMPROMISED</SelectItem>
              <SelectItem value={MissionStatus.completed} className="font-mono text-xs text-blue-400">COMPLETED</SelectItem>
              <SelectItem value={MissionStatus.aborted} className="font-mono text-xs text-ops-muted">ABORTED</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">THREAT LEVEL</Label>
          <Select value={threatLevel} onValueChange={(v) => setThreatLevel(v as ThreatLevel)}>
            <SelectTrigger className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-ops-surface border-ops-border/60 rounded-none">
              <SelectItem value={ThreatLevel.low} className="font-mono text-xs text-amber-ops">LOW</SelectItem>
              <SelectItem value={ThreatLevel.elevated} className="font-mono text-xs text-orange-400">ELEVATED</SelectItem>
              <SelectItem value={ThreatLevel.critical} className="font-mono text-xs text-red-ops">CRITICAL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Operatives */}
      <div className="space-y-2">
        <Label className="text-amber-ops text-xs font-mono tracking-widest">ASSIGNED OPERATIVES</Label>
        <div className="flex gap-2">
          <Input
            value={operativeInput}
            onChange={(e) => setOperativeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOperative())}
            placeholder="Operative callsign"
            className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none focus:border-amber-ops/70"
          />
          <Button type="button" onClick={addOperative} variant="outline" size="icon"
            className="border-amber-ops/40 text-amber-ops hover:bg-amber-ops/10 rounded-none flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {operatives.map((op) => (
            <span key={op} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-ops/10 border border-amber-ops/30 text-amber-ops text-xs font-mono">
              {op}
              <button type="button" onClick={() => setOperatives(operatives.filter(o => o !== op))}>
                <X className="w-3 h-3 hover:text-red-ops" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Objectives */}
      <div className="space-y-2">
        <Label className="text-amber-ops text-xs font-mono tracking-widest">OBJECTIVES</Label>
        <div className="flex gap-2">
          <Input
            value={objectiveInput}
            onChange={(e) => setObjectiveInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
            placeholder="Add mission objective"
            className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none focus:border-amber-ops/70"
          />
          <Button type="button" onClick={addObjective} variant="outline" size="icon"
            className="border-amber-ops/40 text-amber-ops hover:bg-amber-ops/10 rounded-none flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-1">
          {objectives.map((obj, i) => (
            <div key={i} className="flex items-center gap-2 bg-ops-bg/50 border border-ops-border/40 px-2 py-1">
              <span className="text-amber-ops text-xs font-mono">{String(i + 1).padStart(2, '0')}.</span>
              <span className="text-foreground text-xs font-mono flex-1">{obj}</span>
              <button type="button" onClick={() => setObjectives(objectives.filter((_, idx) => idx !== i))}>
                <Trash2 className="w-3 h-3 text-ops-muted hover:text-red-ops" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-red-ops text-xs font-mono border border-red-ops/30 bg-red-ops/10 p-2">
          ERROR: {(error as Error)?.message || 'Operation failed'}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={isPending || !codename.trim()}
          className="flex-1 bg-amber-ops/20 border border-amber-ops/50 text-amber-ops hover:bg-amber-ops/30 font-mono font-bold tracking-widest rounded-none"
        >
          {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> PROCESSING...</> : isEditing ? 'UPDATE MISSION' : 'CREATE MISSION'}
        </Button>
        <Button type="button" onClick={onClose} variant="outline"
          className="border-ops-border/60 text-ops-muted hover:text-foreground rounded-none">
          CANCEL
        </Button>
      </div>
    </form>
  );
}
