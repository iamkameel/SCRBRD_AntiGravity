"use client";

import { X, ChevronRight, BarChart2, Video, FileText, Target, Activity } from "lucide-react";
import { D } from "@/lib/design-system";
import { Button } from "@/components/ui/button";

export interface InspectorData {
  title: string;
  subtitle?: string;
  category?: string;
  metrics?: { label: string; value: string | number; accent?: boolean }[];
  details?: { label: string; value: string }[];
  coachNotes?: string;
  recentEvents?: { title: string; meta: string; value: string }[];
}

interface InspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: InspectorData | null;
}

export function InspectorDrawer({ isOpen, onClose, data }: InspectorDrawerProps) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in" 
        onClick={onClose} 
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#0c0c10] border-l border-zinc-200 dark:border-white/10 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between bg-zinc-50 dark:bg-white/[0.02]">
          <div className="space-y-1">
            {data.category && (
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-[#22c55e]" style={{ fontFamily: D.mono }}>
                {data.category}
              </span>
            )}
            <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight" style={{ fontFamily: D.head }}>
              {data.title}
            </h2>
            {data.subtitle && (
              <p className="text-xs text-zinc-500 dark:text-white/40">{data.subtitle}</p>
            )}
          </div>
          <Button
            onClick={onClose}
            size="icon"
            variant="ghost"
            className="rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metrics Grid */}
          {data.metrics && data.metrics.length > 0 && (
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-white/30" style={{ fontFamily: D.mono }}>
                Performance Metrics
              </span>
              <div className="grid grid-cols-2 gap-3">
                {data.metrics.map((m, i) => (
                  <div 
                    key={i} 
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03]"
                  >
                    <div className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-white/40" style={{ fontFamily: D.mono }}>
                      {m.label}
                    </div>
                    <div className={`text-xl font-black mt-1 ${m.accent ? "text-emerald-600 dark:text-[#22c55e]" : "text-zinc-900 dark:text-white"}`} style={{ fontFamily: D.head }}>
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Specifications */}
          {data.details && data.details.length > 0 && (
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-white/30" style={{ fontFamily: D.mono }}>
                Analytical Details
              </span>
              <div className="rounded-xl border border-zinc-200 dark:border-white/10 divide-y divide-zinc-200 dark:divide-white/10 overflow-hidden bg-zinc-50/50 dark:bg-white/[0.02]">
                {data.details.map((d, i) => (
                  <div key={i} className="p-3 flex justify-between items-center text-xs">
                    <span className="text-zinc-500 dark:text-white/50">{d.label}</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coach / AI Notes */}
          {data.coachNotes && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-zinc-400 dark:text-white/30">
                <FileText className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-wider" style={{ fontFamily: D.mono }}>
                  Analytical Assessment & Notes
                </span>
              </div>
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-zinc-800 dark:text-white/80 text-xs leading-relaxed">
                {data.coachNotes}
              </div>
            </div>
          )}

          {/* Recent Event Log */}
          {data.recentEvents && data.recentEvents.length > 0 && (
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-white/30" style={{ fontFamily: D.mono }}>
                Match Instances & Evidence
              </span>
              <div className="space-y-2">
                {data.recentEvents.map((e, i) => (
                  <div key={i} className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-white">{e.title}</div>
                      <div className="text-[10px] text-zinc-500 dark:text-white/40">{e.meta}</div>
                    </div>
                    <div className="font-black text-emerald-600 dark:text-[#22c55e]">{e.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] flex items-center justify-between">
          <span className="text-[10px] text-zinc-400 dark:text-white/30" style={{ fontFamily: D.mono }}>
            SCRBRD Intelligence Inspector
          </span>
          <Button
            onClick={onClose}
            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-[10px] font-bold uppercase tracking-wider rounded-xl px-4 py-1.5"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
