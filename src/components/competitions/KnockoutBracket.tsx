"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

export interface BracketMatchTeam {
  id: string;
  name: string;
  score?: number | string;
  winner?: boolean;
}

export interface BracketMatch {
  id: string;
  team1: BracketMatchTeam;
  team2: BracketMatchTeam;
  date?: string;
  status: "pending" | "live" | "completed";
}

export interface BracketRound {
  title: string;
  matches: BracketMatch[];
}

interface KnockoutBracketProps {
  rounds: BracketRound[];
}

export function KnockoutBracket({ rounds }: KnockoutBracketProps) {
  return (
    <div className="flex overflow-x-auto pb-8 custom-scrollbar relative min-h-[500px]">
      <div className="flex justify-start items-center gap-16 min-w-max px-4">
        {rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="flex flex-col flex-1 shrink-0 w-[280px]">
            <div className="text-center mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground bg-muted/30 py-2 rounded-lg border border-border/50">
                {round.title}
              </h3>
            </div>
            
            <div className="flex flex-col justify-around flex-1 relative gap-6">
              {round.matches.map((match, matchIndex) => {
                const isFinal = roundIndex === rounds.length - 1;
                const showConnectors = !isFinal;

                return (
                  <div key={match.id} className="relative flex items-center h-full">
                    {/* The Match Card */}
                    <Card className={`w-full z-10 transition-shadow ${match.status === 'live' ? 'border-primary shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'border-border/50'}`}>
                      <CardContent className="p-0">
                        {/* Status Bar */}
                        <div className="flex justify-between items-center px-4 py-2 border-b border-border/50 bg-muted/10">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                            {match.date || "TBD"}
                          </span>
                          {match.status === 'live' && (
                            <Badge variant="default" className="text-[8px] h-4 px-1 py-0 uppercase bg-primary text-black font-black animate-pulse">
                              Live
                            </Badge>
                          )}
                          {isFinal && match.status === 'completed' && (
                            <Trophy className="h-3 w-3 text-primary" />
                          )}
                        </div>

                        {/* Team 1 */}
                        <div className={`p-3 flex justify-between items-center border-b border-border/50 transition-colors
                          ${match.team1.winner ? 'bg-primary/10' : match.team2.winner ? 'opacity-50' : 'hover:bg-muted/30'}`}
                        >
                          <div className="font-bold text-sm truncate pr-2">
                            {match.team1.name || "TBD"}
                          </div>
                          <div className={`font-mono text-sm font-bold ${match.team1.winner ? 'text-primary' : 'text-muted-foreground'}`}>
                            {match.team1.score}
                          </div>
                        </div>

                        {/* Team 2 */}
                        <div className={`p-3 flex justify-between items-center transition-colors
                          ${match.team2.winner ? 'bg-primary/10' : match.team1.winner ? 'opacity-50' : 'hover:bg-muted/30'}`}
                        >
                          <div className="font-bold text-sm truncate pr-2">
                            {match.team2.name || "TBD"}
                          </div>
                          <div className={`font-mono text-sm font-bold ${match.team2.winner ? 'text-primary' : 'text-muted-foreground'}`}>
                            {match.team2.score}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bracket Connection Lines */}
                    {showConnectors && (
                      <>
                        <div className="absolute top-1/2 left-[100%] w-8 h-px bg-border z-0" />
                        {matchIndex % 2 === 0 ? (
                          // Top bracket line goes down to meet bottom bracket line
                          <div className="absolute top-1/2 left-[calc(100%+2rem)] w-px h-[calc(50%+1.5rem)] bg-border z-0" />
                        ) : (
                          // Bottom bracket line goes up
                          <div className="absolute bottom-1/2 left-[calc(100%+2rem)] w-px h-[calc(50%+1.5rem)] bg-border z-0" />
                        )}
                        <div className="absolute top-1/2 left-[calc(100%+2rem)] w-8 h-px bg-border z-0" 
                          style={{
                            // Only draw the connecting line to the next round from the 'middle' point 
                            display: matchIndex % 2 === 0 ? 'none' : 'block',
                            top: '0px'
                          }} 
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
