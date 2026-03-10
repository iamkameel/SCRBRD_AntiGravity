"use client";

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { Trophy, Target, Activity, Calendar } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { fetchPersonByEmail } from '@/app/actions/personActions';
import { fetchMatchesForTeams } from '@/app/actions/matchActions';
import { Match, Person } from '@/types/firestore';
import { format } from 'date-fns';

export default function PlayerDashboard() {
  const { user } = useAuth();
  const [person, setPerson] = useState<Person | null>(null);
  const [matches, setMatches] = useState<{ upcoming: Match[], past: Match[], total: number }>({ upcoming: [], past: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return;
      
      try {
        const profile = await fetchPersonByEmail(user.email);
        setPerson(profile);
        
        if (profile?.teamIds && profile.teamIds.length > 0) {
          const matchData = await fetchMatchesForTeams(profile.teamIds);
          if (matchData.success) {
            setMatches({
              upcoming: matchData.upcoming || [],
              past: matchData.past || [],
              total: matchData.total || 0
            });
          }
        }
      } catch (error) {
        console.error("Error loading player dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const nextMatch = matches.upcoming[0];
  const stats = person?.stats || {};
  const battingAvg = stats.battingAverage || 0;
  const matchesPlayed = stats.matchesPlayed || matches.past.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Player Dashboard" 
        description={`Welcome back, ${person?.firstName || user?.displayName || 'Player'}. Track your performance and schedule.`}
      />

      {/* Fixture Centre */}
      <FixtureCentreCard 
        role="Player"
        maxMatches={3}
        teamId={person?.teamIds?.[0]}
        playerId={person?.id}
      />

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">My Stats</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Trophy}
            label="Matches Played"
            value={matchesPlayed}
            subtitle="This season"
          />
          <MetricCard
            icon={Target}
            label="Batting Avg"
            value={battingAvg}
            subtitle={stats.totalRuns ? `${stats.totalRuns} runs` : "No runs yet"}
          />
          <MetricCard
            icon={Activity}
            label="Fitness Score"
            value={person?.playerProfile?.physicalAttributes?.coreFitness || (person as any)?.skills?.fitness || 92}
            subtitle="Latest assessment"
          />
          <MetricCard
            icon={Calendar}
            label="Next Match"
            value={nextMatch ? format(new Date(nextMatch.matchDate as string), 'EEE') : "-"}
            subtitle={nextMatch ? `vs ${nextMatch.awayTeamName === 'My Team' ? nextMatch.homeTeamName : nextMatch.awayTeamName}` : "No upcoming matches"}
          />
        </div>
      </div>

      {/* Performance & Schedule */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
            [Stats Chart Placeholder]
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Schedule</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 rounded-lg bg-muted/30 border border-border">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Team Training</p>
                <p className="text-xs text-muted-foreground">Today, 16:00 - Nets</p>
              </div>
            </div>
            {nextMatch && (
              <div className="flex items-center p-3 rounded-lg bg-muted/30 border border-border">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Match Day</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(nextMatch.matchDate as string), 'EEEE, HH:mm')} - {nextMatch.venue || 'Home'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
