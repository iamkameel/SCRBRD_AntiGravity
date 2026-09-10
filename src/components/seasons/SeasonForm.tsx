"use client";

import { useState, useActionState } from "react";
import { SeasonActionState, deleteSeasonAction } from "@/app/actions/seasonActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, CheckCircle2, AlertTriangle, CalendarRange } from "lucide-react";
import { useFormStatus } from "react-dom";
import { seasonSchema } from "@/lib/validations/seasonSchema";
import { z } from "zod";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";

interface SeasonFormProps {
  mode: 'create' | 'edit';
  seasonAction: (prevState: SeasonActionState, formData: FormData) => Promise<SeasonActionState>;
  initialState: SeasonActionState;
  initialData?: any;
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
          {mode === 'create' ? 'Create Season' : 'Save Changes'}
        </>
      )}
    </Button>
  );
}

export function SeasonForm({ mode, seasonAction, initialState, initialData = {} }: SeasonFormProps) {
  const [state, action] = useActionState(seasonAction, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [startDate, setStartDate] = useState(initialData.startDate || '');
  const [endDate, setEndDate] = useState(initialData.endDate || '');

  // Client-side validation
  const validateField = (name: string, value: string) => {
    try {
      // Basic field validation
      const field = name as keyof typeof seasonSchema.shape;
      if (field in seasonSchema.shape) {
        // @ts-ignore - complex union type handling
        seasonSchema.shape[field].parse(value);
        setClientErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }

      // Cross-field validation for dates
      if (name === 'startDate' || name === 'endDate') {
        const sDate = name === 'startDate' ? value : startDate;
        const eDate = name === 'endDate' ? value : endDate;
        
        if (sDate && eDate) {
          const start = new Date(sDate);
          const end = new Date(eDate);
          if (end < start) {
            setClientErrors(prev => ({
              ...prev,
              endDate: "End date must be after start date"
            }));
          } else {
            setClientErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.endDate;
              return newErrors;
            });
          }
        }
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

  return (
    <form action={action} className="space-y-6">
      {showSuccess && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Season {mode === 'create' ? 'created' : 'updated'} successfully!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5" />
            {mode === 'create' ? 'Add New Season' : 'Edit Season'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Define the season period and status. Fields marked with * are required.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Season Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={initialData.name}
                  onBlur={(e) => validateField('name', e.target.value)}
                  placeholder="e.g. 2024/2025 Summer"
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
                <Label htmlFor="status">Status *</Label>
                <Select name="status" defaultValue={initialData.status || 'Upcoming'} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                {state.fieldErrors?.status && (
                  <p className="text-sm text-destructive">{state.fieldErrors.status[0]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input 
                  id="startDate" 
                  name="startDate" 
                  type="date"
                  defaultValue={initialData.startDate?.split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  onBlur={(e) => validateField('startDate', e.target.value)}
                  required 
                />
                {(clientErrors.startDate || state.fieldErrors?.startDate) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.startDate || state.fieldErrors?.startDate[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input 
                  id="endDate" 
                  name="endDate" 
                  type="date"
                  defaultValue={initialData.endDate?.split('T')[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  onBlur={(e) => validateField('endDate', e.target.value)}
                  required 
                />
                {(clientErrors.endDate || state.fieldErrors?.endDate) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.endDate || state.fieldErrors?.endDate[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="isCurrent" 
                name="isCurrent" 
                defaultChecked={initialData.isCurrent} 
              />
              <Label htmlFor="isCurrent" className="font-normal cursor-pointer">
                Set as Current Season
              </Label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              defaultValue={initialData.description}
              onBlur={(e) => validateField('description', e.target.value)}
              placeholder="Additional details about this season..."
              rows={3}
              maxLength={500}
            />
            {clientErrors.description && (
              <p className="text-sm text-destructive">{clientErrors.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {initialData.description?.length || 0}/500 characters
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
            <DeleteConfirmationDialog 
              entityName="season" 
              onDelete={async () => {
                await deleteSeasonAction(initialData.id);
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
    </form>
  );
}
