import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ClearanceLevel, MissionStatus, ThreatLevel, Variant_active_terminated_inactive, Variant_low_high_medium } from '../backend';
import type { ThreatCategory, SpecializedSkill } from '../backend';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatDate(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function dateToNanoseconds(date: Date): bigint {
  return BigInt(date.getTime()) * BigInt(1_000_000);
}

export function nanosecondsToDate(ns: bigint): Date {
  return new Date(Number(ns / BigInt(1_000_000)));
}

export function clearanceLevelLabel(level: ClearanceLevel): string {
  switch (level) {
    case ClearanceLevel.confidential: return 'CONFIDENTIAL';
    case ClearanceLevel.secret: return 'SECRET';
    case ClearanceLevel.topSecret: return 'TOP SECRET';
    case ClearanceLevel.TS_SCI: return 'TS/SCI';
  }
}

export function clearanceLevelClass(level: ClearanceLevel): string {
  switch (level) {
    case ClearanceLevel.confidential: return 'classification-banner-confidential';
    case ClearanceLevel.secret: return 'classification-banner-secret';
    case ClearanceLevel.topSecret: return 'classification-banner-top-secret';
    case ClearanceLevel.TS_SCI: return 'classification-banner-ts-sci';
  }
}

export function missionStatusLabel(status: MissionStatus): string {
  switch (status) {
    case MissionStatus.active: return 'ACTIVE';
    case MissionStatus.compromised: return 'COMPROMISED';
    case MissionStatus.completed: return 'COMPLETED';
    case MissionStatus.aborted: return 'ABORTED';
  }
}

export function threatLevelLabel(level: ThreatLevel): string {
  switch (level) {
    case ThreatLevel.low: return 'LOW';
    case ThreatLevel.elevated: return 'ELEVATED';
    case ThreatLevel.critical: return 'CRITICAL';
  }
}

export function assetStatusLabel(status: Variant_active_terminated_inactive): string {
  switch (status) {
    case Variant_active_terminated_inactive.active: return 'ACTIVE';
    case Variant_active_terminated_inactive.inactive: return 'INACTIVE';
    case Variant_active_terminated_inactive.terminated: return 'TERMINATED';
  }
}

export function priorityLabel(priority: Variant_low_high_medium): string {
  switch (priority) {
    case Variant_low_high_medium.high: return 'HIGH';
    case Variant_low_high_medium.medium: return 'MEDIUM';
    case Variant_low_high_medium.low: return 'LOW';
  }
}

export function threatCategoryLabel(cat: ThreatCategory): string {
  switch (cat.__kind__) {
    case 'cyber': return 'CYBER';
    case 'counterTerror': return 'COUNTER-TERROR';
    case 'counterIntelligence': return 'COUNTER-INTEL';
    case 'counterEspionage': return 'COUNTER-ESPIONAGE';
    case 'counterInsurgency': return 'COUNTER-INSURGENCY';
    case 'drugSmuggling': return 'DRUG SMUGGLING';
    case 'humanSmuggling': return 'HUMAN SMUGGLING';
    case 'armsSmuggling': return 'ARMS SMUGGLING';
    case 'other': return `OTHER: ${cat.other}`;
  }
}

export function specializationLabel(skill: SpecializedSkill): string {
  switch (skill.__kind__) {
    case 'cyber': return 'CYBER';
    case 'counterTerror': return 'COUNTER-TERROR';
    case 'counterIntelligence': return 'COUNTER-INTEL';
    case 'counterEspionage': return 'COUNTER-ESPIONAGE';
    case 'counterInsurgency': return 'COUNTER-INSURGENCY';
    case 'drugIntelligence': return 'DRUG INTEL';
    case 'militaryIntelligence': return 'MILITARY INTEL';
    case 'humanIntelligence': return 'HUMAN INTEL';
    case 'other': return `OTHER: ${skill.other}`;
  }
}

export function missionTypeLabel(type: string): string {
  switch (type) {
    case 'recon': return 'RECON';
    case 'cyber': return 'CYBER';
    case 'counterTerror': return 'COUNTER-TERROR';
    case 'inPersonOp': return 'IN-PERSON OP';
    default: return type.toUpperCase();
  }
}
