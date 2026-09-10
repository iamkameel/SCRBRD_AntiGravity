"use client";

import React from "react";
import { motion } from "framer-motion";
import { EcosystemDiagram } from "@/components/ecosystem/EcosystemDiagram";
import { D } from "@/lib/scoring/theme";
import { ArrowLeft, User, Shield, GraduationCap, Microscope } from "lucide-react";
import Link from "next/link";
import { RankingsAlgorithm, MatchDataPipeline, RankingPyramid, AIBrainEngine } from "@/components/ecosystem/AlgorithmDiagrams";

export default function EcosystemPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 py-20 px-6 lg:px-20 overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/5 blur-[150px] rounded-full -mr-500 -mt-500" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-blue-500/5 blur-[150px] rounded-full -ml-500 -mb-500" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-20">
          <Link 
            href="/"
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-primary transition-all group"
            style={{ fontFamily: D.mono }}
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Home Registry
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 border border-primary/20 px-3 py-1 rounded-full bg-primary/5">
              System Architecture v6.2
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-0 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8" style={{ fontFamily: D.head }}>
              THE <span className="text-primary">SCRBRD</span> <br />
              ECOSYSTEM
            </h1>
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-white/50 leading-relaxed font-medium">
              A unified data network + operating system for youth sport. 
              The infrastructure layer for modern school cricket.
            </p>
          </motion.div>
        </div>

        {/* The Diagram */}
        <div className="relative mt-8 mb-32 h-[800px]">
          <EcosystemDiagram />
        </div>

        {/* Intelligence Models */}
        <div className="mt-40 space-y-32">
          {/* AI Brain Section */}
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ fontFamily: D.head }}>
                THE AI <span className="text-primary">BRAIN</span> ENGINE
              </h2>
              <p className="text-white/40 max-w-2xl mx-auto font-medium">Connecting historical verified records with real-time match intelligence to power institutional growth.</p>
            </div>
            <AIBrainEngine />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <div className="space-y-8">
                <h2 className="text-4xl font-black tracking-tight leading-tight" style={{ fontFamily: D.head }}>
                  MULTIVARIATE <br />
                  <span className="text-primary">PERFORMANCE</span> MODELS
                </h2>
                <p className="text-white/40 font-medium leading-relaxed">
                  Our ranking engine doesn&apos;t just look at runs and wickets. Every action is weighted against quality of opposition, pressure windows, and historical consistency.
                </p>
                <RankingsAlgorithm />
             </div>
             <RankingPyramid />
          </div>

          <div className="space-y-16">
            <div className="text-center">
              <h3 className="text-2xl font-black text-white/40 uppercase tracking-[0.4em]" style={{ fontFamily: D.mono }}>Match Data Pipeline</h3>
            </div>
            <MatchDataPipeline />
          </div>
        </div>

        {/* Who It's For */}
        <div className="mt-60 pt-32 border-t border-white/5">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              <PersonaCard 
                icon={User}
                title="For Players"
                description="Own your official verified record. Track development pathways and unlock scout visibility."
              />
              <PersonaCard 
                icon={Shield}
                title="For Coaches"
                description="Develop with data. Access elite analysis tools and provide targeted feedback at scale."
              />
              <PersonaCard 
                icon={GraduationCap}
                title="For Schools"
                description="Preserve institutional memory and school sporting legacy across generations."
              />
              <PersonaCard 
                icon={Microscope}
                title="For Scouts"
                description="Identify high-potential prospects with verified, deep-metric intelligence records."
              />
           </div>
        </div>

        {/* Footer Detail */}
        <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12 text-center border-t border-white/5 pt-20">
           <div>
              <div className="text-3xl font-black text-white mb-2" style={{ fontFamily: D.mono }}>1 ID.</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-primary">Unified Persona</div>
           </div>
           <div>
              <div className="text-3xl font-black text-white mb-2" style={{ fontFamily: D.mono }}>REAL-TIME.</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-primary">Data Aggregation</div>
           </div>
           <div>
              <div className="text-3xl font-black text-white mb-2" style={{ fontFamily: D.mono }}>DURABLE.</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-primary">Institutional Memory</div>
           </div>
        </div>
      </div>
    </div>
  );
}

const PersonaCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="space-y-6 group">
    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary/40 group-hover:text-primary group-hover:bg-primary/10 transition-all">
       <Icon className="h-7 w-7" />
    </div>
    <div className="space-y-2">
      <h4 className="text-xl font-black text-white" style={{ fontFamily: D.head }}>{title}</h4>
      <p className="text-sm text-white/40 leading-relaxed font-medium">{description}</p>
    </div>
  </div>
);
