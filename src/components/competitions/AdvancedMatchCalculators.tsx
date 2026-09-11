'use client';

import React, { useState } from 'react';
import {
    CloudRain,
    Calculator,
    TrendingUp,
    Clock,
    Trophy,
    Info,
    Shield,
    Sparkles,
    CheckCircle2,
    RefreshCw,
    AlertTriangle
} from 'lucide-react';
import {
    calculateDLSTarget,
    calculateProjectedScores,
    calculateOverRatePenalty,
    calculateWinProbability,
    DLSCalculationInput
} from '@/lib/intelligence/matchCalculators';
import {
    computeStandings,
    MatchResultRecord,
    DEFAULT_SCHOOL_RULESET
} from '@/lib/intelligence/competitionEngine';

export function AdvancedMatchCalculators() {
    const [activeTab, setActiveTab] = useState<'dls' | 'nrr' | 'overrate' | 'winprob'>('dls');

    // DLS State
    const [dlsInput, setDlsInput] = useState<DLSCalculationInput>({
        team1OriginalOvers: 20,
        team1FinalScore: 165,
        team1WicketsLost: 6,
        team1InterruptOversLost: 0,
        team2OriginalOvers: 20,
        team2RevisedOvers: 14,
        team2WicketsLostAtInterruption: 2,
        team2OversBowledAtInterruption: 8,
    });

    const dlsResult = calculateDLSTarget(dlsInput);

    // Over-Rate State
    const [oversBowled, setOversBowled] = useState(14);
    const [minutesElapsed, setMinutesElapsed] = useState(62);
    const overRateStatus = calculateOverRatePenalty(oversBowled, minutesElapsed);

    // Projected Score & Win Prob State
    const [currentRuns, setCurrentRuns] = useState(98);
    const [currentWickets, setCurrentWickets] = useState(3);
    const [currentBalls, setCurrentBalls] = useState(74); // 12.2 overs
    const [targetRuns, setTargetRuns] = useState(166);

    const projected = calculateProjectedScores(currentRuns, currentBalls, 20);
    const winProb = calculateWinProbability(2, currentRuns, currentWickets, currentBalls, targetRuns, 20);

    // NRR Simulator State
    const [simMatches, setSimMatches] = useState<MatchResultRecord[]>([
        {
            fixtureId: 'f-1',
            homeTeamId: 't-1',
            awayTeamId: 't-2',
            homeTeamName: 'St Johns 1st XI',
            awayTeamName: 'Hilton College',
            homeRuns: 172,
            homeWickets: 5,
            homeOvers: 20,
            awayRuns: 148,
            awayWickets: 9,
            awayOvers: 20,
            winnerTeamId: 't-1',
            status: 'COMPLETED',
        },
        {
            fixtureId: 'f-2',
            homeTeamId: 't-3',
            awayTeamId: 't-4',
            homeTeamName: 'Bishops Diocesan',
            awayTeamName: 'Kearsney College',
            homeRuns: 155,
            homeWickets: 8,
            homeOvers: 20,
            awayRuns: 156,
            awayWickets: 4,
            awayOvers: 18.2,
            winnerTeamId: 't-4',
            status: 'COMPLETED',
        },
    ]);

    const standings = computeStandings(simMatches, DEFAULT_SCHOOL_RULESET);

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                    <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider font-sans">
                        <Calculator className="w-4 h-4" /> Match Engine Intelligence & Calculators
                    </div>
                    <h2 className="text-2xl font-extrabold text-white font-['Syne',sans-serif] mt-1">
                        Advanced Match & Competition Calculators
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                        Duckworth-Lewis-Stern (DLS), Net Run Rate (NRR) Simulator, Slow Over-Rate Penalty & Win Probability.
                    </p>
                </div>

                {/* Tab Selectors */}
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/80 border border-white/10 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('dls')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all ${
                            activeTab === 'dls'
                                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                                : 'text-muted-foreground hover:text-white'
                        }`}
                    >
                        <CloudRain className="w-4 h-4" /> DLS Calculator
                    </button>
                    <button
                        onClick={() => setActiveTab('winprob')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all ${
                            activeTab === 'winprob'
                                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                                : 'text-muted-foreground hover:text-white'
                        }`}
                    >
                        <TrendingUp className="w-4 h-4" /> Win Prob & Projections
                    </button>
                    <button
                        onClick={() => setActiveTab('nrr')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all ${
                            activeTab === 'nrr'
                                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                                : 'text-muted-foreground hover:text-white'
                        }`}
                    >
                        <Trophy className="w-4 h-4" /> Standings & NRR
                    </button>
                    <button
                        onClick={() => setActiveTab('overrate')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all ${
                            activeTab === 'overrate'
                                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                                : 'text-muted-foreground hover:text-white'
                        }`}
                    >
                        <Clock className="w-4 h-4" /> Over-Rate Budget
                    </button>
                </div>
            </div>

            {/* TAB 1: DLS CALCULATOR */}
            {activeTab === 'dls' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Inputs Card */}
                    <div className="lg:col-span-7 glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-['Syne',sans-serif]">
                            <CloudRain className="w-5 h-5 text-amber-400" /> DLS Match Parameters
                        </h3>

                        {/* 1st Innings Parameters */}
                        <div className="space-y-4 p-4 bg-slate-950/60 border border-white/5 rounded-xl">
                            <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider block">
                                1st Innings (Team A)
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[11px] text-muted-foreground block font-sans mb-1">
                                        Original Overs
                                    </label>
                                    <input
                                        type="number"
                                        value={dlsInput.team1OriginalOvers}
                                        onChange={(e) => setDlsInput({ ...dlsInput, team1OriginalOvers: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] text-muted-foreground block font-sans mb-1">
                                        Total Runs Scored
                                    </label>
                                    <input
                                        type="number"
                                        value={dlsInput.team1FinalScore}
                                        onChange={(e) => setDlsInput({ ...dlsInput, team1FinalScore: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] text-muted-foreground block font-sans mb-1">
                                        Wickets Lost
                                    </label>
                                    <input
                                        type="number"
                                        max={10}
                                        value={dlsInput.team1WicketsLost}
                                        onChange={(e) => setDlsInput({ ...dlsInput, team1WicketsLost: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2nd Innings Parameters */}
                        <div className="space-y-4 p-4 bg-slate-950/60 border border-white/5 rounded-xl">
                            <span className="text-xs uppercase font-extrabold text-blue-400 tracking-wider block">
                                2nd Innings Rain Interruption (Team B)
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[11px] text-muted-foreground block font-sans mb-1">
                                        Revised Overs Available
                                    </label>
                                    <input
                                        type="number"
                                        value={dlsInput.team2RevisedOvers}
                                        onChange={(e) => setDlsInput({ ...dlsInput, team2RevisedOvers: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] text-muted-foreground block font-sans mb-1">
                                        Overs Bowled At Interruption
                                    </label>
                                    <input
                                        type="number"
                                        value={dlsInput.team2OversBowledAtInterruption}
                                        onChange={(e) => setDlsInput({ ...dlsInput, team2OversBowledAtInterruption: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] text-muted-foreground block font-sans mb-1">
                                        Wickets Lost At Interruption
                                    </label>
                                    <input
                                        type="number"
                                        max={10}
                                        value={dlsInput.team2WicketsLostAtInterruption}
                                        onChange={(e) => setDlsInput({ ...dlsInput, team2WicketsLostAtInterruption: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DLS Result Display */}
                    <div className="lg:col-span-5 glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-between space-y-6">
                        <div>
                            <span className="text-xs text-muted-foreground uppercase font-semibold font-sans tracking-wider block">
                                DLS Calculation Output
                            </span>

                            <div className="mt-4 p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-2xl space-y-4">
                                <div>
                                    <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
                                        Revised Target Score
                                    </span>
                                    <div className="text-4xl font-extrabold text-white font-['Syne',sans-serif] mt-1">
                                        {dlsResult.revisedTarget} <span className="text-base text-muted-foreground font-normal">runs in {dlsInput.team2RevisedOvers} overs</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-amber-500/20 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-muted-foreground block">DLS Par Score (at interruption):</span>
                                        <span className="text-xl font-bold text-emerald-400 font-mono">{dlsResult.parScore} runs</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-muted-foreground block">Resource Ratio:</span>
                                        <span className="text-xs font-mono text-white font-bold">
                                            {dlsResult.team2Resource}% vs {dlsResult.team1Resource}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground mt-4 leading-relaxed font-sans p-3 bg-slate-950/40 border border-white/5 rounded-xl">
                                <Info className="w-4 h-4 inline text-amber-400 mr-1" />
                                {dlsResult.explanation}
                            </p>
                        </div>

                        <div className="p-4 bg-slate-950/60 border border-white/10 rounded-xl flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Standard ICC G50 Benchmark:</span>
                            <span className="font-mono text-amber-400 font-bold">245 runs</span>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: WIN PROBABILITY & PROJECTED SCORES */}
            {activeTab === 'winprob' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-6 glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-['Syne',sans-serif]">
                            <TrendingUp className="w-5 h-5 text-amber-400" /> Match State Inputs
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Current Runs</label>
                                <input
                                    type="number"
                                    value={currentRuns}
                                    onChange={(e) => setCurrentRuns(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Wickets Lost</label>
                                <input
                                    type="number"
                                    max={10}
                                    value={currentWickets}
                                    onChange={(e) => setCurrentWickets(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Balls Bowled (e.g. 74 = 12.2 ov)</label>
                                <input
                                    type="number"
                                    value={currentBalls}
                                    onChange={(e) => setCurrentBalls(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Target Score (2nd Innings)</label>
                                <input
                                    type="number"
                                    value={targetRuns}
                                    onChange={(e) => setTargetRuns(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white"
                                />
                            </div>
                        </div>

                        {/* Projections Card */}
                        <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl space-y-3">
                            <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider block">
                                Projected Final Totals (20 Overs)
                            </span>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-2.5 bg-slate-900/80 rounded-lg border border-white/5">
                                    <span className="text-muted-foreground block">At Current RR ({projected.currentRunRate}):</span>
                                    <span className="text-base font-bold text-white font-mono">{projected.atCurrentRate}</span>
                                </div>
                                <div className="p-2.5 bg-slate-900/80 rounded-lg border border-white/5">
                                    <span className="text-muted-foreground block">At Last 5 Overs RR:</span>
                                    <span className="text-base font-bold text-white font-mono">{projected.atLast5Rate}</span>
                                </div>
                                <div className="p-2.5 bg-slate-900/80 rounded-lg border border-white/5">
                                    <span className="text-muted-foreground block">At 8.0 RPO Rate:</span>
                                    <span className="text-base font-bold text-emerald-400 font-mono">{projected.atParRate8}</span>
                                </div>
                                <div className="p-2.5 bg-slate-900/80 rounded-lg border border-white/5">
                                    <span className="text-muted-foreground block">At 10.0 RPO Accelerated:</span>
                                    <span className="text-base font-bold text-amber-400 font-mono">{projected.atAccelerated10}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Win Probability Bar */}
                    <div className="lg:col-span-6 glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-between space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-['Syne',sans-serif]">
                                <Sparkles className="w-5 h-5 text-amber-400" /> Real-time Win Probability
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 font-sans">
                                Logistic win probability calculated from target score, remaining balls, and wickets in hand.
                            </p>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center justify-between text-sm font-bold">
                                    <span className="text-blue-400">Defending Team: {winProb.homeWinProb}%</span>
                                    <span className="text-emerald-400">Chasing Team: {winProb.awayWinProb}%</span>
                                </div>

                                {/* Probability Bar */}
                                <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden flex border border-white/10 p-0.5">
                                    <div
                                        className="h-full bg-blue-500 rounded-l-full transition-all duration-500"
                                        style={{ width: `${winProb.homeWinProb}%` }}
                                    />
                                    <div
                                        className="h-full bg-emerald-500 rounded-r-full transition-all duration-500"
                                        style={{ width: `${winProb.awayWinProb}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-950/60 border border-white/10 rounded-xl space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Required Run Rate (RRR):</span>
                                <span className="font-mono font-bold text-amber-400">
                                    {(((targetRuns - currentRuns) / Math.max(1, 120 - currentBalls)) * 6).toFixed(2)} rpo
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Runs Needed:</span>
                                <span className="font-mono font-bold text-white">{targetRuns - currentRuns} runs from {120 - currentBalls} balls</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: STANDINGS & NRR */}
            {activeTab === 'nrr' && (
                <div className="glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-['Syne',sans-serif]">
                                <Trophy className="w-5 h-5 text-amber-400" /> League Standings & Net Run Rate (NRR) Engine
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                                Automatically updates standings, NRR, and multi-tier tiebreakers derived from match event records.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans">
                            <thead className="bg-slate-950 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-white/10">
                                <tr>
                                    <th className="py-3 px-4">Pos</th>
                                    <th className="py-3 px-4">Team</th>
                                    <th className="py-3 px-4 text-center">P</th>
                                    <th className="py-3 px-4 text-center">W</th>
                                    <th className="py-3 px-4 text-center">L</th>
                                    <th className="py-3 px-4 text-center">NRR</th>
                                    <th className="py-3 px-4 text-center">Pts</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {standings.map((entry, idx) => (
                                    <tr key={entry.teamId} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 font-mono font-bold text-amber-400">#{idx + 1}</td>
                                        <td className="py-3 px-4 font-bold text-white">{entry.teamName}</td>
                                        <td className="py-3 px-4 text-center font-mono">{entry.played}</td>
                                        <td className="py-3 px-4 text-center font-mono text-emerald-400 font-bold">{entry.won}</td>
                                        <td className="py-3 px-4 text-center font-mono text-rose-400">{entry.lost}</td>
                                        <td className="py-3 px-4 text-center font-mono font-bold">
                                            <span className={entry.netRunRate >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                                {entry.netRunRate >= 0 ? `+${entry.netRunRate}` : entry.netRunRate}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono text-lg font-extrabold text-amber-400">
                                            {entry.points}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: SLOW OVER-RATE BUDGET */}
            {activeTab === 'overrate' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-['Syne',sans-serif]">
                            <Clock className="w-5 h-5 text-amber-400" /> Over-Rate & Match Time Budget Tracker
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Overs Completed</label>
                                <input
                                    type="number"
                                    value={oversBowled}
                                    onChange={(e) => setOversBowled(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Total Elapsed Time (Mins)</label>
                                <input
                                    type="number"
                                    value={minutesElapsed}
                                    onChange={(e) => setMinutesElapsed(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Standard Target Rate:</span>
                                <span className="font-mono text-white">15.0 overs / hour (4.0 mins per over)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Time Allowed for {oversBowled} overs:</span>
                                <span className="font-mono text-white">{overRateStatus.minutesAllowed} minutes</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-between space-y-6">
                        <div>
                            <span className="text-xs text-muted-foreground uppercase font-semibold font-sans tracking-wider block">
                                Umpire Penalty Status
                            </span>

                            <div className={`mt-4 p-5 border rounded-2xl space-y-3 ${
                                overRateStatus.penaltyApplied
                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            }`}>
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    {overRateStatus.penaltyApplied ? (
                                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                                    ) : (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    )}
                                    {overRateStatus.penaltyApplied ? 'Slow Over-Rate Penalty Active' : 'Over-Rate Within Budget'}
                                </div>
                                <p className="text-xs text-white leading-relaxed font-sans">
                                    {overRateStatus.penaltyDescription}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-950/60 border border-white/10 rounded-xl text-xs flex justify-between">
                            <span className="text-muted-foreground">Overs Behind Schedule:</span>
                            <span className="font-mono font-bold text-rose-400">{overRateStatus.oversBehind} overs</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
