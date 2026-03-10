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
import { MedicalActionState } from '@/app/actions/medicalActions';
import { MedicalTagManager } from './MedicalArrayFields';
import { Person } from '@/types/firestore';

interface MedicalFormProps {
  mode: 'create' | 'edit';
  medicalAction: (prevState: MedicalActionState, formData: FormData) => Promise<MedicalActionState>;
  initialState: MedicalActionState;
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
          Save Medical Profile
        </>
      )}
    </Button>
  );
}

const MEDICAL_ATTRIBUTE_GROUPS = {
  clinicalAttributes: {
    title: 'Clinical Skills',
    fields: [
      { key: 'diagnosisAccuracy', label: 'Diagnosis Accuracy' },
      { key: 'tapingStrapping', label: 'Taping & Strapping' },
      { key: 'emergencyResponse', label: 'Emergency Response' },
      { key: 'massageTherapy', label: 'Massage Therapy' },
      { key: 'injuryPrevention', label: 'Injury Prevention' },
    ]
  },
  rehabAttributes: {
    title: 'Rehabilitation',
    fields: [
      { key: 'returnToPlayPlanning', label: 'Return to Play Planning' },
      { key: 'strengthConditioning', label: 'Strength & Conditioning' },
      { key: 'loadManagement', label: 'Load Management' },
      { key: 'rehabProgramDesign', label: 'Rehab Program Design' },
      { key: 'psychologicalSupport', label: 'Psychological Support' },
    ]
  }
};

export function MedicalForm({ mode, medicalAction, initialState, initialData = {} }: MedicalFormProps) {
  const [state, setState] = useState<MedicalActionState>(initialState);

  const handleAction = async (formData: FormData) => {
    const result = await medicalAction(state, formData);
    setState(result);
  };

  const [attributes, setAttributes] = useState<Record<string, any>>({
    clinicalAttributes: initialData.medicalProfile?.clinicalAttributes || {},
    rehabAttributes: initialData.medicalProfile?.rehabAttributes || {},
  });

  const [specializations, setSpecializations] = useState<string[]>(initialData.medicalProfile?.specializations || []);
  const [medicalTraits, setMedicalTraits] = useState<string[]>(initialData.medicalProfile?.medicalTraits || []);

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

  const renderAttributeGroup = (groupKey: keyof typeof MEDICAL_ATTRIBUTE_GROUPS) => {
    const group = MEDICAL_ATTRIBUTE_GROUPS[groupKey];
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
              <Input id="firstName" name="firstName" defaultValue={initialData.firstName} placeholder="Dr. John" required />
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
              <Input id="email" name="email" type="email" defaultValue={initialData.email} placeholder="dr.smith@example.com" />
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
            <Label htmlFor="qualification">Qualification</Label>
            <Input 
              id="qualification" 
              name="qualification" 
              defaultValue={initialData.medicalProfile?.qualification} 
              placeholder="e.g. BSc Physiotherapy, MD Sports Medicine" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input 
              id="registrationNumber" 
              name="registrationNumber" 
              defaultValue={initialData.medicalProfile?.registrationNumber} 
              placeholder="Professional Body Reg No." 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceYears">Years Experience</Label>
            <Input 
              id="experienceYears" 
              name="experienceYears" 
              type="number" 
              min="0"
              defaultValue={initialData.medicalProfile?.experienceYears || 0} 
            />
          </div>
        </Card>
      </div>

      <div className="space-y-8 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Medical Profile & Expertise</h2>
            <p className="text-muted-foreground">
              Detailed assessment of clinical skills and rehabilitation expertise.
            </p>
          </div>
        </div>

        <Tabs defaultValue="clinical" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="clinical">Clinical Skills</TabsTrigger>
            <TabsTrigger value="rehab">Rehabilitation</TabsTrigger>
            <TabsTrigger value="specializations">Specializations</TabsTrigger>
          </TabsList>

          <TabsContent value="clinical" className="mt-6 space-y-6">
            {renderAttributeGroup('clinicalAttributes')}
          </TabsContent>
          
          <TabsContent value="rehab" className="mt-6 space-y-6">
            {renderAttributeGroup('rehabAttributes')}
          </TabsContent>
          
          <TabsContent value="specializations" className="mt-6 space-y-8">
            <MedicalTagManager 
              title="Specializations" 
              description="Add specific areas of expertise (e.g. Shoulder Rehab, Concussion)."
              placeholder="e.g. ACL Rehab"
              initialData={specializations} 
              onChange={setSpecializations} 
            />
            <MedicalTagManager 
              title="Traits & Approach" 
              description="Add tags to describe professional approach."
              placeholder="e.g. Evidence-Based"
              initialData={medicalTraits} 
              onChange={setMedicalTraits} 
            />
          </TabsContent>
        </Tabs>
        
        {/* Hidden Inputs for Array Fields */}
        <input type="hidden" name="specializations" value={JSON.stringify(specializations)} />
        <input type="hidden" name="medicalTraits" value={JSON.stringify(medicalTraits)} />
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
