"use client";

import { useState, useMemo } from "react";
import { D } from "@/lib/design-system";
import {
    BrainCircuit,
    Activity,
    Target,
    Shield,
    Zap,
    ChevronRight,
    CheckCircle2,
    Save,
    Award,
    AlertTriangle,
    PlusCircle,
    UserCheck,
    Dumbbell,
    Sliders,
    Clock,
    Users,
    ChevronDown,
    ChevronUp,
    FileText,
    CheckSquare,
    TrendingUp,
    Lock,
    Sparkles,
    Info,
    RefreshCw,
    X,
    ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { RoleArchetype, SkillDomain } from "@/types/schema_v4";
import {
    normalizeSkillScore,
    calculateRoleSkillScore,
    generateDrillRecommendations,
    ROLE_DOMAIN_WEIGHTS
} from "@/lib/developmentEngine";
import { logSkillAssessmentAction, assignInterventionAction } from "@/app/actions/skillActions";
import { DrillRecommendation, Drill } from "@/types/drills";
import { aiCoachAssistant, PlayerDiagnosis } from "@/services/aiCoachAssistant";
import { MASTER_DRILL_LIBRARY } from "@/lib/drillLibrary";
import { cn } from "@/lib/utils";

interface PlayerOption {
    id: string;
    name: string;
    role: RoleArchetype;
    readinessStatus: 'Ready' | 'Caution' | 'Restricted' | 'Unavailable';
    medicalRestrictions: string[];
    dotBallPercentage: number;
    strikeRate: number;
}

const DEFAULT_PLAYERS: PlayerOption[] = [
    {
        id: "p1",
        name: "Lethabo Nkosi",
        role: "Opener",
        readinessStatus: "Ready",
        medicalRestrictions: [],
        dotBallPercentage: 48,
        strikeRate: 104
    },
    {
        id: "p2",
        name: "Callum Smith",
        role: "Strike Pace Bowler",
        readinessStatus: "Caution",
        medicalRestrictions: ["Lumbar Strain"],
        dotBallPercentage: 35,
        strikeRate: 125
    },
    {
        id: "p3",
        name: "Aarav Patel",
        role: "Wicketkeeper-Batter",
        readinessStatus: "Ready",
        medicalRestrictions: [],
        dotBallPercentage: 38,
        strikeRate: 132
    },
    {
        id: "p4",
        name: "Kaelen van Zyl",
        role: "Finger Spinner",
        readinessStatus: "Ready",
        medicalRestrictions: [],
        dotBallPercentage: 42,
        strikeRate: 110
    }
];

const WORKFLOW_STAGES = [
    { id: 1, title: "Assessment", desc: "Skill Matrix Evaluation" },
    { id: 2, title: "Diagnosis", desc: "AI Safety & Need Profiling" },
    { id: 3, title: "Prescription", desc: "Drill Recommendations" },
    { id: 4, title: "Plan Creation", desc: "Training Micro-Plan" },
    { id: 5, title: "Execution", desc: "Session Feedback Log" },
    { id: 6, title: "Review Loop", desc: "Development Trend" }
];

const DOMAINS: { id: SkillDomain; label: string; icon: any; color: string }[] = [
    { id: "Batting", label: "Batting Domain", icon: Shield, color: D.sky },
    { id: "Bowling", label: "Bowling Domain", icon: Target, color: D.emerald },
    { id: "Fielding", label: "Fielding & Agility", icon: Activity, color: D.indigo },
    { id: "Wicketkeeping", label: "Wicketkeeping", icon: Award, color: D.cyan },
    { id: "Tactical", label: "Tactical Intelligence", icon: Target, color: D.amber },
    { id: "Mental", label: "Mental Fortitude", icon: BrainCircuit, color: D.violet },
    { id: "Physical", label: "Physical Conditioning", icon: Zap, color: D.rose },
];

const ATTRIBUTES_BY_DOMAIN: Record<SkillDomain, string[]> = {
    Batting: ["Defensive Technique", "Strike Rotation", "Playing Spin", "Tempo Control", "Boundary Hitting"],
    Bowling: ["Line Discipline", "Length Discipline", "Variation Quality", "Death-Over Execution", "Control"],
    Fielding: ["Ground Fielding", "Basic Catching", "Throwing Accuracy", "Pick-Up and Release"],
    Wicketkeeping: ["Setup and Stance", "Clean Collection", "Standing-Up Takes", "Leg-Side Takes"],
    Tactical: ["Match Awareness", "Game Situation Understanding", "Shot Selection", "Bowling Plan Execution"],
    Mental: ["Concentration", "Composure Under Pressure", "Resilience", "Response to Pressure"],
    Physical: ["Acceleration", "Mobility", "Workload Tolerance", "Endurance"],
};

const RATING_SCALE = [
    { value: 1, label: "1: Severely Underdeveloped" },
    { value: 3, label: "3: Below Expected Standard" },
    { value: 5, label: "5: Competent School Standard" },
    { value: 7, label: "7: Strong Performer" },
    { value: 9, label: "9: Elite School-Level Trait" },
];

export function CoachDevelopmentHub() {
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerOption>(DEFAULT_PLAYERS[0]);
    const [activeStage, setActiveStage] = useState<number>(1);
    const [activeDomain, setActiveDomain] = useState<SkillDomain>("Batting");
    
    // Ratings state
    const [ratings, setRatings] = useState<Record<string, number>>({
        "Defensive Technique": 7,
        "Strike Rotation": 3,
        "Playing Spin": 5,
        "Tempo Control": 6,
        "Composure Under Pressure": 5,
    });
    
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    
    // Active Interventions
    const [activeInterventions, setActiveInterventions] = useState<Array<{
        id: string;
        drillName: string;
        targetAttribute: string;
        durationWeeks: number;
        status: string;
        assignedAt: string;
        notes?: string;
    }>>([
        {
            id: "int_01",
            drillName: "Drop-and-Run Strike Rotation",
            targetAttribute: "Strike Rotation",
            durationWeeks: 2,
            status: "Active (Week 1)",
            assignedAt: "2026-09-08",
            notes: "Focus on soft hands off tight seamers"
        }
    ]);

    // Modal state for assigning drill
    const [assignModalDrill, setAssignModalDrill] = useState<Drill | null>(null);
    const [interventionWeeks, setInterventionWeeks] = useState<number>(2);
    const [interventionNotes, setInterventionNotes] = useState<string>("");

    // Modal state for drill details (progression/regression)
    const [inspectDrill, setInspectDrill] = useState<Drill | null>(null);

    // Session log state
    const [sessionLogText, setSessionLogText] = useState("");
    const [sessionLogged, setSessionLogged] = useState(false);

    const handleRate = (attr: string, val: number) => {
        setRatings(prev => ({ ...prev, [attr]: val }));
    };

    // Calculate domain averages (0-100)
    const domainScores = useMemo(() => {
        const result: Partial<Record<SkillDomain, number>> = {};

        DOMAINS.forEach(dom => {
            const attrs = ATTRIBUTES_BY_DOMAIN[dom.id];
            let sum = 0;
            let count = 0;
            attrs.forEach(attr => {
                if (ratings[attr] !== undefined) {
                    sum += normalizeSkillScore(ratings[attr]);
                    count++;
                }
            });
            if (count > 0) {
                result[dom.id] = Math.round(sum / count);
            }
        });

        return result;
    }, [ratings]);

    // Role-Weighted Skill Score
    const roleSkillScore = useMemo(() => {
        return calculateRoleSkillScore(domainScores, selectedPlayer.role);
    }, [domainScores, selectedPlayer.role]);

    // AI Player Diagnosis
    const aiDiagnosis = useMemo(() => {
        return aiCoachAssistant.diagnosePlayer(
            selectedPlayer.id,
            selectedPlayer.name,
            selectedPlayer.role,
            selectedPlayer.dotBallPercentage,
            selectedPlayer.strikeRate,
            selectedPlayer.medicalRestrictions
        );
    }, [selectedPlayer]);

    // Rule-Based Drill Recommendations
    const recommendations = useMemo(() => {
        const assessmentList: Array<{ domain: SkillDomain; attributeName: string; rating: number }> = [];

        Object.entries(ratings).forEach(([attr, val]) => {
            const domainEntry = DOMAINS.find(d => ATTRIBUTES_BY_DOMAIN[d.id].includes(attr));
            if (domainEntry) {
                assessmentList.push({
                    domain: domainEntry.id,
                    attributeName: attr,
                    rating: val,
                });
            }
        });

        return generateDrillRecommendations(
            selectedPlayer.id,
            selectedPlayer.role,
            assessmentList,
            selectedPlayer.readinessStatus,
            selectedPlayer.medicalRestrictions
        );
    }, [ratings, selectedPlayer]);

    // Strength Sharpening Drills (High Ratings 7+)
    const strengthDrills = useMemo(() => {
        const topAttrs = Object.entries(ratings).filter(([_, val]) => val >= 7);
        if (topAttrs.length === 0) return [];

        return MASTER_DRILL_LIBRARY.filter(d => 
            d.linkedRoleArchetypes.includes(selectedPlayer.role) &&
            !selectedPlayer.medicalRestrictions.some(m => d.injuryRestrictions?.includes(m))
        ).slice(0, 2);
    }, [ratings, selectedPlayer]);

    const handleCommitAssessment = async () => {
        setSaving(true);

        for (const [attr, val] of Object.entries(ratings)) {
            const domainEntry = DOMAINS.find(d => ATTRIBUTES_BY_DOMAIN[d.id].includes(attr));
            if (domainEntry) {
                await logSkillAssessmentAction({
                    personId: selectedPlayer.id,
                    assessorId: "coach_current",
                    domain: domainEntry.id,
                    attributeName: attr,
                    rating: val as any,
                    confidence: "High",
                    note: `Role-Weighted assessment for ${selectedPlayer.role}`
                });
            }
        }

        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleOpenAssignModal = (drill: Drill) => {
        setAssignModalDrill(drill);
        setInterventionWeeks(2);
        setInterventionNotes(`Target intervention for ${selectedPlayer.name} (${selectedPlayer.role})`);
    };

    const handleConfirmAssign = async () => {
        if (!assignModalDrill) return;

        await assignInterventionAction({
            personId: selectedPlayer.id,
            drillId: assignModalDrill.id,
            drillName: assignModalDrill.name,
            targetAttribute: assignModalDrill.subcategory,
            durationWeeks: interventionWeeks,
            notes: interventionNotes
        });

        setActiveInterventions(prev => [
            ...prev,
            {
                id: `int_${Date.now()}`,
                drillName: assignModalDrill.name,
                targetAttribute: assignModalDrill.subcategory,
                durationWeeks: interventionWeeks,
                status: "Active (Week 1)",
                assignedAt: new Date().toISOString().split('T')[0],
                notes: interventionNotes
            }
        ]);

        setAssignModalDrill(null);
    };

    const handleLogSessionFeedback = () => {
        if (!sessionLogText) return;
        setSessionLogged(true);
        setTimeout(() => {
            setSessionLogged(false);
            setSessionLogText("");
        }, 3000);
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header & Player Selector */}
            <div
                className="p-8 rounded-[2.5rem] border relative overflow-hidden flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 shadow-2xl"
                style={{ background: D.surf1, borderColor: D.border }}
            >
                <div className="flex items-center gap-6">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner"
                        style={{ background: D.surf2, borderColor: D.borderMed }}
                    >
                        <BrainCircuit className="h-8 w-8 text-indigo-400" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1" style={{ color: D.textMuted, fontFamily: D.head }}>
                            Institutional Player Development Engine
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic" style={{ fontFamily: D.head }}>
                            COACH <span style={{ color: D.indigo }}>DEVELOPMENT HUB</span>
                        </h2>
                    </div>
                </div>

                {/* Player Select & Role & Readiness Pills */}
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Target Athlete</span>
                        <select
                            value={selectedPlayer.id}
                            onChange={(e) => {
                                const found = DEFAULT_PLAYERS.find(p => p.id === e.target.value);
                                if (found) setSelectedPlayer(found);
                            }}
                            className="bg-black/40 border text-white font-bold text-xs rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                            style={{ borderColor: D.borderMed }}
                        >
                            {DEFAULT_PLAYERS.map(p => (
                                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                                    {p.name} ({p.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Role Archetype</span>
                        <Badge
                            variant="outline"
                            className="text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border"
                            style={{ background: `${D.indigo}20`, borderColor: `${D.indigo}50`, color: D.indigo, fontFamily: D.head }}
                        >
                            {selectedPlayer.role}
                        </Badge>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Medical Status</span>
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border",
                                selectedPlayer.readinessStatus === 'Ready' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            )}
                        >
                            {selectedPlayer.readinessStatus} {selectedPlayer.medicalRestrictions.length > 0 && `(${selectedPlayer.medicalRestrictions.join(', ')})`}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* 6-Stage Workflow Stepper Bar */}
            <div className="p-3 rounded-2xl border grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 shadow-xl"
                 style={{ background: D.surf1, borderColor: D.border }}>
                {WORKFLOW_STAGES.map((stage) => {
                    const isActive = activeStage === stage.id;
                    const isCompleted = activeStage > stage.id;

                    return (
                        <button
                            key={stage.id}
                            onClick={() => setActiveStage(stage.id)}
                            className={cn(
                                "p-3 rounded-xl border transition-all text-left flex items-start gap-3 group relative overflow-hidden",
                                isActive ? "bg-indigo-600/15 border-indigo-500/50 scale-[1.02] shadow-lg" : "bg-black/10 hover:bg-black/20 border-transparent opacity-60 hover:opacity-100"
                            )}
                        >
                            <div className={cn(
                                "w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 transition-colors",
                                isActive ? "bg-indigo-500 text-white" : isCompleted ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-white/40"
                            )}>
                                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stage.id}
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-black uppercase tracking-wider text-white truncate" style={{ fontFamily: D.head }}>
                                    {stage.title}
                                </div>
                                <div className="text-[8px] font-medium text-white/40 truncate">
                                    {stage.desc}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* STAGE 1: ASSESSMENT */}
            {activeStage === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Role-Weighted Composite Index Sidebar (4 Cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div
                            className="p-8 rounded-[2rem] border relative overflow-hidden text-center shadow-xl group"
                            style={{ background: D.surf1, borderColor: D.border }}
                        >
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">
                                ROLE-WEIGHTED SKILL SCORE
                            </div>
                            <div
                                className="text-6xl font-black tracking-tighter italic my-2"
                                style={{ fontFamily: D.head, color: D.indigo }}
                            >
                                {roleSkillScore} <span className="text-xl font-normal text-white/30">/ 100</span>
                            </div>
                            <p className="text-[11px] font-medium text-white/50 max-w-xs mx-auto">
                                Normalized evaluation weighted for <span className="text-white font-bold">{selectedPlayer.role}</span> key domains.
                            </p>

                            <div className="mt-6 h-2 w-full bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${roleSkillScore}%` }}
                                    className="h-full rounded-full"
                                    style={{ background: D.indigo }}
                                />
                            </div>
                        </div>

                        {/* Skill Domain Buttons */}
                        <div
                            className="p-6 rounded-[2rem] border space-y-3 shadow-xl"
                            style={{ background: D.surf1, borderColor: D.border }}
                        >
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4 px-2">
                                SKILL DOMAINS
                            </div>
                            {DOMAINS.map(dom => {
                                const Icon = dom.icon;
                                const isActive = activeDomain === dom.id;
                                const score = domainScores[dom.id];

                                return (
                                    <button
                                        key={dom.id}
                                        onClick={() => setActiveDomain(dom.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border group ${isActive ? "scale-[1.02] shadow-xl" : "hover:bg-black/10"
                                            }`}
                                        style={{
                                            background: isActive ? `${dom.color}15` : "transparent",
                                            borderColor: isActive ? `${dom.color}50` : "transparent",
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                                                style={{
                                                    background: isActive ? `${dom.color}30` : D.surf2,
                                                    border: `1px solid ${isActive ? `${dom.color}50` : D.border}`
                                                }}
                                            >
                                                <Icon className="h-4 w-4" style={{ color: isActive ? dom.color : D.textMuted }} />
                                            </div>
                                            <span
                                                className={`text-[11px] font-black uppercase tracking-widest ${isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                                                    }`}
                                                style={{ fontFamily: D.head }}
                                            >
                                                {dom.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {score !== undefined && (
                                                <span className="text-xs font-mono font-bold text-white/80">{score}%</span>
                                            )}
                                            <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? "translate-x-1 text-white" : "text-white/20"}`} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Assessment Grid (8 Cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        <div
                            className="p-8 rounded-[2rem] border relative overflow-hidden shadow-xl"
                            style={{ background: D.surf1, borderColor: D.border }}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b" style={{ borderColor: D.border }}>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1 flex items-center gap-2">
                                        {selectedPlayer.name} <ChevronRight className="h-3 w-3 opacity-30" /> Domain Evaluation
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-3" style={{ fontFamily: D.head }}>
                                        {DOMAINS.find(d => d.id === activeDomain)?.label}
                                    </h3>
                                </div>

                                <Button
                                    onClick={handleCommitAssessment}
                                    disabled={saving}
                                    className={`rounded-xl px-8 text-[10px] font-black uppercase tracking-[0.2em] h-12 transition-all shadow-lg active:scale-95 ${saved ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-indigo-600 text-white hover:bg-indigo-500"
                                        }`}
                                >
                                    {saved ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    {saved ? "ASSESSMENT LOGGED" : saving ? "SAVING..." : "COMMIT RUBRIC"}
                                </Button>
                            </div>

                            {/* Attribute Rating Rows */}
                            <div className="space-y-6">
                                {ATTRIBUTES_BY_DOMAIN[activeDomain].map((attr) => (
                                    <div
                                        key={attr}
                                        className="p-6 rounded-2xl border transition-all hover:border-white/20"
                                        style={{ background: D.surf2, borderColor: D.border }}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-xs font-black text-white uppercase tracking-wider italic" style={{ fontFamily: D.head }}>
                                                {attr}
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="text-[9px] font-mono font-bold px-3 py-1 rounded-md border-0"
                                                style={{
                                                    background: D.surf3,
                                                    color: ratings[attr] !== undefined ? D.sky : D.textMuted
                                                }}
                                            >
                                                {ratings[attr] !== undefined ? `RATING: ${ratings[attr]} / 9 (${normalizeSkillScore(ratings[attr])}%)` : "NOT EVALUATED"}
                                            </Badge>
                                        </div>

                                        {/* 1-9 Scale Buttons */}
                                        <div className="grid grid-cols-5 gap-2">
                                            {RATING_SCALE.map((scale) => {
                                                const isSelected = ratings[attr] === scale.value;
                                                const activeColor = DOMAINS.find(d => d.id === activeDomain)?.color || D.indigo;

                                                return (
                                                    <button
                                                        key={scale.value}
                                                        onClick={() => handleRate(attr, scale.value)}
                                                        className={`py-3 px-2 rounded-xl text-center transition-all border flex flex-col items-center gap-1 ${isSelected ? "scale-[1.05] shadow-lg text-white" : "text-white/40 hover:text-white/70 hover:bg-black/20"
                                                            }`}
                                                        style={{
                                                            background: isSelected ? `${activeColor}30` : D.surf3,
                                                            borderColor: isSelected ? activeColor : D.border,
                                                        }}
                                                    >
                                                        <span className="text-sm font-black font-mono">{scale.value}</span>
                                                        <span className="text-[8px] font-bold uppercase tracking-tighter opacity-80 line-clamp-1">
                                                            {scale.label.split(":")[1]}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STAGE 2: DIAGNOSIS */}
            {activeStage === 2 && (
                <div className="space-y-8">
                    <div className="p-8 rounded-[2rem] border relative overflow-hidden shadow-xl"
                         style={{ background: D.surf1, borderColor: D.border }}>
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b" style={{ borderColor: D.border }}>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Automated System Diagnosis</div>
                                <h3 className="text-2xl font-black text-white uppercase italic" style={{ fontFamily: D.head }}>
                                    ATHLETE PERFORMANCE & SAFETY PROFILE
                                </h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="p-5 rounded-2xl border" style={{ background: D.surf2, borderColor: D.border }}>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1 block">Weakness Severity</span>
                                <Badge className={cn("text-xs font-black uppercase", aiDiagnosis.weaknessSeverity === 'HIGH' ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300")}>
                                    {aiDiagnosis.weaknessSeverity} SEVERITY
                                </Badge>
                            </div>
                            <div className="p-5 rounded-2xl border" style={{ background: D.surf2, borderColor: D.border }}>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1 block">Primary Technical Need</span>
                                <span className="text-xs font-black text-white italic" style={{ fontFamily: D.head }}>
                                    {aiDiagnosis.primaryWeakness}
                                </span>
                            </div>
                            <div className="p-5 rounded-2xl border" style={{ background: D.surf2, borderColor: D.border }}>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1 block">Primary Strength</span>
                                <span className="text-xs font-black text-emerald-400 italic" style={{ fontFamily: D.head }}>
                                    {aiDiagnosis.primaryStrength}
                                </span>
                            </div>
                            <div className="p-5 rounded-2xl border" style={{ background: D.surf2, borderColor: D.border }}>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1 block">Data Confidence</span>
                                <Badge className="bg-sky-500/20 text-sky-300 text-xs font-black uppercase">
                                    HIGH CONFIDENCE (12 MATCHES)
                                </Badge>
                            </div>
                        </div>

                        {/* Medical Safety Check Notice */}
                        {selectedPlayer.medicalRestrictions.length > 0 && (
                            <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-4 mb-8">
                                <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1">Medical Restriction Active</h4>
                                    <p className="text-xs text-white/80 font-medium">
                                        Athlete has flagged restriction: <b className="text-white">{selectedPlayer.medicalRestrictions.join(', ')}</b>. High-intensity spinal or joint stress drills will be automatically filtered out by safety rules.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button 
                                onClick={() => setActiveStage(3)}
                                className="rounded-xl px-8 h-12 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest"
                            >
                                PROCEED TO PRESCRIPTION <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* STAGE 3 & 4: PRESCRIPTION & PLAN CREATION */}
            {(activeStage === 3 || activeStage === 4) && (
                <div className="space-y-8">
                    {/* Weakness Remediation Drills */}
                    <div className="p-8 rounded-[2rem] border relative overflow-hidden shadow-xl"
                         style={{ background: D.surf1, borderColor: D.border }}>
                        <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: D.border }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                    <Dumbbell className="h-5 w-5 text-amber-400" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-amber-400">Weakness Remediation</div>
                                    <h3 className="text-xl font-black text-white uppercase italic" style={{ fontFamily: D.head }}>
                                        RECOMMENDED INTERVENTIONS (V1 ENGINE)
                                    </h3>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[9px] font-bold border-amber-500/30 text-amber-400">
                                {recommendations.length} TARGETED DRILLS
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            {recommendations.map((rec) => {
                                const fullDrill = MASTER_DRILL_LIBRARY.find(d => d.id === rec.drillId);
                                const isAssigned = activeInterventions.some(i => i.drillName === rec.drillName);

                                return (
                                    <div
                                        key={rec.id}
                                        className="p-6 rounded-2xl border flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 transition-all hover:bg-black/20"
                                        style={{ background: D.surf2, borderColor: D.border }}
                                    >
                                        <div className="space-y-2 max-w-2xl">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-base font-black text-white uppercase italic" style={{ fontFamily: D.head }}>
                                                    {rec.drillName}
                                                </span>
                                                <Badge className="text-[8px] font-black uppercase bg-indigo-500/20 text-indigo-300 border-0">
                                                    {rec.category} • {rec.subcategory}
                                                </Badge>
                                                <Badge className="text-[8px] font-mono font-bold bg-amber-500/20 text-amber-300 border-0">
                                                    NEED SCORE: {rec.developmentNeedScore}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-white/60 font-medium leading-relaxed">
                                                {rec.rationale}
                                            </p>
                                            {fullDrill && (
                                                <div className="text-[10px] text-emerald-400/90 font-bold flex items-center gap-2">
                                                    <Target className="w-3.5 h-3.5" /> Criteria: {fullDrill.successCriteria}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 flex-wrap w-full xl:w-auto justify-end">
                                            {fullDrill && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setInspectDrill(fullDrill)}
                                                    className="rounded-xl px-4 text-[9px] font-black uppercase tracking-wider h-10 border-white/10 hover:bg-white/10"
                                                >
                                                    <Info className="w-3.5 h-3.5 mr-1.5" /> DETAILS & PROGRESSION
                                                </Button>
                                            )}

                                            {fullDrill && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleOpenAssignModal(fullDrill)}
                                                    disabled={isAssigned}
                                                    className={`rounded-xl px-5 text-[9px] font-black uppercase tracking-wider h-10 ${isAssigned ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-amber-500 text-black hover:bg-amber-400"
                                                        }`}
                                                >
                                                    {isAssigned ? (
                                                        <>
                                                            <UserCheck className="w-3.5 h-3.5 mr-1.5" /> ASSIGNED
                                                        </>
                                                    ) : (
                                                        <>
                                                            <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> ASSIGN DRILL
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Strength Sharpening Drills */}
                    {strengthDrills.length > 0 && (
                        <div className="p-8 rounded-[2rem] border relative overflow-hidden shadow-xl"
                             style={{ background: D.surf1, borderColor: D.border }}>
                            <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: D.border }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Strength Sharpening</div>
                                        <h3 className="text-xl font-black text-white uppercase italic" style={{ fontFamily: D.head }}>
                                            ELITE TRAIT REINFORCEMENT
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {strengthDrills.map(drill => (
                                    <div key={drill.id} className="p-6 rounded-2xl border space-y-3" style={{ background: D.surf2, borderColor: D.border }}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-black text-white uppercase italic" style={{ fontFamily: D.head }}>
                                                {drill.name}
                                            </span>
                                            <Badge className="bg-emerald-500/20 text-emerald-300 text-[8px] uppercase">
                                                {drill.level}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-white/60 font-medium">
                                            {drill.description}
                                        </p>
                                        <Button
                                            size="sm"
                                            onClick={() => handleOpenAssignModal(drill)}
                                            className="w-full rounded-xl text-[9px] font-black uppercase tracking-wider h-9 bg-emerald-500 text-black hover:bg-emerald-400"
                                        >
                                            <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> PRESCRIBE STRENGTH DRILL
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* STAGE 5 & 6: EXECUTION & REVIEW LOOP */}
            {(activeStage === 5 || activeStage === 6) && (
                <div className="space-y-8">
                    {/* Active Interventions List */}
                    <div className="p-8 rounded-[2rem] border relative overflow-hidden shadow-xl"
                         style={{ background: D.surf1, borderColor: D.border }}>
                        <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: D.border }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                    <ClipboardList className="h-5 w-5 text-indigo-400" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Training Execution</div>
                                    <h3 className="text-xl font-black text-white uppercase italic" style={{ fontFamily: D.head }}>
                                        ACTIVE INTERVENTIONS FOR {selectedPlayer.name.toUpperCase()}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {activeInterventions.map((item) => (
                                <div key={item.id} className="p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                                     style={{ background: D.surf2, borderColor: D.border }}>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-base font-black text-white italic uppercase" style={{ fontFamily: D.head }}>
                                                {item.drillName}
                                            </span>
                                            <Badge className="bg-indigo-500/20 text-indigo-300 text-[8px]">
                                                {item.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-white/50">Target: {item.targetAttribute} • Assigned on {item.assignedAt} ({item.durationWeeks} Weeks)</p>
                                        {item.notes && <p className="text-xs text-amber-300/80 italic">&quot;{item.notes}&quot;</p>}
                                    </div>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs px-3 py-1.5">
                                        ON TRACK
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Session Feedback Logger */}
                    <div className="p-8 rounded-[2rem] border relative overflow-hidden shadow-xl"
                         style={{ background: D.surf1, borderColor: D.border }}>
                        <h3 className="text-xl font-black text-white uppercase italic mb-4" style={{ fontFamily: D.head }}>
                            LOG SESSION EXECUTION & RESPONSE
                        </h3>
                        <div className="space-y-4">
                            <textarea
                                value={sessionLogText}
                                onChange={(e) => setSessionLogText(e.target.value)}
                                placeholder="Enter observed player response, technical improvement notes, or compliance feedback..."
                                className="w-full h-28 p-4 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-indigo-500"
                            />
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleLogSessionFeedback}
                                    disabled={!sessionLogText || sessionLogged}
                                    className="rounded-xl px-6 h-11 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider"
                                >
                                    {sessionLogged ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> : <Save className="w-4 h-4 mr-2" />}
                                    {sessionLogged ? "FEEDBACK RECORDED" : "SUBMIT SESSION LOG"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Assign Drill Intervention */}
            <AnimatePresence>
                {assignModalDrill && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg p-8 rounded-[2.5rem] border shadow-2xl space-y-6 relative"
                            style={{ background: D.surf1, borderColor: D.border }}
                        >
                            <button
                                onClick={() => setAssignModalDrill(null)}
                                className="absolute top-6 right-6 p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white/60 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">Prescribe Intervention</div>
                                <h3 className="text-2xl font-black text-white uppercase italic" style={{ fontFamily: D.head }}>
                                    {assignModalDrill.name}
                                </h3>
                                <p className="text-xs text-white/60 mt-1">Assigning to <b className="text-white">{selectedPlayer.name}</b> ({selectedPlayer.role})</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-2">Duration (Weeks)</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[1, 2, 3, 4].map(w => (
                                            <button
                                                key={w}
                                                onClick={() => setInterventionWeeks(w)}
                                                className={cn(
                                                    "py-3 rounded-xl text-xs font-black transition-all border",
                                                    interventionWeeks === w ? "bg-indigo-600 text-white border-indigo-400" : "bg-black/20 text-white/60 border-white/5 hover:bg-black/40"
                                                )}
                                            >
                                                {w} WEEKS
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-2">Coaching & Tactical Notes</label>
                                    <textarea
                                        value={interventionNotes}
                                        onChange={(e) => setInterventionNotes(e.target.value)}
                                        className="w-full h-24 p-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <Button
                                    variant="ghost"
                                    onClick={() => setAssignModalDrill(null)}
                                    className="rounded-xl px-5 text-xs font-bold text-white/60"
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    onClick={handleConfirmAssign}
                                    className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider"
                                >
                                    CONFIRM INTERVENTION
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL: Drill Details & Progression/Regression */}
            <AnimatePresence>
                {inspectDrill && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-2xl p-8 rounded-[2.5rem] border shadow-2xl space-y-6 relative max-h-[85vh] overflow-y-auto"
                            style={{ background: D.surf1, borderColor: D.border }}
                        >
                            <button
                                onClick={() => setInspectDrill(null)}
                                className="absolute top-6 right-6 p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white/60 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div>
                                <Badge className="bg-indigo-500/20 text-indigo-300 text-[8px] uppercase mb-2">
                                    {inspectDrill.category} • {inspectDrill.level} LEVEL
                                </Badge>
                                <h3 className="text-3xl font-black text-white uppercase italic" style={{ fontFamily: D.head }}>
                                    {inspectDrill.name}
                                </h3>
                                <p className="text-xs text-white/60 mt-2 leading-relaxed">
                                    {inspectDrill.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border bg-black/20 border-white/5 space-y-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Coaching Objective</span>
                                    <p className="text-xs font-bold text-white/90">{inspectDrill.coachingObjective}</p>
                                </div>
                                <div className="p-4 rounded-xl border bg-black/20 border-white/5 space-y-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Success Criteria</span>
                                    <p className="text-xs font-bold text-emerald-400">{inspectDrill.successCriteria}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <Sliders className="w-4 h-4 text-indigo-400" /> Technical Progression & Regression Options
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-rose-400 block">Progression (Make Harder)</span>
                                        <p className="text-xs text-white/80 font-medium">
                                            Reduce decision time window to 0.6s or introduce unpredictable spin-board turn markers.
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 space-y-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-sky-400 block">Regression (Make Easier)</span>
                                        <p className="text-xs text-white/80 font-medium">
                                            Widen target grid by 50cm and allow static drop feeds from coach before live delivery.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-white/10">
                                <Button
                                    onClick={() => setInspectDrill(null)}
                                    className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider"
                                >
                                    CLOSE MODULE
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
