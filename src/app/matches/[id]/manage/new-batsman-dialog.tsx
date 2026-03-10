"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Player {
  id: string;
  name: string;
  role?: string;
}

interface NewBatsmanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePlayers: Player[];
  onSelect: (playerId: string) => void;
  title?: string;
  suggestedPlayerId?: string;
}

export function NewBatsmanDialog({
  open,
  onOpenChange,
  availablePlayers,
  onSelect,
  title = "Select New Batsman",
  suggestedPlayerId
}: NewBatsmanDialogProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  // Auto-select suggested player when dialog opens or suggestion changes
  useEffect(() => {
    if (open && suggestedPlayerId) {
      setSelectedPlayerId(suggestedPlayerId);
    } else if (open && !selectedPlayerId && availablePlayers.length > 0) {
      // Fallback: select first available if no suggestion
      setSelectedPlayerId(availablePlayers[0].id);
    }
  }, [open, suggestedPlayerId, availablePlayers, selectedPlayerId]);

  const handleSubmit = () => {
    if (selectedPlayerId) {
      onSelect(selectedPlayerId);
      onOpenChange(false);
      setSelectedPlayerId('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="batsman">Batsman</Label>
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
              <SelectTrigger id="batsman">
                <SelectValue placeholder="Select player..." />
              </SelectTrigger>
              <SelectContent>
                {availablePlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    <div className="flex items-center gap-2">
                      <span>{player.name}</span>
                      {player.role && <span className="text-muted-foreground text-xs">({player.role})</span>}
                      {player.id === suggestedPlayerId && (
                        <Badge variant="secondary" className="text-[10px] h-5">Next In</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {suggestedPlayerId && (
               <p className="text-xs text-muted-foreground">
                 Suggested based on batting order.
               </p>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={!selectedPlayerId}>
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
