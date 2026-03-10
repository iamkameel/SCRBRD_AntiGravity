"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, HelpCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvailabilityStats {
  available: number;
  unavailable: number;
  injured: number;
  doubtful: number;
  pending: number;
  total: number;
}

interface AvailabilityStatusCardProps {
  teamName: string;
  stats: AvailabilityStats;
  variant?: "compact" | "detailed";
  className?: string;
}

export function AvailabilityStatusCard({
  teamName,
  stats,
  variant = "detailed",
  className
}: AvailabilityStatusCardProps) {
  // Design System (from scoring-dialog.tsx)
  const statusConfig = [
    {
      key: "available",
      label: "Available",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-600",
      value: stats.available
    },
    {
      key: "injured",
      label: "Injured",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-600",
      value: stats.injured
    },
    {
      key: "unavailable",
      label: "Unavailable",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-600",
      value: stats.unavailable
    },
    {
      key: "doubtful",
      label: "Doubtful",
      icon: HelpCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-600",
      value: stats.doubtful
    },
  ];

  const readyToPlay = stats.available;
  const notAvailable = stats.injured + stats.unavailable;
  const readyPercentage = stats.total > 0 ? Math.round((readyToPlay / stats.total) * 100) : 0;

  if (variant === "compact") {
    return (
      <Card className={cn("p-4", className)}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{teamName}</h3>
              <p className="text-sm text-muted-foreground">Team Availability</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{readyToPlay}/{stats.total}</div>
              <div className="text-xs text-muted-foreground">Ready to Play</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 transition-all"
              style={{ width: `${readyPercentage}%` }}
            />
          </div>
        </div>
      </Card>
    );
  }

  // Detailed variant
  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5" />
              {teamName}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Squad Availability Status</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Players</div>
          </div>
        </div>

        {/* Availability Overview */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Ready to Play</div>
              <div className="text-3xl font-bold text-green-600">{readyToPlay}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Not Available</div>
              <div className="text-3xl font-bold text-red-600">{notAvailable}</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Availability</span>
              <span>{readyPercentage}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all"
                style={{ width: `${readyPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-muted-foreground">Status Breakdown</div>
          <div className="grid grid-cols-2 gap-3">
            {statusConfig.map((status) => {
              const Icon = status.icon;
              return (
                <div
                  key={status.key}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center",
                    `${status.bgColor}/10`
                  )}>
                    <Icon className={cn("h-5 w-5", status.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">{status.label}</div>
                    <div className="text-xl font-bold">{status.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        {notAvailable > 0 && (
          <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-600 p-3 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm text-red-900 dark:text-red-100">
                  Availability Alert
                </div>
                <div className="text-sm text-red-800 dark:text-red-200 mt-1">
                  {notAvailable} player{notAvailable !== 1 ? 's are' : ' is'} currently not available for selection.
                </div>
              </div>
            </div>
          </div>
        )}

        {stats.pending > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-600 p-3 rounded">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm text-orange-900 dark:text-orange-100">
                  Pending Confirmation
                </div>
                <div className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                  {stats.pending} player{stats.pending !== 1 ? 's have' : ' has'} pending availability status.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
