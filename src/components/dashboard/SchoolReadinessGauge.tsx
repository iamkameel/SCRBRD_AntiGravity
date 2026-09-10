"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, AlertTriangle, Users, MapPin, Truck, Award } from "lucide-react";
import { D } from "@/lib/design-system";

export interface ReadinessMetric {
  category: string;
  ready: number;
  total: number;
  icon: any;
  color: string;
}

export function SchoolReadinessGauge() {
  const readinessItems: ReadinessMetric[] = [
    { category: "Match-Day Squads", ready: 6, total: 6, icon: Users, color: D.emerald },
    { category: "Pitch & Field Prep", ready: 5, total: 6, icon: MapPin, color: D.amber },
    { category: "Transport Manifests", ready: 4, total: 4, icon: Truck, color: D.sky },
    { category: "Officials & Umpires", ready: 6, total: 6, icon: Award, color: D.violet },
  ];

  const totalItems = readinessItems.reduce((acc, item) => acc + item.total, 0);
  const totalReady = readinessItems.reduce((acc, item) => acc + item.ready, 0);
  const overallPercentage = Math.round((totalReady / totalItems) * 100);

  // SVG Radial Gauge Calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPercentage / 100) * circumference;

  return (
    <div
      className="p-6 md:p-8 rounded-2xl border shadow-xl relative overflow-hidden"
      style={{ background: D.surf1, borderColor: D.border }}
    >
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Left: Interactive Radial Progress Gauge */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke={D.surf3}
              strokeWidth="10"
              fill="transparent"
            />
            <motion.circle
              cx="72"
              cy="72"
              r={radius}
              stroke={D.emerald}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span
              className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
              style={{ fontFamily: D.mono }}
            >
              {overallPercentage}%
            </span>
            <span
              className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400"
              style={{ fontFamily: D.sans }}
            >
              System Ready
            </span>
          </div>
        </div>

        {/* Right: Operational Breakdown */}
        <div className="flex-1 space-y-4 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: D.head }}>
                Match-Day Operations Telemetry
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5" style={{ fontFamily: D.sans }}>
                Real-time check on squad, pitch, logistics & officiating clearances
              </p>
            </div>
            <div
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold"
              style={{ background: `${D.emerald}10`, borderColor: `${D.emerald}25`, color: D.emerald }}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Operational Clearance
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {readinessItems.map((item, idx) => {
              const pct = Math.round((item.ready / item.total) * 100);
              const isComplete = item.ready === item.total;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl border transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  style={{ background: D.surf2, borderColor: D.border }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg border"
                      style={{ background: `${item.color}15`, borderColor: `${item.color}30`, color: item.color }}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white" style={{ fontFamily: D.sans }}>
                        {item.category}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold" style={{ fontFamily: D.mono }}>
                        {item.ready} of {item.total} Cleared
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                    )}
                    <span
                      className="text-xs font-bold"
                      style={{ fontFamily: D.mono, color: isComplete ? D.emerald : D.amber }}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
