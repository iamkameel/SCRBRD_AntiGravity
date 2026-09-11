'use client';

import React, { useState } from 'react';
import { Sparkles, Trophy, FileText, Swords, Cpu, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MatchSummaryInput, MatchSummaryOutput } from '@/services/ai/matchSummary';
import { MatchPreviewInput, MatchPreviewOutput } from '@/services/ai/matchPreview';
import { PlayerOfTheMatchInput, PlayerOfTheMatchOutput } from '@/services/ai/playerOfTheMatch';
import { AiScorecardInput, AiScorecardOutput } from '@/services/ai/aiScorecard';
import { D } from '@/lib/design-system';

interface AiMatchIntelligencePanelProps {
  homeTeamName?: string;
  awayTeamName?: string;
  venue?: string;
  matchFormat?: string;
  result?: string;
  scorecardData?: any;
}

type AiTab = 'summary' | 'preview' | 'potm' | 'scorecard';

export function AiMatchIntelligencePanel({
  homeTeamName = 'Westville Boys',
  awayTeamName = 'Kearsney College',
  venue = 'Bowsers Field',
  matchFormat = 'T20',
  result = 'Westville Boys won by 14 runs',
  scorecardData,
}: AiMatchIntelligencePanelProps) {
  const [activeTab, setActiveTab] = useState<AiTab>('summary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flow State
  const [summary, setSummary] = useState<MatchSummaryOutput | null>(null);
  const [preview, setPreview] = useState<MatchPreviewOutput | null>(null);
  const [potm, setPotm] = useState<PlayerOfTheMatchOutput | null>(null);
  const [generatedScorecard, setGeneratedScorecard] = useState<AiScorecardOutput | null>(null);

  // 1. Generate Match Summary
  const handleGenerateSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: MatchSummaryInput = {
        homeTeam: homeTeamName,
        awayTeam: awayTeamName,
        result: result || 'Match Completed',
        matchFormat,
        venue,
        scorecard: scorecardData || {
          innings1: {
            battingTeam: homeTeamName,
            total: '164/5 (20.0 overs)',
            topScorers: [
              { name: 'K. Govender', runs: 68, balls: 42 },
              { name: 'L. Smith', runs: 34, balls: 22 },
            ],
            topBowlers: [
              { name: 'J. Botha', wickets: 3, runs: 28, overs: '4.0' },
            ],
          },
          innings2: {
            battingTeam: awayTeamName,
            total: '150/8 (20.0 overs)',
            topScorers: [
              { name: 'R. Naidoo', runs: 45, balls: 31 },
            ],
            topBowlers: [
              { name: 'S. Patel', wickets: 3, runs: 19, overs: '4.0' },
              { name: 'K. Govender', wickets: 2, runs: 22, overs: '4.0' },
            ],
          },
        },
      };

      const res = await fetch('/api/ai/match-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to generate summary');
      const data: MatchSummaryOutput = await res.json();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Error executing AI summary flow');
    } finally {
      setLoading(false);
    }
  };

  // 2. Generate Match Preview
  const handleGeneratePreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: MatchPreviewInput = {
        homeTeam: {
          name: homeTeamName,
          recentForm: 'W W L W W',
          topBatter: { name: 'K. Govender', average: 44.5, strikeRate: 138.2 },
          topBowler: { name: 'S. Patel', average: 14.2, economy: 5.8 },
          winRateThisSeason: 80,
        },
        awayTeam: {
          name: awayTeamName,
          recentForm: 'L W W W L',
          topBatter: { name: 'R. Naidoo', average: 39.1, strikeRate: 124.6 },
          topBowler: { name: 'J. Botha', average: 16.8, economy: 6.4 },
          winRateThisSeason: 65,
        },
        venue,
        scheduledAt: new Date().toISOString(),
        matchFormat,
        competition: 'Coastal First XI T20 Cup',
      };

      const res = await fetch('/api/ai/match-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to generate preview');
      const data: MatchPreviewOutput = await res.json();
      setPreview(data);
    } catch (err: any) {
      setError(err.message || 'Error executing AI preview flow');
    } finally {
      setLoading(false);
    }
  };

  // 3. Select Player of the Match
  const handleSelectPOTM = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: PlayerOfTheMatchInput = {
        homeTeam: homeTeamName,
        awayTeam: awayTeamName,
        result,
        matchFormat,
        allPlayers: [
          {
            name: 'K. Govender',
            team: homeTeamName,
            batting: { runs: 68, balls: 42, fours: 6, sixes: 3, dismissed: true },
            bowling: { overs: '4.0', wickets: 2, runs: 22, maidens: 0 },
            fielding: { catches: 1, runOuts: 0, stumpings: 0 },
          },
          {
            name: 'S. Patel',
            team: homeTeamName,
            bowling: { overs: '4.0', wickets: 3, runs: 19, maidens: 1 },
          },
          {
            name: 'R. Naidoo',
            team: awayTeamName,
            batting: { runs: 45, balls: 31, fours: 4, sixes: 1, dismissed: false },
          },
          {
            name: 'J. Botha',
            team: awayTeamName,
            bowling: { overs: '4.0', wickets: 3, runs: 28, maidens: 0 },
          },
        ],
      };

      const res = await fetch('/api/ai/player-of-the-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to select POTM');
      const data: PlayerOfTheMatchOutput = await res.json();
      setPotm(data);
    } catch (err: any) {
      setError(err.message || 'Error executing POTM AI flow');
    } finally {
      setLoading(false);
    }
  };

  // 4. Generate AI Demo Scorecard
  const handleGenerateScorecard = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: AiScorecardInput = {
        homeTeam: {
          name: homeTeamName,
          players: [
            { name: 'K. Govender', role: 'Batter' },
            { name: 'L. Smith', role: 'Batter' },
            { name: 'T. Mbatha', role: 'Wicketkeeper-Batter' },
            { name: 'A. Miller', role: 'All-rounder' },
            { name: 'S. Patel', role: 'Bowler' },
            { name: 'M. Coetzee', role: 'Bowler' },
          ],
        },
        awayTeam: {
          name: awayTeamName,
          players: [
            { name: 'R. Naidoo', role: 'Batter' },
            { name: 'D. Pillay', role: 'Batter' },
            { name: 'J. Botha', role: 'Bowler' },
            { name: 'C. Edwards', role: 'All-rounder' },
            { name: 'P. Kruger', role: 'Wicketkeeper' },
            { name: 'B. Steyn', role: 'Bowler' },
          ],
        },
        tossWinner: homeTeamName,
        tossDecision: 'bat',
        overs: 20,
        venue,
      };

      const res = await fetch('/api/ai/ai-scorecard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to generate AI scorecard');
      const data: AiScorecardOutput = await res.json();
      setGeneratedScorecard(data);
    } catch (err: any) {
      setError(err.message || 'Error executing AI Scorecard generator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-3xl border border-indigo-500/20 shadow-2xl overflow-hidden p-6 space-y-6"
      style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(10,15,30,0.98))' }}
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight" style={{ fontFamily: D.head }}>
              Genkit AI Match Intelligence Engine
            </h3>
            <p className="text-xs text-indigo-300/80">Powered by Google Genkit & Gemini 2.0 Flash</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-indigo-950/40 p-1 rounded-xl border border-indigo-500/20">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'summary'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-indigo-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Report
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'preview'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-indigo-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('potm')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'potm'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-indigo-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            POTM
          </button>
          <button
            onClick={() => setActiveTab('scorecard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'scorecard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-indigo-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Simulator
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. MATCH REPORT / SUMMARY TAB */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-300">
              Generates an editorial match summary and headline directly from ball events and scorecards.
            </p>
            <button
              onClick={handleGenerateSummary}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400" />
              )}
              {summary ? 'Regenerate Summary' : 'Generate Summary'}
            </button>
          </div>

          {summary ? (
            <div className="space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-indigo-500/20">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Headline</span>
                <h4 className="text-xl font-extrabold text-white mt-0.5" style={{ fontFamily: D.head }}>
                  {summary.headline}
                </h4>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Match Report</span>
                <p className="text-sm text-slate-200 leading-relaxed mt-1 whitespace-pre-line font-sans">
                  {summary.summary}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-indigo-500/20 rounded-2xl bg-indigo-950/20 text-slate-400">
              <FileText className="w-8 h-8 text-indigo-400/50 mx-auto mb-2" />
              <p className="text-sm font-semibold">No match report generated yet.</p>
              <p className="text-xs text-slate-500 mt-1">Click &quot;Generate Summary&quot; to run Gemini AI analysis.</p>
            </div>
          )}
        </div>
      )}

      {/* 2. MATCH PREVIEW TAB */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-300">
              Synthesizes team form, head-to-head records, and key player matchups into a tactical preview.
            </p>
            <button
              onClick={handleGeneratePreview}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400" />
              )}
              {preview ? 'Regenerate Preview' : 'Generate Preview'}
            </button>
          </div>

          {preview ? (
            <div className="space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-indigo-500/20">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Preview Headline</span>
                <h4 className="text-xl font-extrabold text-white mt-0.5" style={{ fontFamily: D.head }}>
                  {preview.headline}
                </h4>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed font-sans">{preview.preview}</p>

              {preview.keyBattles && preview.keyBattles.length > 0 && (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Key Matchups</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {preview.keyBattles.map((battle, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span>{battle.batter}</span>
                          <span className="text-indigo-400 text-[10px]">vs</span>
                          <span>{battle.bowler}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{battle.context}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300">AI Win Prediction</span>
                <span className="text-xs font-extrabold text-amber-300">{preview.prediction}</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-indigo-500/20 rounded-2xl bg-indigo-950/20 text-slate-400">
              <Swords className="w-8 h-8 text-indigo-400/50 mx-auto mb-2" />
              <p className="text-sm font-semibold">No tactical preview generated yet.</p>
              <p className="text-xs text-slate-500 mt-1">Click &quot;Generate Preview&quot; to compute key battles and team form.</p>
            </div>
          )}
        </div>
      )}

      {/* 3. PLAYER OF THE MATCH TAB */}
      {activeTab === 'potm' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-300">
              Evaluates overall match impact (runs, wickets, strike rate, economy & catches) to award POTM.
            </p>
            <button
              onClick={handleSelectPOTM}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400" />
              )}
              {potm ? 'Re-evaluate POTM' : 'Evaluate POTM'}
            </button>
          </div>

          {potm ? (
            <div className="space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-indigo-500/20">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Player of the Match</span>
                  <h4 className="text-xl font-extrabold text-white" style={{ fontFamily: D.head }}>
                    {potm.playerName} <span className="text-xs font-normal text-slate-400">({potm.team})</span>
                  </h4>
                  <p className="text-xs font-bold text-amber-300 mt-0.5">{potm.performanceSummary}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Panel Justification</span>
                <p className="text-sm text-slate-200 leading-relaxed mt-1 font-sans">{potm.justification}</p>
              </div>

              {potm.shortlisted && potm.shortlisted.length > 0 && (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shortlisted Runner-ups</span>
                  <div className="space-y-2 mt-2">
                    {potm.shortlisted.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs">
                        <span className="font-bold text-white">{item.name}</span>
                        <span className="text-slate-300 text-[11px]">{item.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-indigo-500/20 rounded-2xl bg-indigo-950/20 text-slate-400">
              <Trophy className="w-8 h-8 text-indigo-400/50 mx-auto mb-2" />
              <p className="text-sm font-semibold">No Player of the Match evaluated yet.</p>
              <p className="text-xs text-slate-500 mt-1">Click &quot;Evaluate POTM&quot; to run weighted impact analysis.</p>
            </div>
          )}
        </div>
      )}

      {/* 4. AI DEMO SCORECARD SIMULATOR TAB */}
      {activeTab === 'scorecard' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-300">
              Simulates a complete realistic T20 match scorecard between two lineups for pre-match testing.
            </p>
            <button
              onClick={handleGenerateScorecard}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Cpu className="w-4 h-4 text-emerald-400" />
              )}
              {generatedScorecard ? 'Re-simulate Scorecard' : 'Simulate Scorecard'}
            </button>
          </div>

          {generatedScorecard ? (
            <div className="space-y-6 p-5 rounded-2xl bg-slate-900/60 border border-indigo-500/20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-emerald-400">Simulated Result</span>
                <span className="text-sm font-extrabold text-white" style={{ fontFamily: D.head }}>
                  {generatedScorecard.result}
                </span>
              </div>

              {/* Innings 1 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
                  <span className="text-xs font-extrabold text-amber-300">{generatedScorecard.innings1.battingTeam} (Innings 1)</span>
                  <span className="text-xs font-black text-white font-mono">
                    {generatedScorecard.innings1.total}/{generatedScorecard.innings1.wickets} ({generatedScorecard.innings1.overs} ov)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                        <th className="py-1">Batter</th>
                        <th className="py-1">Dismissal</th>
                        <th className="py-1 text-right">R</th>
                        <th className="py-1 text-right">B</th>
                        <th className="py-1 text-right">4s</th>
                        <th className="py-1 text-right">6s</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {generatedScorecard.innings1.batters.map((b, i) => (
                        <tr key={i} className="text-slate-200">
                          <td className="py-1.5 font-bold">{b.name}</td>
                          <td className="py-1.5 text-slate-400 text-[11px]">{b.howOut}</td>
                          <td className="py-1.5 text-right font-mono font-bold text-amber-300">{b.runs}</td>
                          <td className="py-1.5 text-right font-mono text-slate-400">{b.balls}</td>
                          <td className="py-1.5 text-right font-mono">{b.fours}</td>
                          <td className="py-1.5 text-right font-mono">{b.sixes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Innings 2 */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
                  <span className="text-xs font-extrabold text-indigo-300">{generatedScorecard.innings2.battingTeam} (Innings 2)</span>
                  <span className="text-xs font-black text-white font-mono">
                    {generatedScorecard.innings2.total}/{generatedScorecard.innings2.wickets} ({generatedScorecard.innings2.overs} ov)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                        <th className="py-1">Batter</th>
                        <th className="py-1">Dismissal</th>
                        <th className="py-1 text-right">R</th>
                        <th className="py-1 text-right">B</th>
                        <th className="py-1 text-right">4s</th>
                        <th className="py-1 text-right">6s</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {generatedScorecard.innings2.batters.map((b, i) => (
                        <tr key={i} className="text-slate-200">
                          <td className="py-1.5 font-bold">{b.name}</td>
                          <td className="py-1.5 text-slate-400 text-[11px]">{b.howOut}</td>
                          <td className="py-1.5 text-right font-mono font-bold text-indigo-300">{b.runs}</td>
                          <td className="py-1.5 text-right font-mono text-slate-400">{b.balls}</td>
                          <td className="py-1.5 text-right font-mono">{b.fours}</td>
                          <td className="py-1.5 text-right font-mono">{b.sixes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-indigo-500/20 rounded-2xl bg-indigo-950/20 text-slate-400">
              <Cpu className="w-8 h-8 text-indigo-400/50 mx-auto mb-2" />
              <p className="text-sm font-semibold">No scorecard simulation generated yet.</p>
              <p className="text-xs text-slate-500 mt-1">Click &quot;Simulate Scorecard&quot; to synthesize a complete 20-over match.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
