"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { CoachActionState } from "@/app/actions/coachActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, CheckCircle2, AlertTriangle, Activity, Camera, User, BookOpen, Users, Briefcase, Trophy, Brain } from "lucide-react";
import { useFormStatus } from "react-dom";
import { School } from "@/types/firestore";
import { coachSchema } from "@/lib/validations/coachSchema";
import { z } from "zod";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
// import { deleteCoachAction } from "@/app/actions/coachActions"; // TODO: Implement delete action
import { Slider } from "@/components/ui/slider";
import { USER_ROLES, ROLE_GROUPS } from "@/lib/roles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoachTraitsManager, CoachSeasonStatsManager } from "./CoachArrayFields";
import { Textarea } from "@/components/ui/textarea";
import { SchoolTeamAssignment } from "@/components/common/SchoolTeamAssignment";

interface CoachFormProps {
  mode: 'create' | 'edit';
  coachAction: (prevState: CoachActionState, formData: FormData) => Promise<CoachActionState>;
  initialState: CoachActionState;
  initialData?: any;
  schools: School[];
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
          {mode === 'create' ? 'Create Coach' : 'Save Changes'}
        </>
      )}
    </Button>
  );
}

const COACH_ATTRIBUTE_GROUPS = {
  coachingAttributes: [
    { key: 'battingCoaching', label: 'Batting Coaching' },
    { key: 'fastBowlingCoaching', label: 'Fast Bowling Coaching' },
    { key: 'spinBowlingCoaching', label: 'Spin Bowling Coaching' },
    { key: 'fieldingCoaching', label: 'Fielding Coaching' },
    { key: 'wicketkeepingCoaching', label: 'Wicketkeeping Coaching' },
    { key: 'youthDevelopment', label: 'Youth Development' },
    { key: 'seniorDevelopment', label: 'Senior Development' },
    { key: 'oneToOneCoaching', label: '1-on-1 Coaching' },
    { key: 'sessionPlanning', label: 'Session Planning' },
    { key: 'videoAnalysisUse', label: 'Video & Data Use' },
  ],
  tacticalAttributes: [
    { key: 'tacticsLimitedOvers', label: 'Tactics (Limited Overs)' },
    { key: 'tacticsLongFormat', label: 'Tactics (Long Format)' },
    { key: 'fieldSetting', label: 'Field Setting' },
    { key: 'bowlingChanges', label: 'Bowling Changes' },
    { key: 'battingOrderConstruction', label: 'Batting Order' },
    { key: 'inGameAdaptability', label: 'In-Game Adaptability' },
    { key: 'analyticsUse', label: 'Use of Analytics' },
    { key: 'oppositionAnalysis', label: 'Opposition Analysis' },
  ],
  manManagementAttributes: [
    { key: 'playerCommunication', label: 'Player Communication' },
    { key: 'parentCommunication', label: 'Parent Communication' },
    { key: 'motivation', label: 'Motivation' },
    { key: 'conflictManagement', label: 'Conflict Management' },
    { key: 'disciplineStandards', label: 'Discipline' },
    { key: 'leadershipPresence', label: 'Leadership Presence' },
    { key: 'playerWelfare', label: 'Player Welfare' },
    { key: 'feedbackQuality', label: 'Feedback Quality' },
  ],
  professionalAttributes: [
    { key: 'organisation', label: 'Organisation' },
    { key: 'attentionToDetail', label: 'Attention to Detail' },
    { key: 'opennessToNewMethods', label: 'Openness to New Methods' },
    { key: 'consistency', label: 'Consistency' },
    { key: 'workEthic', label: 'Work Ethic' },
    { key: 'pressureComposure', label: 'Composure Under Pressure' },
    { key: 'longTermPlanning', label: 'Long-Term Vision' },
  ],
};

