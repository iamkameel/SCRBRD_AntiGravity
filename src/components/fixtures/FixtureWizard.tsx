"use client";

import { useState, useEffect, useMemo, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { 
  createSmartFixtureAction, 
  checkFixtureConflictsAction,
  getAvailableOfficialsAction,
  getMatchupInsightsAction,
  FixtureActionState 
} from "@/app/actions/fixtureActions";
import Link from "next/link";
import { Team, Field, Person, School } from "@/types/firestore";
import { MatchupInsights } from "@/lib/matchupIntelligence";
import { D } from '@/lib/design-system';
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Save, 
  Calendar,
  MapPin,
  Users,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Trophy,
  History,
  Bus,
  ShieldAlert,
  Zap,
  Check,
  UserCheck,
  Filter,
  RotateCcw,
  Building2,
  GraduationCap,
  FilterX,
  Layers,
  Search
} from "lucide-react";
import { ConflictAlert } from "./ConflictAlert";
import { WeatherWidget } from "./WeatherWidget";
import { WinProbabilityWidget } from "@/components/analytics/WinProbabilityWidget";
import { usePermissionView, SIMULATED_ROLES, SimulatedRole } from "@/contexts/PermissionViewContext";

interface FixtureWizardProps {
  teams: Team[];
  fields: Field[];
  schools?: School[];
}

export const AGE_GROUPS = [
  { value: "ALL", label: "All Age Divisions" },
  { value: "OPEN", label: "Open Division (1st-5th XI / U17-U19)" },
  { value: "U16", label: "Under 16 (U16 Division)" },
  { value: "U15", label: "Under 15 (U15 Division)" },
  { value: "U14", label: "Under 14 (U14 Division)" },
  { value: "U13", label: "Under 13 (U13 Division)" },
];

export const TEAM_CLASSES = [
  { value: "ALL", label: "All Classes / Tiers" },
  { value: "1st XI", label: "1st XI (Open Division)" },
  { value: "2nd XI", label: "2nd XI (Open Division)" },
  { value: "3rd XI", label: "3rd XI (Open Division)" },
  { value: "4th XI", label: "4th XI (Open Division)" },
  { value: "5th XI", label: "5th XI (Open Division)" },
  { value: "A", label: "A Team (Junior U13-U16)" },
  { value: "B", label: "B Team (Junior U13-U16)" },
  { value: "C", label: "C Team (Junior U13-U16)" },
  { value: "D", label: "D Team (Junior U13-U16)" },
  { value: "E", label: "E Team (Junior U13-U16)" },
];

export interface ParsedTeamMeta {
  ageGroup: string;
  teamClass: string;
  schoolId: string;
  schoolName: string;
}

export function parseTeamMeta(team: Team, schoolsProp?: School[]): ParsedTeamMeta {
  const name = team.name || '';
  const suffix = team.suffix || '';
  const combined = `${name} ${suffix}`.trim();
  
  // 1. Age Division Rule: U17 and over all belong to OPEN division
  let ageGroup = 'OPEN';
  const juniorMatch = combined.match(/(U13|U14|U15|U16)/i);
  if (juniorMatch) {
    ageGroup = juniorMatch[1].toUpperCase();
  } else {
    // U17, U18, U19, Open, 1st-5th XI all map to OPEN division for match fixtures
    ageGroup = 'OPEN';
  }

  // 2. Team Class / Tier Rule: Open teams use 1st XI, 2nd XI, 3rd XI etc., NOT A, B, C, D
  let teamClass = 'ALL';
  if (/(1st XI|First XI)/i.test(combined)) teamClass = '1st XI';
  else if (/(2nd XI|Second XI)/i.test(combined)) teamClass = '2nd XI';
  else if (/(3rd XI|Third XI)/i.test(combined)) teamClass = '3rd XI';
  else if (/(4th XI|Fourth XI)/i.test(combined)) teamClass = '4th XI';
  else if (/(5th XI|Fifth XI)/i.test(combined)) teamClass = '5th XI';
  else {
    const classMatch = combined.match(/U\d{1,2}\s*([A-E])/i) || combined.match(/\b([A-E])\b/i);
    if (classMatch) {
      const letter = classMatch[1].toUpperCase();
      // If team is in OPEN division, map letter classes (A, B, C...) to 1st XI, 2nd XI, etc.
      if (ageGroup === 'OPEN') {
        const letterMap: Record<string, string> = { A: '1st XI', B: '2nd XI', C: '3rd XI', D: '4th XI', E: '5th XI' };
        teamClass = letterMap[letter] || '1st XI';
      } else {
        teamClass = letter;
      }
    }
  }

  // 3. School Identification
  let schoolId = team.schoolId || '';
  let schoolName = '';

  if (schoolsProp && schoolsProp.length > 0) {
    const found = schoolsProp.find(s => 
      s.id === team.schoolId || 
      name.toLowerCase().includes(s.name.toLowerCase()) || 
      (s.abbreviation && name.toLowerCase().includes(s.abbreviation.toLowerCase()))
    );
    if (found) {
      schoolId = found.id;
      schoolName = found.name;
    }
  }

  if (!schoolName) {
    const extracted = name.replace(/\s*(U\d{1,2}|1st XI|2nd XI|3rd XI|4th XI|5th XI|A|B|C|D|E).*$/i, '').trim();
    schoolName = extracted || name;
    if (!schoolId) schoolId = schoolName.toLowerCase().replace(/\s+/g, '_');
  }

  return { ageGroup, teamClass, schoolId, schoolName };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="w-full md:w-auto h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-black tracking-tight rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
      style={{ fontFamily: D.head }}
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Deploying Fixture to OS...</span>
        </>
      ) : (
        <>
          <Save className="h-5 w-5" />
          <span>Confirm & Schedule Match</span>
        </>
      )}
    </Button>
  );
}

