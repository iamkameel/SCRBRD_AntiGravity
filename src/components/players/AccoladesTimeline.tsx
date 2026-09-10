"use client";

import { D } from "@/lib/scoring/theme";
import { Award, Star, Milestone, ShieldPlus, ChevronDown } from "lucide-react";

interface Accolade {
  id: string;
  type: "award" | "milestone" | "commendation";
  title: string;
  date: string;
  description?: string;
  authority?: string;
}

const MOCK_ACCOLADES: Accolade[] = [
  {
    id: "a1",
    type: "award",
    title: "Player of the Tournament",
    date: "2024-03-15",
    description: "Awarded for exceptional all-round performance leading to the championship.",
    authority: "National Schools League"
  },
  {
    id: "a2",
    type: "milestone",
    title: "50 Wickets - 1st XI",
    date: "2024-02-10",
    description: "Reached the 50-wicket milestone for the First XI in record time.",
  },
  {
    id: "a3",
    type: "commendation",
    title: "Leadership Commendation",
    date: "2023-11-20",
    description: "Praised for resilience and tactical control during the regional semi-final.",
    authority: "Head Coach"
  },
  {
    id: "a4",
    type: "milestone",
    title: "First XI Debut",
    date: "2023-09-05",
  }
];

export function AccoladesTimeline({ playerId }: { playerId: string }) {
  // In a real app we would fetch accolades based on playerId
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#0A0A0A] overflow-hidden sh-slide-up">
      <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3" style={{ fontFamily: D.mono }}>
          <Award className="h-4 w-4" />
          Career Honours & Milestones
        </h3>
      </div>
      
      <div className="p-8 md:p-12 relative">
        {/* Timeline connector line */}
        <div className="absolute left-[54px] md:left-[84px] top-12 bottom-12 w-px bg-gradient-to-b from-primary/50 via-white/10 to-transparent" />
        
        <div className="space-y-12 relative z-10">
          {MOCK_ACCOLADES.map((item, i) => {
            const isAward = item.type === "award";
            const isMilestone = item.type === "milestone";
            const isCommendation = item.type === "commendation";
            
            const Icon = isAward ? Award : isMilestone ? Milestone : ShieldPlus;
            const bgColor = isAward ? "bg-amber-500/10" : isMilestone ? "bg-primary/10" : "bg-blue-500/10";
            const iconColor = isAward ? "text-amber-500" : isMilestone ? "text-primary" : "text-blue-400";
            const borderColor = isAward ? "border-amber-500/30" : isMilestone ? "border-primary/30" : "border-blue-500/30";

            return (
              <div key={item.id} className="flex gap-6 group">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl transition-transform group-hover:scale-110 ${bgColor} ${borderColor}`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                  </div>
                </div>
                
                <div className="flex-1 pb-8 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h4 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: D.head }}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] uppercase font-black tracking-widest text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/10" style={{ fontFamily: D.mono }}>
                      {new Date(item.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  
                  {item.authority && (
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3 flex items-center gap-2" style={{ fontFamily: D.mono }}>
                      <Star className="h-3 w-3" /> {item.authority}
                    </div>
                  )}
                  
                  {item.description && (
                    <p className="text-sm text-white/60 leading-relaxed max-w-2xl">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 flex justify-center">
          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors flex items-center gap-2" style={{ fontFamily: D.mono }}>
            Load Historical Record <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
