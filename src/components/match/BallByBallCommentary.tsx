"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User } from "lucide-react";

import { CommentaryItem } from "@/lib/commentaryUtils";

interface BallByBallCommentaryProps {
  commentary: CommentaryItem[];
  maxHeight?: string;
}

export function BallByBallCommentary({ commentary, maxHeight = "600px" }: BallByBallCommentaryProps) {
  const getRunsColor = (runs: number) => {
    if (runs >= 6) return 'bg-purple-100 text-purple-700 border-purple-300';
    if (runs === 4) return 'bg-blue-100 text-blue-700 border-blue-300';
    if (runs === 0) return 'bg-gray-100 text-gray-700 border-gray-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ball-by-Ball Commentary</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="space-y-3 overflow-y-auto pr-2" 
          style={{ maxHeight }}
        >
          {commentary.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No commentary available yet
            </div>
          ) : (
            commentary.map((item, idx) => (
              <div 
                key={idx} 
                className="border-l-4 border-primary pl-4 pb-3 hover:bg-muted/50 transition-colors rounded-r"
              >
                {/* Over and Ball Info */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {item.over}.{item.ball}
                    </span>
                    {item.bowler && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.bowler}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Runs Badge */}
                    <span className={`px-2 py-0.5 rounded border text-xs font-bold ${getRunsColor(item.runs)}`}>
                      {item.runs === 0 ? '•' : item.runs}
                    </span>
                    
                    {/* Timestamp */}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.timestamp}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-foreground leading-relaxed">
                  {item.description}
                </p>

                {/* Batsman */}
                {item.batsman && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.batsman} facing
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to format mock commentary data
export function createCommentaryItem(
  over: number,
  ball: number,
  description: string,
  runs: number,
  bowler?: string,
  batsman?: string
): CommentaryItem {
  return {
    over,
    ball,
    description,
    runs,
    timestamp: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    bowler,
    batsman,
  };
}
