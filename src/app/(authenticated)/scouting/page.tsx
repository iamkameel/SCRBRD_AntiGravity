"use client";

import React, { useState, Suspense } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import ScoutingDashboard from '@/components/scouting/ScoutingDashboard';
import AIScoutingView from '@/components/scouting/AIScoutingView';
import { OppositionScoutingCockpit } from '@/components/scouting/OppositionScoutingCockpit';
import { MultiRaterCalibrationView } from '@/components/scouting/MultiRaterCalibrationView';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Users, ShieldAlert, GraduationCap, Scale } from "lucide-react";
import { TalentPathwayEngine } from "@/components/scouting/TalentPathwayEngine";
import { D } from "@/lib/design-system";
import { useSearchParams, useRouter } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { motion } from "framer-motion";

function ScoutingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams?.get('tab');
  const initialTab = rawTab === 'ai' ? 'ai' : rawTab === 'opposition' ? 'opposition' : rawTab === 'pathway' ? 'pathway' : rawTab === 'calibration' ? 'calibration' : 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    router.replace(`/scouting${val !== 'overview' ? `?tab=${val}` : ''}`, { scroll: false });
  };

  const tabsConfig = [
    { id: "overview", label: "Prospects & Evaluations", icon: Users },
    { id: "calibration", label: "Multi-Rater Coach Calibration", icon: Scale },
    { id: "pathway", label: "Selection Pathway & Elite Camps", icon: GraduationCap },
    { id: "ai", label: "AI Intelligence & Head-to-Head", icon: Sparkles },
    { id: "opposition", label: "Opposition Dossiers & Cockpit", icon: ShieldAlert },
  ];

  return (
    <div className="flex-1 space-y-6 container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Scouting & Talent Hub" 
          description="Unified talent identification and multi-rater coach calibration platform." 
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div 
          className="flex items-center gap-1.5 p-1.5 rounded-2xl border shadow-xl backdrop-blur-xl overflow-x-auto no-scrollbar"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          {tabsConfig.map((t) => {
            const isActive = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors duration-300 whitespace-nowrap select-none ${
                  isActive ? "text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
                style={{ fontFamily: D.sans }}
              >
                {isActive && (
                  <motion.div
                    layoutId="scoutingTabPill"
                    className="absolute inset-0 rounded-xl border border-indigo-500/30 bg-indigo-500/15 shadow-lg shadow-indigo-500/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className={`relative z-10 p-1 rounded-lg ${isActive ? "bg-indigo-500/20 text-indigo-400" : "text-current"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="relative z-10 uppercase tracking-wider text-[11px]" style={{ fontFamily: D.head }}>
                  {t.label}
                </span>
                {isActive && (
                  <span className="relative z-10 ml-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        <TabsContent value="overview" className="focus-visible:outline-none">
          <ScoutingDashboard />
        </TabsContent>

        <TabsContent value="calibration" className="focus-visible:outline-none">
          <MultiRaterCalibrationView />
        </TabsContent>

        <TabsContent value="pathway" className="focus-visible:outline-none">
          <TalentPathwayEngine />
        </TabsContent>

        <TabsContent value="ai" className="focus-visible:outline-none">
          <AIScoutingView />
        </TabsContent>

        <TabsContent value="opposition" className="focus-visible:outline-none">
          <OppositionScoutingCockpit />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ScoutingPage() {
  return (
    <RouteGuard module="talent">
      <Suspense fallback={<div className="container mx-auto p-8 text-center text-muted-foreground">Loading Scouting Hub...</div>}>
        <ScoutingContent />
      </Suspense>
    </RouteGuard>
  );
}


