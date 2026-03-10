"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CapacityDataPoint {
  date: string;
  occupancy: number;
  capacity: number;
}

interface CapacityTrendChartProps {
  data: CapacityDataPoint[];
  title?: string;
}

export function CapacityTrendChart({ data, title = "Capacity Trends (Last 7 Days)" }: CapacityTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No capacity data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate max occupancy for scaling
  const maxOccupancy = Math.max(...data.map(d => d.occupancy));
  const avgOccupancy = data.reduce((sum, d) => sum + d.occupancy, 0) / data.length;
  const peakDay = data.reduce((max, d) => d.occupancy > max.occupancy ? d : max, data[0]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              Avg: {Math.round(avgOccupancy)}
            </Badge>
            <Badge variant="default" className="text-xs">
              Peak: {peakDay.occupancy}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Simple Bar Chart */}
        <div className="space-y-3">
          {data.map((point, index) => {
            const percentage = (point.occupancy / point.capacity) * 100;
            const barWidth = (point.occupancy / maxOccupancy) * 100;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {new Date(point.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span className="font-medium">
                    {point.occupancy} / {point.capacity}
                  </span>
                </div>
                <div className="relative h-8 bg-muted rounded overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 flex items-center justify-end pr-2 text-xs font-medium text-white ${
                      percentage >= 95 ? 'bg-red-500' :
                      percentage >= 80 ? 'bg-amber-500' :
                      percentage >= 50 ? 'bg-emerald-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  >
                    {barWidth > 15 && `${Math.round(percentage)}%`}
                  </div>
                  {barWidth <= 15 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-foreground">
                      {Math.round(percentage)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-muted-foreground">Low {'(<50%)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-muted-foreground">Moderate (50-80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500" />
              <span className="text-muted-foreground">High (80-95%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-muted-foreground">Critical {'>95%'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
