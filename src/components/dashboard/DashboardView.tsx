"use client";

import React, { useEffect, useState } from 'react';
import { usePermissions } from "@/lib/auth/usePermissions";
import { ROLES, Role } from "@/lib/auth/rbac";
import { useAuth } from '@/contexts/AuthContext';
import { fetchPersonByEmail } from '@/app/actions/personActions';
import { Person } from '@/types/firestore';
import { PageHeader } from './PageHeader';
import { DashboardFilterBar } from './DashboardFilterBar';
import FixtureCentreCard from './FixtureCentreCard';
import { SmartDailyBriefing } from './SmartDailyBriefing';
import { Loader2 } from 'lucide-react';
import AdminDashboard from '../dashboards/admin-dashboard';
import CoachDashboard from '../dashboards/coach-dashboard';
import PlayerDashboard from '../dashboards/player-dashboard';
import SportsmasterDashboard from '../dashboards/sportsmaster-dashboard';
import MedicalDashboard from '../dashboards/medical-dashboard';
import UmpireScorerDashboard from '../dashboards/umpire-scorer-dashboard';
import GroundskeeperDashboard from '../dashboards/groundskeeper-dashboard';
import DriverDashboard from '../dashboards/driver-dashboard';
import GuardianDashboard from '../dashboards/guardian-dashboard';
import SpectatorDashboard from '../dashboards/spectator-dashboard';

export default function DashboardView() {
  const { role } = usePermissions();
  const { user } = useAuth();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  // You can optionally fetch global context for the user here, 
  // or rely on the specific dashboards doing it. For a truly generic
  // container, we load the basic profile.
  useEffect(() => {
    async function initDashboard() {
      if (!user?.email) {
        setLoading(false);
        return;
      }
      try {
        const profile = await fetchPersonByEmail(user.email);
        setPerson(profile);
      } catch (err) {
        console.error("Dashboard init error", err);
      } finally {
        setLoading(false);
      }
    }
    initDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  // Determine which specific component blocks to render
  const renderDashboardWidgets = () => {
    switch (role) {
      // Administrative Operations
      case ROLES.SUPERADMIN:
      case ROLES.PLATFORMOPS:
      case ROLES.SCHOOLADMIN:
      case ROLES.LEAGUEADMIN:
      case ROLES.TOURNAMENTDIRECTOR:
        return <AdminDashboard />;
      case ROLES.SPORTSMASTER:
        return <SportsmasterDashboard />;

      // Team & Coaching Operations
      case ROLES.COACH:
      case ROLES.COACHSUPPORT:
      case ROLES.SCHOOLSTAFF:
        return <CoachDashboard />;

      // Players & Spectators
      case ROLES.PLAYER:
      case ROLES.ADULTPLAYER:
        return <PlayerDashboard />;
      case ROLES.PARENT:
        return <GuardianDashboard />;
      case ROLES.EXTERNAL:
      case ROLES.SCOUT:
        return <SpectatorDashboard />;
        
      // Support & Medical Operations
      case ROLES.MEDICALOFFICER:
        return <MedicalDashboard />;

      // Match & Ground Operations
      case ROLES.MATCHOFFICIAL:
        return <UmpireScorerDashboard />;
      case ROLES.GROUNDSKEEPER:
        return <GroundskeeperDashboard schoolId={person?.schoolId || ''} />;
      case ROLES.DRIVER:
        return <DriverDashboard />;

      // Fallback
      default:
        return <SpectatorDashboard />;
    }
  };

  return (
    <div className="pb-16 space-y-8 animate-in fade-in duration-500">
      {/* 1. Global Daily Briefing using the user's name */}
      <div className="px-4 md:px-8">
        <SmartDailyBriefing userName={person?.firstName || user?.displayName?.split(' ')[0]} role={role as any} />
      </div>

      {/* 2. Global Filter Bar (Season / School selection) */}
      <div className="px-4 md:px-8">
        <DashboardFilterBar />
        
        {/* 3. Role-specific Dashboard Widgets */}
        <div className="mt-8">
          {renderDashboardWidgets()}
        </div>
      </div>
    </div>
  );
}
