"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateKnockoutFixturesAction, seedTeamsFromStandingsAction } from "@/app/actions/tournamentActions";
import { Loader2, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

interface BracketGeneratorProps {
  leagueId: string;
}

export function BracketGenerator({ leagueId }: BracketGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Seed teams from standings
      const seedResult = await seedTeamsFromStandingsAction(leagueId);
      
      if (!seedResult.success || !seedResult.teamIds) {
        alert(seedResult.error || 'Failed to seed teams');
        return;
      }

      // Generate bracket
      const bracketResult = await generateKnockoutFixturesAction(leagueId, seedResult.teamIds);
      
      if (!bracketResult.success) {
        alert(bracketResult.error || 'Failed to generate bracket');
        return;
      }

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error('Error generating bracket:', error);
      alert('Failed to generate bracket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button 
        onClick={handleGenerate}
        disabled={loading}
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Trophy className="h-4 w-4" />
            Generate Knockout Bracket
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground mt-2">
        This will create a knockout tournament from the top 8 teams in the standings
      </p>
    </div>
  );
}
