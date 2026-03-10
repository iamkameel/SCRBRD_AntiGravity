'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TagManagerProps {
  title: string;
  description: string;
  placeholder: string;
  initialData?: string[];
  onChange: (data: string[]) => void;
}

export function GroundskeeperTagManager({ title, description, placeholder, initialData = [], onChange }: TagManagerProps) {
  const [tags, setTags] = useState<string[]>(initialData);
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (!newTag.trim()) return;
    if (tags.includes(newTag.trim())) return;
    const updated = [...tags, newTag.trim()];
    setTags(updated);
    onChange(updated);
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    const updated = tags.filter(t => t !== tagToRemove);
    setTags(updated);
    onChange(updated);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-muted/20 rounded-lg border border-dashed">
          {tags.length === 0 && (
            <span className="text-sm text-muted-foreground italic">No tags added yet.</span>
          )}
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </Card>
  );
}
