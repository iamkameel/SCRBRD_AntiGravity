"use client";

import React, { useState, Suspense } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import ScoutingDashboard from '@/components/scouting/ScoutingDashboard';
import AIScoutingView from '@/components/scouting/AIScoutingView';
import { OppositionScoutingCockpit } from '@/components/scouting/OppositionScoutingCockpit';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Users, ShieldAlert } from "lucide-react";
import { D } from "@/lib/design-system";
import { useSearchParams, useRouter } from "next/navigation";

function ScoutingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams?.get('tab');
  const initialTab = rawTab === 'ai' ? 'ai' : rawTab === 'opposition' ? 'opposition' : 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    router.replace(`/scouting${val !== 'overview' ? `?tab=${val}` : ''}`, { scroll: false });
  };

  return (
    <div className="flex-1 space-y-6 container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Scouting & Talent Hub" 
          description="Unified talent identification and competitive opposition intelligence platform." 
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-black/30 p-1.5 border border-white/10 rounded-2xl inline-flex gap-2 flex-wrap">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
          >
            <Users className="h-4 w-4" /> Prospects & Evaluations
          </TabsTrigger>
          <TabsTrigger 
            value="ai" 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs data-[state=active]:bg-sky-500 data-[state=active]:text-black transition-all"
          >
            <Sparkles className="h-4 w-4" /> AI Intelligence & Head-to-Head
          </TabsTrigger>
          <TabsTrigger 
            value="opposition" 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs data-[state=active]:bg-emerald-500 data-[state=active]:text-black transition-all"
          >
            <ShieldAlert className="h-4 w-4" /> Opposition Dossiers & Cockpit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="focus-visible:outline-none">
          <ScoutingDashboard />
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
    <Suspense fallback={<div className="container mx-auto p-8 text-center text-muted-foreground">Loading Scouting Hub...</div>}>
      <ScoutingContent />
    </Suspense>
  );
}

