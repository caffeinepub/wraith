import React, { useState } from 'react';
import { ThreatAssessment, ThreatCategory } from '../backend';
import { useCreateThreatAssessment, useUpdateThreatAssessment, useGetAllMissions } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

const THREAT_CATEGORIES: { value: ThreatCategory; label: string }[] = [
  { value: { __kind__: 'cyber', cyber: null }, label: 'CYBER' },
  { value: { __kind__: 'counterTerror', counterTerror: null }, label: 'COUNTER-TERROR' },
  { value: { __kind__: 'counterIntelligence', counterIntelligence: null }, label: 'COUNTER-INTEL' },
  { value: { __kind__: 'counterEspionage', counterEspionage: null }, label: 'COUNTER-ESPIONAGE' },
  { value: { __kind__: 'counterInsurgency', counterInsurgency: null }, label: 'COUNTER-INSURGENCY' },
  { value: { __kind__: 'drugSmuggling', drugSmuggling: null }, label: 'DRUG SMUGGLING' },
  { value: { __kind__: 'humanSmuggling', humanSmuggling: null }, label: 'HUMAN SMUGGLING' },
  { value: { __kind__: 'armsSmuggling', armsSmuggling: null }, label: 'ARMS SMUGGLING' },
];

interface ThreatAssessmentFormProps {
  assessment?: ThreatAssessment;
  onClose: () => void;
}

export default function ThreatAssessmentForm({ assessment, onClose }: ThreatAssessmentFormProps) {
  const [subjectName, setSubjectName] = useState(assessment?.subjectName || '');
  const [categoryKind, setCategoryKind] = useState<string>(assessment?.threatCategory.__kind__ || 'cyber');
  const [riskScore, setRiskScore] = useState<number>(Number(assessment?.riskScore || 5));
  const [summary, setSummary] = useState(assessment?.summary || '');
  const [linkedMissions, setLinkedMissions] = useState<string[]>(assessment?.linkedMissions || []);

  const { data: missions = [] } = useGetAllMissions();
  const createAssessment = useCreateThreatAssessment();
  const updateAssessment = useUpdateThreatAssessment();
  const isEditing = !!assessment;
  const isPending = createAssessment.isPending || updateAssessment.isPending;

  const buildCategory = (): ThreatCategory => {
    const found = THREAT_CATEGORIES.find(c => c.value.__kind__ === categoryKind);
    return found?.value || { __kind__: 'cyber', cyber: null };
  };

  const toggleMission = (codename: string) => {
    setLinkedMissions(prev =>
      prev.includes(codename) ? prev.filter(m => m !== codename) : [...prev, codename]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    const params = {
      subjectName: subjectName.trim(),
      threatCategory: buildCategory(),
      riskScore: BigInt(riskScore),
      summary: summary.trim(),
      linkedMissions,
    };

    try {
      if (isEditing) {
        await updateAssessment.mutateAsync({ ...params, subjectName: assessment.subjectName });
      } else {
        await createAssessment.mutateAsync(params);
      }
      onClose();
    } catch (err) {
      // error shown below
    }
  };

  const error = createAssessment.error || updateAssessment.error;

  const riskColor = riskScore <= 3 ? 'text-amber-ops' : riskScore <= 6 ? 'text-orange-400' : 'text-red-ops';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">SUBJECT NAME *</Label>
          <Input
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="Target/subject identifier"
            disabled={isEditing}
            className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none focus:border-amber-ops/70"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">THREAT CATEGORY</Label>
          <Select value={categoryKind} onValueChange={setCategoryKind}>
            <SelectTrigger className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-ops-surface border-ops-border/60 rounded-none">
              {THREAT_CATEGORIES.map(({ value, label }) => (
                <SelectItem key={value.__kind__} value={value.__kind__} className="font-mono text-xs">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-amber-ops text-xs font-mono tracking-widest">
          RISK SCORE: <span className={`${riskColor} font-bold`}>{riskScore}/10</span>
        </Label>
        <Slider
          value={[riskScore]}
          onValueChange={([v]) => setRiskScore(v)}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs font-mono text-ops-muted">
          <span>LOW RISK</span>
          <span>CRITICAL RISK</span>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-amber-ops text-xs font-mono tracking-widest">THREAT SUMMARY</Label>
        <Textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Detailed threat assessment summary..."
          rows={3}
          className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-xs rounded-none focus:border-amber-ops/70 resize-none"
        />
      </div>

      {missions.length > 0 && (
        <div className="space-y-2">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">LINKED MISSIONS</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-32 overflow-y-auto">
            {missions.map((m) => (
              <label key={m.codename} className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={linkedMissions.includes(m.codename)}
                  onCheckedChange={() => toggleMission(m.codename)}
                  className="border-ops-border/60 data-[state=checked]:bg-amber-ops data-[state=checked]:border-amber-ops rounded-none"
                />
                <span className="text-xs font-mono text-ops-muted group-hover:text-foreground transition-colors truncate">
                  {m.codename}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-ops text-xs font-mono border border-red-ops/30 bg-red-ops/10 p-2">
          ERROR: {(error as Error)?.message}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={isPending || !subjectName.trim()}
          className="flex-1 bg-amber-ops/20 border border-amber-ops/50 text-amber-ops hover:bg-amber-ops/30 font-mono font-bold tracking-widest rounded-none"
        >
          {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> PROCESSING...</> : isEditing ? 'UPDATE ASSESSMENT' : 'CREATE ASSESSMENT'}
        </Button>
        <Button type="button" onClick={onClose} variant="outline"
          className="border-ops-border/60 text-ops-muted hover:text-foreground rounded-none">
          CANCEL
        </Button>
      </div>
    </form>
  );
}
