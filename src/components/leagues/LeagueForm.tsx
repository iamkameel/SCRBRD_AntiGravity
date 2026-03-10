"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { LeagueActionState, deleteLeagueAction, getProvincesAction } from "@/app/actions/leagueActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, CheckCircle2, AlertTriangle, Trophy } from "lucide-react";
import { useFormStatus } from "react-dom";
import { leagueSchema } from "@/lib/validations/leagueSchema";
import { z } from "zod";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";

interface LeagueFormProps {
  mode: 'create' | 'edit';
  leagueAction: (prevState: LeagueActionState, formData: FormData) => Promise<LeagueActionState>;
  initialState: LeagueActionState;
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
          {mode === 'create' ? 'Create League' : 'Save Changes'}
        </>
      )}
    </Button>
  );
}

export function LeagueForm({ mode, leagueAction, initialState, initialData = {} }: LeagueFormProps) {
  const [state, action] = useFormState(leagueAction, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [provinces, setProvinces] = useState<any[]>([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      const data = await getProvincesAction();
      setProvinces(data);
    };
    fetchProvinces();
  }, []);

  // Client-side validation
  const validateField = (name: string, value: string) => {
    try {
      const field = name as keyof typeof leagueSchema.shape;
      if (field in leagueSchema.shape) {
        // @ts-ignore - complex union type handling
        leagueSchema.shape[field].parse(value);
        setClientErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } catch (error) {
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
            League {mode === 'create' ? 'created' : 'updated'} successfully!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {mode === 'create' ? 'Add New League' : 'Edit League'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Define the league details. Fields marked with * are required.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">League Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={initialData.name}
                  onBlur={(e) => validateField('name', e.target.value)}
                  placeholder="e.g. Premier League"
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
                <Label htmlFor="type">League Type *</Label>
                <Select name="type" defaultValue={initialData.type || 'League'} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="League">League</SelectItem>
                    <SelectItem value="Series">Series</SelectItem>
                    <SelectItem value="Cup">Cup</SelectItem>
                    <SelectItem value="Friendly">Friendly</SelectItem>
                  </SelectContent>
                </Select>
                {state.fieldErrors?.type && (
                  <p className="text-sm text-destructive">{state.fieldErrors.type[0]}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provinceId">Province *</Label>
              <Select name="provinceId" defaultValue={initialData.provinceId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(clientErrors.provinceId || state.fieldErrors?.provinceId) && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {clientErrors.provinceId || state.fieldErrors?.provinceId[0]}
                </p>
              )}
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
              placeholder="Additional details about this league..."
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
              entityName="league" 
              onDelete={async () => {
                await deleteLeagueAction(initialData.id);
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
