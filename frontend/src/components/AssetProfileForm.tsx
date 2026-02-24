import React, { useState } from 'react';
import { AssetProfile, ClearanceLevel, SpecializedSkill, Variant_active_terminated_inactive } from '../backend';
import { useCreateAssetProfile, useUpdateAssetProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

const SPECIALIZATIONS: { value: SpecializedSkill; label: string }[] = [
  { value: { __kind__: 'cyber', cyber: null }, label: 'CYBER' },
  { value: { __kind__: 'counterTerror', counterTerror: null }, label: 'COUNTER-TERROR' },
  { value: { __kind__: 'counterIntelligence', counterIntelligence: null }, label: 'COUNTER-INTEL' },
  { value: { __kind__: 'counterEspionage', counterEspionage: null }, label: 'COUNTER-ESPIONAGE' },
  { value: { __kind__: 'counterInsurgency', counterInsurgency: null }, label: 'COUNTER-INSURGENCY' },
  { value: { __kind__: 'drugIntelligence', drugIntelligence: null }, label: 'DRUG INTEL' },
  { value: { __kind__: 'militaryIntelligence', militaryIntelligence: null }, label: 'MILITARY INTEL' },
  { value: { __kind__: 'humanIntelligence', humanIntelligence: null }, label: 'HUMAN INTEL' },
];

interface AssetProfileFormProps {
  asset?: AssetProfile;
  onClose: () => void;
}

export default function AssetProfileForm({ asset, onClose }: AssetProfileFormProps) {
  const [codename, setCodename] = useState(asset?.codename || '');
  const [clearanceLevel, setClearanceLevel] = useState<ClearanceLevel>(asset?.clearanceLevel || ClearanceLevel.confidential);
  const [status, setStatus] = useState<Variant_active_terminated_inactive>(
    asset?.status || Variant_active_terminated_inactive.active
  );
  const [bio, setBio] = useState(asset?.bio || '');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(
    asset?.specialization.map(s => s.__kind__) || []
  );

  const createAsset = useCreateAssetProfile();
  const updateAsset = useUpdateAssetProfile();
  const isEditing = !!asset;
  const isPending = createAsset.isPending || updateAsset.isPending;

  const toggleSpec = (kind: string) => {
    setSelectedSpecs(prev =>
      prev.includes(kind) ? prev.filter(s => s !== kind) : [...prev, kind]
    );
  };

  const buildSpecializations = (): SpecializedSkill[] => {
    return SPECIALIZATIONS
      .filter(s => selectedSpecs.includes(s.value.__kind__))
      .map(s => s.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codename.trim()) return;

    const params = {
      codename: codename.trim().toUpperCase(),
      clearanceLevel,
      specialization: buildSpecializations(),
      status,
      bio: bio.trim(),
    };

    try {
      if (isEditing) {
        await updateAsset.mutateAsync({ ...params, codename: asset.codename });
      } else {
        await createAsset.mutateAsync(params);
      }
      onClose();
    } catch (err) {
      // error shown below
    }
  };

  const error = createAsset.error || updateAsset.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">OPERATIVE CODENAME *</Label>
          <Input
            value={codename}
            onChange={(e) => setCodename(e.target.value)}
            placeholder="e.g. PHANTOM"
            disabled={isEditing}
            className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none focus:border-amber-ops/70 uppercase"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">CLEARANCE LEVEL</Label>
          <Select value={clearanceLevel} onValueChange={(v) => setClearanceLevel(v as ClearanceLevel)}>
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

        <div className="space-y-1">
          <Label className="text-amber-ops text-xs font-mono tracking-widest">STATUS</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as Variant_active_terminated_inactive)}>
            <SelectTrigger className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-ops-surface border-ops-border/60 rounded-none">
              <SelectItem value={Variant_active_terminated_inactive.active} className="font-mono text-xs text-green-ops">ACTIVE</SelectItem>
              <SelectItem value={Variant_active_terminated_inactive.inactive} className="font-mono text-xs text-ops-muted">INACTIVE</SelectItem>
              <SelectItem value={Variant_active_terminated_inactive.terminated} className="font-mono text-xs text-red-ops">TERMINATED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-amber-ops text-xs font-mono tracking-widest">SPECIALIZATIONS</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SPECIALIZATIONS.map(({ value, label }) => (
            <label key={value.__kind__} className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                checked={selectedSpecs.includes(value.__kind__)}
                onCheckedChange={() => toggleSpec(value.__kind__)}
                className="border-ops-border/60 data-[state=checked]:bg-amber-ops data-[state=checked]:border-amber-ops rounded-none"
              />
              <span className="text-xs font-mono text-ops-muted group-hover:text-foreground transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-amber-ops text-xs font-mono tracking-widest">BIO / NOTES</Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Operative background, skills, notes..."
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
          disabled={isPending || !codename.trim()}
          className="flex-1 bg-amber-ops/20 border border-amber-ops/50 text-amber-ops hover:bg-amber-ops/30 font-mono font-bold tracking-widest rounded-none"
        >
          {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> PROCESSING...</> : isEditing ? 'UPDATE PROFILE' : 'CREATE PROFILE'}
        </Button>
        <Button type="button" onClick={onClose} variant="outline"
          className="border-ops-border/60 text-ops-muted hover:text-foreground rounded-none">
          CANCEL
        </Button>
      </div>
    </form>
  );
}
