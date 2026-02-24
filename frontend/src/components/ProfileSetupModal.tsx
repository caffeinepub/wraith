import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Shield, Loader2 } from 'lucide-react';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [callsign, setCallsign] = useState('');
  const [department, setDepartment] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !callsign.trim()) return;
    await saveProfile.mutateAsync({
      name: name.trim(),
      callsign: callsign.trim().toUpperCase(),
      department: department.trim() || 'WRAITH UNIT',
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="bg-ops-surface border border-amber-ops/30 rounded-none max-w-md p-0 overflow-hidden">
        <div className="classification-banner-top-secret text-center py-1 text-xs font-display font-bold tracking-widest">
          ⬛ CLASSIFIED // TOP SECRET ⬛
        </div>
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-amber-ops text-glow-amber" />
              <DialogTitle className="font-display text-amber-ops text-xl tracking-widest text-glow-amber">
                OPERATIVE REGISTRATION
              </DialogTitle>
            </div>
            <DialogDescription className="text-ops-muted font-mono text-xs tracking-wider">
              FIRST-TIME ACCESS DETECTED. ESTABLISH OPERATIVE IDENTITY TO PROCEED.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-amber-ops text-xs font-mono tracking-widest">FULL NAME *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter operative name"
                className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none focus:border-amber-ops/70"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-amber-ops text-xs font-mono tracking-widest">CALLSIGN *</Label>
              <Input
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                placeholder="e.g. GHOST, PHANTOM, WRAITH"
                className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none focus:border-amber-ops/70 uppercase"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-amber-ops text-xs font-mono tracking-widest">DEPARTMENT</Label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. CYBER OPS, FIELD RECON"
                className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-sm rounded-none focus:border-amber-ops/70"
              />
            </div>

            {saveProfile.isError && (
              <div className="text-red-ops text-xs font-mono border border-red-ops/30 bg-red-ops/10 p-2">
                ERROR: {(saveProfile.error as Error)?.message || 'Registration failed'}
              </div>
            )}

            <Button
              type="submit"
              disabled={saveProfile.isPending || !name.trim() || !callsign.trim()}
              className="w-full bg-amber-ops/20 border border-amber-ops/50 text-amber-ops hover:bg-amber-ops/30 hover:border-amber-ops font-mono font-bold tracking-widest rounded-none"
            >
              {saveProfile.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> REGISTERING...</>
              ) : (
                'CONFIRM IDENTITY'
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
