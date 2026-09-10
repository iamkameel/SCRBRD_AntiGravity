"use client";

import { useState, useMemo } from 'react';
import { useViewMode } from '@/hooks/useViewMode';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { 
  GraduationCap, 
  LayoutGrid, 
  List as ListIcon, 
  Table as TableIcon, 
  Search, 
  MapPin, 
  Calendar,
  X,
  Globe,
  Award,
  ShieldCheck,
  Building2
} from "lucide-react";
import { School } from "@/types/firestore";
import { SchoolCard } from "./SchoolCard";
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SchoolsClientProps {
  schools: School[];
}

export function SchoolsClient({ schools }: SchoolsClientProps) {
  const { viewMode, setViewMode } = useViewMode({ 
    storageKey: 'schools-view-mode-v4',
    defaultMode: 'grid'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSchools = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return schools.filter(school => {
      return (
        school.name.toLowerCase().includes(searchLower) ||
        school.abbreviation?.toLowerCase().includes(searchLower) ||
        school.location?.toLowerCase().includes(searchLower)
      );
    });
  }, [schools, searchTerm]);

  const metrics = useMemo(() => {
    const locationsSet = new Set(schools.map(s => s.location).filter(Boolean));
    const estCount = schools.filter(s => s.establishmentYear).length;
    return {
      total: schools.length,
      locationsCount: locationsSet.size,
      estCount: estCount,
      filteredCount: filteredSchools.length
    };
  }, [schools, filteredSchools]);

  return (
    <div className="space-y-6">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border bg-surf1" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Schools</span>
            <GraduationCap size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-primary font-mono">{metrics.total}</div>
        </div>

        <div className="p-4 rounded-2xl border bg-surf1" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Locations & Hubs</span>
            <MapPin size={16} className="text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono">{metrics.locationsCount}</div>
        </div>

        <div className="p-4 rounded-2xl border bg-surf1" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Established Institutions</span>
            <Building2 size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{metrics.estCount}</div>
        </div>

        <div className="p-4 rounded-2xl border bg-surf1" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filtered Schools</span>
            <ShieldCheck size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{metrics.filteredCount}</div>
        </div>
      </div>

      {/* Search and View Mode Control Strip */}
      <div className="p-4 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xl" style={{ background: D.surf1, borderColor: D.border }}>
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search school name, abbreviation, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-9 h-11 rounded-xl border-white/10 bg-white/5 focus:bg-white/10 text-sm"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/20 border border-white/10 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
            title="Grid View"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
            title="List View"
          >
            <ListIcon size={16} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn("p-2 rounded-lg transition-all", viewMode === 'table' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
            title="Table View"
          >
            <TableIcon size={16} />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchools.map((school, index) => (
            <SchoolCard 
              key={school.id} 
              school={school} 
              viewMode="grid"
              index={index} 
            />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredSchools.map((school, index) => (
            <SchoolCard 
              key={school.id} 
              school={school} 
              viewMode="list" 
              index={index}
            />
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-2xl border overflow-hidden shadow-xl" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                  <th className="p-4">School</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Established</th>
                  <th className="p-4">Colors</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {school.logoUrl ? (
                          <div className="relative w-8 h-8 shrink-0 rounded-lg overflow-hidden bg-muted border border-white/10">
                            <Image 
                              src={school.logoUrl} 
                              alt={school.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 shrink-0 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <span className="text-xs font-bold text-indigo-400">
                              {school.abbreviation?.[0] || school.name[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white">{school.name}</div>
                          {school.abbreviation && (
                            <div className="text-xs text-muted-foreground">{school.abbreviation}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {school.location ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-sky-400" />
                          {school.location}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-muted-foreground text-xs font-mono">
                      {school.establishmentYear || '-'}
                    </td>
                    <td className="p-4">
                      {school.brandColors ? (
                        <div className="flex gap-1">
                          <div 
                            className="h-4 w-4 rounded-full border border-white/20"
                            style={{ backgroundColor: school.brandColors.primary }}
                          />
                          <div 
                            className="h-4 w-4 rounded-full border border-white/20"
                            style={{ backgroundColor: school.brandColors.secondary }}
                          />
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/schools/${school.id}`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg border-white/10 hover:bg-white/10">
                          View Hub
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredSchools.length === 0 && (
        <div className="py-16 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3" style={{ borderColor: D.border }}>
          <GraduationCap className="h-10 w-10 text-muted-foreground/30 animate-pulse" />
          <h3 className="text-sm font-bold text-primary">No Schools Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {searchTerm ? 'Try adjusting your search query' : 'Get started by adding your first school institution'}
          </p>
        </div>
      )}
    </div>
  );
}
