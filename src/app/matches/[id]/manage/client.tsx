'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Match, Person, PreMatchProcedure } from '@/types/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bus, MapPin, Activity, CheckCircle2, AlertCircle, ChevronLeft, Plus, Loader2, UserPlus, GripVertical, ArrowUp, ArrowDown, ArrowRight, CornerDownRight } from 'lucide-react';
import Link from 'next/link';
import { createTeamSheetVersionAction, updateReadinessLayerAction, fetchManagementContextAction } from '@/app/actions/preMatchActions_v2';
import { createPersonAction } from '@/app/actions/personActions';
import { getPlayerAssessmentsAction, getPlayerReadinessAction } from '@/app/actions/skillActions';
import { DrillRecommender } from '@/components/coaches/DrillRecommender';
import { SkillAssessment, ReadinessScore, FixtureReadinessCheck, MatchTeamSheet, MatchTeamSheetPlayer, ISO8601Timestamp } from '@/types/schema_v4';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MatchReadinessDossier } from '@/components/admin/MatchReadinessDossier';
import { medicalReadinessService } from '@/services/medical/medicalReadinessService';
import { cn } from '@/lib/utils';
import { Zap, Target, TrendingUp, Award, FileText } from 'lucide-react';

interface MatchManagementClientProps {
  match: Match;
  homeTeam: any;
  awayTeam: any;
  homePlayers: Person[];
  awayPlayers: Person[];
  context: {
    success: boolean;
    readiness: FixtureReadinessCheck | null;
    latestTeamSheet: MatchTeamSheet | null;
    selectedPlayers: MatchTeamSheetPlayer[];
    availability: any[];
  };
}

