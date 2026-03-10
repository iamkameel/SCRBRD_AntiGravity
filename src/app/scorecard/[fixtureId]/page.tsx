// Scorecard page - displays detailed match scorecard

"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
// import Image from 'next/image'; // Not used in this version
// import { fixtures as allFixtures, type Fixture } from '@/lib/fixtures-data'; // No longer fetching all fixtures here
// Using async fetch and importing necessary interfaces
import { fetchScorecardData, type ScorecardData, type InningsData, type BatsmanScore, type BowlerScore, type FallOfWicket, type ResultWithTeamNames, type FixtureWithTeamNames } from '@/lib/results-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, Trophy } from "lucide-react";
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from '@/lib/utils';


import { Button } from '@/components/ui/button';
import { LiveScoreCard } from '@/components/scoring/LiveScoreCard';
import { WagonWheelChart } from '@/components/scoring/WagonWheelChart';
import { WinProbabilityBar } from '@/components/scoring/WinProbabilityBar';

interface FixtureWithTeamNamesAndDetails extends FixtureWithTeamNames {
  date: string;
  location: string;
}

// Helper function to get top batsmen for a team
function getTopBatsmen(teamName: string, inningsData: InningsData[] | undefined, count: number): BatsmanScore[] {
  if (!inningsData) return [];
  const allTeamBattingScores: BatsmanScore[] = []; // Corrected variable name type
  inningsData.forEach((inning: InningsData) => {
    if (inning.battingTeam === teamName) { // This appears to be correct based on the structure used in the migration script
      allTeamBattingScores.push(...inning.battingScores.filter(bs => typeof bs.runs === 'number'));
    }
  });

  return allTeamBattingScores
    .sort((a, b) => b.runs - a.runs)
    .slice(0, count);
}

// Helper function to get top bowlers for a team
function getTopBowlers(teamName: string, inningsData: InningsData[] | undefined, count: number): BowlerScore[] {
  if (!inningsData) return [];
  const allTeamBowlingScores: BowlerScore[] = []; // Corrected variable name type
  inningsData.forEach((inning: InningsData) => {
    // Corrected to check bowlingTeam - This appears to be correct based on the structure used in the migration script
    if (inning.bowlingTeam === teamName) { 
      allTeamBowlingScores.push(...inning.bowlingScores.filter(bs => typeof bs.wickets === 'number' && typeof bs.runsConceded === 'number'));
    }
  });

  return allTeamBowlingScores
    .sort((a, b) => {
      if (b.wickets !== a.wickets) {
        return b.wickets - a.wickets;
      }
      return a.runsConceded - b.runsConceded;
    })
    .slice(0, count);
}

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface PartnershipChartDataItem {
  wicketOrdinal: string;
  batsman1Name: string;
  batsman2Name: string;
  partnershipRuns: number;
  // These are total runs for the batsmen at the point the partnership ended or innings ended
  batsman1TotalRunsAtWicket: number; 
  batsman2TotalRunsAtWicket: number;
}

