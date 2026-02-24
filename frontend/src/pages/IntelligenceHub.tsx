import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssetProfilesSection from '../components/AssetProfilesSection';
import ThreatAssessmentsSection from '../components/ThreatAssessmentsSection';
import EncryptedNotesSection from '../components/EncryptedNotesSection';
import { Radio, Users, AlertTriangle, Lock } from 'lucide-react';

export default function IntelligenceHub() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Radio className="w-5 h-5 text-amber-ops" />
          <h1 className="font-display text-amber-ops text-2xl tracking-widest text-glow-amber">
            INTELLIGENCE HUB
          </h1>
        </div>
        <p className="text-ops-muted text-xs font-mono tracking-wider">
          ASSET MANAGEMENT // THREAT ANALYSIS // ENCRYPTED RECORDS
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="assets" className="w-full">
        <TabsList className="bg-ops-surface border border-ops-border/40 rounded-none h-auto p-0 w-full grid grid-cols-3">
          <TabsTrigger
            value="assets"
            className="rounded-none font-mono text-xs tracking-widest py-3 data-[state=active]:bg-amber-ops/10 data-[state=active]:text-amber-ops data-[state=active]:border-b-2 data-[state=active]:border-amber-ops text-ops-muted border-b-2 border-transparent"
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            ASSET PROFILES
          </TabsTrigger>
          <TabsTrigger
            value="threats"
            className="rounded-none font-mono text-xs tracking-widest py-3 data-[state=active]:bg-amber-ops/10 data-[state=active]:text-amber-ops data-[state=active]:border-b-2 data-[state=active]:border-amber-ops text-ops-muted border-b-2 border-transparent"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
            THREAT ASSESSMENTS
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="rounded-none font-mono text-xs tracking-widest py-3 data-[state=active]:bg-amber-ops/10 data-[state=active]:text-amber-ops data-[state=active]:border-b-2 data-[state=active]:border-amber-ops text-ops-muted border-b-2 border-transparent"
          >
            <Lock className="w-3.5 h-3.5 mr-1.5" />
            ENCRYPTED NOTES
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="mt-4">
          <div className="ops-card p-4">
            <AssetProfilesSection />
          </div>
        </TabsContent>

        <TabsContent value="threats" className="mt-4">
          <div className="ops-card p-4">
            <ThreatAssessmentsSection />
          </div>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <div className="ops-card p-4">
            <EncryptedNotesSection />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
