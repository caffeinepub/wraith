import React, { useState } from 'react';
import { useActor } from '../hooks/useActor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldAlert, Lock } from 'lucide-react';
import AdminPanelContent from '../components/AdminPanelContent';

export default function AdminPanel() {
  const { actor } = useActor();
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    setIsVerifying(true);
    setAccessDenied(false);
    try {
      const result = await actor.verifyAdminPassword(password);
      if (result) {
        setAccessGranted(true);
      } else {
        setAccessDenied(true);
        setPassword('');
      }
    } catch (err) {
      console.error('Admin verify error:', err);
      setAccessDenied(true);
      setPassword('');
    } finally {
      setIsVerifying(false);
    }
  };

  if (accessGranted) {
    return (
      <main className="min-h-screen bg-ops-bg px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-3 border-b border-ops-border pb-4">
            <ShieldAlert className="w-6 h-6 text-ops-danger" />
            <h1 className="text-ops-accent font-mono text-xl uppercase tracking-widest">
              WRAITH Admin Panel
            </h1>
            <span className="ml-auto text-xs text-ops-muted font-mono">ACCESS GRANTED</span>
          </div>
          <AdminPanelContent />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ops-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-ops-surface border border-ops-border flex items-center justify-center">
              <Lock className="w-8 h-8 text-ops-accent" />
            </div>
          </div>
          <h1 className="text-ops-accent font-mono text-2xl uppercase tracking-widest">
            WRAITH
          </h1>
          <p className="text-ops-muted text-xs font-mono uppercase tracking-widest">
            Restricted Access — Admin Terminal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="ops-card p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-ops-muted text-xs uppercase tracking-widest">
              Admin Passphrase
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isVerifying}
              required
              className="bg-ops-surface border-ops-border text-ops-text font-mono"
              placeholder="Enter passphrase..."
              autoComplete="off"
            />
          </div>

          {accessDenied && (
            <div className="text-ops-danger text-xs font-mono text-center py-1 border border-ops-danger/30 rounded bg-ops-danger/5">
              ACCESS DENIED — INVALID PASSPHRASE
            </div>
          )}

          <Button
            type="submit"
            disabled={isVerifying || !password.trim()}
            className="w-full bg-ops-accent text-ops-bg hover:bg-ops-accent/90 font-mono uppercase tracking-widest"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Authenticate'
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
