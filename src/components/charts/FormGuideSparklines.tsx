"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FormMatch {
  result: 'W' | 'L' | 'D' | 'T'; // Win, Loss, Draw, Tie
  opponent: string;
  date: string;
}

interface FormGuideProps {
  matches: FormMatch[];
  teamName: string;
}

export function FormGuideSparklines({ matches, teamName }: FormGuideProps) {
  // Calculate win percentage over time
  const winPercentages: number[] = [];
  let wins = 0;
  
  matches.forEach((match, index) => {
    if (match.result === 'W') wins++;
    winPercentages.push((wins / (index + 1)) * 100);
  });

  const maxHeight = 60;
  
  // Generate SVG path for sparkline
  const generatePath = (data: number[]) => {
    if (data.length === 0) return '';
    
    const width = 100;
    const step = width / (data.length - 1 || 1);
    
    return data
      .map((value, index) => {
        const x = index * step;
        const y = maxHeight - (value / 100) * maxHeight;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const getResultColor = (result: FormMatch['result']) => {
    switch (result) {
      case 'W': return 'bg-green-500';
      case 'L': return 'bg-red-500';
      case 'D': return 'bg-gray-400';
      case 'T': return 'bg-emerald-500';
      default: return 'bg-gray-300';
    }
  };

  const getResultText = (result: FormMatch['result']) => {
    switch (result) {
      case 'W': return 'Won';
      case 'L': return 'Lost';
      case 'D': return 'Draw';
      case 'T': return 'Tied';
      default: return '';
    }
  };

  // Calculate stats
  const wins_count = matches.filter(m => m.result === 'W').length;
  const losses = matches.filter(m => m.result === 'L').length;
  const draws = matches.filter(m => m.result === 'D').length;
  const winRate = matches.length > 0 ? (wins_count / matches.length * 100).toFixed(1) : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Guide - {teamName}</CardTitle>
        <p className="text-sm text-muted-foreground">Recent match results</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Win Percentage Sparkline */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Win Rate Trend</span>
            <span className="text-lg font-bold text-primary">{winRate}%</span>
          </div>
          <div className="relative" style={{ height: `${maxHeight}px` }}>
            <svg
              viewBox={`0 0 100 ${maxHeight}`}
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              <line x1="0" y1={maxHeight / 2} x2="100" y2={maxHeight / 2} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,2" />
              
              {/* Sparkline */}
              <path
                d={generatePath(winPercentages)}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              
              {/* Area fill */}
              <path
                d={`${generatePath(winPercentages)} L 100 ${maxHeight} L 0 ${maxHeight} Z`}
                fill="hsl(var(--primary))"
                opacity="0.1"
              />
            </svg>
          </div>
        </div>

        {/* Result Sequence */}
        <div>
          <div className="text-sm font-medium mb-3">Last {matches.length} Matches</div>
          <div className="flex gap-1 flex-wrap">
            {matches.slice().reverse().map((match, index) => (
              <div
                key={index}
                className="group relative"
                title={`${getResultText(match.result)} vs ${match.opponent}`}
              >
                <div className={`w-8 h-8 ${getResultColor(match.result)} rounded flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform cursor-pointer`}>
                  {match.result}
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {getResultText(match.result)} vs {match.opponent}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{wins_count}</div>
            <div className="text-xs text-muted-foreground">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{losses}</div>
            <div className="text-xs text-muted-foreground">Losses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{draws}</div>
            <div className="text-xs text-muted-foreground">Draws</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
