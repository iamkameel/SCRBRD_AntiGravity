"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Person } from "@/types/firestore";
import { PlayerCard } from "./player-card";
import { AvailabilityStatusCard } from "./availability-status-card";
import { Users, TrendingUp, Target, Save, RotateCcw, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface LineupManagerProps {
  matchId: string;
  teamId: string;
  teamName: string;
  players: Person[];
  onSaveLineup?: (lineup: LineupData) => Promise<void>;
}

interface LineupData {
  battingOrder: string[]; // Player IDs in batting order
  bowlingRotation: string[]; // Bowler IDs in rotation
  wicketkeeper?: string;
  captain?: string;
  viceCaptain?: string;
}

export function LineupManager({
  matchId,
  teamId,
  teamName,
  players,
  onSaveLineup
}: LineupManagerProps) {
  const [activeTab, setActiveTab] = useState<"batting" | "bowling" | "roles">("batting");
  const [battingOrder, setBattingOrder] = useState<Person[]>([]);
  const [bowlingRotation, setBowlingRotation] = useState<Person[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Person[]>(players);
  const [captain, setCaptain] = useState<string | null>(null);
  const [viceCaptain, setViceCaptain] = useState<string | null>(null);
  const [wicketkeeper, setWicketkeeper] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter players based on availability
  useEffect(() => {
    const available = players.filter(p => p.status === 'active');
    setAvailablePlayers(available);
  }, [players]);

  // Calculate availability stats
  const availabilityStats = {
    available: players.filter(p => p.status === 'active').length,
    unavailable: players.filter(p => p.status === 'inactive').length,
    injured: players.filter(p => p.status === 'injured').length,
    doubtful: 0,
    pending: 0,
    total: players.length
  };

  // Handle drag and drop for batting order
  const handleBattingDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(battingOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBattingOrder(items);
  };

  // Handle drag and drop for bowling rotation
  const handleBowlingDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(bowlingRotation);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBowlingRotation(items);
  };

  // Add player to batting order
  const addToBattingOrder = (player: Person) => {
    if (battingOrder.length >= 11) return;
    if (battingOrder.find(p => p.id === player.id)) return;
    
    setBattingOrder([...battingOrder, player]);
  };

  // Remove from batting order
  const removeFromBattingOrder = (playerId: string) => {
    setBattingOrder(battingOrder.filter(p => p.id !== playerId));
  };

  // Add to bowling rotation
  const addToBowlingRotation = (player: Person) => {
    if (bowlingRotation.find(p => p.id === player.id)) return;
    
    const isBowler = player.bowlingStyle || player.playingRole?.includes('Bowler') || player.playingRole?.includes('AllRounder');
    if (!isBowler) return;

    setBowlingRotation([...bowlingRotation, player]);
  };

  // Remove from bowling rotation
  const removeFromBowlingRotation = (playerId: string) => {
    setBowlingRotation(bowlingRotation.filter(p => p.id !== playerId));
  };

  // Save lineup
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const lineupData: LineupData = {
        battingOrder: battingOrder.map(p => p.id),
        bowlingRotation: bowlingRotation.map(p => p.id),
        wicketkeeper: wicketkeeper || undefined,
        captain: captain || undefined,
        viceCaptain: viceCaptain || undefined
      };
      
      await onSaveLineup?.(lineupData);
    } catch (error) {
      console.error('Error saving lineup:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset lineup
  const handleReset = () => {
    setBattingOrder([]);
    setBowlingRotation([]);
    setCaptain(null);
    setViceCaptain(null);
    setWicketkeeper(null);
  };

  const bowlers = availablePlayers.filter(p => 
    p.bowlingStyle || p.playingRole?.includes('Bowler') || p.playingRole?.includes('AllRounder')
  );

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <AvailabilityStatusCard
        teamName={teamName}
        stats={availabilityStats}
        variant="compact"
      />

      {/* Tabs */}
      <Card className="p-2">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={activeTab === "batting" ? "default" : "ghost"}
            onClick={() => setActiveTab("batting")}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Batting Order
            <Badge variant="secondary" className="ml-auto">
              {battingOrder.length}/11
            </Badge>
          </Button>
          <Button
            variant={activeTab === "bowling" ? "default" : "ghost"}
            onClick={() => setActiveTab("bowling")}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Bowling
            <Badge variant="secondary" className="ml-auto">
              {bowlingRotation.length}
            </Badge>
          </Button>
          <Button
            variant={activeTab === "roles" ? "default" : "ghost"}
            onClick={() => setActiveTab("roles")}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Roles
          </Button>
        </div>
      </Card>

      {/* Batting Order Tab */}
      {activeTab === "batting" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Batting Order List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Batting Order</h3>
              <Badge variant={battingOrder.length === 11 ? "default" : "secondary"}>
                {battingOrder.length}/11 Selected
              </Badge>
            </div>

            <DragDropContext onDragEnd={handleBattingDragEnd}>
              <Droppable droppableId="batting-order">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2 min-h-[200px]"
                  >
                    {battingOrder.map((player, index) => (
                      <Draggable key={player.id} draggableId={player.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "flex items-center gap-3 p-3 bg-muted/30 rounded-lg border-2",
                              snapshot.isDragging ? "border-primary shadow-lg" : "border-transparent"
                            )}
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">{player.firstName} {player.lastName}</div>
                              <div className="text-xs text-muted-foreground">{player.playingRole || player.role}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromBattingOrder(player.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {battingOrder.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No players selected</p>
                        <p className="text-sm mt-1">Select players from the right panel</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Card>

          {/* Available Players */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Available Players</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {availablePlayers
                .filter(p => !battingOrder.find(b => b.id === p.id))
                .map(player => (
                  <div key={player.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{player.firstName} {player.lastName}</div>
                      <div className="text-xs text-muted-foreground">{player.playingRole || player.role}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToBattingOrder(player)}
                      disabled={battingOrder.length >= 11}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}

      {/* Bowling Rotation Tab */}
      {activeTab === "bowling" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bowling Rotation List */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Bowling Rotation</h3>

            <DragDropContext onDragEnd={handleBowlingDragEnd}>
              <Droppable droppableId="bowling-rotation">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2 min-h-[200px]"
                  >
                    {bowlingRotation.map((player, index) => (
                      <Draggable key={player.id} draggableId={player.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "flex items-center gap-3 p-3 bg-muted/30 rounded-lg border-2",
                              snapshot.isDragging ? "border-primary shadow-lg" : "border-transparent"
                            )}
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">{player.firstName} {player.lastName}</div>
                              <div className="text-xs text-muted-foreground">{player.bowlingStyle}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromBowlingRotation(player.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {bowlingRotation.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No bowlers selected</p>
                        <p className="text-sm mt-1">Select bowlers from the right panel</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Card>

          {/* Available Bowlers */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Available Bowlers</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {bowlers
                .filter(p => !bowlingRotation.find(b => b.id === p.id))
                .map(player => (
                  <div key={player.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{player.firstName} {player.lastName}</div>
                      <div className="text-xs text-muted-foreground">{player.bowlingStyle}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToBowlingRotation(player)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === "roles" && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Team Roles</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Captain */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Captain</label>
              <select
                value={captain || ""}
                onChange={(e) => setCaptain(e.target.value || null)}
                className="w-full p-2 border rounded-lg bg-background"
              >
                <option value="">Select Captain</option>
                {battingOrder.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.firstName} {player.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Vice Captain */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Vice Captain</label>
              <select
                value={viceCaptain || ""}
                onChange={(e) => setViceCaptain(e.target.value || null)}
                className="w-full p-2 border rounded-lg bg-background"
              >
                <option value="">Select Vice Captain</option>
                {battingOrder.filter(p => p.id !== captain).map(player => (
                  <option key={player.id} value={player.id}>
                    {player.firstName} {player.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Wicketkeeper */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Wicketkeeper</label>
              <select
                value={wicketkeeper || ""}
                onChange={(e) => setWicketkeeper(e.target.value || null)}
                className="w-full p-2 border rounded-lg bg-background"
              >
                <option value="">Select Wicketkeeper</option>
                {battingOrder.filter(p => 
                  p.playingRole?.includes('Wicketkeeper') || p.primaryFieldingPosition?.toLowerCase().includes('keeper')
                ).map(player => (
                  <option key={player.id} value={player.id}>
                    {player.firstName} {player.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {battingOrder.length}/11 players selected
            </div>
            <Button
              onClick={handleSave}
              disabled={battingOrder.length === 0 || isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Lineup
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
