"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shovel, Search, Plus, User } from "lucide-react";
import { PitchConditionMatrix } from "@/components/groundskeepers/PitchConditionMatrix";
import { GroundskeeperPrepChecklist } from "@/components/groundskeepers/GroundskeeperPrepChecklist";
import { WeatherImpactAlert } from "@/components/matches/WeatherImpactAlert";

// Mock data for groundskeepers
const mockGroundskeepers = [
  { id: 1, name: "John Smith", role: "Head Groundskeeper", status: "Active", assignedFields: ["Main Oval", "Practice Nets"] },
  { id: 2, name: "Sarah Jones", role: "Assistant Groundskeeper", status: "Active", assignedFields: ["Junior Field"] },
  { id: 3, name: "Mike Brown", role: "Maintenance Staff", status: "On Leave", assignedFields: [] },
];

export default function GroundskeepersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGroundskeepers = mockGroundskeepers.filter(person => 
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8 font-['DM_Sans',sans-serif]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Shovel className="h-8 w-8 text-amber-400" />
            <h1 className="text-3xl font-extrabold font-['Syne',sans-serif] text-white">Groundskeepers & Facilities</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage groundskeeping staff, facility readiness, and field pitch assignments.
          </p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg transition-all active:scale-95">
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {/* Environmental & Weather Telemetry Section */}
      <div className="space-y-6">
        <PitchConditionMatrix />
        <WeatherImpactAlert />
        <GroundskeeperPrepChecklist />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 pt-4 border-t border-white/10">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search staff..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-900/80 border-white/10 text-white rounded-xl placeholder:text-muted-foreground focus:border-amber-400"
          />
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroundskeepers.map(person => (
          <div key={person.id} className="glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white font-['Syne',sans-serif]">{person.name}</h3>
                  <p className="text-xs text-muted-foreground">{person.role}</p>
                </div>
              </div>
              <Badge className={person.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-muted-foreground border border-white/10'}>{person.status}</Badge>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase font-['Syne',sans-serif]">Assigned Fields</p>
              <div className="flex flex-wrap gap-2">
                {person.assignedFields.length > 0 ? (
                  person.assignedFields.map(field => (
                    <Badge key={field} variant="outline" className="text-xs bg-slate-950/80 border-white/10 text-slate-200">
                      {field}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">No fields assigned</span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <Button variant="ghost" size="sm" className="text-xs text-amber-400 hover:text-amber-300 hover:bg-white/5 font-semibold">View Profile</Button>
            </div>
          </div>
        ))}
      </div>

      {filteredGroundskeepers.length === 0 && (
        <div className="glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No staff found matching your search.</p>
        </div>
      )}
    </div>
  );
}
