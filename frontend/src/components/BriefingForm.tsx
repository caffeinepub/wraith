import React, { useState } from 'react';
import { MissionBriefing, BriefingObjective, HVTProfile, ClearanceLevel, ThreatLevel, Variant_low_high_medium } from '../backend';
import { useCreateMissionBriefing, useUpdateMissionBriefing } from '../hooks/useQueries';
import { dateToNanoseconds, nanosecondsToDate } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface BriefingFormProps {
  briefing?: MissionBriefing;
  onClose: () => void;
}

export default function BriefingForm({ briefing, onClose }: BriefingFormProps) {
  const [operationCodename, setOperationCodename] = useState(briefing?.operationCodename || '');
  const [missionDate, setMissionDate] = useState<string>(
    briefing ? nanosecondsToDate(briefing.missionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [leadOfficer, setLeadOfficer] = useState(briefing?.leadOfficer || '');
  const [classificationLevel, setClassificationLevel] = useState<ClearanceLevel>(
    briefing?.classificationLevel || ClearanceLevel.topSecret
  );
  const [exfilRoutes, setExfilRoutes] = useState(briefing?.exfilRoutes || '');
  const [rulesOfEngagement, setRulesOfEngagement] = useState(briefing?.rulesOfEngagement || '');

  const [objectives, setObjectives] = useState<BriefingObjective[]>(
    briefing?.objectives || []
  );
  const [newObjText, setNewObjText] = useState('');
  const [newObjPriority, setNewObjPriority] = useState<Variant_low_high_medium>(Variant_low_high_medium.medium);

  const [hvtProfiles, setHvtProfiles] = useState<HVTProfile[]>(
    briefing?.hvtProfiles || []
  );
  const [newHvtName, setNewHvtName] = useState('');
  const [newHvtDesc, setNewHvtDesc] = useState('');
  const [newHvtTier, setNewHvtTier] = useState<ThreatLevel>(ThreatLevel.elevated);

  const createBriefing = useCreateMissionBriefing();
  const updateBriefing = useUpdateMissionBriefing();
  const isEditing = !!briefing;
  const isPending = createBriefing.isPending || updateBriefing.isPending;

  const addObjective = () => {
    if (!newObjText.trim()) return;
    setObjectives([...objectives, { text: newObjText.trim(), priority: newObjPriority }]);
    setNewObjText('');
  };

  const addHvt = () => {
    if (!newHvtName.trim()) return;
    setHvtProfiles([...hvtProfiles, { name: newHvtName.trim(), description: newHvtDesc.trim(), threatTier: newHvtTier }]);
    setNewHvtName('');
    setNewHvtDesc('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operationCodename.trim() || !leadOfficer.trim()) return;

    const params = {
      operationCodename: operationCodename.trim().toUpperCase(),
      missionDate: dateToNanoseconds(new Date(missionDate)),
      leadOfficer: leadOfficer.trim(),
      objectives,
      hvtProfiles,
      exfilRoutes: exfilRoutes.trim(),
      rulesOfEngagement: rulesOfEngagement.trim(),
      classificationLevel,
    };

    try {
      if (isEditing) {
        await updateBriefing.mutateAsync({ ...params, operationCodename: briefing.operationCodename });
      } else {
        await createBriefing.mutateAsync(params);
      }
      onClose();
    } catch (err) {
      // error shown below
    }
  };

  const error = createBriefing.error || updateBriefing.error;

  const priorityColor: Record<Variant_low_high_medium, string> = {
    [Variant_low_high_medium.high]: 'text-red-ops',
    [Variant_low_high_medium.medium]: 'text-orange-400',
    [Variant_low_high_medium.low]: 'text-amber-ops',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">OPERATION CODENAME *</Label>
          <Input
            value={operationCodename}
            onChange={(e) => setOperationCodename(e.target.value)}
            placeholder="e.g. IRON GHOST"
            disabled={isEditing}
            className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none focus:border-amber-ops/70 uppercase"
            required
          />
        </div>
        <div className="space-y-1">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">MISSION DATE *</Label>
          <Input
            type="date"
            value={missionDate}
            onChange={(e) => setMissionDate(e.target.value)}
            className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none focus:border-amber-ops/70"
            required
          />
        </div>
        <div className="space-y-1">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">LEAD OFFICER *</Label>
          <Input
            value={leadOfficer}
            onChange={(e) => setLeadOfficer(e.target.value)}
            placeholder="Officer callsign"
            className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none focus:border-amber-ops/70"
            required
          />
        </div>
        <div className="space-y-1">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">CLASSIFICATION</Label>
          <Select value={classificationLevel} onValueChange={(v) => setClassificationLevel(v as ClearanceLevel)}>
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
      </div>

      {/* Objectives */}
      <div className="space-y-2">
        <Label className="text-amber-ops text-xs font-mono tracking-widest">OBJECTIVES</Label>
        <div className="flex gap-2">
          <Input
            value={newObjText}
            onChange={(e) => setNewObjText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
            placeholder="Add objective"
            className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none focus:border-amber-ops/70 flex-1"
          />
          <Select value={newObjPriority} onValueChange={(v) => setNewObjPriority(v as Variant_low_high_medium)}>
            <SelectTrigger className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-xs rounded-none w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-ops-surface border-ops-border/60 rounded-none">
              <SelectItem value={Variant_low_high_medium.high} className="font-mono text-xs text-red-ops">HIGH</SelectItem>
              <SelectItem value={Variant_low_high_medium.medium} className="font-mono text-xs text-orange-400">MEDIUM</SelectItem>
              <SelectItem value={Variant_low_high_medium.low} className="font-mono text-xs text-amber-ops">LOW</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" onClick={addObjective} variant="outline" size="icon"
            className="border-amber-ops/40 text-amber-ops hover:bg-amber-ops/10 rounded-none flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-1">
          {objectives.map((obj, i) => (
            <div key={i} className="flex items-center gap-2 bg-ops-bg/50 border border-ops-border/40 px-2 py-1.5">
              <span className="text-amber-ops text-xs font-mono">{String(i + 1).padStart(2, '0')}.</span>
              <span className="text-foreground text-xs font-mono flex-1">{obj.text}</span>
              <span className={`text-xs font-mono font-bold ${priorityColor[obj.priority]}`}>{obj.priority.toUpperCase()}</span>
              <button type="button" onClick={() => setObjectives(objectives.filter((_, idx) => idx !== i))}>
                <Trash2 className="w-3 h-3 text-ops-muted hover:text-red-ops" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* HVT Profiles */}
      <div className="space-y-2">
        <Label className="text-amber-ops text-xs font-mono tracking-widest">HIGH-VALUE TARGETS</Label>
        <div className="space-y-2 bg-ops-bg/30 border border-ops-border/30 p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              value={newHvtName}
              onChange={(e) => setNewHvtName(e.target.value)}
              placeholder="HVT name"
              className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-xs rounded-none focus:border-amber-ops/70"
            />
            <Input
              value={newHvtDesc}
              onChange={(e) => setNewHvtDesc(e.target.value)}
              placeholder="Description"
              className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-xs rounded-none focus:border-amber-ops/70"
            />
            <div className="flex gap-2">
              <Select value={newHvtTier} onValueChange={(v) => setNewHvtTier(v as ThreatLevel)}>
                <SelectTrigger className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-xs rounded-none flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-ops-surface border-ops-border/60 rounded-none">
                  <SelectItem value={ThreatLevel.low} className="font-mono text-xs text-amber-ops">LOW</SelectItem>
                  <SelectItem value={ThreatLevel.elevated} className="font-mono text-xs text-orange-400">ELEVATED</SelectItem>
                  <SelectItem value={ThreatLevel.critical} className="font-mono text-xs text-red-ops">CRITICAL</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={addHvt} variant="outline" size="icon"
                className="border-red-ops/40 text-red-ops hover:bg-red-ops/10 rounded-none flex-shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            {hvtProfiles.map((hvt, i) => (
              <div key={i} className="flex items-center gap-2 bg-red-ops/5 border border-red-ops/20 px-2 py-1.5">
                <span className="text-red-ops text-xs font-mono font-bold flex-shrink-0">HVT-{String(i + 1).padStart(2, '0')}</span>
                <span className="text-foreground text-xs font-mono font-bold">{hvt.name}</span>
                {hvt.description && <span className="text-ops-muted text-xs font-mono flex-1 truncate">— {hvt.description}</span>}
                <span className="text-xs font-mono text-red-ops flex-shrink-0">[{hvt.threatTier.toUpperCase()}]</span>
                <button type="button" onClick={() => setHvtProfiles(hvtProfiles.filter((_, idx) => idx !== i))}>
                  <Trash2 className="w-3 h-3 text-ops-muted hover:text-red-ops" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exfil Routes */}
      <div className="space-y-1">
        <Label className="text-amber-ops text-xs font-mono tracking-widest">EXFILTRATION ROUTES</Label>
        <Textarea
          value={exfilRoutes}
          onChange={(e) => setExfilRoutes(e.target.value)}
          placeholder="Describe exfiltration routes and contingencies..."
          rows={3}
          className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-xs rounded-none focus:border-amber-ops/70 resize-none"
        />
      </div>

      {/* Rules of Engagement */}
      <div className="space-y-1">
        <Label className="text-amber-ops text-xs font-mono tracking-widest">RULES OF ENGAGEMENT</Label>
        <Textarea
          value={rulesOfEngagement}
          onChange={(e) => setRulesOfEngagement(e.target.value)}
          placeholder="Define rules of engagement for this operation..."
          rows={3}
          className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-xs rounded-none focus:border-amber-ops/70 resize-none"
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
          disabled={isPending || !operationCodename.trim() || !leadOfficer.trim()}
          className="flex-1 bg-amber-ops/20 border border-amber-ops/50 text-amber-ops hover:bg-amber-ops/30 font-mono font-bold tracking-widest rounded-none"
        >
          {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> PROCESSING...</> : isEditing ? 'UPDATE BRIEFING' : 'CREATE BRIEFING'}
        </Button>
        <Button type="button" onClick={onClose} variant="outline"
          className="border-ops-border/60 text-ops-muted hover:text-foreground rounded-none">
          CANCEL
        </Button>
      </div>
    </form>
  );
}
