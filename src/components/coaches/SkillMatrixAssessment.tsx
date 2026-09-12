"use client";

import { useState } from "react";
import { D } from "@/lib/design-system";
import { BrainCircuit, Activity, Target, Shield, Zap, ChevronRight, CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface SkillMatrixProps {
  playerId: string;
  playerName: string;
  role: string;
}

const CATEGORIES = [
  { id: "batting", label: "Batting Profile", icon: Shield, color: D.sky },
  { id: "bowling", label: "Bowling Threat", icon: Target, color: D.emerald },
  { id: "fielding", label: "Fielding & Agility", icon: Activity, color: D.indigo },
  { id: "mental", label: "Mental Fortitude", icon: BrainCircuit, color: D.violet },
  { id: "physical", label: "Physical Conditioning", icon: Zap, color: D.amber },
];

const ATTRIBUTES: Record<string, string[]> = {
  batting: ["Defensive Technique", "Strike Rotation", "Playing Spin", "Tempo Control"],
  bowling: ["Line & Length", "Variation Execution", "Death Bowling", "Consistency"],
  fielding: ["Ground Fielding", "Catching Basics", "Throwing Accuracy", "Reflexes"],
  mental: ["Composure Under Pressure", "Focus Routines", "Resilience", "Reset After Error"],
  physical: ["Endurance", "Acceleration", "Mobility", "Workload Tolerance"],
};

const RATING_SCALE = [
  { value: 1, label: "Severely Underdeveloped" },
  { value: 5, label: "Below Standard" },
  { value: 10, label: "Competent Standard" },
  { value: 15, label: "Strong Performer" },
  { value: 20, label: "Elite Trait" },
];

export function SkillMatrixAssessment({ playerId, playerName, role }: SkillMatrixProps) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [ratings, setRatings] = useState<Record<string, Record<string, number>>>({});
  const [saved, setSaved] = useState(false);

  const handleRate = (category: string, attribute: string, val: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [attribute]: val
      }
    }));
  };

  const handleSave = () => {
    // In production, save to Firestore via Server Action
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const calculateOverallScore = () => {
    let total = 0;
    let count = 0;
    Object.values(ratings).forEach(cat => {
      Object.values(cat).forEach(val => {
        total += val;
        count++;
      });
    });
    return count === 0 ? 0 : (total / count).toFixed(1);
  };

  const overallScore = calculateOverallScore();

  return (
    <div 
      className="rounded-[2.5rem] border overflow-hidden relative flex flex-col md:flex-row min-h-[700px] shadow-2xl"
      style={{ background: D.surf1, borderColor: D.border }}
    >
      {/* Sidebar / Categories */}
      <div 
        className="w-full md:w-80 border-r p-8 flex flex-col"
        style={{ background: D.surf2, borderColor: D.border }}
      >
        <div className="mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2" style={{ fontFamily: D.head, color: D.textMuted }}>
            Intelligence Engine
          </h2>
          <div className="text-3xl font-black text-white tracking-tighter uppercase italic" style={{ fontFamily: D.head }}>
            SKILL <span style={{ color: D.indigo }}>MATRIX</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const completedCount = Object.keys(ratings[cat.id] || {}).length;
            const totalCount = ATTRIBUTES[cat.id].length;
            const isComplete = completedCount === totalCount;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border group ${
                  isActive 
                    ? `bg-black/20 shadow-xl scale-[1.02]` 
                    : "border-transparent hover:bg-black/10 hover:border-white/5"
                }`}
                style={{ 
                  borderColor: isActive ? `${cat.color}40` : "transparent",
                }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{ 
                      background: isActive ? `${cat.color}20` : D.surf3,
                      border: `1px solid ${isActive ? `${cat.color}40` : D.border}` 
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: isActive ? cat.color : D.textMuted }} />
                  </div>
                  <span 
                    className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isActive ? "text-white" : "text-white/40 group-hover:text-white/60"}`} 
                    style={{ fontFamily: D.head }}
                  >
                    {cat.label}
                  </span>
                </div>
                {isComplete && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              </button>
            );
          })}
        </div>
        
        <div className="pt-8 border-t mt-8" style={{ borderColor: D.border }}>
          <div 
            className="p-6 rounded-2xl border text-center shadow-inner relative overflow-hidden group"
            style={{ background: D.surf3, borderColor: D.border }}
          >
            <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-white to-transparent" />
            <div className="relative z-10">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">COMPOSITE INDEX</div>
              <div className="text-5xl font-black tracking-tighter italic" style={{ fontFamily: D.head, color: D.indigo }}>{overallScore}</div>
              <div className="mt-2 h-1 w-24 bg-white/5 mx-auto rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(Number(overallScore) / 20) * 100}%` }}
                  className="h-full" 
                  style={{ background: D.indigo }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 md:p-12 relative flex flex-col">
        {/* Active Category Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 pb-8 border-b" style={{ borderColor: D.border }}>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3 flex items-center gap-3">
              {playerName} <ChevronRight className="h-3 w-3 opacity-30" /> <span className="text-white/60">{role}</span>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4" style={{ fontFamily: D.head }}>
              {CATEGORIES.find(c => c.id === activeCategory)?.label}
            </h3>
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={overallScore === "0.0"}
            className={`rounded-2xl px-10 text-[10px] font-black uppercase tracking-[0.2em] h-14 transition-all shadow-xl active:scale-95 ${
              saved 
                ? "bg-emerald-500 text-black hover:bg-emerald-400" 
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            {saved ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {saved ? "INTEL LOGGED" : "COMMIT ASSESSMENT"}
          </Button>
        </div>

        {/* Assessment Grid */}
        <div className="flex-1 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {ATTRIBUTES[activeCategory]?.map((attr) => (
                <div 
                  key={attr} 
                  className="p-8 rounded-3xl border transition-all hover:shadow-2xl group"
                  style={{ background: D.surf2, borderColor: D.border }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="text-sm font-black text-white uppercase tracking-wider italic" style={{ fontFamily: D.head }}>{attr}</div>
                    <Badge 
                      variant="outline"
                      className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg border-0"
                      style={{ background: D.surf3, color: ratings[activeCategory]?.[attr] ? D.indigo : D.textMuted }}
                    >
                      {ratings[activeCategory]?.[attr] ? `RATING: ${ratings[activeCategory][attr]} / 20` : "PENDING EVALUATION"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-3 relative">
                    {/* Connecting Track */}
                    <div className="absolute top-[20px] left-0 w-full h-[2px] opacity-10 bg-gradient-to-r from-transparent via-white to-transparent z-0" />
                    
                    {RATING_SCALE.map((scale) => {
                      const currentValue = ratings[activeCategory]?.[attr];
                      const isSelected = currentValue === scale.value;
                      const categoryColor = CATEGORIES.find(c => c.id === activeCategory)?.color || D.indigo;
                      
                      return (
                        <button
                          key={scale.value}
                          onClick={() => handleRate(activeCategory, attr, scale.value)}
                          className="relative z-10 flex flex-col items-center gap-4 group/scale pt-1"
                        >
                          <motion.div 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-300 border-2 ${
                              isSelected 
                                ? "text-white shadow-2xl scale-110" 
                                : "text-white/30 border-white/5 hover:border-white/20 hover:text-white/60"
                            }`}
                            style={{ 
                              background: isSelected ? `${categoryColor}30` : D.surf3,
                              borderColor: isSelected ? categoryColor : undefined,
                              boxShadow: isSelected ? `0 0 30px ${categoryColor}40` : undefined,
                              fontFamily: D.head
                            }}
                          >
                            {scale.value}
                          </motion.div>
                          <div className={`text-[9px] font-black uppercase tracking-widest text-center transition-all duration-500 max-w-[100px] leading-relaxed italic ${
                            isSelected ? "opacity-100 text-white translate-y-0" : "opacity-0 translate-y-2 group-hover/scale:opacity-40"
                          }`} style={{ color: isSelected ? categoryColor : D.textMuted }}>
                            {scale.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
