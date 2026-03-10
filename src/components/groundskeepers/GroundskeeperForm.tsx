'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Loader2, Save, AlertTriangle, CheckCircle2 } from "lucide-react";
import { GroundskeeperActionState } from '@/app/actions/groundskeeperActions';
import { GroundskeeperTagManager } from './GroundskeeperArrayFields';
import { Person } from '@/types/firestore';

interface GroundskeeperFormProps {
  mode: 'create' | 'edit';
  groundskeeperAction: (prevState: GroundskeeperActionState, formData: FormData) => Promise<GroundskeeperActionState>;
  initialState: GroundskeeperActionState;
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
          Save Groundskeeper Profile
        </>
      )}
    </Button>
  );
}

const GROUNDSKEEPER_ATTRIBUTE_GROUPS = {
  pitchAttributes: {
    title: 'Pitch Preparation',
    fields: [
      { key: 'paceGeneration', label: 'Pace Generation' },
      { key: 'spinPromotion', label: 'Spin Promotion' },
      { key: 'durability', label: 'Durability' },
      { key: 'evenness', label: 'Evenness' },
      { key: 'moistureControl', label: 'Moisture Control' },
    ]
  },
  outfieldAttributes: {
    title: 'Outfield Management',
    fields: [
      { key: 'drainageManagement', label: 'Drainage Management' },
      { key: 'grassHealth', label: 'Grass Health' },
      { key: 'boundaryMarking', label: 'Boundary Marking' },
      { key: 'rollering', label: 'Rollering' },
      { key: 'mowing', label: 'Mowing' },
    ]
  }
};

export function GroundskeeperForm({ mode, groundskeeperAction, initialState, initialData = {} }: GroundskeeperFormProps) {
  const [state, setState] = useState<GroundskeeperActionState>(initialState);

  const handleAction = async (formData: FormData) => {
    const result = await groundskeeperAction(state, formData);
    setState(result);
  };

  const [attributes, setAttributes] = useState<Record<string, any>>({
    pitchAttributes: initialData.groundskeeperProfile?.pitchAttributes || {},
    outfieldAttributes: initialData.groundskeeperProfile?.outfieldAttributes || {},
  });

  const [machineryLicenses, setMachineryLicenses] = useState<string[]>(initialData.groundskeeperProfile?.machineryLicenses || []);
  const [primaryVenues, setPrimaryVenues] = useState<string[]>(initialData.groundskeeperProfile?.primaryVenues || []);
  const [groundskeeperTraits, setGroundskeeperTraits] = useState<string[]>(initialData.groundskeeperProfile?.groundskeeperTraits || []);

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

  const renderAttributeGroup = (groupKey: keyof typeof GROUNDSKEEPER_ATTRIBUTE_GROUPS) => {
    const group = GROUNDSKEEPER_ATTRIBUTE_GROUPS[groupKey];
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
              <Input id="lastName" name="lastName" defaultValue={initialData.lastName} placeholder="Groundsman" required />
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
          <h3 className="text-lg font-semibold">Professional Details</h3>
          
          <div className="space-y-2">
            <Label htmlFor="experienceYears">Years Experience</Label>
            <Input 
              id="experienceYears" 
              name="experienceYears" 
              type="number" 
              min="0"
              defaultValue={initialData.groundskeeperProfile?.experienceYears || 0} 
            />
          </div>

          <div className="space-y-2">
            <Label>Machinery Licenses</Label>
            <p className="text-xs text-muted-foreground">Add licenses in the Licenses tab below</p>
          </div>

          <div className="space-y-2">
            <Label>Primary Venues</Label>
            <p className="text-xs text-muted-foreground">Add venues in the Venues tab below</p>
          </div>
        </Card>
      </div>

      <div className="space-y-8 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Groundskeeper Profile & Expertise</h2>
            <p className="text-muted-foreground">
              Detailed assessment of pitch preparation and field maintenance skills.
            </p>
          </div>
        </div>

        <Tabs defaultValue="pitch" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pitch">Pitch Prep</TabsTrigger>
            <TabsTrigger value="outfield">Outfield</TabsTrigger>
            <TabsTrigger value="licenses">Licenses</TabsTrigger>
            <TabsTrigger value="venues">Venues</TabsTrigger>
          </TabsList>

          <TabsContent value="pitch" className="mt-6 space-y-6">
            {renderAttributeGroup('pitchAttributes')}
          </TabsContent>
          
          <TabsContent value="outfield" className="mt-6 space-y-6">
            {renderAttributeGroup('outfieldAttributes')}
          </TabsContent>
          
          <TabsContent value="licenses" className="mt-6 space-y-8">
            <GroundskeeperTagManager 
              title="Machinery Licenses" 
              description="Add machinery licenses and certifications."
              placeholder="e.g. Heavy Roller, Ride-on Mower"
              initialData={machineryLicenses} 
              onChange={setMachineryLicenses} 
            />
            <GroundskeeperTagManager 
              title="Traits & Skills" 
              description="Add tags to describe working style and expertise."
              placeholder="e.g. Detail-Oriented, Fast Turnaround"
              initialData={groundskeeperTraits} 
              onChange={setGroundskeeperTraits} 
            />
          </TabsContent>

          <TabsContent value="venues" className="mt-6 space-y-8">
            <GroundskeeperTagManager 
              title="Primary Venues" 
              description="Add the fields/venues this groundskeeper manages."
              placeholder="e.g. Main Oval, Practice Ground"
              initialData={primaryVenues} 
              onChange={setPrimaryVenues} 
            />
          </TabsContent>
        </Tabs>
        
        {/* Hidden Inputs for Array Fields */}
        <input type="hidden" name="machineryLicenses" value={JSON.stringify(machineryLicenses)} />
        <input type="hidden" name="primaryVenues" value={JSON.stringify(primaryVenues)} />
        <input type="hidden" name="groundskeeperTraits" value={JSON.stringify(groundskeeperTraits)} />
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
