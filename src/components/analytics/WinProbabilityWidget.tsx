"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, TrendingUp, AlertCircle } from "lucide-react";
import { predictMatchOutcomeAction, PredictionResult } from "@/app/actions/analyticsActions";
import { Skeleton } from "@/components/ui/skeleton";

interface WinProbabilityWidgetProps {
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
}

export function WinProbabilityWidget({ 
  homeTeamId, 
  awayTeamId, 
  homeTeamName, 
  awayTeamName 
}: WinProbabilityWidgetProps) {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const result = await predictMatchOutcomeAction(homeTeamId, awayTeamId);
        setPrediction(result);
      } catch (error) {
        console.error("Failed to get prediction", error);
      } finally {
        setLoading(false);
      }
    };

    if (homeTeamId && awayTeamId) {
      fetchPrediction();
    }
  }, [homeTeamId, awayTeamId]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-purple-500" />
            AI Match Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prediction) return null;

  return (
    <Card className="border-purple-100 dark:border-purple-900 bg-purple-50/30 dark:bg-purple-900/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <BrainCircuit className="h-4 w-4" />
          AI Match Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Probability Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-purple-700">{homeTeamName} ({prediction.homeWinProbability}%)</span>
            <span className="text-gray-500">{awayTeamName} ({prediction.awayWinProbability}%)</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-purple-600 transition-all duration-1000 ease-out" 
              style={{ width: `${prediction.homeWinProbability}%` }}
            />
          </div>
        </div>

        {/* Factors */}
        {prediction.factors.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Key Factors</p>
            <div className="flex flex-wrap gap-2">
              {prediction.factors.map((factor, i) => (
                <Badge key={i} variant="outline" className="bg-white/50 text-xs font-normal border-purple-200 text-purple-800">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-white/50 p-2 rounded border border-purple-100">
          <AlertCircle className="h-3 w-3 mt-0.5 text-purple-500" />
          <p>Prediction based on historical win rates and head-to-head records. Actual results may vary.</p>
        </div>
      </CardContent>
    </Card>
  );
}
