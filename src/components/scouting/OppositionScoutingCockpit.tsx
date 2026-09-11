"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { D } from "@/lib/design-system";
import { 
  ShieldAlert, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Share2, 
  Zap, 
  TrendingUp, 
  Users, 
  Calendar, 
  MapPin, 
  Award, 
  ChevronRight, 
  Activity, 
  HelpCircle,
  Eye,
  Download,
  Sliders,
  RotateCcw,
  MessageSquare,
  BarChart3,
  Layers,
  Crosshair
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeader } from '@/components/ui/SectionHeader';

// Mock Opposition Fixture Context
const FIXTURES = [
  {
    id: "wes-dhs-50",
    home: "Westville Boys' High 1st XI",
    away: "Durban High School 1st XI",
    opponent: "Durban High School 1st XI",
    date: "Sat 19 Sep • 09:30",
    venue: "WES Oval",
    format: "50-over match",
    dossierCompletion: 84,
    dataConfidence: 86,
    deliveriesAnalysed: 3486,
    fixturesAnalysed: 12
  },
  {
    id: "wes-kearsney-t20",
    home: "Westville Boys' High 1st XI",
    away: "Kearsney College 1st XI",
    opponent: "Kearsney College 1st XI",
    date: "Wed 23 Sep • 14:00",
    venue: "AH Smith Oval",
    format: "T20 Match",
    dossierCompletion: 62,
    dataConfidence: 74,
    deliveriesAnalysed: 1840,
    fixturesAnalysed: 7
  }
];

// Opposition DNA Data
const OPPOSITION_DNA = {
  batting: [
    { title: "Aggressive Top-Order", detail: "Openers attack early in Powerplay (SR 104 in overs 1-10)." },
    { title: "Spin Vulnerability", detail: "Scoring rate drops by 24% against leg-spin & left-arm orthodox in middle overs." },
    { title: "Square Scoring Preference", detail: "62% of boundaries hit through cover and square leg arcs." }
  ],
  bowling: [
    { title: "New-Ball Seam Emphasis", detail: "Strikers Mthembu & Govender bowl 70% of Powerplay overs." },
    { title: "Fifth Bowler Leak", detail: "5th bowling option yields 6.82 rpo compared to top 4 attack (4.15 rpo)." },
    { title: "Late Slower Balls", detail: "31% variation rate in death overs (overs 41-50)." }
  ],
  fielding: [
    { title: "High Inner Ring Pressure", detail: "Aggressive slip and cover catchers early in innings." },
    { title: "Boundary Weakness", detail: "Third man and deep midwicket concede 1.4 extra runs per boundary attempt." }
  ],
  matchBehaviour: [
    { title: "Toss Preference", detail: "Choose to bat first in 80% of toss wins." },
    { title: "Collapse Vulnerability", detail: "Tendency to lose 3+ wickets within 15 balls following spin breakthroughs." }
  ]
};

// Fact, Inference & Recommendation (FIR) Triad Insights
const FIR_TRIAD = [
  {
    id: "fir-1",
    subject: "A. Naidoo (Opening Batter)",
    fact: "Scored 34 runs from 52 balls vs Leg-spin in last 6 matches with 3 dismissals.",
    inference: "Struggles to turn over strike against wrist spin, leading to high dot-ball pressure.",
    recommendation: "Introduce K. Singh (Leg-spin) within Naidoo's first 20 deliveries with an aggressive leg-side field.",
    confidence: 88,
    status: "approved"
  },
  {
    id: "fir-2",
    subject: "Opposition Middle Overs (Overs 16-35)",
    fact: "Run rate drops from 6.1 rpo (Powerplay) to 4.1 rpo (Middle overs) across 12 games.",
    inference: "Conservative consolidation phase; opposition avoids risk when 2+ wickets down.",
    recommendation: "Tighten slip ring and post deep midwicket to enforce dot pressure and force lofted strokes.",
    confidence: 82,
    status: "approved"
  },
  {
    id: "fir-3",
    subject: "S. Mthembu (New-Ball Seamer)",
    fact: "First spell economy: 2.8 rpo over 4 overs. Second spell economy: 5.9 rpo over 4 overs.",
    inference: "Effectiveness drops sharply under fatigue in 2nd and 3rd spells.",
    recommendation: "Play conservatively against Mthembu's initial 4-over spell, then target his 2nd spell.",
    confidence: 76,
    status: "pending"
  }
];

