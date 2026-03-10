'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, AlertTriangle, CheckCircle2 } from "lucide-react";
import { UmpireActionState } from '@/app/actions/umpireActions';
import { UmpireTraitsManager } from './UmpireArrayFields';
import { Person } from '@/types/firestore';

interface UmpireFormProps {
  mode: 'create' | 'edit';
  umpireAction: (prevState: UmpireActionState, formData: FormData) => Promise<UmpireActionState>;
  initialState: UmpireActionState;
  initialData?: Partial<Person>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Save Umpire Profile
        </>
      )}
    </Button>
  );
}

const UMPIRE_ATTRIBUTE_GROUPS = {
  decisionAttributes: {
    title: 'Decision Making',
    fields: [
      { key: 'lbwJudgement', label: 'LBW Judgement' },
      { key: 'caughtBehindAccuracy', label: 'Caught Behind Accuracy' },
      { key: 'runOutPositioning', label: 'Run Out Positioning' },
      { key: 'boundaryCalls', label: 'Boundary Calls' },
      { key: 'drsAccuracy', label: 'DRS Accuracy' },
      { key: 'consistency', label: 'Consistency' },
    ]
  },
  matchControlAttributes: {
    title: 'Match Control',
    fields: [
      { key: 'playerManagement', label: 'Player Management' },
      { key: 'conflictResolution', label: 'Conflict Resolution' },
      { key: 'timeManagement', label: 'Time Management' },
      { key: 'lawApplication', label: 'Law Application' },
      { key: 'communication', label: 'Communication' },
      { key: 'pressureHandling', label: 'Pressure Handling' },
    ]
  },
  physicalAttributes: {
    title: 'Physical',
    fields: [
      { key: 'fitness', label: 'Fitness' },
      { key: 'endurance', label: 'Endurance' },
      { key: 'positioningAgility', label: 'Positioning Agility' },
      { key: 'concentration', label: 'Concentration' },
      { key: 'vision', label: 'Vision' },
    ]
  }
};

export function UmpireForm({ mode, umpireAction, initialState, initialData = {} }: UmpireFormProps) {
  // We need to manage state for the form action locally to handle the response
  const [state, setState] = useState<UmpireActionState>(initialState);

  // Wrapper for the action to update local state
  const handleAction = async (formData: FormData) => {
    const result = await umpireAction(state, formData);
    setState(result);
  };

  // State for attributes to show live values
  const [attributes, setAttributes] = useState<Record<string, any>>({
    decisionAttributes: initialData.umpireProfile?.decisionAttributes || {},
    matchControlAttributes: initialData.umpireProfile?.matchControlAttributes || {},
    physicalAttributes: initialData.umpireProfile?.physicalAttributes || {},
  });

  const [umpireTraits, setUmpireTraits] = useState<string[]>(initialData.umpireProfile?.umpireTraits || []);

  const handleAttributeChange = (group: string, key: string, value: number[]) => {
    setAttributes(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value[0]
      }
    }));
  };

  const getRatingColor = (rating: number) => {
    if (rating < 8) return "text-red-500";
    if (rating < 14) return "text-yellow-500";
    return "text-emerald-500";
  };

  const renderAttributeGroup = (groupKey: keyof typeof UMPIRE_ATTRIBUTE_GROUPS) => {
    const group = UMPIRE_ATTRIBUTE_GROUPS[groupKey];
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">{group.title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {group.fields.map((field) => {
            const currentValue = attributes[groupKey]?.[field.key] || 10;
            return (
              <div key={field.key} className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor={`${groupKey}.${field.key}`} className="text-sm font-medium">
                    {field.label}
                  </Label>
                  <span className={`font-mono font-bold ${getRatingColor(currentValue)}`}>
                    {currentValue}/20
                  </span>
                </div>
                <Slider
                  id={`${groupKey}.${field.key}`}
                  name={`${groupKey}.${field.key}`}
                  min={1}
                  max={20}
                  step={1}
                  value={[currentValue]}
                  onValueChange={(val) => handleAttributeChange(groupKey, field.key, val)}
                  className="py-2"
                />
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  return (
    <form action={handleAction} className="space-y-6">
      {state.message && (
        <div className={`p-4 rounded-md flex items-center gap-2 ${state.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {state.success ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          <p>{state.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" defaultValue={initialData.firstName} placeholder="John" required />
              {state.errors?.firstName && <p className="text-sm text-red-500">{state.errors.firstName[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" defaultValue={initialData.lastName} placeholder="Doe" required />
              {state.errors?.lastName && <p className="text-sm text-red-500">{state.errors.lastName[0]}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input 
              id="dateOfBirth" 
              name="dateOfBirth" 
              type="date" 
              defaultValue={typeof initialData.dateOfBirth === 'string' ? initialData.dateOfBirth : ''} 
              required 
            />
            {state.errors?.dateOfBirth && <p className="text-sm text-red-500">{state.errors.dateOfBirth[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={initialData.email} placeholder="john@example.com" />
              {state.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone</Label>
              <Input id="phoneNumber" name="phoneNumber" type="tel" defaultValue={initialData.phone} placeholder="+1 234 567 890" />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Umpire Details</h3>
          
          <div className="space-y-2">
            <Label htmlFor="certificationLevel">Certification Level</Label>
            <Select name="certificationLevel" defaultValue={initialData.umpireProfile?.certificationLevel || 'Level 1'}>
              <SelectTrigger>
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Level 1">Level 1 (Club)</SelectItem>
                <SelectItem value="Level 2">Level 2 (Regional)</SelectItem>
                <SelectItem value="Level 3">Level 3 (National)</SelectItem>
                <SelectItem value="Level 4">Level 4 (International)</SelectItem>
                <SelectItem value="Elite Panel">Elite Panel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeAssociation">Home Association</Label>
            <Input 
              id="homeAssociation" 
              name="homeAssociation" 
              defaultValue={initialData.umpireProfile?.homeAssociation} 
              placeholder="e.g. Western Province Cricket Association" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearsActive">Years Active</Label>
            <Input 
              id="yearsActive" 
              name="yearsActive" 
              type="number" 
              min="0"
              defaultValue={initialData.umpireProfile?.yearsActive || 0} 
            />
          </div>
        </Card>
      </div>

      <div className="space-y-8 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Umpire Profile & Attributes</h2>
            <p className="text-muted-foreground">
              Detailed assessment of officiating skills and characteristics.
            </p>
          </div>
        </div>

        <Tabs defaultValue="decision" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="decision">Decision Making</TabsTrigger>
            <TabsTrigger value="control">Match Control</TabsTrigger>
            <TabsTrigger value="physical">Physical</TabsTrigger>
            <TabsTrigger value="traits">Traits & Info</TabsTrigger>
          </TabsList>

          <TabsContent value="decision" className="mt-6 space-y-6">
            {renderAttributeGroup('decisionAttributes')}
          </TabsContent>
          
          <TabsContent value="control" className="mt-6 space-y-6">
            {renderAttributeGroup('matchControlAttributes')}
          </TabsContent>
          
          <TabsContent value="physical" className="mt-6">
            {renderAttributeGroup('physicalAttributes')}
          </TabsContent>
          
          <TabsContent value="traits" className="mt-6 space-y-8">
            <UmpireTraitsManager initialData={umpireTraits} onChange={setUmpireTraits} />
          </TabsContent>
        </Tabs>
        
        {/* Hidden Inputs for Array Fields */}
        <input type="hidden" name="umpireTraits" value={JSON.stringify(umpireTraits)} />
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}
