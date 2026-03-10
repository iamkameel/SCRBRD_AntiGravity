"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Loader2, TrendingUp, Shield } from "lucide-react";
import { predictMatchOutcomeAction } from "@/app/actions/analyticsActions";

interface PredictionResult {
  homeWinProbability: number;
  awayWinProbability: number;
  factors: string[];
}

export function MatchPredictionCard() {
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    if (!homeTeamId || !awayTeamId) {
      setError("Please enter both team IDs");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await predictMatchOutcomeAction(homeTeamId, awayTeamId);
      setPrediction(result);
    } catch (err) {
      setError("Failed to generate prediction. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-100 dark:border-blue-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Match Outcome Prediction
        </CardTitle>
        <CardDescription>AI analysis based on historical performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="home-team">Home Team ID</Label>
            <Input
              id="home-team"
              placeholder="Enter team ID..."
              value={homeTeamId}
              onChange={(e) => setHomeTeamId(e.target.value)}
              className="bg-white/60 dark:bg-black/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="away-team">Away Team ID</Label>
            <Input
              id="away-team"
              placeholder="Enter team ID..."
              value={awayTeamId}
              onChange={(e) => setAwayTeamId(e.target.value)}
              className="bg-white/60 dark:bg-black/20"
            />
          </div>
        </div>

        <Button 
          onClick={handlePredict}
          disabled={loading || !homeTeamId || !awayTeamId}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Teams...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Predict Match Outcome
            </>
          )}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {prediction && (
          <div className="space-y-4 pt-4 border-t border-blue-200 dark:border-blue-800">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Home Team Win</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {prediction.homeWinProbability}%
                  </span>
                </div>
                <div className="h-3 bg-white/60 dark:bg-black/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${prediction.homeWinProbability}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Away Team Win</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {prediction.awayWinProbability}%
                  </span>
                </div>
                <div className="h-3 bg-white/60 dark:bg-black/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${prediction.awayWinProbability}%` }}
                  />
                </div>
              </div>
            </div>

            {prediction.factors.length > 0 && (
              <div className="p-4 bg-white/60 dark:bg-black/20 rounded-lg">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Key Factors
                </p>
                <ul className="space-y-2">
                  {prediction.factors.map((factor, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
