"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Person } from "@/types/firestore";
import { AlertCircle, CheckCircle2, HelpCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerAvailabilityCardProps {
  player: Person;
  availability: "available" | "unavailable" | "doubtful" | "injured" | "pending";
  reason?: string;
  estimatedReturn?: string;
  onUpdateAvailability?: (playerId: string, status: string) => void;
  className?: string;
}

export function PlayerAvailabilityCard({
  player,
  availability,
  reason,
  estimatedReturn,
  onUpdateAvailability,
  className
}: PlayerAvailabilityCardProps) {
  // Design System (from scoring-dialog.tsx)
  const getAvailabilityConfig = (status: string) => {
    switch (status) {
      case "available":
        return {
          color: "bg-green-600 hover:bg-green-700",
          icon: CheckCircle2,
          label: "Available",
          badgeVariant: "default" as const
        };
      case "unavailable":
        return {
          color: "bg-red-600 hover:bg-red-700",
          icon: XCircle,
          label: "Unavailable",
          badgeVariant: "destructive" as const
        };
      case "doubtful":
        return {
          color: "bg-orange-600 hover:bg-orange-700",
          icon: HelpCircle,
          label: "Doubtful",
          badgeVariant: "secondary" as const
        };
      case "injured":
        return {
          color: "bg-red-600 hover:bg-red-700",
          icon: AlertCircle,
          label: "Injured",
          badgeVariant: "destructive" as const
        };
      case "pending":
        return {
          color: "bg-gray-600 hover:bg-gray-700",
          icon: Clock,
          label: "Pending",
          badgeVariant: "outline" as const
        };
      default:
        return {
          color: "bg-blue-600 hover:bg-blue-700",
          icon: HelpCircle,
          label: "Unknown",
          badgeVariant: "secondary" as const
        };
    }
  };

  const config = getAvailabilityConfig(availability);
  const Icon = config.icon;

  const availabilityOptions = [
    { value: "available", label: "Available", color: "bg-green-600" },
    { value: "unavailable", label: "Unavailable", color: "bg-red-600" },
    { value: "doubtful", label: "Doubtful", color: "bg-orange-600" },
    { value: "injured", label: "Injured", color: "bg-red-600" },
  ];

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-3">
        {/* Player Info with Status */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-semibold">
              {player.firstName} {player.lastName}
            </h4>
            <p className="text-sm text-muted-foreground">{player.playingRole || player.role}</p>
          </div>
          
          <Badge
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5",
              config.color
            )}
            variant={config.badgeVariant}
          >
            <Icon className="h-4 w-4" />
            {config.label}
          </Badge>
        </div>

        {/* Reason/Details */}
        {(reason || estimatedReturn) && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            {reason && (
              <div className="text-sm">
                <span className="font-medium">Reason: </span>
                <span className="text-muted-foreground">{reason}</span>
              </div>
            )}
            {estimatedReturn && (
              <div className="text-sm">
                <span className="font-medium">Expected Return: </span>
                <span className="text-muted-foreground">{estimatedReturn}</span>
              </div>
            )}
          </div>
        )}

        {/* Update Availability */}
        {onUpdateAvailability && (
          <div className="pt-2 border-t">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Update Status
            </div>
            <div className="grid grid-cols-2 gap-2">
              {availabilityOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => onUpdateAvailability(player.id, option.value)}
                  variant={availability === option.value ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "text-xs",
                    availability === option.value && option.color
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
