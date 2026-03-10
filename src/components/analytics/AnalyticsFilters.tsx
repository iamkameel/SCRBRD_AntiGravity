"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker, DateRangePresets, DateRange } from "./DateRangePicker";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AnalyticsFilters {
  dateRange: DateRange;
  season?: string;
  division?: string;
  league?: string;
  team?: string;
}

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onChange: (filters: AnalyticsFilters) => void;
  seasons?: Array<{ id: string; name: string }>;
  divisions?: Array<{ id: string; name: string }>;
  leagues?: Array<{ id: string; name: string }>;
  teams?: Array<{ id: string; name: string }>;
}

export function AnalyticsFiltersPanel({
  filters,
  onChange,
  seasons = [],
  divisions = [],
  leagues = [],
  teams = []
}: AnalyticsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = 
    filters.dateRange.from || 
    filters.season || 
    filters.division || 
    filters.league || 
    filters.team;

  const activeFilterCount = [
    filters.dateRange.from ? 1 : 0,
    filters.season ? 1 : 0,
    filters.division ? 1 : 0,
    filters.league ? 1 : 0,
    filters.team ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const clearFilters = () => {
    onChange({
      dateRange: { from: undefined, to: undefined },
      season: undefined,
      division: undefined,
      league: undefined,
      team: undefined
    });
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <DateRangePicker
              value={filters.dateRange}
              onChange={(dateRange) => onChange({ ...filters, dateRange })}
            />
            <DateRangePresets
              onChange={(dateRange) => onChange({ ...filters, dateRange })}
            />
          </div>

          {/* Season Filter */}
          {seasons.length > 0 && (
            <div className="space-y-2">
              <Label>Season</Label>
              <Select
                value={filters.season || "all"}
                onValueChange={(value) =>
                  onChange({ ...filters, season: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Seasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Seasons</SelectItem>
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={season.id}>
                      {season.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Division Filter */}
          {divisions.length > 0 && (
            <div className="space-y-2">
              <Label>Division</Label>
              <Select
                value={filters.division || "all"}
                onValueChange={(value) =>
                  onChange({ ...filters, division: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Divisions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Divisions</SelectItem>
                  {divisions.map((division) => (
                    <SelectItem key={division.id} value={division.id}>
                      {division.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* League Filter */}
          {leagues.length > 0 && (
            <div className="space-y-2">
              <Label>League</Label>
              <Select
                value={filters.league || "all"}
                onValueChange={(value) =>
                  onChange({ ...filters, league: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Leagues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leagues</SelectItem>
                  {leagues.map((league) => (
                    <SelectItem key={league.id} value={league.id}>
                      {league.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Team Filter */}
          {teams.length > 0 && (
            <div className="space-y-2">
              <Label>Team</Label>
              <Select
                value={filters.team || "all"}
                onValueChange={(value) =>
                  onChange({ ...filters, team: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
