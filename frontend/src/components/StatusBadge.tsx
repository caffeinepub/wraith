import React from 'react';
import { MissionStatus } from '../backend';
import { missionStatusLabel } from '../lib/utils';

interface StatusBadgeProps {
  status: MissionStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const styles: Record<MissionStatus, string> = {
    [MissionStatus.active]: 'text-green-ops border-green-ops/50 bg-green-ops/10 glow-green',
    [MissionStatus.compromised]: 'text-red-ops border-red-ops/50 bg-red-ops/10 glow-red',
    [MissionStatus.completed]: 'text-blue-400 border-blue-400/50 bg-blue-400/10',
    [MissionStatus.aborted]: 'text-ops-muted border-ops-muted/50 bg-ops-muted/10',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-mono font-bold border tracking-widest rounded-none ${styles[status]} ${className}`}
    >
      {missionStatusLabel(status)}
    </span>
  );
}
