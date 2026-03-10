"use client";

import { useState, useEffect, useMemo } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { 
  createSmartFixtureAction, 
  checkFixtureConflictsAction,
  getAvailableOfficialsAction,
  FixtureActionState 
} from "@/app/actions/fixtureActions";
import { Team, Field, Person } from "@/types/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  ArrowLeft
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
  const [state, action] = useFormState(createSmartFixtureAction, initialState);
  
  // Wizard Step
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  // Form State
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [matchType, setMatchType] = useState("T20");
  const [overs, setOvers] = useState(20);
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [umpireIds, setUmpireIds] = useState<string[]>([]);
  const [scorerId, setScorerId] = useState("");
  
  // Dynamic Data
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [availableOfficials, setAvailableOfficials] = useState<{ umpires: Person[]; scorers: Person[] }>({ umpires: [], scorers: [] });
  const [loadingOfficials, setLoadingOfficials] = useState(false);

  // Derived
  const homeTeam = useMemo(() => teams.find(t => t.id === homeTeamId), [teams, homeTeamId]);
  const awayTeam = useMemo(() => teams.find(t => t.id === awayTeamId), [teams, awayTeamId]);
  const venue = useMemo(() => fields.find(f => f.id === venueId), [fields, venueId]);

  // Auto-suggest venue based on home team's school
  useEffect(() => {
    if (homeTeam && !venueId) {
      const homeVenue = fields.find(f => f.schoolId === homeTeam.schoolId);
      if (homeVenue) setVenueId(homeVenue.id);
    }
  }, [homeTeam, venueId, fields]);

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
    switch (matchType) {
      case 'T20': setOvers(20); break;
      case 'ODI': setOvers(50); break;
      case 'T10': setOvers(10); break;
    }
  }, [matchType]);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT: Form */}
      <div className="lg:col-span-2 space-y-6">
        <form action={action}>
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

          {/* Progress */}
          <div className="flex items-center justify-between mb-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step > i + 1 ? 'bg-primary text-primary-foreground' :
                  step === i + 1 ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {step > i + 1 ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`h-1 w-16 mx-2 ${step > i + 1 ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Date & Time */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  When is the Match?
                </CardTitle>
                <CardDescription>Select the date, time, and format</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Match Date *</Label>
                    <Input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time *</Label>
                    <Input 
                      type="time" 
                      value={time} 
                      onChange={(e) => setTime(e.target.value)} 
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Match Format *</Label>
                    <Select value={matchType} onValueChange={setMatchType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MATCH_TYPES.map(mt => (
                          <SelectItem key={mt.value} value={mt.value}>{mt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {matchType === 'Other' && (
                    <div className="space-y-2">
                      <Label>Number of Overs</Label>
                      <Input 
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

          {/* Step 2: Teams */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Who is Playing?
                </CardTitle>
                <CardDescription>Select home and away teams</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Home Team *</Label>
                    <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Home Team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map(team => (
                          <SelectItem 
                            key={team.id} 
                            value={team.id}
                            disabled={team.id === awayTeamId}
                          >
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Away Team *</Label>
                    <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Away Team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map(team => (
                          <SelectItem 
                            key={team.id} 
                            value={team.id}
                            disabled={team.id === homeTeamId}
                          >
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Venue */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Where is the Match?
                </CardTitle>
                <CardDescription>
                  {homeTeam ? `Suggested: ${homeTeam.name}'s home ground` : 'Select a venue'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Venue *</Label>
                  <Select value={venueId} onValueChange={setVenueId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map(field => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.name} {field.location && `(${field.location})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {checkingConflicts && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking for conflicts...
                  </div>
                )}

                <ConflictAlert conflicts={conflicts} />
              </CardContent>
            </Card>
          )}

          {/* Step 4: Officials */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Match Officials
                </CardTitle>
                <CardDescription>Assign umpires and scorer (optional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingOfficials ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading available officials...
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Available Umpires</Label>
                      <div className="flex flex-wrap gap-2">
                        {availableOfficials.umpires.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No umpires available for this time slot</p>
                        ) : (
                          availableOfficials.umpires.map(umpire => (
                            <Badge 
                              key={umpire.id}
                              variant={umpireIds.includes(umpire.id) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => {
                                if (umpireIds.includes(umpire.id)) {
                                  setUmpireIds(umpireIds.filter(id => id !== umpire.id));
                                } else if (umpireIds.length < 2) {
                                  setUmpireIds([...umpireIds, umpire.id]);
                                }
                              }}
                            >
                              {umpire.firstName} {umpire.lastName}
                            </Badge>
                          ))
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Select up to 2 umpires</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Scorer</Label>
                      <Select value={scorerId} onValueChange={setScorerId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Scorer (Optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">None</SelectItem>
                          {availableOfficials.scorers.map(scorer => (
                            <SelectItem key={scorer.id} value={scorer.id}>
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
          <div className="flex justify-between mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            {step < totalSteps ? (
              <Button 
                type="button" 
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed(step)}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <SubmitButton />
            )}
          </div>

          {state.error && (
            <ConflictAlert conflicts={state.conflicts || [state.error]} />
          )}
        </form>
      </div>

      {/* RIGHT: Preview & Weather */}
      <div className="space-y-6">
        <WeatherWidget date={date} location={venue?.location || venue?.name} />

        {/* Match Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              Match Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {homeTeam && awayTeam ? (
              <div className="text-center">
                <p className="font-bold text-lg">{homeTeam.name}</p>
                <p className="text-muted-foreground text-sm">vs</p>
                <p className="font-bold text-lg">{awayTeam.name}</p>
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm">Select teams to preview</p>
            )}

            {date && time && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(`${date}T${time}`).toLocaleString('en-ZA', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}

            {venue && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {venue.name}
              </div>
            )}

            <div className="flex justify-center">
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                {matchType} • {overs} overs
              </Badge>
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
      </div>
    </div>
  );
}
