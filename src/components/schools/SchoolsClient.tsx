"use client";

import { useState } from 'react';
import { useViewMode } from '@/hooks/useViewMode';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, LayoutGrid, List, Table, Search, MapPin, Calendar } from "lucide-react";
import { School } from "@/types/firestore";
import { SchoolCard } from "./SchoolCard";

interface SchoolsClientProps {
  schools: School[];
}

export function SchoolsClient({ schools }: SchoolsClientProps) {
  const { viewMode, setViewMode } = useViewMode({ 
    storageKey: 'schools-view-mode',
    defaultMode: 'grid'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Filter schools based on search
  const filteredSchools = schools.filter(school => {
    const searchLower = searchTerm.toLowerCase();
    return (
      school.name.toLowerCase().includes(searchLower) ||
      school.abbreviation?.toLowerCase().includes(searchLower) ||
      school.location?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search and View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schools, locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 border border-border rounded-lg p-1 bg-muted/20">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 px-3"
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 px-3"
            title="List View"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="h-8 px-3"
            title="Table View"
          >
            <Table className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results Count */}
      {searchTerm && (
        <div className="text-sm text-muted-foreground">
          Found {filteredSchools.length} {filteredSchools.length === 1 ? 'school' : 'schools'}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => (
            <SchoolCard 
              key={school.id} 
              school={school} 
              viewMode="grid" 
            />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredSchools.map((school) => (
            <SchoolCard 
              key={school.id} 
              school={school} 
              viewMode="list" 
            />
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="overflow-hidden border-t-4 border-t-primary">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">School</th>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Location</th>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Est.</th>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Colors</th>
                    <th className="text-right p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((school) => (
                    <tr key={school.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {school.logoUrl ? (
                            <div className="relative w-8 h-8 shrink-0 rounded overflow-hidden bg-muted border border-border/50">
                              <Image 
                                src={school.logoUrl} 
                                alt={school.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 shrink-0 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
                              <span className="text-xs font-bold text-primary">
                                {school.abbreviation?.[0] || school.name[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{school.name}</div>
                            {school.abbreviation && (
                              <div className="text-xs text-muted-foreground">{school.abbreviation}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {school.location ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {school.location}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {school.establishmentYear || '-'}
                      </td>
                      <td className="p-4">
                        {school.brandColors ? (
                          <div className="flex gap-1">
                            <div 
                              className="h-4 w-4 rounded-full border border-border"
                              style={{ backgroundColor: school.brandColors.primary }}
                            />
                            <div 
                              className="h-4 w-4 rounded-full border border-border"
                              style={{ backgroundColor: school.brandColors.secondary }}
                            />
                          </div>
                        ) : '-'}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/schools/${school.id}`}>
                          <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredSchools.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No schools found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first school'}
            </p>
            {!searchTerm && (
              <Link href="/schools/add">
                <Button>
                  Add School
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
