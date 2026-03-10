"use client";

import { useState } from 'react';
import { useViewMode } from '@/hooks/useViewMode';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  LayoutGrid, 
  List, 
  Table, 
  Calendar, 
  Search, 
  Filter,
  X,
  Layers
} from "lucide-react";
import Link from 'next/link';
import { 
  ListTeamsData, 
  ListOrganisationsData, 
  ListAgeDivisionsData 
} from "@/generated/dataconnect";
import { TeamCard } from "./TeamCard";
import { Badge } from "@/components/ui/badge";

interface TeamsClientProps {
  teams: ListTeamsData['teams'];
  organisations: ListOrganisationsData['organisations'];
  ageDivisions: ListAgeDivisionsData['ageDivisions'];
}

export function TeamsClient({ teams, organisations, ageDivisions }: TeamsClientProps) {
  const { viewMode, setViewMode } = useViewMode({ 
    storageKey: 'teams-v4-view-mode',
    defaultMode: 'grid'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  // Filter teams based on search and relational links
  const filteredTeams = teams.filter(team => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      team.name.toLowerCase().includes(searchLower) ||
      team.organisation?.name.toLowerCase().includes(searchLower) ||
      team.ageDivision?.name.toLowerCase().includes(searchLower)
    );

    const matchesOrg = selectedOrg === 'all' || team.organisation?.id === selectedOrg;
    const matchesDivision = selectedDivision === 'all' || team.ageDivision?.id === selectedDivision;

    return matchesSearch && matchesOrg && matchesDivision;
  });

  return (
    <div className="space-y-8">
      {/* Search and View Mode Toolbar */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-xl w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search teams, organisations, divisions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-card/50 border-primary/10 transition-all focus:ring-primary/20 focus:border-primary/30 text-lg rounded-2xl"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 border border-primary/10 rounded-2xl p-1.5 bg-card/50 backdrop-blur-sm self-end md:self-auto shadow-sm">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`h-10 px-4 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground'}`}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`h-10 px-4 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground'}`}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center bg-primary/5 p-6 rounded-3xl border border-primary/10">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm font-heading italic font-bold uppercase tracking-widest text-primary/60">Filters</span>
          </div>
          
          <div className="flex flex-wrap gap-3 flex-1">
             <select 
              className="h-10 min-w-[180px] rounded-xl border border-primary/10 bg-card px-4 py-1 text-sm shadow-sm transition-all focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
            >
              <option value="all">All Organisations</option>
              {organisations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>

            <select 
              className="h-10 min-w-[180px] rounded-xl border border-primary/10 bg-card px-4 py-1 text-sm shadow-sm transition-all focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
            >
              <option value="all">All Divisions</option>
              {ageDivisions.map(div => (
                <option key={div.id} value={div.id}>{div.name}</option>
              ))}
            </select>
          </div>

          {(selectedOrg !== 'all' || selectedDivision !== 'all' || searchTerm) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedOrg('all');
                setSelectedDivision('all');
                setSearchTerm('');
              }}
              className="text-primary hover:bg-primary/10 rounded-xl"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground italic font-medium">
          Showing <span className="text-foreground font-bold">{filteredTeams.length}</span> {filteredTeams.length === 1 ? 'Relational Team' : 'Relational Teams'}
        </div>
        <Badge variant="outline" className="font-heading italic py-1 border-primary/20">
          V4 Data Connect
        </Badge>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeams.map((team) => (
            <TeamCard 
              key={team.id} 
              team={team} 
              viewMode="grid" 
            />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {filteredTeams.map((team) => (
            <TeamCard 
              key={team.id} 
              team={team} 
              viewMode="list" 
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredTeams.length === 0 && (
        <Card className="border-dashed border-primary/20 bg-primary/5 rounded-3xl">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Layers className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <h3 className="text-2xl font-heading italic font-bold mb-3">No teams identified</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto italic font-medium">
              {searchTerm || selectedOrg !== 'all' || selectedDivision !== 'all' 
                ? 'The relational engine couldn\'t find matches for the active filters. Keep exploring!' 
                : 'Your relational database is clean and ready. Start building your first V4 team now.'}
            </p>
            {(!searchTerm && selectedOrg === 'all' && selectedDivision === 'all') && (
              <Link href="/teams/add">
                <Button className="bg-primary hover:bg-primary/90 rounded-2xl px-10 h-12 text-lg font-heading italic shadow-xl shadow-primary/20">
                  Build Team
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
