"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CapacityGaugeProps {
  totalCapacity: number;
  currentOccupancy: number;
  trend?: 'up' | 'down' | 'stable';
  trendPercentage?: number;
}

export function CapacityGauge({ 
  totalCapacity, 
  currentOccupancy, 
  trend = 'stable',
  trendPercentage = 0
}: CapacityGaugeProps) {
  const occupancyPercentage = Math.min(100, (currentOccupancy / totalCapacity) * 100);
  const availableCapacity = totalCapacity - currentOccupancy;
  
  // Determine status level
  const getStatus = () => {
    if (occupancyPercentage >= 95) return { level: 'critical', color: 'destructive', label: 'Critical' };
    if (occupancyPercentage >= 80) return { level: 'warning', color: 'default', label: 'High' };
    if (occupancyPercentage >= 50) return { level: 'moderate', color: 'secondary', label: 'Moderate' };
    return { level: 'low', color: 'outline', label: 'Low' };
  };

  const status = getStatus();

  // Calculate gauge rotation (semicircle: -90° to 90°, total 180°)
  const rotation = -90 + (occupancyPercentage / 100) * 180;

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3" />;
      case 'down': return <TrendingDown className="h-3 w-3" />;
      default: return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-red-500';
      case 'down': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Capacity Status</CardTitle>
          <Badge variant={status.color as any}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Alerts */}
        {occupancyPercentage >= 95 && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Critical capacity! Only {availableCapacity} spots remaining.
            </AlertDescription>
          </Alert>
        )}
        {occupancyPercentage >= 80 && occupancyPercentage < 95 && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              High occupancy. {availableCapacity} spots remaining.
            </AlertDescription>
          </Alert>
        )}

        {/* Gauge Visual */}
        <div className="relative pt-4 pb-8 flex justify-center">
          <div className="relative w-40 h-20">
            {/* Background arc */}
            <svg className="absolute inset-0" viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 10 70 A 70 70 0 0 1 150 70"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-muted"
              />
              {/* Filled arc */}
              <path
                d="M 10 70 A 70 70 0 0 1 150 70"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={`${(occupancyPercentage / 100) * 220} 220`}
                className={
                  occupancyPercentage >= 95 ? 'text-red-500' :
                  occupancyPercentage >= 80 ? 'text-amber-500' :
                  occupancyPercentage >= 50 ? 'text-emerald-500' :
                  'text-emerald-500'
                }
              />
            </svg>
            
            {/* Percentage display */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
              <span className="text-3xl font-bold">{Math.round(occupancyPercentage)}%</span>
              <p className="text-xs text-muted-foreground">Occupied</p>
            </div>
          </div>
        </div>

        {/* Capacity Stats */}
        <div className="space-y-3 mt-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total Capacity</span>
            <span className="font-medium">{totalCapacity.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Current Occupancy</span>
            <span className="font-medium">{currentOccupancy.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t pt-3">
            <span className="text-muted-foreground">Available</span>
            <span className={`font-bold ${
              availableCapacity < totalCapacity * 0.05 ? 'text-red-500' :
              availableCapacity < totalCapacity * 0.2 ? 'text-amber-500' :
              'text-emerald-500'
            }`}>
              {availableCapacity.toLocaleString()}
            </span>
          </div>
          
          {/* Trend indicator */}
          {trendPercentage !== 0 && (
            <div className="flex justify-between items-center text-sm pt-2 border-t">
              <span className="text-muted-foreground">vs Last Week</span>
              <span className={`flex items-center gap-1 font-medium ${getTrendColor()}`}>
                {getTrendIcon()}
                {Math.abs(trendPercentage)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
