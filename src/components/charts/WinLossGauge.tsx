"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WinLossGaugeProps {
  wins: number;
  losses: number;
  draws?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function WinLossGauge({ wins, losses, draws = 0, size = 'md' }: WinLossGaugeProps) {
  const total = wins + losses + draws;
  const winPercentage = total > 0 ? (wins / total) * 100 : 0;
  
  // Size configurations
  const sizes = {
    sm: { width: 120, height: 120, strokeWidth: 12, fontSize: 'text-xl' },
    md: { width: 160, height: 160, strokeWidth: 16, fontSize: 'text-3xl' },
    lg: { width: 200, height: 200, strokeWidth: 20, fontSize: 'text-4xl' },
  };
  
  const config = sizes[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (winPercentage / 100) * circumference;
  
  // Determine color based on win percentage
  const getColor = () => {
    if (winPercentage >= 70) return 'text-green-500';
    if (winPercentage >= 50) return 'text-yellow-500';
    if (winPercentage >= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  const gaugeColor = () => {
    if (winPercentage >= 70) return '#22c55e';
    if (winPercentage >= 50) return '#eab308';
    if (winPercentage >= 30) return '#f97316';
    return '#ef4444';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Win Rate</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {/* Gauge Chart */}
        <div className="relative" style={{ width: config.width, height: config.width }}>
          <svg
            width={config.width}
            height={config.height}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={config.width / 2}
              cy={config.height / 2}
              r={radius}
              stroke="#e5e7eb"
              strokeWidth={config.strokeWidth}
              fill="none"
            />
            
            {/* Progress circle */}
            <circle
              cx={config.width / 2}
              cy={config.height / 2}
              r={radius}
              stroke={gaugeColor()}
              strokeWidth={config.strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`font-bold ${config.fontSize} ${getColor()}`}>
              {winPercentage.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
        </div>

        {/* Stats Breakdown */}
        <div className="w-full mt-6 grid grid-cols-3 gap-2 text-center">
          <div className="bg-green-50 rounded p-2">
            <div className="text-lg font-bold text-green-600">{wins}</div>
            <div className="text-xs text-muted-foreground">Wins</div>
          </div>
          <div className="bg-red-50 rounded p-2">
            <div className="text-lg font-bold text-red-600">{losses}</div>
            <div className="text-xs text-muted-foreground">Losses</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-lg font-bold text-gray-600">{draws}</div>
            <div className="text-xs text-muted-foreground">Draws</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
