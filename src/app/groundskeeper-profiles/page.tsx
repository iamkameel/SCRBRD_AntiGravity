// Groundskeeper Profiles listing page

"use client";

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, UserCircle, Loader2 } from "lucide-react";
import { fetchGroundskeepers, type GroundskeeperProfile } from '@/lib/groundskeeper-data';

const CompactStatDisplay: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
  <div className="text-center px-1">
    <p className="text-xs uppercase text-muted-foreground tracking-tight truncate">{label}</p>
    <p className="text-md font-semibold text-foreground">{value !== undefined ? String(value) : '-'}</p>
  </div>
);

export default function GroundskeeperProfilesPage() {
  const [groundskeepers, setGroundskeepers] = React.useState<GroundskeeperProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    const loadGroundskeepers = async () => {
      try {
        const data = await fetchGroundskeepers();
        setGroundskeepers(data);
      } catch (error) {
        console.error('Error loading groundskeepers:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGroundskeepers();
  }, []);

  const filteredGroundskeepers = React.useMemo(() => {
    return groundskeepers.filter(gk => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        gk.name.toLowerCase().includes(searchLower) ||
        gk.expertiseAreas.some(area => area.toLowerCase().includes(searchLower));
      return matchesSearch;
    });
  }, [groundskeepers, searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading groundskeepers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <UserCircle className="h-6 w-6 text-[hsl(var(--primary))]" />
            Groundskeeper Profiles
          </CardTitle>
          <CardDescription>Directory of groundskeepers, their expertise, and assigned fields.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or expertise..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredGroundskeepers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroundskeepers.map((gk) => (
                <Card key={gk.id} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader className="flex flex-row items-start gap-4 pb-3">
                    <Avatar className="h-16 w-16 mt-1">
                      <AvatarImage src={gk.avatar} alt={gk.name} data-ai-hint="groundskeeper portrait" />
                      <AvatarFallback>{gk.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{gk.name}</CardTitle>
                      <CardDescription>
                        {gk.expertiseAreas.length > 0 && <Badge variant="secondary">{gk.expertiseAreas[0]}</Badge>}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow py-3 space-y-2">
                     <div className="grid grid-cols-1 gap-2">
                        <CompactStatDisplay label="Experience" value={`${gk.experienceYears} Yrs`} />
                     </div>
                     {gk.assignedFields.length > 0 && (
                        <p className="text-sm text-muted-foreground pt-1">
                          Manages: {gk.assignedFields[0].fieldName} {gk.assignedFields[0].location ? `(${gk.assignedFields[0].location})` : ''} 
                          {gk.assignedFields.length > 1 ? ` & ${gk.assignedFields.length-1} more`: ''}
                        </p>
                     )}
                  </CardContent>
                  <CardContent className="pt-2 pb-4 mt-auto">
                     <Button asChild variant="default" size="sm" className="w-full">
                        <Link href={`/groundskeeper/${gk.id}`}>View Full Profile</Link>
                      </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              {groundskeepers.length === 0 
                ? "No groundskeepers found in the database." 
                : "No groundskeepers found matching your search."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
