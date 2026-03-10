"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, AlertTriangle, XCircle } from "lucide-react";

interface PitchConditionProps {
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  lastInspection?: string;
  nextMaintenance?: string;
  grassHealth?: number; // 0-100
  moistureLevel?: 'Dry' | 'Optimal' | 'Wet';
}

export function PitchCondition({ 
  condition, 
  lastInspection = 'Yesterday',
  nextMaintenance = 'Friday, 10:00 AM',
  grassHealth = 85,
  moistureLevel = 'Optimal'
}: PitchConditionProps) {
  
  const getConditionDetails = () => {
    switch (condition) {
      case 'Excellent':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
          badgeVariant: 'secondary' as const,
          description: 'Perfect playing conditions. Field is match-ready.'
        };
      case 'Good':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
          badgeVariant: 'default' as const,
          description: 'Good playing conditions with minor imperfections.'
        };
      case 'Fair':
        return {
          icon: AlertCircle,
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20',
          badgeVariant: 'outline' as const,
          description: 'Playable but requires attention soon.'
        };
      case 'Poor':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          badgeVariant: 'destructive' as const,
          description: 'Not recommended for matches. Maintenance required.'
        };
    }
  };

  const getMoistureColor = () => {
    switch (moistureLevel) {
      case 'Dry': return 'text-amber-500';
      case 'Optimal': return 'text-emerald-500';
      case 'Wet': return 'text-emerald-500';
    }
  };

  const details = getConditionDetails();
  const Icon = details.icon;

  return (
    <Card className={`border-2 ${details.borderColor} ${details.bgColor}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`${details.color}`}>
              <Icon className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Pitch Condition</h3>
                <Badge variant={details.badgeVariant}>{condition}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {details.description}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Grass Health</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${grassHealth >= 80 ? 'bg-emerald-500' : grassHealth >= 60 ? 'bg-emerald-500' : grassHealth >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${grassHealth}%` }}
                />
              </div>
              <span className="text-sm font-bold">{grassHealth}%</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Moisture</div>
            <div className={`text-sm font-bold ${getMoistureColor()}`}>
              {moistureLevel}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Last Inspection</div>
            <div className="text-sm font-medium">{lastInspection}</div>
          </div>
        </div>

        {/* Next Maintenance */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Next Maintenance:</span>
          <span className="font-medium">{nextMaintenance}</span>
        </div>
      </CardContent>
    </Card>
  );
}
