"use client";

import { useState } from 'react';
import { useViewMode } from '@/hooks/useViewMode';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { MapPin, LayoutGrid, List, Table, Calendar, Search } from "lucide-react";
import { Field } from "@/types/firestore";
import { FieldCard } from "./FieldCard";
import { FieldBookingCalendar } from "./FieldBookingCalendar";

interface FieldsClientProps {
  fields: Field[];
}

export function FieldsClient({ fields }: FieldsClientProps) {
  const { viewMode, setViewMode } = useViewMode({ 
    storageKey: 'fields-view-mode',
    defaultMode: 'grid'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPitchType, setSelectedPitchType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'name' | 'capacity'>('name');

  // Filter fields based on search and filters
  const filteredFields = fields.filter(field => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      field.name.toLowerCase().includes(searchLower) ||
      field.location?.toLowerCase().includes(searchLower) ||
      (typeof field.pitchType === 'string' && field.pitchType.toLowerCase().includes(searchLower))
    );

    const matchesPitchType = selectedPitchType === 'all' || field.pitchType === selectedPitchType;

    return matchesSearch && matchesPitchType;
  }).sort((a, b) => {
    if (sortOrder === 'capacity') {
      return (b.capacity || 0) - (a.capacity || 0);
    }
    return a.name.localeCompare(b.name);
  });

  // Get unique pitch types
  const pitchTypes = Array.from(new Set(fields.map(f => f.pitchType).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Search and View Mode Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fields, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 border border-border rounded-lg p-1 bg-muted/20 self-end sm:self-auto">
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
            <Button
              variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="h-8 px-3"
              title="Calendar View"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center bg-muted/10 p-4 rounded-lg border border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Pitch Type:</span>
            <select 
              className="h-9 w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={selectedPitchType}
              onChange={(e) => setSelectedPitchType(e.target.value)}
            >
              <option value="all">All Types</option>
              {pitchTypes.map(type => (
                <option key={type as string} value={type as string}>{type as string}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Sort By:</span>
            <select 
              className="h-9 w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'name' | 'capacity')}
            >
              <option value="name">Name (A-Z)</option>
              <option value="capacity">Capacity (High-Low)</option>
            </select>
          </div>

          {(selectedPitchType !== 'all' || searchTerm) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedPitchType('all');
                setSearchTerm('');
              }}
              className="ml-auto text-muted-foreground hover:text-foreground"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Found {filteredFields.length} {filteredFields.length === 1 ? 'field' : 'fields'}
        {(selectedPitchType !== 'all') && ' matching filters'}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((field) => (
            <FieldCard 
              key={field.id} 
              field={field} 
              viewMode="grid" 
            />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredFields.map((field) => (
            <FieldCard 
              key={field.id} 
              field={field} 
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
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Name</th>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Location</th>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Pitch Type</th>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Capacity</th>
                    <th className="text-right p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFields.map((field) => (
                    <tr key={field.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{field.name}</td>
                      <td className="p-4 text-muted-foreground">{field.location || '-'}</td>
                      <td className="p-4">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{field.pitchType || 'Turf'}</Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">{field.capacity || '-'}</td>
                      <td className="p-4 text-right">
                        <Link href={`/fields/${field.id}`}>
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

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="space-y-4">
          {filteredFields.length > 0 ? (
            <div className="space-y-6">
              {filteredFields.map((field) => (
                <Card key={field.id} className="border-t-4 border-t-primary">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{field.name}</h3>
                        <p className="text-sm text-muted-foreground">{field.location}</p>
                      </div>
                      <Badge variant="secondary">{field.pitchType || 'Turf'}</Badge>
                    </div>
                    <FieldBookingCalendar fieldId={field.id} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-semibold mb-2">No fields to display</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedPitchType !== 'all'
                    ? 'Adjust your filters to see field calendars'
                    : 'Add fields to start managing bookings'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredFields.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No fields found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedPitchType !== 'all' 
                ? 'Try adjusting your filters or search terms' 
                : 'Get started by adding your first field'}
            </p>
            {(!searchTerm && selectedPitchType === 'all') && (
              <Link href="/fields/new">
                <Button>
                  Add Field
                </Button>
              </Link>
            )}
            {(searchTerm || selectedPitchType !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedPitchType('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
