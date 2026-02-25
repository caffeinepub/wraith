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
import type { MissionBriefing, BriefingObjective, HVTProfile } from '../backend';
import { ClearanceLevel, ThreatLevel, Variant_low_high_medium } from '../backend';
import { useCreateMissionBriefing, useUpdateMissionBriefing } from '../hooks/useQueries';

interface BriefingFormProps {
  existingBriefing?: MissionBriefing;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ObjectiveFormData {
  text: string;
  priority: Variant_low_high_medium;
}

interface HVTFormData {
  name: string;
  description: string;
  threatTier: ThreatLevel;
}

export default function BriefingForm({ existingBriefing, onSuccess, onCancel }: BriefingFormProps) {
  const [operationCodename, setOperationCodename] = useState('');
  const [missionDateStr, setMissionDateStr] = useState('');
  const [leadOfficer, setLeadOfficer] = useState('');
  const [objectives, setObjectives] = useState<ObjectiveFormData[]>([
    { text: '', priority: Variant_low_high_medium.medium },
  ]);
  const [hvtProfiles, setHvtProfiles] = useState<HVTFormData[]>([]);
  const [exfilRoutes, setExfilRoutes] = useState('');
  const [rulesOfEngagement, setRulesOfEngagement] = useState('');
  const [classificationLevel, setClassificationLevel] = useState<ClearanceLevel>(
    ClearanceLevel.confidential,
  );

  const createMutation = useCreateMissionBriefing();
  const updateMutation = useUpdateMissionBriefing();

  const isEditing = !!existingBriefing;
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (existingBriefing) {
      setOperationCodename(existingBriefing.operationCodename);
      const dateMs = Number(existingBriefing.missionDate) / 1_000_000;
      const d = new Date(dateMs);
      setMissionDateStr(d.toISOString().split('T')[0]);
      setLeadOfficer(existingBriefing.leadOfficer);
      setObjectives(
        existingBriefing.objectives.map((o) => ({
          text: o.text,
          priority: o.priority as Variant_low_high_medium,
        })),
      );
      setHvtProfiles(
        existingBriefing.hvtProfiles.map((h) => ({
          name: h.name,
          description: h.description,
          threatTier: h.threatTier as ThreatLevel,
        })),
      );
      setExfilRoutes(existingBriefing.exfilRoutes);
      setRulesOfEngagement(existingBriefing.rulesOfEngagement);
      setClassificationLevel(existingBriefing.classificationLevel as ClearanceLevel);
    }
  }, [existingBriefing]);

  const handleAddObjective = () => {
    setObjectives([...objectives, { text: '', priority: Variant_low_high_medium.medium }]);
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const handleObjectiveChange = (
    index: number,
    field: keyof ObjectiveFormData,
    value: string,
  ) => {
    const updated = [...objectives];
    if (field === 'priority') {
      updated[index].priority = value as Variant_low_high_medium;
    } else {
      updated[index].text = value;
    }
    setObjectives(updated);
  };

  const handleAddHVT = () => {
    setHvtProfiles([...hvtProfiles, { name: '', description: '', threatTier: ThreatLevel.low }]);
  };

  const handleRemoveHVT = (index: number) => {
    setHvtProfiles(hvtProfiles.filter((_, i) => i !== index));
  };

  const handleHVTChange = (index: number, field: keyof HVTFormData, value: string) => {
    const updated = [...hvtProfiles];
    if (field === 'threatTier') {
      updated[index].threatTier = value as ThreatLevel;
    } else if (field === 'name') {
      updated[index].name = value;
    } else {
      updated[index].description = value;
    }
    setHvtProfiles(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dateObj = new Date(missionDateStr);
    const missionDate: bigint = BigInt(dateObj.getTime()) * BigInt(1_000_000);

    const builtObjectives: BriefingObjective[] = objectives
      .filter((o) => o.text.trim())
      .map((o) => ({
        text: o.text,
        priority: o.priority,
      }));

    const builtHVTProfiles: HVTProfile[] = hvtProfiles
      .filter((h) => h.name.trim())
      .map((h) => ({
        name: h.name,
        description: h.description,
        threatTier: h.threatTier,
      }));

    const params = {
      operationCodename,
      missionDate,
      leadOfficer,
      objectives: builtObjectives,
      hvtProfiles: builtHVTProfiles,
      exfilRoutes,
      rulesOfEngagement,
      classificationLevel,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync(params);
      } else {
        await createMutation.mutateAsync(params);
      }
      onSuccess();
    } catch (err) {
      console.error('Briefing form error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-ops-muted text-xs uppercase tracking-widest">
            Operation Codename
          </Label>
          <Input
            value={operationCodename}
            onChange={(e) => setOperationCodename(e.target.value)}
            disabled={isEditing || isPending}
            required
            className="bg-ops-surface border-ops-border text-ops-text"
            placeholder="OPERATION NIGHTFALL"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-ops-muted text-xs uppercase tracking-widest">Mission Date</Label>
          <Input
            type="date"
            value={missionDateStr}
            onChange={(e) => setMissionDateStr(e.target.value)}
            disabled={isPending}
            required
            className="bg-ops-surface border-ops-border text-ops-text"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-ops-muted text-xs uppercase tracking-widest">Lead Officer</Label>
          <Input
            value={leadOfficer}
            onChange={(e) => setLeadOfficer(e.target.value)}
            disabled={isPending}
            required
            className="bg-ops-surface border-ops-border text-ops-text"
            placeholder="Agent designation"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-ops-muted text-xs uppercase tracking-widest">
            Classification Level
          </Label>
          <Select
            value={classificationLevel}
            onValueChange={(v) => setClassificationLevel(v as ClearanceLevel)}
            disabled={isPending}
          >
            <SelectTrigger className="bg-ops-surface border-ops-border text-ops-text">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-ops-surface border-ops-border">
              <SelectItem value={ClearanceLevel.confidential}>CONFIDENTIAL</SelectItem>
              <SelectItem value={ClearanceLevel.secret}>SECRET</SelectItem>
              <SelectItem value={ClearanceLevel.topSecret}>TOP SECRET</SelectItem>
              <SelectItem value={ClearanceLevel.TS_SCI}>TS/SCI</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Objectives */}
      <div className="space-y-3">
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
            <Plus className="w-3 h-3 mr-1" /> Add Objective
          </Button>
        </div>
        {objectives.map((obj, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <Input
              value={obj.text}
              onChange={(e) => handleObjectiveChange(idx, 'text', e.target.value)}
              disabled={isPending}
              placeholder={`Objective ${idx + 1}`}
              className="bg-ops-surface border-ops-border text-ops-text flex-1"
            />
            <Select
              value={obj.priority}
              onValueChange={(v) => handleObjectiveChange(idx, 'priority', v)}
              disabled={isPending}
            >
              <SelectTrigger className="bg-ops-surface border-ops-border text-ops-text w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-ops-surface border-ops-border">
                <SelectItem value={Variant_low_high_medium.high}>HIGH</SelectItem>
                <SelectItem value={Variant_low_high_medium.medium}>MEDIUM</SelectItem>
                <SelectItem value={Variant_low_high_medium.low}>LOW</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveObjective(idx)}
              disabled={isPending || objectives.length <= 1}
              className="text-ops-danger hover:bg-ops-danger/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* HVT Profiles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-ops-muted text-xs uppercase tracking-widest">HVT Profiles</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddHVT}
            disabled={isPending}
            className="border-ops-accent text-ops-accent hover:bg-ops-accent/10 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" /> Add HVT
          </Button>
        </div>
        {hvtProfiles.map((hvt, idx) => (
          <div key={idx} className="border border-ops-border rounded p-3 space-y-2">
            <div className="flex gap-2 items-center">
              <Input
                value={hvt.name}
                onChange={(e) => handleHVTChange(idx, 'name', e.target.value)}
                disabled={isPending}
                placeholder="HVT Name / Alias"
                className="bg-ops-surface border-ops-border text-ops-text flex-1"
              />
              <Select
                value={hvt.threatTier}
                onValueChange={(v) => handleHVTChange(idx, 'threatTier', v)}
                disabled={isPending}
              >
                <SelectTrigger className="bg-ops-surface border-ops-border text-ops-text w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-ops-surface border-ops-border">
                  <SelectItem value={ThreatLevel.low}>LOW</SelectItem>
                  <SelectItem value={ThreatLevel.elevated}>ELEVATED</SelectItem>
                  <SelectItem value={ThreatLevel.critical}>CRITICAL</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveHVT(idx)}
                disabled={isPending}
                className="text-ops-danger hover:bg-ops-danger/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              value={hvt.description}
              onChange={(e) => handleHVTChange(idx, 'description', e.target.value)}
              disabled={isPending}
              placeholder="HVT description, known aliases, threat assessment..."
              className="bg-ops-surface border-ops-border text-ops-text text-sm"
              rows={2}
            />
          </div>
        ))}
      </div>

      {/* Exfil Routes */}
      <div className="space-y-2">
        <Label className="text-ops-muted text-xs uppercase tracking-widest">
          Exfiltration Routes
        </Label>
        <Textarea
          value={exfilRoutes}
          onChange={(e) => setExfilRoutes(e.target.value)}
          disabled={isPending}
          placeholder="Primary and secondary exfil routes..."
          className="bg-ops-surface border-ops-border text-ops-text"
          rows={3}
        />
      </div>

      {/* Rules of Engagement */}
      <div className="space-y-2">
        <Label className="text-ops-muted text-xs uppercase tracking-widest">
          Rules of Engagement
        </Label>
        <Textarea
          value={rulesOfEngagement}
          onChange={(e) => setRulesOfEngagement(e.target.value)}
          disabled={isPending}
          placeholder="ROE directives and constraints..."
          className="bg-ops-surface border-ops-border text-ops-text"
          rows={3}
        />
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
            'Update Briefing'
          ) : (
            'Create Briefing'
          )}
        </Button>
      </div>
    </form>
  );
}
