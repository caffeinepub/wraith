import React from 'react';
import { ClearanceLevel } from '../backend';
import { clearanceLevelLabel, clearanceLevelClass } from '../lib/utils';

interface ClassificationBannerProps {
  level: ClearanceLevel;
  className?: string;
}

export default function ClassificationBanner({ level, className = '' }: ClassificationBannerProps) {
  return (
    <div
      className={`${clearanceLevelClass(level)} text-center py-1 px-4 text-xs font-display font-bold tracking-widest uppercase ${className}`}
    >
      ⬛ CLASSIFIED // {clearanceLevelLabel(level)} ⬛
    </div>
  );
}
