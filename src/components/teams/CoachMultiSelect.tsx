"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown, Loader2, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Player as Person } from "@/lib/store";

interface CoachMultiSelectProps {
  coaches: Person[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function CoachMultiSelect({
  coaches,
  selectedIds,
  onSelectionChange,
  loading = false,
  placeholder = "Select coaches...",
  disabled = false,
}: CoachMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get selected coaches for display
  const selectedCoaches = useMemo(() => {
    return coaches.filter(coach => selectedIds.includes(coach.id));
  }, [coaches, selectedIds]);

  // Filter coaches based on search
  const filteredCoaches = useMemo(() => {
    if (!searchQuery.trim()) return coaches;
    
    const query = searchQuery.toLowerCase();
    return coaches.filter(coach => {
      const fullName = `${coach.firstName} ${coach.lastName}`.toLowerCase();
      const email = (coach.email || '').toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
  }, [coaches, searchQuery]);

  const toggleCoach = (coachId: string) => {
    if (selectedIds.includes(coachId)) {
      onSelectionChange(selectedIds.filter(id => id !== coachId));
    } else {
      onSelectionChange([...selectedIds, coachId]);
    }
  };

  const removeCoach = (coachId: string) => {
    onSelectionChange(selectedIds.filter(id => id !== coachId));
  };

  const getRoleBadgeVariant = (role?: string): "default" | "secondary" | "outline" => {
    if (!role) return "outline";
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes("head")) return "default";
    if (lowerRole.includes("assistant")) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || loading}
            className="w-full justify-between min-h-[40px] h-auto"
          >
            {loading ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading coaches...
              </span>
            ) : selectedCoaches.length > 0 ? (
              <span className="text-left truncate">
                {selectedCoaches.length} coach{selectedCoaches.length !== 1 ? 'es' : ''} selected
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search by name..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {coaches.length === 0 
                  ? "No coaches available for this school"
                  : "No coaches found matching your search"
                }
              </CommandEmpty>
              <CommandGroup>
                {filteredCoaches.map((coach) => {
                  const isSelected = selectedIds.includes(coach.id);
                  const fullName = `${coach.firstName} ${coach.lastName}`;
                  
                  return (
                    <CommandItem
                      key={coach.id}
                      value={coach.id}
                      onSelect={() => toggleCoach(coach.id)}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected 
                            ? "bg-primary border-primary text-primary-foreground" 
                            : "border-muted-foreground/30"
                        )}>
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{fullName}</span>
                          {coach.email && (
                            <span className="text-xs text-muted-foreground">{coach.email}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant={getRoleBadgeVariant(coach.role)} className="text-xs">
                        {coach.role || 'Coach'}
                      </Badge>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected coaches chips */}
      {selectedCoaches.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCoaches.map((coach) => (
            <Badge
              key={coach.id}
              variant="secondary"
              className="pl-2 pr-1 py-1 flex items-center gap-1"
            >
              <User className="h-3 w-3" />
              <span>{coach.firstName} {coach.lastName}</span>
              <button
                onClick={() => removeCoach(coach.id)}
                className="ml-1 rounded-full hover:bg-background/50 p-0.5"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
