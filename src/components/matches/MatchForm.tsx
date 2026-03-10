"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { MatchActionState } from "@/app/actions/matchActions";
import { getLeaguesAction } from "@/app/actions/leagueActions";
import { fetchSeasons } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, CheckCircle2, AlertTriangle, Calendar as CalendarIcon, Moon } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Team, Field } from "@/types/firestore";
import { matchSchemaWithRefinements, MatchFormData } from "@/lib/validations/matchSchema";
import { z } from "zod";

interface MatchFormProps {
  mode: 'create' | 'edit';
  matchAction: (prevState: MatchActionState, formData: FormData) => Promise<MatchActionState>;
  initialState: MatchActionState;
  initialData?: any;
  teams: Team[];
  fields: Field[];
}

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {mode === 'create' ? 'Creating...' : 'Saving...'}
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {mode === 'create' ? 'Schedule Match' : 'Save Changes'}
        </>
      )}
    </Button>
  );
}

export function MatchForm({ mode, matchAction, initialState, initialData = {}, teams, fields }: MatchFormProps) {
  const [state, action] = useFormState(matchAction, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [selectedFormat, setSelectedFormat] = useState(initialData.format || 'T20');
  const [leagues, setLeagues] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);

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

  // Client-side validation
  const validateField = (name: string, value: string) => {
    try {
      const field = name as keyof typeof matchSchemaWithRefinements.shape;
      if (field in matchSchemaWithRefinements.shape) {
        matchSchemaWithRefinements.shape[field].parse(value);
        setClientErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setClientErrors(prev => ({
          ...prev,
          [name]: error.issues[0].message
        }));
      }
    }
  };

  const showSuccess = state.success;

  // Get default overs based on format
  const getDefaultOvers = (format: string) => {
    switch (format) {
      case 'T20': return '20';
      case 'ODI': return '50';
      case 'Limited Overs': return '40';
      default: return '';
    }
  };

  return (
    <form action={action} className="space-y-6">
      {showSuccess && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Match {mode === 'create' ? 'scheduled' : 'updated'} successfully!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {mode === 'create' ? 'Schedule New Match' : 'Edit Match'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Fill in the match details below. Fields marked with * are required.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Teams */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Teams</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homeTeamId">Home Team *</Label>
                <Select name="homeTeamId" defaultValue={initialData.homeTeamId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Home Team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(clientErrors.homeTeamId || state.fieldErrors?.homeTeamId) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.homeTeamId || state.fieldErrors?.homeTeamId[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="awayTeamId">Away Team *</Label>
                <Select name="awayTeamId" defaultValue={initialData.awayTeamId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Away Team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(clientErrors.awayTeamId || state.fieldErrors?.awayTeamId) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.awayTeamId || state.fieldErrors?.awayTeamId[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Match Date *</Label>
                <Input 
                  id="scheduledDate" 
                  name="scheduledDate" 
                  type="date"
                  defaultValue={initialData.scheduledDate?.split('T')[0]}
                  onBlur={(e) => validateField('scheduledDate', e.target.value)}
                  required 
                />
                {(clientErrors.scheduledDate || state.fieldErrors?.scheduledDate) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.scheduledDate || state.fieldErrors?.scheduledDate[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Start Time *</Label>
                <Input 
                  id="scheduledTime" 
                  name="scheduledTime" 
                  type="time"
                  defaultValue={initialData.scheduledTime}
                  onBlur={(e) => validateField('scheduledTime', e.target.value)}
                  required 
                />
                {(clientErrors.scheduledTime || state.fieldErrors?.scheduledTime) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.scheduledTime || state.fieldErrors?.scheduledTime[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="venueId">Venue *</Label>
                <Select name="venueId" defaultValue={initialData.venueId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map(field => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state.fieldErrors?.venueId && (
                  <p className="text-sm text-destructive">{state.fieldErrors.venueId[0]}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-4">
              <input
                type="checkbox"
                id="isDayNight"
                name="isDayNight"
                defaultChecked={initialData.isDayNight}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isDayNight" className="flex items-center gap-2 cursor-pointer">
                <Moon className="h-4 w-4 text-slate-500" />
                Day/Night Match
              </Label>
            </div>
          </div>

          {/* Match Format */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Format & Competition</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format">Format *</Label>
                <Select 
                  name="format" 
                  defaultValue={initialData.format || 'T20'}
                  onValueChange={(value) => {
                    setSelectedFormat(value);
                    const oversInput = document.getElementById('overs') as HTMLInputElement;
                    if (oversInput) {
                      oversInput.value = getDefaultOvers(value);
                    }
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T20">T20</SelectItem>
                    <SelectItem value="ODI">ODI (One Day)</SelectItem>
                    <SelectItem value="Test">Test Match</SelectItem>
                    <SelectItem value="First Class">First Class</SelectItem>
                    <SelectItem value="Limited Overs">Limited Overs</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="overs">Overs per Innings</Label>
                <Input 
                  id="overs" 
                  name="overs"
                  type="number"
                  min="1"
                  max="100"
                  defaultValue={initialData.overs || getDefaultOvers(selectedFormat)}
                  onBlur={(e) => validateField('overs', e.target.value)}
                  placeholder="e.g. 20"
                />
                {clientErrors.overs && (
                  <p className="text-sm text-destructive">{clientErrors.overs}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="competition">Competition</Label>
                <Input 
                  id="competition" 
                  name="competition"
                  defaultValue={initialData.competition}
                  placeholder="e.g. Premier League"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leagueId">League (Optional)</Label>
                <Select name="leagueId" defaultValue={initialData.leagueId || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select League" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {leagues.map((league: any) => (
                      <SelectItem key={league.id} value={league.id}>
                        {league.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seasonId">Season (Optional)</Label>
                <Select name="seasonId" defaultValue={initialData.seasonId || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
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
                <Label htmlFor="division">Division</Label>
                <Input 
                  id="division" 
                  name="division" 
                  defaultValue={initialData.division}
                  placeholder="e.g. U19A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="round">Round/Stage</Label>
                <Input 
                  id="round" 
                  name="round"
                  defaultValue={initialData.round}
                  placeholder="e.g. Quarter Final, Round 3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="broadcastUrl">Broadcast/Stream URL</Label>
                <Input 
                  id="broadcastUrl" 
                  name="broadcastUrl"
                  type="url"
                  defaultValue={initialData.broadcastUrl}
                  onBlur={(e) => validateField('broadcastUrl', e.target.value)}
                  placeholder="https://..."
                />
                {clientErrors.broadcastUrl && (
                  <p className="text-sm text-destructive">{clientErrors.broadcastUrl}</p>
                )}
              </div>
            </div>
          </div>

          {/* Officials (Optional section) */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Officials (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="umpire1Id">Umpire 1</Label>
                <Input 
                  id="umpire1Id" 
                  name="umpire1Id"
                  defaultValue={initialData.umpire1Id}
                  placeholder="Umpire ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="umpire2Id">Umpire 2</Label>
                <Input 
                  id="umpire2Id" 
                  name="umpire2Id"
                  defaultValue={initialData.umpire2Id}
                  placeholder="Umpire ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scorerId">Scorer</Label>
                <Input 
                  id="scorerId" 
                  name="scorerId"
                  defaultValue={initialData.scorerId}
                  placeholder="Scorer ID"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              name="notes"
              defaultValue={initialData.notes}
              onBlur={(e) => validateField('notes', e.target.value)}
              placeholder="Additional match information..."
              rows={3}
              maxLength={500}
            />
            {clientErrors.notes && (
              <p className="text-sm text-destructive">{clientErrors.notes}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {initialData.notes?.length || 0}/500 characters
            </p>
          </div>

          {state.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between bg-muted/50">
          {mode === 'edit' && initialData.id ? (
            <div></div>
          ) : (
            <div></div> 
          )}
          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <SubmitButton mode={mode} />
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
