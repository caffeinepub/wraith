import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ThreatCategory = {
    __kind__: "counterInsurgency";
    counterInsurgency: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "drugSmuggling";
    drugSmuggling: null;
} | {
    __kind__: "cyber";
    cyber: null;
} | {
    __kind__: "counterIntelligence";
    counterIntelligence: null;
} | {
    __kind__: "armsSmuggling";
    armsSmuggling: null;
} | {
    __kind__: "counterTerror";
    counterTerror: null;
} | {
    __kind__: "counterEspionage";
    counterEspionage: null;
} | {
    __kind__: "humanSmuggling";
    humanSmuggling: null;
};
export interface AssetProfile {
    bio: string;
    status: Variant_active_terminated_inactive;
    clearanceLevel: ClearanceLevel;
    createdBy: Principal;
    lastUpdate: Time;
    codename: string;
    specialization: Array<SpecializedSkill>;
}
export type Time = bigint;
export interface ClassifiedNote {
    title: string;
    body: string;
    createdBy: Principal;
    author: string;
    timestamp: Time;
    classification: ClearanceLevel;
}
export type SpecializedSkill = {
    __kind__: "counterInsurgency";
    counterInsurgency: null;
} | {
    __kind__: "humanIntelligence";
    humanIntelligence: null;
} | {
    __kind__: "militaryIntelligence";
    militaryIntelligence: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "cyber";
    cyber: null;
} | {
    __kind__: "counterIntelligence";
    counterIntelligence: null;
} | {
    __kind__: "counterTerror";
    counterTerror: null;
} | {
    __kind__: "counterEspionage";
    counterEspionage: null;
} | {
    __kind__: "drugIntelligence";
    drugIntelligence: null;
};
export interface BriefingObjective {
    text: string;
    priority: Variant_low_high_medium;
}
export interface ThreatAssessment {
    subjectName: string;
    createdBy: Principal;
    lastUpdate: Time;
    summary: string;
    threatCategory: ThreatCategory;
    linkedMissions: Array<string>;
    riskScore: bigint;
}
export interface HVTProfile {
    name: string;
    description: string;
    threatTier: ThreatLevel;
}
export interface MissionBriefing {
    exfilRoutes: string;
    classificationLevel: ClearanceLevel;
    leadOfficer: string;
    missionDate: Time;
    createdBy: Principal;
    lastUpdate: Time;
    hvtProfiles: Array<HVTProfile>;
    rulesOfEngagement: string;
    objectives: Array<BriefingObjective>;
    operationCodename: string;
}
export interface FieldReport {
    content: string;
    author: Principal;
    timestamp: Time;
}
export interface Mission {
    status: MissionStatus;
    isTemplate: boolean;
    threatLevel: ThreatLevel;
    missionType: MissionType;
    createdBy: Principal;
    lastUpdate: Time;
    assignedOperatives: Array<string>;
    codename: string;
    fieldReports: Array<FieldReport>;
    objectives: Array<string>;
}
export interface UserProfile {
    name: string;
    callsign: string;
    department: string;
}
export enum ClearanceLevel {
    topSecret = "topSecret",
    secret = "secret",
    TS_SCI = "TS_SCI",
    confidential = "confidential"
}
export enum MissionStatus {
    active = "active",
    aborted = "aborted",
    completed = "completed",
    compromised = "compromised"
}
export enum MissionType {
    cyber = "cyber",
    counterTerror = "counterTerror",
    inPersonOp = "inPersonOp",
    recon = "recon"
}
export enum ThreatLevel {
    low = "low",
    critical = "critical",
    elevated = "elevated"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_active_terminated_inactive {
    active = "active",
    terminated = "terminated",
    inactive = "inactive"
}
export enum Variant_low_high_medium {
    low = "low",
    high = "high",
    medium = "medium"
}
export interface backendInterface {
    addMissionFieldReport(codename: string, reportContent: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAssetProfile(codename: string, clearanceLevel: ClearanceLevel, specialization: Array<SpecializedSkill>, status: Variant_active_terminated_inactive, bio: string): Promise<void>;
    createClassifiedNote(title: string, body: string, classification: ClearanceLevel, author: string): Promise<void>;
    createMission(codename: string, status: MissionStatus, threatLevel: ThreatLevel, assignedOperatives: Array<string>, missionType: MissionType, objectives: Array<string>): Promise<void>;
    createMissionBriefing(operationCodename: string, missionDate: Time, leadOfficer: string, objectives: Array<BriefingObjective>, hvtProfiles: Array<HVTProfile>, exfilRoutes: string, rulesOfEngagement: string, classificationLevel: ClearanceLevel): Promise<void>;
    createThreatAssessment(subjectName: string, threatCategory: ThreatCategory, riskScore: bigint, summary: string, linkedMissions: Array<string>): Promise<void>;
    deleteAssetProfile(codename: string): Promise<void>;
    deleteClassifiedNote(title: string): Promise<void>;
    deleteMission(codename: string): Promise<void>;
    deleteMissionBriefing(operationCodename: string): Promise<void>;
    deleteThreatAssessment(subjectName: string): Promise<void>;
    getAllAssetProfiles(): Promise<Array<AssetProfile>>;
    getAllClassifiedNotes(): Promise<Array<ClassifiedNote>>;
    getAllMissionBriefings(): Promise<Array<MissionBriefing>>;
    getAllMissions(): Promise<Array<Mission>>;
    getAllThreatAssessments(): Promise<Array<ThreatAssessment>>;
    getAssetProfile(codename: string): Promise<AssetProfile>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClassifiedNote(title: string): Promise<ClassifiedNote>;
    getCurrentTimestamp(): Promise<Time>;
    getMission(codename: string): Promise<Mission>;
    getMissionBriefing(operationCodename: string): Promise<MissionBriefing>;
    getMissionTemplates(): Promise<Array<Mission>>;
    getMissionsByStatus(status: MissionStatus): Promise<Array<Mission>>;
    getThreatAssessment(subjectName: string): Promise<ThreatAssessment>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveMissionTemplate(codename: string, status: MissionStatus, threatLevel: ThreatLevel, assignedOperatives: Array<string>, missionType: MissionType, objectives: Array<string>): Promise<void>;
    updateAssetProfile(codename: string, clearanceLevel: ClearanceLevel, specialization: Array<SpecializedSkill>, status: Variant_active_terminated_inactive, bio: string): Promise<void>;
    updateClassifiedNote(title: string, body: string, classification: ClearanceLevel, author: string): Promise<void>;
    updateMission(codename: string, status: MissionStatus, threatLevel: ThreatLevel, assignedOperatives: Array<string>, missionType: MissionType, objectives: Array<string>): Promise<void>;
    updateMissionBriefing(operationCodename: string, missionDate: Time, leadOfficer: string, objectives: Array<BriefingObjective>, hvtProfiles: Array<HVTProfile>, exfilRoutes: string, rulesOfEngagement: string, classificationLevel: ClearanceLevel): Promise<void>;
    updateThreatAssessment(subjectName: string, threatCategory: ThreatCategory, riskScore: bigint, summary: string, linkedMissions: Array<string>): Promise<void>;
    verifyAdminPassword(password: string): Promise<boolean>;
}
