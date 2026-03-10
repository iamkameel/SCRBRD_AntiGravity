"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { PlayerActionState } from "@/app/actions/playerActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, CheckCircle2, AlertTriangle, Activity, Camera, User, Dumbbell, Brain, Target, Shield } from "lucide-react";
import { useFormStatus } from "react-dom";
import { School } from "@/types/firestore";
import { playerSchema, PlayerFormData } from "@/lib/validations/playerSchema";
import { z } from "zod";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { deletePlayerAction } from "@/app/actions/playerActions";
import { Slider } from "@/components/ui/slider";
import { USER_ROLES, ROLE_GROUPS } from "@/lib/roles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TraitsManager, RoleRatingsManager, ZoneAnalysisManager, CoachReportsManager, AchievementsManager } from "./PlayerArrayFields";
import { ClipboardList, Trophy, UserCog, History } from "lucide-react";
import { SchoolTeamAssignment } from "@/components/common/SchoolTeamAssignment";

interface PlayerFormProps {
  mode: 'create' | 'edit';
  playerAction: (prevState: PlayerActionState, formData: FormData) => Promise<PlayerActionState>;
  initialState: PlayerActionState;
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
          {mode === 'create' ? 'Create Player' : 'Save Changes'}
        </>
      )}
    </Button>
  );
}

const ATTRIBUTE_GROUPS = {
  battingAttributes: [
    { key: 'frontFoot', label: 'Front Foot' },
    { key: 'backFoot', label: 'Back Foot' },
    { key: 'powerHitting', label: 'Power Hitting' },
    { key: 'timing', label: 'Timing' },
    { key: 'shotRange', label: 'Shot Range' },
    { key: 'sweep', label: 'Sweep' },
    { key: 'reverseSweep', label: 'Reverse Sweep' },
    { key: 'spinReading', label: 'Spin Reading' },
    { key: 'seamAdaptation', label: 'Seam Adaptation' },
    { key: 'strikeRotation', label: 'Strike Rotation' },
    { key: 'finishing', label: 'Finishing' },
  ],
  bowlingAttributes: [
    { key: 'stockBallControl', label: 'Stock Ball Control' },
    { key: 'variations', label: 'Variations' },
    { key: 'powerplaySkill', label: 'Powerplay Skill' },
    { key: 'middleOversControl', label: 'Middle Overs' },
    { key: 'deathOversSkill', label: 'Death Overs' },
    { key: 'lineLengthConsistency', label: 'Line & Length' },
    { key: 'spinManipulation', label: 'Spin Manipulation' },
    { key: 'releaseMechanics', label: 'Release Mechanics' },
    { key: 'tacticalOverConstruction', label: 'Tactical Over Construction' },
  ],
  fieldingAttributes: [
    { key: 'closeCatching', label: 'Close Catching' },
    { key: 'deepCatching', label: 'Deep Catching' },
    { key: 'groundFielding', label: 'Ground Fielding' },
    { key: 'throwingPower', label: 'Throwing Power' },
    { key: 'throwingAccuracy', label: 'Throwing Accuracy' },
    { key: 'reactionSpeed', label: 'Reaction Speed' },
    { key: 'anticipation', label: 'Anticipation' },
  ],
  mentalAttributes: [
    { key: 'temperament', label: 'Temperament' },
    { key: 'gameAwareness', label: 'Game Awareness' },
    { key: 'pressureHandling', label: 'Pressure Handling' },
    { key: 'patience', label: 'Patience' },
    { key: 'killerInstinct', label: 'Killer Instinct' },
    { key: 'decisionMaking', label: 'Decision Making' },
    { key: 'adaptability', label: 'Adaptability' },
    { key: 'workEthic', label: 'Work Ethic' },
    { key: 'leadership', label: 'Leadership' },
    { key: 'competitiveness', label: 'Competitiveness' },
  ],
  physicalAttributes: [
    { key: 'speed', label: 'Speed' },
    { key: 'acceleration', label: 'Acceleration' },
    { key: 'agility', label: 'Agility' },
    { key: 'strength', label: 'Strength' },
    { key: 'stamina', label: 'Stamina' },
    { key: 'balance', label: 'Balance' },
    { key: 'coreFitness', label: 'Core Fitness' },
    { key: 'injuryResistance', label: 'Injury Resistance' },
  ],
};

