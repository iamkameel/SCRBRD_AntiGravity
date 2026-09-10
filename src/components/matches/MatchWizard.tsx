"use client";

import { useState, useEffect, useMemo, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { MatchActionState } from "@/app/actions/matchActions";
import { getLeaguesAction } from "@/app/actions/leagueActions";
import { fetchSeasons } from "@/lib/firestore";
import { Team, Field, Person, School, Division } from "@/types/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Save, 
  Calendar,
  MapPin,
  Users,
  Shield,
  Trophy,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Moon,
  AlertTriangle,
  Search,
  Filter,
  X
} from "lucide-react";
import { WeatherWidget } from "@/components/fixtures/WeatherWidget";
import { getAvailableOfficialsAction } from "@/app/actions/fixtureActions";
import { usePermissionView } from "@/contexts/PermissionViewContext";
import { ShieldAlert, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MatchWizardProps {
  teams: Team[];
  fields: Field[];
  schools?: School[];
  divisions?: Division[];
  matchAction: (prevState: MatchActionState, formData: FormData) => Promise<MatchActionState>;
  initialState: MatchActionState;
  mode?: 'create' | 'edit';
  initialData?: any;
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

const MATCH_FORMATS = [
  { value: 'T20', label: 'T20 (20 overs)', overs: 20 },
  { value: 'ODI', label: 'ODI (50 overs)', overs: 50 },
  { value: 'Limited Overs', label: 'Limited Overs (40 overs)', overs: 40 },
  { value: 'Test', label: 'Test Match', overs: null },
  { value: 'First Class', label: 'First Class', overs: null },
  { value: 'Other', label: 'Custom', overs: null },
];

export function MatchWizard({ teams, fields, schools = [], divisions = [], matchAction, initialState, mode = 'create', initialData = {} }: MatchWizardProps) {
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

  const [state, action] = useActionState(matchAction, initialState);
  
  // Wizard Step
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  // Form State
  const [date, setDate] = useState(initialData.scheduledDate?.split('T')[0] || "");
  const [time, setTime] = useState(initialData.scheduledTime || "10:00");
  const [homeTeamId, setHomeTeamId] = useState(initialData.homeTeamId || "");
  const [awayTeamId, setAwayTeamId] = useState(initialData.awayTeamId || "");
  const [venueId, setVenueId] = useState(initialData.venueId || "");
  const [format, setFormat] = useState(initialData.format || "T20");
  const [overs, setOvers] = useState(initialData.overs || 20);
  const [isDayNight, setIsDayNight] = useState(initialData.isDayNight || false);
  const [competition, setCompetition] = useState(initialData.competition || "");
  const [leagueId, setLeagueId] = useState(initialData.leagueId || "");
  const [seasonId, setSeasonId] = useState(initialData.seasonId || "");
  const [division, setDivision] = useState(initialData.division || "");
  const [divisionId, setDivisionId] = useState(initialData.divisionId || "");
  const [round, setRound] = useState(initialData.round || "");
  const [broadcastUrl, setBroadcastUrl] = useState(initialData.broadcastUrl || "");
  const [notes, setNotes] = useState(initialData.notes || "");
  
  // Officials
  const [umpire1Id, setUmpire1Id] = useState(initialData.umpire1Id || "");
  const [umpire2Id, setUmpire2Id] = useState(initialData.umpire2Id || "");
  const [scorerId, setScorerId] = useState(initialData.scorerId || "");
  
  // Dynamic Data
  const [leagues, setLeagues] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [availableOfficials, setAvailableOfficials] = useState<{ umpires: Person[]; scorers: Person[] }>({ umpires: [], scorers: [] });
  const [loadingOfficials, setLoadingOfficials] = useState(false);

  // Derived
  const homeTeam = useMemo(() => teams.find(t => t.id === homeTeamId), [teams, homeTeamId]);
  const awayTeam = useMemo(() => teams.find(t => t.id === awayTeamId), [teams, awayTeamId]);
  const venue = useMemo(() => fields.find(f => f.id === venueId), [fields, venueId]);

  // Load leagues and seasons
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaguesData, seasonsData] = await Promise.all([
          getLeaguesAction(),
          fetchSeasons()
        ]);
        setLeagues(leaguesData);
        setSeasons(seasonsData);
      } catch (error) {
        console.error('Error fetching leagues/seasons:', error);
      }
    };
    fetchData();
  }, []);

  // Auto-suggest venue based on home team's school
  useEffect(() => {
    if (homeTeam && !venueId) {
      const homeVenue = fields.find(f => f.schoolId === homeTeam.schoolId);
      if (homeVenue) setVenueId(homeVenue.id);
    }
  }, [homeTeam, venueId, fields]);

  // Load available officials when date/time changes
  useEffect(() => {
    if (date && time) {
      setLoadingOfficials(true);
      getAvailableOfficialsAction(date, time)
        .then(setAvailableOfficials)
        .finally(() => setLoadingOfficials(false));
    }
  }, [date, time]);

  // Update overs based on format
  useEffect(() => {
    const selectedFormat = MATCH_FORMATS.find(f => f.value === format);
    if (selectedFormat?.overs) {
      setOvers(selectedFormat.overs);
    }
  }, [format]);

  const canProceed = (currentStep: number) => {
    switch (currentStep) {
      case 1: return homeTeamId && awayTeamId && homeTeamId !== awayTeamId;
      case 2: return date && time && venueId;
      case 3: return format;
      case 4: return true; // Review step
      default: return false;
    }
  };

  if (!isAllowed) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900">
        <CardContent className="pt-6 text-center">
          <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-bold mb-2 text-red-700 dark:text-red-400">Access Denied</h3>
          <p className="text-red-600 dark:text-red-300">You do not have permission to schedule matches.</p>
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
          <input type="hidden" name="homeTeamId" value={homeTeamId} />
          <input type="hidden" name="awayTeamId" value={awayTeamId} />
          <input type="hidden" name="matchDate" value={date} />
          <input type="hidden" name="matchTime" value={time} />
          <input type="hidden" name="fieldId" value={venueId} />
          <input type="hidden" name="matchType" value={format} />
          <input type="hidden" name="overs" value={overs} />
          <input type="hidden" name="isDayNight" value={isDayNight ? "true" : "false"} />
          <input type="hidden" name="competition" value={competition} />
          <input type="hidden" name="leagueId" value={leagueId} />
          <input type="hidden" name="seasonId" value={seasonId} />
          <input type="hidden" name="division" value={division} />
          <input type="hidden" name="divisionId" value={divisionId} />
          <input type="hidden" name="round" value={round} />
          <input type="hidden" name="broadcastUrl" value={broadcastUrl} />
          <input type="hidden" name="notes" value={notes} />
          <input type="hidden" name="umpire1Id" value={umpire1Id} />
          <input type="hidden" name="umpire2Id" value={umpire2Id} />
          <input type="hidden" name="scorer" value={scorerId} />

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

          {/* Step 1: Teams */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Who is Playing?
                </CardTitle>
                <CardDescription>Select the competing teams</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TeamSelectionWidget
                    label="Home Team"
                    teams={teams}
                    schools={schools}
                    divisions={divisions}
                    selectedTeamId={homeTeamId}
                    onSelectTeam={setHomeTeamId}
                    excludeTeamId={awayTeamId}
                    testIdPrefix="home"
                  />
                  <TeamSelectionWidget
                    label="Away Team"
                    teams={teams}
                    schools={schools}
                    divisions={divisions}
                    selectedTeamId={awayTeamId}
                    onSelectTeam={setAwayTeamId}
                    excludeTeamId={homeTeamId}
                    testIdPrefix="away"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Schedule & Venue */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  When & Where?
                </CardTitle>
                <CardDescription>Set the date, time, and venue</CardDescription>
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
                  {homeTeam && venue?.schoolId === homeTeam.schoolId && (
                    <p className="text-xs text-muted-foreground">
                      ✓ Home ground for {homeTeam.name}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDayNight"
                    checked={isDayNight}
                    onChange={(e) => setIsDayNight(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isDayNight" className="flex items-center gap-2 cursor-pointer">
                    <Moon className="h-4 w-4 text-slate-500" />
                    Day/Night Match
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Format & Competition */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Match Details
                </CardTitle>
                <CardDescription>Set format and competition details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Format *</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MATCH_FORMATS.map(fmt => (
                          <SelectItem key={fmt.value} value={fmt.value}>{fmt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {(format === 'Other' || !MATCH_FORMATS.find(f => f.value === format)?.overs) && (
                    <div className="space-y-2">
                      <Label>Overs per Innings</Label>
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
                <div className="space-y-2">
                  <Label>Competition</Label>
                  <Input 
                    value={competition} 
                    onChange={(e) => setCompetition(e.target.value)}
                    placeholder="e.g. Premier League"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>League (Optional)</Label>
                    <Select value={leagueId || "none"} onValueChange={(val) => setLeagueId(val === "none" ? "" : val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select League" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {leagues.map((league: any) => (
                          <SelectItem key={league.id} value={league.id}>
                            {league.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Season (Optional)</Label>
                    <Select value={seasonId || "none"} onValueChange={(val) => setSeasonId(val === "none" ? "" : val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {seasons.map((season: any) => (
                          <SelectItem key={season.id || season.seasonId} value={season.id || season.seasonId}>
                            {season.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Division (Link to formal list)</Label>
                    <Select value={divisionId || "none"} onValueChange={(val) => setDivisionId(val === "none" ? "" : val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Division" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None / Other</SelectItem>
                        {divisions.map((div: any) => (
                          <SelectItem key={div.id} value={div.id}>
                            {div.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Custom Division Name (Optional)</Label>
                    <Input 
                      value={division} 
                      onChange={(e) => setDivision(e.target.value)}
                      placeholder="e.g. U19A (Custom)"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Round/Stage</Label>
                    <Input 
                      value={round} 
                      onChange={(e) => setRound(e.target.value)}
                      placeholder="e.g. Quarter Final"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Broadcast/Stream URL</Label>
                    <Input 
                      type="url"
                      value={broadcastUrl} 
                      onChange={(e) => setBroadcastUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional match information..."
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {notes.length}/500 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Officials & Review */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Officials & Review
                </CardTitle>
                <CardDescription>Assign officials and review match details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingOfficials ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading available officials...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Umpire 1</Label>
                      <SearchableOfficialSelect
                        value={umpire1Id}
                        onChange={setUmpire1Id}
                        officials={availableOfficials.umpires}
                        placeholder="Select Umpire"
                        disabledIds={[umpire2Id]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Umpire 2</Label>
                      <SearchableOfficialSelect
                        value={umpire2Id}
                        onChange={setUmpire2Id}
                        officials={availableOfficials.umpires}
                        placeholder="Select Umpire"
                        disabledIds={[umpire1Id]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Scorer</Label>
                      <SearchableOfficialSelect
                        value={scorerId}
                        onChange={setScorerId}
                        officials={availableOfficials.scorers}
                        placeholder="Select Scorer"
                      />
                    </div>
                  </div>
                )}

                {/* Review Summary */}
                <div className="pt-4 border-t space-y-3">
                  <h4 className="font-medium">Match Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Teams:</div>
                    <div className="font-medium">{homeTeam?.name} vs {awayTeam?.name}</div>
                    
                    <div className="text-muted-foreground">Date & Time:</div>
                    <div className="font-medium">
                      {date && time && new Date(`${date}T${time}`).toLocaleString('en-ZA', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    
                    <div className="text-muted-foreground">Venue:</div>
                    <div className="font-medium">{venue?.name}</div>
                    
                    <div className="text-muted-foreground">Format:</div>
                    <div className="font-medium">{format} {overs && `(${overs} overs)`}</div>
                    
                    {competition && (
                      <>
                        <div className="text-muted-foreground">Competition:</div>
                        <div className="font-medium">{competition}</div>
                      </>
                    )}
                  </div>
                </div>
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
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm">{state.error}</p>
            </div>
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
                <Trophy className="h-3 w-3 mr-1" />
                {format} {overs && `• ${overs} overs`}
              </Badge>
            </div>

            {isDayNight && (
              <div className="flex justify-center">
                <Badge variant="outline" className="border-blue-200 text-blue-700">
                  <Moon className="h-3 w-3 mr-1" />
                  Day/Night
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SearchableOfficialSelect({ 
  value, 
  onChange, 
  officials, 
  placeholder, 
  disabledIds = [] 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  officials: Person[]; 
  placeholder: string;
  disabledIds?: string[];
}) {
  const [open, setOpen] = useState(false);

  const selectedOfficial = officials.find(o => o.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedOfficial ? `${selectedOfficial.firstName} ${selectedOfficial.lastName}` : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No official found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="none"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "" ? "opacity-100" : "opacity-0"
                  )}
                />
                None
              </CommandItem>
              {officials.map((official) => (
                <CommandItem
                  key={official.id}
                  value={`${official.firstName} ${official.lastName}`}
                  onSelect={() => {
                    onChange(official.id);
                    setOpen(false);
                  }}
                  disabled={disabledIds.includes(official.id)}
                  className={disabledIds.includes(official.id) ? "opacity-50 cursor-not-allowed" : ""}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === official.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {official.firstName} {official.lastName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function TeamSelectionWidget({
  teams,
  schools,
  divisions,
  selectedTeamId,
  onSelectTeam,
  label,
  excludeTeamId,
  testIdPrefix
}: {
  teams: Team[];
  schools: School[];
  divisions: Division[];
  selectedTeamId: string;
  onSelectTeam: (id: string) => void;
  label: string;
  excludeTeamId?: string;
  testIdPrefix?: string;
}) {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");

  // Initialize filters based on selected team
  useEffect(() => {
    if (selectedTeamId && !selectedSchoolId) {
      const team = teams.find(t => t.id === selectedTeamId);
      if (team?.schoolId) {
        setSelectedSchoolId(team.schoolId);
      }
      if (team?.divisionId) {
        setSelectedDivisionId(team.divisionId);
      }
    }
  }, [selectedTeamId, teams, selectedSchoolId]);

  // Dynamic filtering for Schools based on selected Division
  const availableSchools = useMemo(() => {
    if (!selectedDivisionId) return schools;
    const schoolIdsInDivision = new Set(
      teams
        .filter(t => t.divisionId === selectedDivisionId)
        .map(t => t.schoolId)
    );
    return schools.filter(s => schoolIdsInDivision.has(s.id));
  }, [schools, teams, selectedDivisionId]);

  // Dynamic filtering for Divisions based on selected School
  const availableDivisions = useMemo(() => {
    if (!selectedSchoolId) return divisions;
    const divisionIdsInSchool = new Set(
      teams
        .filter(t => t.schoolId === selectedSchoolId)
        .map(t => t.divisionId)
        .filter(id => !!id) as string[]
    );
    return divisions.filter(d => divisionIdsInSchool.has(d.id));
  }, [divisions, teams, selectedSchoolId]);

  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      if (excludeTeamId && team.id === excludeTeamId) return false;
      if (selectedSchoolId && team.schoolId !== selectedSchoolId) return false;
      if (selectedDivisionId && team.divisionId !== selectedDivisionId) return false;
      return true;
    });
  }, [teams, selectedSchoolId, selectedDivisionId, excludeTeamId]);

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-card/50">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">{label}</Label>
        <div className="flex items-center gap-2">
          {(selectedSchoolId || selectedDivisionId) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSelectedSchoolId("");
                setSelectedDivisionId("");
              }}
            >
              Clear Filters
            </Button>
          )}
          {selectedTeam && (
            <Badge variant="secondary" className="text-xs">
              {selectedTeam.name}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {/* Filters */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Filter by School</Label>
            <SearchableSelect
              value={selectedSchoolId}
              onChange={(val) => {
                setSelectedSchoolId(val);
                // Clear team selection if it doesn't match new school
                if (selectedTeam && selectedTeam.schoolId !== val && val !== "") {
                  onSelectTeam("");
                }
              }}
              items={availableSchools.map(s => ({ id: s.id, label: s.name }))}
              placeholder="All Schools"
              emptyMessage="No schools found"
              testId={`${testIdPrefix}-school-select`}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Filter by Division</Label>
            <SearchableSelect
              value={selectedDivisionId}
              onChange={(val) => {
                setSelectedDivisionId(val);
                // Clear team selection if it doesn't match new division
                if (selectedTeam && selectedTeam.divisionId !== val && val !== "") {
                  onSelectTeam("");
                }
              }}
              items={availableDivisions.map(d => ({ id: d.id, label: d.name }))}
              placeholder="All Divisions"
              emptyMessage="No divisions found"
              testId={`${testIdPrefix}-division-select`}
            />
          </div>
        </div>

        {/* Team Selector */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Select Team ({filteredTeams.length})</Label>
          <SearchableSelect
            value={selectedTeamId}
            onChange={onSelectTeam}
            items={filteredTeams.map(t => ({ id: t.id, label: t.name }))}
            placeholder="Search teams..."
            emptyMessage="No teams found matching filters"
            testId={`${testIdPrefix}-team-select`}
          />
        </div>
      </div>
    </div>
  );
}

function SearchableSelect({ 
  value, 
  onChange, 
  items, 
  placeholder, 
  disabledIds = [],
  emptyMessage = "No item found.",
  testId
}: { 
  value: string; 
  onChange: (val: string) => void; 
  items: { id: string; label: string }[]; 
  placeholder: string;
  disabledIds?: string[];
  emptyMessage?: string;
  testId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedItem = items.find(i => i.id === value);
  
  const filteredItems = items.filter(item => 
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal h-9"
          data-testid={testId}
        >
          <span className="truncate">
            {selectedItem ? selectedItem.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="flex flex-col">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1" role="listbox">
            <div
              role="option"
              aria-selected={value === ""}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                value === "" && "bg-accent text-accent-foreground"
              )}
              onClick={() => {
                console.log("Clearing selection");
                onChange("");
                setOpen(false);
                setSearch("");
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === "" ? "opacity-100" : "opacity-0"
                )}
              />
              None / All
            </div>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                role="option"
                aria-selected={value === item.id}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  value === item.id && "bg-accent text-accent-foreground",
                  disabledIds.includes(item.id) && "pointer-events-none opacity-50"
                )}
                onClick={() => {
                  console.log("Selected:", item.label, "Item ID:", item.id);
                  onChange(item.id);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === item.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {item.label}
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
