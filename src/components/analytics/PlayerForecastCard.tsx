"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { predictPlayerPerformanceAction } from "@/app/actions/analyticsActions";

interface PlayerForecast {
  predictedValue: number;
  metric: 'Runs' | 'Wickets';
  confidence: number;
  trend: 'Up' | 'Down' | 'Stable';
  analysis: string;
}

export function PlayerForecastCard() {
  const [playerId, setPlayerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<PlayerForecast | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    if (!playerId) {
      setError("Please enter a player ID");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await predictPlayerPerformanceAction(playerId);
      setForecast(result);
    } catch (err) {
      setError("Failed to generate prediction. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Up':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'Down':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 dark:text-green-400";
    if (confidence >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-100 dark:border-purple-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Player Performance Forecast
        </CardTitle>
        <CardDescription>AI-powered prediction for upcoming matches</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="player-select">Select Player</Label>
          <Input
            id="player-select"
            placeholder="Enter player ID or name..."
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            className="bg-white/60 dark:bg-black/20"
          />
        </div>

        <Button 
          onClick={handlePredict}
          disabled={loading || !playerId}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Prediction...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Generate Prediction
            </>
          )}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {forecast && (
          <div className="space-y-4 pt-4 border-t border-purple-200 dark:border-purple-800">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/60 dark:bg-black/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Predicted {forecast.metric}</p>
                <p className="text-2xl font-bold">{forecast.predictedValue}</p>
              </div>
              <div className="p-4 bg-white/60 dark:bg-black/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                <p className={`text-2xl font-bold ${getConfidenceColor(forecast.confidence)}`}>
                  {forecast.confidence}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
              <span className="text-sm text-muted-foreground">Trend:</span>
              {getTrendIcon(forecast.trend)}
              <span className="font-medium">{forecast.trend}</span>
            </div>

            <div className="p-4 bg-white/60 dark:bg-black/20 rounded-lg">
              <p className="text-sm font-medium mb-2">Analysis</p>
              <p className="text-sm text-muted-foreground">{forecast.analysis}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
