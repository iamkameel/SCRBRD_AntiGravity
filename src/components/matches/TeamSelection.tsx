"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  X, 
  User, 
  Shield, 
  GripVertical, 
  Sparkles, 
  Search, 
  RotateCcw, 
  Wand2, 
  Crown, 
  Star,
  CheckCircle2,
  ArrowRightLeft,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  role?: string;
  profileImageUrl?: string;
  eligibility?: {
    isEligible: boolean;
    reason?: string;
  };
}

interface TeamSelectionProps {
  teamName: string;
  squad: Player[];
  initialSelection?: string[];
  initialReserves?: string[];
  initialCaptain?: string;
  initialViceCaptain?: string;
  isReadOnly?: boolean;
  onSave?: (selection: {
    playingXI: string[];
    reserves: string[];
    captain: string;
    viceCaptain?: string;
  }) => void;
}

export function TeamSelection({
  teamName,
  squad,
  initialSelection = [],
  initialReserves = [],
  initialCaptain = "",
  initialViceCaptain = "",
  isReadOnly = false,
  onSave
}: TeamSelectionProps) {
  const [playingXI, setPlayingXI] = useState<string[]>(
    initialSelection.length > 0 ? initialSelection : squad.slice(0, 11).map(p => p.id)
  );
  const [reserves, setReserves] = useState<string[]>(
    initialReserves.length > 0 ? initialReserves : squad.slice(11, 15).map(p => p.id)
  );
  const [captain, setCaptain] = useState<string>(initialCaptain || (squad[0]?.id || ""));
  const [viceCaptain, setViceCaptain] = useState<string>(initialViceCaptain || (squad[1]?.id || ""));

  // Drag and drop state
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [dragSourceZone, setDragSourceZone] = useState<'xi' | 'reserves' | 'squad' | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<'xi' | 'reserves' | 'squad' | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getPlayer = (id: string) => squad.find(p => p.id === id);

  // Available squad filtered by search query
  const availableSquad = squad
    .filter(p => !playingXI.includes(p.id) && !reserves.includes(p.id))
    .filter(p => {
      if (!searchQuery.trim()) return true;
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const role = (p.role || '').toLowerCase();
      return fullName.includes(searchQuery.toLowerCase()) || role.includes(searchQuery.toLowerCase());
    });

  // DRAG & DROP HANDLERS
  const handleDragStart = (e: React.DragEvent, playerId: string, sourceZone: 'xi' | 'reserves' | 'squad') => {
    if (isReadOnly) return;
    e.dataTransfer.setData("text/plain", playerId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedPlayerId(playerId);
    setDragSourceZone(sourceZone);
  };

  const handleDragOver = (e: React.DragEvent, targetZone: 'xi' | 'reserves' | 'squad') => {
    e.preventDefault();
    if (isReadOnly) return;
    e.dataTransfer.dropEffect = "move";
    if (activeDropZone !== targetZone) {
      setActiveDropZone(targetZone);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only reset if moving outside container
    const currentTarget = e.currentTarget;
    const relatedTarget = e.relatedTarget as Node | null;
    if (!currentTarget.contains(relatedTarget)) {
      setActiveDropZone(null);
    }
  };

  const handleDropOnZone = (e: React.DragEvent, targetZone: 'xi' | 'reserves' | 'squad') => {
    e.preventDefault();
    setActiveDropZone(null);
    if (isReadOnly) return;

    const playerId = e.dataTransfer.getData("text/plain") || draggedPlayerId;
    if (!playerId) return;

    const player = getPlayer(playerId);
    if (player?.eligibility?.isEligible === false) {
      toast.error(player.eligibility.reason || "Player is not eligible for this division");
      return;
    }

    movePlayerToZone(playerId, targetZone);
    setDraggedPlayerId(null);
    setDragSourceZone(null);
  };

  const handleDropOnPlayerXI = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropZone(null);
    if (isReadOnly) return;

    const playerId = e.dataTransfer.getData("text/plain") || draggedPlayerId;
    if (!playerId) return;

    const player = getPlayer(playerId);
    if (player?.eligibility?.isEligible === false) {
      toast.error(player.eligibility.reason || "Player is not eligible");
      return;
    }

    const currentIdx = playingXI.indexOf(playerId);
    if (currentIdx !== -1) {
      // Reorder within Playing XI
      const newXI = [...playingXI];
      newXI.splice(currentIdx, 1);
      newXI.splice(targetIndex, 0, playerId);
      setPlayingXI(newXI);
      toast.info("Reordered Playing XI sequence");
    } else {
      // Move from Reserves or Squad to XI position
      if (reserves.includes(playerId)) {
        setReserves(prev => prev.filter(id => id !== playerId));
      }

      if (playingXI.length >= 11 && !playingXI.includes(playerId)) {
        // Swap with player at targetIndex
        const newXI = [...playingXI];
        const displacedId = newXI[targetIndex];
        newXI[targetIndex] = playerId;
        setPlayingXI(newXI);

        if (displacedId) {
          // Push displaced player to reserves or squad
          if (reserves.length < 4) {
            setReserves(prev => [...prev, displacedId]);
            toast.info(`Swapped with ${getPlayer(displacedId)?.firstName} (moved to reserves)`);
          } else {
            toast.info(`Swapped with ${getPlayer(displacedId)?.firstName}`);
          }
          if (captain === displacedId) setCaptain("");
          if (viceCaptain === displacedId) setViceCaptain("");
        }
      } else {
        const newXI = [...playingXI];
        newXI.splice(targetIndex, 0, playerId);
        setPlayingXI(newXI);
        toast.success(`Added ${player?.firstName || 'Player'} to Playing XI`);
      }
    }
    setDraggedPlayerId(null);
    setDragSourceZone(null);
  };

  const movePlayerToZone = (playerId: string, targetZone: 'xi' | 'reserves' | 'squad') => {
    const isInXI = playingXI.includes(playerId);
    const isInReserves = reserves.includes(playerId);
    const player = getPlayer(playerId);

    if (targetZone === 'xi') {
      if (isInXI) return;
      if (playingXI.length >= 11) {
        toast.error("Playing XI is full (11 players max)");
        return;
      }
      if (isInReserves) setReserves(prev => prev.filter(id => id !== playerId));
      setPlayingXI(prev => [...prev, playerId]);
      toast.success(`${player?.firstName} added to Playing XI`);
    } else if (targetZone === 'reserves') {
      if (isInReserves) return;
      if (reserves.length >= 4) {
        toast.error("Reserves bench is full (4 players max)");
        return;
      }
      if (isInXI) {
        setPlayingXI(prev => prev.filter(id => id !== playerId));
        if (captain === playerId) setCaptain("");
        if (viceCaptain === playerId) setViceCaptain("");
      }
      setReserves(prev => [...prev, playerId]);
      toast.success(`${player?.firstName} moved to Reserves`);
    } else if (targetZone === 'squad') {
      if (isInXI) {
        setPlayingXI(prev => prev.filter(id => id !== playerId));
        if (captain === playerId) setCaptain("");
        if (viceCaptain === playerId) setViceCaptain("");
      }
      if (isInReserves) setReserves(prev => prev.filter(id => id !== playerId));
      toast.info(`${player?.firstName} returned to Available Squad`);
    }
  };

  // QUICK ACTIONS
  const handleAutoFill = () => {
    if (isReadOnly) return;
    const eligibleSquad = squad.filter(p => p.eligibility?.isEligible !== false);
    const xi = eligibleSquad.slice(0, 11).map(p => p.id);
    const res = eligibleSquad.slice(11, 15).map(p => p.id);

    setPlayingXI(xi);
    setReserves(res);
    if (xi.length > 0 && !captain) setCaptain(xi[0]);
    if (xi.length > 1 && !viceCaptain) setViceCaptain(xi[1]);

    toast.success("Auto-filled team with top 11 Playing XI & 4 Reserves!");
  };

  const handleClearSelection = () => {
    if (isReadOnly) return;
    setPlayingXI([]);
    setReserves([]);
    setCaptain("");
    setViceCaptain("");
    toast.info("Cleared selection");
  };

  const handleSave = () => {
    if (playingXI.length !== 11) {
      toast.error("You must select exactly 11 players for the Playing XI");
      return;
    }
    if (!captain) {
      toast.error("You must select a Captain");
      return;
    }
    
    onSave?.({
      playingXI,
      reserves,
      captain,
      viceCaptain: viceCaptain || undefined
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10">
        <div>
          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            {teamName} Selection
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Drag & drop players between zones to assemble your matchday lineup
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAutoFill}
              className="text-xs border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 gap-1.5"
            >
              <Wand2 className="h-3.5 w-3.5 text-emerald-400" />
              Auto-Fill Top 11
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearSelection}
              className="text-xs text-slate-400 hover:text-white gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={playingXI.length !== 11 || !captain}
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 text-xs font-bold gap-1.5 px-4"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm Lineup
            </Button>
          </div>
        )}
      </div>

      {/* 3-Column Fluid Drag & Drop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMN 1: PLAYING XI (7 Cols on desktop) */}
        <div className="lg:col-span-7">
          <Card 
            onDragOver={(e) => handleDragOver(e, 'xi')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDropOnZone(e, 'xi')}
            className={cn(
              "p-5 glass-card transition-all duration-300 border bg-slate-900/70 backdrop-blur-xl relative overflow-hidden",
              activeDropZone === 'xi' 
                ? "border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-950/20 scale-[1.005]" 
                : "border-white/10 hover:border-white/20"
            )}
          >
            {/* Ambient indicator */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    Playing XI
                    <Badge 
                      variant={playingXI.length === 11 ? "default" : "outline"} 
                      className={cn(
                        "text-xs font-semibold px-2 py-0.5",
                        playingXI.length === 11 
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" 
                          : "text-amber-300 border-amber-500/40 bg-amber-500/10"
                      )}
                    >
                      {playingXI.length}/11 Selected
                    </Badge>
                  </h4>
                  <p className="text-[11px] text-slate-400">Matchday starting team (Drag to reorder sequence)</p>
                </div>
              </div>

              {playingXI.length === 11 && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Ready
                </div>
              )}
            </div>

            {/* List of 11 XI Slots */}
            <div className="space-y-2">
              {Array.from({ length: 11 }).map((_, index) => {
                const playerId = playingXI[index];
                const player = playerId ? getPlayer(playerId) : null;
                const isCaptain = captain === playerId;
                const isViceCaptain = viceCaptain === playerId;

                return (
                  <div
                    key={playerId || `empty-xi-${index}`}
                    onDragOver={(e) => handleDragOver(e, 'xi')}
                    onDrop={(e) => handleDropOnPlayerXI(e, index)}
                    className={cn(
                      "group flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 border",
                      player ? (
                        draggedPlayerId === playerId 
                          ? "opacity-40 border-dashed border-emerald-400 bg-emerald-950/20"
                          : "bg-slate-800/60 border-slate-700/60 hover:border-emerald-500/40 hover:bg-slate-800"
                      ) : (
                        "border-dashed border-slate-800 bg-slate-950/30 text-slate-600"
                      )
                    )}
                  >
                    {player ? (
                      <>
                        <div className="flex items-center gap-3">
                          {!isReadOnly && (
                            <div 
                              draggable
                              onDragStart={(e) => handleDragStart(e, player.id, 'xi')}
                              className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-emerald-400 transition-colors p-1"
                              title="Drag to reorder or move player"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                          )}

                          <span className="text-xs font-mono font-bold text-slate-400 w-5 text-center">
                            {index + 1}
                          </span>

                          <Avatar className="h-8 w-8 border border-white/10 shadow-sm">
                            <AvatarImage src={player.profileImageUrl} />
                            <AvatarFallback className="bg-emerald-950 text-emerald-300 font-bold text-xs">
                              {player.firstName[0]}{player.lastName[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                                {player.firstName} {player.lastName}
                              </p>

                              {isCaptain && (
                                <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] h-4 px-1.5 font-black flex items-center gap-0.5">
                                  <Crown className="h-2.5 w-2.5 text-amber-400" />
                                  C
                                </Badge>
                              )}
                              {isViceCaptain && (
                                <Badge variant="outline" className="border-blue-500/40 text-blue-300 bg-blue-500/10 text-[10px] h-4 px-1.5 font-black flex items-center gap-0.5">
                                  <Star className="h-2.5 w-2.5 text-blue-400" />
                                  VC
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">{player.role || 'Player'}</p>
                          </div>
                        </div>

                        {!isReadOnly && (
                          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={cn(
                                "h-7 px-2 text-xs font-bold transition-all",
                                isCaptain 
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                                  : "text-slate-400 hover:text-amber-300 hover:bg-amber-500/10"
                              )}
                              onClick={() => setCaptain(isCaptain ? "" : player.id)}
                              title="Toggle Captain"
                            >
                              C
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={cn(
                                "h-7 px-2 text-xs font-bold transition-all",
                                isViceCaptain 
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" 
                                  : "text-slate-400 hover:text-blue-300 hover:bg-blue-500/10"
                              )}
                              onClick={() => setViceCaptain(isViceCaptain ? "" : player.id)}
                              title="Toggle Vice Captain"
                            >
                              VC
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"
                              onClick={() => movePlayerToZone(player.id, 'reserves')}
                              title="Move to Reserves"
                            >
                              <ArrowRightLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                              onClick={() => movePlayerToZone(player.id, 'squad')}
                              title="Remove to Available Squad"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-3 w-full py-1 text-slate-500 text-xs">
                        <span className="font-mono font-bold w-5 text-center">{index + 1}</span>
                        <div className="h-7 w-7 rounded-full border border-dashed border-slate-800 flex items-center justify-center">
                          <Plus className="h-3.5 w-3.5 text-slate-700" />
                        </div>
                        <span className="italic">Empty Slot {index + 1} — Drop player here</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* COLUMN 2 & 3: RESERVES & AVAILABLE SQUAD (5 Cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* RESERVES BOX */}
          <Card 
            onDragOver={(e) => handleDragOver(e, 'reserves')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDropOnZone(e, 'reserves')}
            className={cn(
              "p-4 glass-card transition-all duration-300 border bg-slate-900/70 backdrop-blur-xl relative overflow-hidden",
              activeDropZone === 'reserves' 
                ? "border-amber-500 ring-2 ring-amber-500/30 bg-amber-950/20 scale-[1.005]" 
                : "border-white/10 hover:border-white/20"
            )}
          >
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    Reserves
                    <Badge variant="outline" className="text-amber-300 border-amber-500/40 bg-amber-500/10 text-xs">
                      {reserves.length}/4
                    </Badge>
                  </h4>
                  <p className="text-[11px] text-slate-400">Matchday bench replacements</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {reserves.map((playerId, idx) => {
                const player = getPlayer(playerId);
                if (!player) return null;

                return (
                  <div 
                    key={playerId}
                    className={cn(
                      "group flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 transition-all",
                      draggedPlayerId === playerId && "opacity-40 border-dashed border-amber-400"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      {!isReadOnly && (
                        <div 
                          draggable
                          onDragStart={(e) => handleDragStart(e, player.id, 'reserves')}
                          className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-amber-400 p-0.5"
                          title="Drag player"
                        >
                          <GripVertical className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <span className="text-[10px] font-mono font-bold text-slate-400 w-4">R{idx + 1}</span>
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={player.profileImageUrl} />
                        <AvatarFallback className="bg-amber-950 text-amber-300 text-xs font-bold">
                          {player.firstName[0]}{player.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold text-white">{player.firstName} {player.lastName}</p>
                        <p className="text-[10px] text-slate-400">{player.role || 'Reserve'}</p>
                      </div>
                    </div>

                    {!isReadOnly && (
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-emerald-400 hover:bg-emerald-500/10"
                          onClick={() => movePlayerToZone(player.id, 'xi')}
                          title="Promote to Playing XI"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                          onClick={() => movePlayerToZone(player.id, 'squad')}
                          title="Remove to Squad"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}

              {reserves.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
                  Drag & drop players here to add to reserves (max 4)
                </div>
              )}
            </div>
          </Card>

          {/* AVAILABLE SQUAD BOX */}
          <Card 
            onDragOver={(e) => handleDragOver(e, 'squad')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDropOnZone(e, 'squad')}
            className={cn(
              "p-4 glass-card transition-all duration-300 border bg-slate-900/70 backdrop-blur-xl relative overflow-hidden",
              activeDropZone === 'squad' 
                ? "border-blue-500 ring-2 ring-blue-500/30 bg-blue-950/20 scale-[1.005]" 
                : "border-white/10 hover:border-white/20"
            )}
          >
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  Available Squad
                  <Badge variant="outline" className="text-blue-300 border-blue-500/40 bg-blue-500/10 text-xs">
                    {availableSquad.length} Available
                  </Badge>
                </h4>
                <p className="text-[11px] text-slate-400">Full squad roster</p>
              </div>
            </div>

            {/* Filter Input */}
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search player name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {availableSquad.map((player) => {
                const isEligible = player.eligibility?.isEligible !== false;

                return (
                  <div
                    key={player.id}
                    draggable={!isReadOnly && isEligible}
                    onDragStart={(e) => handleDragStart(e, player.id, 'squad')}
                    className={cn(
                      "group flex items-center justify-between p-2 rounded-lg transition-all border",
                      isEligible
                        ? draggedPlayerId === player.id
                          ? "opacity-40 border-dashed border-blue-400"
                          : "bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/80 hover:border-blue-500/40 cursor-grab active:cursor-grabbing"
                        : "opacity-50 bg-slate-950/20 border-slate-900 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      {!isReadOnly && isEligible && (
                        <GripVertical className="h-3.5 w-3.5 text-slate-600 group-hover:text-blue-400" />
                      )}
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={player.profileImageUrl} />
                        <AvatarFallback className="bg-slate-800 text-slate-300 text-xs font-bold">
                          {player.firstName[0]}{player.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={cn("text-xs font-semibold", isEligible ? "text-white" : "line-through text-slate-500")}>
                          {player.firstName} {player.lastName}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          {player.role || 'Player'}
                          {!isEligible && (
                            <span className="text-amber-400 flex items-center gap-0.5" title={player.eligibility?.reason}>
                              <AlertTriangle className="h-2.5 w-2.5" />
                              Ineligible
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {!isReadOnly && isEligible && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/10"
                          onClick={() => movePlayerToZone(player.id, 'xi')}
                          title="Add to Playing XI"
                        >
                          + XI
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px] font-bold text-amber-400 hover:bg-amber-500/10"
                          onClick={() => movePlayerToZone(player.id, 'reserves')}
                          title="Add to Reserves"
                        >
                          + Res
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}

              {availableSquad.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
                  {searchQuery ? "No matching players found" : "All squad members selected!"}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
