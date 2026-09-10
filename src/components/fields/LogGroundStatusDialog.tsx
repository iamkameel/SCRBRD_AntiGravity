"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tractor, CheckCircle2 } from "lucide-react";
import { logGroundStatusAction } from '@/app/actions/fieldActions';
import { toast } from 'sonner';

interface LogGroundStatusDialogProps {
  fieldId: string;
  fieldName: string;
  trigger?: React.ReactNode;
}

export function LogGroundStatusDialog({ fieldId, fieldName, trigger }: LogGroundStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [status, setStatus] = useState<'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unplayable'>('Good');
  const [pitchReadiness, setPitchReadiness] = useState(85);
  const [outfieldReadiness, setOutfieldReadiness] = useState(90);
  const [equipmentReady, setEquipmentReady] = useState(true);
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await logGroundStatusAction({
        fieldId: fieldId as any,
        conditionStatus: status,
        pitchReadiness,
        outfieldReadiness,
        equipmentReadiness: equipmentReady ? 100 : 0, // Mapping boolean to numeric for schema consistency
        notes,
        loggedByPersonId: 'current-user-id' as any, // In production, get from auth context
      });
      
      if (result.success) {
        toast.success(`Readiness log for ${fieldName} submitted successfully.`);
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to submit readiness log.");
      }
    } catch (error) {
      console.error("Error logging readiness:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-2">
            <Tractor className="h-4 w-4" />
            Log Readiness
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tractor className="h-5 w-5 text-primary" />
            Log Ground Readiness
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Update the operational status for <span className="text-foreground font-bold">{fieldName}</span>.
          </p>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Condition Status */}
          <div className="space-y-2">
            <Label>Overall Condition</Label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Excellent">Excellent</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Poor">Poor</SelectItem>
                <SelectItem value="Unplayable">Unplayable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pitch Readiness */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Pitch Readiness</Label>
              <span className="text-xs font-bold text-primary">{pitchReadiness}%</span>
            </div>
            <Slider 
              value={[pitchReadiness]} 
              onValueChange={(v) => setPitchReadiness(v[0])} 
              max={100} 
              step={5} 
            />
          </div>

          {/* Outfield Readiness */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Outfield Readiness</Label>
              <span className="text-xs font-bold text-primary">{outfieldReadiness}%</span>
            </div>
            <Slider 
              value={[outfieldReadiness]} 
              onValueChange={(v) => setOutfieldReadiness(v[0])} 
              max={100} 
              step={5} 
            />
          </div>

          {/* Equipment Status */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
            <div className="space-y-0.5">
              <Label>Equipment Readiness</Label>
              <p className="text-[10px] text-muted-foreground italic">Mowers, rollers, and markings ready?</p>
            </div>
            <Switch checked={equipmentReady} onCheckedChange={setEquipmentReady} />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Maintenance Notes</Label>
            <Textarea 
              placeholder="e.g. Pitch rolled, boundary lines marked. Slight moisture in the south corner."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-primary text-primary-foreground font-bold gap-2"
          >
            {loading ? "Submitting..." : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Submit Log
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
