"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Trophy, Activity } from "lucide-react";

interface PlayerProfileHeaderProps {
  player: any;
}

export function PlayerProfileHeader({ player }: PlayerProfileHeaderProps) {
  const fullName = `${player.firstName} ${player.lastName}`;
  const role = player.battingStyle || player.bowlingStyle || "All-rounder";

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Player Avatar */}
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Player Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-3xl font-bold">{fullName}</h1>
              <p className="text-muted-foreground mt-1">
                {player.teamName || "Team not assigned"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {role}
              </Badge>
              
              {player.battingStyle && (
                <Badge variant="outline">
                  Bat: {player.battingStyle}
                </Badge>
              )}
              
              {player.bowlingStyle && (
                <Badge variant="outline">
                  Bowl: {player.bowlingStyle}
                </Badge>
              )}
              
              <Badge variant="secondary" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Active
              </Badge>
            </div>

            {player.dateOfBirth && (
              <p className="text-sm text-muted-foreground">
                Born: {new Date(player.dateOfBirth).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
