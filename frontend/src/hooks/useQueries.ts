import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Mission,
  MissionStatus,
  ThreatLevel,
  MissionType,
  AssetProfile,
  ClearanceLevel,
  SpecializedSkill,
  ThreatAssessment,
  ThreatCategory,
  ClassifiedNote,
  MissionBriefing,
  BriefingObjective,
  HVTProfile,
  UserProfile,
} from '../backend';
import { Variant_active_terminated_inactive } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetAdminList() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['adminList'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminList();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAdmin(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminList'] });
    },
  });
}

export function useRemoveAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeAdmin(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminList'] });
    },
  });
}

// ─── Missions ────────────────────────────────────────────────────────────────

export function useGetAllMissions() {
  const { actor, isFetching } = useActor();

  return useQuery<Mission[]>({
    queryKey: ['missions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMissions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMission(codename: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Mission>({
    queryKey: ['mission', codename],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMission(codename);
    },
    enabled: !!actor && !isFetching && !!codename,
  });
}

export function useGetMissionsByStatus(status: MissionStatus | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Mission[]>({
    queryKey: ['missions', 'status', status],
    queryFn: async () => {
      if (!actor || !status) return [];
      return actor.getMissionsByStatus(status);
    },
    enabled: !!actor && !isFetching && !!status,
  });
}

export function useCreateMission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      codename: string;
      status: MissionStatus;
      threatLevel: ThreatLevel;
      assignedOperatives: string[];
      missionType: MissionType;
      objectives: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMission(
        params.codename,
        params.status,
        params.threatLevel,
        params.assignedOperatives,
        params.missionType,
        params.objectives
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });
}

export function useUpdateMission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      codename: string;
      status: MissionStatus;
      threatLevel: ThreatLevel;
      assignedOperatives: string[];
      missionType: MissionType;
      objectives: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMission(
        params.codename,
        params.status,
        params.threatLevel,
        params.assignedOperatives,
        params.missionType,
        params.objectives
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['mission', variables.codename] });
    },
  });
}

export function useDeleteMission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (codename: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMission(codename);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });
}

export function useAddFieldReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { codename: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMissionFieldReport(params.codename, params.content);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['mission', variables.codename] });
    },
  });
}

// ─── Asset Profiles ──────────────────────────────────────────────────────────

export function useGetAllAssetProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<AssetProfile[]>({
    queryKey: ['assetProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAssetProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateAssetProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      codename: string;
      clearanceLevel: ClearanceLevel;
      specialization: SpecializedSkill[];
      status: Variant_active_terminated_inactive;
      bio: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAssetProfile(
        params.codename,
        params.clearanceLevel,
        params.specialization,
        params.status,
        params.bio
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetProfiles'] });
    },
  });
}

export function useUpdateAssetProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      codename: string;
      clearanceLevel: ClearanceLevel;
      specialization: SpecializedSkill[];
      status: Variant_active_terminated_inactive;
      bio: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAssetProfile(
        params.codename,
        params.clearanceLevel,
        params.specialization,
        params.status,
        params.bio
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetProfiles'] });
    },
  });
}

export function useDeleteAssetProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (codename: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAssetProfile(codename);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetProfiles'] });
    },
  });
}

// ─── Threat Assessments ──────────────────────────────────────────────────────

export function useGetAllThreatAssessments() {
  const { actor, isFetching } = useActor();

  return useQuery<ThreatAssessment[]>({
    queryKey: ['threatAssessments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllThreatAssessments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateThreatAssessment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      subjectName: string;
      threatCategory: ThreatCategory;
      riskScore: bigint;
      summary: string;
      linkedMissions: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createThreatAssessment(
        params.subjectName,
        params.threatCategory,
        params.riskScore,
        params.summary,
        params.linkedMissions
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threatAssessments'] });
    },
  });
}

export function useUpdateThreatAssessment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      subjectName: string;
      threatCategory: ThreatCategory;
      riskScore: bigint;
      summary: string;
      linkedMissions: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateThreatAssessment(
        params.subjectName,
        params.threatCategory,
        params.riskScore,
        params.summary,
        params.linkedMissions
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threatAssessments'] });
    },
  });
}

export function useDeleteThreatAssessment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subjectName: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteThreatAssessment(subjectName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threatAssessments'] });
    },
  });
}

// ─── Classified Notes ────────────────────────────────────────────────────────

export function useGetAllClassifiedNotes() {
  const { actor, isFetching } = useActor();

  return useQuery<ClassifiedNote[]>({
    queryKey: ['classifiedNotes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClassifiedNotes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateClassifiedNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      body: string;
      classification: ClearanceLevel;
      author: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createClassifiedNote(
        params.title,
        params.body,
        params.classification,
        params.author
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classifiedNotes'] });
    },
  });
}

export function useUpdateClassifiedNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      body: string;
      classification: ClearanceLevel;
      author: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateClassifiedNote(
        params.title,
        params.body,
        params.classification,
        params.author
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classifiedNotes'] });
    },
  });
}

export function useDeleteClassifiedNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteClassifiedNote(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classifiedNotes'] });
    },
  });
}

// ─── Mission Briefings ───────────────────────────────────────────────────────

export function useGetAllMissionBriefings() {
  const { actor, isFetching } = useActor();

  return useQuery<MissionBriefing[]>({
    queryKey: ['missionBriefings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMissionBriefings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateMissionBriefing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      operationCodename: string;
      missionDate: bigint;
      leadOfficer: string;
      objectives: BriefingObjective[];
      hvtProfiles: HVTProfile[];
      exfilRoutes: string;
      rulesOfEngagement: string;
      classificationLevel: ClearanceLevel;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMissionBriefing(
        params.operationCodename,
        params.missionDate,
        params.leadOfficer,
        params.objectives,
        params.hvtProfiles,
        params.exfilRoutes,
        params.rulesOfEngagement,
        params.classificationLevel
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missionBriefings'] });
    },
  });
}

export function useUpdateMissionBriefing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      operationCodename: string;
      missionDate: bigint;
      leadOfficer: string;
      objectives: BriefingObjective[];
      hvtProfiles: HVTProfile[];
      exfilRoutes: string;
      rulesOfEngagement: string;
      classificationLevel: ClearanceLevel;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMissionBriefing(
        params.operationCodename,
        params.missionDate,
        params.leadOfficer,
        params.objectives,
        params.hvtProfiles,
        params.exfilRoutes,
        params.rulesOfEngagement,
        params.classificationLevel
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missionBriefings'] });
    },
  });
}

export function useDeleteMissionBriefing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (operationCodename: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMissionBriefing(operationCodename);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missionBriefings'] });
    },
  });
}
