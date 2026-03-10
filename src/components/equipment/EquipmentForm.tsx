"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { EquipmentActionState } from "@/app/actions/equipmentActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, CheckCircle2, AlertTriangle, Package } from "lucide-react";
import { useFormStatus } from "react-dom";
import { equipmentSchema, EquipmentFormData } from "@/lib/validations/equipmentSchema";
import { z } from "zod";

interface EquipmentFormProps {
  mode: 'create' | 'edit';
  equipmentAction: (prevState: EquipmentActionState, formData: FormData) => Promise<EquipmentActionState>;
  initialState: EquipmentActionState;
  initialData?: any;
}

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {mode === 'create' ? 'Adding...' : 'Saving...'}
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {mode === 'create' ? 'Add Equipment' : 'Save Changes'}
        </>
      )}
    </Button>
  );
}

export function EquipmentForm({ mode, equipmentAction, initialState, initialData = {} }: EquipmentFormProps) {
  const [state, action] = useFormState(equipmentAction, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  // Client-side validation
  const validateField = (name: string, value: string) => {
    try {
      const field = name as keyof typeof equipmentSchema.shape;
      if (field in equipmentSchema.shape) {
        equipmentSchema.shape[field].parse(value);
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
          [name]: (error as any).errors[0].message
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
            Equipment {mode === 'create' ? 'added' : 'updated'} successfully!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {mode === 'create' ? 'Add New Equipment' : 'Edit Equipment'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Fill in the equipment details below. Fields marked with * are required.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Equipment Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={initialData.name}
                  onBlur={(e) => validateField('name', e.target.value)}
                  placeholder="e.g. Cricket Bat - Senior"
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
                <Label htmlFor="category">Category *</Label>
                <Select name="category" defaultValue={initialData.category} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bats">Bats</SelectItem>
                    <SelectItem value="Balls">Balls</SelectItem>
                    <SelectItem value="Protective Gear">Protective Gear</SelectItem>
                    <SelectItem value="Stumps & Bails">Stumps & Bails</SelectItem>
                    <SelectItem value="Training Equipment">Training Equipment</SelectItem>
                    <SelectItem value="Groundskeeping">Groundskeeping</SelectItem>
                    <SelectItem value="Scoreboard">Scoreboard</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {state.fieldErrors?.category && (
                  <p className="text-sm text-destructive">{state.fieldErrors.category[0]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input 
                  id="quantity" 
                  name="quantity"
                  type="number"
                  min="0"
                  max="10000"
                  defaultValue={initialData.quantity}
                  onBlur={(e) => validateField('quantity', e.target.value)}
                  placeholder="0"
                  required 
                />
                {(clientErrors.quantity || state.fieldErrors?.quantity) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.quantity || state.fieldErrors?.quantity[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select name="condition" defaultValue={initialData.condition || 'Good'} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input 
                  id="location" 
                  name="location"
                  defaultValue={initialData.location}
                  onBlur={(e) => validateField('location', e.target.value)}
                  placeholder="e.g. Equipment Room A"
                  required 
                />
                {(clientErrors.location || state.fieldErrors?.location) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.location || state.fieldErrors?.location[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Purchase Details */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Purchase Details (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input 
                  id="purchaseDate" 
                  name="purchaseDate"
                  type="date"
                  defaultValue={initialData.purchaseDate?.split('T')[0]}
                  onBlur={(e) => validateField('purchaseDate', e.target.value)}
                />
                {clientErrors.purchaseDate && (
                  <p className="text-sm text-destructive">{clientErrors.purchaseDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input 
                  id="purchasePrice" 
                  name="purchasePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={initialData.purchasePrice}
                  onBlur={(e) => validateField('purchasePrice', e.target.value)}
                  placeholder="0.00"
                />
                {clientErrors.purchasePrice && (
                  <p className="text-sm text-destructive">{clientErrors.purchasePrice}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input 
                  id="supplier" 
                  name="supplier"
                  defaultValue={initialData.supplier}
                  onBlur={(e) => validateField('supplier', e.target.value)}
                  placeholder="e.g. Kookaburra"
                />
                {clientErrors.supplier && (
                  <p className="text-sm text-destructive">{clientErrors.supplier}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input 
                  id="serialNumber" 
                  name="serialNumber"
                  defaultValue={initialData.serialNumber}
                  onBlur={(e) => validateField('serialNumber', e.target.value)}
                  placeholder="Optional"
                />
                {clientErrors.serialNumber && (
                  <p className="text-sm text-destructive">{clientErrors.serialNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              name="notes"
              defaultValue={initialData.notes}
              onBlur={(e) => validateField('notes', e.target.value)}
              placeholder="Additional information..."
              rows={3}
              maxLength={500}
            />
            {clientErrors.notes && (
              <p className="text-sm text-destructive">{clientErrors.notes}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {initialData.notes?.length || 0}/500 characters
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
            <div></div>
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