export function PlayerForm({ mode, playerAction, initialState, initialData = {}, schools }: PlayerFormProps) {
  const [state, action] = useFormState(playerAction, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  
  // Avatar and name state for live preview
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || '');
  const [firstName, setFirstName] = useState(initialData.firstName || '');
  const [lastName, setLastName] = useState(initialData.lastName || '');
  const [selectedRole, setSelectedRole] = useState(initialData.role || USER_ROLES.PLAYER);
  
  // Generate initials from name
  const getInitials = () => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || '?';
  };

  // Initialize skills state from deep nested profile or defaults
  const initializeGroup = (groupKey: keyof typeof ATTRIBUTE_GROUPS) => {
    const group = ATTRIBUTE_GROUPS[groupKey];
    const values: Record<string, number> = {};
    group.forEach(attr => {
      // Check initialData.playerProfile.[groupKey].[attr.key]
      values[attr.key] = initialData.playerProfile?.[groupKey]?.[attr.key] || 10;
    });
    return values;
  };

  const [skills, setSkills] = useState({
    battingAttributes: initializeGroup('battingAttributes'),
    bowlingAttributes: initializeGroup('bowlingAttributes'),
    fieldingAttributes: initializeGroup('fieldingAttributes'),
    mentalAttributes: initializeGroup('mentalAttributes'),
    physicalAttributes: initializeGroup('physicalAttributes'),
  });

  // State for new FM-Style Array Fields
  const [playerTraits, setPlayerTraits] = useState(initialData.playerProfile?.playerTraits || []);
  const [roleRatings, setRoleRatings] = useState(initialData.playerProfile?.roleRatings || []);
  const [zoneAnalysis, setZoneAnalysis] = useState(initialData.playerProfile?.zoneAnalysis || []);
  const [coachReports, setCoachReports] = useState(initialData.playerProfile?.coachReports || []);
  const [achievements, setAchievements] = useState(initialData.playerProfile?.achievements || []);

  // Client-side validation on blur
  const validateField = (name: string, value: string) => {
    try {
      // Validate single field
      const field = name.split('.')[0]; 
      if (field in playerSchema.shape) {
        playerSchema.shape[field as keyof typeof playerSchema.shape].parse(value);
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

  // Show success message if state indicates success
  const showSuccess = state.success;

  const getRatingColor = (rating: number) => {
    if (rating < 8) return "text-red-500";
    if (rating < 14) return "text-yellow-500";
    return "text-emerald-500";
  };

  const updateSkill = (group: keyof typeof skills, key: string, value: number) => {
    setSkills(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value
      }
    }));
  };

  const renderAttributeGroup = (groupKey: keyof typeof ATTRIBUTE_GROUPS) => {
    const group = ATTRIBUTE_GROUPS[groupKey];
    const values = skills[groupKey] as Record<string, number>;
    
    // Calculate average for the group
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
                onValueChange={(vals) => updateSkill(groupKey, key, vals[0])}
                max={20}
                step={1}
                className="h-4"
              />
              {/* Hidden input for form submission */}
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
            Player {mode === 'create' ? 'created' : 'updated'} successfully!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'Add New Player' : 'Edit Player'}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Fill in the player information below. Fields marked with * are required.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Personal Information</h3>
            
            {/* Avatar Section */}
            <div className="flex items-start gap-6 p-4 bg-muted/10 rounded-lg border border-dashed">
              {/* Avatar Preview */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={avatarUrl} 
                      alt="Player Avatar" 
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
              
              {/* Avatar URL Input */}
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
                <p className="text-xs text-muted-foreground">
                  Enter a URL for the player&apos;s profile photo. The preview will update automatically.
                </p>
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
                {(clientErrors.firstName || state.fieldErrors?.firstName) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.firstName || state.fieldErrors?.firstName[0]}
                  </p>
                )}
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
                {(clientErrors.lastName || state.fieldErrors?.lastName) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.lastName || state.fieldErrors?.lastName[0]}
                  </p>
                )}
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
                {(clientErrors.dateOfBirth || state.fieldErrors?.dateOfBirth) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.dateOfBirth || state.fieldErrors?.dateOfBirth[0]}
                  </p>
                )}
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
                {(clientErrors.email || state.fieldErrors?.email) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.email || state.fieldErrors?.email[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone</Label>
                <Input 
                  id="phoneNumber" 
                  name="phoneNumber" 
                  defaultValue={initialData.phoneNumber}
                  onBlur={(e) => validateField('phoneNumber', e.target.value)}
                  placeholder="+27 XX XXX XXXX"
                />
                {(clientErrors.phoneNumber || state.fieldErrors?.phoneNumber) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.phoneNumber || state.fieldErrors?.phoneNumber[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolId">School *</Label>
                <Select name="schoolId" defaultValue={initialData.schoolId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select School" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map(school => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state.fieldErrors?.schoolId && (
                  <p className="text-sm text-destructive">{state.fieldErrors.schoolId[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jerseyNumber">Jersey Number</Label>
                <Input 
                  id="jerseyNumber" 
                  name="jerseyNumber"
                  type="number"
                  min="1"
                  max="999"
                  defaultValue={initialData.jerseyNumber}
                  onBlur={(e) => validateField('jerseyNumber', e.target.value)}
                />
                {(clientErrors.jerseyNumber || state.fieldErrors?.jerseyNumber) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.jerseyNumber || state.fieldErrors?.jerseyNumber[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={initialData.status || 'active'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="injured">Injured</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>
          </div>

          {/* Detailed Skill Matrix - Only for Players */}
          {selectedRole === USER_ROLES.PLAYER && (
            <div className="space-y-8 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Player Profile & Attributes
                </h3>
              </div>
              
              <Tabs defaultValue="batting" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="batting" className="flex items-center gap-2">
                    <Target className="h-4 w-4" /> Batting
                  </TabsTrigger>
                  <TabsTrigger value="bowling" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Bowling
                  </TabsTrigger>
                  <TabsTrigger value="fielding" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Fielding
                  </TabsTrigger>
                  <TabsTrigger value="mental" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" /> Mental
                  </TabsTrigger>
                  <TabsTrigger value="physical" className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4" /> Physical
                  </TabsTrigger>
                  <TabsTrigger value="analysis" className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" /> Analysis
                  </TabsTrigger>
                  <TabsTrigger value="traits" className="flex items-center gap-2">
                    <UserCog className="h-4 w-4" /> Traits
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <History className="h-4 w-4" /> History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="batting" className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="battingStyle">Batting Style</Label>
                      <Select name="battingStyle" defaultValue={initialData.battingStyle || 'Right-hand Bat'}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Right-hand Bat">Right-hand Bat</SelectItem>
                          <SelectItem value="Left-hand Bat">Left-hand Bat</SelectItem>
                          <SelectItem value="Switch Hitter">Switch Hitter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryRole">Primary Role</Label>
                      <Select name="primaryRole" defaultValue={initialData.playerProfile?.primaryRole || 'Batsman'}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Batsman">Batsman</SelectItem>
                          <SelectItem value="Bowler">Bowler</SelectItem>
                          <SelectItem value="Batting All-Rounder">Batting All-Rounder</SelectItem>
                          <SelectItem value="Bowling All-Rounder">Bowling All-Rounder</SelectItem>
                          <SelectItem value="Wicketkeeper">Wicketkeeper</SelectItem>
                          <SelectItem value="Wicketkeeper Batsman">Wicketkeeper Batsman</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {renderAttributeGroup('battingAttributes')}
                </TabsContent>

                <TabsContent value="bowling" className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bowlingStyle">Bowling Style</Label>
                      <Select name="bowlingStyle" defaultValue={initialData.bowlingStyle || 'Right-arm Medium'}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Right-arm Fast">Right-arm Fast</SelectItem>
                          <SelectItem value="Right-arm Medium">Right-arm Medium</SelectItem>
                          <SelectItem value="Right-arm Off-Spin">Right-arm Off-Spin</SelectItem>
                          <SelectItem value="Right-arm Leg-Spin">Right-arm Leg-Spin</SelectItem>
                          <SelectItem value="Left-arm Fast">Left-arm Fast</SelectItem>
                          <SelectItem value="Left-arm Medium">Left-arm Medium</SelectItem>
                          <SelectItem value="Left-arm Orthodox">Left-arm Orthodox</SelectItem>
                          <SelectItem value="Left-arm Chinaman">Left-arm Chinaman</SelectItem>
                          <SelectItem value="Does not bowl">Does not bowl</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {renderAttributeGroup('bowlingAttributes')}
                </TabsContent>

                <TabsContent value="fielding" className="mt-6">
                  {renderAttributeGroup('fieldingAttributes')}
                </TabsContent>

                <TabsContent value="mental" className="mt-6">
                  {renderAttributeGroup('mentalAttributes')}
                </TabsContent>

                <TabsContent value="physical" className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="heightCm">Height (cm)</Label>
                      <Input 
                        id="heightCm" 
                        name="heightCm"
                        type="number"
                        min="100"
                        max="250"
                        defaultValue={initialData.heightCm}
                        placeholder="e.g. 175"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weightKg">Weight (kg)</Label>
                      <Input 
                        id="weightKg" 
                        name="weightKg"
                        type="number"
                        min="20"
                        max="200"
                        defaultValue={initialData.weightKg}
                        placeholder="e.g. 70"
                      />
                    </div>
                  </div>
                  {renderAttributeGroup('physicalAttributes')}
                  {renderAttributeGroup('physicalAttributes')}
                </TabsContent>

                <TabsContent value="analysis" className="mt-6 space-y-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Target className="h-4 w-4" /> Zone Analysis
                    </h4>
                    <ZoneAnalysisManager initialData={zoneAnalysis} onChange={setZoneAnalysis} />
                  </div>
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" /> Coach Reports
                    </h4>
                    <CoachReportsManager initialData={coachReports} onChange={setCoachReports} />
                  </div>
                </TabsContent>

                <TabsContent value="traits" className="mt-6 space-y-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Brain className="h-4 w-4" /> Player Traits
                    </h4>
                    <TraitsManager initialData={playerTraits} onChange={setPlayerTraits} />
                  </div>
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <UserCog className="h-4 w-4" /> Role Ratings
                    </h4>
                    <RoleRatingsManager initialData={roleRatings} onChange={setRoleRatings} />
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-6 space-y-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Trophy className="h-4 w-4" /> Achievements
                    </h4>
                    <AchievementsManager initialData={achievements} onChange={setAchievements} />
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Hidden Inputs for Array Fields */}
              <input type="hidden" name="playerTraits" value={JSON.stringify(playerTraits)} />
              <input type="hidden" name="roleRatings" value={JSON.stringify(roleRatings)} />
              <input type="hidden" name="zoneAnalysis" value={JSON.stringify(zoneAnalysis)} />
              <input type="hidden" name="coachReports" value={JSON.stringify(coachReports)} />
              <input type="hidden" name="achievements" value={JSON.stringify(achievements)} />
            </div>
          )}

          {state.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-between bg-muted/50">
          {mode === 'edit' && initialData.id ? (
            <DeleteConfirmationDialog 
              entityName="player" 
              onDelete={async () => {
                await deletePlayerAction(initialData.id);
              }}
            />
          ) : (
            <div></div> 
          )}
          {/* School & Team Assignment */}
          <div className="space-y-4">
            <SchoolTeamAssignment
              initialSchools={initialData.assignedSchools || []}
              initialTeams={initialData.teamIds || []}
              mode="card"
            />
          </div>

          <div className="flex justify-end gap-4">
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
