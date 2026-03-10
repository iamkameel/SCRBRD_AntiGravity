'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ScorerTraitsManager({ initialData = [], onChange }: { initialData?: string[], onChange: (data: string[]) => void }) {
  const [traits, setTraits] = useState<string[]>(initialData);
  const [newTrait, setNewTrait] = useState('');

  const addTrait = () => {
    if (!newTrait.trim()) return;
    if (traits.includes(newTrait.trim())) return; // Prevent duplicates
    const updated = [...traits, newTrait.trim()];
    setTraits(updated);
    onChange(updated);
    setNewTrait('');
  };

  const removeTrait = (traitToRemove: string) => {
    const updated = traits.filter(t => t !== traitToRemove);
    setTraits(updated);
    onChange(updated);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Scorer Traits & Skills</h3>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="e.g. PlayHQ Expert, Fast Typer"
            value={newTrait}
            onChange={(e) => setNewTrait(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTrait())}
          />
          <Button type="button" onClick={addTrait} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-muted/20 rounded-lg border border-dashed">
          {traits.length === 0 && (
            <span className="text-sm text-muted-foreground italic">No traits added yet.</span>
          )}
          {traits.map((trait, index) => (
            <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {trait}
              <button
                type="button"
                onClick={() => removeTrait(trait)}
                className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Add tags to describe the scorer&apos;s specific skills and software knowledge.
        </p>
      </div>
    </Card>
  );
}
