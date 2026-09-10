"use client";

import { useState, useEffect, useMemo, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { 
  createTeamAction, 
  getCoachesBySchoolAction, 
  checkDuplicateTeamAction,
  TeamActionState 
} from "@/app/actions/teamActions";
import { 
  ListOrganisationsData, 
  ListAgeDivisionsData, 
  ListSeasonsData, 
  ListTeamClassesData 
} from "@/generated/dataconnect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  School as SchoolIcon, 
  Calendar, 
  Users, 
  Trophy,
  Wand2,
  AlertCircle,
  History,
  BarChart3,
  Lightbulb,
  ShieldAlert,
  Palette,
  Layers
} from "lucide-react";
import { CoachMultiSelect } from "./CoachMultiSelect";
import { TeamPreviewCard } from "./TeamPreviewCard";
import { usePermissionView } from "@/contexts/PermissionViewContext";
import { 
  generateTeamNames, 
  getSmartSuffixSuggestions, 
  detectNamingPattern, 
  GeneratedName 
} from "@/lib/utils/TeamNameGenerator";

interface SmartTeamCreatorProps {
  organisations: ListOrganisationsData['organisations'];
  ageDivisions: ListAgeDivisionsData['ageDivisions'];
  activeSeason: ListSeasonsData['seasons'][0] | null;
  teamClasses: ListTeamClassesData['teamClasses'];
}

const COLOR_PRESETS = [
  { name: "School Default", primary: "inherit", secondary: "inherit" },
  { name: "Navy & Gold", primary: "#1e3a5f", secondary: "#d4af37" },
  { name: "Maroon & White", primary: "#800000", secondary: "#ffffff" },
  { name: "Green & Gold", primary: "#006400", secondary: "#ffd700" },
  { name: "Black & Red", primary: "#1a1a1a", secondary: "#dc2626" },
  { name: "Royal Blue & Silver", primary: "#4169e1", secondary: "#c0c0c0" },
  { name: "Purple & Gold", primary: "#6b21a8", secondary: "#d4af37" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto font-heading italic">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Team...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Create Team
        </>
      )}
    </Button>
  );
}