function generatePartnershipUIData(innings: InningsData): PartnershipChartDataItem[] {
  const partnerships: PartnershipChartDataItem[] = [];
  if (!innings || !innings.battingScores || innings.battingScores.length === 0) {
    return partnerships;
  }
  const battingScoresMap = new Map<string, BatsmanScore>();
  innings.battingScores.forEach((bs: BatsmanScore) => battingScoresMap.set(bs.name, bs)); // Explicit type

  let currentScore = 0;
  
  let activeBatsmen: [BatsmanScore | undefined, BatsmanScore | undefined] = [
    battingScoresMap.get(innings.battingScores[0].name),
    innings.battingScores.length > 1 ? battingScoresMap.get(innings.battingScores[1].name) : undefined,
  ];
  
  const fallOfWickets = innings.fallOfWickets || [];
 
  for (let i = 0; i < fallOfWickets.length; i++) {
    const fow = fallOfWickets[i];
    const partnershipRuns = fow.score - currentScore;
    currentScore = fow.score;

    const dismissedBatsmanObj = battingScoresMap.get(fow.batsmanOut);
    let partnerBatsmanObj: BatsmanScore | undefined;

    if (activeBatsmen[0]?.name === fow.batsmanOut) {
      partnerBatsmanObj = activeBatsmen[1];
    } else if (activeBatsmen[1]?.name === fow.batsmanOut) {
      partnerBatsmanObj = activeBatsmen[0];
    } else {
       const otherBatsmenAtCrease = innings.battingScores.filter(bs => 
         bs.name !== fow.batsmanOut && 
         (activeBatsmen[0]?.name === bs.name || activeBatsmen[1]?.name === bs.name)
       );
       if(otherBatsmenAtCrease.length > 0) partnerBatsmanObj = otherBatsmenAtCrease[0];
    }

    partnerships.push({
      wicketOrdinal: `${getOrdinal(fow.wicket)} Wicket`,
      batsman1Name: dismissedBatsmanObj?.name || fow.batsmanOut,
      batsman2Name: partnerBatsmanObj?.name || "Partner",
      partnershipRuns: partnershipRuns < 0 ? 0 : partnershipRuns, 
      batsman1TotalRunsAtWicket: dismissedBatsmanObj?.runs || 0,
      batsman2TotalRunsAtWicket: partnerBatsmanObj?.runs || 0,
    });
    
    let newBatsmanToCrease: BatsmanScore | undefined;
    const newBatsmanOrderIndex = fow.wicket + 1; 
    if (newBatsmanOrderIndex < innings.battingScores.length) {
        const newBatsmanData = innings.battingScores[newBatsmanOrderIndex];
        if (newBatsmanData) {
            newBatsmanToCrease = battingScoresMap.get(newBatsmanData.name);
        }
    }
    
    if (activeBatsmen[0]?.name === fow.batsmanOut) {
      activeBatsmen = [partnerBatsmanObj, newBatsmanToCrease];
    } else if (activeBatsmen[1]?.name === fow.batsmanOut) {
      activeBatsmen = [activeBatsmen[0], newBatsmanToCrease];
    } else {
      activeBatsmen = [partnerBatsmanObj || undefined, newBatsmanToCrease];
    }
  }

  const totalRuns = parseInt(innings.totalScoreString.split('/')[0]);
  const wicketsFallen = fallOfWickets.length;

  if (wicketsFallen < 10 && totalRuns > currentScore) {
    const partnershipRuns = totalRuns - currentScore;
    let b1Name = activeBatsmen[0]?.name || "N/A";
    let b2Name = activeBatsmen[1]?.name || (activeBatsmen[0] ? "Partner" : "N/A");
 
    const notOutBatsmen = innings.battingScores.filter(bs => bs.dismissal.toLowerCase().includes('not out'));
    if (notOutBatsmen.length === 1) {
        b1Name = notOutBatsmen[0].name;
        if (activeBatsmen[0]?.name === notOutBatsmen[0].name && activeBatsmen[1]) {
            b2Name = activeBatsmen[1].name;
        } else if (activeBatsmen[1]?.name === notOutBatsmen[0].name && activeBatsmen[0]) {
            b2Name = activeBatsmen[0].name;
        } else {
           // Fallback if the partner is not one of the active batsmen, try to find the other not out batsman if exists
           const otherNotOut = notOutBatsmen.find(b => b.name !== b1Name);
           if(otherNotOut) b2Name = otherNotOut.name;
           else b2Name = "Partner";
        }
    } else if (notOutBatsmen.length >= 2) {
        b1Name = notOutBatsmen[0].name;
        b2Name = notOutBatsmen[1].name;
    }
    
    if (b1Name !== "N/A" && b1Name === b2Name && b2Name !== "Partner") {
        b2Name = "Partner";
    }
 
    if ((b1Name !== "N/A" || (b2Name !== "N/A" && b2Name !== "Partner")) && partnershipRuns >= 0) {
        partnerships.push({
          batsman1Name: b1Name,
          batsman2Name: b2Name,
          partnershipRuns,
          wicketOrdinal: `${getOrdinal(wicketsFallen + 1)} Wicket (Not Out)`, 
          batsman1TotalRunsAtWicket: battingScoresMap.get(b1Name)?.runs || 0,
          batsman2TotalRunsAtWicket: battingScoresMap.get(b2Name)?.runs || 0,
        });
    }
  }
  return partnerships.filter(p => p.partnershipRuns >= 0 && ((p.batsman1Name !== 'N/A' && p.batsman1Name !== 'Partner') || (p.batsman2Name !== 'N/A' && p.batsman2Name !== 'Partner')));
}

const PartnershipTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const partnershipData = payload[0].payload as PartnershipChartDataItem; // Explicit type
    let partnerDisplay = "";
    if (partnershipData.batsman1Name && partnershipData.batsman1Name !== "N/A" && partnershipData.batsman1Name !== "Partner") {
        partnerDisplay += partnershipData.batsman1Name;
    }
    if (partnershipData.batsman2Name && partnershipData.batsman2Name !== "N/A" && partnershipData.batsman2Name !== "Partner") {
        if (partnerDisplay && partnershipData.batsman1Name !== partnershipData.batsman2Name) partnerDisplay += " & ";
        else if (!partnerDisplay) partnerDisplay += partnershipData.batsman2Name;
        
        if(partnershipData.batsman1Name !== partnershipData.batsman2Name){
             partnerDisplay += partnershipData.batsman2Name;
        } else if (!partnerDisplay) { // Only one distinct name, was set as batsman1Name
            partnerDisplay = partnershipData.batsman1Name; // Display at least one name if only one is valid
        }

    }
    if (!partnerDisplay) partnerDisplay = "Partnership";


    return (
      <div className="bg-card text-card-foreground p-3 rounded-md shadow-md border">
        <p className="font-semibold mb-1">{label}</p>
        <p>{partnerDisplay}</p>
        <p>Partnership Total: {partnershipData.partnershipRuns} runs</p>
      </div>
    );
  }
}


export default function ScorecardPage() {
  const params = useParams();
  const router = useRouter();
  const fixtureId = params.fixtureId ? (params.fixtureId as string) : null; // Keep fixtureId as string for fetching

  const [scorecardData, setScorecardData] = React.useState<{ fixture: FixtureWithTeamNamesAndDetails | null, result: ResultWithTeamNames | null, innings: InningsData[] } | null>(null); // Updated type
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadScorecard = async () => {
      if (!fixtureId) {
        setError("Invalid fixture ID.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch scorecard data using the fixtureId.
        // Assuming fetchScorecardData is updated to return FixtureWithTeamNamesAndDetails
        // or a structure that can be safely cast or mapped to it.
        // If fetchScorecardData cannot be modified, you might need to fetch
        // fixture details separately and merge them.
        const data = await fetchScorecardData(fixtureId); 

        if (data && data.fixture) {
           // data.fixture.location = data.fixture.location || 'Location N/A'; // Placeholder 
           // To fix the type error on setScorecardData, ensure the fixture data from fetchScorecardData
           // includes 'date' and 'location' properties or provide them here if they are not
           // fetched directly. Assuming fetchScorecardData was updated to include these or
           // the FixtureWithTeamNames type definition was expanded. If not, you might need
           // to fetch fixture details separately to get date and location.
        }
        if (data) {
          // If fetchScorecardData returns FixtureWithTeamNames, and you need
          // FixtureWithTeamNamesAndDetails for the state, you must ensure
          // date and location are present. Assuming fetchScorecardData was
          // updated to return the more detailed type, or you are fetching
          // date and location elsewhere and merging here.
          // If data.fixture is of type FixtureWithTeamNames, you'll need to
          // create a new object that conforms to FixtureWithTeamNamesAndDetails.
          // For example:
          // const scorecardDataWithDetails = { ...data, fixture: { ...data.fixture, date: '...', location: '...' } };
          setScorecardData(data as { fixture: FixtureWithTeamNamesAndDetails | null, result: ResultWithTeamNames | null, innings: InningsData[] } | null); // Explicit cast if confident in data structure
        } else {
          setError("Scorecard data not found for this fixture.");
        }
      } catch (err) {
        console.error("Error fetching scorecard data:", err);
        setError("Failed to load scorecard.");
      } finally {
        setLoading(false);
      }
    };

    loadScorecard();
  }, [fixtureId]); // Re-run effect if fixtureId changes or router

  const result = scorecardData?.result; // Access result from the new structure
  const fixture = scorecardData?.fixture; // Access fixture from the new structure

  const defaultTabValue = result?.innings && result.innings.length > 0 ? `innings-${result.innings[0].inningsNumber}` : "";

  // Memoized calculations for top performers using the fetched data
  const topTeamABatsmen = React.useMemo(() => result?.teamAName && result?.innings ? getTopBatsmen(result.teamAName, result.innings, 2) : [], [result]);
  const topTeamABowlers = React.useMemo(() => result?.teamAName && result?.innings ? getTopBowlers(result.teamAName, result.innings, 2) : [], [result]);
  const topTeamBBatsmen = React.useMemo(() => result?.teamBName && result?.innings ? getTopBatsmen(result.teamBName, result.innings, 2) : [], [result]);
  const topTeamBBowlers = React.useMemo(() => result?.teamBName && result?.innings ? getTopBowlers(result.teamBName, result.innings, 2) : [], [result]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Scorecard Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Loading scorecard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !fixture || !result) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Error Loading Scorecard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">
              {error || "Scorecard data not found for this fixture. It might be an upcoming match or data is not yet available."}
            </p>
            <button onClick={() => router.back()} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground px-4 py-2">
 <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back</button>
          </CardContent>
        </Card>
      </div>
  );
}

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Match Scorecard: {fixture.teamAName || fixture.teamAId} vs {fixture.teamBName || fixture.teamBId}
          </CardTitle>
          <CardDescription> {/* Assuming fixture object has date and location properties */}
            Played on {format(new Date(fixture.date), 'EEEE, MMMM d, yyyy')} at {fixture.location}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8" id="scorecard-content">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="text-center md:text-left flex-1">
                <p className="font-semibold text-lg">{result.teamAName || result.teamAId}</p>
 <p className="text-3xl font-bold text-primary">{result.teamAScore}</p> {/* Removed redundant closing div tag */}
