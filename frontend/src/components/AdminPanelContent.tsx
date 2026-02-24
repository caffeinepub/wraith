import React from 'react';
import { ShieldCheck, Info, Lock } from 'lucide-react';

export default function AdminPanelContent() {
  return (
    <div className="space-y-8">
      {/* Header card */}
      <div className="ops-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-5 h-5 text-amber-ops" />
          <h2 className="font-display font-bold text-amber-ops tracking-widest text-lg">
            ADMIN CONTROL PANEL
          </h2>
        </div>
        <p className="text-ops-muted text-xs font-mono">
          SYSTEM ADMINISTRATION // CLEARANCE: TS/SCI // AUTHORIZED PERSONNEL ONLY
        </p>
      </div>

      {/* Access granted notice */}
      <div className="ops-card p-6 space-y-4">
        <div className="border-b border-ops-border/40 pb-3">
          <div className="text-amber-ops text-xs font-mono tracking-widest font-bold">
            ▸ SESSION STATUS
          </div>
        </div>

        <div className="flex items-start gap-4 px-4 py-4 border border-amber-ops/30 bg-amber-ops/5">
          <Lock className="w-5 h-5 text-amber-ops flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-amber-ops text-xs font-mono font-bold tracking-widest">
              ✓ PASSPHRASE AUTHENTICATED — ACCESS GRANTED
            </div>
            <div className="text-ops-muted text-xs font-mono">
              YOUR SESSION IS ACTIVE. ALL ADMINISTRATIVE ACTIONS ARE LOGGED AND MONITORED.
            </div>
          </div>
        </div>
      </div>

      {/* System info */}
      <div className="ops-card p-6 space-y-4">
        <div className="border-b border-ops-border/40 pb-3">
          <div className="text-amber-ops text-xs font-mono tracking-widest font-bold">
            ▸ SYSTEM INFORMATION
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 text-xs font-mono">
            <Info className="w-4 h-4 text-amber-ops/70 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-ops-muted">
              <div className="flex items-center gap-2">
                <span className="text-amber-ops/60">▸</span>
                <span>ADMIN ACCESS IS CONTROLLED VIA PASSPHRASE AUTHENTICATION</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-ops/60">▸</span>
                <span>ALL OPERATIONS PERFORMED UNDER THIS SESSION ARE RECORDED</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-ops/60">▸</span>
                <span>UNAUTHORIZED DISCLOSURE OF CREDENTIALS IS A FEDERAL OFFENSE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-ops/60">▸</span>
                <span>SESSION EXPIRES ON PAGE RELOAD — RE-AUTHENTICATION REQUIRED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