export function CoachForm({ mode, coachAction, initialState, initialData = {}, schools }: CoachFormProps) {
  const [state, action] = useFormState(coachAction, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  
  // Avatar and name state for live preview
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || '');
  const [firstName, setFirstName] = useState(initialData.firstName || '');
  const [lastName, setLastName] = useState(initialData.lastName || '');
  const [selectedRole, setSelectedRole] = useState(initialData.role || 'Coach');
  
  // Generate initials from name
  const getInitials = () => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || '?';
  };

  // Initialize attributes state
  const initializeGroup = (groupKey: keyof typeof COACH_ATTRIBUTE_GROUPS) => {
    const group = COACH_ATTRIBUTE_GROUPS[groupKey];
    const values: Record<string, number> = {};
    group.forEach(attr => {
      values[attr.key] = initialData.coachProfile?.[groupKey]?.[attr.key] || 10;
    });
    return values;
  };

  const [attributes, setAttributes] = useState({
    coachingAttributes: initializeGroup('coachingAttributes'),
    tacticalAttributes: initializeGroup('tacticalAttributes'),
    manManagementAttributes: initializeGroup('manManagementAttributes'),
    professionalAttributes: initializeGroup('professionalAttributes'),
  });

  // State for Array Fields
  const [coachTraits, setCoachTraits] = useState<string[]>(initialData.coachProfile?.coachTraits || []);
  const [coachSeasonStats, setCoachSeasonStats] = useState(initialData.coachProfile?.coachSeasonStats || []);

  // Client-side validation on blur
  const validateField = (name: string, value: string) => {
    try {
      const field = name.split('.')[0]; 
      if (field in coachSchema.shape) {
        // @ts-ignore
        coachSchema.shape[field].parse(value);
        setClientErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setClientErrors(prev => ({
          ...prev,
          [name]: error.issues[0].message
        }));
      }
    }
  };

  const showSuccess = state.success;

  const getRatingColor = (rating: number) => {
    if (rating < 8) return "text-red-500";
    if (rating < 14) return "text-yellow-500";
    return "text-emerald-500";
  };

  const updateAttribute = (group: keyof typeof attributes, key: string, value: number) => {
    setAttributes(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value
      }
    }));
  };

  const renderAttributeGroup = (groupKey: keyof typeof COACH_ATTRIBUTE_GROUPS) => {
    const group = COACH_ATTRIBUTE_GROUPS[groupKey];
    const values = attributes[groupKey] as Record<string, number>;
    
    const avg = Math.round(Object.values(values).reduce((a, b) => a + b, 0) / Object.values(values).length);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Attributes</h4>
          <span className={`text-sm font-bold ${getRatingColor(avg)}`}>Avg: {avg}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {group.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <Label className="font-medium">{label}</Label>
                <span className={`font-mono font-bold ${getRatingColor(values[key])}`}>{values[key]}</span>
              </div>
              <Slider 
                value={[values[key]]} 
                onValueChange={(vals) => updateAttribute(groupKey, key, vals[0])}
                max={20}
                step={1}
                className="h-4"
              />
              <input type="hidden" name={`${groupKey}.${key}`} value={values[key]} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <form action={action} className="space-y-6">
      {showSuccess && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Coach {mode === 'create' ? 'created' : 'updated'} successfully!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'Add New Coach' : 'Edit Coach'}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Fill in the coach information below. Fields marked with * are required.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Personal Information</h3>
            
            {/* Avatar Section */}
            <div className="flex items-start gap-6 p-4 bg-muted/10 rounded-lg border border-dashed">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={avatarUrl} 
                      alt="Coach Avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`flex items-center justify-center w-full h-full ${avatarUrl ? 'hidden' : ''}`}>
                    {firstName || lastName ? (
                      <span className="text-2xl font-bold text-white">{getInitials()}</span>
                    ) : (
                      <User className="h-10 w-10 text-white/80" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1.5 shadow-md border">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <Label htmlFor="avatarUrl">Photo URL</Label>
                <Input 
                  id="avatarUrl" 
                  name="avatarUrl" 
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="bg-background"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input 
                  id="firstName" 
                  name="firstName" 
                  defaultValue={initialData.firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={(e) => validateField('firstName', e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  defaultValue={initialData.lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={(e) => validateField('lastName', e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input 
                  id="dateOfBirth" 
                  name="dateOfBirth" 
                  type="date"
                  defaultValue={initialData.dateOfBirth?.split('T')[0]}
                  onBlur={(e) => validateField('dateOfBirth', e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  defaultValue={initialData.email}
                  onBlur={(e) => validateField('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone</Label>
                <Input 
                  id="phoneNumber" 
                  name="phoneNumber" 
                  defaultValue={initialData.phoneNumber}
                  onBlur={(e) => validateField('phoneNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <SchoolTeamAssignment 
                  initialSchools={initialData.assignedSchools || (initialData.schoolId ? [initialData.schoolId] : [])}
                  initialTeams={initialData.teamIds || []}
                />
                {/* Fallback for legacy schoolId if needed by other components, though SchoolTeamAssignment handles assignedSchools */}
                <input type="hidden" name="schoolId" value={initialData.schoolId || ''} /> 
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">System Role</Label>
                <Select 
                  name="role" 
                  value={selectedRole} 
                  onValueChange={setSelectedRole}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_GROUPS).map(([group, roles]) => (
                      <SelectGroup key={group}>
                        <SelectLabel>{group}</SelectLabel>
                        {roles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={initialData.status || 'active'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Detailed Coach Profile */}
          <div className="space-y-8 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Coach Profile & Attributes
              </h3>
            </div>
            
            <Tabs defaultValue="coaching" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="coaching" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Coaching
                </TabsTrigger>
                <TabsTrigger value="tactical" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" /> Tactical
                </TabsTrigger>
                <TabsTrigger value="manManagement" className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Man Mgmt
                </TabsTrigger>
                <TabsTrigger value="professional" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Professional
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="coaching" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentRole">Current Role</Label>
                    <Input 
                      id="currentRole" 
                      name="currentRole"
                      placeholder="e.g. Head Coach 1st XI"
                      defaultValue={initialData.coachProfile?.currentRole}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qualificationLevel">Qualification</Label>
                    <Select name="qualificationLevel" defaultValue={initialData.coachProfile?.qualificationLevel || 'CSA Level 1'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CSA Level 1">CSA Level 1</SelectItem>
                        <SelectItem value="CSA Level 2">CSA Level 2</SelectItem>
                        <SelectItem value="CSA Level 3">CSA Level 3</SelectItem>
                        <SelectItem value="CSA Level 4">CSA Level 4</SelectItem>
                        <SelectItem value="High Performance">High Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {renderAttributeGroup('coachingAttributes')}
              </TabsContent>

              <TabsContent value="tactical" className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label>Philosophy Summary</Label>
                  <Textarea 
                    name="philosophySummary" 
                    placeholder="Describe coaching philosophy..." 
                    defaultValue={initialData.coachProfile?.philosophySummary}
                  />
                </div>
                {renderAttributeGroup('tacticalAttributes')}
              </TabsContent>

              <TabsContent value="manManagement" className="mt-6">
                {renderAttributeGroup('manManagementAttributes')}
              </TabsContent>

              <TabsContent value="professional" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Coaching Since</Label>
                    <Input 
                      type="number" 
                      name="coachingSince" 
                      placeholder="Year" 
                      defaultValue={initialData.coachProfile?.coachingSince}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reputation (1-5)</Label>
                    <Input 
                      type="number" 
                      name="reputation" 
                      min="1" max="5" 
                      defaultValue={initialData.coachProfile?.reputation || 1}
                    />
                  </div>
                </div>
                {renderAttributeGroup('professionalAttributes')}
              </TabsContent>

              <TabsContent value="history" className="mt-6 space-y-8">
                <div className="space-y-4">
                  <CoachTraitsManager initialData={coachTraits} onChange={setCoachTraits} />
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <CoachSeasonStatsManager initialData={coachSeasonStats} onChange={setCoachSeasonStats} />
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Hidden Inputs for Array Fields */}
            <input type="hidden" name="coachTraits" value={JSON.stringify(coachTraits)} />
            <input type="hidden" name="coachSeasonStats" value={JSON.stringify(coachSeasonStats)} />
          </div>

          {state.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-between bg-muted/50">
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
