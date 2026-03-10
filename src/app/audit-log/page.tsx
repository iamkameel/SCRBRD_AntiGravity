"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Clock, User, Filter } from "lucide-react";

// Mock Audit Data
const MOCK_LOGS = [
  { id: 'l1', action: 'User Login', user: 'Kameel Kalyan', role: 'System Architect', timestamp: '2024-03-22 10:45:00', details: 'Successful login from IP 192.168.1.1', severity: 'Info' },
  { id: 'l2', action: 'Update Match Score', user: 'John Smith', role: 'Scorer', timestamp: '2024-03-22 10:30:00', details: 'Updated score for Match #m2', severity: 'Info' },
  { id: 'l3', action: 'Delete Player', user: 'Kameel Kalyan', role: 'System Architect', timestamp: '2024-03-21 15:20:00', details: 'Deleted player profile "Temp User"', severity: 'Warning' },
  { id: 'l4', action: 'Failed Login Attempt', user: 'Unknown', role: '-', timestamp: '2024-03-21 09:15:00', details: 'Failed login attempt for admin@scrbrd.co.za', severity: 'Critical' },
  { id: 'l5', action: 'System Config Change', user: 'Kameel Kalyan', role: 'System Architect', timestamp: '2024-03-20 11:00:00', details: 'Updated global season settings', severity: 'Warning' },
  { id: 'l6', action: 'New User Registration', user: 'Sarah Johnson', role: 'Coach', timestamp: '2024-03-20 09:30:00', details: 'New account created', severity: 'Info' },
  { id: 'l7', action: 'Equipment Assigned', user: 'John Smith', role: 'Coach', timestamp: '2024-03-19 14:45:00', details: 'Assigned "GM Diamond Bat" to Virat Kohli', severity: 'Info' },
];

export default function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("All");

  const filteredLogs = MOCK_LOGS.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === "All" || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case 'Critical': return 'destructive';
      case 'Warning': return 'secondary';
      case 'Info': return 'default';
      default: return 'outline';
    }
  };

  const getSeverityBorderColor = (severity: string): string => {
    switch (severity) {
      case 'Critical': return 'border-l-destructive';
      case 'Warning': return 'border-l-amber-500';
      case 'Info': return 'border-l-primary';
      default: return 'border-l-muted';
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Audit Log</h1>
        </div>
        <p className="text-muted-foreground">
          Track system activity, security events, and user actions.
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Severities</SelectItem>
                  <SelectItem value="Info">Info</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Log Feed */}
      <div className="space-y-4">
        {filteredLogs.map(log => (
          <Card key={log.id} className={`border-l-4 ${getSeverityBorderColor(log.severity)}`}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center sm:items-start min-w-[100px] text-muted-foreground text-sm">
                  <Clock className="h-4 w-4 mb-1" />
                  <div className="text-center sm:text-left">
                    <div>{log.timestamp.split(' ')[0]}</div>
                    <div className="font-mono">{log.timestamp.split(' ')[1]}</div>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="text-lg font-semibold">{log.action}</h3>
                    <Badge variant={getSeverityVariant(log.severity)}>
                      {log.severity}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{log.details}</p>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{log.user}</span>
                    <span className="text-muted-foreground">({log.role})</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No logs found matching your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
