import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAdminList, useAddAdmin, useRemoveAdmin } from '../hooks/useQueries';
import { Principal } from '@icp-sdk/core/principal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, UserPlus, UserMinus, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function AdminPanelContent() {
  const { identity } = useInternetIdentity();
  const { data: adminList, isLoading, error } = useGetAdminList();
  const addAdmin = useAddAdmin();
  const removeAdmin = useRemoveAdmin();

  const [newPrincipal, setNewPrincipal] = useState('');
  const [addError, setAddError] = useState('');
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const currentPrincipal = identity?.getPrincipal().toString();

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    const trimmed = newPrincipal.trim();
    if (!trimmed) {
      setAddError('Principal ID is required.');
      return;
    }
    try {
      const p = Principal.fromText(trimmed);
      await addAdmin.mutateAsync(p);
      setNewPrincipal('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAddError(msg.includes('already admin') ? 'This principal is already an admin.' : `Error: ${msg}`);
    }
  };

  const handleRemoveAdmin = async (principalText: string) => {
    try {
      const p = Principal.fromText(principalText);
      await removeAdmin.mutateAsync(p);
    } catch {
      // error handled by mutation state
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="ops-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-5 h-5 text-amber-ops" />
          <h2 className="font-display font-bold text-amber-ops tracking-widest text-lg">
            ADMIN ACCESS CONTROL
          </h2>
        </div>
        <p className="text-ops-muted text-xs font-mono">
          MANAGE AUTHORIZED ADMINISTRATOR PRINCIPALS — CHANGES TAKE EFFECT IMMEDIATELY
        </p>
      </div>

      {/* Current Admin List */}
      <div className="ops-card p-6 space-y-4">
        <div className="border-b border-ops-border/40 pb-3">
          <div className="text-amber-ops text-xs font-mono tracking-widest font-bold">
            ▸ AUTHORIZED ADMINISTRATORS
          </div>
          <div className="text-ops-muted text-xs font-mono mt-1">
            {adminList ? `${adminList.length} PRINCIPAL(S) ON RECORD` : 'LOADING...'}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-3 py-4 text-ops-muted">
            <Loader2 className="w-4 h-4 animate-spin text-amber-ops" />
            <span className="text-xs font-mono tracking-widest animate-pulse">
              RETRIEVING ADMIN REGISTRY...
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 py-3 px-4 border border-red-ops/40 bg-red-ops/10">
            <AlertTriangle className="w-4 h-4 text-red-ops flex-shrink-0" />
            <span className="text-red-ops text-xs font-mono">
              FAILED TO LOAD ADMIN LIST — ACCESS DENIED OR NETWORK ERROR
            </span>
          </div>
        )}

        {!isLoading && !error && adminList && adminList.length === 0 && (
          <div className="py-4 text-center text-ops-muted text-xs font-mono tracking-widest">
            NO ADMINS REGISTERED
          </div>
        )}

        {!isLoading && !error && adminList && adminList.length > 0 && (
          <div className="space-y-2">
            {adminList.map((principal) => {
              const principalText = principal.toString();
              const isSelf = principalText === currentPrincipal;
              return (
                <div
                  key={principalText}
                  className="flex items-center justify-between gap-4 px-4 py-3 border border-ops-border/30 bg-ops-bg/40 hover:border-amber-ops/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-amber-ops flex-shrink-0" />
                    <code className="text-xs font-mono text-foreground/80 truncate">
                      {principalText}
                    </code>
                    {isSelf && (
                      <span className="text-xs font-mono text-amber-ops border border-amber-ops/40 px-1.5 py-0.5 flex-shrink-0">
                        YOU
                      </span>
                    )}
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        disabled={isSelf || removeAdmin.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-widest border border-red-ops/30 text-red-ops/70 hover:border-red-ops hover:text-red-ops hover:bg-red-ops/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                        title={isSelf ? 'Cannot remove yourself' : 'Remove admin'}
                      >
                        <UserMinus className="w-3 h-3" />
                        REVOKE
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-sidebar border border-ops-border font-mono">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-amber-ops font-display tracking-widest">
                          CONFIRM REVOCATION
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-ops-muted text-xs font-mono space-y-2">
                          <span className="block">
                            You are about to revoke admin access for the following principal:
                          </span>
                          <code className="block text-foreground/70 bg-ops-bg/60 px-3 py-2 border border-ops-border/40 break-all">
                            {principalText}
                          </code>
                          <span className="block text-red-ops/80">
                            THIS ACTION CANNOT BE UNDONE WITHOUT RE-GRANTING ACCESS.
                          </span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="font-mono text-xs tracking-widest border-ops-border text-ops-muted hover:text-foreground">
                          ABORT
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveAdmin(principalText)}
                          className="font-mono text-xs tracking-widest bg-red-ops/20 border border-red-ops/50 text-red-ops hover:bg-red-ops/30 hover:border-red-ops"
                        >
                          CONFIRM REVOKE
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>
        )}

        {removeAdmin.isError && (
          <div className="flex items-center gap-2 px-4 py-2 border border-red-ops/40 bg-red-ops/10 mt-2">
            <AlertTriangle className="w-3 h-3 text-red-ops flex-shrink-0" />
            <span className="text-red-ops text-xs font-mono">
              REVOCATION FAILED — {removeAdmin.error instanceof Error ? removeAdmin.error.message : 'UNKNOWN ERROR'}
            </span>
          </div>
        )}
      </div>

      {/* Add Admin Form */}
      <div className="ops-card p-6 space-y-4">
        <div className="border-b border-ops-border/40 pb-3">
          <div className="text-amber-ops text-xs font-mono tracking-widest font-bold">
            ▸ GRANT ADMIN ACCESS
          </div>
          <div className="text-ops-muted text-xs font-mono mt-1">
            ENTER A VALID INTERNET IDENTITY PRINCIPAL TO GRANT ADMIN PRIVILEGES
          </div>
        </div>

        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono text-ops-muted tracking-widest">
              PRINCIPAL ID
            </label>
            <input
              type="text"
              value={newPrincipal}
              onChange={(e) => {
                setNewPrincipal(e.target.value);
                setAddError('');
              }}
              placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
              className="w-full bg-ops-bg/60 border border-ops-border/50 text-foreground font-mono text-xs px-4 py-3 focus:outline-none focus:border-amber-ops/60 placeholder:text-ops-muted/40 tracking-wider"
              disabled={addAdmin.isPending}
            />
            {addError && (
              <div className="flex items-center gap-2 text-red-ops text-xs font-mono">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                {addError}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={addAdmin.isPending || !newPrincipal.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-ops/20 border border-amber-ops/50 text-amber-ops hover:bg-amber-ops/30 hover:border-amber-ops font-mono font-bold tracking-widest text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addAdmin.isPending ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> GRANTING ACCESS...</>
            ) : (
              <><UserPlus className="w-3.5 h-3.5" /> GRANT ADMIN ACCESS</>
            )}
          </button>

          {addAdmin.isSuccess && (
            <div className="text-amber-ops text-xs font-mono">
              ✓ ADMIN ACCESS GRANTED SUCCESSFULLY
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
