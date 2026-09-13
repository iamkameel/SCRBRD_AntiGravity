"use client";

import React, { useState } from "react";
import { Eye, Volume2, CheckCircle2, XCircle, RotateCcw, Activity } from "lucide-react";

interface DRSReviewProps {
  onDecision: (result: "OUT" | "NOT_OUT" | "UMPIRES_CALL") => void;
  onClose: () => void;
  batterName?: string;
  bowlerName?: string;
  appealReason?: string;
}

export function DRSReview({
  onDecision,
  onClose,
  batterName = "Top Order Batter",
  bowlerName = "Opening Fast Bowler",
  appealReason = "LBW",
}: DRSReviewProps) {
  const [step, setStep] = useState<"ultraedge" | "tracking" | "decision">("ultraedge");
  const [ultraedgeSpike, setUltraedgeSpike] = useState<boolean | null>(null);
  const [pitching, setPitching] = useState<"IN_LINE" | "OUTSIDE_LEG" | "OUTSIDE_OFF">("IN_LINE");
  const [impact, setImpact] = useState<"IN_LINE" | "OUTSIDE">("IN_LINE");
  const [wickets, setWickets] = useState<"HITTING" | "MISSING" | "UMPIRES_CALL">("HITTING");

  const isOut =
    appealReason === "Caught" || appealReason === "Edged"
      ? ultraedgeSpike === true
      : pitching === "IN_LINE" && impact === "IN_LINE" && wickets === "HITTING";

  const isUmpiresCall = wickets === "UMPIRES_CALL";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-foreground">
                DRS Third Umpire Decision System
              </h2>
              <p className="text-xs text-muted-foreground">
                Review: {appealReason} · {batterName} vs {bowlerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-mono text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5"
          >
            ESC Close
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
          <button
            onClick={() => setStep("ultraedge")}
            className={`p-2.5 rounded-xl border transition-all ${
              step === "ultraedge"
                ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/50"
                : "bg-secondary/40 text-muted-foreground border-transparent"
            }`}
          >
            1. UltraEdge Audio
          </button>
          <button
            onClick={() => setStep("tracking")}
            className={`p-2.5 rounded-xl border transition-all ${
              step === "tracking"
                ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/50"
                : "bg-secondary/40 text-muted-foreground border-transparent"
            }`}
          >
            2. Ball Tracking
          </button>
          <button
            onClick={() => setStep("decision")}
            className={`p-2.5 rounded-xl border transition-all ${
              step === "decision"
                ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/50"
                : "bg-secondary/40 text-muted-foreground border-transparent"
            }`}
          >
            3. Final Decision
          </button>
        </div>

        {/* Step 1: UltraEdge */}
        {step === "ultraedge" && (
          <div className="space-y-5">
            <div className="bg-black/50 border border-white/10 rounded-2xl p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-xs text-indigo-400 font-mono">
                <Volume2 className="h-4 w-4 animate-pulse" /> Soundwave Frequency Telemetry
              </div>

              {/* Simulated Waveform Visualizer */}
              <div className="h-24 flex items-center justify-center gap-1.5 px-4 bg-indigo-950/20 rounded-xl overflow-hidden">
                {Array.from({ length: 32 }).map((_, i) => {
                  const isCenterSpike = ultraedgeSpike && i >= 14 && i <= 17;
                  const height = isCenterSpike
                    ? `${Math.random() * 60 + 35}%`
                    : `${Math.random() * 20 + 8}%`;
                  return (
                    <div
                      key={i}
                      className={`w-2 rounded-full transition-all duration-300 ${
                        isCenterSpike ? "bg-red-500 shadow-lg shadow-red-500/50" : "bg-indigo-500/40"
                      }`}
                      style={{ height }}
                    />
                  );
                })}
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setUltraedgeSpike(true)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                    ultraedgeSpike === true
                      ? "bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/30"
                      : "bg-secondary text-muted-foreground border-white/10"
                  }`}
                >
                  <Activity className="h-4 w-4 inline mr-1" /> Spike Detected (Wood/Edge)
                </button>
                <button
                  onClick={() => setUltraedgeSpike(false)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                    ultraedgeSpike === false
                      ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30"
                      : "bg-secondary text-muted-foreground border-white/10"
                  }`}
                >
                  No Spike (Flat Line)
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep("tracking")}
                className="px-6 py-2.5 bg-primary text-primary-foreground font-mono text-xs font-bold rounded-xl shadow-lg hover:brightness-110"
              >
                Next: Ball Tracking →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Ball Tracking */}
        {step === "tracking" && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-secondary/30 border border-white/10 rounded-2xl p-4 space-y-2">
                <span className="text-[11px] font-mono text-muted-foreground uppercase">1. Pitching</span>
                <select
                  value={pitching}
                  onChange={(e) => setPitching(e.target.value as any)}
                  className="w-full bg-card border border-white/10 rounded-xl p-2 text-xs font-mono text-foreground outline-none"
                >
                  <option value="IN_LINE">In Line</option>
                  <option value="OUTSIDE_LEG">Outside Leg</option>
                  <option value="OUTSIDE_OFF">Outside Off</option>
                </select>
              </div>

              <div className="bg-secondary/30 border border-white/10 rounded-2xl p-4 space-y-2">
                <span className="text-[11px] font-mono text-muted-foreground uppercase">2. Impact</span>
                <select
                  value={impact}
                  onChange={(e) => setImpact(e.target.value as any)}
                  className="w-full bg-card border border-white/10 rounded-xl p-2 text-xs font-mono text-foreground outline-none"
                >
                  <option value="IN_LINE">In Line</option>
                  <option value="OUTSIDE">Outside</option>
                </select>
              </div>

              <div className="bg-secondary/30 border border-white/10 rounded-2xl p-4 space-y-2">
                <span className="text-[11px] font-mono text-muted-foreground uppercase">3. Wickets</span>
                <select
                  value={wickets}
                  onChange={(e) => setWickets(e.target.value as any)}
                  className="w-full bg-card border border-white/10 rounded-xl p-2 text-xs font-mono text-foreground outline-none"
                >
                  <option value="HITTING">Hitting Wickets</option>
                  <option value="UMPIRES_CALL">Umpire&apos;s Call</option>
                  <option value="MISSING">Missing Wickets</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep("ultraedge")}
                className="px-4 py-2 bg-secondary text-muted-foreground font-mono text-xs rounded-xl"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep("decision")}
                className="px-6 py-2.5 bg-primary text-primary-foreground font-mono text-xs font-bold rounded-xl shadow-lg hover:brightness-110"
              >
                Next: Final Decision →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Decision */}
        {step === "decision" && (
          <div className="space-y-6 text-center">
            <div
              className={`p-8 rounded-3xl border ${
                isOut
                  ? "bg-red-500/15 border-red-500/40 text-red-500"
                  : isUmpiresCall
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-500"
                  : "bg-emerald-500/15 border-emerald-500/40 text-emerald-500"
              }`}
            >
              <div className="flex justify-center mb-3">
                {isOut ? (
                  <XCircle className="h-16 w-16 text-red-500" />
                ) : isUmpiresCall ? (
                  <RotateCcw className="h-16 w-16 text-amber-500" />
                ) : (
                  <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                )}
              </div>
              <h1 className="font-display font-black text-4xl tracking-tight uppercase">
                {isOut ? "OUT" : isUmpiresCall ? "UMPIRE'S CALL" : "NOT OUT"}
              </h1>
              <p className="text-xs font-mono text-muted-foreground mt-2">
                UltraEdge: {ultraedgeSpike === true ? "Spike" : "No Spike"} · Pitching: {pitching} · Impact: {impact} · Wickets: {wickets}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  onDecision(isOut ? "OUT" : isUmpiresCall ? "UMPIRES_CALL" : "NOT_OUT");
                  onClose();
                }}
                className="px-8 py-3 bg-primary text-primary-foreground font-mono text-sm font-bold rounded-2xl shadow-xl hover:brightness-110"
              >
                Confirm & Lock Decision
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
