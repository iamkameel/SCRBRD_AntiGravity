"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, AlertCircle, FileText, ClipboardList, TrendingUp, ShieldCheck, Brain, Target, Zap } from 'lucide-react';
import { createScoutReportAction } from '@/app/actions/scoutingActions';
import { D } from "@/lib/design-system";
import { motion } from "framer-motion";

interface ScoutReportFormProps {
    playerId: string;
    playerName?: string;
    roleArchetype?: string;
    school?: string;
    age?: number;
    ageGroup?: string;
    region?: string;
    onSave?: (reportId: string) => void;
    onCancel?: () => void;
}

export default function ScoutReportForm({
    playerId,
    playerName = "Tracked Athlete",
    roleArchetype = "General Athlete",
    school,
    age,
    ageGroup,
    region,
    onSave,
    onCancel,
}: ScoutReportFormProps) {
    const [isSaving, setIsSaving] = useState(false);
    
    const [technicalScore, setTechnicalScore] = useState(10);
    const [mentalScore, setMentalScore] = useState(10);
    const [tacticalScore, setTacticalScore] = useState(7);
    const [physicalScore, setPhysicalScore] = useState(7);
    const [statisticalEvidenceScore, setStatisticalEvidenceScore] = useState(10);
    const [competitivenessScore, setCompetitivenessScore] = useState(5);

    const [prospectCategory, setProspectCategory] = useState<"Immediate Impact" | "High-upside Athlete" | "Long-term Project" | "Role Specialist" | "System Player">('High-upside Athlete');
    const [confidenceLevel, setConfidenceLevel] = useState<"High" | "Medium" | "Low">('Medium');
    const [notes, setNotes] = useState('');

    const totalScore = technicalScore + mentalScore + tacticalScore + physicalScore + statisticalEvidenceScore + competitivenessScore;
    
    let liveGrade = 'C';
    let gradeColor: string = D.rose;
    let gradeLabel = 'Reserve';
    
    if (totalScore >= 90) { liveGrade = 'A+'; gradeColor = D.emerald; gradeLabel = 'Elite Prospect'; }
    else if (totalScore >= 80) { liveGrade = 'A'; gradeColor = D.emerald; gradeLabel = 'High Potential'; }
    else if (totalScore >= 70) { liveGrade = 'B+'; gradeColor = D.amber; gradeLabel = 'Solid Choice'; }
    else if (totalScore >= 60) { liveGrade = 'B'; gradeColor = D.amber; gradeLabel = 'Developmental'; }

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await createScoutReportAction({
                personId: playerId || 'p1',
                personName: playerName,
                roleArchetype,
                scoutGrade: liveGrade,
                potentialScore: prospectCategory,
                metrics: {
                    velocity: technicalScore,
                    accuracy: tacticalScore,
                    stamina: physicalScore,
                    composure: mentalScore,
                    impact: competitivenessScore,
                },
                technicalScore,
                tacticalScore,
                physicalScore,
                mentalScore,
                competitivenessScore,
                statisticalEvidenceScore,
                confidenceLevel,
                school,
                age,
                ageGroup,
                region,
                notes,
            });
            if (res.success && res.id) {
                if (onSave) onSave(res.id);
            }
        } catch (error) {
            console.error("Failed to save scout report:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
        >
            <div 
              className="rounded-3xl overflow-hidden shadow-2xl relative"
              style={{ background: D.surf1, border: `1px solid ${D.border}` }}
            >
                {/* Visual Identity Strip */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-500 to-blue-500" />
                
                <div className="p-8 pb-10" style={{ borderBottom: `1px solid ${D.border}`, background: D.surf2 }}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ background: `${D.indigo}15`, border: `1px solid ${D.indigo}30`, color: D.indigo }}
                            >
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black tracking-tighter" style={{ fontFamily: D.head, color: D.textPrimary }}>
                                  FIELD <span style={{ color: D.indigo }}>INTELLIGENCE</span>
                                </h2>
                                <p className="font-bold uppercase tracking-widest text-[10px]" style={{ color: D.textMuted }}>Subject: {playerName} · Scoped Assessment</p>
                            </div>
                        </div>
                        <div className="rounded-2xl p-4 flex items-center gap-6 min-w-[240px]" style={{ background: D.surf1, border: `1px solid ${D.border}` }}>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: D.textMuted }}>Projected Grade</p>
                                <div className="text-4xl font-black" style={{ fontFamily: D.head, color: gradeColor }}>{liveGrade}</div>
                                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: gradeColor, opacity: 0.6 }}>{gradeLabel}</p>
                            </div>
                            <div className="w-16 h-16 rounded-full flex items-center justify-center relative" style={{ border: `4px solid ${D.surf2}` }}>
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="32" cy="32" r="28" fill="none" stroke={D.surf2} strokeWidth="4" />
                                    <circle cx="32" cy="32" r="28" fill="none" stroke={gradeColor} strokeWidth="4" strokeDasharray={176} strokeDashoffset={176 - (176 * totalScore / 100)} />
                                </svg>
                                <span className="absolute text-xs font-black" style={{ fontFamily: D.mono, color: D.textPrimary }}>{totalScore}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-8 space-y-10">
                    {/* Assessment Matrix Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <ClipboardList className="w-4 h-4" style={{ color: D.indigo }} />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: D.textMuted }}>Core Assessment Matrix</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                            <ScoreSlider label="Technical Mechanics" value={technicalScore} setValue={setTechnicalScore} max={20} icon={ShieldCheck} />
                            <ScoreSlider label="Mental Resilience" value={mentalScore} setValue={setMentalScore} max={20} icon={Brain} />
                            <ScoreSlider label="Tactical Awareness" value={tacticalScore} setValue={setTacticalScore} max={15} icon={Target} />
                            <ScoreSlider label="Physical Engine" value={physicalScore} setValue={setPhysicalScore} max={15} icon={Zap} />
                            <ScoreSlider label="Statistical Momentum" value={statisticalEvidenceScore} setValue={setStatisticalEvidenceScore} max={20} icon={TrendingUp} />
                            <ScoreSlider label="Competitive Will" value={competitivenessScore} setValue={setCompetitivenessScore} max={10} icon={TrendingUp} />
                        </div>
                    </div>

                    {/* Meta Data & Logic Section */}
                    <div className="grid md:grid-cols-2 gap-8 pt-8" style={{ borderTop: `1px solid ${D.border}` }}>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest" style={{ color: D.textMuted }}>Personnel Archetype</Label>
                                <Select value={prospectCategory} onValueChange={(val) => setProspectCategory(val as any)}>
                                    <SelectTrigger className="rounded-xl h-12 text-sm font-bold" style={{ background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary }}>
                                        <SelectValue placeholder="Select classification" />
                                    </SelectTrigger>
                                    <SelectContent style={{ background: D.surf1, border: `1px solid ${D.border}` }}>
                                        <SelectItem value="Immediate Impact">Immediate Impact</SelectItem>
                                        <SelectItem value="High-upside Athlete">High-upside Athlete</SelectItem>
                                        <SelectItem value="Long-term Project">Long-term Project</SelectItem>
                                        <SelectItem value="Role Specialist">Role Specialist</SelectItem>
                                        <SelectItem value="System Player">System Player</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest" style={{ color: D.textMuted }}>Intel Reliability Score</Label>
                                <Select value={confidenceLevel} onValueChange={(val) => setConfidenceLevel(val as any)}>
                                    <SelectTrigger className="rounded-xl h-12 text-sm font-bold" style={{ background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary }}>
                                        <SelectValue placeholder="Select confidence" />
                                    </SelectTrigger>
                                    <SelectContent style={{ background: D.surf1, border: `1px solid ${D.border}` }}>
                                        <SelectItem value="High">HIGH (System Confirmed)</SelectItem>
                                        <SelectItem value="Medium">MEDIUM (Verified Exposure)</SelectItem>
                                        <SelectItem value="Low">LOW (Initial Observation)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest" style={{ color: D.textMuted }}>Tactical Observations & Neural Notes</Label>
                            <Textarea 
                                placeholder="Detail the specific mechanics, temperament, and role suitability..." 
                                className="min-h-[148px] rounded-xl px-4 py-3 text-sm font-medium leading-relaxed transition-all focus:ring-1 focus:ring-primary/50"
                                style={{ background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary }}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <div 
                      className="flex items-center gap-4 p-5 rounded-2xl"
                      style={{ background: `${D.indigo}15`, border: `1px solid ${D.indigo}30` }}
                    >
                        <AlertCircle className="w-5 h-5 shrink-0" style={{ color: D.indigo }} />
                        <p className="text-[10px] font-bold leading-relaxed uppercase tracking-widest" style={{ color: D.textMuted }}>
                            SUBMISSION GUIDELINE: Assessment data is aggregated into the global scouting index. Ensure high objectivity in mechanics and composure ratings.
                        </p>
                    </div>
                </div>
                
                <div 
                  className="p-8 flex justify-end gap-4"
                  style={{ borderTop: `1px solid ${D.border}`, background: D.surf2 }}
                >
                    <Button 
                      variant="ghost" 
                      onClick={onCancel} 
                      className="rounded-full px-8 text-xs font-black uppercase tracking-widest transition-all"
                      style={{ color: D.textMuted }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = `${D.textMuted}10`, e.currentTarget.style.color = D.textPrimary)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = D.textMuted)}
                    >
                        Discard
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="rounded-full px-10 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 h-12 transition-all hover:scale-105 active:scale-95"
                        style={{ background: D.indigo, color: '#fff' }}
                    >
                        {isSaving ? "TRANSMITTING..." : "COMMIT INTEL REPORT"}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

function ScoreSlider({ label, value, setValue, max, icon: Icon }: { label: string, value: number, setValue: (v: number) => void, max: number, icon: any }) {
    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: D.textMuted }} />
                    <Label className="text-[10px] font-black uppercase tracking-widest" style={{ color: D.textSecondary }}>{label}</Label>
                </div>
                <div 
                  className="px-3 py-1 rounded-lg text-sm font-black"
                  style={{ background: D.surf2, border: `1px solid ${D.border}`, color: D.indigo, fontFamily: D.mono }}
                >
                    {value}<span className="text-[10px] font-bold ml-1" style={{ color: D.textMuted }}>/ {max}</span>
                </div>
            </div>
            <Slider 
                value={[value]} 
                max={max} 
                step={1} 
                onValueChange={(vals) => setValue(vals[0])}
                className="[&>[role=slider]]:w-4 [&>[role=slider]]:h-4 [&>[role=slider]]:bg-primary [&>[role=slider]]:border-primary"
            />
        </div>
    );
}
