"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Person } from "@/types/firestore";
import Image from "next/image";
import { User, TrendingUp, Activity, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerCardProps {
  player: Person;
  variant?: "compact" | "detailed";
  onSelect?: (playerId: string) => void;
  onSubstitute?: (playerId: string) => void;
  onViewStats?: (playerId: string) => void;
  isSelected?: boolean;
  isDisabled?: boolean;
  showActions?: boolean;
  className?: string;
}

export function PlayerCard({
  player,
  variant = "compact",
  onSelect,
  onSubstitute,
  onViewStats,
  isSelected = false,
  isDisabled = false,
  showActions = true,
  className
}: PlayerCardProps) {
  const isPlayer = player.role?.toLowerCase().includes('player');

  // Design System Colors (from scoring-dialog.tsx)
  const getBattingHandColor = (hand?: string) => {
    if (!hand) return "bg-gray-600";
    return hand.includes('RHB') ? "bg-blue-600" : "bg-green-600";
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return "bg-green-600";
      case 'injured': return "bg-red-600";
      case 'inactive': return "bg-gray-600";
      default: return "bg-blue-600";
    }
  };

  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "p-4 transition-all cursor-pointer hover:shadow-lg",
          isSelected && "ring-4 ring-primary scale-105",
          isDisabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={() => !isDisabled && onSelect?.(player.id)}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={player.profileImageUrl || `https://ui-avatars.com/api/?name=${player.firstName}+${player.lastName}&background=0ea5e9&color=fff&size=128`}
              alt={`${player.firstName} ${player.lastName}`}
              fill
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate">
              {player.firstName} {player.lastName}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {player.battingHand && (
                <Badge className={cn("text-xs", getBattingHandColor(player.battingHand))}>
                  {player.battingHand}
                </Badge>
              )}
              {player.playingRole && (
                <Badge variant="secondary" className="text-xs">
                  {player.playingRole}
                </Badge>
              )}
            </div>
          </div>

          {/* Status */}
          {player.status && (
            <div className={cn(
              "h-3 w-3 rounded-full",
              getStatusColor(player.status)
            )} />
          )}
        </div>
      </Card>
    );
  }

  // Detailed variant
  return (
    <Card
      className={cn(
        "p-6 transition-all",
        isSelected && "ring-4 ring-primary",
        isDisabled && "opacity-50",
        className
      )}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={player.profileImageUrl || `https://ui-avatars.com/api/?name=${player.firstName}+${player.lastName}&background=0ea5e9&color=fff&size=256`}
                alt={`${player.firstName} ${player.lastName}`}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {player.firstName} {player.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">{player.role || 'Player'}</p>
            </div>
          </div>
          
          <Badge className={cn("text-xs", getStatusColor(player.status))}>
            {player.status || 'Active'}
          </Badge>
        </div>

        {/* Player Details */}
        {isPlayer && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            {player.battingHand && (
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Batting</div>
                  <div className="text-sm font-semibold">{player.battingHand}</div>
                </div>
              </div>
            )}
            {player.bowlingStyle && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Bowling</div>
                  <div className="text-sm font-semibold">{player.bowlingStyle}</div>
                </div>
              </div>
            )}
            {player.playingRole && (
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Role</div>
                  <div className="text-sm font-semibold">{player.playingRole}</div>
                </div>
              </div>
            )}
            {player.stats?.matchesPlayed !== undefined && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Matches</div>
                  <div className="text-sm font-semibold">{player.stats.matchesPlayed}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {isPlayer && player.stats && (
          <div className="grid grid-cols-3 gap-2 pt-3 border-t">
            {player.stats.totalRuns !== undefined && (
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{player.stats.totalRuns}</div>
                <div className="text-xs text-muted-foreground">Runs</div>
              </div>
            )}
            {player.stats.wicketsTaken !== undefined && (
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">{player.stats.wicketsTaken}</div>
                <div className="text-xs text-muted-foreground">Wickets</div>
              </div>
            )}
            {player.stats.battingAverage !== undefined && (
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{player.stats.battingAverage.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Average</div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-3 border-t">
            {onSelect && (
              <Button
                onClick={() => onSelect(player.id)}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="flex-1"
                disabled={isDisabled}
              >
                {isSelected ? "Selected" : "Select"}
              </Button>
            )}
            {onSubstitute && (
              <Button
                onClick={() => onSubstitute(player.id)}
                variant="outline"
                size="sm"
                disabled={isDisabled}
              >
                Substitute
              </Button>
            )}
            {onViewStats && (
              <Button
                onClick={() => onViewStats(player.id)}
                variant="ghost"
                size="sm"
              >
                Stats
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
