"use client";

import { useState, useEffect } from "react";
import { Match, Person } from "@/types/firestore";
import { MATCH_STATES } from "@/lib/matchStates";
import { TeamSelection } from "@/components/matches/TeamSelection";
import { TossSimulator } from "@/components/matches/TossSimulator";
import { ScorerChecklist } from "@/components/matches/ScorerChecklist";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle2, Lock, AlertTriangle, Shield, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { 
  getMatchDetailsAction, 
  getTeamSquadAction, 
  getDivisionAction,
  saveTeamSelectionAction, 
  saveTossResultAction,
  saveScorerChecklistAction,
  saveBattingOrderAction,
  initializeLiveMatchAction,
  updateMatchAction
} from "@/app/actions/matchActions";
import { Division } from "@/types/firestore";
import { checkPlayerEligibility } from "@/lib/utils/EligibilityValidator";
import { calculateAge } from "@/lib/utils/dateUtils";
import { getTeamAction } from "@/app/actions/teamActions";

import { BattingOrderEditor } from "@/components/matches/BattingOrderEditor";
import { getMockSquad } from "@/lib/mockMatchData";

export default function PreMatchPage() {
  const router = useRouter();
  const routeParams = useParams();
  const matchId = (routeParams?.id as string) || '';
  const [activeTab, setActiveTab] = useState("teams");
  const [loading, setLoading] = useState(true);
  
  // Match Data
  const [match, setMatch] = useState<Match | null>(null);
  const [division, setDivision] = useState<Division | null>(null);
  const [homeSquad, setHomeSquad] = useState<Person[]>([]);
  const [awaySquad, setAwaySquad] = useState<Person[]>([]);
  const [homeTeamName, setHomeTeamName] = useState<string>("Home Team");
  const [awayTeamName, setAwayTeamName] = useState<string>("Away Team");

  // Workflow State
  const [homeTeamConfirmed, setHomeTeamConfirmed] = useState(false);
  const [awayTeamConfirmed, setAwayTeamConfirmed] = useState(false);
  const [battingOrderConfirmed, setBattingOrderConfirmed] = useState(false);
  const [tossResult, setTossResult] = useState<{winner: 'home'|'away', decision: 'bat'|'field'} | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Match Details
        const matchData = await getMatchDetailsAction(matchId);
        if (!matchData) {
          toast.error("Match not found");
          return;
        }
        setMatch(matchData);

        // Initialize state from match data
        if (matchData.teamSelection?.home?.confirmedAt) setHomeTeamConfirmed(true);
        if (matchData.teamSelection?.away?.confirmedAt) setAwayTeamConfirmed(true);
        if (matchData.preMatch?.battingOrder) setBattingOrderConfirmed(true); // Simplified check
        if (matchData.preMatch?.toss) {
          setTossResult({
            winner: matchData.preMatch.toss.winner,
            decision: matchData.preMatch.toss.decision
          });
        }

        // 2. Fetch Division, Squads and Team names
        const [home, away, divData, homeTeamData, awayTeamData] = await Promise.all([
          getTeamSquadAction(matchData.homeTeamId),
          getTeamSquadAction(matchData.awayTeamId),
          matchData.divisionId ? getDivisionAction(matchData.divisionId) : Promise.resolve(null),
          getTeamAction(matchData.homeTeamId),
          getTeamAction(matchData.awayTeamId)
        ]);
        
        const hSquad = (home && home.length > 0) ? home : getMockSquad(homeTeamData?.name || matchData.homeTeamId || 'Westville 1st XI');
        const aSquad = (away && away.length > 0) ? away : getMockSquad(awayTeamData?.name || matchData.awayTeamId || 'Kearsney 1st XI');

        setHomeSquad(hSquad);
        setAwaySquad(aSquad);
        setDivision(divData);
        if (homeTeamData?.name) setHomeTeamName(homeTeamData.name);
        if (awayTeamData?.name) setAwayTeamName(awayTeamData.name);
        
      } catch (error) {
        console.error("Error fetching pre-match data:", error);
        toast.error("Failed to load match data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matchId]);

  if (loading || !match) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Mock User Context - In real app, get this from AuthContext
  const currentUser = {
    role: 'system_architect', // Change this to test different perspectives
    teamId: match.homeTeamId // Matches match.homeTeamId
  };

  // Privacy & Release Logic
  const getMatchTime = (date: any) => {
    if (!date) return 0;
    if (typeof date === 'string') return new Date(date).getTime();
    if (date.toDate) return date.toDate().getTime(); // Firestore Timestamp
    if (date instanceof Date) return date.getTime();
    return 0;
  };

  const matchTime = getMatchTime(match.matchDate || match.dateTime);
  const now = new Date().getTime();
  const hoursUntilMatch = (matchTime - now) / (1000 * 60 * 60);
  const isWithin24Hours = hoursUntilMatch <= 24;
  const bothTeamsConfirmed = homeTeamConfirmed && awayTeamConfirmed;
  const isSelectionReleased = isWithin24Hours || bothTeamsConfirmed;

  // Permission Logic
  const isSuperUser = ['system_architect', 'admin'].includes(currentUser.role);
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'scorer';
  const isHomeTeam = currentUser.role === 'home_coach' || currentUser.teamId === match.homeTeamId;
  const isAwayTeam = currentUser.role === 'away_coach' || currentUser.teamId === match.awayTeamId;

  const canViewHomeTeam = isSuperUser || isAdmin || isHomeTeam || isSelectionReleased;
  const canViewAwayTeam = isSuperUser || isAdmin || isAwayTeam || isSelectionReleased;

  const canEditHomeTeam = isSuperUser || ((isAdmin || isHomeTeam) && !homeTeamConfirmed);
  const canEditAwayTeam = isSuperUser || ((isAdmin || isAwayTeam) && !awayTeamConfirmed);

  const handleTeamSave = async (team: 'home' | 'away', selection: any) => {
    try {
      const result = await saveTeamSelectionAction(match.id, team, selection);
      if (result.success) {
        if (team === 'home') setHomeTeamConfirmed(true);
        else setAwayTeamConfirmed(true);
        toast.success(`${team === 'home' ? 'Home' : 'Away'} team selection confirmed`);
      } else {
        toast.error("Failed to save team selection");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    }
  };

  const handleBattingOrderComplete = async () => {
    // In a real implementation, we'd get the order from the component
    // For this MVP, we'll assume the default order (1-11) based on selection
    const homeOrder = match.teamSelection?.home?.playingXI || [];
    const awayOrder = match.teamSelection?.away?.playingXI || [];
    
    try {
      const result = await saveBattingOrderAction(match.id, { home: homeOrder, away: awayOrder });
      if (result.success) {
        setBattingOrderConfirmed(true);
        toast.success("Batting orders confirmed");
        setActiveTab("toss");
      } else {
        toast.error("Failed to save batting order");
      }
    } catch (error) {
      toast.error("An error occurred saving batting order");
    }
  };

  const handleTossComplete = async (result: any) => {
    try {
      const saveResult = await saveTossResultAction(match.id, result);
      if (saveResult.success) {
        setTossResult(result);
        toast.success("Toss result recorded");
      } else {
        toast.error("Failed to save toss result");
      }
    } catch (error) {
      toast.error("An error occurred saving toss");
    }
  };

  const handleChecklistComplete = async (checklistData: any) => {
    try {
      await saveScorerChecklistAction(match.id, checklistData);
      
      // Initialize Live Match
      const homeXI = match.teamSelection?.home?.playingXI && match.teamSelection.home.playingXI.length > 0
        ? match.teamSelection.home.playingXI
        : homeSquad.slice(0, 11).map(p => p.id);
      const awayXI = match.teamSelection?.away?.playingXI && match.teamSelection.away.playingXI.length > 0
        ? match.teamSelection.away.playingXI
        : awaySquad.slice(0, 11).map(p => p.id);

      const battingOrderAny = match.preMatch?.battingOrder as any;
      const homeOrder = (battingOrderAny?.home && battingOrderAny.home.length > 0)
        ? battingOrderAny.home 
        : homeXI;
      const awayOrder = (battingOrderAny?.away && battingOrderAny.away.length > 0)
        ? battingOrderAny.away 
        : awayXI;
      
      if (!tossResult) {
        toast.error("Toss result missing");
        return;
      }

      const initResult = await initializeLiveMatchAction(
        match.id, 
        tossResult, 
        { home: homeOrder, away: awayOrder }
      );

      if (initResult.success) {
        toast.success("Match Started! Redirecting to live scoring...");
        setTimeout(() => {
          router.push(`/matches/${matchId}/score`);
        }, 1500);
      } else {
        toast.error(initResult.error || "Failed to initialize live match");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete pre-match checks");
    }
  };

  const PrivacyPlaceholder = ({ teamName }: { teamName: string }) => (
    <Card className="p-8 text-center border-dashed">
      <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{teamName} Selection Hidden</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Opponent team selection is hidden until both teams have confirmed their squads, 
        or 24 hours before the match starts.
      </p>
      {hoursUntilMatch > 0 && (
        <Badge variant="outline" className="mt-4">
          Releases in {Math.floor(hoursUntilMatch)} hours
        </Badge>
      )}
    </Card>
  );

  // Helper to map Person to TeamSelection player format
  const mapSquadToPlayers = (squad: Person[]) => squad.map(p => {
    const age = calculateAge(p.dateOfBirth);
    const eligibility = division ? checkPlayerEligibility(age, division) : { isEligible: true };
    
    return {
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      role: p.playingRole || 'Player',
      profileImageUrl: p.profileImageUrl,
      eligibility
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/matches/${matchId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Pre-Match Workflow</h1>
            <p className="text-muted-foreground text-sm">
              {homeTeamName} vs {awayTeamName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSuperUser && (
            <Badge variant="default" className="bg-purple-600 hover:bg-purple-700 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Admin Mode
            </Badge>
          )}
          {isWithin24Hours && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Within 24h - Teams Public
            </Badge>
          )}
          <Badge variant={match.state === MATCH_STATES.LIVE ? "destructive" : "outline"}>
            {match.state?.replace('_', ' ') || 'PRE MATCH'}
          </Badge>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-4 gap-4">
        <Card className={`p-4 border-l-4 ${homeTeamConfirmed && awayTeamConfirmed ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">1. Team Selection</p>
              <p className="text-xs text-muted-foreground">Select Playing XIs</p>
            </div>
            {(homeTeamConfirmed && awayTeamConfirmed) ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <span className="text-xs font-bold text-yellow-600">IN PROGRESS</span>
            )}
          </div>
        </Card>

        <Card className={`p-4 border-l-4 ${battingOrderConfirmed ? 'border-l-green-500' : 'border-l-gray-300'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">2. Batting Order</p>
              <p className="text-xs text-muted-foreground">Set lineup sequence</p>
            </div>
            {battingOrderConfirmed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </Card>
        
        <Card className={`p-4 border-l-4 ${tossResult ? 'border-l-green-500' : 'border-l-gray-300'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">3. The Toss</p>
              <p className="text-xs text-muted-foreground">Coin flip & decision</p>
            </div>
            {tossResult ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </Card>

        <Card className={`p-4 border-l-4 border-l-gray-300`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">4. Final Checks</p>
              <p className="text-xs text-muted-foreground">Scorer validation</p>
            </div>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="teams">Team Selection</TabsTrigger>
          <TabsTrigger value="order" disabled={!homeTeamConfirmed || !awayTeamConfirmed}>
            Batting Order
          </TabsTrigger>
          <TabsTrigger value="toss" disabled={!battingOrderConfirmed}>
            The Toss
          </TabsTrigger>
          <TabsTrigger value="checklist" disabled={!tossResult}>
            Scorer Checklist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-6">
          {/* Home Team Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{homeTeamName}</h3>
              {!canViewHomeTeam && <Badge variant="outline">Hidden</Badge>}
            </div>
            
            {canViewHomeTeam ? (
              <TeamSelection 
                teamName={homeTeamName}
                squad={mapSquadToPlayers(homeSquad)}
                initialSelection={match.teamSelection?.home?.playingXI}
                initialReserves={match.teamSelection?.home?.reserves}
                initialCaptain={match.teamSelection?.home?.captain}
                initialViceCaptain={match.teamSelection?.home?.viceCaptain}
                isReadOnly={!canEditHomeTeam}
                onSave={(selection) => handleTeamSave('home', selection)}
              />
            ) : (
              <PrivacyPlaceholder teamName={homeTeamName} />
            )}
          </div>

          <div className="border-t my-8" />

          {/* Away Team Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{awayTeamName}</h3>
              {!canViewAwayTeam && <Badge variant="outline">Hidden</Badge>}
            </div>

            {canViewAwayTeam ? (
              <TeamSelection 
                teamName={awayTeamName}
                squad={mapSquadToPlayers(awaySquad)}
                initialSelection={match.teamSelection?.away?.playingXI}
                initialReserves={match.teamSelection?.away?.reserves}
                initialCaptain={match.teamSelection?.away?.captain}
                initialViceCaptain={match.teamSelection?.away?.viceCaptain}
                isReadOnly={!canEditAwayTeam}
                onSave={(selection) => handleTeamSave('away', selection)}
              />
            ) : (
              <PrivacyPlaceholder teamName={awayTeamName} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="order">
          <BattingOrderEditor 
            matchId={match.id}
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
            homePlayingXI={homeSquad.filter(p => match.teamSelection?.home?.playingXI?.includes(p.id)).map(p => ({ id: p.id, name: `${p.firstName} ${p.lastName}`, role: p.playingRole || 'Player' }))}
            awayPlayingXI={awaySquad.filter(p => match.teamSelection?.away?.playingXI?.includes(p.id)).map(p => ({ id: p.id, name: `${p.firstName} ${p.lastName}`, role: p.playingRole || 'Player' }))}
            onComplete={handleBattingOrderComplete}
          />
        </TabsContent>

        <TabsContent value="toss">
          <div className="max-w-2xl mx-auto">
            <TossSimulator 
              homeTeamName={homeTeamName}
              awayTeamName={awayTeamName}
              onComplete={handleTossComplete}
              existingResult={tossResult || undefined}
              isReadOnly={!!tossResult}
            />
            {tossResult && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setActiveTab("checklist")}>
                  Proceed to Checklist
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="checklist">
          <div className="max-w-2xl mx-auto">
            <ScorerChecklist 
              onComplete={handleChecklistComplete}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