const MATCH_FORMAT_TILES = [
  { value: 'ODI', label: '50 Overs', tag: 'Limited Overs', desc: 'Standard senior match • 50 overs per innings', defaultOvers: 50 },
  { value: 'T20', label: '20 Overs', tag: 'High Tempo', desc: 'Accelerated T20 match • 20 overs per innings', defaultOvers: 20 },
  { value: 'T10', label: '10 Overs', tag: 'Sprint Format', desc: 'Fast-paced T10 match • 10 overs per innings', defaultOvers: 10 },
  { value: 'Other', label: 'Custom', tag: 'Flexible', desc: 'Specify custom overs duration', defaultOvers: 35 },
];

const TIME_PRESETS = [
  { label: "09:30 AM", value: "09:30", desc: "Morning Start" },
  { label: "01:30 PM", value: "13:30", desc: "Early Afternoon" },
  { label: "02:00 PM", value: "14:00", desc: "Standard Afternoon" },
  { label: "04:30 PM", value: "16:30", desc: "Day/Night Session" },
];

// Helper to find the next Saturday
const getNextSaturday = () => {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return d.toISOString().split('T')[0];
};

// Helper to extract age group/tier (e.g. U14, U15, 1st XI)
const extractTier = (name: string, suffix?: string) => {
  const combined = `${name} ${suffix || ''}`.toUpperCase();
  if (combined.includes('1ST XI') || combined.includes('FIRST XI')) return '1ST XI';
  if (combined.includes('2ND XI') || combined.includes('SECOND XI')) return '2ND XI';
  
  const match = combined.match(/(U\d{2})/);
  if (match) return match[1];
  
  return 'Open';
};