export function SmartTeamCreator({ organisations, ageDivisions, activeSeason, teamClasses }: SmartTeamCreatorProps) {
  const { currentRole } = usePermissionView();
  const ALLOWED_ROLES = [
    "System Architect",
    "Admin",
    "Sportsmaster",
    "School Admin"
  ];

  const isAllowed = ALLOWED_ROLES.includes(currentRole);

  // Form State
  const initialState: TeamActionState = {};
  const [state, action] = useActionState(createTeamAction, initialState);
  
  // Wizard State
  const [selectedOrganisationId, setSelectedOrganisationId] = useState<string>("");
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(activeSeason?.id || "");
  const [selectedAgeDivisionId, setSelectedAgeDivisionId] = useState<string>("");
  const [selectedTeamClassId, setSelectedTeamClassId] = useState<string>("");
  const [suffix, setSuffix] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");
  const [abbreviatedName, setAbbreviatedName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>([]);
  
  // Team Colors State
  const [useSchoolColors, setUseSchoolColors] = useState(true);
  const [primaryColor, setPrimaryColor] = useState("#1e3a5f");
  const [secondaryColor, setSecondaryColor] = useState("#d4af37");
  
  // Data State
  const [schoolCoaches, setSchoolCoaches] = useState<any[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [suggestedSuffix, setSuggestedSuffix] = useState<string | null>(null);

  // Derived State
  const selectedOrganisation = useMemo(() => 
    organisations.find(o => o.id === selectedOrganisationId), 
    [organisations, selectedOrganisationId]
  );

  const selectedAgeDivision = useMemo(() => 
    (ageDivisions || []).find(d => d.id === selectedAgeDivisionId), 
    [ageDivisions, selectedAgeDivisionId]
  );

  // 1. Auto-generate names when key fields change
  useEffect(() => {
    if (selectedOrganisation && selectedAgeDivision && suffix) {
      const suggestions = generateTeamNames({
        schoolName: selectedOrganisation.name,
        schoolAbbreviation: selectedOrganisation.shortName || selectedOrganisation.name.substring(0, 3).toUpperCase(),
        ageGroup: selectedAgeDivision.name,
        suffix: suffix,
        nickname: nickname
      });
      setGeneratedNames(suggestions);
      
      if (!teamName) {
        const best = suggestions.find(n => n.format === 'abbreviated') || suggestions[0];
        if (best) setTeamName(best.name);
      }

      if (!abbreviatedName && selectedOrganisation.shortName) {
        setAbbreviatedName(`${selectedOrganisation.shortName} ${selectedAgeDivision.name}${suffix}`);
      }
    }
  }, [selectedOrganisation, selectedAgeDivision, suffix, nickname, teamName, abbreviatedName]);

  if (!isAllowed) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900">
        <CardContent className="pt-6 text-center">
          <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-bold mb-2 text-red-700 dark:text-red-400">Access Denied</h3>
          <p className="text-red-600 dark:text-red-300">You do not have permission to create teams in Phase 3.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN - WIZARD FORM */}
      <div className="lg:col-span-2 space-y-6">
        <form action={action} className="space-y-8">
          {/* Hidden Inputs for Server Action */}
          <input type="hidden" name="coachIds" value={selectedCoachIds.join(',')} />
          <input type="hidden" name="organisationId" value={selectedOrganisationId} />
          <input type="hidden" name="seasonId" value={selectedSeasonId} />
          <input type="hidden" name="ageDivisionId" value={selectedAgeDivisionId} />
          <input type="hidden" name="teamClassId" value={selectedTeamClassId} />
          
          {/* Step 1: Organisation & Season */}
          <Card className="border-primary/20 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-heading italic">
                <SchoolIcon className="h-5 w-5 text-primary" />
                1. Context & Global Identity
              </CardTitle>
              <CardDescription>Select the target organization and active season.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Organisation / School *</Label>
                  <Select 
                    required 
                    value={selectedOrganisationId} 
                    onValueChange={setSelectedOrganisationId}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select Organisation" />
                    </SelectTrigger>
                    <SelectContent>
                      {organisations.map(org => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Season *</Label>
                  <Select 
                    required 
                    value={selectedSeasonId} 
                    onValueChange={setSelectedSeasonId}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select Season" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Assuming seasons list is passed or fetched */}
                      <SelectItem value={activeSeason?.id || ""}>{activeSeason?.name || "Active Season"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Division & Classification */}
          <Card className={`border-primary/20 shadow-sm overflow-hidden ${!selectedOrganisationId ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="h-1.5 bg-primary/60" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-heading italic">
                <Layers className="h-5 w-5 text-primary" />
                2. Classification & Suffix
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Age Division *</Label>
                  <Select 
                    required
                    value={selectedAgeDivisionId}
                    onValueChange={setSelectedAgeDivisionId}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select Division" />
                    </SelectTrigger>
                    <SelectContent>
                      {(ageDivisions || []).map(div => (
                        <SelectItem key={div.id} value={div.id}>
                          {div.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Team Class / Level *</Label>
                  <Select 
                    required
                    value={selectedTeamClassId}
                    onValueChange={setSelectedTeamClassId}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select Label (e.g. A, B, Elite)" />
                    </SelectTrigger>
                    <SelectContent>
                      {(teamClasses || []).map(tc => (
                        <SelectItem key={tc.id} value={tc.id}>
                          {tc.label} ({tc.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Internal Suffix (Optional)</Label>
                <Input 
                  name="suffix"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  placeholder="e.g. 1st XI, A-Team"
                />
              </div>

              {/* Name Suggestions */}
              {generatedNames.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-primary/10">
                  <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wand2 className="h-4 w-4 text-primary" />
                    Smart Name Suggestions
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {generatedNames.slice(0, 4).map((gn) => (
                      <Badge 
                        key={gn.name}
                        variant={teamName === gn.name ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20"
                        onClick={() => setTeamName(gn.name)}
                      >
                        {gn.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Final Registered Team Name *</Label>
                <Input 
                  name="name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Westville 1st XI"
                  required
                  className="bg-primary/5 border-primary/20 font-bold"
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Identity & Branding */}
          <Card className={`border-primary/20 shadow-sm overflow-hidden ${!selectedOrganisationId ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="h-1.5 bg-primary/40" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-heading italic">
                <Palette className="h-5 w-5 text-primary" />
                3. Identity & Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Abbreviation</Label>
                  <Input 
                    name="abbreviatedName"
                    value={abbreviatedName}
                    onChange={(e) => setAbbreviatedName(e.target.value)}
                    placeholder="e.g. WBHS 1st"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nickname</Label>
                  <Input 
                    name="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. The Griffins"
                  />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-primary/10">
                <Label>Team Colors (Legacy Mirror)</Label>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2 text-center">
                    <div className="w-12 h-12 rounded-full mx-auto border-2 border-primary/20" style={{backgroundColor: primaryColor}} />
                    <span className="text-xs font-mono">{primaryColor}</span>
                   </div>
                   <div className="space-y-2 text-center">
                    <div className="w-12 h-12 rounded-full mx-auto border-2 border-primary/20" style={{backgroundColor: secondaryColor}} />
                    <span className="text-xs font-mono">{secondaryColor}</span>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="ghost" type="button" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN - PREVIEW */}
      <div className="lg:col-span-1 space-y-6">
        <div className="sticky top-24">
          <h3 className="font-heading italic text-muted-foreground uppercase tracking-wider text-sm mb-4">
            Relational Preview
          </h3>
          <TeamPreviewCard 
            teamName={teamName}
            schoolName={selectedOrganisation?.name}
            divisionName={selectedAgeDivision?.name}
            ageGroup={selectedAgeDivision?.name}
            suffix={suffix}
            seasonName={activeSeason?.name}
            coaches={[]}
            nickname={nickname}
            abbreviation={abbreviatedName}
            teamColors={{ primary: primaryColor, secondary: secondaryColor }}
          />
          
          <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
            <h4 className="font-heading italic text-primary flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Phase 3 Insights
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You are using the <span className="font-bold text-foreground italic">V4 Relational Engine</span>. 
              This team will be linked directly to the PostgreSQL backbone via Firebase Data Connect.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Relational Integrity</span>
                <span className="text-emerald-500 font-bold">100%</span>
              </div>
              <div className="w-full bg-primary/10 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
