"use client";

import { DashboardWelcome } from "./DashboardWelcome";
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
  const { role: authRole, canAccess } = usePermissions();
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
  const activeRole = authRole;

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400" style={{ fontFamily: D.sans }}>
          Loading your dashboard…
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
    { id: "operations", label: "Overview", icon: Activity, color: D.indigo },
    { id: "competition", label: "Fixtures", icon: Calendar, color: D.rose },
    { id: "squads", label: "Teams", icon: Shield, color: D.emerald },
    { id: "coaching", label: "Development", icon: Users, color: D.amber },
    { id: "rankings", label: "Rankings", icon: Trophy, color: D.violet },
    { id: "logistics", label: "Operations", icon: Truck, color: D.sky },
  ].filter(tab => tab.id === "operations" || tab.id === "competition" || (tab.id === "squads" && canAccess("squad")) || (tab.id === "coaching" && canAccess("training")) || (tab.id === "rankings" && canAccess("powerindex")) || (tab.id === "logistics" && canAccess("logistics")));
  const visibleDeck = deckTabs.some(tab => tab.id === activeDeck) ? activeDeck : "operations";

  return (
    <div className="pb-8 space-y-6 animate-in fade-in duration-500">
      <DashboardWelcome />
      <DashboardFilterBar />

      {/* Available sections follow the active role. */}
      <div className="space-y-6">
        <div
          role="tablist" aria-label="Dashboard sections"
          onKeyDown={event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const index = deckTabs.findIndex(tab => tab.id === visibleDeck);
            const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? deckTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + deckTabs.length) % deckTabs.length;
            const id = deckTabs[nextIndex].id;
            setActiveDeck(id);
            setFilters({ activeDeckMode: id as typeof filters.activeDeckMode });
            document.getElementById(`dashboard-tab-${id}`)?.focus();
          }}
          className="flex items-center gap-1.5 p-1.5 rounded-2xl border overflow-x-auto shadow-sm no-scrollbar"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          {deckTabs.map((tab) => {
            const isActive = visibleDeck === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                tabIndex={visibleDeck === tab.id ? 0 : -1}
                role="tab" aria-selected={visibleDeck === tab.id} aria-controls="dashboard-panel" id={`dashboard-tab-${tab.id}`}
                onClick={() => {
                  setActiveDeck(tab.id as any);
                  setFilters({ activeDeckMode: tab.id as any });
                }}
                className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-xs transition-colors duration-300 whitespace-nowrap select-none ${
                  isActive
                    ? "text-primary"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.03]"
                }`}
                style={{ fontFamily: D.sans }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDeckTabPill"
                    className="absolute inset-0 rounded-xl border border-primary/30 bg-primary/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                
                <div
                  className={`relative z-10 p-1.5 rounded-lg transition-colors duration-300 ${
                    isActive ? "bg-primary/10 text-primary" : "bg-transparent text-current"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                
                <span className="relative z-10">{tab.label}</span>

                {isActive && (
                  <span className="relative z-10 ml-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* 6. Dynamic Content Deck Rendering */}
        <AnimatePresence mode="wait">
          <motion.div
            key={visibleDeck + (activeRole || "")}
            id="dashboard-panel" role="tabpanel" aria-labelledby={`dashboard-tab-${visibleDeck}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {/* Deck 1: Overview */}
            {visibleDeck === "operations" && (
              <div className="space-y-8">
                {canAccess("analytics") && <SmartDailyBriefing
                  userName={person?.firstName || user?.displayName?.split(" ")[0]}
                  role={activeRole as any}
                />}
                {renderDashboardWidgets(activeRole || "")}
              </div>
            )}

            {/* Deck 2: Fixtures */}
            {visibleDeck === "competition" && (
              <div className="space-y-8">
                <FixtureCentreCard role={activeRole || "schooladmin"} schoolId={person?.schoolId} />
              </div>
            )}

            {/* Deck 3: Team Operations & Selection */}
            {visibleDeck === "squads" && (
              <div className="space-y-8">
                <CoachDashboard />
              </div>
            )}

            {/* Deck 4: Development */}
            {visibleDeck === "coaching" && (
              <div className="space-y-8">
                <PlayerMicroPlanGenerator />
              </div>
            )}

            {/* Deck 5: Rankings */}
            {visibleDeck === "rankings" && (
              <div className="space-y-8">
                <GlobalRankingsClient />
              </div>
            )}

            {/* Deck 6: Operationsical */}
            {visibleDeck === "logistics" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <GroundskeeperDashboard schoolId={person?.schoolId || ""} />
                  <DriverDashboard />
                </div>
                {canAccess("medical") && <MedicalDashboard />}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
