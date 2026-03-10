"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FieldPosition {
  name: string;
  x: number; // 0-100 (left to right)
  y: number; // 0-100 (top to bottom)
}

interface FieldPlotterProps {
  positions: FieldPosition[];
  showLabels?: boolean;
}

export function FieldPlotter({ positions, showLabels = true }: FieldPlotterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Placements</CardTitle>
        <p className="text-sm text-muted-foreground">Current fielding positions</p>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-square bg-green-50 rounded-lg border-2 border-green-200 overflow-hidden">
          {/* Cricket Pitch */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-3/4 bg-amber-100 border-2 border-amber-300 rounded-sm opacity-60">
            {/* Stumps markers */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
          </div>

          {/* 30-yard circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 aspect-square border-2 border-dashed border-green-400 rounded-full opacity-40"></div>

          {/* Fielding Positions */}
          {positions.map((position, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Fielder dot */}
              <div className="relative">
                <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg hover:scale-150 transition-transform cursor-pointer"></div>
                
                {/* Label */}
                {showLabels && (
                  <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-white/90 px-2 py-0.5 rounded text-xs font-medium shadow-sm">
                      {position.name}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Position Count */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {positions.length} fielders placed
        </div>
      </CardContent>
    </Card>
  );
}

// Preset field positions for common setups
export const FIELD_PRESETS = {
  attacking: [
    { name: 'Slip', x: 85, y: 45 },
    { name: 'Gully', x: 80, y: 35 },
    { name: 'Point', x: 75, y: 25 },
    { name: 'Cover', x: 65, y: 20 },
    { name: 'Mid Off', x: 55, y: 15 },
    { name: 'Mid On', x: 45, y: 15 },
    { name: 'Mid Wicket', x: 35, y: 20 },
    { name: 'Square Leg', x: 25, y: 50 },
    { name: 'Fine Leg', x: 20, y: 70 },
  ],
  defensive: [
    { name: 'Third Man', x: 90, y: 60 },
    { name: 'Deep Point', x: 80, y: 15 },
    { name: 'Deep Cover', x: 65, y: 10 },
    { name: 'Long Off', x: 50, y: 5 },
    { name: 'Long On', x: 40, y: 5 },
    { name: 'Deep Mid Wicket', x: 30, y: 10 },
    { name: 'Deep Square Leg', x: 20, y: 45 },
    { name: 'Deep Fine Leg', x: 15, y: 75 },
    { name: 'Keeper', x: 95, y: 50 },
  ],
};
