import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import type { Mission } from '../backend';
import { MissionStatus, ThreatLevel, MissionType } from '../backend';
import { useCreateMission, useUpdateMission } from '../hooks/useQueries';

interface MissionFormProps {
  existingMission?: Mission;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MissionForm({ existingMission, onSuccess, onCancel }: MissionFormProps) {
  const [codename, setCodename] = useState('');
  const [status, setStatus] = useState<MissionStatus>(MissionStatus.active);
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>(ThreatLevel.low);
  const [missionType, setMissionType] = useState<MissionType>(MissionType.recon);
  const [assignedOperatives, setAssignedOperatives] = useState<string[]>(['']);
  const [objectives, setObjectives] = useState<string[]>(['']);

  const createMutation = useCreateMission();
  const updateMutation = useUpdateMission();

  const isEditing = !!existingMission;
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (existingMission) {
      setCodename(existingMission.codename);
      setStatus(existingMission.status as MissionStatus);
      setThreatLevel(existingMission.threatLevel as ThreatLevel);
      setMissionType(existingMission.missionType as MissionType);
      setAssignedOperatives(
        existingMission.assignedOperatives.length > 0
          ? [...existingMission.assignedOperatives]
          : [''],
      );
      setObjectives(
        existingMission.objectives.length > 0 ? [...existingMission.objectives] : [''],
      );
    }
  }, [existingMission]);

  const handleAddOperative = () => setAssignedOperatives([...assignedOperatives, '']);
  const handleRemoveOperative = (i: number) =>
    setAssignedOperatives(assignedOperatives.filter((_, idx) => idx !== i));
  const handleOperativeChange = (i: number, val: string) => {
    const updated = [...assignedOperatives];
    updated[i] = val;
    setAssignedOperatives(updated);
  };

  const handleAddObjective = () => setObjectives([...objectives, '']);
  const handleRemoveObjective = (i: number) =>
    setObjectives(objectives.filter((_, idx) => idx !== i));
  const handleObjectiveChange = (i: number, val: string) => {
    const updated = [...objectives];
    updated[i] = val;
    setObjectives(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const params = {
      codename,
      status,
      threatLevel,
      assignedOperatives: assignedOperatives.filter(Boolean),
      missionType,
      objectives: objectives.filter(Boolean),
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync(params);
      } else {
        await createMutation.mutateAsync(params);
      }
      onSuccess();
    } catch (err) {
      console.error('Mission form error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-ops-muted text-xs uppercase tracking-widest">Codename</Label>
          <Input
            value={codename}
            onChange={(e) => setCodename(e.target.value)}
            disabled={isEditing || isPending}
            required
            className="bg-ops-surface border-ops-border text-ops-text"
            placeholder="OPERATION NIGHTFALL"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-ops-muted text-xs uppercase tracking-widest">Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as MissionStatus)}
            disabled={isPending}
          >
            <SelectTrigger className="bg-ops-surface border-ops-border text-ops-text">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-ops-surface border-ops-border">
              <SelectItem value={MissionStatus.active}>Active</SelectItem>
              <SelectItem value={MissionStatus.compromised}>Compromised</SelectItem>
              <SelectItem value={MissionStatus.completed}>Completed</SelectItem>
              <SelectItem value={MissionStatus.aborted}>Aborted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-ops-muted text-xs uppercase tracking-widest">Threat Level</Label>
          <Select
            value={threatLevel}
            onValueChange={(v) => setThreatLevel(v as ThreatLevel)}
            disabled={isPending}
          >
            <SelectTrigger className="bg-ops-surface border-ops-border text-ops-text">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-ops-surface border-ops-border">
              <SelectItem value={ThreatLevel.low}>Low</SelectItem>
              <SelectItem value={ThreatLevel.elevated}>Elevated</SelectItem>
              <SelectItem value={ThreatLevel.critical}>Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-ops-muted text-xs uppercase tracking-widest">Mission Type</Label>
          <Select
            value={missionType}
            onValueChange={(v) => setMissionType(v as MissionType)}
            disabled={isPending}
          >
            <SelectTrigger className="bg-ops-surface border-ops-border text-ops-text">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-ops-surface border-ops-border">
              <SelectItem value={MissionType.recon}>Recon</SelectItem>
              <SelectItem value={MissionType.cyber}>Cyber</SelectItem>
              <SelectItem value={MissionType.counterTerror}>Counter-Terror</SelectItem>
              <SelectItem value={MissionType.inPersonOp}>In-Person Op</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assigned Operatives */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-ops-muted text-xs uppercase tracking-widest">
            Assigned Operatives
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOperative}
            disabled={isPending}
            className="border-ops-accent text-ops-accent hover:bg-ops-accent/10 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        {assignedOperatives.map((op, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={op}
              onChange={(e) => handleOperativeChange(i, e.target.value)}
              disabled={isPending}
              placeholder={`Operative ${i + 1} codename`}
              className="bg-ops-surface border-ops-border text-ops-text flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveOperative(i)}
              disabled={isPending || assignedOperatives.length <= 1}
              className="text-ops-danger hover:bg-ops-danger/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Objectives */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-ops-muted text-xs uppercase tracking-widest">Objectives</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddObjective}
            disabled={isPending}
            className="border-ops-accent text-ops-accent hover:bg-ops-accent/10 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        {objectives.map((obj, i) => (
          <div key={i} className="flex gap-2">
            <Textarea
              value={obj}
              onChange={(e) => handleObjectiveChange(i, e.target.value)}
              disabled={isPending}
              placeholder={`Objective ${i + 1}`}
              className="bg-ops-surface border-ops-border text-ops-text flex-1"
              rows={2}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveObjective(i)}
              disabled={isPending || objectives.length <= 1}
              className="text-ops-danger hover:bg-ops-danger/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="border-ops-border text-ops-muted hover:bg-ops-surface"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-ops-accent text-ops-bg hover:bg-ops-accent/90"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : isEditing ? (
            'Update Mission'
          ) : (
            'Create Mission'
          )}
        </Button>
      </div>
    </form>
  );
}
