"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Trophy, Users, BarChart3, Target, Zap, Shield, TrendingUp, Award,
  CheckCircle2, ArrowRight, Database, Activity, Network, Brain,
  Fingerprint, MessageSquare, BarChart, Map, ShieldCheck, Dumbbell,
  Truck, History, ChevronRight, ArrowUpRight, Wifi, Clock, Star,
} from "lucide-react";
import { LiveSection } from "@/components/home/LiveSection";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   TICKER — scrolling live-data strip
───────────────────────────────────────────── */
const tickerItems = [
  { label: "LIVE", text: "St John's vs Kingswood — 164/4 · 18.2 overs", hot: true },
  { label: "RESULT", text: "Bishops College won vs Hilton by 3 runs", hot: false },
  { label: "MILESTONE", text: "J. Ndlovu passes 500 career runs", hot: false },
  { label: "LIVE", text: "Durban High vs Grey — 89/3 · 11.0 overs", hot: true },
  { label: "UPCOMING", text: "SA U19 vs India U19 — starts in 45 min", hot: false },
  { label: "AWARD", text: "Player of the Match: A. Sharma — 78 off 52", hot: false },
];

function Ticker() {
  // Content is doubled so a translateX(-50%) loop is seamless; the animation
  // runs on the compositor instead of a React re-render per frame.
  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div className="w-full overflow-hidden border-b border-t border-white/[0.06] bg-white/[0.015] py-2.5 relative z-10">
      <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#060606] to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#060606] to-transparent z-20 pointer-events-none" />
      <div className="flex gap-10 whitespace-nowrap w-max scrbrd-ticker">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-3 flex-shrink-0">
            <span
              className={cn(
                "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border",
                item.hot
                  ? "text-red-400 border-red-500/30 bg-red-500/10"
                  : "text-white/30 border-white/10 bg-white/5"
              )}
            >
              {item.hot && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse mr-1.5 -mb-px" />
              )}
              {item.label}
            </span>
            <span className="text-[11px] font-medium text-white/50">{item.text}</span>
            <span className="text-white/10 text-sm">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FLOATING NAV
───────────────────────────────────────────── */
function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[#060606]/90 backdrop-blur-2xl border-b border-white/[0.06] py-3 shadow-2xl shadow-black/50"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#22c55e] flex items-center justify-center shadow-lg shadow-[#22c55e]/30">
            <Zap className="h-4 w-4 text-black fill-black" />
          </div>
          <span className="text-lg font-black tracking-tighter text-white">SCRBRD</span>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-1.5 py-0.5 rounded ml-1">OS</span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Platform", href: "/ecosystem" },
            { label: "Features", href: "/features" },
            { label: "Live Matches", href: "/fixtures" },
            { label: "Pitch Deck", href: "/pitch-deck" },
          ].map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-[11px] font-black uppercase tracking-widest text-white/50 hover:text-white h-9 px-4">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="h-9 px-5 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#22c55e] text-black hover:bg-[#16a34a] shadow-lg shadow-[#22c55e]/20">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────
   HERO STAT CHIP
