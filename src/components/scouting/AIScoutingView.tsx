"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Person } from "@/types/firestore";
import { fetchPlayers } from "@/lib/firestore";
import { calculatePlayerSimilarity, ScoutingReport } from "@/lib/scoutingEngine";
import { generateScoutingReportFlow } from "@/ai/flows/generate-scouting-report";
import { SkillsRadar } from "@/components/charts/lazy";
import { Search, Sparkles, User, BarChart2, TrendingUp, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { D } from "@/lib/design-system";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { motion, AnimatePresence } from "framer-motion";

export default function AIScoutingView() {
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
        const fetchedPlayers = await fetchPlayers(100);
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
      setReport(null);
    } else if (!comparePlayer && person.id !== selectedPlayer.id) {
      setComparePlayer(person);
    } else {
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
      
      setReport({
        personId: selectedPlayer.id,
        generatedAt: new Date().toISOString(),
        ...aiReport
      });
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const similarityScore = selectedPlayer && comparePlayer 
    ? calculatePlayerSimilarity(selectedPlayer, comparePlayer) 
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
      {/* Left Column: Player Finder */}
      <div className="flex flex-col gap-4">
        <Card className="h-[calc(100vh-280px)] min-h-[500px] flex flex-col overflow-hidden border-border" style={{ background: D.surf1 }}>
          <CardHeader className="pb-6 border-b border-white/5">
            <CardTitle className="text-xl font-black tracking-tight uppercase" style={{ fontFamily: D.head }}>Player Finder</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              <Input
                type="search"
                placeholder="Search database..."
                className="pl-12 h-12 bg-black/20 border-white/10 rounded-xl focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full px-4 pb-4">
              <div className="flex flex-col gap-2 mt-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading players...</div>
                ) : filteredPeople.map(p => {
                  const isSelected = selectedPlayer?.id === p.id;
                  const isComparing = comparePlayer?.id === p.id;
                  
                  return (
                    <motion.div 
                      whileHover={{ scale: 1.02, x: 4 }}
                      key={p.id}
                      onClick={() => handleSelectPlayer(p)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 border mb-2",
                        isSelected || isComparing
                          ? "bg-primary/20 border-primary" 
                          : "bg-black/20 border-white/5 hover:border-white/20"
                      )}
                    >
                      <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                        {p.profileImageUrl ? (
                          <Image src={p.profileImageUrl} alt={p.firstName} width={40} height={40} className="object-cover h-full w-full" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate" style={{ color: D.textPrimary }}>{p.firstName} {p.lastName}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-2 uppercase font-black tracking-widest">
                          {p.playingRole || 'Player'}
                          {isSelected && <span className="text-primary">Selected</span>}
                          {isComparing && <span className="text-secondary-foreground">Comparing</span>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Analysis Area */}
      <div className="flex flex-col gap-6">
        <AnimatePresence mode="wait">
          {!selectedPlayer ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl text-muted-foreground gap-6 bg-white/5 backdrop-blur-sm"
            >
              <div className="p-6 rounded-full bg-primary/5 border border-primary/10">
                <User className="h-12 w-12 text-primary/40" />
              </div>
              <p className="text-xl font-bold opacity-40 uppercase tracking-tighter" style={{ fontFamily: D.head }}>Select a player to initiate intelligence</p>
            </motion.div>
          ) : comparePlayer ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-8"
            >
              <Card className="border-border overflow-hidden" style={{ background: D.surf1 }}>
                <CardHeader className="border-b border-white/5 py-8" style={{ background: `${D.sky}05` }}>
                  <CardTitle className="text-3xl font-black text-center tracking-tighter uppercase italic" style={{ fontFamily: D.head }}>
                    Head-to-Head Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-12 pb-12">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-12">
                    {/* Player 1 */}
                    <div className="flex flex-col items-center text-center flex-1 group">
                      <div className="h-32 w-32 rounded-3xl bg-black/40 overflow-hidden border-2 border-primary mb-6 shadow-2xl transition-transform duration-500 hover:scale-105">
                        {selectedPlayer.profileImageUrl ? (
                          <Image src={selectedPlayer.profileImageUrl} alt={selectedPlayer.firstName} width={128} height={128} className="object-cover h-full w-full" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center"><User className="h-12 w-12 text-primary/40" /></div>
                        )}
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight italic" style={{ fontFamily: D.head }}>{selectedPlayer.firstName} {selectedPlayer.lastName}</h3>
                      <Badge variant="outline" className="mt-2 font-bold px-4 border-white/10 bg-white/5 uppercase tracking-widest">{selectedPlayer.playingRole}</Badge>
                    </div>

                    {/* VS / Similarity */}
                    <div className="flex flex-col items-center justify-center px-4 relative">
                      <div className="h-28 w-28 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white/5 mb-4 shadow-2xl">
                        <span className="text-4xl font-black text-primary italic" style={{ fontFamily: D.mono }}>{similarityScore}%</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-black">SIMILARITY</span>
                    </div>

                    {/* Player 2 */}
                    <div className="flex flex-col items-center text-center flex-1 group">
                      <div className="h-32 w-32 rounded-3xl bg-black/40 overflow-hidden border-2 border-secondary mb-6 shadow-2xl transition-transform duration-500 hover:scale-105">
                        {comparePlayer.profileImageUrl ? (
                          <Image src={comparePlayer.profileImageUrl} alt={comparePlayer.firstName} width={128} height={128} className="object-cover h-full w-full" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center"><User className="h-12 w-12 text-secondary/40" /></div>
                        )}
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight italic" style={{ fontFamily: D.head }}>{comparePlayer.firstName} {comparePlayer.lastName}</h3>
                      <Badge variant="outline" className="mt-2 font-bold px-4 border-white/10 bg-white/5 uppercase tracking-widest">{comparePlayer.playingRole}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-black/20 rounded-3xl p-8 border border-white/5">
                      <div className="h-[400px]">
                        <SkillsRadar 
                          data={[
                            { subject: 'Batting', A: selectedPlayer.skills?.batting || 0, B: comparePlayer.skills?.batting || 0, fullMark: 20 },
                            { subject: 'Bowling', A: selectedPlayer.skills?.bowling || 0, B: comparePlayer.skills?.bowling || 0, fullMark: 20 },
                            { subject: 'Fielding', A: selectedPlayer.skills?.fielding || 0, B: comparePlayer.skills?.fielding || 0, fullMark: 20 },
                            { subject: 'Fitness', A: selectedPlayer.skills?.fitness || 0, B: comparePlayer.skills?.fitness || 0, fullMark: 20 },
                            { subject: 'Leadership', A: selectedPlayer.skills?.leadership || 0, B: comparePlayer.skills?.leadership || 0, fullMark: 20 },
                          ]}
                          dataKeys={['A', 'B']}
                          colors={[D.sky, D.indigo]}
                        />
                      </div>
                      <div className="flex justify-center gap-12 mt-8">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded shadow-lg" style={{ background: D.sky }}></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{selectedPlayer.firstName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded shadow-lg" style={{ background: D.indigo }}></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{comparePlayer.firstName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center">
                      <div className="rounded-3xl border border-white/5 overflow-hidden bg-black/20">
                        <div className="grid grid-cols-3 bg-white/5 p-6 border-b border-white/5">
                          <div className="text-[10px] font-black uppercase tracking-widest text-primary truncate">{selectedPlayer.firstName}</div>
                          <div className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground self-center text-center">DIMENSION</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-secondary text-right truncate">{comparePlayer.firstName}</div>
                        </div>
                        
                        {[
                          { label: 'Matches', p1: selectedPlayer.stats?.matchesPlayed, p2: comparePlayer.stats?.matchesPlayed },
                          { label: 'Runs', p1: selectedPlayer.stats?.totalRuns, p2: comparePlayer.stats?.totalRuns },
                          { label: 'Batting Avg', p1: selectedPlayer.stats?.battingAverage, p2: comparePlayer.stats?.battingAverage },
                          { label: 'Strike Rate', p1: selectedPlayer.stats?.strikeRate, p2: comparePlayer.stats?.strikeRate },
                          { label: 'Wickets', p1: selectedPlayer.stats?.wicketsTaken, p2: comparePlayer.stats?.wicketsTaken },
                          { label: 'Bowling Avg', p1: selectedPlayer.stats?.bowlingAverage, p2: comparePlayer.stats?.bowlingAverage },
                        ].map((row, i) => (
                          <div key={i} className="grid grid-cols-3 p-6 text-center border-b border-white/5 last:border-0 hover:bg-white/5 transition-all">
                            <div className={cn("text-xl font-black", (row.p1 || 0) > (row.p2 || 0) ? "text-primary" : "text-white/20")} style={{ fontFamily: D.mono }}>{row.p1 || '-'}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 self-center">{row.label}</div>
                            <div className={cn("text-xl font-black text-right", (row.p2 || 0) > (row.p1 || 0) ? "text-secondary" : "text-white/20")} style={{ fontFamily: D.mono }}>{row.p2 || '-'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-8"
            >
              {/* Player Profile Card */}
              <Card className="flex flex-col overflow-hidden border-border" style={{ background: D.surf1 }}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-8 border-b border-white/5 bg-white/5">
                  <div className="flex gap-6">
                    <div className="h-24 w-24 rounded-2xl bg-black/40 overflow-hidden shrink-0 border border-white/10 shadow-2xl">
                      {selectedPlayer.profileImageUrl ? (
                        <Image src={selectedPlayer.profileImageUrl} alt={selectedPlayer.firstName} width={96} height={96} className="object-cover h-full w-full" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center"><User className="h-10 w-10 text-primary/40" /></div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-3xl font-black tracking-tight uppercase italic" style={{ fontFamily: D.head }}>{selectedPlayer.firstName} {selectedPlayer.lastName}</CardTitle>
                      <CardDescription className="text-lg font-bold text-primary/60 flex items-center gap-2">
                        {selectedPlayer.playingRole} <span className="text-muted-foreground/30">•</span> {selectedPlayer.physicalAttributes?.battingHand} Hand
                      </CardDescription>
                      <div className="flex gap-3 mt-4">
                        <Badge className="bg-primary text-white rounded-lg px-4 py-1 font-bold">Age: {selectedPlayer.dateOfBirth ? new Date().getFullYear() - new Date(selectedPlayer.dateOfBirth as string).getFullYear() : 'N/A'}</Badge>
                        <Badge variant="outline" className="border-white/10 bg-white/5 text-muted-foreground rounded-lg px-4 py-1 font-bold">{selectedPlayer.physicalAttributes?.height}cm</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pt-8">
                  <div className="h-[350px] w-full p-4 bg-black/20 rounded-2xl border border-white/5">
                    <SkillsRadar 
                      data={[
                        { subject: 'Batting', A: selectedPlayer.skills?.batting || 0, fullMark: 20 },
                        { subject: 'Bowling', A: selectedPlayer.skills?.bowling || 0, fullMark: 20 },
                        { subject: 'Fielding', A: selectedPlayer.skills?.fielding || 0, fullMark: 20 },
                        { subject: 'Fitness', A: selectedPlayer.skills?.fitness || 0, fullMark: 20 },
                        { subject: 'Leadership', A: selectedPlayer.skills?.leadership || 0, fullMark: 20 },
                      ]}
                      dataKeys={['A']}
                      colors={[D.sky]}
                    />
                  </div>
                  <div className="mt-8">
                    <Button 
                      onClick={handleGenerateReport}
                      disabled={isGenerating}
                      className="w-full h-14 text-lg font-black rounded-2xl shadow-xl transition-all group"
                      style={{ background: D.sky, color: '#000' }}
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="mr-3 h-6 w-6 animate-spin" /> ANALYZING PROFILE...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" /> GENERATE AI INTELLIGENCE
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Report Card */}
              <Card className="relative overflow-hidden min-h-[500px] border-border" style={{ background: D.surf1 }}>
                {!report ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-12 text-center bg-black/40 backdrop-blur-sm">
                    <div className="p-6 rounded-full bg-white/5 border border-white/10 mb-6">
                      <BarChart2 className="h-12 w-12 text-muted-foreground/20" />
                    </div>
                    <p className="text-2xl font-black tracking-tight text-white/40 uppercase mb-3 italic" style={{ fontFamily: D.head }}>Analysis Pending</p>
                    <p className="text-xs max-w-xs font-bold opacity-40 leading-relaxed uppercase tracking-widest">Initiate AI analysis to predict potential and project career trajectory.</p>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-full flex flex-col">
                    <CardHeader className="pb-6 border-b border-white/5" style={{ background: `${D.sky}10` }}>
                      <div className="flex items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-3 text-sky-500 text-2xl font-black tracking-tight uppercase italic" style={{ fontFamily: D.head }}>
                          <Sparkles className="h-6 w-6" /> Intelligence
                        </CardTitle>
                        <Badge className="bg-emerald-500 text-white font-black text-xs px-4 py-1.5 rounded-xl uppercase tracking-tighter" style={{ fontFamily: D.mono }}>
                          POTENTIAL: {report.potentialRating}%
                        </Badge>
                      </div>
                      <div className="mt-6 p-6 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ background: D.sky }} />
                        <p className="text-lg font-bold text-white/90 italic leading-relaxed">
                          &quot;{report.summary}&quot;
                        </p>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 overflow-y-auto space-y-8 pt-8">
                      {/* Summary Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <MetricCard 
                          icon={Zap} 
                          label="Peak Age" 
                          value={report.careerProjection?.peakAge || 'N/A'} 
                          color={D.amber}
                          className="bg-black/20"
                        />
                        <MetricCard 
                          icon={TrendingUp} 
                          label="Confidence" 
                          value="88%" 
                          color={D.sky}
                          className="bg-black/20"
                        />
                      </div>

                      {/* Projection Summary */}
                      {report.careerProjection && (
                        <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                          <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-sky-500 mb-4 flex items-center gap-2">
                            <TrendingUp className="h-3 w-3" /> Career Projection
                          </h4>
                          <p className="text-sm font-bold text-muted-foreground leading-relaxed italic">{report.careerProjection.summary}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3" /> Elite Traits
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {report.strengths.map((s, i) => (
                              <Badge key={i} variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-bold px-3 py-1">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-amber-500 flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3" /> Growth Opportunities
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {report.weaknesses.map((w, i) => (
                              <Badge key={i} variant="outline" className="border-amber-500/20 bg-amber-500/5 text-amber-400 font-bold px-3 py-1">
                                {w}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
