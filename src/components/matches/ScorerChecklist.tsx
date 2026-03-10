"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  required: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'scorebook', label: 'Scorebook Prepared', description: 'Ensure scorebook or digital device is ready', required: true },
  { id: 'teamsheets', label: 'Team Sheets Received', description: 'Both captains have submitted final XIs', required: true },
  { id: 'umpires', label: 'Umpires Briefed', description: 'Confirm match conditions with umpires', required: true },
  { id: 'scorers', label: 'Scorers Ready', description: 'Both scorers present and synced', required: true },
  { id: 'equipment', label: 'Equipment Check', description: 'Stumps, bails, and match balls ready', required: true },
  { id: 'clock', label: 'Match Clock Set', description: 'Confirm start time and session times', required: false },
];

interface ScorerChecklistProps {
  onComplete: (items: Record<string, boolean>) => void;
  isReadOnly?: boolean;
  initialState?: Record<string, boolean>;
}

export function ScorerChecklist({
  onComplete,
  isReadOnly = false,
  initialState = {}
}: ScorerChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(initialState);

  const handleToggle = (id: string) => {
    if (isReadOnly) return;
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const allRequiredChecked = DEFAULT_CHECKLIST
    .filter(item => item.required)
    .every(item => checkedItems[item.id]);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardCheck className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Pre-Match Checklist</h3>
      </div>

      <div className="space-y-4">
        {DEFAULT_CHECKLIST.map(item => (
          <div key={item.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
            <Checkbox 
              id={item.id} 
              checked={checkedItems[item.id] || false}
              onCheckedChange={() => handleToggle(item.id)}
              disabled={isReadOnly}
            />
            <div className="grid gap-1.5 leading-none">
              <Label 
                htmlFor={item.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {item.label}
                {item.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {item.description && (
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isReadOnly && (
        <div className="mt-6 pt-4 border-t">
          {!allRequiredChecked && (
            <Alert variant="destructive" className="mb-4 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Complete all required items to proceed
              </AlertDescription>
            </Alert>
          )}
          <Button 
            className="w-full" 
            disabled={!allRequiredChecked}
            onClick={() => onComplete(checkedItems)}
          >
            Complete Checklist & Ready for Live
          </Button>
        </div>
      )}
    </Card>
  );
}