───────────────────────────────────────────── */
function HeroChip({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-[#22c55e]/30 hover:bg-[#22c55e]/5 transition-all duration-300 group">
      <div className="w-8 h-8 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-[#22c55e]" />
      </div>
      <div>
        <div className="text-xl font-black text-white tracking-tighter leading-none">{value}</div>
        <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   OS LAYER CARD
───────────────────────────────────────────── */
interface OSLayer {
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
  accentBg: string;
  tag: string;
}

function OSLayerCard({ layer, index }: { layer: OSLayer; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      viewport={{ once: true }}
      className="group relative rounded-[2rem] border border-white/[0.07] bg-[#0a0a0a] overflow-hidden hover:border-white/20 transition-all duration-500 p-8 flex flex-col gap-6"
    >
      {/* accent glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${layer.accent}, transparent)` }}
      />
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"
        style={{ background: layer.accent }}
      />

      <div className="flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110"
          style={{
            background: `${layer.accent}14`,
            borderColor: `${layer.accent}30`,
          }}
        >
          <layer.icon className="h-6 w-6" style={{ color: layer.accent }} />
        </div>
        <span
          className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border"
          style={{
            color: layer.accent,
            background: `${layer.accent}12`,
            borderColor: `${layer.accent}30`,
          }}
        >
          {layer.tag}
        </span>
      </div>

      <div>
        <h3 className="text-lg font-black text-white mb-2 tracking-tight">{layer.title}</h3>
        <p className="text-sm text-white/40 leading-relaxed font-medium">{layer.description}</p>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mt-auto" style={{ color: layer.accent }}>
        Explore
        <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   FEATURE ROW ITEM
───────────────────────────────────────────── */
function FeatureItem({ icon: Icon, title, description, index }: { icon: React.ElementType; title: string; description: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      viewport={{ once: true }}
      className="flex gap-5 group"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center group-hover:border-[#22c55e]/30 group-hover:bg-[#22c55e]/5 transition-all duration-300">
        <Icon className="h-5 w-5 text-[#22c55e]/60 group-hover:text-[#22c55e] transition-colors" />
      </div>
      <div className="pt-1">
        <h3 className="text-base font-black text-white/80 mb-1 tracking-tight group-hover:text-white transition-colors">{title}</h3>
        <p className="text-sm text-white/35 leading-relaxed font-medium">{description}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const osLayers: OSLayer[] = [
  { icon: Network, title: "Competition Engine", description: "Automated league structures, fixture generation, and live standings across all age groups and divisions.", accent: "#3b82f6", accentBg: "bg-blue-500/10", tag: "Core" },
  { icon: ShieldCheck, title: "Team Operations", description: "Digital squad selection, match-day readiness boards, and real-time availability tracking for every fixture.", accent: "#22c55e", accentBg: "bg-emerald-500/10", tag: "Core" },
  { icon: Activity, title: "Match Engine", description: "Elite event-driven scoring. Ball-by-ball precision with integrated match intelligence and live overlays.", accent: "#f97316", accentBg: "bg-orange-500/10", tag: "Core" },
  { icon: Brain, title: "Intelligence Engine", description: "Transform raw events into deep analytics, form trends, and predictive performance insights.", accent: "#a855f7", accentBg: "bg-purple-500/10", tag: "AI" },
  { icon: Fingerprint, title: "Identity Engine", description: "Durable digital identities for every player. A permanent record of growth, stats, and milestones across seasons.", accent: "#f43f5e", accentBg: "bg-rose-500/10", tag: "Data" },
  { icon: MessageSquare, title: "Comm & Admin Hub", description: "Automated notifications, fixture confirmations, and school-wide reporting workflows. The sticky layer.", accent: "#06b6d4", accentBg: "bg-cyan-500/10", tag: "Ops" },
];

const features = [
  { icon: Map, title: "Visual Intelligence", description: "Elite wagon wheels, pitch maps, and shot-zone distribution for every innings — rendered in real time." },
  { icon: Shield, title: "Player Readiness", description: "Automated medical clearances, injury tracking, and workload management integrated into selection." },
  { icon: BarChart, title: "Impact Metrics", description: "Advanced performance indices that value match-winning contributions over raw volume statistics." },
  { icon: Dumbbell, title: "Training Engine", description: "AI-driven drill recommendations based on individual skill gaps, role archetypes, and performance data." },
  { icon: Truck, title: "Logistics Hub", description: "Integrated facility bookings and transport manifest management for all away fixtures and trips." },
  { icon: History, title: "Career Archive", description: "Comprehensive historical records that build an institutional memory for the school — season by season." },
];

const platformStats = [
  { value: "12K+", label: "Active Matches", icon: Activity },
  { value: "85", label: "Partner Schools", icon: Users },
  { value: "15K+", label: "Player Profiles", icon: Fingerprint },
  { value: "1M+", label: "Ball Events", icon: Database },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 80]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#060606] selection:bg-[#22c55e]/30 text-white">
      <FloatingNav />

      {/* ═══════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20">
        {/* Background elements */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(34,197,94,0.12),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_80%_60%,rgba(99,102,241,0.06),transparent)]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </motion.div>

        {/* Ticker strip */}
        <div className="absolute top-[72px] left-0 right-0">
          <Ticker />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-24 z-10">
          <div className="max-w-5xl">
            {/* System badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 mb-10"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/25">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22c55e]">
                  The Operating System for School Cricket
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07]">
                <Wifi className="h-3 w-3 text-white/30" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/25">Live Network</span>
              </div>
            </motion.div>

            {/* Main headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-[-0.04em] leading-[0.9] mb-8">
                <span className="text-white">CRICKET</span>
                <br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #4ade80 100%)" }}
                >
                  REINVENTED.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/45 max-w-2xl leading-relaxed font-medium mb-12">
                SCRBRD is the digital infrastructure layer connecting school cricket operations, live scoring, player development, and institutional history — in one canonical platform.
              </p>
            </motion.div>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-4 mb-16"
            >
              <Link href="/signup">
                <Button className="h-14 px-10 rounded-2xl text-sm font-black uppercase tracking-widest bg-[#22c55e] text-black hover:bg-[#16a34a] shadow-2xl shadow-[#22c55e]/25 group transition-all">
                  Enter The Hub
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="h-14 px-10 rounded-2xl text-sm font-black uppercase tracking-widest text-white/50 hover:text-white border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04] backdrop-blur-sm transition-all"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/pitch-deck" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="h-14 px-8 rounded-2xl text-sm font-black uppercase tracking-widest text-[#22c55e]/60 hover:text-[#22c55e] border border-[#22c55e]/10 hover:border-[#22c55e]/30 hover:bg-[#22c55e]/5 transition-all"
                >
                  Investor Deck
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap gap-3"
            >
              {platformStats.map((s, i) => (
                <HeroChip key={i} value={s.value} label={s.label} icon={s.icon} />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent to-white/40" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/50">Scroll</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LIVE SECTION (Live Matches Hub)
      ════════════════════════════════════════════ */}
      <div className="relative z-10 border-t border-white/[0.06]">
        <LiveSection />
      </div>

      {/* ═══════════════════════════════════════════
          TRUTH STRIP
      ════════════════════════════════════════════ */}
      <section className="py-16 border-t border-b border-white/[0.05] bg-white/[0.01] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(34,197,94,0.04),transparent)]" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25">The Platform Principle</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06] rounded-3xl overflow-hidden">
            {[
              {
                label: "Not just a scorer",
                body: "Most platforms stop at match day. SCRBRD is the infrastructure that connects every fixture to every player profile — permanently.",
                color: "#22c55e",
              },
              {
                label: "Not just analytics",
                body: "Analytics without context is noise. SCRBRD builds a longitudinal record — season on season — so every number means something.",
                color: "#3b82f6",
              },
              {
                label: "Not just software",
                body: "When schools use SCRBRD across all cricket operations, leaving becomes painful. That's operating-system territory.",
                color: "#a855f7",
              },
            ].map((item, i) => (
              <div key={i} className="bg-[#0a0a0a] p-8 md:p-10 group hover:bg-[#0e0e0e] transition-colors">
                <div className="w-2 h-2 rounded-full mb-5" style={{ background: item.color }} />
                <h3 className="text-base font-black text-white mb-3 tracking-tight">{item.label}</h3>
                <p className="text-sm text-white/35 leading-relaxed font-medium">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SIX OS LAYERS
      ════════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_50%_50%,rgba(34,197,94,0.04),transparent)]" />
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5">
                <Network className="h-3.5 w-3.5 text-[#22c55e]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Architecture</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-white mb-4">
                Six Core<br />
                <span className="text-[#22c55e]">Operating Layers</span>
              </h2>
              <p className="text-base text-white/40 leading-relaxed font-medium">
                SCRBRD isn&apos;t a scoring app. It&apos;s a fully-integrated digital environment where every action feeds a school-wide cricket intelligence ecosystem.
              </p>
            </div>
            <Link href="/ecosystem">
              <Button className="h-12 px-7 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-white/[0.05] border border-white/[0.1] text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all">
                Explore Ecosystem
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {osLayers.map((layer, i) => (
              <OSLayerCard key={i} layer={layer} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          IMPACT STATS BAND
      ════════════════════════════════════════════ */}
      <section className="relative py-20 border-t border-b border-white/[0.05] overflow-hidden">
        <div className="absolute inset-0 bg-[#080808]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,rgba(34,197,94,0.06),transparent)]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-black tracking-[-0.03em] text-white mb-2">
              Built at school grade. <span className="text-[#22c55e]">Scaled for the network.</span>
            </h2>
            <p className="text-sm text-white/30 font-medium">Real numbers from live deployments.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {platformStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div
                  className="text-5xl md:text-6xl font-black tracking-[-0.04em] mb-2 text-transparent bg-clip-text group-hover:scale-105 transition-transform inline-block"
                  style={{ backgroundImage: "linear-gradient(135deg, #ffffff 0%, #22c55e 100%)" }}
                >
                  {stat.value}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          POWERHOUSE FEATURES
      ════════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            {/* Left sticky header */}
            <div className="lg:sticky lg:top-28">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
                <Zap className="h-3.5 w-3.5 text-[#22c55e]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Capabilities</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-white mb-6 leading-[1.1]">
                Powerhouse capabilities.<br />
                <span className="text-[#22c55e]">School-grade ambition.</span>
              </h2>
              <p className="text-base text-white/40 leading-relaxed font-medium mb-8">
                Elite tools that transform raw high-school match data into institutional knowledge, professional development pathways, and a permanent competitive edge.
              </p>

              {/* Pillar badges */}
              <div className="flex flex-wrap gap-2">
                {["Reliable", "Scalable", "Data-First", "School-Native", "Open"].map((p) => (
                  <div key={p} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                    <CheckCircle2 className="h-3 w-3 text-[#22c55e]" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{p}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-10">
                <Link href="/features">
                  <Button className="h-12 px-7 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-[#22c55e]/10 border border-[#22c55e]/25 text-[#22c55e] hover:bg-[#22c55e]/20 transition-all">
                    View All Features
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: feature list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((f, i) => (
                <FeatureItem key={i} icon={f.icon} title={f.title} description={f.description} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════════ */}
      <section className="py-28 px-6 relative overflow-hidden border-t border-white/[0.05]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(34,197,94,0.08),transparent)]" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/25 mb-8">
              <Trophy className="h-4 w-4 text-[#22c55e]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22c55e]">Join the network</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black tracking-[-0.04em] leading-[0.9] mb-8">
              READY TO
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #22c55e 0%, #4ade80 50%, #22c55e 100%)" }}
              >
                OPERATE?
              </span>
            </h2>

            <p className="text-lg md:text-xl text-white/40 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Join the institutional network of schools redefining the standards of cricket management — one season at a time.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link href="/signup">
                <Button className="h-16 px-14 rounded-2xl text-base font-black uppercase tracking-widest bg-[#22c55e] text-black hover:bg-[#16a34a] shadow-2xl shadow-[#22c55e]/30 group transition-all">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="h-16 px-14 rounded-2xl text-base font-black uppercase tracking-widest border-white/15 text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/30 backdrop-blur-sm transition-all"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.05] py-20 bg-[#060606]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Top row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
            {/* Brand col */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-[#22c55e] flex items-center justify-center shadow-lg shadow-[#22c55e]/30">
                  <Zap className="h-4 w-4 text-black fill-black" />
                </div>
                <span className="text-lg font-black tracking-tighter text-white">SCRBRD</span>
              </div>
              <p className="text-xs text-white/30 leading-relaxed font-medium mb-4">
                The canonical source of truth for school cricket operations.
              </p>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-[#22c55e]">System Online</span>
              </div>
            </div>

            {[
              {
                title: "Discovery",
                links: [
                  { label: "OS Features", href: "/features" },
                  { label: "Ecosystem Map", href: "/ecosystem" },
                  { label: "Pitch Deck", href: "/pitch-deck" },
                ],
              },
              {
                title: "Platform",
                links: [
                  { label: "Live Matches", href: "/fixtures" },
                  { label: "Player Profiles", href: "/players" },
                  { label: "Schools", href: "/schools" },
                ],
              },
              {
                title: "Intel",
                links: [
                  { label: "Help Center", href: "/help" },
                  { label: "Rulebook", href: "/rulebook" },
                  { label: "Status Board", href: "#" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { label: "Privacy", href: "#" },
                  { label: "Terms", href: "#" },
                  { label: "Security", href: "#" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25 mb-5">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-xs font-medium text-white/35 hover:text-white transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-white/20 font-medium">
              © 2026 SCRBRD Cricket OS · Built for schools, scaled for the network.
            </p>
            <div className="flex items-center gap-4 text-[10px] text-white/20 font-medium">
              <span>Syne · DM Mono · DM Sans</span>
              <span>·</span>
              <span>Next.js 16 · Turbopack</span>
              <span>·</span>
              <span className="text-[#22c55e]/50">v4.2 Beta</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
