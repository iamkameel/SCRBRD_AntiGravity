"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { compareTeamsAction, TeamComparison } from "@/app/actions/teamComparisonActions";
import { Loader2, Swords } from "lucide-react";

export function TeamStrengthAnalysis() {
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TeamComparison[] | null>(null);
  const [error, setError] = useState("");

  const handleCompare = async () => {
    if (!homeTeamId || !awayTeamId) return;
    
    setLoading(true);
    setError("");
    
    try {
      const result = await compareTeamsAction(homeTeamId, awayTeamId);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to compare teams");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" />
          Team Strength Analysis
        </CardTitle>
        <CardDescription>Compare tactical strengths and weaknesses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 space-y-2">
            <Label htmlFor="home-team-analysis">Home Team ID</Label>
            <Input 
              id="home-team-analysis" 
              placeholder="Enter Home Team ID..." 
              value={homeTeamId}
              onChange={(e) => setHomeTeamId(e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="away-team-analysis">Away Team ID</Label>
            <Input 
              id="away-team-analysis" 
              placeholder="Enter Away Team ID..." 
              value={awayTeamId}
              onChange={(e) => setAwayTeamId(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleCompare} disabled={loading || !homeTeamId || !awayTeamId}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Compare Teams
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-md">
            {error}
          </div>
        )}

        {data && (
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Home Team"
                  dataKey="homeScore"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Away Team"
                  dataKey="awayScore"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {!data && !loading && (
          <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            Enter two team IDs to visualize their comparative strengths
          </div>
        )}
      </CardContent>
    </Card>
  );
}
