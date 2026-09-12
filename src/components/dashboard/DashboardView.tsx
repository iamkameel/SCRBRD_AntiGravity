"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePermissions } from "@/lib/auth/usePermissions";
import { ROLES } from "@/lib/auth/rbac";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { fetchPersonByEmail } from "@/app/actions/personActions";
import { Person } from "@/types/firestore";
import { DashboardFilterBar } from "./DashboardFilterBar";
import { SmartDailyBriefing } from "./SmartDailyBriefing";
import { LiveTelemetryTicker } from "./LiveTelemetryTicker";
import { SchoolReadinessGauge } from "./SchoolReadinessGauge";
import FixtureCentreCard from "./FixtureCentreCard";
import { 
  Loader2, Radio, Layers, Activity, Users, Trophy, Truck, Shield, Sparkles, UserCheck, RefreshCw, ChevronRight, Zap, Calendar, HeartPulse, Bus, Award, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { D } from "@/lib/design-system";

import AdminDashboard from "../dashboards/admin-dashboard";
import CoachDashboard from "../dashboards/coach-dashboard";
import PlayerDashboard from "../dashboards/player-dashboard";
import SportsmasterDashboard from "../dashboards/sportsmaster-dashboard";
import MedicalDashboard from "../dashboards/medical-dashboard";
import UmpireScorerDashboard from "../dashboards/umpire-scorer-dashboard";
import GroundskeeperDashboard from "../dashboards/groundskeeper-dashboard";
import DriverDashboard from "../dashboards/driver-dashboard";
import GuardianDashboard from "../dashboards/guardian-dashboard";
import SpectatorDashboard from "../dashboards/spectator-dashboard";

import { PlayerMicroPlanGenerator } from "../coaches/PlayerMicroPlanGenerator";
import { GlobalRankingsClient } from "@/components/charts/lazy";

export default function DashboardView() {
  const { role: authRole } = usePermissions();
  const { user } = useAuth();
  const { filters, setFilters } = useDashboard();
  const email = user?.email ?? null;
  const personQuery = useQuery({
    queryKey: ['person-by-email', email],
    queryFn: () => fetchPersonByEmail(email!),
    enabled: !!email,
    staleTime: 30 * 60 * 1000,
  });
  const person: Person | null = personQuery.data ?? null;
  const loading = personQuery.isLoading;

  // Active OS Deck Mode tab: "operations" | "competition" | "squads" | "coaching" | "rankings" | "logistics"
  const [activeDeck, setActiveDeck] = useState<string>(filters.activeDeckMode || "operations");

  // Effective Role (simulated or authenticated)
  const activeRole = filters.simulatedRole || authRole;

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400" style={{ fontFamily: D.sans }}>
          Syncing School Cricket OS Operational Deck...
        </p>
      </div>
    );
  }

  // Render role-specific widgets based on active role
  const renderDashboardWidgets = (roleToRender: string) => {
    switch (roleToRender) {
      case ROLES.SUPERADMIN:
      case ROLES.PLATFORMOPS:
      case ROLES.SCHOOLADMIN:
      case ROLES.LEAGUEADMIN:
      case ROLES.TOURNAMENTDIRECTOR:
        return <AdminDashboard />;
      case ROLES.SPORTSMASTER:
        return <SportsmasterDashboard />;
      case ROLES.COACH:
      case ROLES.COACHSUPPORT:
      case ROLES.SCHOOLSTAFF:
        return <CoachDashboard />;
      case ROLES.PLAYER:
      case ROLES.ADULTPLAYER:
        return <PlayerDashboard />;
      case ROLES.PARENT:
        return <GuardianDashboard />;
      case ROLES.EXTERNAL:
      case ROLES.SCOUT:
        return <SpectatorDashboard />;
      case ROLES.MEDICALOFFICER:
        return <MedicalDashboard />;
      case ROLES.MATCHOFFICIAL:
        return <UmpireScorerDashboard />;
      case ROLES.GROUNDSKEEPER:
        return <GroundskeeperDashboard schoolId={person?.schoolId || ""} />;
      case ROLES.DRIVER:
        return <DriverDashboard />;
      default:
        return <SpectatorDashboard />;
    }
  };

  const deckTabs = [
    { id: "operations", label: "Match & Live Command", icon: Activity, color: D.indigo },
    { id: "competition", label: "Competition & Fixtures", icon: Calendar, color: D.rose },
    { id: "squads", label: "Team Ops & Selection", icon: Shield, color: D.emerald },
    { id: "coaching", label: "Analytics & Intelligence", icon: Users, color: D.amber },
    { id: "rankings", label: "Identity, History & Scouting", icon: Trophy, color: D.violet },
    { id: "logistics", label: "Facilities, Transport & Med", icon: Truck, color: D.sky },
  ];

  return (
    <div className="pb-20 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Realtime Match Telemetry Ticker */}
      <LiveTelemetryTicker />

      {/* 2. Global Filter Bar & Persona Simulator Switcher */}
      <DashboardFilterBar />

      {/* 3. Persona Simulator Active Notice Banner (if role is overridden) */}
      <AnimatePresence>
        {filters.simulatedRole && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-indigo-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight" style={{ fontFamily: D.head }}>
                  Active Persona Simulation Mode
                </p>
                <p className="text-[11px] text-indigo-950 dark:text-indigo-200 font-medium" style={{ fontFamily: D.sans }}>
                  Viewing platform layer as: <span className="font-bold text-indigo-600 dark:text-white uppercase">{activeRole}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setFilters({ simulatedRole: undefined })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-xs font-semibold text-indigo-900 dark:text-white transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5 text-indigo-500" />
              Reset Persona
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Global OS Operational Readiness Gauge */}
      <SchoolReadinessGauge />

      {/* 5. Strategic 6-Layer OS Deck Navigation Tabs */}
      <div className="space-y-6">
        <div
          className="flex items-center gap-1.5 p-1.5 rounded-2xl border overflow-x-auto shadow-xl backdrop-blur-xl no-scrollbar"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          {deckTabs.map((tab) => {
            const isActive = activeDeck === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveDeck(tab.id as any);
                  setFilters({ activeDeckMode: tab.id as any });
                }}
                className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-xs transition-colors duration-300 whitespace-nowrap select-none ${
                  isActive
                    ? "text-indigo-950 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.03]"
                }`}
                style={{ fontFamily: D.sans }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDeckTabPill"
                    className="absolute inset-0 rounded-xl border border-indigo-500/30 bg-indigo-500/15 shadow-lg shadow-indigo-500/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                
                <div
                  className={`relative z-10 p-1.5 rounded-lg transition-colors duration-300 ${
                    isActive ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "bg-transparent text-current"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                
                <span className="relative z-10">{tab.label}</span>

                {isActive && (
                  <span className="relative z-10 ml-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* 6. Dynamic Content Deck Rendering */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDeck + (activeRole || "")}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {/* Deck 1: Match & Live Command */}
            {activeDeck === "operations" && (
              <div className="space-y-8">
                <SmartDailyBriefing
                  userName={person?.firstName || user?.displayName?.split(" ")[0]}
                  role={activeRole as any}
                />
                {renderDashboardWidgets(activeRole || "")}
              </div>
            )}

            {/* Deck 2: Competition & Fixtures */}
            {activeDeck === "competition" && (
              <div className="space-y-8">
                <FixtureCentreCard role={activeRole || "schooladmin"} schoolId={person?.schoolId} />
              </div>
            )}

            {/* Deck 3: Team Operations & Selection */}
            {activeDeck === "squads" && (
              <div className="space-y-8">
                <CoachDashboard />
              </div>
            )}

            {/* Deck 4: Analytics & Intelligence */}
            {activeDeck === "coaching" && (
              <div className="space-y-8">
                <PlayerMicroPlanGenerator />
              </div>
            )}

            {/* Deck 5: Identity, History & Scouting */}
            {activeDeck === "rankings" && (
              <div className="space-y-8">
                <GlobalRankingsClient />
              </div>
            )}

            {/* Deck 6: Facilities, Transport & Medical */}
            {activeDeck === "logistics" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <GroundskeeperDashboard schoolId={person?.schoolId || ""} />
                  <DriverDashboard />
                </div>
                <MedicalDashboard />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
