"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { predictPlayerPerformanceAction, PlayerForecast } from "@/app/actions/analyticsActions";
import { Skeleton } from "@/components/ui/skeleton";

interface PlayerForecastWidgetProps {
  playerId: string;
}

export function PlayerForecastWidget({ playerId }: PlayerForecastWidgetProps) {
  const [forecast, setForecast] = useState<PlayerForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const result = await predictPlayerPerformanceAction(playerId);
        setForecast(result);
      } catch (error) {
        console.error("Failed to get forecast", error);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchForecast();
    }
  }, [playerId]);

  if (loading) return <Skeleton className="h-40 w-full" />;
  if (!forecast) return null;

  return (
    <Card className="border-blue-100 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <BrainCircuit className="h-4 w-4" />
          AI Performance Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Predicted {forecast.metric}</p>
            <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{forecast.predictedValue}</p>
          </div>
          <div className="text-right">
             <Badge variant={forecast.trend === 'Up' ? 'default' : forecast.trend === 'Down' ? 'destructive' : 'secondary'}>
               {forecast.trend === 'Up' && <TrendingUp className="h-3 w-3 mr-1" />}
               {forecast.trend === 'Down' && <TrendingDown className="h-3 w-3 mr-1" />}
               {forecast.trend === 'Stable' && <Minus className="h-3 w-3 mr-1" />}
               {forecast.trend} Trend
             </Badge>
             <p className="text-xs text-muted-foreground mt-1">{forecast.confidence}% Confidence</p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground italic">
          &quot;{forecast.analysis}&quot;
        </p>
      </CardContent>
    </Card>
  );
}
