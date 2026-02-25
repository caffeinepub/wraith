import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, UserX, UserCheck, Trash2, Edit, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import {
  useGetBannedUsers,
  useBanUser,
  useUnbanUser,
  useGetAllMissions,
  useDeleteMission,
  useGetAllAssetProfiles,
  useDeleteAssetProfile,
} from '../hooks/useQueries';
import type { Mission, AssetProfile } from '../backend';
import { MissionStatus, ThreatLevel, MissionType, Variant_active_terminated_inactive, ClearanceLevel } from '../backend';
import MissionForm from './MissionForm';
import AssetProfileForm from './AssetProfileForm';

export default function AdminPanelContent() {
  const [banInput, setBanInput] = useState('');
  const [expandedMission, setExpandedMission] = useState<string | null>(null);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [showCreateMission, setShowCreateMission] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetProfile | null>(null);
  const [showCreateAsset, setShowCreateAsset] = useState(false);

  const { data: bannedUsers = [], isLoading: bannedLoading } = useGetBannedUsers();
  const { data: missions = [], isLoading: missionsLoading } = useGetAllMissions();
  const { data: assetProfiles = [], isLoading: assetsLoading } = useGetAllAssetProfiles();

  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();
  const deleteMissionMutation = useDeleteMission();
  const deleteAssetMutation = useDeleteAssetProfile();

  const handleBan = async () => {
    const principal = banInput.trim();
    if (!principal) return;
    try {
      await banMutation.mutateAsync(principal);
      setBanInput('');
    } catch (err) {
      console.error('Ban error:', err);
    }
  };

  const handleUnban = async (principalText: string) => {
    try {
      await unbanMutation.mutateAsync(principalText);
    } catch (err) {
      console.error('Unban error:', err);
    }
  };

  const handleDeleteMission = async (codename: string) => {
    try {
      await deleteMissionMutation.mutateAsync(codename);
    } catch (err) {
      console.error('Delete mission error:', err);
    }
  };

  const handleDeleteAsset = async (codename: string) => {
    try {
      await deleteAssetMutation.mutateAsync(codename);
    } catch (err) {
      console.error('Delete asset error:', err);
    }
  };

  const getStatusColor = (status: MissionStatus | string) => {
    switch (status) {
      case MissionStatus.active: return 'text-green-400';
      case MissionStatus.compromised: return 'text-yellow-400';
      case MissionStatus.completed: return 'text-blue-400';
      case MissionStatus.aborted: return 'text-red-400';
      default: return 'text-ops-muted';
    }
  };

  const getThreatColor = (level: ThreatLevel | string) => {
    switch (level) {
      case ThreatLevel.low: return 'bg-green-900/40 text-green-400 border-green-800';
      case ThreatLevel.elevated: return 'bg-yellow-900/40 text-yellow-400 border-yellow-800';
      case ThreatLevel.critical: return 'bg-red-900/40 text-red-400 border-red-800';
      default: return 'bg-ops-surface text-ops-muted border-ops-border';
    }
  };

  const getAssetStatusColor = (status: Variant_active_terminated_inactive | string) => {
    switch (status) {
      case Variant_active_terminated_inactive.active: return 'text-green-400';
      case Variant_active_terminated_inactive.inactive: return 'text-yellow-400';
      case Variant_active_terminated_inactive.terminated: return 'text-red-400';
      default: return 'text-ops-muted';
    }
  };

  const getClearanceBadge = (level: ClearanceLevel | string) => {
    switch (level) {
      case ClearanceLevel.confidential: return 'bg-blue-900/40 text-blue-300 border-blue-800';
      case ClearanceLevel.secret: return 'bg-yellow-900/40 text-yellow-300 border-yellow-800';
      case ClearanceLevel.topSecret: return 'bg-orange-900/40 text-orange-300 border-orange-800';
      case ClearanceLevel.TS_SCI: return 'bg-red-900/40 text-red-300 border-red-800';
      default: return 'bg-ops-surface text-ops-muted border-ops-border';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-ops-surface border border-ops-border w-full justify-start">
          <TabsTrigger value="users" className="data-[state=active]:bg-ops-accent data-[state=active]:text-ops-bg text-ops-muted">
            User Management
          </TabsTrigger>
          <TabsTrigger value="missions" className="data-[state=active]:bg-ops-accent data-[state=active]:text-ops-bg text-ops-muted">
            Mission Management
          </TabsTrigger>
          <TabsTrigger value="assets" className="data-[state=active]:bg-ops-accent data-[state=active]:text-ops-bg text-ops-muted">
            Asset Profiles
          </TabsTrigger>
        </TabsList>

        {/* ── User Management Tab ── */}
        <TabsContent value="users" className="mt-4 space-y-4">
          <div className="ops-card p-4 space-y-3">
            <h3 className="text-ops-accent text-sm font-mono uppercase tracking-widest">
              Ban User by Principal
            </h3>
            <div className="flex gap-2">
              <Input
                value={banInput}
                onChange={(e) => setBanInput(e.target.value)}
                placeholder="Enter principal ID..."
                className="bg-ops-surface border-ops-border text-ops-text flex-1"
                disabled={banMutation.isPending}
              />
              <Button
                onClick={handleBan}
                disabled={banMutation.isPending || !banInput.trim()}
                className="bg-ops-danger text-white hover:bg-ops-danger/80"
              >
                {banMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><UserX className="w-4 h-4 mr-1" /> Ban</>
                )}
              </Button>
            </div>
          </div>

          <div className="ops-card p-4 space-y-3">
            <h3 className="text-ops-accent text-sm font-mono uppercase tracking-widest">
              Banned Users ({bannedUsers.length})
            </h3>
            {bannedLoading ? (
              <div className="flex items-center gap-2 text-ops-muted text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </div>
            ) : bannedUsers.length === 0 ? (
              <p className="text-ops-muted text-sm">No banned users.</p>
            ) : (
              <div className="space-y-2">
                {bannedUsers.map((principal) => (
                  <div
                    key={principal}
                    className="flex items-center justify-between bg-ops-surface border border-ops-border rounded px-3 py-2"
                  >
                    <span className="text-ops-text font-mono text-xs truncate flex-1 mr-2">
                      {principal}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnban(principal)}
                      disabled={unbanMutation.isPending}
                      className="border-green-700 text-green-400 hover:bg-green-900/20 text-xs"
                    >
                      {unbanMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <><UserCheck className="w-3 h-3 mr-1" /> Unban</>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Mission Management Tab ── */}
        <TabsContent value="missions" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-ops-accent text-sm font-mono uppercase tracking-widest">
              All Missions ({missions.length})
            </h3>
            <Button
              size="sm"
              onClick={() => setShowCreateMission(true)}
              className="bg-ops-accent text-ops-bg hover:bg-ops-accent/90 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" /> New Mission
            </Button>
          </div>

          {missionsLoading ? (
            <div className="flex items-center gap-2 text-ops-muted text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading missions...
            </div>
          ) : missions.length === 0 ? (
            <p className="text-ops-muted text-sm">No missions found.</p>
          ) : (
            <div className="space-y-2">
              {missions.map((mission) => (
                <div
                  key={mission.codename}
                  className="ops-card border border-ops-border"
                >
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer"
                    onClick={() =>
                      setExpandedMission(
                        expandedMission === mission.codename ? null : mission.codename,
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-ops-text font-mono text-sm font-semibold">
                        {mission.codename}
                      </span>
                      <span className={`text-xs font-mono ${getStatusColor(mission.status)}`}>
                        {String(mission.status).toUpperCase()}
                      </span>
                      <span
                        className={`text-xs border rounded px-1.5 py-0.5 ${getThreatColor(mission.threatLevel)}`}
                      >
                        {String(mission.threatLevel).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMission(mission);
                        }}
                        className="text-ops-accent hover:bg-ops-accent/10 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => e.stopPropagation()}
                            className="text-ops-danger hover:bg-ops-danger/10 text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-ops-bg border-ops-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-ops-text">
                              Delete Mission
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-ops-muted">
                              Permanently delete mission{' '}
                              <span className="text-ops-accent font-mono">
                                {mission.codename}
                              </span>
                              ? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-ops-border text-ops-muted">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteMission(mission.codename)}
                              className="bg-ops-danger text-white hover:bg-ops-danger/80"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {expandedMission === mission.codename ? (
                        <ChevronUp className="w-4 h-4 text-ops-muted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-ops-muted" />
                      )}
                    </div>
                  </div>

                  {expandedMission === mission.codename && (
                    <div className="border-t border-ops-border p-3 space-y-2 text-xs text-ops-muted">
                      <div>
                        <span className="text-ops-accent uppercase tracking-wider">Type: </span>
                        <span className="text-ops-text">{String(mission.missionType)}</span>
                      </div>
                      <div>
                        <span className="text-ops-accent uppercase tracking-wider">
                          Operatives:{' '}
                        </span>
                        <span className="text-ops-text">
                          {mission.assignedOperatives.join(', ') || 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-ops-accent uppercase tracking-wider">
                          Objectives:{' '}
                        </span>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          {mission.objectives.map((obj, i) => (
                            <li key={i} className="text-ops-text">
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-ops-accent uppercase tracking-wider">
                          Field Reports:{' '}
                        </span>
                        <span className="text-ops-text">{mission.fieldReports.length}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Asset Profiles Tab ── */}
        <TabsContent value="assets" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-ops-accent text-sm font-mono uppercase tracking-widest">
              Asset Profiles ({assetProfiles.length})
            </h3>
            <Button
              size="sm"
              onClick={() => setShowCreateAsset(true)}
              className="bg-ops-accent text-ops-bg hover:bg-ops-accent/90 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" /> New Asset
            </Button>
          </div>

          {assetsLoading ? (
            <div className="flex items-center gap-2 text-ops-muted text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading assets...
            </div>
          ) : assetProfiles.length === 0 ? (
            <p className="text-ops-muted text-sm">No asset profiles found.</p>
          ) : (
            <div className="space-y-2">
              {assetProfiles.map((asset) => (
                <div
                  key={asset.codename}
                  className="ops-card border border-ops-border p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-ops-text font-mono text-sm font-semibold">
                      {asset.codename}
                    </span>
                    <span
                      className={`text-xs border rounded px-1.5 py-0.5 ${getClearanceBadge(asset.clearanceLevel)}`}
                    >
                      {String(asset.clearanceLevel).toUpperCase()}
                    </span>
                    <span className={`text-xs font-mono ${getAssetStatusColor(asset.status)}`}>
                      {String(asset.status).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingAsset(asset)}
                      className="text-ops-accent hover:bg-ops-accent/10 text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-ops-danger hover:bg-ops-danger/10 text-xs"
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-ops-bg border-ops-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-ops-text">
                            Delete Asset Profile
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-ops-muted">
                            Permanently delete asset{' '}
                            <span className="text-ops-accent font-mono">{asset.codename}</span>?
                            This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-ops-border text-ops-muted">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAsset(asset.codename)}
                            className="bg-ops-danger text-white hover:bg-ops-danger/80"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Mission Create/Edit Dialog */}
      <Dialog
        open={showCreateMission || !!editingMission}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateMission(false);
            setEditingMission(null);
          }
        }}
      >
        <DialogContent className="bg-ops-bg border-ops-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-ops-accent font-mono uppercase tracking-widest">
              {editingMission ? 'Edit Mission' : 'Create Mission'}
            </DialogTitle>
          </DialogHeader>
          <MissionForm
            existingMission={editingMission ?? undefined}
            onSuccess={() => {
              setShowCreateMission(false);
              setEditingMission(null);
            }}
            onCancel={() => {
              setShowCreateMission(false);
              setEditingMission(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Asset Create/Edit Dialog */}
      <Dialog
        open={showCreateAsset || !!editingAsset}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateAsset(false);
            setEditingAsset(null);
          }
        }}
      >
        <DialogContent className="bg-ops-bg border-ops-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-ops-accent font-mono uppercase tracking-widest">
              {editingAsset ? 'Edit Asset Profile' : 'Create Asset Profile'}
            </DialogTitle>
          </DialogHeader>
          <AssetProfileForm
            existingAsset={editingAsset ?? undefined}
            onSuccess={() => {
              setShowCreateAsset(false);
              setEditingAsset(null);
            }}
            onCancel={() => {
              setShowCreateAsset(false);
              setEditingAsset(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
