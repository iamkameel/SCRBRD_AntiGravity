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
import { Team, Field, Person } from "@/types/firestore";

import { MatchupInsights } from "@/lib/matchupIntelligence";
import { D, GlobalStyles } from "@/lib/scoring/theme";
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
  Info
} from "lucide-react";
import { ConflictAlert } from "./ConflictAlert";
import { WeatherWidget } from "./WeatherWidget";
import { WinProbabilityWidget } from "@/components/analytics/WinProbabilityWidget";
import { usePermissionView } from "@/contexts/PermissionViewContext";
import { ShieldAlert } from "lucide-react";

interface FixtureWizardProps {
  teams: Team[];
  fields: Field[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Scheduling...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Schedule Match
        </>
      )}
    </Button>
  );
}

const MATCH_TYPES = [
  { value: 'T20', label: 'T20 (20 overs)' },
  { value: 'ODI', label: 'Limited Overs (50 overs)' },
  { value: 'T10', label: 'T10 (10 overs)' },
  { value: 'Other', label: 'Custom' },
];

// Helper to find the next Saturday
const getNextSaturday = () => {
  const d = new Date();
  d.setDate(d.getDate() + (6 - d.getDay() + 1 + 7) % 7);
  // Ensure we don't return today if it's already Saturday, return next week
  if (d.getDay() === 6 && d.getDate() === new Date().getDate()) {
    d.setDate(d.getDate() + 7);
  }
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

export function FixtureWizard({ teams, fields }: FixtureWizardProps) {
  const { currentRole } = usePermissionView();
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
  
  // Form State
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:30"); // Default morning start
  const [matchType, setMatchType] = useState("ODI"); // Default to 50 overs
  const [overs, setOvers] = useState(50);
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [isVenueAutoSuggested, setIsVenueAutoSuggested] = useState(false);
  const [umpireIds, setUmpireIds] = useState<string[]>([]);
  const [scorerId, setScorerId] = useState("");
  
  // Dynamic Data
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [availableOfficials, setAvailableOfficials] = useState<{ umpires: Person[]; scorers: Person[] }>({ umpires: [], scorers: [] });
  const [loadingOfficials, setLoadingOfficials] = useState(false);
  const [insights, setInsights] = useState<(MatchupInsights & { transportSuggestion?: string }) | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);


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
  
  // Smart Match Format & Time based on Home Team level
  useEffect(() => {
    if (homeTeam) {
      const tier = extractTier(homeTeam.name, homeTeam.suffix);
      if (tier === '1ST XI' || tier === '2ND XI' || tier === 'Open') {
        setMatchType('ODI');
        setOvers(50);
        setTime('09:30'); // Typical open/seniors start
      } else {
        // e.g. U14, U15 default to shorter format
        setMatchType('T20');
        setOvers(20);
        setTime('14:00'); // Typical afternoon start
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
      if (t.id === homeTeam.id) return; // Exclude home team completely
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
  }

  // Check conflicts when relevant fields change
  useEffect(() => {
    if (date && time && venueId && homeTeamId && awayTeamId) {
      setCheckingConflicts(true);
      checkFixtureConflictsAction(date, time, venueId, homeTeamId, awayTeamId)
        .then(result => setConflicts(result.conflicts))
        .finally(() => setCheckingConflicts(false));
    } else {
      setConflicts([]);
    }
  }, [date, time, venueId, homeTeamId, awayTeamId]);

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
  useEffect(() => {
    // Only auto-update if they select a predefined type, otherwise leave manual input alone
    switch (matchType) {
      case 'T20': setOvers(20); break;
      case 'ODI': setOvers(50); break;
      case 'T10': setOvers(10); break;
    }
  }, [matchType]);

  // Fetch OS Intelligence (H2H, Grounds, Transport)
  useEffect(() => {
    if (homeTeamId && awayTeamId) {
      setLoadingInsights(true);
      getMatchupInsightsAction(homeTeamId, awayTeamId, venueId || undefined)
        .then(setInsights)
        .finally(() => setLoadingInsights(false));
    } else {
        setInsights(null);
    }
  }, [homeTeamId, awayTeamId, venueId]);


  const canProceed = (currentStep: number) => {
    switch (currentStep) {
      case 1: return date && time && matchType;
      case 2: return homeTeamId && awayTeamId && homeTeamId !== awayTeamId;
      case 3: return venueId && conflicts.length === 0;
      case 4: return true; // Officials are optional
      default: return false;
    }
  };

  if (!isAllowed) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900">
        <CardContent className="pt-6 text-center">
          <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-bold mb-2 text-red-700 dark:text-red-400">Access Denied</h3>
          <p className="text-red-600 dark:text-red-300">You do not have permission to schedule fixtures.</p>
          <Badge variant="outline" className="mt-4 border-red-200 text-red-700">
            Current Role: {currentRole}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (state.success) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center sh-fade-in">
        <GlobalStyles />
        <div className="mb-8 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center animate-bounce-subtle">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
        </div>
        
        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter" style={{ fontFamily: D.head }}>
          Match Scheduled Successfully
        </h1>
        <p className="text-white/60 text-lg mb-12 max-w-xl mx-auto">
          The fixture between <strong className="text-white">{homeTeam?.name}</strong> and <strong className="text-white">{awayTeam?.name}</strong> has been logged into the SCRBRD OS.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <Link href={`/matches/${state.matchId}`} className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all text-left">
                <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ArrowRight className="h-5 w-5" />
                </div>
                <p className="font-bold text-white mb-1">Match Center</p>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Live Scoring & Intel</p>
            </Link>

            <button className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all text-left">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5" />
                </div>
                <p className="font-bold text-white mb-1">Notify Teams</p>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Squad Selection Open</p>
            </button>

            <button className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-FoxBlue/10 hover:border-FoxBlue/30 transition-all text-left">
                <div className="h-10 w-10 rounded-xl bg-FoxBlue/20 text-FoxBlue flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Bus className="h-5 w-5" />
                </div>
                <p className="font-bold text-white mb-1">Book Transport</p>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Fleet Logistics</p>
            </button>

            <button className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all text-left">
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="h-5 w-5" />
                </div>
                <p className="font-bold text-white mb-1">Ground Prep</p>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Facility Operations</p>
            </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="outline" className="h-12 px-8 rounded-xl border-white/10 text-white hover:bg-white/5" onClick={() => window.location.reload()}>
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

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sh-fade-in">
      <GlobalStyles />
      {/* LEFT: Form */}
      <div className="lg:col-span-2 space-y-8">
        <form action={action} className="space-y-8">
          {/* Hidden Inputs */}
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

          <div className="flex items-center justify-between mb-8 px-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300",
                    step > i + 1 ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" :
                    step === i + 1 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary/20" :
                    "bg-white/5 text-muted-foreground border border-white/10"
                  )}
                  style={{ fontFamily: D.head }}
                >
                  {step > i + 1 ? <CheckCircle2 className="h-6 w-6" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={cn(
                    "h-[2px] flex-1 mx-4 rounded-full transition-all duration-500",
                    step > i + 1 ? "bg-emerald-500" : "bg-white/10"
                  )} />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <Card className="bg-[rgba(10,14,28,0.7)] backdrop-blur-xl border-white/[0.08] shadow-2xl sh-slide-up">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold tracking-tight text-white" style={{ fontFamily: D.head }}>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  Lineup Configuration
                </CardTitle>
                <CardDescription className="text-white/60">Select home and away teams. We&apos;ll automatically derive age divisions and optimize the matchup.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-8 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-wider text-white/50" style={{ fontFamily: D.head }}>Home Institution Team *</Label>
                    <Select value={homeTeamId} onValueChange={(val) => {
                        setHomeTeamId(val);
                        setAwayTeamId(""); // Reset away team to recalculate smart groups
                    }}>
                      <SelectTrigger className="h-14 bg-white/[0.03] border-white/10 text-white rounded-xl focus:ring-primary/40 focus:border-primary transition-all">
                        <SelectValue placeholder="Identify Home Team" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0e1c] border-white/10 text-white">
                        {teams.map(team => (
                          <SelectItem 
                            key={team.id} 
                            value={team.id}
                            disabled={team.id === awayTeamId}
                            className="focus:bg-primary/20 focus:text-white"
                          >
                            <div className="flex items-center gap-2">
                              {team.abbreviatedName && <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-white/40">{team.abbreviatedName}</span>}
                              <span className="font-medium">{team.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {homeTeam && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 transition-all">
                            <Sparkles className="h-4 w-4 text-emerald-400" />
                            <p className="text-xs font-medium text-emerald-400">
                                Segmented Division: <span className="font-bold text-white uppercase tracking-wider">{extractTier(homeTeam.name, homeTeam.suffix)}</span>
                            </p>
                        </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-wider text-white/50" style={{ fontFamily: D.head }}>Opponent Team *</Label>
                    <Select value={awayTeamId} onValueChange={setAwayTeamId} disabled={!homeTeamId}>
                      <SelectTrigger className={cn(
                        "h-14 bg-white/[0.03] border-white/10 text-white rounded-xl transition-all",
                        !homeTeamId ? "opacity-50 grayscale cursor-not-allowed" : "focus:ring-primary/40 focus:border-primary"
                      )}>
                        <SelectValue placeholder={!homeTeamId ? "Await Institution ID" : "Select Opponent"} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0e1c] border-white/10 text-white">
                        {groupedAwayTeams.matching.length > 0 && (
                            <SelectGroup>
                                <SelectLabel className="text-emerald-400 font-bold flex items-center gap-2 px-2 py-2">
                                    <Sparkles className="h-4 w-4" /> Strategic Recommendations
                                </SelectLabel>
                                {groupedAwayTeams.matching.map(team => (
                                    <SelectItem key={team.id} value={team.id} className="focus:bg-emerald-500/20 focus:text-white">
                                       <div className="flex items-center gap-2">
                                          {team.abbreviatedName && <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-white/40">{team.abbreviatedName}</span>}
                                          <span className="font-medium">{team.name}</span>
                                       </div>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        )}
                        <SelectGroup>
                            <SelectLabel className="text-white/30 border-t border-white/10 mt-2 pt-3 px-2">Other Institutions</SelectLabel>
                            {groupedAwayTeams.other.map(team => (
                                <SelectItem key={team.id} value={team.id} className="focus:bg-white/10 focus:text-white">
                                    <div className="flex items-center gap-2">
                                        {team.abbreviatedName && <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-white/40">{team.abbreviatedName}</span>}
                                        <span className="font-medium">{team.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Date & Time */}
          {/* Swapped to Step 2 so Date & Format inherit Smart Defaults from Step 1 */}
          {step === 2 && (
            <Card className="bg-[rgba(10,14,28,0.7)] backdrop-blur-xl border-white/[0.08] shadow-2xl sh-slide-up">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold tracking-tight text-white" style={{ fontFamily: D.head }}>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  Temporal Parameters
                </CardTitle>
                <CardDescription className="text-white/60">Define the match schedule and format. Smart defaults derived from division profiles.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-8 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-wider text-white/50" style={{ fontFamily: D.head }}>Deployment Date *</Label>
                    <div className="relative">
                      <Input 
                        className="h-14 bg-white/[0.03] border-white/10 text-white rounded-xl focus:ring-primary/40 focus:border-primary pl-10"
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-wider text-white/50" style={{ fontFamily: D.head }}>Commencement Time *</Label>
                    <div className="relative">
                      <Input 
                        className="h-14 bg-white/[0.03] border-white/10 text-white rounded-xl focus:ring-primary/40 focus:border-primary pl-10"
                        type="time" 
                        value={time} 
                        onChange={(e) => setTime(e.target.value)} 
                        required
                      />
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-wider text-white/50" style={{ fontFamily: D.head }}>Engagement Format *</Label>
                    <Select value={matchType} onValueChange={setMatchType}>
                      <SelectTrigger className="h-14 bg-white/[0.03] border-white/10 text-white rounded-xl focus:ring-primary/40 focus:border-primary transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0e1c] border-white/10 text-white">
                        {MATCH_TYPES.map(mt => (
                          <SelectItem key={mt.value} value={mt.value} className="focus:bg-white/10 focus:text-white">
                            {mt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {matchType === 'Other' ? (
                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase tracking-wider text-white/50" style={{ fontFamily: D.head }}>Custom Duration (Overs)</Label>
                      <Input 
                        className="h-14 bg-white/[0.03] border-white/10 text-white rounded-xl focus:ring-primary/40 focus:border-primary"
                        type="number" 
                        value={overs} 
                        onChange={(e) => setOvers(Number(e.target.value))} 
                        min={1}
                        max={100}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 px-4 h-14 rounded-xl bg-primary/5 border border-primary/10 self-end">
                      <Info className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-[10px] font-bold uppercase text-white/40 tracking-widest leading-none mb-1">Auto-Configured</p>
                        <p className="text-sm font-bold text-white leading-none">{overs} Overs</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}


          {/* Step 3: Venue */}
          {step === 3 && (
            <Card className="bg-[rgba(10,14,28,0.7)] backdrop-blur-xl border-white/[0.08] shadow-2xl sh-slide-up">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold tracking-tight text-white" style={{ fontFamily: D.head }}>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  Geospatial Allocation
                </CardTitle>
                <CardDescription className="text-white/60">
                  Assign the match venue. Our engine will verify ground readiness and logistical feasibility.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-6">
                <div className="space-y-4 relative">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center justify-between" style={{ fontFamily: D.head }}>
                     Assigned Venue *
                     {isVenueAutoSuggested && (
                         <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                             <Sparkles className="h-3 w-3 text-amber-400" />
                             <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Institution Default</span>
                         </div>
                     )}
                  </Label>
                  <Select value={venueId} onValueChange={handleVenueChange}>
                    <SelectTrigger className={cn(
                        "h-14 bg-white/[0.03] border-white/10 text-white rounded-xl transition-all",
                        isVenueAutoSuggested ? "border-amber-500/40 ring-1 ring-amber-500/10 shadow-lg shadow-amber-500/5" : "focus:ring-primary/40 focus:border-primary"
                    )}>
                      <SelectValue placeholder="Identify Venue" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0e1c] border-white/10 text-white">
                      {fields.map(field => (
                        <SelectItem key={field.id} value={field.id} className="focus:bg-white/10 focus:text-white">
                          <div className="flex flex-col">
                            <span className="font-medium">{field.name}</span>
                            {field.location && <span className="text-[10px] text-white/40">{field.location}</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {checkingConflicts ? (
                  <div className="flex justify-center p-8 bg-white/[0.02] rounded-2xl border border-white/5 border-dashed">
                      <div className="flex flex-col items-center gap-4 text-primary">
                        <div className="relative">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-primary/20 animate-ping" />
                        </div>
                        <p className="text-sm font-bold tracking-tight animate-pulse">Scanning Grid for Conflicts...</p>
                      </div>
                  </div>
                ) : (
                    <div className="sh-fade-in">
                        <ConflictAlert conflicts={conflicts} />
                    </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card className="bg-[rgba(10,14,28,0.7)] backdrop-blur-xl border-white/[0.08] shadow-2xl sh-slide-up">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold tracking-tight text-white" style={{ fontFamily: D.head }}>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  Operational Staffing
                </CardTitle>
                <CardDescription className="text-white/60">Delegate match officials. These role assignments will be notified instantly upon confirmation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-6">
                {loadingOfficials ? (
                  <div className="flex flex-col items-center justify-center p-12 text-white/40 gap-4 bg-white/[0.02] rounded-2xl border border-white/5 border-dashed">
                    <div className="relative">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-primary/20 animate-ping" />
                    </div>
                    <p className="text-sm font-bold tracking-tight animate-pulse">Synchronizing Personnel Availability...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center justify-between" style={{ fontFamily: D.head }}>
                        Available Umpire Pool
                        <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-white/40">{umpireIds.length}/2 Selected</span>
                      </Label>
                      <div className="flex flex-wrap gap-3">
                        {availableOfficials.umpires.length === 0 ? (
                          <div className="w-full p-6 border border-white/10 rounded-xl border-dashed bg-white/[0.02] text-center text-sm text-white/40">
                              No certified umpires available for this temporal window. Assignments can be managed via the Ops Hub later.
                          </div>
                        ) : (
                          availableOfficials.umpires.map(umpire => (
                            <button
                              key={umpire.id}
                              type="button"
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 border",
                                umpireIds.includes(umpire.id) 
                                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105" 
                                  : "bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/5 hover:border-white/20"
                              )}
                              onClick={() => {
                                if (umpireIds.includes(umpire.id)) {
                                  setUmpireIds(umpireIds.filter(id => id !== umpire.id));
                                } else if (umpireIds.length < 2) {
                                  setUmpireIds([...umpireIds, umpire.id]);
                                }
                              }}
                            >
                              <div className={cn(
                                "h-2 w-2 rounded-full transition-all",
                                umpireIds.includes(umpire.id) ? "bg-white animate-pulse" : "bg-white/20"
                              )} />
                              <span className="text-xs font-bold">{umpire.firstName} {umpire.lastName}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase tracking-wider text-white/50" style={{ fontFamily: D.head }}>Primary Scorer Assignment</Label>
                      <Select value={scorerId} onValueChange={setScorerId}>
                        <SelectTrigger className="h-14 bg-white/[0.03] border-white/10 text-white rounded-xl focus:ring-primary/40 focus:border-primary transition-all">
                          <SelectValue placeholder="Identify Scorer (Optional)" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0e1c] border-white/10 text-white">
                          <SelectItem value="unassigned" className="text-white/40 italic">De-prioritize / Leave Unassigned</SelectItem>
                          {availableOfficials.scorers.map(scorer => (
                            <SelectItem key={scorer.id} value={scorer.id} className="focus:bg-white/10 focus:text-white">
                              {scorer.firstName} {scorer.lastName}
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

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
            <Button 
              type="button" 
              variant="outline" 
              className="px-8 h-12 bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl transition-all"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Phase
            </Button>
            
            {step < totalSteps ? (
              <Button 
                type="button" 
                className="px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl font-bold transition-all active:scale-95"
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed(step)}
                style={{ fontFamily: D.head }}
              >
                Proceed to Intelligence
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <SubmitButton />
            )}
          </div>

          {state.error && (
            <div className="mt-6">
                 <ConflictAlert conflicts={state.conflicts || [state.error]} />
            </div>
          )}
        </form>
      </div>

      {/* RIGHT: Preview & Weather */}
      <div className="space-y-6">
        <WeatherWidget date={date} location={venue?.location || venue?.name} />

        {/* Match Preview */}
        <Card className="bg-[rgba(10,14,28,0.7)] backdrop-blur-xl border-white/[0.08] shadow-2xl overflow-hidden relative sh-fade-in">
          {/* Subtle Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-transparent opacity-50" />
          
          <CardHeader className="pb-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center justify-between" style={{ fontFamily: D.head }}>
              Match Intel Dossier
              {homeTeam && awayTeam && (
                  <div className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                      {extractTier(homeTeam.name, homeTeam.suffix)} ELITE
                  </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-6">
            {homeTeam && awayTeam ? (
              <div className="text-center relative">
                <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 shadow-inner">
                    <p className="font-extrabold text-2xl tracking-tighter text-white" style={{ fontFamily: D.head }}>{homeTeam.name}</p>
                    <div className="my-4 flex items-center justify-center gap-4">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">VERSUS</span>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
                    </div>
                    <p className="font-extrabold text-2xl tracking-tighter text-white" style={{ fontFamily: D.head }}>{awayTeam.name}</p>
                </div>
              </div>
            ) : (
              <div className="h-40 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center">
                  <p className="text-center text-white/30 text-sm font-bold tracking-tight px-8 lowercase" style={{ fontFamily: D.head }}>Await initialization of competition participants...</p>
              </div>
            )}

            <div className="space-y-4">
                {date && time && (
                <div className="flex items-center gap-4 text-sm text-white/70 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase text-white/30 tracking-widest leading-none mb-1">Schedule</p>
                        <p className="font-bold text-white leading-none">
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
                <div className="flex items-center gap-4 text-sm text-white/70 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase text-white/30 tracking-widest leading-none mb-1">Operations Central</p>
                        <p className="font-bold text-white leading-none truncate" title={venue.name}>{venue.name}</p>
                    </div>
                </div>
                )}
            </div>

            <div className={cn(
                "transition-all duration-500",
                matchType && homeTeam ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}>
              <div className="pt-6 border-t border-white/5">
                  <div className="flex justify-between items-center bg-white/[0.03] rounded-xl p-4 border border-white/5">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Format Specification</span>
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 shadow-none font-black px-3 py-1 text-[10px]">
                        <Clock className="h-3 w-3 mr-1.5" />
                        {matchType} • {overs}
                    </Badge>
                  </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Win Probability */}
        {homeTeam && awayTeam && (
          <WinProbabilityWidget 
            homeTeamId={homeTeam.id} 
            awayTeamId={awayTeam.id}
            homeTeamName={homeTeam.name}
            awayTeamName={awayTeam.name}
          />
        )}

        {/* H2H Intel */}
        {insights?.h2h && (
          <Card className="glass-card shadow-sm border-0 ring-1 ring-border/50 overflow-hidden">
             <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <History className="h-3 w-3" />
                  H2H History
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-center">
                    <div className="flex-1">
                        <p className="text-2xl font-black text-primary">{insights.h2h.homeWins}</p>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold">{homeTeam?.abbreviatedName || 'HOME'}</p>
                    </div>
                    <div className="px-4 border-l border-r border-border/50">
                        <p className="text-lg font-bold text-muted-foreground">{insights.h2h.draws}</p>
                        <p className="text-[10px] uppercase text-muted-foreground">Draws</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-2xl font-black text-fox-gold">{insights.h2h.awayWins}</p>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold">{awayTeam?.abbreviatedName || 'AWAY'}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        Recent Outcomes
                    </p>
                    <div className="space-y-1.5">
                        {insights.h2h.lastResults.length > 0 ? (
                            insights.h2h.lastResults.map((res, i) => (
                                <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-background/40 border border-border/30">
                                    <span className="text-muted-foreground">{new Date(res.date).getFullYear()}</span>
                                    <span className={`font-bold ${res.winnerId === homeTeamId ? 'text-primary' : res.winnerId === awayTeamId ? 'text-fox-gold' : 'text-muted-foreground'}`}>
                                        {res.winnerId === homeTeamId ? 'HW' : res.winnerId === awayTeamId ? 'AW' : 'D'}
                                    </span>
                                    <span className="text-muted-foreground font-medium truncate ml-2 max-w-[100px]">{res.scoreLine}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-[10px] text-muted-foreground italic">No recent match data available.</p>
                        )}
                    </div>
                </div>

                <div className="pt-2 flex justify-center">
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-tighter ${
                        insights.rivalryLevel === 'Fierce' ? 'border-red-500/50 text-red-500 bg-red-500/5' :
                        insights.rivalryLevel === 'Competitive' ? 'border-orange-500/50 text-orange-500 bg-orange-500/5' :
                        'border-blue-500/50 text-blue-500 bg-blue-500/5'
                    }`}>
                        <Trophy className="h-2.5 w-2.5 mr-1" />
                        {insights.rivalryLevel} Rivalry
                    </Badge>
                </div>
             </CardContent>
          </Card>
        )}

        {/* Venue Intel */}
        {insights?.groundInsights && (
          <Card className="glass-card shadow-sm border-0 ring-1 ring-border/50 overflow-hidden">
             <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Grounds Report
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Rating</span>
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                            <div key={star} className={`h-1.5 w-4 rounded-full ${star <= insights.groundInsights!.rating ? 'bg-fox-gold' : 'bg-muted'}`} />
                        ))}
                    </div>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed italic line-clamp-2">
                    &quot;{insights.groundInsights.description}&quot;
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                    {insights.groundInsights.amenities.map((item, i) => (
                        <Badge key={i} variant="secondary" className="text-[9px] px-1 py-0 bg-muted/50 border-0 h-4">
                            {item}
                        </Badge>
                    ))}
                </div>
             </CardContent>
          </Card>
        )}

        {/* Transport Suggestion */}
        {insights?.transportSuggestion && (
          <Card className="border-FoxBlue/20 bg-FoxBlue/5 dark:bg-FoxBlue/10 overflow-hidden">
             <CardContent className="p-4 flex gap-3 items-start">
                <div className="bg-FoxBlue/10 p-2 rounded-lg text-FoxBlue">
                    <Bus className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-bold text-FoxBlue uppercase tracking-wider">Logistics Tip</p>
                    <p className="text-xs text-FoxBlue/80 leading-tight">
                        {insights.transportSuggestion}
                    </p>
                </div>
             </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
