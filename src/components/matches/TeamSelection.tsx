"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Plus, X, User, Shield } from "lucide-react";
import { toast } from "sonner";

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
  const [playingXI, setPlayingXI] = useState<string[]>(initialSelection);
  const [reserves, setReserves] = useState<string[]>(initialReserves);
  const [captain, setCaptain] = useState<string>(initialCaptain);
  const [viceCaptain, setViceCaptain] = useState<string>(initialViceCaptain);

  const handlePlayerToggle = (playerId: string) => {
    if (isReadOnly) return;

    if (playingXI.includes(playerId)) {
      setPlayingXI(prev => prev.filter(id => id !== playerId));
      if (captain === playerId) setCaptain("");
      if (viceCaptain === playerId) setViceCaptain("");
    } else if (reserves.includes(playerId)) {
      setReserves(prev => prev.filter(id => id !== playerId));
    } else {
      if (playingXI.length < 11) {
        setPlayingXI(prev => [...prev, playerId]);
      } else if (reserves.length < 4) {
        setReserves(prev => [...prev, playerId]);
      } else {
        toast.error("Squad limits reached (11 Playing + 4 Reserves)");
      }
    }
  };

  const moveToReserves = (playerId: string) => {
    if (isReadOnly) return;
    setPlayingXI(prev => prev.filter(id => id !== playerId));
    setReserves(prev => [...prev, playerId]);
    if (captain === playerId) setCaptain("");
    if (viceCaptain === playerId) setViceCaptain("");
  };

  const moveToPlaying = (playerId: string) => {
    if (isReadOnly) return;
    if (playingXI.length >= 11) {
      toast.error("Playing XI is full");
      return;
    }
    setReserves(prev => prev.filter(id => id !== playerId));
    setPlayingXI(prev => [...prev, playerId]);
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

  const getPlayer = (id: string) => squad.find(p => p.id === id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{teamName} Selection</h3>
          <p className="text-sm text-muted-foreground">
            Select 11 players and up to 4 reserves
          </p>
        </div>
        {!isReadOnly && (
          <Button onClick={handleSave} disabled={playingXI.length !== 11 || !captain}>
            Confirm Team
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Playing XI */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Playing XI
              <Badge variant={playingXI.length === 11 ? "default" : "outline"}>
                {playingXI.length}/11
              </Badge>
            </h4>
          </div>
          
          <div className="space-y-2">
            {playingXI.map((playerId, index) => {
              const player = getPlayer(playerId);
              if (!player) return null;
              
              return (
                <div key={playerId} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={player.profileImageUrl} />
                      <AvatarFallback>{player.firstName[0]}{player.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {player.firstName} {player.lastName}
                      </p>
                      <div className="flex gap-1 mt-0.5">
                        {captain === playerId && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1">C</Badge>
                        )}
                        {viceCaptain === playerId && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1">VC</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {!isReadOnly && (
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => setCaptain(captain === playerId ? "" : playerId)}
                        title="Set Captain"
                      >
                        <span className={`text-xs font-bold ${captain === playerId ? "text-primary" : "text-muted-foreground"}`}>C</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => setViceCaptain(viceCaptain === playerId ? "" : playerId)}
                        title="Set Vice Captain"
                      >
                        <span className={`text-xs font-bold ${viceCaptain === playerId ? "text-primary" : "text-muted-foreground"}`}>VC</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => moveToReserves(playerId)}
                        title="Move to Reserves"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            
            {playingXI.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-md">
                Select players from the squad list
              </div>
            )}
          </div>
        </Card>

        {/* Squad & Reserves */}
        <div className="space-y-4">
          {/* Reserves */}
          <Card className="p-4 bg-muted/30">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Reserves
              <Badge variant="outline">{reserves.length}/4</Badge>
            </h4>
            <div className="space-y-2">
              {reserves.map(playerId => {
                const player = getPlayer(playerId);
                if (!player) return null;
                
                return (
                  <div key={playerId} className="flex items-center justify-between p-2 rounded-md bg-background border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={player.profileImageUrl} />
                        <AvatarFallback>{player.firstName[0]}{player.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{player.firstName} {player.lastName}</span>
                    </div>
                    {!isReadOnly && (
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-green-600"
                          onClick={() => moveToPlaying(playerId)}
                          title="Promote to Playing XI"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground"
                          onClick={() => setReserves(prev => prev.filter(id => id !== playerId))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
              {reserves.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No reserves selected</p>
              )}
            </div>
          </Card>

          {/* Available Squad */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Available Squad</h4>
            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
              {squad
                .filter(p => !playingXI.includes(p.id) && !reserves.includes(p.id))
                .map(player => (
                  <div 
                    key={player.id} 
                    className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                      player.eligibility?.isEligible === false 
                        ? 'opacity-50 cursor-not-allowed bg-muted/20' 
                        : 'hover:bg-muted cursor-pointer'
                    }`}
                    onClick={() => {
                      if (player.eligibility?.isEligible !== false) {
                        handlePlayerToggle(player.id);
                      } else {
                        toast.error(player.eligibility.reason || "Player is not eligible for this division");
                      }
                    }}
                    title={player.eligibility?.reason}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={player.profileImageUrl} />
                        <AvatarFallback>{player.firstName[0]}{player.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={`text-sm font-medium ${player.eligibility?.isEligible === false ? 'line-through text-muted-foreground' : ''}`}>{player.firstName} {player.lastName}</p>
                        <p className="text-xs text-muted-foreground">{player.role || 'Player'}</p>
                      </div>
                    </div>
                    {!isReadOnly && (
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
