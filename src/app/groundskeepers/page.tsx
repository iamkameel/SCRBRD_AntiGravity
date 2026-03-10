"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shovel, Search, Plus, User } from "lucide-react";

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
    <div className="container mx-auto py-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Shovel className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Groundskeepers</h1>
          </div>
          <p className="text-muted-foreground">
            Manage groundskeeping staff and assignments.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search staff..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroundskeepers.map(person => (
          <Card key={person.id}>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold">{person.name}</h3>
                    <p className="text-sm text-muted-foreground">{person.role}</p>
                  </div>
                </div>
                <Badge variant={person.status === 'Active' ? 'default' : 'secondary'}>{person.status}</Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Assigned Fields</p>
                <div className="flex flex-wrap gap-2">
                  {person.assignedFields.length > 0 ? (
                    person.assignedFields.map(field => (
                      <Badge key={field} variant="outline" className="text-xs">
                        {field}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">No fields assigned</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <Button variant="ghost" size="sm">View Profile</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroundskeepers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No staff found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
