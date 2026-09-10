"use client";

import { useState, useMemo, useEffect } from "react";
import { Team, Field, Season } from "@/types/firestore";
import { LocalCompetition as Competition } from "@/app/actions/multiFixtureActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Loader2, 
  Calendar, 
  Users, 
  Settings, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  LayoutGrid,
  MapPin,
  AlertCircle,
  Bus,
  Cloud,
  Edit2,
  Save,
  Trash2
} from "lucide-react";
import { fixtureGeneratorService, DraftFixture, GenerationConfig } from "@/services/fixtureGeneratorService";
import { bulkCreateFixturesAction } from "@/app/actions/multiFixtureActions";
import { ConflictAlert } from "./ConflictAlert";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface MultiFixtureWizardProps {
  teams: Team[];
  fields: Field[];
  seasons: Season[];
  competitions: Competition[];
}

export function MultiFixtureWizard({ teams, fields, seasons, competitions }: MultiFixtureWizardProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [selectedCompId, setSelectedCompId] = useState("");
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [config, setConfig] = useState<GenerationConfig>({
    startDate: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    intervalDays: 7,
    rounds: 1,
    matchType: "ODI",
    overs: 50,
    fieldPoolIds: [],
    timeSlots: ["09:00"]
  });

  // Draft State
  const [draftFixtures, setDraftFixtures] = useState<DraftFixture[]>([]);
  const [clashes, setClashes] = useState<string[]>([]);

  // Step 1: Base Config
  const handleGenerateDraft = () => {
    const teamsMap = teams.reduce((acc, t) => ({ ...acc, [t.id]: t }), {});
    const matches = fixtureGeneratorService.generateRoundRobin(selectedTeamIds, teamsMap);
    const draft = fixtureGeneratorService.applyScheduling(matches, config, teamsMap).map(f => ({
        ...f,
        transportRequired: false,
        // Mock weather
        weatherForecast: {
            condition: ["Sunny", "Cloudy", "Rain"][Math.floor(Math.random() * 3)],
            temp: 18 + Math.floor(Math.random() * 10),
            precipitation: Math.floor(Math.random() * 40)
        }
    }));
    setDraftFixtures(draft);
    setClashes(fixtureGeneratorService.detectClashes(draft));
    setStep(4);
  };

  const handleUpdateFixture = (index: number, updates: Partial<DraftFixture>) => {
    const newDraft = [...draftFixtures];
    newDraft[index] = { ...newDraft[index], ...updates };
    setDraftFixtures(newDraft);
    setClashes(fixtureGeneratorService.detectClashes(newDraft));
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      const result = await bulkCreateFixturesAction(draftFixtures, selectedCompId, selectedSeasonId);
      if (result.success) {
        toast({
          title: "Success",
          description: `Successfully created ${result.count} fixtures.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create fixtures.",
          variant: "destructive"
        });
      }
    } catch (error) {
       toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step > i + 1 ? 'bg-primary text-primary-foreground' :
              step === i + 1 ? 'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground'
            }`}>
              {step > i + 1 ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
            </div>
            {i < 3 && (
              <div className={`h-1 w-12 sm:w-24 mx-2 transition-colors ${step > i + 1 ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" />
              Competition Context
            </CardTitle>
            <CardDescription>Select the season and competition you are scheduling for.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Season</Label>
                <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
                  <SelectTrigger><SelectValue placeholder="Select Season" /></SelectTrigger>
                  <SelectContent>
                    {seasons.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Competition (Optional)</Label>
                <Select value={selectedCompId} onValueChange={setSelectedCompId}>
                  <SelectTrigger><SelectValue placeholder="Select Competition" /></SelectTrigger>
                  <SelectContent>
                    {competitions.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Teams
            </CardTitle>
            <CardDescription>Pick the teams that will participate in this schedule.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2">
              {teams.map(team => (
                <div key={team.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    id={team.id} 
                    checked={selectedTeamIds.includes(team.id)}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedTeamIds([...selectedTeamIds, team.id]);
                      else setSelectedTeamIds(selectedTeamIds.filter(id => id !== team.id));
                    }}
                  />
                  <Label htmlFor={team.id} className="text-sm font-medium cursor-pointer flex-1">{team.name}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Scheduling Logic
            </CardTitle>
            <CardDescription>Define how matches should be spread across dates and fields.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={config.startDate} onChange={e => setConfig({...config, startDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Default Start Time</Label>
                <Input type="time" value={config.startTime} onChange={e => setConfig({...config, startTime: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Available Fields (Pool)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                 {fields.map(field => (
                  <div key={field.id} className="flex items-center space-x-2 p-2 border rounded">
                    <Checkbox 
                      id={`field-${field.id}`} 
                      checked={config.fieldPoolIds.includes(field.id)}
                      onCheckedChange={(checked) => {
                        if (checked) setConfig({...config, fieldPoolIds: [...config.fieldPoolIds, field.id]});
                        else setConfig({...config, fieldPoolIds: config.fieldPoolIds.filter(id => id !== field.id)});
                      }}
                    />
                    <Label htmlFor={`field-${field.id}`} className="text-xs truncate">{field.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Review Draft Fixtures</h2>
            <div className="flex gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {selectedTeamIds.length} Teams
                </Badge>
                 <Badge variant="outline" className="flex items-center gap-1">
                    <LayoutGrid className="h-3 w-3" /> {draftFixtures.length} Matches
                </Badge>
            </div>
          </div>

          <ConflictAlert conflicts={clashes} />
          
          <div className="space-y-3">
            {draftFixtures.map((fixture, i) => (
              <Card key={i} className={`overflow-hidden transition-all ${editingId === i ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}>
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Left: Metadata & Weather */}
                    <div className="w-full sm:w-48 bg-muted/30 p-4 border-b sm:border-b-0 sm:border-r space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{fixture.roundName}</span>
                            <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                                <Cloud className="h-3 w-3" /> 
                                {fixture.weatherForecast?.temp}°C · {fixture.weatherForecast?.condition}
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="flex items-center gap-1"><Bus className="h-3 w-3" /> Transport</span>
                                <Switch 
                                    checked={fixture.transportRequired} 
                                    onCheckedChange={(checked) => handleUpdateFixture(i, { transportRequired: checked })}
                                    className="scale-75"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Middle: Match Details / Edit Form */}
                    <div className="flex-1 p-4">
                      {editingId === i ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[10px]">Date & Time</Label>
                                <Input 
                                    type="datetime-local" 
                                    className="h-8 text-xs"
                                    value={fixture.scheduledStartAt.slice(0, 16)} 
                                    onChange={(e) => handleUpdateFixture(i, { scheduledStartAt: e.target.value + ":00.000Z" })} 
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px]">Ground</Label>
                                <Select 
                                    value={fixture.fieldId} 
                                    onValueChange={(val) => handleUpdateFixture(i, { fieldId: val })}
                                >
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select Field" /></SelectTrigger>
                                    <SelectContent>
                                        {fields.map(f => <SelectItem key={f.id} value={f.id} className="text-xs">{f.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 flex items-center justify-around gap-2">
                                <span className="text-sm font-bold truncate max-w-[120px] text-right">{fixture.homeTeamName}</span>
                                <Badge variant="secondary" className="px-1 py-0 text-[10px]">VS</Badge>
                                <span className="text-sm font-bold truncate max-w-[120px]">{fixture.awayTeamName}</span>
                            </div>
                            <div className="hidden md:flex flex-col items-end shrink-0 border-l pl-4 border-border/50">
                                <span className="text-xs font-semibold">{new Date(fixture.scheduledStartAt).toLocaleDateString()}</span>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-2.5 w-2.5" /> {fields.find(f => f.id === fixture.fieldId)?.name || 'TBD'}
                                    </span>
                                    {fixture.fieldId && (
                                        <Badge variant="outline" className={`mt-1 text-[9px] px-1 py-0 border-none ${
                                            draftFixtures.filter(df => df.fieldId === fixture.fieldId && df.scheduledStartAt === fixture.scheduledStartAt).length > 1 
                                            ? 'bg-red-500/10 text-red-500' 
                                            : 'bg-green-500/10 text-green-500'
                                        }`}>
                                            Saturation: {draftFixtures.filter(df => df.fieldId === fixture.fieldId && df.scheduledStartAt === fixture.scheduledStartAt).length}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="bg-muted/10 p-2 sm:w-12 flex sm:flex-col items-center justify-center gap-2 border-t sm:border-t-0 sm:border-l">
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setEditingId(editingId === i ? null : i)}
                         >
                            {editingId === i ? <Save className="h-4 w-4 text-green-500" /> : <Edit2 className="h-3 w-3" />}
                         </Button>
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                                setDraftFixtures(draftFixtures.filter((_, idx) => idx !== i));
                                setClashes(fixtureGeneratorService.detectClashes(draftFixtures.filter((_, idx) => idx !== i)));
                            }}
                         >
                            <Trash2 className="h-3 w-3" />
                         </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={() => setStep(s => s - 1)}
          disabled={step === 1 || loading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        {step < 3 ? (
          <Button 
            onClick={() => setStep(s => s + 1)}
            disabled={step === 2 && selectedTeamIds.length < 2}
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : step === 3 ? (
          <Button onClick={handleGenerateDraft}>
            Generate Draft <Settings className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSaveAll} disabled={loading || clashes.length > 0}>
             {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             Save All Fixtures
          </Button>
        )}
      </div>
    </div>
  );
}
