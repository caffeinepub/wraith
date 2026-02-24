import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import AdminPanelContent from '../components/AdminPanelContent';
import { ShieldOff, Loader2, Lock } from 'lucide-react';

export default function AdminPanel() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading, isFetched } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  // Loading state while checking admin status
  if (isLoading || !isFetched) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="w-8 h-8 text-amber-ops animate-spin" />
        <div className="text-amber-ops text-xs font-mono tracking-widest animate-pulse">
          VERIFYING CLEARANCE LEVEL...
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div className="ops-card p-8 max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <Lock className="w-16 h-16 text-red-ops opacity-80" />
          </div>
          <div>
            <div className="text-red-ops font-display font-black text-2xl tracking-widest mb-2">
              ACCESS DENIED
            </div>
            <div className="text-ops-muted text-xs font-mono tracking-widest">
              AUTHENTICATION REQUIRED TO ACCESS THIS TERMINAL
            </div>
          </div>
          <div className="border-t border-ops-border/40 pt-4 text-ops-muted text-xs font-mono space-y-1">
            <div>▸ IDENTITY VERIFICATION REQUIRED</div>
            <div>▸ UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE</div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated but not admin
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        {/* Classification banner */}
        <div className="fixed top-0 left-0 right-0 bg-red-ops/90 text-foreground text-center py-1 text-xs font-display font-bold tracking-widest z-50 pointer-events-none">
          ⬛ CLASSIFIED // TOP SECRET // WRAITH EYES ONLY ⬛
        </div>

        <div className="ops-card p-8 max-w-lg w-full text-center space-y-6">
          <div className="flex justify-center">
            <ShieldOff className="w-16 h-16 text-red-ops opacity-80" />
          </div>

          <div>
            <div className="text-red-ops font-display font-black text-3xl tracking-widest mb-1 flicker">
              ACCESS DENIED
            </div>
            <div className="text-red-ops/60 text-xs font-mono tracking-widest">
              CLEARANCE LEVEL INSUFFICIENT
            </div>
          </div>

          <div className="border border-red-ops/30 bg-red-ops/5 px-6 py-4 space-y-2">
            <div className="text-ops-muted text-xs font-mono space-y-1.5">
              <div className="flex items-center gap-2 justify-center">
                <span className="text-red-ops">▸</span>
                <span>THIS TERMINAL REQUIRES ADMIN CLEARANCE</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-red-ops">▸</span>
                <span>YOUR PRINCIPAL IS NOT AUTHORIZED</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-red-ops">▸</span>
                <span>THIS INCIDENT HAS BEEN LOGGED</span>
              </div>
            </div>
          </div>

          <div className="text-ops-muted/50 text-xs font-mono">
            PRINCIPAL: <code className="text-ops-muted/70">{identity?.getPrincipal().toString()}</code>
          </div>

          <div className="text-ops-muted/40 text-xs font-mono tracking-widest">
            CONTACT YOUR SYSTEM ADMINISTRATOR FOR ACCESS
          </div>
        </div>
      </div>
    );
  }

  // Authenticated and admin — render the panel
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
