"use client";

import { D } from "@/lib/scoring/theme";
import { SkillAssessment, SkillDomain, RatingScale1to9 } from "@/types/schema_v4";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface PlayerAttributeMatrixProps {
  assessments: SkillAssessment[];
  playingRole?: string;
}

const DOMAINS: SkillDomain[] = [
  "Physical",
  "Mental",
  "Tactical",
  "Batting",
  "Bowling",
  "Fielding",
  "Wicketkeeping",
];

const ATTRIBUTE_MAP: Record<SkillDomain, string[]> = {
  Physical: ["Speed", "Agility", "Acceleration", "Coordination", "Balance", "Mobility", "Strength", "Power", "Endurance", "Workload"],
  Mental: ["Concentration", "Composure", "Resilience", "Confidence", "Discipline", "Intent", "Patience", "Pressure", "Reset", "Work Ethic"],
  Tactical: ["Match Awareness", "Game State", "Decision Making", "Phase Awareness", "Opposition Reading", "Option Selection", "Field Awareness", "Plan Execution", "Adaptability"],
  Batting: ["Setup", "Defensive", "Leave", "Rotation", "Gaps", "Boundary", "Range", "vs Pace", "vs Spin", "Footwork", "Tempo", "Innings Construction", "Pressure"],
  Bowling: ["Rhythm", "Release", "Control", "Line", "Length", "Pace", "Seam/Swing", "Variation", "Threat", "New Ball", "Middle Overs", "Death", "Intelligence", "Repeatability"],
  Fielding: ["Catching", "High Catching", "Slip Catching", "Ground", "Release", "Accuracy", "Power", "Reflexes", "Anticipation", "Positioning", "Boundary", "Pressure", "Comms"],
  Wicketkeeping: ["Setup", "Glove Work", "Collection", "Hands", "Standing Back", "Standing Up", "Leg Side", "Footwork", "Stumping", "Gather/Release", "Reaction", "Comms"],
};

// Ratings color mapping (FM Style)
const getRatingColor = (rating: number) => {
  if (rating >= 8) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"; // Elite
  if (rating >= 7) return "text-emerald-400/80 bg-emerald-400/5 border-emerald-400/10"; // Very Good
  if (rating >= 5) return "text-blue-400 bg-blue-400/10 border-blue-400/20"; // Good
  if (rating >= 3) return "text-amber-400 bg-amber-400/10 border-amber-400/20"; // Average
  return "text-red-400 bg-red-400/10 border-red-400/20"; // Poor
};

export function PlayerAttributeMatrix({ assessments, playingRole }: PlayerAttributeMatrixProps) {
  // Helper to get rating for an attribute
  const getRating = (domain: SkillDomain, attr: string): number => {
    const assessment = assessments.find(
      (a) => a.domain === domain && a.attributeName.toLowerCase() === attr.toLowerCase()
    );
    return assessment ? assessment.rating as number : 0;
  };

  // Mock data generator for demo purposes if no assessments provided
  const getMockRating = (domain: string, attr: string): number => {
    // Determine base rating on role
    let base = 5;
    if (playingRole?.toLowerCase().includes("batsman") && domain === "Batting") base = 7;
    if (playingRole?.toLowerCase().includes("bowler") && domain === "Bowling") base = 7;
    if (domain === "Mental" || domain === "Physical") base = 6;
    
    // Some randomness
    const seed = (domain.length + attr.length) % 5;
    return Math.min(9, Math.max(1, base + seed - 2));
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DOMAINS.map((domain) => {
          const attributes = ATTRIBUTE_MAP[domain];
          // Determine if domain is relevant to role
          const isRelevant = 
            (playingRole?.toLowerCase().includes("batsman") && (domain === "Batting" || domain === "Tactical")) ||
            (playingRole?.toLowerCase().includes("bowler") && (domain === "Bowling" || domain === "Tactical")) ||
            (playingRole?.toLowerCase().includes("wicketkeeper") && (domain === "Wicketkeeping" || domain === "Batting")) ||
            (domain === "Mental" || domain === "Physical" || domain === "Fielding");

          if (!isRelevant && domain !== "Tactical") return null;

          return (
            <div 
              key={domain} 
              className="rounded-[1.5rem] border border-white/10 bg-[#0C0C0C] overflow-hidden sh-fade-in"
            >
              <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <h3 
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50" 
                  style={{ fontFamily: D.mono }}
                >
                  {domain} Profile
                </h3>
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
              </div>
              
              <div className="p-4 space-y-1">
                {attributes.map((attr) => {
                  const rating = assessments.length > 0 
                    ? getRating(domain, attr) 
                    : getMockRating(domain, attr);
                  
                  return (
                    <div 
                      key={attr} 
                      className="group flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-white/60 group-hover:text-white/90 transition-colors">
                          {attr}
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-white/10 cursor-help opacity-0 group-hover:opacity-100 transition-opacity" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#111] border-white/10 text-[10px] text-white/60 max-w-[200px]">
                            Assessment for {attr} in the {domain} domain.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      
                      <div className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-md border text-xs font-black",
                        getRatingColor(rating)
                      )} style={{ fontFamily: D.mono }}>
                        {rating || "-"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
