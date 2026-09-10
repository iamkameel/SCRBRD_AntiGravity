'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Match } from '@/types/firestore';
import { useToast } from '@/hooks/use-toast';
import { updateMatchAction } from '@/app/actions/matchActions';
import { Loader2 } from 'lucide-react';

interface EditMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: Match;
}

export function EditMatchDialog({ open, onOpenChange, match }: EditMatchDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateMatchAction(match.id!, {}, formData);

      if (result.success) {
        toast({
          title: 'Match Updated',
          description: 'Match details have been updated successfully.',
        });
        onOpenChange(false);
      } else {
        throw new Error(result.error || 'Failed to update match');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update match. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Match</DialogTitle>
          <DialogDescription>
            Update match details, venue, and timing information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Match Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matchDate">Match Date *</Label>
              <Input
                id="matchDate"
                name="matchDate"
                type="date"
                defaultValue={
                  !match.matchDate ? '' :
                  typeof match.matchDate === 'string'
                    ? match.matchDate.split('T')[0]
                    : (typeof (match.matchDate as any).toDate === 'function' ? (match.matchDate as any).toDate() : new Date(match.matchDate as any))
                        .toISOString().split('T')[0]
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="matchTime">Match Time</Label>
              <Input
                id="matchTime"
                name="matchTime"
                type="time"
                defaultValue={typeof match.matchTime === 'string' ? match.matchTime : ''}
              />
            </div>
          </div>

          {/* Match Type & Overs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matchType">Match Type</Label>
              <Select name="matchType" defaultValue={match.matchType || 'T20'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T20">T20 (20 overs)</SelectItem>
                  <SelectItem value="ODI">ODI (50 overs)</SelectItem>
                  <SelectItem value="T10">T10 (10 overs)</SelectItem>
                  <SelectItem value="Test">Test Match</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="overs">Overs Per Innings</Label>
              <Input
                id="overs"
                name="overs"
                type="number"
                min="1"
                max="50"
                defaultValue={match.overs || 20}
              />
            </div>
          </div>

          {/* Match Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Match Status</Label>
            <Select name="status" defaultValue={match.status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="postponed">Postponed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Weather & Pitch Conditions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weather">Weather</Label>
              <Input
                id="weather"
                name="weather"
                placeholder="e.g., Sunny, Overcast"
                defaultValue={match.weather || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pitchCondition">Pitch Condition</Label>
              <Input
                id="pitchCondition"
                name="pitchCondition"
                placeholder="e.g., Dry, Green"
                defaultValue={match.pitchCondition || ''}
              />
            </div>
          </div>

          {/* Officials */}
          <div className="space-y-2">
            <Label htmlFor="scorer">Scorer</Label>
            <Input
              id="scorer"
              name="scorer"
              placeholder="Scorer name"
              defaultValue={match.scorer || ''}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Match Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional notes about the match"
              rows={3}
              defaultValue={match.notes || ''}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Match'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