</div>
              <p className="text-xl font-medium text-muted-foreground">vs</p>
              <div className="text-center md:text-right flex-1">
                <p className="font-semibold text-lg">{result.teamBId}</p>
 <p className="text-3xl font-bold text-primary">{result.teamBScore}</p> {/* Corrected font size for consistency */}
              </div>
            </div>

            <div className="text-center p-3 bg-card rounded-md shadow border">
                <p className="text-lg font-semibold text-[hsl(var(--accent))] flex items-center justify-center">
                  <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                  {result.winner} won by {result.margin}
                </p>
            </div>

            <Separator className="my-6" />

            <CardContent className="p-0 flex justify-center"> {/* Added flex and justify-center */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 w-full max-w-4xl"> {/* Adjusted spacing and added max-width */}
                <div className="space-y-4" id={`top-performers-${result.teamAId}`}> {/* Use teamAId */}
                  <h3 className="text-lg font-semibold text-foreground">{result.teamAId} - Top Performers</h3>
                  {(topTeamABatsmen.length > 0 || topTeamABowlers.length > 0) ? (
                    <div className="space-y-3">
                      {topTeamABatsmen.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Top Batsmen</p>
                          <ul className="space-y-1">
                            {topTeamABatsmen.map((batsman: BatsmanScore, index: number) => ( // Explicit types
                              <li key={`tA-batsman-${index}`} className="text-sm flex justify-between items-center border-b last:border-b-0 py-1">
                                <span className="font-medium">{batsman.name}</span>
                                <span className="font-bold text-foreground">{batsman.runs} ({batsman.balls})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {topTeamABowlers.length > 0 && (
                        <div className="space-y-1 pt-2">
                          <p className="text-sm font-medium text-muted-foreground">Top Bowlers</p>
                          <ul className="space-y-1">
                            {topTeamABowlers.map((bowler: BowlerScore, index: number) => ( // Explicit types
                              <li key={`tA-bowler-${index}`} className="text-sm flex justify-between items-center border-b last:border-b-0 py-1">
                                <span className="font-medium">{bowler.name}</span>
                                <span className="font-bold text-foreground">{bowler.runsConceded}/{bowler.wickets} ({bowler.overs} ov)</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No top performer data available for {result.teamAId}.</p>
                  )} {/* Keep result.teamA for display as it seems to be the team name here */}
                </div>

                <div className="space-y-4" id={`top-performers-${result.teamBId}`}> {/* Use teamBId */}
                  <h3 className="text-lg font-semibold text-foreground">{result.teamBId} - Top Performers</h3>
                  {(topTeamBBatsmen.length > 0 || topTeamBBowlers.length > 0) ? ( /* Check both batsmen and bowlers */
                    <div className="space-y-3">
                      {topTeamBBatsmen.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Top Batsmen</p>
                          <ul className="space-y-1">
                            {topTeamBBatsmen.map((batsman: BatsmanScore, index: number) => ( // Explicit types
                              <li key={`tB-batsman-${index}`} className="text-sm flex justify-between items-center border-b last:border-b-0 py-1">
                                <span className="font-medium">{batsman.name}</span>
                                <span className="font-bold text-foreground">{batsman.runs} ({batsman.balls})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {topTeamBBowlers.length > 0 && (
                        <div className="space-y-1 pt-2">
                          <p className="text-sm font-medium text-muted-foreground">Top Bowlers</p>
                          <ul className="space-y-1">
                            {topTeamBBowlers.map((bowler: BowlerScore, index: number) => ( // Explicit types
                              <li key={`tB-bowler-${index}`} className="text-sm flex justify-between items-center border-b last:border-b-0 py-1">
                                <span className="font-medium">{bowler.name}</span>
                                <span className="font-bold text-foreground">{bowler.runsConceded}/{bowler.wickets} ({bowler.overs} ov)</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No top performer data available for {result.teamBId}.</p>
                  )} {/* Use result.teamBId for display as it seems to be the team name here */}
                </div>
              </div>
            </CardContent>

            <Card className="bg-muted/30 mt-6">
              <CardHeader className="pb-2">
              <CardTitle className="text-xl">Player of the Match</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center text-md bg-muted/0 p-6 pt-2">
                  <Star className="mr-3 h-6 w-6 text-yellow-500" />
                  <p><strong className="font-semibold">{result?.playerOfTheMatch}</strong></p>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-xl">Innings Details</CardTitle>
                <CardDescription>
                  Full batting, bowling, and partnership details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {result.innings && result.innings.length > 0 ? (
                  <Tabs defaultValue={defaultTabValue} className="w-full">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-none md:flex md:flex-wrap justify-start">
                      <TabsTrigger value="live">Live Match Center</TabsTrigger>
                      {result.innings.map((inningData) => (
                        <TabsTrigger key={`trigger-innings-${inningData.inningsNumber}`} value={`innings-${inningData.inningsNumber}`}>
                          Innings {inningData.inningsNumber}: {inningData.battingTeam}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <TabsContent value="live" className="mt-4 space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                          {/* Live Score Card */}
                          <LiveScoreCard
                            teamName={result.innings[result.innings.length - 1]?.battingTeam || "Team"}
                            runs={parseInt(result.innings[result.innings.length - 1]?.totalScoreString.split('/')[0] || "0")}
                            wickets={parseInt(result.innings[result.innings.length - 1]?.totalScoreString.split('/')[1] || "0")}
                            overs={parseFloat(result.innings[result.innings.length - 1]?.oversPlayed || "0")}
                            batsmen={result.innings[result.innings.length - 1]?.battingScores.filter(b => b.dismissal === "not out").map(b => ({
                              id: b.name,
                              name: b.name,
                              runs: b.runs,
                              balls: b.balls,
                              fours: b.fours,
                              sixes: b.sixes,
                              isStriker: true // Placeholder logic
                            })) || []}
                            currentBowler={result.innings[result.innings.length - 1]?.bowlingScores[0] ? {
                                id: result.innings[result.innings.length - 1].bowlingScores[0].name,
                                name: result.innings[result.innings.length - 1].bowlingScores[0].name,
                                overs: result.innings[result.innings.length - 1].bowlingScores[0].overs,
                                maidens: result.innings[result.innings.length - 1].bowlingScores[0].maidens,
                                runs: result.innings[result.innings.length - 1].bowlingScores[0].runsConceded,
                                wickets: result.innings[result.innings.length - 1].bowlingScores[0].wickets
                            } : undefined}
                            runRate={0} // Calculate if possible
                            isLive={true}
                          />
                          
                          {/* Win Probability */}
                          <WinProbabilityBar
                            homeTeamName={fixture.teamAName || "Home"}
                            awayTeamName={fixture.teamBName || "Away"}
                            homeProbability={60} // Placeholder
                          />
                        </div>

                        <div className="space-y-6">
                           {/* Wagon Wheel */}
                           <WagonWheelChart
                              shots={[
                                { id: '1', runs: 4, x: 45, y: 45 },
                                { id: '2', runs: 1, x: -20, y: 30 },
                                { id: '3', runs: 6, x: 0, y: -80 },
                              ]} // Placeholder data
                              interactive={false}
                           />
                        </div>
                      </div>
                    </TabsContent>

                    {result.innings.map((inningData, index) => {
                      const partnershipVisualData = generatePartnershipUIData(inningData);
                      const chartConfig = {
                        partnershipRuns: { label: "Partnership Runs", color: "hsl(var(--chart-1))" },
                      };
                      return (
                        <TabsContent key={`content-innings-${inningData.inningsNumber}`} value={`innings-${inningData.inningsNumber}`} className="mt-4">
                          <Accordion type="multiple" defaultValue={['batting', 'bowling', 'extras']} className="w-full space-y-4">
                            <AccordionItem value="batting">
                              <AccordionTrigger className="text-lg font-medium p-4 bg-muted/50 rounded-t-md hover:no-underline">
                                Batting - {inningData.battingTeam}
                              </AccordionTrigger>
                              <AccordionContent className="border border-t-0 rounded-b-md p-0">
                                <div className="p-4">
 <TableCaption>Batting scorecard for {inningData.battingTeam}</TableCaption>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[200px]">Batsman</TableHead>
                                        <TableHead>Dismissal</TableHead>
                                        <TableHead className="text-right">R</TableHead>
                                        <TableHead className="text-right">B</TableHead>
                                        <TableHead className="text-right">4s</TableHead>
                                        <TableHead className="text-right">6s</TableHead>
                                        <TableHead className="text-right">SR</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
 {inningData.battingScores.map((batter: BatsmanScore) => ( // Explicit type
                                        <TableRow key={batter.name}>
                                          <TableCell className="font-medium">{batter.name} {batter.dismissal.toLowerCase().includes('not out') && "(not out)"}</TableCell>
                                          <TableCell>{batter.dismissal}</TableCell>
                                          <TableCell className="text-right">{batter.runs}</TableCell>
                                          <TableCell className="text-right">{batter.balls}</TableCell>
                                          <TableCell className="text-right">{batter.fours}</TableCell>
                                          <TableCell className="text-right">{batter.sixes}</TableCell>
                                          <TableCell className="text-right">{batter.strikeRate}</TableCell>
                                        </TableRow>
                                      ))}                                      
                                      <TableRow>
                                        <TableCell className="font-medium">Extras</TableCell>
                                        <TableCell className="text-muted-foreground">{inningData.extras.details}</TableCell>
                                        <TableCell className="text-right font-bold">{inningData.extras.total}</TableCell>
                                        <TableCell className="text-right"></TableCell>
                                        <TableCell className="text-right"></TableCell>
                                        <TableCell className="text-right"></TableCell>
                                        <TableCell className="text-right"></TableCell>
                                      </TableRow>
                                      <TableRow className="bg-muted/50">
                                        <TableCell colSpan={2} className="font-bold text-lg">Total</TableCell>
                                        <TableCell className="text-right font-bold text-lg" colSpan={5}>{inningData.totalScoreString} ({inningData.oversPlayed})</TableCell>
                                      </TableRow>                                    
                                    </TableBody>
                                  </Table>
                                </div>
                                
                                <Separator className="my-4" />
                                <div className="p-4 pt-0">
                                  <h4 className="text-md font-semibold mb-3">Batting Partnerships for {inningData.battingTeam}</h4>
                                  {partnershipVisualData.length > 0 ? (
                                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full aspect-auto">
                                      <BarChart
                                        layout="vertical"
                                        data={partnershipVisualData}
                                        margin={{ top: 5, right: 40, left: 30, bottom: 20 }} // Increased margins
                                        barCategoryGap="25%" // Adjusted gap
                                      >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} />
                                        <YAxis dataKey="wicketOrdinal" type="category" width={120} interval={0} tick={{ fontSize: 12, dy: 5 }} />
                                        <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                                        <RechartsTooltip content={<PartnershipTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                                        <Legend content={<ChartLegendContent />} verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }}/>
                                        <Bar dataKey="partnershipRuns" name="Runs" fill="var(--color-partnershipRuns)" radius={[0, 4, 4, 0]} />
                                      </BarChart>
                                    </ChartContainer>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">Partnership data not available for visualization.</p>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="bowling">
                              <AccordionTrigger className="text-lg font-medium p-4 bg-muted/50 rounded-t-md hover:no-underline">
                                 Bowling - {inningData.bowlingTeam} 
                              </AccordionTrigger>
                              <AccordionContent className="border border-t-0 rounded-b-md p-0">
                                <div className="p-4">
 <TableCaption>Bowling figures for {inningData.bowlingTeam}</TableCaption>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[200px]">Bowler</TableHead>
                                        <TableHead className="text-right">Overs</TableHead>
                                        <TableHead className="text-right">Maidens</TableHead>
                                        <TableHead className="text-right">Runs</TableHead>
                                        <TableHead className="text-right">Wickets</TableHead>
                                        <TableHead className="text-right">Economy</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
 {inningData.bowlingScores.map((bowler: BowlerScore) => ( // Explicit type
                                        <TableRow key={bowler.name}>
                                          <TableCell className="font-medium">{bowler.name}</TableCell>
                                          <TableCell className="text-right">{bowler.overs}</TableCell>
                                          <TableCell className="text-right">{bowler.maidens}</TableCell>
                                          <TableCell className="text-right">{bowler.runsConceded}</TableCell>
                                          <TableCell className="text-right">{bowler.wickets}</TableCell>
                                          <TableCell className="text-right">{bowler.economyRate}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                                <Separator className="my-4" />
                                <div className="p-4 pt-0">
 <TableCaption>Fall of wickets for {inningData.battingTeam}</TableCaption>
                                  <h4 className="text-md font-semibold mb-3">Fall of Wickets for {inningData.battingTeam}</h4>
                                  {inningData.fallOfWickets && inningData.fallOfWickets.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
 {inningData.fallOfWickets.map((fow: FallOfWicket, idx: number) => (
                                        <Card key={`fow-${idx}`} className="bg-card text-card-foreground shadow-sm text-sm p-3">
                                          <p className="font-semibold">{getOrdinal(fow.wicket)} Wkt</p>
                                          <p className="text-lg font-bold text-primary">{fow.score}</p>
                                          <p className="text-xs text-muted-foreground truncate" title={fow.batsmanOut}>{fow.batsmanOut}</p>
                                          <p className="text-xs text-muted-foreground">Over: {fow.over}</p>
                                        </Card>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="p-4 text-sm text-muted-foreground">Fall of wickets data not available for this innings.</p>
                                  )}
                                </div>
                               </AccordionContent>
                            </AccordionItem>
                            
                             <AccordionItem value="extras">
                                <AccordionTrigger className="text-lg font-medium p-4 bg-muted/50 rounded-t-md hover:no-underline">
                                  Extras Summary
                                </AccordionTrigger>
                                <AccordionContent className="border border-t-0 rounded-b-md p-0">
                                <div className="p-4">
                                  <Card className="bg-background shadow-none border-0">
                                    <CardContent className="p-0">
                                      <p className="text-lg font-semibold">Total Extras: {inningData.extras.total}</p>
                                      {inningData.extras.details && <p className="text-muted-foreground text-sm mt-1">Details: {inningData.extras.details}</p>}
                                    </CardContent>
                                  </Card>
                                </div>
                                </AccordionContent>
                              </AccordionItem>

                          </Accordion>
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                ) : (
                  <p className="text-muted-foreground">
                    Detailed innings-by-innings scorecards are not yet available for this match.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

