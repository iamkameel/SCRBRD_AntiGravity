"use client";

import { useState, useEffect, useActionState } from "react";
import { TeamActionState, deleteTeamAction } from "@/app/actions/teamActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, CheckCircle2, AlertTriangle, Palette, Shield } from "lucide-react";
import { useFormStatus } from "react-dom";
import { School, Division } from "@/types/firestore";
import { TeamSchema } from "@/lib/validations/teamSchema";
import { z } from "zod";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";

interface TeamFormProps {
  mode: 'create' | 'edit';
  teamAction: (prevState: TeamActionState, formData: FormData) => Promise<TeamActionState>;
  initialState: TeamActionState;
  initialData?: any;
  schools: School[];
  divisions: Division[];
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
          {mode === 'create' ? 'Create Team' : 'Save Changes'}
        </>
      )}
    </Button>
  );
}

// Preset color palettes for teams
const COLOR_PRESETS = [
  { name: 'Navy & Gold', primary: '#1e3a5f', secondary: '#ffd700' },
  { name: 'Maroon & White', primary: '#800000', secondary: '#ffffff' },
  { name: 'Green & Gold', primary: '#006400', secondary: '#ffd700' },
  { name: 'Royal Blue & White', primary: '#4169e1', secondary: '#ffffff' },
  { name: 'Black & Gold', primary: '#000000', secondary: '#ffd700' },
  { name: 'Red & Black', primary: '#dc143c', secondary: '#000000' },
  { name: 'Purple & Gold', primary: '#663399', secondary: '#ffd700' },
  { name: 'Teal & White', primary: '#008080', secondary: '#ffffff' },
];

