"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

interface MatchHistoryItem {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  result: string;
  attendance?: number;
  matchType: 'League' | 'Cup' | 'Friendly';
}

interface FieldMatchHistoryProps {
  matches: MatchHistoryItem[];
  totalMatches: number;
  averageAttendance: number;
}

export function FieldMatchHistory({ 
  matches, 
  totalMatches = 0,
  averageAttendance = 0 
}: FieldMatchHistoryProps) {
  
  const getMatchTypeColor = (type: MatchHistoryItem['matchType']) => {
    switch (type) {
      case 'League': return 'default';
      case 'Cup': return 'secondary';
      case 'Friendly': return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Matches at This Venue</CardTitle>
          <div className="flex gap-2 text-sm">
            <Badge variant="secondary">{totalMatches} Total</Badge>
            <Badge variant="outline">Avg: {averageAttendance.toLocaleString()}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No matches recorded at this venue yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <div 
                key={match.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex flex-col items-center justify-center min-w-[60px] p-2 bg-muted rounded-md text-center">
                    <Calendar className="h-4 w-4 mb-1 text-muted-foreground" />
                    <span className="text-xs font-bold">
                      {new Date(match.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{match.homeTeam}</span>
                      <span className="text-muted-foreground">vs</span>
                      <span className="font-semibold">{match.awayTeam}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-medium text-primary">{match.result}</span>
                      {match.attendance && (
                        <span>• {match.attendance.toLocaleString()} attendance</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Badge variant={getMatchTypeColor(match.matchType)}>
                  {match.matchType}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
