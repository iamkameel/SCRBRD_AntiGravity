"use client";

import { useState } from "react";
import { D } from '@/lib/design-system';
import { SkillAssessment, SkillDomain } from "@/types/schema_v4";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlayerAttributeMatrixProps {
  assessments: SkillAssessment[];
  playingRole?: string;
  onInspectAttribute?: (domain: string, attribute: string, rating: number) => void;
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

// Ratings color mapping (FM Style) - light/dark mode responsive
const getRatingColor = (rating: number) => {
  if (rating >= 8) return "text-[#22c55e] bg-emerald-500/10 border-emerald-500/30"; // Elite
  if (rating >= 7) return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"; // Very Good
  if (rating >= 5) return "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20"; // Good
  if (rating >= 3) return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"; // Average
  return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20"; // Developing
};

export function PlayerAttributeMatrix({ assessments, playingRole, onInspectAttribute }: PlayerAttributeMatrixProps) {
  const [collapsedDomains, setCollapsedDomains] = useState<Record<string, boolean>>({
    Fielding: true,
    Wicketkeeping: playingRole?.toLowerCase().includes("wicketkeeper") ? false : true,
  });

  const toggleDomain = (domain: string) => {
    setCollapsedDomains((prev) => ({ ...prev, [domain]: !prev[domain] }));
  };

  const getRating = (domain: SkillDomain, attr: string): number => {
    const assessment = assessments.find(
      (a) => a.domain === domain && a.attributeName.toLowerCase() === attr.toLowerCase()
    );
    return assessment ? (assessment.rating as number) : 0;
  };

  const getMockRating = (domain: string, attr: string): number => {
    let base = 5;
    if (playingRole?.toLowerCase().includes("batsman") && domain === "Batting") base = 7;
    if (playingRole?.toLowerCase().includes("bowler") && domain === "Bowling") base = 7;
    if (domain === "Mental" || domain === "Physical") base = 6;

    const seed = (domain.length + attr.length) % 5;
    return Math.min(9, Math.max(1, base + seed - 2));
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DOMAINS.map((domain) => {
          const attributes = ATTRIBUTE_MAP[domain];
          const isCollapsed = collapsedDomains[domain];

          return (
            <div
              key={domain}
              className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#0c0c10]/80 overflow-hidden shadow-sm transition-all hover:border-zinc-300 dark:hover:border-white/20"
            >
              <div 
                className="px-5 py-3.5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] flex items-center justify-between cursor-pointer select-none"
                onClick={() => toggleDomain(domain)}
              >
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-emerald-600 dark:text-[#22c55e]" />
                  <h3
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white"
                    style={{ fontFamily: D.mono }}
                  >
                    {domain} Domain
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-white/30" style={{ fontFamily: D.mono }}>
                    {attributes.length} attrs
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                  ) : (
                    <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                </div>
              </div>

              {!isCollapsed && (
                <div className="p-4 space-y-1">
                  {attributes.map((attr) => {
                    const rating = assessments.length > 0 ? getRating(domain, attr) : getMockRating(domain, attr);

                    return (
                      <div
                        key={attr}
                        onClick={() => onInspectAttribute?.(domain, attr, rating)}
                        className="group flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-700 dark:text-white/70 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                            {attr}
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-zinc-400 dark:text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-zinc-900 text-white dark:bg-[#111] dark:border-white/10 text-[10px] max-w-[200px]">
                              Click to inspect {attr} analytical history and evidence.
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        <div
                          className={cn(
                            "w-7 h-7 flex items-center justify-center rounded-lg border text-xs font-black transition-all group-hover:scale-105",
                            getRatingColor(rating)
                          )}
                          style={{ fontFamily: D.mono }}
                        >
                          {rating || "-"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