export function MatchManagementClient({ 
  match, 
  homeTeam, 
  awayTeam, 
  homePlayers, 
  awayPlayers,
  context
}: MatchManagementClientProps) {
  const [activeTab, setActiveTab] = useState('squad');
  const [selectedPlayerForInsight, setSelectedPlayerForInsight] = useState<Person | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerOpen, setNewPlayerOpen] = useState(false);
  const [insightData, setInsightData] = useState<{ assessments: SkillAssessment[], readiness: ReadinessScore | null }>({ assessments: [], readiness: null });
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const router = useRouter();

  const seasonId = match.seasonId || 'current-season'; // Fallback

  const fetchInsightData = useCallback(async (personId: string) => {
    setIsLoadingInsight(true);
    try {
      const [assessmentsRes, readinessRes] = await Promise.all([
        getPlayerAssessmentsAction(personId),
        getPlayerReadinessAction(personId, seasonId)
      ]);

      setInsightData({
        assessments: assessmentsRes.success ? (assessmentsRes.assessments || []) : [],
        readiness: readinessRes.success ? (readinessRes.readiness || null) : null
      });
    } catch (error) {
      console.error("Error fetching insight data:", error);
    } finally {
      setIsLoadingInsight(false);
    }
  }, [seasonId]);

  useEffect(() => {
    if (selectedPlayerForInsight) {
      fetchInsightData(selectedPlayerForInsight.id);
    }
  }, [selectedPlayerForInsight, fetchInsightData]);

  const handleAddPlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddingPlayer(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append('role', 'PLAYER');
    formData.append('schoolId', homeTeam.schoolId || '');
    formData.append('teamIds', JSON.stringify([homeTeam.id]));
    
    try {
      const result = await createPersonAction(formData);
      if (result.success) {
        toast.success("Player added to squad roster");
        setNewPlayerOpen(false);
        router.refresh(); // Refresh to get the new player in the list
      } else {
        toast.error(result.error || "Failed to add player");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsAddingPlayer(false);
    }
  };

  // Initialize selected players from context
  const [selectedXIIds, setSelectedXIIds] = useState<string[]>(
    context.latestTeamSheet ? context.selectedPlayers.filter((p: any) => p.isStartingXi).map((p: any) => p.personId) : []
  );
  const [selectedReservesIds, setSelectedReservesIds] = useState<string[]>(
    context.latestTeamSheet ? context.selectedPlayers.filter((p: any) => p.isSubstitute).map((p: any) => p.personId) : []
  );

  // Drag and Drop State
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<'roster' | 'xi' | 'reserves' | null>(null);
  const [dropTargetZone, setDropTargetZone] = useState<'xi' | 'reserves' | 'roster' | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<{ zone: 'xi' | 'reserves'; index: number } | null>(null);

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, playerId: string, source: 'roster' | 'xi' | 'reserves') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ playerId, source }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedPlayerId(playerId);
    setDragSource(source);
  };

  const handleDragEnd = () => {
    setDraggedPlayerId(null);
    setDragSource(null);
    setDropTargetZone(null);
    setDragOverIndex(null);
  };

  const handleDragOverZone = (e: React.DragEvent, targetZone: 'xi' | 'reserves' | 'roster') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetZone !== targetZone) {
      setDropTargetZone(targetZone);
    }
  };

  const handleDropOnZone = (e: React.DragEvent, targetZone: 'xi' | 'reserves' | 'roster') => {
    e.preventDefault();
    e.stopPropagation();
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;

    try {
      const { playerId, source } = JSON.parse(dataStr);
      if (!playerId) return;

      // Handle drop based on source and target
      if (targetZone === 'roster') {
        // Remove from XI or Reserves
        setSelectedXIIds(prev => prev.filter(id => id !== playerId));
        setSelectedReservesIds(prev => prev.filter(id => id !== playerId));
      } else if (targetZone === 'xi') {
        if (source === 'xi') return; // Handled by reorder if dropped on item
        if (selectedXIIds.length >= 11 && !selectedXIIds.includes(playerId)) {
          toast.error("Starting XI is full (11 players max)");
          handleDragEnd();
          return;
        }
        // Remove from reserves if present
        setSelectedReservesIds(prev => prev.filter(id => id !== playerId));
        // Add to XI if not present
        setSelectedXIIds(prev => prev.includes(playerId) ? prev : [...prev, playerId]);
      } else if (targetZone === 'reserves') {
        if (source === 'reserves') return;
        if (selectedReservesIds.length >= 4 && !selectedReservesIds.includes(playerId)) {
          toast.error("Reserves bench is full (4 players max)");
          handleDragEnd();
          return;
        }
        // Remove from XI if present
        setSelectedXIIds(prev => prev.filter(id => id !== playerId));
        // Add to Reserves if not present
        setSelectedReservesIds(prev => prev.includes(playerId) ? prev : [...prev, playerId]);
      }
    } catch (err) {
      console.error("Drop error", err);
    } finally {
      handleDragEnd();
    }
  };

  const movePlayerInList = (list: 'xi' | 'reserves', fromIndex: number, toIndex: number) => {
    const setList = list === 'xi' ? setSelectedXIIds : setSelectedReservesIds;
    setList(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  // Derive readiness state from context.readiness
  const readiness = useMemo(() => {
    const r = context.readiness;
    return {
      squad: r?.squadReady || selectedXIIds.length === 11,
      transport: r?.transportReady || false,
      grounds: r?.facilitiesReady || false,
      officials: r?.officialsReady || false,
      medical: r?.medicalChecked || false,
      equipment: r?.equipmentReady || false
    };
  }, [context.readiness, selectedXIIds]);

  const togglePlayerSelection = (player: Person) => {
    if (selectedXIIds.includes(player.id)) {
      setSelectedXIIds(prev => prev.filter(id => id !== player.id));
    } else {
      if (selectedXIIds.length < 11) {
        setSelectedXIIds(prev => [...prev, player.id]);
      } else if (selectedReservesIds.length < 4) {
        setSelectedReservesIds(prev => [...prev, player.id]);
      } else {
        toast.error("Match day squad is full (11 + 4 reserves)");
      }
    }
  };

  const handleSaveSquad = async () => {
    setIsSaving(true);
    try {
      const playerAssignments = [
        ...selectedXIIds.map(id => ({
          personId: id,
          isStartingXi: true,
          isSubstitute: false,
          isCaptain: false, // Could be stateful later
          isViceCaptain: false,
          isWicketkeeper: false
        })),
        ...selectedReservesIds.map(id => ({
          personId: id,
          isStartingXi: false,
          isSubstitute: true,
          isCaptain: false,
          isViceCaptain: false,
          isWicketkeeper: false
        }))
      ];

      const result = await createTeamSheetVersionAction(
        match.id,
        homeTeam.id,
        playerAssignments,
        'system' // Replace with actual logged-in user ID
      );
      
      if (result.success && 'versionNo' in result) {
        toast.success(`Squad saved (Version ${result.versionNo})`);
        router.refresh();
      } else if (!result.success && 'error' in result) {
        toast.error(result.error || "Failed to save squad");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleReadiness = async (layer: keyof Omit<FixtureReadinessCheck, 'id' | 'fixtureId' | 'overallStatus' | 'notes' | 'updatedAt'>) => {
    const currentValue = readiness[layer as keyof typeof readiness];
    const result = await updateReadinessLayerAction(match.id, layer, !currentValue);
    if (result.success) {
      toast.success(`${layer} status updated`);
      router.refresh();
    } else {
      toast.error("Failed to update readiness");
    }
  };

  const selectedXI = useMemo(() => 
    homePlayers.filter((p: Person) => selectedXIIds.includes(p.id)),
    [homePlayers, selectedXIIds]
  );

  const selectedReserves = useMemo(() => 
    homePlayers.filter((p: Person) => selectedReservesIds.includes(p.id)),
    [homePlayers, selectedReservesIds]
  );

  const PlayerInsightSidebar = () => {
    if (!selectedPlayerForInsight) return null;
    
    return (
      <Sheet open={!!selectedPlayerForInsight} onOpenChange={(open) => !open && setSelectedPlayerForInsight(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-[#0c1220] border-white/10 text-white p-0 overflow-y-auto">
          <SheetHeader className="sr-only">
            <SheetTitle>{selectedPlayerForInsight.firstName} {selectedPlayerForInsight.lastName} — Player Insight</SheetTitle>
          </SheetHeader>
          <div className="h-32 bg-gradient-to-br from-[#4f46e5]/20 to-transparent relative">
            <div className="absolute -bottom-10 left-8">
              <div className="w-20 h-20 rounded-2xl bg-[#101829] border-2 border-white/10 flex items-center justify-center text-xl font-bold shadow-2xl">
                {selectedPlayerForInsight.firstName.charAt(0)}{selectedPlayerForInsight.lastName.charAt(0)}
              </div>
            </div>
            <div className="absolute bottom-4 right-6 flex gap-2">
               <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-2 py-0.5 text-[10px]">Available</Badge>
               <Badge variant="outline" className="border-white/10 bg-white/5 text-[10px] px-2 py-0.5">ALL-ROUNDER</Badge>
            </div>
          </div>
          
          <div className="pt-14 px-8 pb-8 space-y-8">
            <header>
              <h2 className="text-2xl font-['Syne',sans-serif] font-bold">{selectedPlayerForInsight.firstName} {selectedPlayerForInsight.lastName}</h2>
              <p className="text-sm text-muted-foreground mt-1">St John&apos;s College • Year 12A Squad</p>
            </header>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                   <Target className="h-4 w-4 text-[#4f46e5]" />
                   <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Batting AVG</span>
                </div>
                <p className="text-2xl font-bold">42.5</p>
                <p className="text-[10px] text-emerald-400 mt-1">↑ 12% vs last season</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                   <Activity className="h-4 w-4 text-emerald-400" />
                   <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">STR Rate</span>
                </div>
                <p className="text-2xl font-bold">118.2</p>
                <p className="text-[10px] text-muted-foreground mt-1">Consistent across phases</p>
              </div>
            </div>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-4 flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Recent 3 Match Form
              </h3>
              <div className="space-y-3">
                 {[
                   { opp: 'Bishop\'s U19', score: '54 (42)', result: 'W', wickets: '2/22' },
                   { opp: 'Wynberg A', score: '12 (15)', result: 'L', wickets: '1/34' },
                   { opp: 'Rondebosch B', score: '88* (72)', result: 'W', wickets: '3/18' },
                 ].map((match, i) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/5">
                      <div className="flex flex-col">
                         <span className="text-xs font-semibold">{match.opp}</span>
                         <span className="text-[10px] text-muted-foreground">{match.score} • {match.wickets}</span>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", match.result === 'W' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : 'text-rose-400 border-rose-400/20 bg-rose-400/5')}>
                         {match.result}
                      </Badge>
                   </div>
                 ))}
              </div>
            </section>

            <section>
              {isLoadingInsight ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#4f46e5]" />
                </div>
              ) : (
                <DrillRecommender 
                  playerId={selectedPlayerForInsight.id}
                  playerName={`${selectedPlayerForInsight.firstName} ${selectedPlayerForInsight.lastName}`}
                  role="Opener" // This should ideally be fetched from a role profile, defaulting to Opener for now
                  assessments={insightData.assessments}
                  readiness={insightData.readiness || undefined}
                />
              )}
            </section>

            <div className="pt-4 flex gap-3">
               <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5 text-xs h-10">Full Profile</Button>
               <Button className="flex-1 bg-[#4f46e5] text-white hover:bg-[#4338ca] text-xs h-10">Coach Notes</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  };
  
  const isHomeMatch = true; // In reality, depends on user's authorized school context

  return (
    <div className="min-h-screen bg-[#05080f] text-[#f3f5ef] font-['DM_Sans',sans-serif] selection:bg-[#4f46e5]/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#05080f]/80 backdrop-blur-xl border-b border-white/5 mx-auto w-full">
        <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <Link href="/fixtures" className="mr-6 flex items-center text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Fixtures
          </Link>
          <div className="flex items-center space-x-4 ml-auto">
             <Badge variant="outline" className="bg-[#4f46e5]/10 text-[#4f46e5] border-[#4f46e5]/20 font-['Syne',sans-serif] font-bold tracking-widest uppercase text-[10px] py-1">
               {match.status || 'Scheduled'}
             </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Match Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-['Syne',sans-serif] tracking-tight mb-2">
              Match Management
            </h1>
            <div className="flex items-center text-muted-foreground gap-3">
               <span className="font-medium text-white">{homeTeam?.name || 'Home'} vs {awayTeam?.name || 'Away'}</span>
               <span>•</span>
                <span>{match.matchDate ? new Date(match.matchDate as string | number | Date).toLocaleDateString() : 'TBD'}</span>
            </div>
          </div>
          <div className="flex gap-3">
             <Button 
                variant="outline" 
                className="border-white/10 hover:bg-white/5 text-white" 
                disabled={isSaving}
                onClick={() => {
                  if (homePlayers && homePlayers.length > 0) {
                    const xi = homePlayers.slice(0, 11).map(p => p.id);
                    const res = homePlayers.slice(11, 15).map(p => p.id);
                    setSelectedXIIds(xi);
                    setSelectedReservesIds(res);
                    toast.success(`Auto-filled Playing XI (${xi.length}) and Reserves (${res.length})`);
                  } else {
                    toast.error("No squad players available to auto-fill");
                  }
                }}
              >
                Auto-Fill Squad
              </Button>
             <Button 
                onClick={handleSaveSquad} 
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Save Squad
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[
            { id: 'squadReady', label: 'Squad Selection', icon: Users, ready: readiness.squad },
            { id: 'transportReady', label: 'Transport', icon: Bus, ready: readiness.transport },
            { id: 'facilitiesReady', label: 'Facilities', icon: MapPin, ready: readiness.grounds },
            { id: 'officialsReady', label: 'Officials', icon: Activity, ready: readiness.officials },
            { id: 'medicalChecked', label: 'Medical', icon: Activity, ready: readiness.medical },
            { id: 'equipmentReady', label: 'Equipment', icon: CheckCircle2, ready: readiness.equipment }
          ].map(item => (
            <Card 
              key={item.id} 
              onClick={() => toggleReadiness(item.id as any)}
              className={`bg-[#0c1220] border-white/5 overflow-hidden transition-all duration-300 cursor-pointer hover:border-white/20 ${item.ready ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}
            >
               <CardContent className="p-4 flex flex-col h-full relative">
                  {item.ready && (
                     <div className="absolute top-0 right-0 p-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     </div>
                  )}
                  {!item.ready && (
                     <div className="absolute top-0 right-0 p-2">
                        <AlertCircle className="h-4 w-4 text-amber-500/70" />
                     </div>
                  )}
                  
                  <div className={`p-2 rounded-full w-10 h-10 flex items-center justify-center mb-3 ${item.ready ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-muted-foreground'}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  
                  <h3 className="font-['Syne',sans-serif] font-bold text-[13px] mb-1 leading-tight">{item.label}</h3>
                  <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                     {item.ready ? 'Ready' : 'Pending'}
                  </p>
               </CardContent>
            </Card>
          ))}
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#0c1220] border border-white/5 p-1 rounded-xl mb-8">
            <TabsTrigger value="squad" className="rounded-lg px-6 py-2.5 font-medium data-[state=active]:bg-[#4f46e5] data-[state=active]:text-white">Squad Selection</TabsTrigger>
            <TabsTrigger value="transport" className="rounded-lg px-6 py-2.5 font-medium data-[state=active]:bg-[#4f46e5] data-[state=active]:text-white">Transport</TabsTrigger>
            <TabsTrigger value="grounds" className="rounded-lg px-6 py-2.5 font-medium data-[state=active]:bg-[#4f46e5] data-[state=active]:text-white">Facilities</TabsTrigger>
            <TabsTrigger value="readiness" className="rounded-lg px-6 py-2.5 font-medium data-[state=active]:bg-[#4f46e5] data-[state=active]:text-white">Readiness Dossier</TabsTrigger>
          </TabsList>

          <TabsContent value="squad" className="mt-0 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-[#0c1220] border-white/5 shadow-2xl">
                    <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                       <div className="flex items-center justify-between">
                         <div>
                           <CardTitle className="font-['Syne',sans-serif] text-xl">Available Squad</CardTitle>
                           <CardDescription>Select 11 starting players and up to 4 reserves</CardDescription>
                         </div>
                         <div className="flex items-center gap-4">
                            <Dialog open={newPlayerOpen} onOpenChange={setNewPlayerOpen}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-[#4f46e5] hover:text-[#4f46e5]/80 hover:bg-[#4f46e5]/5 gap-2">
                                  <UserPlus className="h-4 w-4" />
                                  Add New Player
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-[#0c1220] border-white/10 text-white">
                                <form onSubmit={handleAddPlayer}>
                                  <DialogHeader>
                                    <DialogTitle className="font-['Syne',sans-serif] text-xl">Add New Player</DialogTitle>
                                    <DialogDescription className="text-muted-foreground">
                                      Create a new player profile and add them to {homeTeam.name}.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" name="firstName" required className="bg-white/5 border-white/10" />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" name="lastName" required className="bg-white/5 border-white/10" />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="email">Email (Optional)</Label>
                                      <Input id="email" name="email" type="email" className="bg-white/5 border-white/10" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="battingStyle">Batting Style</Label>
                                        <Select name="battingStyle" defaultValue="Right Hand Bat">
                                          <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue placeholder="Select" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-[#0c1220] border-white/10 text-white">
                                            <SelectItem value="Right Hand Bat">Right Hand Bat</SelectItem>
                                            <SelectItem value="Left Hand Bat">Left Hand Bat</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="bowlingStyle">Bowling Style</Label>
                                        <Select name="bowlingStyle" defaultValue="Right Arm Fast Medium">
                                          <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue placeholder="Select" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-[#0c1220] border-white/10 text-white">
                                            <SelectItem value="Right Arm Fast">Right Arm Fast</SelectItem>
                                            <SelectItem value="Right Arm Medium">Right Arm Medium</SelectItem>
                                            <SelectItem value="Right Arm Off Spin">Right Arm Off Spin</SelectItem>
                                            <SelectItem value="Right Arm Leg Spin">Right Arm Leg Spin</SelectItem>
                                            <SelectItem value="Left Arm Fast">Left Arm Fast</SelectItem>
                                            <SelectItem value="Left Arm Orthrodox">Left Arm Orthrodox</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setNewPlayerOpen(false)} disabled={isAddingPlayer}>
                                      Cancel
                                    </Button>
                                    <Button type="submit" className="bg-[#4f46e5] hover:bg-[#4f46e5]/90" disabled={isAddingPlayer}>
                                      {isAddingPlayer ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                      Create Player
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>

                           <div className="flex gap-2">
                             <Badge variant="outline" className={`${selectedXIIds.length === 11 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-[#4f46e5]/10 text-[#4f46e5] border-[#4f46e5]/20'}`}>
                               {selectedXIIds.length} / 11 Selected
                             </Badge>
                             <Badge variant="outline" className={`${selectedReservesIds.length > 0 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-white/10 text-muted-foreground border-white/20'}`}>
                               {selectedReservesIds.length} / 4 Reserves
                             </Badge>
                           </div>
                         </div>
                       </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div 
                        onDragOver={(e) => handleDragOverZone(e, 'roster')}
                        onDrop={(e) => handleDropOnZone(e, 'roster')}
                        className={`divide-y divide-white/5 transition-colors ${dropTargetZone === 'roster' && dragSource !== 'roster' ? 'bg-indigo-500/5 ring-1 ring-inset ring-indigo-500/30' : ''}`}
                      >
                        {homePlayers.map((player: Person) => {
                          const isSelectedXI = selectedXIIds.includes(player.id);
                          const isSelectedReserve = selectedReservesIds.includes(player.id);
                          const isSelected = isSelectedXI || isSelectedReserve;
                          const availability = context.availability.find(a => a.personId === player.id);
                          const medicalEval = medicalReadinessService.calculatePlayerReadiness(player.id, (context as any).medicalIncidents || []);
                          const isMedicalRestricted = medicalEval.clearanceRequired || medicalEval.status === 'Unavailable' || player.status === 'injured';
                          const isUnavailable = availability?.status === 'unavailable' || isMedicalRestricted;
                          const isDraggingThis = draggedPlayerId === player.id;
                          
                          return (
                            <div 
                              key={player.id} 
                              draggable={!isUnavailable || isSelected}
                              onDragStart={(e) => handleDragStart(e, player.id, 'roster')}
                              onDragEnd={handleDragEnd}
                              onClick={() => setSelectedPlayerForInsight(player)}
                              className={`p-4 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer ${
                                isSelected ? 'bg-white/[0.02]' : ''
                              } ${
                                isUnavailable ? 'opacity-60' : ''
                              } ${
                                isDraggingThis ? 'opacity-30 border-2 border-dashed border-indigo-500' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3 md:gap-4">
                                 <div 
                                   className="cursor-grab active:cursor-grabbing p-1 text-white/20 hover:text-white/60 transition-colors"
                                   title="Drag to assign"
                                 >
                                    <GripVertical className="h-4 w-4" />
                                 </div>
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-['Syne',sans-serif] font-bold text-sm ${isSelected ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-[#101829] border border-white/10 text-muted-foreground'}`}>
                                    {player.firstName.charAt(0)}{player.lastName.charAt(0)}
                                 </div>
                                 <div>
                                   <div className="flex items-center gap-2">
                                     <h4 className="font-semibold text-[15px]">{player.firstName} {player.lastName}</h4>
                                     {isSelectedXI && <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase tracking-wider h-4 px-1">XI (#{selectedXIIds.indexOf(player.id) + 1})</Badge>}
                                     {isSelectedReserve && <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] uppercase tracking-wider h-4 px-1">Res (#{selectedReservesIds.indexOf(player.id) + 1})</Badge>}
                                     {medicalEval.clearanceRequired && (
                                       <Badge variant="destructive" className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] uppercase tracking-wider h-4 px-1">
                                         Clearance Required
                                       </Badge>
                                     )}
                                     {isUnavailable && !medicalEval.clearanceRequired && (
                                       <Badge variant="destructive" className="text-[9px] uppercase tracking-wider h-4 px-1">Unavailable</Badge>
                                     )}
                                   </div>
                                   <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium font-['DM_Mono',monospace]">
                                        {player.battingStyle || 'RHB'} • {player.bowlingStyle || 'RFM'} • Readiness: {medicalEval.score}%
                                      </span>
                                   </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (medicalEval.clearanceRequired && !isSelected) {
                                      toast.error(`Medical Clearance Required: ${player.firstName} ${player.lastName} requires medical sign-off before squad selection.`);
                                      return;
                                    }
                                    if (!isUnavailable || isSelected) {
                                      togglePlayerSelection(player);
                                    }
                                  }}
                                  variant={isSelected ? "outline" : "ghost"} 
                                  size="sm" 
                                  disabled={isUnavailable && !isSelected && !medicalEval.clearanceRequired}
                                  className={`${isSelected ? 'border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10' : 'opacity-0 group-hover:opacity-100 transition-opacity border border-white/10'}`}
                                >
                                  {isSelected ? 'Remove' : 'Add to XI'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        {homePlayers.length === 0 && (
                          <div className="p-8 text-center text-muted-foreground">
                            No eligible players found for this squad.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
               </div>
                               <div className="lg:col-span-1">
                  <Card className="bg-[#05080f] border-white/10 shadow-2xl sticky top-24">
                     <CardHeader className="pb-4 border-b border-white/5">
                        <CardTitle className="font-['Syne',sans-serif] text-lg flex items-center justify-between">
                           <span>Selected XI <span className="text-xs font-normal text-muted-foreground">(Drag to reorder)</span></span>
                           <Badge className="bg-[#4f46e5] text-white border-none">{selectedXIIds.length} / 11</Badge>
                        </CardTitle>
                     </CardHeader>
                     <CardContent 
                       onDragOver={(e) => handleDragOverZone(e, 'xi')}
                       onDrop={(e) => handleDropOnZone(e, 'xi')}
                       className={`p-0 transition-colors ${dropTargetZone === 'xi' ? 'bg-emerald-500/10 ring-2 ring-inset ring-emerald-500/40' : ''}`}
                     >
                        {selectedXI.length > 0 ? (
                          <div className="divide-y divide-white/5 max-h-[45vh] overflow-y-auto">
                            {selectedXI.map((player, index) => {
                              const isDraggingThis = draggedPlayerId === player.id;
                              return (
                                <div 
                                  key={player.id} 
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, player.id, 'xi')}
                                  onDragEnd={handleDragEnd}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (draggedPlayerId && dragSource === 'xi' && draggedPlayerId !== player.id) {
                                      const fromIdx = selectedXIIds.indexOf(draggedPlayerId);
                                      if (fromIdx !== -1 && fromIdx !== index) {
                                        movePlayerInList('xi', fromIdx, index);
                                      }
                                    }
                                  }}
                                  className={`p-3 flex items-center justify-between group hover:bg-white/5 transition-all ${
                                    isDraggingThis ? 'opacity-30 border-2 border-dashed border-emerald-500' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <GripVertical className="h-4 w-4 text-white/20 hover:text-white/60 cursor-grab active:cursor-grabbing flex-shrink-0" />
                                    <span className="text-[11px] font-bold text-emerald-400/80 w-5 flex-shrink-0 font-['DM_Mono',monospace]">#{index + 1}</span>
                                    <h5 className="text-sm font-medium truncate">{player.firstName} {player.lastName}</h5>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button
                                      onClick={() => index > 0 && movePlayerInList('xi', index, index - 1)}
                                      disabled={index === 0}
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-white/30 hover:text-white disabled:opacity-20"
                                      title="Move Up"
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      onClick={() => index < selectedXI.length - 1 && movePlayerInList('xi', index, index + 1)}
                                      disabled={index === selectedXI.length - 1}
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-white/30 hover:text-white disabled:opacity-20"
                                      title="Move Down"
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      onClick={() => setSelectedXIIds(prev => prev.filter(id => id !== player.id))}
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-opacity"
                                      title="Remove from XI"
                                    >
                                      ×
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center border-b border-dashed m-3 rounded-xl border-white/10">
                             <Users className="h-8 w-8 text-muted-foreground/30 mb-3" />
                             <h4 className="text-sm font-bold text-muted-foreground mb-1">Starting XI Empty</h4>
                             <p className="text-[10px] text-muted-foreground/70 max-w-[170px]">Drag players here or click &quot;Add to XI&quot; from the squad roster.</p>
                          </div>
                        )}

                        <div 
                          onDragOver={(e) => handleDragOverZone(e, 'reserves')}
                          onDrop={(e) => handleDropOnZone(e, 'reserves')}
                          className={`p-4 border-b border-white/5 bg-white/[0.01] transition-colors ${dropTargetZone === 'reserves' ? 'bg-amber-500/10 ring-2 ring-inset ring-amber-500/40' : ''}`}
                        >
                          <h4 className="font-['Syne',sans-serif] text-sm font-bold mb-3 flex items-center justify-between">
                            <span>Reserves Bench <span className="text-[10px] font-normal text-muted-foreground">(Drag to order)</span></span>
                            <Badge variant="outline" className="border-amber-500/30 text-amber-400">{selectedReservesIds.length} / 4</Badge>
                          </h4>
                          {selectedReserves.length > 0 ? (
                             <div className="space-y-1.5">
                               {selectedReserves.map((player, index) => (
                                 <div 
                                   key={player.id} 
                                   draggable
                                   onDragStart={(e) => handleDragStart(e, player.id, 'reserves')}
                                   onDragEnd={handleDragEnd}
                                   onDragOver={(e) => {
                                     e.preventDefault();
                                     e.stopPropagation();
                                     if (draggedPlayerId && dragSource === 'reserves' && draggedPlayerId !== player.id) {
                                       const fromIdx = selectedReservesIds.indexOf(draggedPlayerId);
                                       if (fromIdx !== -1 && fromIdx !== index) {
                                         movePlayerInList('reserves', fromIdx, index);
                                       }
                                     }
                                   }}
                                   className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 group transition-all"
                                 >
                                   <div className="flex items-center gap-2">
                                     <GripVertical className="h-3.5 w-3.5 text-white/20 hover:text-white/60 cursor-grab active:cursor-grabbing" />
                                     <span className="text-[10px] font-bold text-amber-400/80 font-['DM_Mono',monospace]">R{index + 1}</span>
                                     <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">{player.firstName} {player.lastName}</span>
                                   </div>
                                   <div className="flex items-center gap-1">
                                     <Button 
                                        onClick={() => setSelectedReservesIds(prev => prev.filter(id => id !== player.id))}
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-5 w-5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-amber-400 transition-opacity"
                                      >
                                        ×
                                      </Button>
                                   </div>
                                 </div>
                               ))}
                             </div>
                          ) : (
                            <p className="text-[10px] text-muted-foreground/50 italic text-center py-4 border border-dashed border-white/5 rounded-lg">
                              Drag players here for Reserves (Max 4)
                            </p>
                          )}
                        </div>
                     </CardContent>
                  </Card>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="transport" className="mt-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="bg-[#0c1220] border-white/5 shadow-2xl">
                 <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                   <CardTitle className="font-['Syne',sans-serif] text-xl flex items-center gap-2">
                     <Bus className="h-5 w-5 text-[#4f46e5]" />
                     Vehicle Assignment
                   </CardTitle>
                   <CardDescription>Manage transport for the match</CardDescription>
                 </CardHeader>
                 <CardContent className="p-6">
                    <div className="space-y-4">
                       <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                          <div className="flex gap-4">
                             <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <Bus className="h-6 w-6 text-emerald-400" />
                             </div>
                             <div>
                                <h4 className="font-bold text-sm">School Bus B-42</h4>
                                <p className="text-xs text-muted-foreground">Capacity: 22 players • Trip ID: T-8821</p>
                                <div className="flex items-center gap-2 mt-1">
                                   <Badge variant="outline" className="text-[8px] h-4 py-0 border-white/10 text-muted-foreground uppercase">Mercedes Sprinter</Badge>
                                </div>
                             </div>
                          </div>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-none">Assigned</Badge>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5">
                             <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">Departure</span>
                             <p className="text-sm font-bold">07:45 AM</p>
                             <p className="text-[10px] text-muted-foreground">Main Gate</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5">
                             <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">Return</span>
                             <p className="text-sm font-bold">17:30 PM</p>
                             <p className="text-[10px] text-muted-foreground">Estimated</p>
                          </div>
                       </div>

                       <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 border-dashed flex flex-col items-center justify-center py-6 text-center group hover:border-[#4f46e5]/30 transition-colors cursor-pointer">
                          <Plus className="h-6 w-6 text-muted-foreground mb-2 group-hover:text-[#4f46e5] transition-colors" />
                          <p className="text-xs text-muted-foreground font-medium">Add Secondary Vehicle</p>
                       </div>
                       
                       <Button variant="outline" className="w-full border-white/10 text-xs py-5 hover:bg-white/5 transition-colors">
                          Modify Trip Details
                       </Button>
                    </div>
                 </CardContent>
               </Card>

               <Card className="bg-[#0c1220] border-white/5 shadow-2xl">
                 <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                   <CardTitle className="font-['Syne',sans-serif] text-xl flex items-center gap-2">
                     <Users className="h-5 w-5 text-[#4f46e5]" />
                     Passenger Manifest
                   </CardTitle>
                   <CardDescription>Players and staff travelling</CardDescription>
                 </CardHeader>
                 <CardContent className="p-6">
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <div>
                             <p className="text-sm text-white/70 font-medium">{selectedXIIds.length + selectedReservesIds.length} players selected</p>
                             <p className="text-[10px] text-muted-foreground mt-0.5">Manifest automatically synced with squad</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] border-[#4f46e5]/30 bg-[#4f46e5]/5 text-[#4f46e5] uppercase tracking-tighter">Live Sync</Badge>
                       </div>
                       
                       <div className="grid grid-cols-1 gap-2">
                          {[...selectedXI, ...selectedReserves].slice(0, 4).map((player: Person) => (
                             <div key={player.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                   <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold">
                                      {player.firstName.charAt(0)}{player.lastName.charAt(0)}
                                   </div>
                                   <span className="text-xs font-medium">{player.firstName} {player.lastName}</span>
                                </div>
                                <Activity className="h-3 w-3 text-emerald-400" />
                             </div>
                          ))}
                          {(selectedXIIds.length + selectedReservesIds.length) > 4 && (
                             <p className="text-center text-[10px] text-muted-foreground pt-1">
                                + {(selectedXIIds.length + selectedReservesIds.length) - 4} more passengers
                             </p>
                          )}
                       </div>

                       <div className="pt-4 border-t border-white/5 flex gap-3">
                          <Button variant="ghost" size="sm" className="flex-1 text-xs h-9 px-3 border border-white/10 hover:bg-white/5 transition-colors">Export PDF</Button>
                          <Button variant="ghost" size="sm" className="flex-1 text-xs h-9 px-3 border border-white/10 hover:bg-white/5 transition-colors">Message All</Button>
                       </div>
                    </div>
                 </CardContent>
               </Card>
            </div>
          </TabsContent>

          <TabsContent value="grounds" className="mt-0 outline-none">
            <div className="space-y-6">
              <Card className="bg-[#0c1220] border-white/5 shadow-2xl overflow-hidden">
                 <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-['Syne',sans-serif] text-xl">Facility Readiness</CardTitle>
                      <CardDescription>Pitch and outfield status at {match.fieldId || 'Main Oval'}</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      Last Check: 08:30 AM
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
                     {[
                       { label: 'Pitch Preparation', status: 'In Progress', icon: MapPin, color: 'text-amber-400', bg: 'bg-amber-400/10', detail: 'Rolling in progress' },
                       { label: 'Outfield & Boundary', status: 'Ready', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', detail: 'Mowed & marked' },
                       { label: 'Equipment & Stumps', status: 'Ready', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10', detail: 'Ready at Pavilion' },
                     ].map((item, i) => (
                       <div key={i} className="p-8 hover:bg-white/[0.01] transition-colors group cursor-pointer">
                          <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                             <item.icon className={`h-6 w-6 ${item.color}`} />
                          </div>
                          <h4 className="font-['Syne',sans-serif] font-bold text-lg mb-1">{item.label}</h4>
                          <p className="text-xs text-muted-foreground mb-3">{item.detail}</p>
                          <div className="flex items-center gap-2">
                             <span className={`w-2 h-2 rounded-full ${item.status === 'Ready' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></span>
                             <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">{item.status}</p>
                          </div>
                       </div>
                     ))}
                  </div>
                  <div className="p-6 bg-white/[0.01] border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#101829] border border-white/10 flex items-center justify-center text-[10px] font-bold">GK</div>
                        <div>
                          <p className="text-xs font-semibold">George Khumalo</p>
                          <p className="text-[10px] text-muted-foreground">Lead Groundskeeper</p>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5 text-xs">View History</Button>
                        <Button size="sm" className="bg-[#4f46e5] text-white text-xs px-6">Approve Field</Button>
                     </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card className="bg-[#0c1220] border-white/5 shadow-2xl">
                    <CardHeader className="pb-3">
                       <CardTitle className="text-sm font-bold uppercase tracking-widest text-[#4f46e5]">Weather Forecast</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <Activity className="h-8 w-8 text-amber-400" />
                             <div>
                                <h4 className="text-2xl font-bold font-['Syne',sans-serif]">24°C</h4>
                                <p className="text-xs text-muted-foreground">Cloudy with 10% chance of rain</p>
                             </div>
                          </div>
                          <Badge variant="outline" className="border-white/10 text-emerald-400">Perfect for Cricket</Badge>
                       </div>
                    </CardContent>
                 </Card>
                 
                 <Card className="bg-[#0c1220] border-white/5 shadow-2xl">
                    <CardHeader className="pb-3">
                       <CardTitle className="text-sm font-bold uppercase tracking-widest text-[#4f46e5]">Field Conflict Alert</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                             <AlertCircle className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                             <h4 className="text-sm font-bold">U13A Warmup</h4>
                             <p className="text-xs text-muted-foreground">08:00 - 08:30 • Restricted to Outfield</p>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="readiness" className="mt-0 outline-none">
            <MatchReadinessDossier fixtureId={match.id} />
          </TabsContent>
        </Tabs>

      </main>
      <PlayerInsightSidebar />
    </div>
  );
}