export function FixtureWizard({ teams, fields, schools }: FixtureWizardProps) {
  const { currentRole, setCurrentRole } = usePermissionView();
  const ALLOWED_ROLES = [
    "System Architect",
    "Admin",
    "Sportsmaster",
    "School Admin",
    "Coach",
    "Assistant Coach",
    "Team Manager"
  ];

  const isAllowed = ALLOWED_ROLES.includes(currentRole);

  const initialState: FixtureActionState = {};
  const [state, action] = useActionState(createSmartFixtureAction, initialState);
  
  // Wizard Step
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Dynamic Filter States for Step 1
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("ALL");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedHomeSchool, setSelectedHomeSchool] = useState<string>("");
  const [selectedAwaySchool, setSelectedAwaySchool] = useState<string>("");

  // Extracted School Options
  const schoolOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; abbreviation?: string }>();
    if (schools && schools.length > 0) {
      schools.forEach(s => {
        map.set(s.id, { id: s.id, name: s.name, abbreviation: s.abbreviation });
      });
    }
    teams.forEach(t => {
      const meta = parseTeamMeta(t, schools);
      if (!map.has(meta.schoolId)) {
        map.set(meta.schoolId, { id: meta.schoolId, name: meta.schoolName, abbreviation: t.abbreviatedName });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [schools, teams]);

  // Parsed Metadata map for all teams
  const teamMetaMap = useMemo(() => {
    const map = new Map<string, ParsedTeamMeta>();
    teams.forEach(t => {
      map.set(t.id, parseTeamMeta(t, schools));
    });
    return map;
  }, [teams, schools]);

  // Filtered Home Teams
  const filteredHomeTeams = useMemo(() => {
    return teams.filter(t => {
      const meta = teamMetaMap.get(t.id);
      if (!meta) return true;

      if (selectedHomeSchool && meta.schoolId !== selectedHomeSchool) return false;
      if (selectedAgeGroup !== "ALL" && meta.ageGroup !== selectedAgeGroup) return false;
      if (selectedClass !== "ALL" && meta.teamClass !== selectedClass) return false;
      return true;
    });
  }, [teams, teamMetaMap, selectedHomeSchool, selectedAgeGroup, selectedClass]);
  
  // Form State
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:30");
  const [matchType, setMatchType] = useState("ODI");
  const [overs, setOvers] = useState(50);
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [isVenueAutoSuggested, setIsVenueAutoSuggested] = useState(false);
  const [umpireIds, setUmpireIds] = useState<string[]>([]);
  const [scorerId, setScorerId] = useState("");

  // Filtered Away Teams (excluding selected Home Team)
  const filteredAwayTeams = useMemo(() => {
    return teams.filter(t => {
      if (t.id === homeTeamId) return false;
      const meta = teamMetaMap.get(t.id);
      if (!meta) return true;

      if (selectedAwaySchool && meta.schoolId !== selectedAwaySchool) return false;
      if (selectedAgeGroup !== "ALL" && meta.ageGroup !== selectedAgeGroup) return false;
      if (selectedClass !== "ALL" && meta.teamClass !== selectedClass) return false;
      return true;
    });
  }, [teams, teamMetaMap, homeTeamId, selectedAwaySchool, selectedAgeGroup, selectedClass]);

  // Sync auto-selection when dynamic filters narrow down to a single exact team
  useEffect(() => {
    if (selectedHomeSchool && filteredHomeTeams.length === 1 && homeTeamId !== filteredHomeTeams[0].id) {
      setHomeTeamId(filteredHomeTeams[0].id);
    }
  }, [filteredHomeTeams, homeTeamId, selectedHomeSchool]);

  useEffect(() => {
    if (selectedAwaySchool && filteredAwayTeams.length === 1 && awayTeamId !== filteredAwayTeams[0].id) {
      setAwayTeamId(filteredAwayTeams[0].id);
    }
  }, [filteredAwayTeams, awayTeamId, selectedAwaySchool]);

  // Handlers for selection & filter resets
  const handleAgeGroupChange = (val: string) => {
    setSelectedAgeGroup(val);
  };

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
  };

  const handleHomeSchoolChange = (val: string) => {
    const schoolVal = val === "ALL_HOME_SCHOOLS" ? "" : val;
    setSelectedHomeSchool(schoolVal);
  };

  const handleAwaySchoolChange = (val: string) => {
    const schoolVal = val === "ALL_AWAY_SCHOOLS" ? "" : val;
    setSelectedAwaySchool(schoolVal);
  };

  const handleSelectHomeTeam = (val: string) => {
    setHomeTeamId(val);
    setAwayTeamId(""); // Reset away team when home team changes
    const meta = teamMetaMap.get(val);
    if (meta) {
      if (!selectedHomeSchool) setSelectedHomeSchool(meta.schoolId);
      if (selectedAgeGroup === "ALL" && meta.ageGroup !== "ALL") setSelectedAgeGroup(meta.ageGroup);
      if (selectedClass === "ALL" && meta.teamClass !== "ALL") setSelectedClass(meta.teamClass);
    }
  };

  const handleSelectAwayTeam = (val: string) => {
    setAwayTeamId(val);
    const meta = teamMetaMap.get(val);
    if (meta) {
      if (!selectedAwaySchool) setSelectedAwaySchool(meta.schoolId);
    }
  };

  const resetFilters = () => {
    setSelectedAgeGroup("ALL");
    setSelectedClass("ALL");
    setSelectedHomeSchool("");
    setSelectedAwaySchool("");
  };
  
  // Conflict Resolution State
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [isConflictOverridden, setIsConflictOverridden] = useState(false);

  // Dynamic Data
  const [availableOfficials, setAvailableOfficials] = useState<{ umpires: Person[]; scorers: Person[] }>({ umpires: [], scorers: [] });
  const [loadingOfficials, setLoadingOfficials] = useState(false);
  const [insights, setInsights] = useState<(MatchupInsights & { transportSuggestion?: string }) | null>(null);

  // Set smart default date on mount
  useEffect(() => {
    if (!date) {
      setDate(getNextSaturday());
    }
  }, [date]);

  // Derived Values
  const homeTeam = useMemo(() => teams.find(t => t.id === homeTeamId), [teams, homeTeamId]);
  const awayTeam = useMemo(() => teams.find(t => t.id === awayTeamId), [teams, awayTeamId]);
  const venue = useMemo(() => fields.find(f => f.id === venueId), [fields, venueId]);

  // Preset Date Options
  const presetDates = useMemo(() => {
    const today = new Date();
    const nextSat = new Date(today);
    nextSat.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));
    
    const inTwoSat = new Date(nextSat);
    inTwoSat.setDate(nextSat.getDate() + 7);

    const nextWed = new Date(today);
    nextWed.setDate(today.getDate() + ((3 - today.getDay() + 7) % 7 || 7));

    return [
      { label: 'Next Sat', detail: nextSat.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }), val: nextSat.toISOString().split('T')[0] },
      { label: 'In 2 Weeks', detail: inTwoSat.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }), val: inTwoSat.toISOString().split('T')[0] },
      { label: 'Mid-Week Wed', detail: nextWed.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }), val: nextWed.toISOString().split('T')[0] },
    ];
  }, []);
  
  // Smart Match Format & Time based on Home Team level
  useEffect(() => {
    if (homeTeam) {
      const tier = extractTier(homeTeam.name, homeTeam.suffix);
      if (tier === '1ST XI' || tier === '2ND XI' || tier === 'Open') {
        setMatchType('ODI');
        setOvers(50);
        setTime('09:30');
      } else {
        setMatchType('T20');
        setOvers(20);
        setTime('14:00');
      }
    }
  }, [homeTeam]);

  // Intelligent Away Team filtering (prioritize same tier)
  const groupedAwayTeams = useMemo(() => {
    if (!homeTeam) return { matching: [], other: teams };
    
    const homeTier = extractTier(homeTeam.name, homeTeam.suffix);
    const matching: Team[] = [];
    const other: Team[] = [];
    
    teams.forEach(t => {
      if (t.id === homeTeam.id) return;
      const awayTier = extractTier(t.name, t.suffix);
      if (awayTier === homeTier) {
        matching.push(t);
      } else {
        other.push(t);
      }
    });
    
    return { matching, other };
  }, [teams, homeTeam]);

  // Auto-suggest venue based on home team's school
  useEffect(() => {
    if (homeTeam && !venueId) {
      const homeVenue = fields.find(f => f.schoolId === homeTeam.schoolId);
      if (homeVenue) {
        setVenueId(homeVenue.id);
        setIsVenueAutoSuggested(true);
      }
    } else if (!homeTeam) {
        setIsVenueAutoSuggested(false);
    }
  }, [homeTeam, venueId, fields]);

  // Clear auto-suggest flag if manual change occurs
  const handleVenueChange = (val: string) => {
      setVenueId(val);
      setIsVenueAutoSuggested(false);
      setIsConflictOverridden(false);
  };

  // Check conflicts when relevant fields change
  useEffect(() => {
    if (date && time && venueId && homeTeamId && awayTeamId) {
      setCheckingConflicts(true);
      checkFixtureConflictsAction(date, time, venueId, homeTeamId, awayTeamId)
        .then(result => {
          setConflicts(result.conflicts);
          if (result.conflicts.length === 0) {
            setIsConflictOverridden(false);
          }
        })
        .finally(() => setCheckingConflicts(false));
    } else {
      setConflicts([]);
    }
  }, [date, time, venueId, homeTeamId, awayTeamId]);

  // Conflict Resolution Action Handlers
  const handleAutoSelectVenue = () => {
    const alternativeField = fields.find(f => f.id !== venueId);
    if (alternativeField) {
      setVenueId(alternativeField.id);
      setIsVenueAutoSuggested(false);
      setIsConflictOverridden(false);
    }
  };

  const handleShiftTime = () => {
    // Shift time by +2 hours
    const [hours, minutes] = time.split(':').map(Number);
    const newHours = (hours + 2) % 24;
    const formatted = `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    setTime(formatted);
    setIsConflictOverridden(false);
  };

  const handleToggleOverride = () => {
    setIsConflictOverridden(prev => !prev);
  };

  // Load available officials when date/time changes
  useEffect(() => {
    if (date && time) {
      setLoadingOfficials(true);
      getAvailableOfficialsAction(date, time)
        .then(setAvailableOfficials)
        .finally(() => setLoadingOfficials(false));
    }
  }, [date, time]);

  // Update overs based on match type
  const handleFormatSelect = (fmtVal: string) => {
    setMatchType(fmtVal);
    const tile = MATCH_FORMAT_TILES.find(t => t.value === fmtVal);
    if (tile) {
      setOvers(tile.defaultOvers);
    }
  };

  // Fetch OS Intelligence (H2H, Grounds, Transport)
  useEffect(() => {
    if (homeTeamId && awayTeamId) {
      getMatchupInsightsAction(homeTeamId, awayTeamId, venueId || undefined)
        .then(setInsights);
    } else {
      setInsights(null);
    }
  }, [homeTeamId, awayTeamId, venueId]);

  const canProceed = (currentStep: number) => {
    switch (currentStep) {
      case 1: return Boolean(homeTeamId && awayTeamId && homeTeamId !== awayTeamId);
      case 2: return Boolean(date && time && matchType);
      case 3: return Boolean(venueId && (conflicts.length === 0 || isConflictOverridden));
      case 4: return true;
      default: return false;
    }
  };

  const STEP_TITLES = [
    { title: "Lineup", icon: Users, desc: "Teams & Division" },
    { title: "Schedule", icon: Calendar, desc: "Date, Time & Format" },
    { title: "Venue", icon: MapPin, desc: "Field & Conflicts" },
    { title: "Staffing", icon: Shield, desc: "Umpires & Scorers" },
  ];

  // ACCESS RESTRICTED ROLE SCREEN WITH ONE-CLICK ROLE SWITCHER
  if (!isAllowed) {
    return (
      <Card className="max-w-2xl mx-auto border-red-500/30 bg-[rgba(10,14,28,0.85)] backdrop-blur-xl shadow-2xl overflow-hidden sh-fade-in">
        <div className="h-2 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />
        <CardContent className="pt-10 pb-10 px-8 text-center space-y-6">
          <div className="h-20 w-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 animate-pulse">
            <ShieldAlert className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white" style={{ fontFamily: D.head }}>
              Access Restricted: External Role
            </h3>
            <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
              Your active permission role (<strong className="text-red-400">{currentRole}</strong>) does not have administrative access to schedule matches into SCRBRD OS.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 max-w-md mx-auto space-y-3">
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest" style={{ fontFamily: D.mono }}>
              Select Admin Role to Continue
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                type="button"
                onClick={() => setCurrentRole("System Architect")}
                className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Switch to System Architect
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentRole("Sportsmaster")}
                className="h-10 px-4 bg-white/5 border-white/15 hover:bg-white/10 text-white font-bold text-xs rounded-xl flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4 text-emerald-400" />
                Switch to Sportsmaster
              </Button>
            </div>
          </div>

          <p className="text-[11px] text-white/30 italic">
            Role changes affect the simulated UI state instantly for testing and match operations.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (state.success) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center sh-fade-in">
        <div className="mb-8 flex justify-center">
          <div className="h-28 w-28 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center animate-bounce-subtle shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 className="h-16 w-16 text-emerald-400" />
          </div>
        </div>
        
        <Badge variant="outline" className="mb-4 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 uppercase tracking-widest px-4 py-1 font-bold">
          <Zap className="h-3.5 w-3.5 mr-1.5" /> Fixture Synchronized to SCRBRD OS
        </Badge>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter" style={{ fontFamily: D.head }}>
          Match Successfully Scheduled
        </h1>
        <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
          The fixture between <strong className="text-white font-black">{homeTeam?.name}</strong> and <strong className="text-white font-black">{awayTeam?.name}</strong> has been logged into the school cricket ecosystem.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <Link href={`/matches/${state.matchId}`} className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-primary/20 hover:border-primary/40 transition-all text-left">
                <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ArrowRight className="h-5 w-5" />
                </div>
                <p className="font-bold text-white mb-1">Match Center</p>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Live Scoring & Intel</p>
            </Link>

            <Link href={`/teams/${homeTeamId}`} className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all text-left">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5" />
                </div>
                <p className="font-bold text-white mb-1">Squad Selection</p>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Open Team Sheets</p>
            </Link>

            <Link href="/transport" className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all text-left">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Bus className="h-5 w-5" />
                </div>
                <p className="font-bold text-white mb-1">Book Transport</p>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Fleet Logistics</p>
            </Link>

            <Link href="/fields" className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all text-left">
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="h-5 w-5" />
                </div>
                <p className="font-bold text-white mb-1">Ground Prep</p>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Facility Operations</p>
            </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="outline" className="h-12 px-8 rounded-xl border-white/10 text-white hover:bg-white/5 font-bold" onClick={() => window.location.reload()}>
                Schedule Another Match
            </Button>
            <Link href="/fixtures">
                <Button className="h-12 px-8 rounded-xl bg-white text-black hover:bg-white/90 font-bold">
                    View All Fixtures
                </Button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sh-fade-in">
      {/* LEFT: Interactive Wizard Steps (8 Cols) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Interactive Progress Header Tabs */}
        <div className="bg-[rgba(10,14,28,0.7)] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STEP_TITLES.map((st, i) => {
              const StepIcon = st.icon;
              const isCompleted = step > i + 1;
              const isActive = step === i + 1;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => isCompleted && setStep(i + 1)}
                  disabled={!isCompleted && !isActive}
                  className={cn(
                    "flex flex-col p-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden",
                    isActive ? "bg-primary/15 border-primary/40 text-white shadow-lg shadow-primary/10 ring-1 ring-primary/20" :
                    isCompleted ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/15 cursor-pointer" :
                    "bg-white/[0.02] border-white/5 text-white/30 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded",
                      isActive ? "bg-primary text-primary-foreground" :
                      isCompleted ? "bg-emerald-500 text-white" :
                      "bg-white/10 text-white/40"
                    )}>
                      {isCompleted ? <Check className="h-3 w-3 stroke-[3]" /> : `0${i + 1}`}
                    </span>
                    <StepIcon className={cn(
                      "h-4 w-4",
                      isActive ? "text-primary animate-pulse" :
                      isCompleted ? "text-emerald-400" :
                      "text-white/20"
                    )} />
                  </div>
                  <span className="font-bold text-sm leading-tight text-white" style={{ fontFamily: D.head }}>{st.title}</span>
                  <span className="text-[10px] opacity-60 truncate mt-0.5">{st.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Progress Bar */}
          <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary via-cyan-400 to-emerald-400 transition-all duration-500 ease-out" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <form action={action} className="space-y-6">
          {/* Hidden Form Inputs */}
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="time" value={time} />
          <input type="hidden" name="matchType" value={matchType} />
          <input type="hidden" name="overs" value={overs} />
          <input type="hidden" name="homeTeamId" value={homeTeamId} />
          <input type="hidden" name="awayTeamId" value={awayTeamId} />
          <input type="hidden" name="venueId" value={venueId} />
          <input type="hidden" name="umpireIds" value={umpireIds.join(',')} />
          <input type="hidden" name="scorerId" value={scorerId} />
          <input type="hidden" name="homeTeamName" value={homeTeam?.name || ''} />
          <input type="hidden" name="awayTeamName" value={awayTeam?.name || ''} />
          <input type="hidden" name="overrideConflicts" value={isConflictOverridden ? "true" : "false"} />

          {/* STEP 1: Lineup Configuration with Dynamic Division Filtering */}
          {step === 1 && (
            <Card className="bg-[rgba(10,14,28,0.7)] backdrop-blur-xl border-white/[0.08] shadow-2xl sh-slide-up">
              <CardHeader className="pb-4 border-b border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-white" style={{ fontFamily: D.head }}>
                      <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/20 text-primary">
                        <Users className="h-5 w-5" />
                      </div>
                      Lineup & Division Intelligence
                    </CardTitle>
                    <CardDescription className="text-white/60 mt-1">
                      Filter by Age Division, Team Class, Home School & Opponent School to dynamically match teams.
                    </CardDescription>
                  </div>
                  
                  {(selectedAgeGroup !== "ALL" || selectedClass !== "ALL" || selectedHomeSchool || selectedAwaySchool) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetFilters}
                      className="h-8 bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset Filters
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 p-6">
                
                {/* Dynamic Filter Controls Panel */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400" style={{ fontFamily: D.head }}>
                      <Filter className="h-4 w-4" />
                      Dynamic Matchup Filters
                    </div>
                    
                    <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-300 text-[10px] font-mono">
                      {filteredHomeTeams.length} Home / {filteredAwayTeams.length} Away Teams
                    </Badge>
                  </div>

                  {/* 4 Prompt Selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* 1. Age Division Prompt */}
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5" style={{ fontFamily: D.head }}>
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        1. Age Division
                      </Label>
                      <Select value={selectedAgeGroup} onValueChange={handleAgeGroupChange}>
                        <SelectTrigger className="h-11 bg-white/[0.04] border-white/10 text-white rounded-xl focus:ring-primary/40 text-sm">
                          <SelectValue placeholder="Select Age Division" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0e1c] border-white/10 text-white">
                          {AGE_GROUPS.map(ag => (
                            <SelectItem key={ag.value} value={ag.value} className="focus:bg-primary/20">
                              {ag.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 2. Team Class Prompt */}
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5" style={{ fontFamily: D.head }}>
                        <Trophy className="h-3.5 w-3.5 text-emerald-400" />
                        2. Team Class / Tier
                      </Label>
                      <Select value={selectedClass} onValueChange={handleClassChange}>
                        <SelectTrigger className="h-11 bg-white/[0.04] border-white/10 text-white rounded-xl focus:ring-emerald-500/40 text-sm">
                          <SelectValue placeholder="Select Team Class" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0e1c] border-white/10 text-white">
                          {TEAM_CLASSES.map(tc => (
                            <SelectItem key={tc.value} value={tc.value} className="focus:bg-emerald-500/20">
                              {tc.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 3. Home School Prompt */}
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5" style={{ fontFamily: D.head }}>
                        <Building2 className="h-3.5 w-3.5 text-amber-400" />
                        3. Home School
                      </Label>
                      <Select value={selectedHomeSchool || "ALL_HOME_SCHOOLS"} onValueChange={handleHomeSchoolChange}>
                        <SelectTrigger className="h-11 bg-white/[0.04] border-white/10 text-white rounded-xl focus:ring-amber-500/40 text-sm">
                          <SelectValue placeholder="All Home Schools" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0e1c] border-white/10 text-white max-h-60">
                          <SelectItem value="ALL_HOME_SCHOOLS" className="focus:bg-amber-500/20 font-medium text-white/70">
                            All Home Schools
                          </SelectItem>
                          {schoolOptions.map(s => (
                            <SelectItem key={s.id} value={s.id} className="focus:bg-amber-500/20">
                              {s.name} {s.abbreviation ? `(${s.abbreviation})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 4. Away School Prompt */}
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5" style={{ fontFamily: D.head }}>
                        <GraduationCap className="h-3.5 w-3.5 text-purple-400" />
                        4. Opponent School
                      </Label>
                      <Select value={selectedAwaySchool || "ALL_AWAY_SCHOOLS"} onValueChange={handleAwaySchoolChange}>
                        <SelectTrigger className="h-11 bg-white/[0.04] border-white/10 text-white rounded-xl focus:ring-purple-500/40 text-sm">
                          <SelectValue placeholder="All Opponent Schools" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0e1c] border-white/10 text-white max-h-60">
                          <SelectItem value="ALL_AWAY_SCHOOLS" className="focus:bg-purple-500/20 font-medium text-white/70">
                            All Opponent Schools
                          </SelectItem>
                          {schoolOptions.filter(s => s.id !== selectedHomeSchool).map(s => (
                            <SelectItem key={s.id} value={s.id} className="focus:bg-purple-500/20">
                              {s.name} {s.abbreviation ? `(${s.abbreviation})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  </div>

                  {/* Quick Filter Pill Shortcuts */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider mr-1">Quick Age:</span>
                    {["U13", "U14", "U15", "U16", "OPEN"].map(ag => (
                      <button
                        key={ag}
                        type="button"
                        onClick={() => handleAgeGroupChange(ag)}
                        className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-bold transition-all border",
                          selectedAgeGroup === ag
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        )}
                      >
                        {ag === "OPEN" ? "Open" : ag}
                      </button>
                    ))}

                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider ml-3 mr-1">Quick Class:</span>
                    {["1st XI", "2nd XI", "A", "B", "C"].map(tc => (
                      <button
                        key={tc}
                        type="button"
                        onClick={() => handleClassChange(tc)}
                        className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-bold transition-all border",
                          selectedClass === tc
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        )}
                      >
                        {tc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team Selection Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Home Team Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-white/60" style={{ fontFamily: D.head }}>
                        Home Institution Team *
                      </Label>
                      {homeTeam && (
                        <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-bold">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {extractTier(homeTeam.name, homeTeam.suffix)} Tier Detected
                        </Badge>
                      )}
                    </div>
                    <Select value={homeTeamId} onValueChange={handleSelectHomeTeam}>
                      <SelectTrigger className="h-14 bg-white/[0.03] border-white/10 text-white rounded-xl focus:ring-primary/40 focus:border-primary text-base font-medium">
                        <SelectValue placeholder="Select Home Team" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0e1c] border-white/10 text-white max-h-72">
                        {filteredHomeTeams.length === 0 ? (
                          <div className="p-4 text-center text-xs text-white/40">
                            No home teams match the active filters
                          </div>
                        ) : (
                          filteredHomeTeams.map(team => (
                            <SelectItem key={team.id} value={team.id} className="focus:bg-primary/20 focus:text-white py-3">
                              <div className="flex items-center gap-3">
                                {team.abbreviatedName && (
                                  <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-white/70">{team.abbreviatedName}</span>
                                )}
                                <span className="font-bold">{team.name}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Away Team Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-white/60" style={{ fontFamily: D.head }}>
                        Opponent Team *
                      </Label>
                      {homeTeam && (
                        <span className="text-[11px] text-white/40">
                          Matching <strong className="text-emerald-400">{extractTier(homeTeam.name, homeTeam.suffix)}</strong>
                        </span>
                      )}
                    </div>

                    <Select value={awayTeamId} onValueChange={handleSelectAwayTeam} disabled={!homeTeamId && filteredAwayTeams.length === 0}>
                      <SelectTrigger className={cn(
                        "h-14 bg-white/[0.03] border-white/10 text-white rounded-xl text-base font-medium transition-all",
                        !homeTeamId && filteredAwayTeams.length === 0 ? "opacity-50 cursor-not-allowed" : "focus:ring-primary/40 focus:border-primary"
                      )}>
                        <SelectValue placeholder={!homeTeamId && !selectedAwaySchool ? "Select Home Team First or Pick Opponent School" : "Select Opponent Team"} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0e1c] border-white/10 text-white max-h-72">
                        {filteredAwayTeams.length === 0 ? (
                          <div className="p-4 text-center text-xs text-white/40">
                            No opponent teams match the active filters
                          </div>
                        ) : (
                          filteredAwayTeams.map(team => (
                            <SelectItem key={team.id} value={team.id} className="focus:bg-emerald-500/20 focus:text-white py-2.5">
                              <div className="flex items-center gap-3">
                                {team.abbreviatedName && (
                                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono">{team.abbreviatedName}</span>
                                )}
                                <span className="font-bold">{team.name}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Matchup Summary Pill */}
                {homeTeam && awayTeam && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-emerald-500/10 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-black text-primary text-xs" style={{ fontFamily: D.head }}>
                        VS
                      </div>
                      <div>
                        <p className="text-xs text-white/50 uppercase font-bold tracking-wider">Confirmed Fixture Pair</p>
                        <p className="text-sm font-black text-white" style={{ fontFamily: D.head }}>
                          {homeTeam.name} <span className="text-white/40 font-normal">vs</span> {awayTeam.name}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
                      {extractTier(homeTeam.name, homeTeam.suffix)} MATCHUP READY
                    </Badge>
                  </div>
                )}

              </CardContent>
            </Card>
          )}

          {/* STEP 2: Temporal Parameters & Format */}
          {step === 2 && (
            <Card className="bg-[rgba(10,14,28,0.7)] backdrop-blur-xl border-white/[0.08] shadow-2xl sh-slide-up">
              <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-white" style={{ fontFamily: D.head }}>
                  <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/20 text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  Temporal Parameters & Format
                </CardTitle>
                <CardDescription className="text-white/60">
                  Set match date, start time, and overs format. Quick selector presets derived from school fixture schedules.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 p-6">
                
                {/* Date Picker & Presets */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/60" style={{ fontFamily: D.head }}>
                    Match Date *
                  </Label>

                  {/* Preset Pills */}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {presetDates.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setDate(p.val)}
                        className={cn(
                          "p-2.5 rounded-xl border text-center transition-all duration-200",
                          date === p.val 
                            ? "bg-primary/20 border-primary text-white shadow-lg shadow-primary/20" 
                            : "bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/5"
                        )}
                      >
                        <p className="text-xs font-bold text-white">{p.label}</p>
                        <p className="text-[10px] opacity-60">{p.detail}</p>
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Input 
                      className="h-14 bg-white/[0.03] border-white/10 text-white rounded-xl focus:ring-primary/40 focus:border-primary pl-11 text-base font-medium"
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                  </div>
                </div>

                {/* Commencement Time & Presets */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/60" style={{ fontFamily: D.head }}>
                    Commencement Time *
                  </Label>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                    {TIME_PRESETS.map((tp, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setTime(tp.value)}
                        className={cn(
                          "p-2.5 rounded-xl border text-center transition-all duration-200",
                          time === tp.value
                            ? "bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20"
                            : "bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/5"
                        )}
                      >
                        <p className="text-xs font-bold text-white">{tp.label}</p>
                        <p className="text-[10px] opacity-60">{tp.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Input 
                      className="h-14 bg-white/[0.03] border-white/10 text-white rounded-xl focus:ring-primary/40 focus:border-primary pl-11 text-base font-medium"
                      type="time" 
                      value={time} 
                      onChange={(e) => setTime(e.target.value)} 
                      required
                    />
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                  </div>
                </div>

                {/* Match Format Tiles */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/60" style={{ fontFamily: D.head }}>
                    Engagement Format & Overs *
                  </Label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {MATCH_FORMAT_TILES.map(fmt => (
                      <button
                        key={fmt.value}
                        type="button"
                        onClick={() => handleFormatSelect(fmt.value)}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between",
                          matchType === fmt.value
                            ? "bg-primary/20 border-primary text-white ring-1 ring-primary/40 shadow-lg shadow-primary/20"
                            : "bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-base" style={{ fontFamily: D.head }}>{fmt.label}</span>
                          <Badge variant="outline" className={cn(
                            "text-[10px] uppercase font-bold",
                            matchType === fmt.value ? "bg-primary text-primary-foreground border-0" : "bg-white/5 border-white/10 text-white/50"
                          )}>
                            {fmt.tag}
                          </Badge>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">{fmt.desc}</p>
                      </button>
                    ))}
                  </div>

                  {matchType === 'Other' && (
                    <div className="pt-2 space-y-2">
                      <Label className="text-xs font-bold text-white/50">Custom Duration (Overs)</Label>
                      <Input 
                        className="h-12 bg-white/[0.03] border-white/10 text-white rounded-xl focus:ring-primary/40"
                        type="number" 
                        value={overs} 
                        onChange={(e) => setOvers(Number(e.target.value))} 
                        min={1}
                        max={100}
                      />
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          )}

          {/* STEP 3: Venue & Geospatial */}
          {step === 3 && (
            <Card className="bg-[rgba(10,14,28,0.7)] backdrop-blur-xl border-white/[0.08] shadow-2xl sh-slide-up">
              <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-white" style={{ fontFamily: D.head }}>
                  <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/20 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  Geospatial & Field Allocation
                </CardTitle>
                <CardDescription className="text-white/60">
                  Assign ground venue. SCRBRD OS will verify field availability and flag scheduling conflicts in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 p-6">
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider text-white/60" style={{ fontFamily: D.head }}>
                      Assigned Match Field / Pitch *
                    </Label>
                    {isVenueAutoSuggested && (
                      <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-400 text-[10px] font-bold">
                        <Sparkles className="h-3 w-3 mr-1" /> Home Ground Auto-Selected
                      </Badge>
                    )}
                  </div>

                  <Select value={venueId} onValueChange={handleVenueChange}>
                    <SelectTrigger className={cn(
                      "h-14 bg-white/[0.03] border-white/10 text-white rounded-xl text-base font-medium transition-all",
                      isVenueAutoSuggested ? "border-amber-500/40 ring-1 ring-amber-500/20" : "focus:ring-primary/40 focus:border-primary"
                    )}>
                      <SelectValue placeholder="Select Venue" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0e1c] border-white/10 text-white max-h-72">
                      {fields.map(field => (
                        <SelectItem key={field.id} value={field.id} className="focus:bg-white/10 focus:text-white py-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-white">{field.name}</span>
                            {field.location && <span className="text-[10px] text-white/40 mt-0.5">{field.location}</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Real-time Conflict Engine Status */}
                {checkingConflicts ? (
                  <div className="flex justify-center p-8 bg-white/[0.02] rounded-2xl border border-white/10 border-dashed">
                    <div className="flex flex-col items-center gap-3 text-primary">
                      <div className="relative">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-primary/20 animate-ping" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Scanning Grid for Conflicts...</p>
                    </div>
                  </div>
                ) : (
                  <ConflictAlert 
                    conflicts={conflicts} 
                    isOverridden={isConflictOverridden}
                    onOverride={handleToggleOverride}
                    onAutoSelectVenue={handleAutoSelectVenue}
                    onShiftTime={handleShiftTime}
                  />
                )}

              </CardContent>
            </Card>
          )}

          {/* STEP 4: Staffing & Officials */}
          {step === 4 && (
            <Card className="bg-[rgba(10,14,28,0.7)] backdrop-blur-xl border-white/[0.08] shadow-2xl sh-slide-up">
              <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-white" style={{ fontFamily: D.head }}>
                  <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/20 text-primary">
                    <Shield className="h-5 w-5" />
                  </div>
                  Operational Staffing
                </CardTitle>
                <CardDescription className="text-white/60">
                  Assign umpires and match scorers. Officials will be notified automatically upon fixture deployment.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 p-6">
                
                {loadingOfficials ? (
                  <div className="flex flex-col items-center justify-center p-12 text-white/40 gap-3 bg-white/[0.02] rounded-2xl border border-white/5 border-dashed">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Checking Official Availability...</p>
                  </div>
                ) : (
                  <>
                    {/* Umpires Pool */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold uppercase tracking-wider text-white/60" style={{ fontFamily: D.head }}>
                          Certified Umpire Pool (Max 2)
                        </Label>
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 text-[10px] font-mono">
                          {umpireIds.length}/2 Selected
                        </Badge>
                      </div>

                      {availableOfficials.umpires.length === 0 ? (
                        <div className="p-6 border border-white/10 rounded-xl border-dashed bg-white/[0.02] text-center text-sm text-white/40">
                          No certified umpires registered or available for this timeslot.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {availableOfficials.umpires.map(umpire => {
                            const isSelected = umpireIds.includes(umpire.id);
                            return (
                              <button
                                key={umpire.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setUmpireIds(umpireIds.filter(id => id !== umpire.id));
                                  } else if (umpireIds.length < 2) {
                                    setUmpireIds([...umpireIds, umpire.id]);
                                  }
                                }}
                                className={cn(
                                  "p-3.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between",
                                  isSelected 
                                    ? "bg-primary/20 border-primary text-white ring-1 ring-primary/40" 
                                    : "bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/5"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs",
                                    isSelected ? "bg-primary text-white" : "bg-white/10 text-white/60"
                                  )}>
                                    {umpire.firstName[0]}{umpire.lastName[0]}
                                  </div>
                                  <div>
                                    <p className="font-bold text-white text-sm">{umpire.firstName} {umpire.lastName}</p>
                                    <p className="text-[10px] text-white/40 uppercase">Certified Umpire</p>
                                  </div>
                                </div>
                                {isSelected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Scorer Selection */}
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-wider text-white/60" style={{ fontFamily: D.head }}>
                        Primary Official Scorer
                      </Label>
                      <Select value={scorerId} onValueChange={setScorerId}>
                        <SelectTrigger className="h-14 bg-white/[0.03] border-white/10 text-white rounded-xl text-base font-medium">
                          <SelectValue placeholder="Select Official Scorer (Optional)" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0e1c] border-white/10 text-white">
                          <SelectItem value="unassigned" className="text-white/40 italic py-2.5">Leave Unassigned</SelectItem>
                          {availableOfficials.scorers.map(scorer => (
                            <SelectItem key={scorer.id} value={scorer.id} className="focus:bg-white/10 focus:text-white py-2.5">
                              <span className="font-bold">{scorer.firstName} {scorer.lastName}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

              </CardContent>
            </Card>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <Button 
              type="button" 
              variant="outline" 
              className="px-6 h-12 bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl transition-all font-bold"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Phase
            </Button>
            
            {step < totalSteps ? (
              <Button 
                type="button" 
                className="px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black tracking-tight rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed(step)}
                style={{ fontFamily: D.head }}
              >
                <span>Proceed to {STEP_TITLES[step].title}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <SubmitButton />
            )}
          </div>

          {state.error && (
            <div className="mt-4">
              {state.conflicts && state.conflicts.length > 0 ? (
                <ConflictAlert 
                  conflicts={state.conflicts} 
                  isOverridden={isConflictOverridden}
                  onOverride={handleToggleOverride}
                />
              ) : (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-bold">{state.error}</p>
                    <p className="text-xs text-red-400/70 mt-0.5">Please verify permissions or match parameters before resubmitting.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* RIGHT: Match Dossier & Intelligence (4 Cols) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Weather Intelligence Widget */}
        <WeatherWidget date={date} location={venue?.location || venue?.name} />

        {/* Live Match Dossier Preview */}
        <Card className="bg-[rgba(10,14,28,0.7)] backdrop-blur-xl border border-white/[0.08] shadow-2xl overflow-hidden relative sh-fade-in">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-emerald-400" />
          
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center justify-between" style={{ fontFamily: D.mono }}>
              <span>Live Match Dossier</span>
              {homeTeam && awayTeam && (
                <span className="text-primary font-bold">{extractTier(homeTeam.name, homeTeam.suffix)}</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            
            {/* Matchup Teams Banner */}
            {homeTeam && awayTeam ? (
              <div className="text-center bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                <p className="font-black text-xl text-white tracking-tight" style={{ fontFamily: D.head }}>{homeTeam.name}</p>
                <div className="my-3 flex items-center justify-center gap-3">
                  <div className="h-[1px] flex-1 bg-white/10" />
                  <span className="text-primary text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 border border-primary/20">VS</span>
                  <div className="h-[1px] flex-1 bg-white/10" />
                </div>
                <p className="font-black text-xl text-white tracking-tight" style={{ fontFamily: D.head }}>{awayTeam.name}</p>
              </div>
            ) : (
              <div className="h-32 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center">
                <p className="text-center text-white/30 text-xs font-bold tracking-wider px-6 uppercase" style={{ fontFamily: D.head }}>
                  Select teams to generate matchup dossier
                </p>
              </div>
            )}

            {/* Match Schedule & Venue Summary */}
            <div className="space-y-3">
              {date && time && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-white/40 tracking-wider">Schedule</p>
                    <p className="font-bold text-white text-xs">
                      {new Date(`${date}T${time}`).toLocaleString('en-ZA', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {venue && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="h-9 w-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase text-white/40 tracking-wider">Venue</p>
                    <p className="font-bold text-white text-xs truncate">{venue.name}</p>
                  </div>
                </div>
              )}

              {matchType && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-white/40 font-black uppercase tracking-wider">Format</span>
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-0 font-bold text-xs px-2.5 py-0.5">
                    {matchType} • {overs} Overs
                  </Badge>
                </div>
              )}
            </div>

          </CardContent>
        </Card>

        {/* Win Probability Widget */}
        {homeTeam && awayTeam && (
          <WinProbabilityWidget 
            homeTeamId={homeTeam.id} 
            awayTeamId={awayTeam.id}
            homeTeamName={homeTeam.name}
            awayTeamName={awayTeam.name}
          />
        )}

        {/* Head-to-Head Intel */}
        {insights?.h2h && (
          <Card className="bg-[rgba(10,14,28,0.7)] backdrop-blur-xl border border-white/[0.08] shadow-2xl overflow-hidden">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                <History className="h-3.5 w-3.5 text-primary" />
                H2H Historical Record
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="flex justify-between items-center text-center">
                <div className="flex-1">
                  <p className="text-2xl font-black text-primary">{insights.h2h.homeWins}</p>
                  <p className="text-[10px] uppercase text-white/50 font-bold">{homeTeam?.abbreviatedName || 'HOME'}</p>
                </div>
                <div className="px-4 border-l border-r border-white/10">
                  <p className="text-lg font-bold text-white/60">{insights.h2h.draws}</p>
                  <p className="text-[10px] uppercase text-white/40">Draws</p>
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-black text-amber-400">{insights.h2h.awayWins}</p>
                  <p className="text-[10px] uppercase text-white/50 font-bold">{awayTeam?.abbreviatedName || 'AWAY'}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <Badge variant="outline" className={cn(
                  "text-[10px] uppercase font-bold tracking-wider px-3 py-1",
                  insights.rivalryLevel === 'Fierce' ? 'border-red-500/40 text-red-400 bg-red-500/10' :
                  insights.rivalryLevel === 'Competitive' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' :
                  'border-cyan-500/40 text-cyan-400 bg-cyan-500/10'
                )}>
                  <Trophy className="h-3 w-3 mr-1.5" />
                  {insights.rivalryLevel} Rivalry Matchup
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