// Matchup Engine Data (Direct vs Modelled)
const MATCHUPS = [
  {
    id: "m-1",
    batter: "A. Naidoo (RHB)",
    bowler: "K. Singh (Leg-spin)",
    type: "Direct",
    balls: 34,
    runs: 21,
    wickets: 3,
    dotBallPct: 52,
    advantage: "Bowler",
    confidence: 91,
    summary: "Favourable matchup. Singh has dismissed Naidoo 3 times at a 61.8 strike rate."
  },
  {
    id: "m-2",
    batter: "T. Pillay (LHB)",
    bowler: "L. Marais (LA-Seam)",
    type: "Modelled",
    balls: 0,
    runs: 0,
    wickets: 0,
    dotBallPct: 44,
    advantage: "Bowler",
    confidence: 74,
    summary: "Modelled projection. Pillay averages 22.4 against left-arm seam angling across."
  },
  {
    id: "m-3",
    batter: "R. Govender (RHB)",
    bowler: "M. Ndlovu (Off-spin)",
    type: "Direct",
    balls: 42,
    runs: 58,
    wickets: 1,
    dotBallPct: 28,
    advantage: "Batter",
    confidence: 84,
    summary: "Unfavourable matchup. Govender scores freely through cover against off-spin."
  }
];

// Strength / Vulnerability Matrix
const MATRIX = [
  { area: "Opening Batting", status: "Strong", rating: "88%", color: D.emerald },
  { area: "Top-Order Powerplay", status: "Strong", rating: "84%", color: D.emerald },
  { area: "Middle-Order Stability", status: "Moderate", rating: "62%", color: D.amber },
  { area: "Spin Rotation", status: "Vulnerable", rating: "42%", color: D.rose },
  { area: "New-Ball Seam Attack", status: "Strong", rating: "86%", color: D.emerald },
  { area: "Fifth Bowler Depth", status: "Vulnerable", rating: "38%", color: D.rose },
  { area: "Death Overs Execution", status: "Moderate", rating: "56%", color: D.amber },
  { area: "Inner-Ring Catching", status: "Strong", rating: "82%", color: D.emerald }
];

