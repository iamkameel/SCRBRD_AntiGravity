"use client";

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { ClipboardList, Shield, CalendarDays, Users } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { fetchPersonByEmail } from '@/app/actions/personActions';
import { getTeamsBySchool, fetchCoachesBySchool } from '@/lib/firestore';
import { Person, Team } from '@/types/firestore';
import { Player } from '@/lib/store';

export default function SportsmasterDashboard() {
  const { user } = useAuth();
  const [person, setPerson] = useState<Person | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return;
      
      try {
        const profile = await fetchPersonByEmail(user.email);
        setPerson(profile);
        
        if (profile?.schoolId) {
          const [schoolTeams, schoolCoaches] = await Promise.all([
            getTeamsBySchool(profile.schoolId),
            fetchCoachesBySchool(profile.schoolId)
          ]);
          setTeams(schoolTeams);
          setCoaches(schoolCoaches);
        }
      } catch (error) {
        console.error("Error loading sportsmaster dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Sports Master Dashboard" 
        description={`Welcome back, ${person?.firstName || user?.displayName || 'Sports Master'}. Oversee all teams and fixtures.`}
      />

      {/* Fixture Centre */}
      <FixtureCentreCard 
        role="Sports-Master"
        maxMatches={3}
        schoolId={person?.schoolId}
      />

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Department Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Shield}
            label="Total Teams"
            value={teams.length}
            subtitle="Across all divisions"
          />
          <MetricCard
            icon={CalendarDays}
            label="Fixtures Set"
            value="100%" // Placeholder until we have fixture completion logic
            subtitle="For current term"
          />
          <MetricCard
            icon={Users}
            label="Coaches"
            value={coaches.length}
            subtitle="Active staff"
          />
          <MetricCard
            icon={ClipboardList}
            label="Pending Approvals"
            value={3} // Placeholder
            subtitle="Team sheets needing review"
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Division Standings</h3>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
            [Standings Table Placeholder]
          </div>
        </div>

        <div className="col-span-3 bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Administrative Tasks</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
              <span className="text-sm font-medium text-foreground">Approve U15 Team Sheet</span>
              <button className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">Review</button>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
              <span className="text-sm font-medium text-foreground">Finalize Term 2 Schedule</span>
              <button className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">Edit</button>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
              <span className="text-sm font-medium text-foreground">Order New Equipment</span>
              <button className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-colors">Pending</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