export function TeamForm({ mode, teamAction, initialState, initialData = {}, schools, divisions }: TeamFormProps) {
  const [state, action] = useActionState(teamAction, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  
  // Color state
  const [primaryColor, setPrimaryColor] = useState(initialData.teamColors?.primary || '#1e3a5f');
  const [secondaryColor, setSecondaryColor] = useState(initialData.teamColors?.secondary || '#ffd700');
  const [teamName, setTeamName] = useState(initialData.name || '');
  const [abbreviation, setAbbreviation] = useState(initialData.abbreviatedName || '');

  // Client-side validation on blur
  const validateField = (name: string, value: string) => {
    try {
      const field = name as keyof typeof TeamSchema.shape;
      if (field in TeamSchema.shape) {
        TeamSchema.shape[field].parse(value);
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

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
  };

  const showSuccess = state.success;

  return (
    <form action={action} className="space-y-6">
      {/* Hidden inputs for colors */}
      <input type="hidden" name="primaryColor" value={primaryColor} />
      <input type="hidden" name="secondaryColor" value={secondaryColor} />
      
      {showSuccess && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Team {mode === 'create' ? 'created' : 'updated'} successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{mode === 'create' ? 'Add New Team' : 'Edit Team'}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fill in the team information below. Fields marked with * are required.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Team Name *</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      defaultValue={initialData.name}
                      onChange={(e) => setTeamName(e.target.value)}
                      onBlur={(e) => validateField('name', e.target.value)}
                      placeholder="e.g. First XI"
                      required 
                    />
                    {(clientErrors.name || state.fieldErrors?.name) && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {clientErrors.name || state.fieldErrors?.name[0]}
                      </p>
                    )}
                  </div>

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
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {state.fieldErrors.schoolId[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="divisionId">Division</Label>
                    <Select name="divisionId" defaultValue={initialData.divisionId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Division (Optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map(division => (
                          <SelectItem key={division.id} value={division.id}>
                            {division.name} ({division.ageGroup})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="suffix">Suffix</Label>
                    <Input 
                      id="suffix" 
                      name="suffix" 
                      defaultValue={initialData.suffix}
                      onBlur={(e) => validateField('suffix', e.target.value)}
                      placeholder="e.g. A, B, U19A"
                    />
                    {clientErrors.suffix && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {clientErrors.suffix}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="abbreviatedName">Abbreviation</Label>
                    <Input 
                      id="abbreviatedName" 
                      name="abbreviatedName" 
                      defaultValue={initialData.abbreviatedName}
                      onChange={(e) => setAbbreviation(e.target.value)}
                      onBlur={(e) => validateField('abbreviatedName', e.target.value)}
                      placeholder="e.g. WDV 1st"
                      maxLength={10}
                    />
                    {clientErrors.abbreviatedName && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {clientErrors.abbreviatedName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nickname">Nickname</Label>
                    <Input 
                      id="nickname" 
                      name="nickname" 
                      defaultValue={initialData.nickname}
                      onBlur={(e) => validateField('nickname', e.target.value)}
                      placeholder="e.g. The Griffins"
                    />
                    {clientErrors.nickname && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {clientErrors.nickname}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Team Colors */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Team Colors
                </h3>
                
                {/* Color Presets */}
                <div className="space-y-2">
                  <Label>Quick Presets</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full border hover:border-primary transition-colors text-xs"
                        title={preset.name}
                      >
                        <span 
                          className="w-3 h-3 rounded-full border" 
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span 
                          className="w-3 h-3 rounded-full border" 
                          style={{ backgroundColor: preset.secondary }}
                        />
                        <span className="hidden sm:inline">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Pickers */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColorInput">Primary Color</Label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <input
                          type="color"
                          id="primaryColorInput"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                        />
                        <div 
                          className="w-10 h-10 rounded-lg border-2 cursor-pointer shadow-sm"
                          style={{ backgroundColor: primaryColor }}
                        />
                      </div>
                      <Input 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#1e3a5f"
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColorInput">Secondary Color</Label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <input
                          type="color"
                          id="secondaryColorInput"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                        />
                        <div 
                          className="w-10 h-10 rounded-lg border-2 cursor-pointer shadow-sm"
                          style={{ backgroundColor: secondaryColor }}
                        />
                      </div>
                      <Input 
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        placeholder="#ffd700"
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff & Leadership */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Staff & Leadership</h3>
                <div className="space-y-2">
                  <Label htmlFor="coachIds">Coach IDs (Comma separated)</Label>
                  <Input 
                    id="coachIds" 
                    name="coachIds" 
                    defaultValue={initialData.coachIds?.join(', ')} 
                    placeholder="e.g. coach1, coach2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter coach IDs separated by commas. Future version will have a multi-select dropdown.
                  </p>
                </div>
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
                <DeleteConfirmationDialog 
                  entityName="team" 
                  onDelete={async () => {
                    await deleteTeamAction(initialData.id);
                  }}
                />
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
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          {/* Team Badge Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                Badge Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {/* Badge */}
              <div 
                className="w-24 h-24 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
                  border: `3px solid ${secondaryColor}`
                }}
              >
                <span 
                  className="text-2xl font-bold"
                  style={{ color: secondaryColor }}
                >
                  {abbreviation || teamName.substring(0, 3).toUpperCase() || 'TM'}
                </span>
              </div>

              {/* Team Name */}
              <div className="text-center">
                <p className="font-bold">{teamName || 'Team Name'}</p>
                <p className="text-sm text-muted-foreground">{abbreviation || 'ABV'}</p>
              </div>

              {/* Color Swatches */}
              <div className="flex gap-2">
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-lg shadow-sm border"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Primary</p>
                </div>
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-lg shadow-sm border"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Secondary</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jersey Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                Jersey Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="relative w-32 h-40">
                {/* Jersey Shape */}
                <svg viewBox="0 0 100 120" className="w-full h-full">
                  {/* Main Body */}
                  <path 
                    d="M20 30 L0 40 L0 120 L100 120 L100 40 L80 30 L70 15 L30 15 Z"
                    fill={primaryColor}
                    stroke={secondaryColor}
                    strokeWidth="2"
                  />
                  {/* Collar */}
                  <path 
                    d="M30 15 Q50 25 70 15"
                    fill="none"
                    stroke={secondaryColor}
                    strokeWidth="3"
                  />
                  {/* Number */}
                  <text 
                    x="50" 
                    y="80" 
                    textAnchor="middle" 
                    fill={secondaryColor}
                    fontSize="30"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {abbreviation?.substring(0, 2) || '11'}
                  </text>
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
