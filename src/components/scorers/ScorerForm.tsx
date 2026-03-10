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
import { ScorerActionState } from '@/app/actions/scorerActions';
import { ScorerTraitsManager } from './ScorerArrayFields';
import { Person } from '@/types/firestore';

interface ScorerFormProps {
  mode: 'create' | 'edit';
  scorerAction: (prevState: ScorerActionState, formData: FormData) => Promise<ScorerActionState>;
  initialState: ScorerActionState;
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
          Save Scorer Profile
        </>
      )}
    </Button>
  );
}

const SCORER_ATTRIBUTE_GROUPS = {
  technicalAttributes: {
    title: 'Technical Skills',
    fields: [
      { key: 'softwareProficiency', label: 'Software Proficiency' },
      { key: 'lawKnowledge', label: 'Law Knowledge' },
      { key: 'linearScoring', label: 'Linear (Paper) Scoring' },
      { key: 'digitalScoring', label: 'Digital Scoring' },
      { key: 'problemSolving', label: 'Problem Solving' },
    ]
  },
  professionalAttributes: {
    title: 'Professionalism',
    fields: [
      { key: 'concentration', label: 'Concentration' },
      { key: 'speed', label: 'Speed' },
      { key: 'accuracy', label: 'Accuracy' },
      { key: 'communication', label: 'Communication' },
      { key: 'punctuality', label: 'Punctuality' },
      { key: 'collaboration', label: 'Collaboration' },
    ]
  }
};

export function ScorerForm({ mode, scorerAction, initialState, initialData = {} }: ScorerFormProps) {
  const [state, setState] = useState<ScorerActionState>(initialState);

  const handleAction = async (formData: FormData) => {
    const result = await scorerAction(state, formData);
    setState(result);
  };

  const [attributes, setAttributes] = useState<Record<string, any>>({
    technicalAttributes: initialData.scorerProfile?.technicalAttributes || {},
    professionalAttributes: initialData.scorerProfile?.professionalAttributes || {},
  });

  const [scorerTraits, setScorerTraits] = useState<string[]>(initialData.scorerProfile?.scorerTraits || []);

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

  const renderAttributeGroup = (groupKey: keyof typeof SCORER_ATTRIBUTE_GROUPS) => {
    const group = SCORER_ATTRIBUTE_GROUPS[groupKey];
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
              <Input id="firstName" name="firstName" defaultValue={initialData.firstName} placeholder="Jane" required />
              {state.errors?.firstName && <p className="text-sm text-red-500">{state.errors.firstName[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" defaultValue={initialData.lastName} placeholder="Smith" required />
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
              <Input id="email" name="email" type="email" defaultValue={initialData.email} placeholder="jane@example.com" />
              {state.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone</Label>
              <Input id="phoneNumber" name="phoneNumber" type="tel" defaultValue={initialData.phone} placeholder="+1 234 567 890" />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Scorer Details</h3>
          
          <div className="space-y-2">
            <Label htmlFor="certificationLevel">Certification Level</Label>
            <Select name="certificationLevel" defaultValue={initialData.scorerProfile?.certificationLevel || 'Level 1'}>
              <SelectTrigger>
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Level 1">Level 1 (Club)</SelectItem>
                <SelectItem value="Level 2">Level 2 (Regional)</SelectItem>
                <SelectItem value="Level 3">Level 3 (National)</SelectItem>
                <SelectItem value="Level 4">Level 4 (International)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredMethod">Preferred Method</Label>
            <Select name="preferredMethod" defaultValue={initialData.scorerProfile?.preferredMethod || 'Digital'}>
              <SelectTrigger>
                <SelectValue placeholder="Select Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Digital">Digital (App/Laptop)</SelectItem>
                <SelectItem value="Linear (Paper)">Linear (Paper)</SelectItem>
                <SelectItem value="Hybrid">Hybrid (Both)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceYears">Years Experience</Label>
            <Input 
              id="experienceYears" 
              name="experienceYears" 
              type="number" 
              min="0"
              defaultValue={initialData.scorerProfile?.experienceYears || 0} 
            />
          </div>
        </Card>
      </div>

      <div className="space-y-8 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Scorer Profile & Attributes</h2>
            <p className="text-muted-foreground">
              Detailed assessment of scoring skills and professionalism.
            </p>
          </div>
        </div>

        <Tabs defaultValue="technical" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="technical">Technical Skills</TabsTrigger>
            <TabsTrigger value="professional">Professionalism</TabsTrigger>
            <TabsTrigger value="traits">Traits & Info</TabsTrigger>
          </TabsList>

          <TabsContent value="technical" className="mt-6 space-y-6">
            {renderAttributeGroup('technicalAttributes')}
          </TabsContent>
          
          <TabsContent value="professional" className="mt-6 space-y-6">
            {renderAttributeGroup('professionalAttributes')}
          </TabsContent>
          
          <TabsContent value="traits" className="mt-6 space-y-8">
            <ScorerTraitsManager initialData={scorerTraits} onChange={setScorerTraits} />
          </TabsContent>
        </Tabs>
        
        {/* Hidden Inputs for Array Fields */}
        <input type="hidden" name="scorerTraits" value={JSON.stringify(scorerTraits)} />
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
