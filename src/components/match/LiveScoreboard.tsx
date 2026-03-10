'use client';

import { useLiveScore } from '@/hooks/useLiveScore';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Person, Team, Match } from '@/types/firestore';
import { ScoreboardHeader } from './scoreboard/ScoreboardHeader';
import { MainScorePill } from './scoreboard/MainScorePill';
import { BatsmanDisplay } from './scoreboard/BatsmanDisplay';
import { BowlerDisplay } from './scoreboard/BowlerDisplay';

interface LiveScoreboardProps {
  matchId: string;
  allPlayers: Person[];
  homeTeam: Team;
  awayTeam: Team;
  matchData?: Match;
}

export function LiveScoreboard({ matchId, allPlayers, homeTeam, awayTeam, matchData }: LiveScoreboardProps) {
  const { liveScore, loading, error, connected } = useLiveScore(matchId);

  const getPlayerDetails = (playerId?: string) => {
    if (!playerId) return null;
    return allPlayers.find(p => p.id === playerId);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading live score...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!liveScore) {
    return (
      <Alert>
        <AlertDescription>Match has not started yet</AlertDescription>
      </Alert>
    );
  }

  const currentInnings = liveScore.currentInnings;
  
  // Determine Batting and Bowling Teams
  const isHomeBatting = currentInnings.battingTeamId === homeTeam.id;
  const battingTeam = isHomeBatting ? homeTeam : awayTeam;
  const bowlingTeam = isHomeBatting ? awayTeam : homeTeam;

  const battingTeamShort = battingTeam.abbreviatedName || battingTeam.name.substring(0, 3).toUpperCase();
  const bowlingTeamShort = bowlingTeam.abbreviatedName || bowlingTeam.name.substring(0, 3).toUpperCase();

  // Get stats from live score
  const strikerStats = liveScore.batsmen?.find(b => b.playerId === liveScore.currentPlayers?.strikerId);
  const nonStrikerStats = liveScore.batsmen?.find(b => b.playerId === liveScore.currentPlayers?.nonStrikerId);
  const bowlerStats = liveScore.bowlers?.find(b => b.playerId === liveScore.currentPlayers?.bowlerId);

  // Get static details from allPlayers
  const strikerDetails = getPlayerDetails(liveScore.currentPlayers?.strikerId || undefined);
  const nonStrikerDetails = getPlayerDetails(liveScore.currentPlayers?.nonStrikerId || undefined);
  const bowlerDetails = getPlayerDetails(liveScore.currentPlayers?.bowlerId || undefined);

  // Prepare Batsman Props
  const strikerProps = strikerDetails ? {
    name: `${strikerDetails.lastName}`, // Just last name for scoreboard usually
    runs: strikerStats?.runs || 0,
    balls: strikerStats?.ballsFaced || 0,
    isStriker: true
  } : null;

  const nonStrikerProps = nonStrikerDetails ? {
    name: `${nonStrikerDetails.lastName}`,
    runs: nonStrikerStats?.runs || 0,
    balls: nonStrikerStats?.ballsFaced || 0,
    isStriker: false
  } : null;

  // Calculate Target
  const target = (liveScore.inningsNumber === 2 && liveScore.innings1) 
    ? liveScore.innings1.runs + 1 
    : undefined;

  const firstInningsScore = (liveScore.inningsNumber === 2 && liveScore.innings1)
    ? `${liveScore.innings1.runs}/${liveScore.innings1.wickets} (${liveScore.innings1.overs})`
    : undefined;

  // Format Date/Time
  const matchDate = matchData?.matchDate 
    ? (typeof matchData.matchDate === 'string' ? new Date(matchData.matchDate) : matchData.matchDate.toDate())
    : new Date();
    
  const dateStr = matchDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = matchDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const currentTimeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className={cn(
      'w-full rounded-2xl overflow-hidden animate-slide-in-up',
      'glass-morphism-premium',
      'shadow-2xl transition-all duration-500'
    )} data-testid="live-scoreboard">
      <div className="p-8 md:p-10 flex flex-col items-center relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-60" />
        
        <ScoreboardHeader 
          homeTeamName={homeTeam.name} 
          awayTeamName={awayTeam.name} 
          division={matchData?.division || '1st XI'}
        />

        <div className="mt-8 mb-10 transform md:scale-125 transition-transform duration-500" data-testid="current-score">
          <MainScorePill 
            battingTeamShortName={battingTeamShort}
            bowlingTeamShortName={bowlingTeamShort}
            runs={currentInnings.runs}
            wickets={currentInnings.wickets}
            overs={currentInnings.overs}
            target={target}
            firstInningsScore={firstInningsScore}
            isFirstInnings={liveScore.inningsNumber === 1}
          />
          {currentInnings.overs > 0 && (
            <div className="text-center mt-4 text-base font-bold text-emerald-600 dark:text-emerald-400 animate-pulse tracking-wide">
              RUN RATE: {((currentInnings.runs || 0) / currentInnings.overs).toFixed(2)}
            </div>
          )}
        </div>

        <div data-testid="batsman-display">
          <BatsmanDisplay 
            striker={strikerProps} 
            nonStriker={nonStrikerProps} 
          />
        </div>

        {bowlerDetails && bowlerStats && (
          <div className="mt-6 w-full max-w-2xl" data-testid="bowler-display">
            <BowlerDisplay 
              name={`${bowlerDetails.firstName.charAt(0)}.${bowlerDetails.lastName}`}
              wickets={bowlerStats.wickets}
              runsConceded={bowlerStats.runsConceded}
              overs={bowlerStats.overs}
              currentOver={liveScore.currentOver?.slice(-6) || []}
            />
          </div>
        )}

        {!connected && (
          <Alert variant="destructive" className="mt-4 w-full max-w-md animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connection lost. Scores will sync when reconnected.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

