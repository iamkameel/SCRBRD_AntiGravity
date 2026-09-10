import { useState, useMemo } from "react";
import { D } from "@/lib/design-system";
import { 
  BrainCircuit, 
  Activity, 
  Target, 
  Shield, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillAssessment, ReadinessScore, RoleArchetype } from "@/types/schema_v4";
import { recommendationEngine, IdentifiedNeed } from "@/lib/intelligence/recommendationEngine";
import { Drill } from "@/lib/services/drillService";
import { motion, AnimatePresence } from "framer-motion";

interface DrillRecommenderProps {
  playerId: string;
  playerName: string;
  role: RoleArchetype;
  assessments?: SkillAssessment[];
  readiness?: ReadinessScore;
}

// Icons mapping for categories
const CATEGORY_ICONS: Record<string, any> = {
  'Batting': Target,
  'Bowling': Activity,
  'Mental': BrainCircuit,
  'Tactical': Shield,
  'Fielding': Activity,
  'Wicketkeeping': Target,
};

// Colors mapping for categories - aligned with D system
const CATEGORY_COLORS: Record<string, string> = {
  'Batting': D.sky,
  'Bowling': D.emerald,
  'Mental': D.indigo,
  'Tactical': D.amber,
  'Fielding': D.rose,
  'Wicketkeeping': D.indigo,
};

