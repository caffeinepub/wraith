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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import type { AssetProfile, SpecializedSkill } from '../backend';
import { ClearanceLevel, Variant_active_terminated_inactive } from '../backend';
import { useCreateAssetProfile, useUpdateAssetProfile } from '../hooks/useQueries';

interface AssetProfileFormProps {
  existingAsset?: AssetProfile;
  onSuccess: () => void;
  onCancel: () => void;
}

type SkillKey =
  | 'cyber'
  | 'counterTerror'
  | 'counterIntelligence'
  | 'counterEspionage'
  | 'counterInsurgency'
  | 'drugIntelligence'
  | 'militaryIntelligence'
  | 'humanIntelligence';

const SKILL_OPTIONS: { key: SkillKey; label: string }[] = [
  { key: 'cyber', label: 'Cyber' },
  { key: 'counterTerror', label: 'Counter-Terror' },
  { key: 'counterIntelligence', label: 'Counter-Intelligence' },
  { key: 'counterEspionage', label: 'Counter-Espionage' },
  { key: 'counterInsurgency', label: 'Counter-Insurgency' },
  { key: 'drugIntelligence', label: 'Drug Intelligence' },
  { key: 'militaryIntelligence', label: 'Military Intelligence' },
  { key: 'humanIntelligence', label: 'Human Intelligence' },
];

function buildSkill(key: SkillKey): SpecializedSkill {
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
    case 'drugIntelligence':
      return { __kind__: 'drugIntelligence', drugIntelligence: null };
    case 'militaryIntelligence':
      return { __kind__: 'militaryIntelligence', militaryIntelligence: null };
    case 'humanIntelligence':
      return { __kind__: 'humanIntelligence', humanIntelligence: null };
  }
}

function getSkillKey(skill: SpecializedSkill): SkillKey | null {
  if (skill.__kind__ === 'other') return null;
  return skill.__kind__ as SkillKey;
}

export default function AssetProfileForm({
  existingAsset,
  onSuccess,
  onCancel,
}: AssetProfileFormProps) {
  const [codename, setCodename] = useState('');
  const [clearanceLevel, setClearanceLevel] = useState<ClearanceLevel>(ClearanceLevel.confidential);
  const [selectedSkills, setSelectedSkills] = useState<Set<SkillKey>>(new Set());
  const [status, setStatus] = useState<Variant_active_terminated_inactive>(
    Variant_active_terminated_inactive.active,
  );
  const [bio, setBio] = useState('');

  const createMutation = useCreateAssetProfile();
  const updateMutation = useUpdateAssetProfile();

  const isEditing = !!existingAsset;
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (existingAsset) {
      setCodename(existingAsset.codename);
      setClearanceLevel(existingAsset.clearanceLevel as ClearanceLevel);
      const keys = new Set<SkillKey>();
      existingAsset.specialization.forEach((s) => {
        const k = getSkillKey(s);
        if (k) keys.add(k);
      });
      setSelectedSkills(keys);
      setStatus(existingAsset.status as Variant_active_terminated_inactive);
      setBio(existingAsset.bio);
    }
  }, [existingAsset]);

  const toggleSkill = (key: SkillKey) => {
    const updated = new Set(selectedSkills);
    if (updated.has(key)) {
      updated.delete(key);
    } else {
      updated.add(key);
    }
    setSelectedSkills(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const specialization: SpecializedSkill[] = Array.from(selectedSkills).map(buildSkill);

    const params = {
      codename,
      clearanceLevel,
      specialization,
      status,
      bio,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync(params);
      } else {
        await createMutation.mutateAsync(params);
      }
      onSuccess();
    } catch (err) {
      console.error('Asset profile form error:', err);
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
            placeholder="Asset codename"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-ops-muted text-xs uppercase tracking-widest">
            Clearance Level
          </Label>
          <Select
            value={clearanceLevel}
            onValueChange={(v) => setClearanceLevel(v as ClearanceLevel)}
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

        <div className="space-y-2">
          <Label className="text-ops-muted text-xs uppercase tracking-widest">Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as Variant_active_terminated_inactive)}
            disabled={isPending}
          >
            <SelectTrigger className="bg-ops-surface border-ops-border text-ops-text">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-ops-surface border-ops-border">
              <SelectItem value={Variant_active_terminated_inactive.active}>Active</SelectItem>
              <SelectItem value={Variant_active_terminated_inactive.inactive}>Inactive</SelectItem>
              <SelectItem value={Variant_active_terminated_inactive.terminated}>
                Terminated
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Specialization Skills */}
      <div className="space-y-2">
        <Label className="text-ops-muted text-xs uppercase tracking-widest">Specialization</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {SKILL_OPTIONS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={`skill-${key}`}
                checked={selectedSkills.has(key)}
                onCheckedChange={() => toggleSkill(key)}
                disabled={isPending}
                className="border-ops-border"
              />
              <Label
                htmlFor={`skill-${key}`}
                className="text-ops-text text-xs cursor-pointer"
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label className="text-ops-muted text-xs uppercase tracking-widest">Bio / Notes</Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={isPending}
          className="bg-ops-surface border-ops-border text-ops-text"
          placeholder="Asset background, capabilities, and notes..."
          rows={4}
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
            'Update Asset'
          ) : (
            'Create Asset'
          )}
        </Button>
      </div>
    </form>
  );
}