export function OppositionScoutingCockpit() {
  const [selectedFixtureId, setSelectedFixtureId] = useState(FIXTURES[0].id);
  const [firItems, setFirItems] = useState(FIR_TRIAD);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [selectedDossierRole, setSelectedDossierRole] = useState<'analyst' | 'coach' | 'captain' | 'player'>('coach');
  const [observationModalOpen, setObservationModalOpen] = useState(false);
  const [newObsText, setNewObsText] = useState("");
  const [newObsCategory, setNewObsCategory] = useState("Tactical");

  const currentFixture = FIXTURES.find(f => f.id === selectedFixtureId) || FIXTURES[0];

  const handleToggleFirStatus = (id: string, newStatus: string) => {
    setFirItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Cockpit Selector */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 p-6 rounded-3xl border border-white/10" style={{ background: D.surf1 }}>
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 font-black text-xs px-3 py-1 uppercase tracking-widest">
              Performance Analyst Cockpit
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-black text-xs px-3 py-1 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Intelligence Active
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>
            Opposition Scouting & Dossier Generator
          </h1>
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1 text-white"><Calendar className="w-4 h-4 text-sky-400" /> {currentFixture.date}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-emerald-400" /> {currentFixture.venue}</span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">{currentFixture.format}</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Select value={selectedFixtureId} onValueChange={setSelectedFixtureId}>
            <SelectTrigger className="w-[280px] h-12 bg-black/40 border-white/10 rounded-2xl font-bold text-xs uppercase tracking-wider">
              <SelectValue placeholder="Select Upcoming Match" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              {FIXTURES.map(f => (
                <SelectItem key={f.id} value={f.id} className="font-bold text-xs">
                  {f.opponent} ({f.format})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => setObservationModalOpen(true)}
            variant="outline"
            className="h-12 px-5 rounded-2xl font-bold text-xs uppercase tracking-wider border-white/10 hover:bg-white/5"
          >
            <MessageSquare className="w-4 h-4 mr-2 text-sky-400" /> Add Observation
          </Button>

          <Button
            onClick={() => setDossierModalOpen(true)}
            className="h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-sky-500/20"
            style={{ background: D.sky, color: '#000' }}
          >
            <FileText className="w-4 h-4 mr-2" /> Publish Dossier
          </Button>
        </div>
      </div>

      {/* Intelligence Metric Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-white/5" style={{ background: D.surf1 }}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Dossier Completion</p>
              <div className="text-3xl font-black italic" style={{ fontFamily: D.mono, color: D.textPrimary }}>
                {currentFixture.dossierCompletion}%
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Activity className="w-6 h-6" />
            </div>
          </CardContent>
          <div className="px-6 pb-4">
            <Progress value={currentFixture.dossierCompletion} className="h-2 bg-black/40" style={{ color: D.sky }} />
          </div>
        </Card>

        <Card className="border-white/5" style={{ background: D.surf1 }}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Data Confidence Score</p>
              <div className="text-3xl font-black italic text-emerald-400" style={{ fontFamily: D.mono }}>
                {currentFixture.dataConfidence}%
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
          <div className="px-6 pb-4 text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
            High Confidence • 12 Matches Sampled
          </div>
        </Card>

        <Card className="border-white/5" style={{ background: D.surf1 }}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Deliveries Analysed</p>
              <div className="text-3xl font-black italic" style={{ fontFamily: D.mono, color: D.textPrimary }}>
                {currentFixture.deliveriesAnalysed.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BarChart3 className="w-6 h-6" />
            </div>
          </CardContent>
          <div className="px-6 pb-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Across {currentFixture.fixturesAnalysed} Opposition Innings
          </div>
        </Card>

        <Card className="border-white/5" style={{ background: D.surf1 }}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Key Opposition Form</p>
              <div className="text-2xl font-black italic flex items-center gap-1.5" style={{ fontFamily: D.mono }}>
                <span className="text-emerald-400">W</span>
                <span className="text-emerald-400">W</span>
                <span className="text-rose-400">L</span>
                <span className="text-emerald-400">W</span>
                <span className="text-emerald-400">W</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
          <div className="px-6 pb-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Last 5 Matches (80% Win Rate)
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dna" className="space-y-6">
        <TabsList className="bg-black/40 p-1.5 border border-white/10 rounded-2xl inline-flex gap-2 flex-wrap">
          <TabsTrigger value="dna" className="px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs data-[state=active]:bg-sky-500 data-[state=active]:text-black">
            <Layers className="w-4 h-4 mr-2" /> Team DNA & Matrix
          </TabsTrigger>
          <TabsTrigger value="triad" className="px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs data-[state=active]:bg-sky-500 data-[state=active]:text-black">
            <Sparkles className="w-4 h-4 mr-2" /> FIR Triad (Fact / Inference / Plan)
          </TabsTrigger>
          <TabsTrigger value="matchups" className="px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs data-[state=active]:bg-sky-500 data-[state=active]:text-black">
            <Crosshair className="w-4 h-4 mr-2" /> Batter vs Bowler Matchups
          </TabsTrigger>
          <TabsTrigger value="threats" className="px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs data-[state=active]:bg-sky-500 data-[state=active]:text-black">
            <Target className="w-4 h-4 mr-2" /> Key Player Threat Radar
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: TEAM DNA & MATRIX */}
        <TabsContent value="dna" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Strength / Vulnerability Matrix */}
            <Card className="lg:col-span-1 border-white/10" style={{ background: D.surf1 }}>
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg font-black uppercase italic" style={{ fontFamily: D.head }}>
                  Strength & Vulnerability Matrix
                </CardTitle>
                <CardDescription className="text-xs font-bold text-muted-foreground">
                  Opposition tactical profile across 8 key dimensions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {MATRIX.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                    <span className="text-xs font-bold text-white/90">{m.area}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-black">{m.rating}</span>
                      <Badge 
                        className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md"
                        style={{ background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}40` }}
                      >
                        {m.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tactical DNA Cards */}
            <Card className="lg:col-span-2 border-white/10" style={{ background: D.surf1 }}>
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg font-black uppercase italic" style={{ fontFamily: D.head }}>
                  Opposition Tactical DNA
                </CardTitle>
                <CardDescription className="text-xs font-bold text-muted-foreground">
                  Repeatable behavioral patterns detected across {currentFixture.deliveriesAnalysed.toLocaleString()} deliveries
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Batting Identity */}
                <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-sky-400 font-black text-xs uppercase tracking-widest">
                    <Zap className="w-4 h-4" /> Batting Identity
                  </div>
                  {OPPOSITION_DNA.batting.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>

                {/* Bowling Identity */}
                <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
                    <Target className="w-4 h-4" /> Bowling Identity
                  </div>
                  {OPPOSITION_DNA.bowling.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>

                {/* Fielding & Catching */}
                <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-widest">
                    <ShieldAlert className="w-4 h-4" /> Fielding & Ring Pressure
                  </div>
                  {OPPOSITION_DNA.fielding.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>

                {/* Match Behaviour & Toss */}
                <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest">
                    <Activity className="w-4 h-4" /> Match Behaviour & Collapse Risk
                  </div>
                  {OPPOSITION_DNA.matchBehaviour.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: FIR TRIAD (FACT / INFERENCE / RECOMMENDATION) */}
        <TabsContent value="triad" className="space-y-6">
          <Card className="border-white/10" style={{ background: D.surf1 }}>
            <CardHeader className="border-b border-white/5 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black uppercase italic" style={{ fontFamily: D.head }}>
                  Fact • Inference • Recommendation Triad
                </CardTitle>
                <CardDescription className="text-xs font-bold text-muted-foreground">
                  Traceable analytical pipeline distinguishing hard evidence from tactical recommendations
                </CardDescription>
              </div>
              <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 font-mono text-xs px-3 py-1">
                3 Active Triads
              </Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {firItems.map((item) => (
                <div key={item.id} className="p-6 rounded-2xl bg-black/30 border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black italic text-white uppercase" style={{ fontFamily: D.head }}>
                        {item.subject}
                      </span>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono">
                        {item.confidence}% Confidence
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={item.status === 'approved' ? 'default' : 'outline'}
                        onClick={() => handleToggleFirStatus(item.id, 'approved')}
                        className={`h-8 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                          item.status === 'approved' ? 'bg-emerald-500 text-black font-black' : 'border-white/10'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approved
                      </Button>
                      <Button
                        size="sm"
                        variant={item.status === 'rejected' ? 'destructive' : 'outline'}
                        onClick={() => handleToggleFirStatus(item.id, 'rejected')}
                        className="h-8 text-[10px] font-black uppercase tracking-wider border-white/10 rounded-lg"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Override
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* FACT */}
                    <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> 1. FACT (Recorded Data)
                      </span>
                      <p className="text-xs font-medium text-white/90 leading-relaxed">{item.fact}</p>
                    </div>

                    {/* INFERENCE */}
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> 2. INFERENCE (Pattern)
                      </span>
                      <p className="text-xs font-medium text-white/90 leading-relaxed">{item.inference}</p>
                    </div>

                    {/* RECOMMENDATION */}
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" /> 3. PLAN (Tactical Action)
                      </span>
                      <p className="text-xs font-medium text-white/90 leading-relaxed">{item.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: BATTER VS BOWLER MATCHUPS */}
        <TabsContent value="matchups" className="space-y-6">
          <Card className="border-white/10" style={{ background: D.surf1 }}>
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-black uppercase italic" style={{ fontFamily: D.head }}>
                Matchup Engine (Direct vs Modelled)
              </CardTitle>
              <CardDescription className="text-xs font-bold text-muted-foreground">
                Head-to-head statistical matchups and AI similarity projections
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {MATCHUPS.map((m) => (
                <div key={m.id} className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <Badge className={m.type === 'Direct' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}>
                      {m.type} Matchup
                    </Badge>
                    <span className="text-xs font-mono font-black text-emerald-400">{m.confidence}% Confidence</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white">{m.batter}</span>
                      <span className="text-muted-foreground">vs</span>
                      <span className="text-sky-400">{m.bowler}</span>
                    </div>

                    {m.type === 'Direct' && (
                      <div className="grid grid-cols-3 text-center p-2 rounded-xl bg-black/40 text-[11px] font-mono font-bold text-muted-foreground">
                        <div><span className="text-white">{m.balls}</span> Deliveries</div>
                        <div><span className="text-white">{m.runs}</span> Runs</div>
                        <div><span className="text-emerald-400">{m.wickets}</span> Wickets</div>
                      </div>
                    )}

                    <p className="text-xs font-medium text-muted-foreground leading-relaxed pt-2">
                      {m.summary}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: THREAT RADAR */}
        <TabsContent value="threats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-white/10" style={{ background: D.surf1 }}>
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg font-black uppercase italic" style={{ fontFamily: D.head }}>
                  Key Threat #1: A. Naidoo
                </CardTitle>
                <CardDescription className="text-xs font-bold text-muted-foreground">
                  Opening Batter • Right-Handed
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Overall Threat Index</span>
                  <span className="text-2xl font-black italic text-rose-400" style={{ fontFamily: D.mono }}>87 / 100</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                      <span>Boundary Threat</span>
                      <span className="text-white">91%</span>
                    </div>
                    <Progress value={91} className="h-2 bg-black/40" style={{ color: D.rose }} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                      <span>Run Production</span>
                      <span className="text-white">84%</span>
                    </div>
                    <Progress value={84} className="h-2 bg-black/40" style={{ color: D.amber }} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                      <span>Strike Rotation (vs Spin)</span>
                      <span className="text-rose-400">42%</span>
                    </div>
                    <Progress value={42} className="h-2 bg-black/40" style={{ color: D.rose }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10" style={{ background: D.surf1 }}>
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg font-black uppercase italic" style={{ fontFamily: D.head }}>
                  Key Threat #2: S. Mthembu
                </CardTitle>
                <CardDescription className="text-xs font-bold text-muted-foreground">
                  Strike Seamer • Right-Arm Fast Medium
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Overall Threat Index</span>
                  <span className="text-2xl font-black italic text-amber-400" style={{ fontFamily: D.mono }}>84 / 100</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                      <span>Powerplay Threat</span>
                      <span className="text-white">89%</span>
                    </div>
                    <Progress value={89} className="h-2 bg-black/40" style={{ color: D.rose }} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                      <span>Wicket-Taking Frequency</span>
                      <span className="text-white">82%</span>
                    </div>
                    <Progress value={82} className="h-2 bg-black/40" style={{ color: D.amber }} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                      <span>Second Spell Stamina</span>
                      <span className="text-rose-400">48%</span>
                    </div>
                    <Progress value={48} className="h-2 bg-black/40" style={{ color: D.rose }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* PUBLISH DOSSIER MODAL */}
      <Dialog open={dossierModalOpen} onOpenChange={setDossierModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-950 border-white/10 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic" style={{ fontFamily: D.head }}>
              Publish Opposition Match Dossier
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground">
              Export tailored tactical briefs based on recipient role
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/10">
              <Button
                variant={selectedDossierRole === 'coach' ? 'default' : 'ghost'}
                onClick={() => setSelectedDossierRole('coach')}
                className={`flex-1 rounded-xl text-xs font-bold uppercase ${selectedDossierRole === 'coach' ? 'bg-sky-500 text-black' : ''}`}
              >
                Coach Brief
              </Button>
              <Button
                variant={selectedDossierRole === 'captain' ? 'default' : 'ghost'}
                onClick={() => setSelectedDossierRole('captain')}
                className={`flex-1 rounded-xl text-xs font-bold uppercase ${selectedDossierRole === 'captain' ? 'bg-sky-500 text-black' : ''}`}
              >
                Captain Brief
              </Button>
              <Button
                variant={selectedDossierRole === 'player' ? 'default' : 'ghost'}
                onClick={() => setSelectedDossierRole('player')}
                className={`flex-1 rounded-xl text-xs font-bold uppercase ${selectedDossierRole === 'player' ? 'bg-sky-500 text-black' : ''}`}
              >
                Player Briefs
              </Button>
              <Button
                variant={selectedDossierRole === 'analyst' ? 'default' : 'ghost'}
                onClick={() => setSelectedDossierRole('analyst')}
                className={`flex-1 rounded-xl text-xs font-bold uppercase ${selectedDossierRole === 'analyst' ? 'bg-sky-500 text-black' : ''}`}
              >
                Full Analyst PDF
              </Button>
            </div>

            <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3">
              <h4 className="text-xs font-black uppercase text-sky-400 tracking-wider">
                Preview: {selectedDossierRole.toUpperCase()} MATCH BRIEF
              </h4>
              {selectedDossierRole === 'captain' && (
                <ul className="text-xs font-medium text-muted-foreground space-y-2 list-disc pl-4">
                  <li><strong>Toss Priority:</strong> Elect to field first if overcast; opposition scoring rate drops by 18% when chasing.</li>
                  <li><strong>Key Target #1:</strong> Introduce K. Singh within A. Naidoo&apos;s first 20 balls.</li>
                  <li><strong>Target Fifth Bowler:</strong> Attack overs 25-35 during fifth bowler spell.</li>
                </ul>
              )}
              {selectedDossierRole === 'coach' && (
                <ul className="text-xs font-medium text-muted-foreground space-y-2 list-disc pl-4">
                  <li><strong>Full Executive Summary:</strong> 3 Threats, 3 Vulnerabilities, 86% Data Confidence.</li>
                  <li><strong>Squad Depth Analysis:</strong> Opposition 5th bowler & 2nd spell pace weakness identified.</li>
                  <li><strong>FIR Triad Plan:</strong> Approved leg-spin attack plan against top-order.</li>
                </ul>
              )}
              {selectedDossierRole === 'player' && (
                <p className="text-xs font-medium text-muted-foreground">
                  Individual role-specific execution sheets ready for 11 playing XI members.
                </p>
              )}
              {selectedDossierRole === 'analyst' && (
                <p className="text-xs font-medium text-muted-foreground">
                  Complete 12-section technical PDF report including all delivery samples, spatial heatmaps & H2H matrices.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDossierModalOpen(false)} className="border-white/10 rounded-xl font-bold">
              Cancel
            </Button>
            <Button onClick={() => setDossierModalOpen(false)} className="bg-sky-500 text-black font-black rounded-xl">
              <Download className="w-4 h-4 mr-2" /> Export & Distribute Brief
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD OBSERVATION MODAL */}
      <Dialog open={observationModalOpen} onOpenChange={setObservationModalOpen}>
        <DialogContent className="max-w-md bg-slate-950 border-white/10 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic" style={{ fontFamily: D.head }}>
              Add Analyst Observation
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground">
              Log qualitative scout observation linked to evidence
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Category</label>
              <Select value={newObsCategory} onValueChange={setNewObsCategory}>
                <SelectTrigger className="bg-black/40 border-white/10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Tactical">Tactical</SelectItem>
                  <SelectItem value="Behavioural">Behavioural</SelectItem>
                  <SelectItem value="Fielding">Fielding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Observation Note</label>
              <Textarea
                placeholder="e.g. Batter tends to step across off-stump early against spin..."
                value={newObsText}
                onChange={(e) => setNewObsText(e.target.value)}
                className="bg-black/40 border-white/10 rounded-xl h-24 text-xs font-medium"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setObservationModalOpen(false)} className="border-white/10 rounded-xl font-bold">
              Cancel
            </Button>
            <Button
              onClick={() => {
                setObservationModalOpen(false);
                setNewObsText("");
              }}
              className="bg-sky-500 text-black font-black rounded-xl"
            >
              Save Observation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