export function DrillRecommender({ playerId, playerName, role, assessments = [], readiness }: DrillRecommenderProps) {
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [assignedDrills, setAssignedDrills] = useState<string[]>([]);
  
  // Calculate needs and drills using the memoized engine
  const { needs, suggestedDrills } = useMemo(() => {
    if (!analyzed) return { needs: [], suggestedDrills: [] };
    
    const idNeeds = recommendationEngine.getIdentifiedNeeds(assessments, role);
    const drills = recommendationEngine.suggestDrills(idNeeds, readiness);
    
    return { needs: idNeeds, suggestedDrills: drills };
  }, [analyzed, assessments, role, readiness]);

  const handleRunAnalysis = () => {
    setLoading(true);
    // Simulate complex calculation for UX
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);
    }, 1500);
  };

  const toggleAssign = (id: string) => {
    setAssignedDrills(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2.5rem] border overflow-hidden relative flex flex-col min-h-[500px] shadow-2xl"
      style={{ background: D.surf1, borderColor: D.border }}
    >
      {/* Header section */}
      <div className="p-8 md:p-12 border-b relative overflow-hidden" style={{ borderColor: D.border }}>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none opacity-20" style={{ background: D.gradMain }} />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2 italic" style={{ fontFamily: D.head, color: D.indigo }}>
              <BrainCircuit className="h-4 w-4" />
              DEVELOPMENT INTELLIGENCE ENGINE
            </div>
            <h2 className="text-4xl font-black tracking-tighter uppercase italic" style={{ fontFamily: D.head, color: D.textPrimary }}>
              INTERVENTION <span style={{ color: D.indigo }}>PLANNER</span>
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest mt-4 max-w-xl leading-relaxed opacity-60" style={{ color: D.textMuted }}>
              RULES-BASED RECOMMENDATION ENGINE. SYNCS WITH SKILL MATRIX ASSESSMENTS AND MATCH PERFORMANCE DATA TO GENERATE TARGETED DRILL PROTOCOLS FOR <strong style={{ color: D.textPrimary }}>{playerName.toUpperCase()}</strong> ({role.toUpperCase()}).
            </p>
          </div>
          
          <AnimatePresence mode="wait">
            {!analyzed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Button 
                  onClick={handleRunAnalysis}
                  disabled={loading}
                  className="rounded-2xl px-10 text-[10px] font-black uppercase tracking-widest h-14 shadow-2xl border transition-all hover:translate-y-[-4px] active:scale-95"
                  style={{ background: D.indigo, color: 'white', borderColor: `${D.indigo}50` }}
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <Activity className="h-4 w-4 animate-pulse" /> PROCESSING CORE DATA...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <Zap className="h-4 w-4" /> RUN DIAGNOSIS
                    </span>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content Area */}
      {!analyzed ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative bg-black/5">
          <div className="w-24 h-24 mb-8 rounded-3xl flex items-center justify-center relative shadow-inner border" style={{ background: D.surf2, borderColor: D.border }}>
            <div className="absolute inset-0 rounded-3xl border animate-ping opacity-20" style={{ borderColor: D.indigo, animationDuration: '3s' }}></div>
            <Shield className="h-10 w-10 opacity-20" style={{ color: D.textPrimary }} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight italic mb-3" style={{ fontFamily: D.head, color: D.textPrimary }}>AWAITING SYSTEM DIAGNOSIS</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest max-w-sm leading-relaxed opacity-40" style={{ color: D.textMuted }}>
            RUN THE DIAGNOSTIC ENGINE TO ANALYZE RECENT ASSESSMENTS, PERFORMANCE GAPS, AND READINESS FLAGS TO GENERATE A CUSTOMIZED TRAINING PROTOCOL.
          </p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col md:flex-row divide-x"
          style={{ borderColor: D.border }}
        >
          {/* Identified Need Analysis */}
          <div className="w-full md:w-80 bg-black/5 p-8 flex flex-col gap-8">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 italic" style={{ fontFamily: D.head, color: D.textMuted }}>
                IDENTIFIED NEEDS
              </h4>
              <div className="space-y-4">
                {needs.length > 0 ? needs.map((need, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="p-5 rounded-2xl border shadow-lg flex flex-col gap-3"
                    style={{ background: D.surf2, borderColor: D.border }}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-black uppercase italic tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>{need.attribute}</span>
                      <Badge className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border-0" 
                             style={{ background: need.severity === 'High' ? `${D.rose}15` : `${D.amber}15`, 
                                      color: need.severity === 'High' ? D.rose : D.amber }}>
                        {need.severity}
                      </Badge>
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40" style={{ fontFamily: D.head, color: D.textMuted }}>
                      IMPACT SCORE: <span style={{ color: D.textPrimary }}>{need.impactScore}/10</span>
                    </div>
                  </motion.div>
                )) : (
                  <div className="p-6 rounded-2xl border border-dashed text-center" style={{ borderColor: D.border, background: `${D.emerald}05` }}>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: D.emerald }}>NO CRITICAL GAPS IDENTIFIED</p>
                  </div>
                )}
              </div>
            </div>

            {readiness && (
              <div className="mt-auto pt-8 border-t" style={{ borderColor: D.border }}>
                <div className="p-5 rounded-2xl border shadow-inner flex gap-4" 
                     style={{ background: D.surf3, borderColor: D.border }}>
                  {readiness.status === 'Ready' ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" style={{ color: D.emerald }} />
                  ) : (
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: D.amber }} />
                  )}
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: readiness.status === 'Ready' ? D.emerald : D.amber }}>
                      READINESS: {readiness.status.toUpperCase()}
                    </h5>
                    {readiness.notes && (
                      <p className="text-[9px] font-bold uppercase leading-relaxed tracking-wider opacity-60" style={{ color: D.textMuted }}>
                        {readiness.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Protocols */}
          <div className="flex-1 p-8">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] italic" style={{ fontFamily: D.head, color: D.indigo }}>
                GENERATED PROTOCOLS
              </h4>
              <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: D.textMuted, background: D.surf2, borderColor: D.border }}>
                {assignedDrills.length} ASSIGNED
              </span>
            </div>

            <div className="space-y-5">
              {suggestedDrills.map((drill, i) => {
                const Icon = CATEGORY_ICONS[drill.category] || Activity;
                const color = CATEGORY_COLORS[drill.category] || D.indigo;
                const isAssigned = assignedDrills.includes(drill.id);
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={drill.id} 
                    className="p-[1px] rounded-[1.5rem] transition-all duration-500 overflow-hidden shadow-xl"
                    style={{ 
                      background: isAssigned ? `linear-gradient(90deg, ${D.indigo}40, transparent)` : D.border
                    }}
                  >
                    <div className="p-6 rounded-[1.5rem] flex flex-col sm:flex-row gap-6 items-start sm:items-center transition-colors hover:bg-black/5" 
                         style={{ background: D.surf2 }}>
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
                        style={{ backgroundColor: `${color}10`, border: `1px solid ${color}20`, color: color }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border-0" 
                                 style={{ background: `${color}15`, color: color }}>
                            {drill.category}
                          </Badge>
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic" style={{ color: D.textMuted }}>
                            {suggestedDrills.length > 3 ? "HIGH CONFIDENCE" : "STRATEGIC FIT"}
                          </span>
                        </div>
                        <h5 className="text-xl font-black uppercase italic tracking-tighter mb-1.5 truncate" style={{ fontFamily: D.head, color: D.textPrimary }}>{drill.name}</h5>
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[9px] font-bold uppercase tracking-widest opacity-50" style={{ color: D.textMuted }}>
                          <span className="flex items-center gap-1.5"><Target className="h-3 w-3" style={{ color }} /> TARGETS: {drill.targetAttributes.join(", ")}</span>
                          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {drill.duration}</span>
                          <span className="flex items-center gap-1.5"><Activity className="h-3 w-3" /> {drill.intensity} INTENSITY</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => toggleAssign(drill.id)}
                        className="rounded-xl px-8 text-[10px] font-black uppercase tracking-widest h-12 min-w-[140px] shadow-lg transition-all hover:translate-y-[-2px] active:scale-95 border"
                        style={{ 
                          background: isAssigned ? D.indigo : D.surf1, 
                          color: isAssigned ? 'white' : D.textPrimary,
                          borderColor: isAssigned ? 'transparent' : D.border
                        }}
                      >
                        {isAssigned ? (
                          <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> ASSIGNED</span>
                        ) : "ADD TO PLAN"}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <AnimatePresence>
              {assignedDrills.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-10 pt-8 border-t flex justify-end"
                  style={{ borderColor: D.border }}
                >
                  <Button className="rounded-2xl px-10 text-[10px] font-black uppercase tracking-widest h-14 bg-white text-black hover:bg-white/90 shadow-2xl transition-all hover:translate-x-2">
                    CONFIRM TRAINING PLAN <ChevronRight className="h-4 w-4 ml-3" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
