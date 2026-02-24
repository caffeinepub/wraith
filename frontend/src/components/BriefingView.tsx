import React from 'react';
import { MissionBriefing } from '../backend';
import { clearanceLevelLabel, clearanceLevelClass, formatDate, priorityLabel, threatLevelLabel } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { X, Printer, AlertOctagon, AlertTriangle, Info } from 'lucide-react';
import { ThreatLevel, Variant_low_high_medium } from '../backend';

interface BriefingViewProps {
  briefing: MissionBriefing;
  onClose: () => void;
}

export default function BriefingView({ briefing, onClose }: BriefingViewProps) {
  const handlePrint = () => window.print();

  const priorityColor: Record<Variant_low_high_medium, string> = {
    [Variant_low_high_medium.high]: 'text-red-ops border-red-ops/50',
    [Variant_low_high_medium.medium]: 'text-orange-400 border-orange-400/50',
    [Variant_low_high_medium.low]: 'text-amber-ops border-amber-ops/50',
  };

  const threatIcon = (tier: ThreatLevel) => {
    switch (tier) {
      case ThreatLevel.critical: return <AlertOctagon className="w-4 h-4 text-red-ops" />;
      case ThreatLevel.elevated: return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default: return <Info className="w-4 h-4 text-amber-ops" />;
    }
  };

  const threatColor = (tier: ThreatLevel) => {
    switch (tier) {
      case ThreatLevel.critical: return 'text-red-ops border-red-ops/50 bg-red-ops/10';
      case ThreatLevel.elevated: return 'text-orange-400 border-orange-400/50 bg-orange-400/10';
      default: return 'text-amber-ops border-amber-ops/50 bg-amber-ops/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ops-bg/95 overflow-y-auto print:bg-white">
      {/* Controls (hidden on print) */}
      <div className="print:hidden sticky top-0 z-10 bg-ops-surface/90 border-b border-ops-border/40 px-6 py-3 flex items-center justify-between">
        <span className="text-amber-ops text-xs font-mono font-bold tracking-widest">
          BRIEFING VIEW — {briefing.operationCodename}
        </span>
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="border-amber-ops/40 text-amber-ops hover:bg-amber-ops/10 rounded-none text-xs font-mono"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> PRINT
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-ops-muted hover:text-red-ops rounded-none h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-3xl mx-auto p-6 print:p-8">
        {/* Classification banner */}
        <div className={`text-center py-2 text-sm font-display font-black tracking-widest mb-6 ${clearanceLevelClass(briefing.classificationLevel)}`}>
          ⬛ {clearanceLevelLabel(briefing.classificationLevel)} // WRAITH EYES ONLY ⬛
        </div>

        {/* Document header */}
        <div className="border border-amber-ops/30 p-6 mb-6 bg-ops-surface/50">
          <div className="text-center mb-4">
            <div className="text-ops-muted text-xs font-mono tracking-widest mb-1">OPERATION BRIEFING DOCUMENT</div>
            <h1 className="font-display text-amber-ops text-3xl font-black tracking-widest text-glow-amber">
              OPERATION: {briefing.operationCodename}
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-ops-border/40 pt-4">
            <div>
              <span className="text-ops-muted tracking-wider">MISSION DATE:</span>
              <span className="text-foreground ml-2">{formatDate(briefing.missionDate)}</span>
            </div>
            <div>
              <span className="text-ops-muted tracking-wider">LEAD OFFICER:</span>
              <span className="text-amber-ops ml-2 font-bold">{briefing.leadOfficer}</span>
            </div>
            <div>
              <span className="text-ops-muted tracking-wider">CLASSIFICATION:</span>
              <span className="text-foreground ml-2">{clearanceLevelLabel(briefing.classificationLevel)}</span>
            </div>
            <div>
              <span className="text-ops-muted tracking-wider">OBJECTIVES:</span>
              <span className="text-foreground ml-2">{briefing.objectives.length}</span>
            </div>
          </div>
        </div>

        {/* Objectives */}
        {briefing.objectives.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 border-b border-amber-ops/30 pb-2 mb-3">
              <div className="w-1 h-4 bg-amber-ops" />
              <h2 className="font-display text-amber-ops text-sm tracking-widest font-bold">MISSION OBJECTIVES</h2>
            </div>
            <div className="space-y-2">
              {briefing.objectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-3 bg-ops-bg/40 border border-ops-border/30 p-3">
                  <span className="text-amber-ops font-mono text-xs font-bold flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}.
                  </span>
                  <span className="text-foreground font-mono text-xs flex-1">{obj.text}</span>
                  <span className={`text-xs font-mono font-bold px-1.5 py-0.5 border flex-shrink-0 ${priorityColor[obj.priority]}`}>
                    {priorityLabel(obj.priority)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HVT Profiles */}
        {briefing.hvtProfiles.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 border-b border-red-ops/30 pb-2 mb-3">
              <div className="w-1 h-4 bg-red-ops" />
              <h2 className="font-display text-red-ops text-sm tracking-widest font-bold">HIGH-VALUE TARGETS</h2>
            </div>
            <div className="space-y-3">
              {briefing.hvtProfiles.map((hvt, i) => (
                <div key={i} className="border border-red-ops/20 bg-red-ops/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {threatIcon(hvt.threatTier)}
                      <span className="font-display text-foreground text-sm font-bold tracking-wider">{hvt.name}</span>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 border ${threatColor(hvt.threatTier)}`}>
                      THREAT: {threatLevelLabel(hvt.threatTier)}
                    </span>
                  </div>
                  {hvt.description && (
                    <p className="text-ops-muted text-xs font-mono leading-relaxed">{hvt.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exfil Routes */}
        {briefing.exfilRoutes && (
          <div className="mb-6">
            <div className="flex items-center gap-2 border-b border-ops-border/40 pb-2 mb-3">
              <div className="w-1 h-4 bg-green-ops" />
              <h2 className="font-display text-green-ops text-sm tracking-widest font-bold">EXFILTRATION ROUTES</h2>
            </div>
            <div className="bg-ops-bg/40 border border-ops-border/30 p-4 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
              {briefing.exfilRoutes}
            </div>
          </div>
        )}

        {/* Rules of Engagement */}
        {briefing.rulesOfEngagement && (
          <div className="mb-6">
            <div className="flex items-center gap-2 border-b border-ops-border/40 pb-2 mb-3">
              <div className="w-1 h-4 bg-amber-ops" />
              <h2 className="font-display text-amber-ops text-sm tracking-widest font-bold">RULES OF ENGAGEMENT</h2>
            </div>
            <div className="bg-ops-bg/40 border border-ops-border/30 p-4 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
              {briefing.rulesOfEngagement}
            </div>
          </div>
        )}

        {/* Footer classification */}
        <div className={`text-center py-2 text-sm font-display font-black tracking-widest mt-6 ${clearanceLevelClass(briefing.classificationLevel)}`}>
          ⬛ {clearanceLevelLabel(briefing.classificationLevel)} // WRAITH EYES ONLY ⬛
        </div>
      </div>
    </div>
  );
}
