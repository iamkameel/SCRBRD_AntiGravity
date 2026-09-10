'use me';
import React from 'react';
import { Award, Accolade, Honour, Milestone } from '../../types/schema_v4';
import { Award as AwardIcon, Shield, Medal, Star, CheckCircle, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface PlayerHonoursCabinetProps {
    honours?: Honour[];
    awards?: Award[];
    accolades?: Accolade[];
    milestones?: Milestone[];
}

export const PlayerHonoursCabinet: React.FC<PlayerHonoursCabinetProps> = ({
    honours = [],
    awards = [],
    accolades = [],
    milestones = [],
}) => {
    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900/40 border border-amber-500/20 rounded-xl p-5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 text-amber-400">
                        <AwardIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wide">Honours & Sporting Recognition</h2>
                        <p className="text-sm text-slate-400">
                            Verified institutional awards, representative selections, and historical milestones.
                        </p>
                    </div>
                </div>
            </div>

            {/* Representative Honours */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-slate-800/60">
                    <CardTitle className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400" />
                        Representative Selections & Caps ({honours.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {honours.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No representative honours recorded yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {honours.map((honour) => (
                                <div
                                    key={honour.id}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 hover:border-amber-500/40 transition-colors"
                                >
                                    <div className="p-2 bg-amber-500/10 rounded border border-amber-500/30 text-amber-400 mt-0.5">
                                        <Medal className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-white">{honour.teamName}</h4>
                                            <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400 bg-amber-500/10">
                                                {honour.honourLevel}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">Conferred: {honour.conferredOn}</p>
                                        {honour.notes && <p className="text-xs text-slate-500 mt-1">{honour.notes}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Official Awards & Career Milestones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Official Awards */}
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardHeader className="pb-3 border-b border-slate-800/60">
                        <CardTitle className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-400" />
                            Official Awards ({awards.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {awards.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">No formal awards recorded yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {awards.map((award) => (
                                    <div key={award.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium text-white">{award.title}</h4>
                                            <span className="text-xs text-slate-400">{award.awardedOn}</span>
                                        </div>
                                        <p className="text-xs text-amber-400/90 mt-0.5">{award.awardedBy}</p>
                                        {award.description && <p className="text-xs text-slate-400 mt-1">{award.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Career Milestones */}
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardHeader className="pb-3 border-b border-slate-800/60">
                        <CardTitle className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            Career Milestones ({milestones.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {milestones.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">No historical milestones unlocked yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {milestones.map((m) => (
                                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-emerald-500/20">
                                        <div className="p-2 bg-emerald-500/10 rounded text-emerald-400">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-white">{m.title}</h4>
                                            <p className="text-xs text-slate-400">{m.description || `Achieved on ${m.achievedOn}`}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
