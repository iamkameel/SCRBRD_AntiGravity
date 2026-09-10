"use client";

import { useState, useEffect } from 'react';
import { fetchCollection } from '@/lib/firestore';
import { MetricCard } from './MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { D } from '@/lib/design-system';
import {
  Trophy, School, Shield, Users, UserCog, Heart,
  MapPin, UserCheck, Shovel, ListChecks, Truck, Medal,
  Loader2
} from 'lucide-react';
import { where } from 'firebase/firestore';
import { useDashboard } from '@/contexts/DashboardContext';
import { School as SchoolType, Team, Person, Match } from '@/types/firestore';
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const { filters } = useDashboard();

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const schoolConstraints = [];
        if (filters.schoolId !== 'all') {
          schoolConstraints.push(where('schoolId', '==', filters.schoolId));
        }

        const matchConstraints = [];
        if (filters.seasonId !== 'all') {
          matchConstraints.push(where('seasonId', '==', filters.seasonId));
        }

        const [
          schools,
          teams,
          players,
          staffProfiles,
          medicalStaff,
          fields,
          officials,
          groundStaff,
          matches,
          vehicles
        ] = await Promise.all([
          fetchCollection<SchoolType>('schools', filters.schoolId !== 'all' ? [where('__name__', '==', filters.schoolId)] : []),
          fetchCollection<Team>('teams', schoolConstraints),
          fetchCollection<Person>('people', [where('role', '==', 'Player'), ...schoolConstraints]),
          fetchCollection<any>('staffProfiles', schoolConstraints),
          fetchCollection<Person>('people', [where('role', 'in', ['Medical', 'Trainer']), ...schoolConstraints]),
          fetchCollection<any>('fields', schoolConstraints),
          fetchCollection<Person>('people', [where('role', 'in', ['Umpire', 'Scorer'])]), 
          fetchCollection<Person>('people', [where('role', '==', 'Groundskeeper'), ...schoolConstraints]),
          fetchCollection<Match>('matches', matchConstraints),
          fetchCollection<any>('vehicles') 
        ]);

        let displayMatches = matches;
        if (filters.schoolId !== 'all') {
          const schoolTeams = new Set(teams.map((t: Team) => t.id));
          displayMatches = matches.filter((m: Match) => 
            schoolTeams.has(m.homeTeamId || '') || schoolTeams.has(m.awayTeamId || '')
          );
        }

        const statsData = [
          { icon: Trophy,     label: 'COMPETITIONS',  value: 1,                     subtitle: 'ACTIVE THIS SEASON',     color: D.amber   },
          { icon: School,     label: 'SCHOOLS',       value: schools.length,        subtitle: 'SYSTEM REGISTRY',        color: D.indigo  },
          { icon: Shield,     label: 'TEAMS',         value: teams.length,          subtitle: 'ACTIVE ROSTER',          color: D.sky     },
          { icon: Users,      label: 'PLAYERS',       value: players.length,        subtitle: 'ATHLETE DIRECTORY',      color: D.emerald },
          { icon: UserCog,    label: 'STAFF',         value: staffProfiles.length,  subtitle: 'OPS & COACHING',         color: D.cyan    },
          { icon: Heart,      label: 'MEDICAL',       value: medicalStaff.length,   subtitle: 'HEALTH & SUPPORT',       color: D.rose    },
          { icon: MapPin,     label: 'FACILITIES',    value: fields.length,         subtitle: 'MATCH SURFACES',         color: D.teal    },
          { icon: UserCheck,  label: 'OFFICIALS',     value: officials.length,      subtitle: 'VERIFIED REGULATORS',    color: D.orange  },
          { icon: Shovel,     label: 'GROUND OPS',    value: groundStaff.length,    subtitle: 'PRECISION TURF MGMT',    color: D.teal    },
          { icon: ListChecks, label: 'FIXTURES',      value: displayMatches.length, subtitle: 'SCHEDULED EVENTS',       color: D.sky     },
          { icon: Truck,      label: 'TRANSPORT',     value: vehicles.length,       subtitle: 'LOGISTICS FLEET',        color: D.lime    },
          { icon: Medal,      label: 'AWARDS',        value: 0,                     subtitle: 'HISTORY & ACHIEVEMENTS', color: D.amber   },
        ];

        setStats(statsData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        setLoading(false);
      }
    }

    loadStats();
  }, [filters]);

  if (loading) {
    return (
      <div className="space-y-10 py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: D.indigo }} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4" style={{ color: D.textMuted }}>Syncing Strategic Intelligence Hub...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        title="GLOBAL ECOSYSTEM"
        sub="Full-spectrum oversight of school sports intelligence units."
        color={D.indigo}
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
        <AnimatePresence mode="popLayout">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <MetricCard {...stat} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
