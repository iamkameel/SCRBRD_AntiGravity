"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface Partnership {
  batsman1: {
    name: string;
    runs: number;
    balls: number;
  };
  batsman2: {
    name: string;
    runs: number;
    balls: number;
  };
  totalRuns: number;
  totalBalls: number;
  runRate: number;
  wicket?: number;
}

interface PartnershipCardProps {
  partnership: Partnership;
  isCurrent?: boolean;
  className?: string;
}

export function PartnershipCard({
  partnership,
  isCurrent = false,
  className
}: PartnershipCardProps) {
  const runRate = partnership.runRate;
  const contribution1 = (partnership.batsman1.runs / partnership.totalRuns) * 100;
  const contribution2 = (partnership.batsman2.runs / partnership.totalRuns) * 100;

  // Design System (from scoring-dialog.tsx)
  return (
    <Card className={cn(
      "p-6 transition-all",
      isCurrent && "bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-bold">
            {isCurrent ? "Current Partnership" : `Wicket ${partnership.wicket}`}
          </h3>
        </div>
        {isCurrent && (
          <Badge className="bg-green-600">Live</Badge>
        )}
      </div>

      {/* Partnership Total */}
      <div className="mb-4">
        <div className="text-center mb-2">
          <div className="text-4xl font-bold text-primary">
            {partnership.totalRuns}
          </div>
          <div className="text-sm text-muted-foreground">
            {partnership.totalBalls} balls | Run Rate: {runRate.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Batsmen Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Batsman 1 */}
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="font-semibold mb-1">{partnership.batsman1.name}</div>
          <div className="text-2xl font-bold text-blue-600">{partnership.batsman1.runs}</div>
          <div className="text-xs text-muted-foreground">{partnership.batsman1.balls} balls</div>
          
          {/* Contribution Bar */}
          <div className="mt-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600"
                style={{ width: `${contribution1}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {contribution1.toFixed(0)}% contribution
            </div>
          </div>
        </div>

        {/* Batsman 2 */}
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="font-semibold mb-1">{partnership.batsman2.name}</div>
          <div className="text-2xl font-bold text-purple-600">{partnership.batsman2.runs}</div>
          <div className="text-xs text-muted-foreground">{partnership.batsman2.balls} balls</div>
          
          {/* Contribution Bar */}
          <div className="mt-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600"
                style={{ width: `${contribution2}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {contribution2.toFixed(0)}% contribution
            </div>
          </div>
        </div>
      </div>

      {/* Run Rate Indicator */}
      <div className="flex items-center justify-center gap-2 pt-3 border-t">
        <TrendingUp className={cn(
          "h-4 w-4",
          runRate > 8 ? "text-green-600" : runRate < 5 ? "text-red-600" : "text-orange-600"
        )} />
        <span className="text-sm font-medium">
          {runRate > 8 ? "Attacking" : runRate < 5 ? "Defensive" : "Steady"} partnership
        </span>
      </div>
    </Card>
  );
}

// Partnership List Component
interface PartnershipListProps {
 partnerships: Partnership[];
  currentPartnershipIndex?: number;
  className?: string;
}

export function PartnershipList({
  partnerships,
  currentPartnershipIndex,
  className
}: PartnershipListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5" />
        <h2 className="text-xl font-bold">Partnerships</h2>
      </div>
      
      {partnerships.map((partnership, idx) => (
        <PartnershipCard
          key={idx}
          partnership={partnership}
          isCurrent={currentPartnershipIndex === idx}
        />
      ))}

      {partnerships.length === 0 && (
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No partnerships recorded yet</p>
        </Card>
      )}
    </div>
  );
}
