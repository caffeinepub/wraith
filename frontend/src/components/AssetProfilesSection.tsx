import React, { useState } from 'react';
import { AssetProfile, Variant_active_terminated_inactive } from '../backend';
import { useGetAllAssetProfiles, useDeleteAssetProfile } from '../hooks/useQueries';
import AssetProfileForm from './AssetProfileForm';
import { clearanceLevelLabel, clearanceLevelClass, assetStatusLabel, specializationLabel, formatTimestamp } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Loader2, Users } from 'lucide-react';

export default function AssetProfilesSection() {
  const { data: assets = [], isLoading, error } = useGetAllAssetProfiles();
  const deleteAsset = useDeleteAssetProfile();
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetProfile | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (codename: string) => {
    setDeletingId(codename);
    try {
      await deleteAsset.mutateAsync(codename);
    } finally {
      setDeletingId(null);
    }
  };

  const statusColor: Record<Variant_active_terminated_inactive, string> = {
    [Variant_active_terminated_inactive.active]: 'text-green-ops',
    [Variant_active_terminated_inactive.inactive]: 'text-ops-muted',
    [Variant_active_terminated_inactive.terminated]: 'text-red-ops',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-ops" />
          <span className="text-amber-ops text-xs font-mono font-bold tracking-widest">
            ASSET PROFILES — {assets.length} ON FILE
          </span>
        </div>
        <Button
          onClick={() => { setEditingAsset(undefined); setShowForm(true); }}
          className="bg-amber-ops/20 border border-amber-ops/50 text-amber-ops hover:bg-amber-ops/30 font-mono font-bold tracking-widest rounded-none text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> NEW ASSET
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 bg-ops-surface/50 rounded-none" />)}
        </div>
      ) : error ? (
        <div className="text-red-ops text-xs font-mono border border-red-ops/30 bg-red-ops/10 p-3">
          ERROR: {(error as Error)?.message}
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-10 text-ops-muted font-mono text-xs tracking-wider border border-dashed border-ops-border/30">
          NO ASSET PROFILES ON FILE
        </div>
      ) : (
        <div className="space-y-2">
          {assets.map((asset) => (
            <div key={asset.codename} className="ops-card p-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-display text-amber-ops text-sm tracking-widest font-bold">{asset.codename}</span>
                  <span className={`text-xs font-mono font-bold ${statusColor[asset.status]}`}>
                    [{assetStatusLabel(asset.status)}]
                  </span>
                  <span className={`text-xs font-mono font-bold px-1.5 py-0.5 ${clearanceLevelClass(asset.clearanceLevel)}`}>
                    {clearanceLevelLabel(asset.clearanceLevel)}
                  </span>
                </div>
                {asset.specialization.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {asset.specialization.map((s, i) => (
                      <span key={i} className="text-xs font-mono text-ops-muted bg-ops-bg/60 border border-ops-border/30 px-1.5 py-0.5">
                        {specializationLabel(s)}
                      </span>
                    ))}
                  </div>
                )}
                {asset.bio && (
                  <p className="text-ops-muted text-xs font-mono line-clamp-1">{asset.bio}</p>
                )}
                <div className="text-ops-muted text-xs font-mono mt-1">
                  UPDATED: {formatTimestamp(asset.lastUpdate)}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 text-ops-muted hover:text-amber-ops rounded-none"
                  onClick={() => { setEditingAsset(asset); setShowForm(true); }}
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-ops-muted hover:text-red-ops rounded-none">
                      {deletingId === asset.codename ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-ops-surface border border-red-ops/30 rounded-none">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display text-red-ops tracking-widest">CONFIRM DELETION</AlertDialogTitle>
                      <AlertDialogDescription className="font-mono text-xs text-ops-muted">
                        DELETE ASSET PROFILE: <span className="text-amber-ops">{asset.codename}</span>?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-none font-mono text-xs border-ops-border/60">ABORT</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(asset.codename)}
                        className="rounded-none font-mono text-xs bg-red-ops/20 border border-red-ops/50 text-red-ops hover:bg-red-ops/30">
                        CONFIRM
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingAsset(undefined); } }}>
        <DialogContent className="bg-ops-surface border border-amber-ops/30 rounded-none max-w-2xl p-0 overflow-hidden">
          <div className="classification-banner-top-secret text-center py-1 text-xs font-display font-bold tracking-widest">
            ⬛ CLASSIFIED // TOP SECRET ⬛
          </div>
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-display text-amber-ops tracking-widest">
                {editingAsset ? 'EDIT ASSET PROFILE' : 'NEW ASSET PROFILE'}
              </DialogTitle>
            </DialogHeader>
            <AssetProfileForm
              asset={editingAsset}
              onClose={() => { setShowForm(false); setEditingAsset(undefined); }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
