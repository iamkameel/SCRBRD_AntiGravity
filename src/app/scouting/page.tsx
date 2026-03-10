"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Person } from "@/types/firestore";
import { fetchPlayers } from "@/lib/firestore";
import { calculatePlayerSimilarity, ScoutingReport } from "@/lib/scoutingEngine";
import { generateScoutingReportFlow } from "@/ai/flows/generate-scouting-report";
import { SkillsRadar } from "@/components/charts/SkillsRadar";
import { Search, Sparkles, User, BarChart2, TrendingUp, Trophy, AlertTriangle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ScoutingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [comparePlayer, setComparePlayer] = useState<any | null>(null);
  const [report, setReport] = useState<ScoutingReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const fetchedPlayers = await fetchPlayers(100); // Limit to 100 for now
        setPeople(fetchedPlayers);
      } catch (error) {
        console.error("Failed to fetch players", error);
      } finally {
        setLoading(false);
      }
    };
    loadPlayers();
  }, []);

  const filteredPeople = people.filter(p => 
    (p.firstName + " " + p.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectPlayer = (person: Person) => {
    if (!selectedPlayer) {
      setSelectedPlayer(person);
      setReport(null); // Reset report
    } else if (!comparePlayer && person.id !== selectedPlayer.id) {
      setComparePlayer(person);
    } else {
      // Reset if selecting a third or re-selecting
      setSelectedPlayer(person);
      setComparePlayer(null);
      setReport(null);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedPlayer) return;
    setIsGenerating(true);
    try {
      const aiReport = await generateScoutingReportFlow({
        playerName: `${selectedPlayer.firstName} ${selectedPlayer.lastName}`,
        role: selectedPlayer.playingRole || 'Unknown',
        stats: selectedPlayer.stats,
        skills: {
          batting: selectedPlayer.skills?.batting || 0,
          bowling: selectedPlayer.skills?.bowling || 0,
          fielding: selectedPlayer.skills?.fielding || 0,
          fitness: selectedPlayer.skills?.fitness || 0,
          mental: selectedPlayer.skills?.mental || 0,
          leadership: selectedPlayer.skills?.leadership || 0
        },
        physicalAttributes: selectedPlayer.physicalAttributes
      });
      
      // Merge AI result with local ID/Date
      setReport({
        personId: selectedPlayer.id,
        generatedAt: new Date().toISOString(),
        ...aiReport
      });
    } catch (error) {
      console.error("Failed to generate report:", error);
      // Fallback or error toast could go here
    } finally {
      setIsGenerating(false);
    }
  };

  const similarityScore = selectedPlayer && comparePlayer 
    ? calculatePlayerSimilarity(selectedPlayer, comparePlayer) 
    : 0;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Scouting Assistant
        </h1>
        <p className="text-muted-foreground text-lg">
          Identify talent, compare players, and generate AI-powered reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
        {/* Left Column: Player Finder */}
        <div className="flex flex-col gap-4">
          <Card className="h-[calc(100vh-200px)] flex flex-col">
            <CardHeader>
              <CardTitle>Player Finder</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search players..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full px-4 pb-4">
                <div className="flex flex-col gap-2">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading players...</div>
                  ) : filteredPeople.map(p => {
                    const isSelected = selectedPlayer?.id === p.id;
                    const isComparing = comparePlayer?.id === p.id;
                    
                    return (
                      <div 
                        key={p.id}
                        onClick={() => handleSelectPlayer(p)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border",
                          isSelected || isComparing
                            ? "bg-primary/10 border-primary" 
                            : "hover:bg-muted border-transparent"
                        )}
                      >
                        <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                          {p.profileImageUrl ? (
                            <Image src={p.profileImageUrl} alt={p.firstName} width={40} height={40} className="object-cover h-full w-full" />
                          ) : (
                            <User className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{p.firstName} {p.lastName}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5">{p.playingRole || 'Player'}</Badge>
                            {isSelected && <span className="text-primary font-medium">Selected</span>}
                            {isComparing && <span className="text-secondary-foreground font-medium">Comparing</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {!loading && filteredPeople.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No players found matching &quot;{searchTerm}&quot;
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Analysis Area */}
        <div className="flex flex-col gap-6">
          
          {/* 1. Empty State */}
          {!selectedPlayer && (
            <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground gap-4 bg-muted/20">
              <User className="h-16 w-16 opacity-20" />
              <p className="text-lg">Select a player from the list to start scouting.</p>
            </div>
          )}

          {/* 2. Single Player View */}
          {selectedPlayer && !comparePlayer && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Player Profile Card */}
              <Card className="flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 rounded-full bg-muted overflow-hidden shrink-0 border-2 border-border">
                      {selectedPlayer.profileImageUrl && (
                        <Image src={selectedPlayer.profileImageUrl} alt={selectedPlayer.firstName} width={80} height={80} className="object-cover h-full w-full" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{selectedPlayer.firstName} {selectedPlayer.lastName}</CardTitle>
                      <CardDescription className="text-base mt-1 flex items-center gap-2">
                        {selectedPlayer.playingRole} • {selectedPlayer.physicalAttributes?.battingHand} Hand
                      </CardDescription>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="secondary">Age: {selectedPlayer.dateOfBirth ? new Date().getFullYear() - new Date(selectedPlayer.dateOfBirth as string).getFullYear() : 'N/A'}</Badge>
                        <Badge variant="outline">{selectedPlayer.physicalAttributes?.height}cm</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pt-6">
                  <div className="h-[300px] w-full">
                    <SkillsRadar 
                      data={[
                        { subject: 'Batting', A: selectedPlayer.skills?.batting || 0, fullMark: 20 },
                        { subject: 'Bowling', A: selectedPlayer.skills?.bowling || 0, fullMark: 20 },
                        { subject: 'Fielding', A: selectedPlayer.skills?.fielding || 0, fullMark: 20 },
                        { subject: 'Fitness', A: selectedPlayer.skills?.fitness || 0, fullMark: 20 },
                        { subject: 'Leadership', A: selectedPlayer.skills?.leadership || 0, fullMark: 20 },
                      ]}
                      dataKeys={['A']}
                      colors={['hsl(var(--primary))']}
                    />
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={handleGenerateReport}
                      disabled={isGenerating}
                      className="w-full sm:w-auto"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" /> Generate AI Report
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Report Card */}
              <Card className="relative overflow-hidden min-h-[500px]">
                {!report ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/10">
                    <BarChart2 className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium">AI Analysis Pending</p>
                    <p className="text-sm max-w-xs mt-2">Click &quot;Generate AI Report&quot; to analyze this player&apos;s potential, strengths, and career trajectory.</p>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-primary">
                          <Sparkles className="h-5 w-5" /> Scouting Report
                        </CardTitle>
                        <Badge variant={report.potentialRating > 85 ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                          Potential: {report.potentialRating}/100
                        </Badge>
                      </div>
                      <CardDescription className="italic text-base mt-2 border-l-4 border-primary/20 pl-4 py-1">
                        &quot;{report.summary}&quot;
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 overflow-y-auto space-y-6">
                      {/* Career Projection */}
                      {report.careerProjection && (
                        <div className="bg-muted/30 p-4 rounded-lg border">
                          <h4 className="font-semibold flex items-center gap-2 mb-3">
                            <TrendingUp className="h-4 w-4 text-primary" /> Career Projection
                          </h4>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            {report.careerProjection.projectedRuns && (
                              <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Est. Runs</div>
                                <div className="text-xl font-bold">{report.careerProjection.projectedRuns.toLocaleString()}</div>
                              </div>
                            )}
                            {report.careerProjection.projectedWickets && (
                              <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Est. Wickets</div>
                                <div className="text-xl font-bold">{report.careerProjection.projectedWickets}</div>
                              </div>
                            )}
                            <div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider">Peak Age</div>
                              <div className="text-xl font-bold">{report.careerProjection.peakAge}</div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{report.careerProjection.summary}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2 mb-2 text-emerald-500">
                            <CheckCircle2 className="h-4 w-4" /> Strengths
                          </h4>
                          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                            {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold flex items-center gap-2 mb-2 text-destructive">
                            <AlertTriangle className="h-4 w-4" /> Weaknesses
                          </h4>
                          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                            {report.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                          </ul>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <User className="h-4 w-4" /> Player Comparison
                        </h4>
                        <p className="text-sm text-muted-foreground">{report.comparison}</p>
                      </div>
                    </CardContent>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* 3. Comparison View */}
          {selectedPlayer && comparePlayer && (
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Head-to-Head Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                    {/* Player 1 */}
                    <div className="flex flex-col items-center text-center flex-1">
                      <div className="h-24 w-24 rounded-full bg-muted overflow-hidden border-4 border-primary mb-3">
                        {selectedPlayer.profileImageUrl && (
                          <Image src={selectedPlayer.profileImageUrl} alt={selectedPlayer.firstName} width={96} height={96} className="object-cover h-full w-full" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold">{selectedPlayer.firstName} {selectedPlayer.lastName}</h3>
                      <Badge variant="outline" className="mt-1">{selectedPlayer.playingRole}</Badge>
                    </div>

                    {/* VS / Similarity */}
                    <div className="flex flex-col items-center justify-center px-4">
                      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-4 border-border mb-2">
                        <span className="text-2xl font-bold">{similarityScore}%</span>
                      </div>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Similarity</span>
                    </div>

                    {/* Player 2 */}
                    <div className="flex flex-col items-center text-center flex-1">
                      <div className="h-24 w-24 rounded-full bg-muted overflow-hidden border-4 border-secondary mb-3">
                        {comparePlayer.profileImageUrl && (
                          <Image src={comparePlayer.profileImageUrl} alt={comparePlayer.firstName} width={96} height={96} className="object-cover h-full w-full" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold">{comparePlayer.firstName} {comparePlayer.lastName}</h3>
                      <Badge variant="outline" className="mt-1">{comparePlayer.playingRole}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Radar Chart */}
                    <div className="h-[350px] bg-muted/10 rounded-xl p-4 border">
                      <SkillsRadar 
                        data={[
                          { subject: 'Batting', A: selectedPlayer.skills?.batting || 0, B: comparePlayer.skills?.batting || 0, fullMark: 20 },
                          { subject: 'Bowling', A: selectedPlayer.skills?.bowling || 0, B: comparePlayer.skills?.bowling || 0, fullMark: 20 },
                          { subject: 'Fielding', A: selectedPlayer.skills?.fielding || 0, B: comparePlayer.skills?.fielding || 0, fullMark: 20 },
                          { subject: 'Fitness', A: selectedPlayer.skills?.fitness || 0, B: comparePlayer.skills?.fitness || 0, fullMark: 20 },
                          { subject: 'Leadership', A: selectedPlayer.skills?.leadership || 0, B: comparePlayer.skills?.leadership || 0, fullMark: 20 },
                        ]}
                        dataKeys={['A', 'B']}
                        colors={['hsl(var(--primary))', 'hsl(var(--secondary))']}
                      />
                      <div className="flex justify-center gap-6 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-primary rounded-sm"></div>
                          <span className="text-sm font-medium">{selectedPlayer.firstName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-secondary rounded-sm"></div>
                          <span className="text-sm font-medium">{comparePlayer.firstName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Table */}
                    <div className="flex flex-col justify-center">
                      <div className="rounded-lg border overflow-hidden">
                        <div className="grid grid-cols-3 bg-muted p-3 text-sm font-medium text-center">
                          <div>{selectedPlayer.firstName}</div>
                          <div className="text-muted-foreground">Stat</div>
                          <div>{comparePlayer.firstName}</div>
                        </div>
                        
                        {[
                          { label: 'Matches', p1: selectedPlayer.stats?.matchesPlayed, p2: comparePlayer.stats?.matchesPlayed },
                          { label: 'Runs', p1: selectedPlayer.stats?.totalRuns, p2: comparePlayer.stats?.totalRuns },
                          { label: 'Batting Avg', p1: selectedPlayer.stats?.battingAverage, p2: comparePlayer.stats?.battingAverage },
                          { label: 'Strike Rate', p1: selectedPlayer.stats?.strikeRate, p2: comparePlayer.stats?.strikeRate },
                          { label: 'Wickets', p1: selectedPlayer.stats?.wicketsTaken, p2: comparePlayer.stats?.wicketsTaken },
                          { label: 'Bowling Avg', p1: selectedPlayer.stats?.bowlingAverage, p2: comparePlayer.stats?.bowlingAverage },
                        ].map((row, i) => (
                          <div key={i} className="grid grid-cols-3 p-3 text-center border-t text-sm hover:bg-muted/50 transition-colors">
                            <div className={cn("font-semibold", (row.p1 || 0) > (row.p2 || 0) ? "text-primary" : "")}>{row.p1 || '-'}</div>
                            <div className="text-muted-foreground">{row.label}</div>
                            <div className={cn("font-semibold", (row.p2 || 0) > (row.p1 || 0) ? "text-secondary-foreground" : "")}>{row.p2 || '-'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
