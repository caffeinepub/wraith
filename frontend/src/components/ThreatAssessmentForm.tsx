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
import { Loader2 } from 'lucide-react';
import type { ThreatAssessment, ThreatCategory } from '../backend';
import { useCreateThreatAssessment, useUpdateThreatAssessment } from '../hooks/useQueries';

interface ThreatAssessmentFormProps {
  existingAssessment?: ThreatAssessment;
  onSuccess: () => void;
  onCancel: () => void;
}

type ThreatCategoryKey =
  | 'cyber'
  | 'counterTerror'
  | 'counterIntelligence'
  | 'counterEspionage'
  | 'counterInsurgency'
  | 'drugSmuggling'
  | 'humanSmuggling'
  | 'armsSmuggling'
  | 'other';

function buildThreatCategory(key: ThreatCategoryKey, otherText: string): ThreatCategory {
  switch (key) {
    case 'cyber':
      return { __kind__: 'cyber', cyber: null };
    case 'counterTerror':
      return { __kind__: 'counterTerror', counterTerror: null };
    case 'counterIntelligence':
      return { __kind__: 'counterIntelligence', counterIntelligence: null };
    case 'counterEspionage':
      return { __kind__: 'counterEspionage', counterEspionage: null };
    case 'counterInsurgency':
      return { __kind__: 'counterInsurgency', counterInsurgency: null };
    case 'drugSmuggling':
      return { __kind__: 'drugSmuggling', drugSmuggling: null };
    case 'humanSmuggling':
      return { __kind__: 'humanSmuggling', humanSmuggling: null };
    case 'armsSmuggling':
      return { __kind__: 'armsSmuggling', armsSmuggling: null };
    case 'other':
      return { __kind__: 'other', other: otherText };
  }
}

function getThreatCategoryKey(category: ThreatCategory): ThreatCategoryKey {
  return category.__kind__ as ThreatCategoryKey;
}

export default function ThreatAssessmentForm({
  existingAssessment,
  onSuccess,
  onCancel,
}: ThreatAssessmentFormProps) {
  const [subjectName, setSubjectName] = useState('');
  const [categoryKey, setCategoryKey] = useState<ThreatCategoryKey>('cyber');
  const [otherText, setOtherText] = useState('');
  const [riskScore, setRiskScore] = useState('50');
  const [summary, setSummary] = useState('');
  const [linkedMissionsStr, setLinkedMissionsStr] = useState('');

  const createMutation = useCreateThreatAssessment();
  const updateMutation = useUpdateThreatAssessment();

  const isEditing = !!existingAssessment;
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (existingAssessment) {
      setSubjectName(existingAssessment.subjectName);
      setCategoryKey(getThreatCategoryKey(existingAssessment.threatCategory));
      if (existingAssessment.threatCategory.__kind__ === 'other') {
        setOtherText(existingAssessment.threatCategory.other);
      }
      setRiskScore(existingAssessment.riskScore.toString());
      setSummary(existingAssessment.summary);
      setLinkedMissionsStr(existingAssessment.linkedMissions.join(', '));
    }
  }, [existingAssessment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const threatCategory = buildThreatCategory(categoryKey, otherText);
    const riskScoreBigInt: bigint = BigInt(Math.max(0, Math.min(100, parseInt(riskScore, 10) || 0)));
    const linkedMissions = linkedMissionsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const params = {
      subjectName,
      threatCategory,
      riskScore: riskScoreBigInt,
      summary,
      linkedMissions,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync(params);
      } else {
        await createMutation.mutateAsync(params);
      }
      onSuccess();
    } catch (err) {
      console.error('Threat assessment form error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-ops-muted text-xs uppercase tracking-widest">Subject Name</Label>
        <Input
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          disabled={isEditing || isPending}
          required
          className="bg-ops-surface border-ops-border text-ops-text"
          placeholder="Subject codename or identifier"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-ops-muted text-xs uppercase tracking-widest">
            Threat Category
          </Label>
          <Select
            value={categoryKey}
            onValueChange={(v) => setCategoryKey(v as ThreatCategoryKey)}
            disabled={isPending}
          >
            <SelectTrigger className="bg-ops-surface border-ops-border text-ops-text">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-ops-surface border-ops-border">
              <SelectItem value="cyber">Cyber</SelectItem>
              <SelectItem value="counterTerror">Counter-Terror</SelectItem>
              <SelectItem value="counterIntelligence">Counter-Intelligence</SelectItem>
              <SelectItem value="counterEspionage">Counter-Espionage</SelectItem>
              <SelectItem value="counterInsurgency">Counter-Insurgency</SelectItem>
              <SelectItem value="drugSmuggling">Drug Smuggling</SelectItem>
              <SelectItem value="humanSmuggling">Human Smuggling</SelectItem>
              <SelectItem value="armsSmuggling">Arms Smuggling</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-ops-muted text-xs uppercase tracking-widest">
            Risk Score (0–100)
          </Label>
          <Input
            type="number"
            min="0"
            max="100"
            value={riskScore}
            onChange={(e) => setRiskScore(e.target.value)}
            disabled={isPending}
            required
            className="bg-ops-surface border-ops-border text-ops-text"
          />
        </div>
      </div>

      {categoryKey === 'other' && (
        <div className="space-y-2">
          <Label className="text-ops-muted text-xs uppercase tracking-widest">
            Specify Category
          </Label>
          <Input
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            disabled={isPending}
            required
            className="bg-ops-surface border-ops-border text-ops-text"
            placeholder="Describe the threat category"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-ops-muted text-xs uppercase tracking-widest">Summary</Label>
        <Textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          disabled={isPending}
          required
          className="bg-ops-surface border-ops-border text-ops-text"
          placeholder="Threat assessment summary..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-ops-muted text-xs uppercase tracking-widest">
          Linked Missions (comma-separated codenames)
        </Label>
        <Input
          value={linkedMissionsStr}
          onChange={(e) => setLinkedMissionsStr(e.target.value)}
          disabled={isPending}
          className="bg-ops-surface border-ops-border text-ops-text"
          placeholder="NIGHTFALL, IRONCLAD, ..."
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
            'Update Assessment'
          ) : (
            'Create Assessment'
          )}
        </Button>
      </div>
    </form>
  );
}
