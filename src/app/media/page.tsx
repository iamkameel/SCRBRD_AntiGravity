"use client";

import React, { useState } from 'react';
import { 
  Tv, 
  Video, 
  Radio, 
  Scissors, 
  Newspaper, 
  Sparkles, 
  Settings2, 
  Layers, 
  Zap, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Sliders,
  PlayCircle
} from 'lucide-react';
import { D } from '@/lib/design-system';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BroadcastOverlayEngine } from "@/components/media/BroadcastOverlayEngine";
import { AutomatedMatchBulletin } from "@/components/media/AutomatedMatchBulletin";
import { HighlightClipper } from "@/components/media/HighlightClipper";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function MediaPage() {
  const [activeMediaTab, setActiveMediaTab] = useState<'overlay' | 'clipper' | 'bulletin' | 'guide'>('overlay');

  return (
    <RouteGuard module="media" label="Broadcast & Media Engine">
      <div className="space-y-10 pb-24 max-w-7xl mx-auto p-4 md:p-8">
        {/* Strategic Header */}
        <div 
          className="relative p-8 md:p-10 rounded-[3rem] border overflow-hidden shadow-2xl"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          <div className="absolute inset-0 opacity-10" style={{ background: D.gradGold }} />
          <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
            <div 
              className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-inner" 
              style={{ background: D.surf2, border: `1px solid ${D.border}` }}
            >
              <Tv className="h-12 w-12 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] italic text-amber-400">
                  TV-GRADE LIVE BROADCAST ENGINE
                </span>
                <Badge className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[9px] font-mono">
                  OBS / vMIX READY
                </Badge>
              </div>
              <h1 
                className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none" 
                style={{ fontFamily: D.head, color: D.textPrimary }}
              >
                BROADCAST & <span className="text-amber-400">MEDIA STUDIO</span>
              </h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] mt-3 opacity-60 italic" style={{ color: D.textMuted }}>
                STREAM GRAPHICS • CHROMA KEY OVERLAYS • HIGHLIGHT CLIPPER • AI NEWS BULLETINS
              </p>
            </div>

            <div className="lg:ml-auto grid grid-cols-2 md:grid-cols-3 gap-4 w-full lg:w-auto">
              <div className="p-4 rounded-2xl border bg-black/20 text-center" style={{ borderColor: D.border }}>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-1">STREAM QUALITY</span>
                <div className="text-xl font-black text-emerald-400 font-mono">1080p60</div>
              </div>
              <div className="p-4 rounded-2xl border bg-black/20 text-center" style={{ borderColor: D.border }}>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-1">WEBSOCKET LATENCY</span>
                <div className="text-xl font-black text-amber-400 font-mono">14ms</div>
              </div>
              <div className="p-4 rounded-2xl border bg-black/20 text-center col-span-2 md:col-span-1" style={{ borderColor: D.border }}>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-1">GRAPHICS MODES</span>
                <div className="text-xl font-black text-sky-400 font-mono">6 MODES</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-3 p-2 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
          <button
            onClick={() => setActiveMediaTab('overlay')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeMediaTab === 'overlay' ? 'text-black shadow-xl' : 'opacity-40 hover:opacity-100'
            }`}
            style={{ background: activeMediaTab === 'overlay' ? D.amber : 'transparent', color: activeMediaTab === 'overlay' ? 'black' : D.textPrimary }}
          >
            <Tv className="w-4 h-4" /> Broadcast Graphics Engine
          </button>

          <button
            onClick={() => setActiveMediaTab('clipper')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeMediaTab === 'clipper' ? 'text-black shadow-xl' : 'opacity-40 hover:opacity-100'
            }`}
            style={{ background: activeMediaTab === 'clipper' ? D.sky : 'transparent', color: activeMediaTab === 'clipper' ? 'black' : D.textPrimary }}
          >
            <Scissors className="w-4 h-4" /> Highlight Clipper & Reel
          </button>

          <button
            onClick={() => setActiveMediaTab('bulletin')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeMediaTab === 'bulletin' ? 'text-white shadow-xl' : 'opacity-40 hover:opacity-100'
            }`}
            style={{ background: activeMediaTab === 'bulletin' ? D.indigo : 'transparent', color: activeMediaTab === 'bulletin' ? 'white' : D.textPrimary }}
          >
            <Newspaper className="w-4 h-4" /> AI News Bulletin Generator
          </button>

          <button
            onClick={() => setActiveMediaTab('guide')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeMediaTab === 'guide' ? 'text-black shadow-xl' : 'opacity-40 hover:opacity-100'
            }`}
            style={{ background: activeMediaTab === 'guide' ? D.emerald : 'transparent', color: activeMediaTab === 'guide' ? 'black' : D.textPrimary }}
          >
            <Settings2 className="w-4 h-4" /> OBS / vMix Setup Guide
          </button>
        </div>

        {/* TAB 1: BROADCAST OVERLAY ENGINE */}
        {activeMediaTab === 'overlay' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <BroadcastOverlayEngine />
          </motion.div>
        )}

        {/* TAB 2: HIGHLIGHT CLIPPER */}
        {activeMediaTab === 'clipper' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <HighlightClipper />
          </motion.div>
        )}

        {/* TAB 3: AUTOMATED MATCH BULLETIN */}
        {activeMediaTab === 'bulletin' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AutomatedMatchBulletin />
          </motion.div>
        )}

        {/* TAB 4: OBS / VMIX SETUP GUIDE */}
        {activeMediaTab === 'guide' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="p-8 rounded-[2.5rem] border bg-black/40 space-y-6" style={{ borderColor: D.border }}>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">PRODUCTION SETUP GUIDE</span>
                <h3 className="text-2xl font-black uppercase italic text-white" style={{ fontFamily: D.head }}>
                  CONNECTING SCRBRD OVERLAYS TO OBS & vMIX
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">1</div>
                  <h4 className="text-base font-bold text-white">Copy Browser Source URL</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Click &quot;Copy OBS Browser Source URL&quot; in the Broadcast Engine tab to grab your unique match overlay URL.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center">2</div>
                  <h4 className="text-base font-bold text-white">Add Browser Source in OBS</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    In OBS Studio, click <b className="text-white">+ Sources</b> → <b className="text-white">Browser</b>. Set resolution to <b className="text-amber-400">1920 x 1080</b>.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">3</div>
                  <h4 className="text-base font-bold text-white">Enable Chroma Key (If Needed)</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    If using hardware switchers (vMix / Atem Mini), turn on Chroma Key mode to output a pure <b className="text-emerald-400">#00FF00</b> green backdrop.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </RouteGuard>
  );
}
