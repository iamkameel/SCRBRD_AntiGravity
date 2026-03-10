"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { TransactionActionState } from "@/app/actions/transactionActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, CheckCircle2, AlertTriangle, Receipt, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { transactionSchema, TransactionFormData } from "@/lib/validations/transactionSchema";
import { z } from "zod";

interface TransactionFormProps {
  mode: 'create' | 'edit';
  transactionAction: (prevState: TransactionActionState, formData: FormData) => Promise<TransactionActionState>;
  initialState: TransactionActionState;
  initialData?: any;
}

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {mode === 'create' ? 'Recording...' : 'Saving...'}
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {mode === 'create' ? 'Record Transaction' : 'Save Changes'}
        </>
      )}
    </Button>
  );
}

export function TransactionForm({ mode, transactionAction, initialState, initialData = {} }: TransactionFormProps) {
  const [state, action] = useFormState(transactionAction, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [type, setType] = useState(initialData.type || 'Expense');

  // Client-side validation
  const validateField = (name: string, value: string) => {
    try {
      const field = name as keyof typeof transactionSchema.shape;
      if (field in transactionSchema.shape) {
        transactionSchema.shape[field].parse(value);
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

  const incomeCategories = [
    'Match Fees', 'Sponsorship', 'Donations', 'Merchandise Sales', 
    'Membership Fees', 'Event Revenue', 'Grant', 'Other Income'
  ];

  const expenseCategories = [
    'Equipment', 'Field Maintenance', 'Umpire Fees', 'Travel', 
    'Catering', 'Uniforms', 'Medical', 'Utilities', 'Salaries', 'Other Expense'
  ];

  return (
    <form action={action} className="space-y-6">
      {showSuccess && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Transaction {mode === 'create' ? 'recorded' : 'updated'} successfully!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {mode === 'create' ? 'Record New Transaction' : 'Edit Transaction'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the financial details below. Fields marked with * are required.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Transaction Type Toggle */}
          <div className="flex justify-center pb-4">
            <div className="bg-muted p-1 rounded-lg inline-flex">
              <button
                type="button"
                onClick={() => setType('Income')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  type === 'Income' 
                    ? 'bg-emerald-100 text-emerald-700 shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowUpCircle className="h-4 w-4" />
                Income
              </button>
              <button
                type="button"
                onClick={() => setType('Expense')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  type === 'Expense' 
                    ? 'bg-rose-100 text-rose-700 shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowDownCircle className="h-4 w-4" />
                Expense
              </button>
            </div>
            <input type="hidden" name="type" value={type} />
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Description *</label>
                <Input 
                  id="description" 
                  name="description" 
                  defaultValue={initialData.description}
                  onBlur={(e) => validateField('description', e.target.value)}
                  placeholder="e.g. New Cricket Balls"
                  required 
                />
                {(clientErrors.description || state.fieldErrors?.description) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.description || state.fieldErrors?.description[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Amount (R) *</label>
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number"
                  step="0.01"
                  min="0.01"
                  defaultValue={initialData.amount}
                  onBlur={(e) => validateField('amount', e.target.value)}
                  placeholder="0.00"
                  required 
                />
                {(clientErrors.amount || state.fieldErrors?.amount) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.amount || state.fieldErrors?.amount[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Category *</label>
                <Select name="category" defaultValue={initialData.category} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(type === 'Income' ? incomeCategories : expenseCategories).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state.fieldErrors?.category && (
                  <p className="text-sm text-destructive">{state.fieldErrors.category[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Date *</label>
                <Input 
                  id="date" 
                  name="date" 
                  type="date"
                  defaultValue={initialData.date?.split('T')[0]}
                  onBlur={(e) => validateField('date', e.target.value)}
                  required 
                />
                {(clientErrors.date || state.fieldErrors?.date) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {clientErrors.date || state.fieldErrors?.date[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="paymentMethod" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Payment Method *</label>
                <Select name="paymentMethod" defaultValue={initialData.paymentMethod || 'EFT'} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EFT">EFT</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Debit Card">Debit Card</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Status *</label>
                <Select name="status" defaultValue={initialData.status || 'Completed'} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="reference" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Reference No.</label>
                <Input 
                  id="reference" 
                  name="reference" 
                  defaultValue={initialData.reference}
                  onBlur={(e) => validateField('reference', e.target.value)}
                  placeholder="Optional"
                />
                {clientErrors.reference && (
                  <p className="text-sm text-destructive">{clientErrors.reference}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Notes</label>
            <Textarea 
              id="notes" 
              name="notes" 
              defaultValue={initialData.notes}
              onBlur={(e) => validateField('notes', e.target.value)}
              placeholder="Additional details..."
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
