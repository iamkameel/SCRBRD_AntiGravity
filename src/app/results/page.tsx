// Results page - displays completed match results

"use client"; // Added this line as it uses hooks and should be a client component

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star } from "lucide-react";
// Assuming fetchResultsWithTeamNames is now an async function in results-data.ts
import { fetchResultsWithTeamNames, type ResultWithTeamNames } from "@/lib/results-data"; // Updated import
import { useEffect, useState } from 'react';
// Removed: import { Result } from "@/lib/results-data"; // Use ResultWithTeamNames now
import { Button } from '@/components/ui/button'; 
import Link from 'next/link'; 

export default function ResultsPage() {
  const [results, setResults] = useState<ResultWithTeamNames[]>([]); // Use ResultWithTeamNames
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        const data = await fetchResultsWithTeamNames();
        setResults(data);
      } catch (err: any) { // Added type for err
        console.error("Error fetching results:", err);
        setError(err.message || "Failed to load results.");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []); 

  if (loading) {
    return <div className="text-center p-8"><p className="text-muted-foreground">Loading results...</p></div>;
  }
  if (error) {
    return <div className="text-center p-8 text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold tracking-tight">Match Results</CardTitle>
          <CardDescription className="text-lg">
            Scores, key statistics, and player performances from past matches.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="space-y-6">
            {results.length > 0 ? (
              results.map((result: ResultWithTeamNames, index) => (
                <Card 
                  key={result.id} 
                  className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3 flex-grow">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold text-foreground">
                        {result.teamAName || result.teamAId} <span className="text-muted-foreground text-sm font-normal mx-2">vs</span> {result.teamBName || result.teamBId}
                      </CardTitle>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        Completed
                      </span>
                    </div>
                    <CardDescription className="mt-1">
                      <span className="font-semibold text-primary">{result.winner}</span> won by {result.margin}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-8 items-center text-center mb-6 p-4 bg-muted/30 rounded-lg">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{result.teamAName || result.teamAId}</p>
                        <p className="text-3xl font-bold text-foreground">{result.teamAScore}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{result.teamBName || result.teamBId}</p>
                        <p className="text-3xl font-bold text-foreground">{result.teamBScore}</p>
                      </div>
                    </div>
                    
                    {result.playerOfTheMatch && (
                        <div className="flex items-center justify-center text-sm bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-md mb-4 mx-auto max-w-md">
                          <Star className="mr-2 h-4 w-4 text-yellow-600 fill-yellow-500" />
                          <span className="text-yellow-700 dark:text-yellow-500 font-medium">Player of the Match:</span> 
                          <span className="ml-1 font-bold text-foreground">{result.playerOfTheMatch}</span>
                        </div>
                    )}
                    
                    <div className="text-center mt-4">
                      <Link href={`/scorecard/${result.fixtureId}`} passHref>
                        <Button variant="outline" className="w-full sm:w-auto hover:bg-primary hover:text-primary-foreground transition-colors">
                          View Full Scorecard
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed">
                <p className="text-muted-foreground italic">No match results available at the moment.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
