import React, { useState } from 'react';
import { Lock, ShieldOff, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import { useActor } from '../hooks/useActor';
import AdminPanelContent from '../components/AdminPanelContent';

export default function AdminPanel() {
  const { actor } = useActor();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !password.trim()) return;

    setIsVerifying(true);
    setAccessDenied(false);

    try {
      const result = await actor.verifyAdminPassword(password);
      if (result) {
        setIsAuthenticated(true);
      } else {
        setAccessDenied(true);
        setAttemptCount((c) => c + 1);
        setPassword('');
      }
    } catch {
      setAccessDenied(true);
      setAttemptCount((c) => c + 1);
      setPassword('');
    } finally {
      setIsVerifying(false);
    }
  };

  // Authenticated — render the panel
  if (isAuthenticated) {
    return (
      <div className="space-y-6">
        {/* Page header */}
        <div className="border-b border-ops-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-amber-ops" />
            <div>
              <h1 className="font-display font-black text-amber-ops text-2xl tracking-widest text-glow-amber">
                ADMIN CONTROL PANEL
              </h1>
              <p className="text-ops-muted text-xs font-mono tracking-widest mt-0.5">
                SYSTEM ADMINISTRATION // CLEARANCE: TS/SCI // AUTHORIZED PERSONNEL ONLY
              </p>
            </div>
          </div>
        </div>

        <AdminPanelContent />
      </div>
    );
  }

  // Password prompt screen
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
      {/* Classification banner */}
      <div className="fixed top-0 left-0 right-0 bg-red-ops/90 text-foreground text-center py-1 text-xs font-display font-bold tracking-widest z-50 pointer-events-none">
        ⬛ CLASSIFIED // TOP SECRET // WRAITH EYES ONLY ⬛
      </div>

      <div className="ops-card p-8 max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-amber-ops/10 border border-amber-ops/30 flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-amber-ops" />
              </div>
              {accessDenied && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-ops flex items-center justify-center">
                  <ShieldOff className="w-3 h-3 text-foreground" />
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-amber-ops font-display font-black text-2xl tracking-widest text-glow-amber">
              ADMIN TERMINAL
            </div>
            <div className="text-ops-muted text-xs font-mono tracking-widest mt-1">
              ENTER AUTHORIZATION PASSPHRASE TO PROCEED
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-ops-border/40" />

        {/* Access denied message */}
        {accessDenied && (
          <div className="border border-red-ops/50 bg-red-ops/10 px-4 py-3 space-y-1">
            <div className="text-red-ops font-display font-black text-sm tracking-widest flicker">
              ⚠ ACCESS DENIED — INVALID PASSPHRASE
            </div>
            <div className="text-red-ops/70 text-xs font-mono">
              ATTEMPT {attemptCount} LOGGED // UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE
            </div>
          </div>
        )}

        {/* Password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-ops-muted text-xs font-mono tracking-widest block">
              PASSPHRASE
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="w-4 h-4 text-ops-muted/60" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (accessDenied) setAccessDenied(false);
                }}
                placeholder="ENTER PASSPHRASE"
                autoComplete="off"
                autoFocus
                className="w-full bg-ops-surface border border-ops-border/60 text-foreground font-mono text-sm tracking-widest pl-10 pr-10 py-3 focus:outline-none focus:border-amber-ops/60 focus:ring-1 focus:ring-amber-ops/30 placeholder:text-ops-muted/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ops-muted/60 hover:text-ops-muted transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying || !password.trim() || !actor}
            className="w-full bg-amber-ops/10 border border-amber-ops/40 text-amber-ops font-display font-bold tracking-widest text-sm py-3 hover:bg-amber-ops/20 hover:border-amber-ops/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                VERIFYING...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                AUTHENTICATE
              </>
            )}
          </button>
        </form>

        {/* Footer note */}
        <div className="border-t border-ops-border/40 pt-4 text-ops-muted/40 text-xs font-mono text-center space-y-1">
          <div>▸ ALL ACCESS ATTEMPTS ARE MONITORED AND LOGGED</div>
          <div>▸ UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE</div>
        </div>
      </div>
    </div>
  );
}
