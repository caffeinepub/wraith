import React from 'react';
import { ThreatLevel } from '../backend';
import { threatLevelLabel } from '../lib/utils';
import { AlertTriangle, AlertOctagon, Info } from 'lucide-react';

interface ThreatIndicatorProps {
  level: ThreatLevel;
  showLabel?: boolean;
  className?: string;
}

export default function ThreatIndicator({ level, showLabel = true, className = '' }: ThreatIndicatorProps) {
  const config: Record<ThreatLevel, { color: string; icon: React.ReactNode; glow: string }> = {
    [ThreatLevel.low]: {
      color: 'text-amber-ops',
      icon: <Info className="w-3 h-3" />,
      glow: '',
    },
    [ThreatLevel.elevated]: {
      color: 'text-orange-400',
      icon: <AlertTriangle className="w-3 h-3" />,
      glow: '',
    },
    [ThreatLevel.critical]: {
      color: 'text-red-ops',
      icon: <AlertOctagon className="w-3 h-3" />,
      glow: 'text-glow-red',
    },
  };

  const { color, icon, glow } = config[level];

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold tracking-widest ${color} ${glow} ${className}`}>
      {icon}
      {showLabel && threatLevelLabel(level)}
    </span>
  );
}
