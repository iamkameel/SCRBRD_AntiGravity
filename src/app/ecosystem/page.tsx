"use client";

import React from "react";
import { motion } from "framer-motion";
import { EcosystemDiagram } from "@/components/ecosystem/EcosystemDiagram";
import { D } from "@/lib/design-system";
import { ArrowLeft, User, Shield, GraduationCap, Microscope, Network, Sparkles, Cpu, GitMerge } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { RankingsAlgorithm, MatchDataPipeline, RankingPyramid, AIBrainEngine } from "@/components/ecosystem/AlgorithmDiagrams";

export default function EcosystemPage() {
  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Standardized Header */}
      <SectionHeader 
        title="Platform Ecosystem & AI Architecture"
        sub="Unified data network and digital infrastructure for school cricket operations."
        icon={<Network className="w-5 h-5 text-indigo-400" />}
        actions={
          <Link href="/home">
            <Button variant="outline" className="h-10 px-4 rounded-xl font-bold text-xs border border-white/10 hover:bg-white/5 text-white" style={{ background: D.surf2 }}>
              <ArrowLeft className="mr-1.5 h-4 w-4 text-indigo-400" />
              Home Registry
            </Button>
          </Link>
        }
      />

      {/* Hero Overview Card */}
      <div 
        className="p-8 rounded-2xl border relative overflow-hidden shadow-2xl"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="absolute inset-0 opacity-[0.05]" style={{ background: D.gradMain }} />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            System Architecture v6.2
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: D.head }}>
            The Digital Infrastructure Engine
          </h2>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            SCRBRD connects fixtures, squad selection, live scoring, analytics, player development, and institutional history into one durable ecosystem.
          </p>
        </div>
      </div>

      {/* The Ecosystem Diagram Container */}
      <div 
        className="rounded-2xl border p-6 shadow-2xl relative min-h-[700px] overflow-hidden"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <EcosystemDiagram />
      </div>

      {/* Intelligence Models Section */}
      <div className="space-y-12">
        {/* AI Brain Section */}
        <div 
          className="p-8 rounded-2xl border space-y-6 shadow-xl"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center border" style={{ background: D.surf2, borderColor: D.border }}>
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: D.head }}>
                AI Brain Engine
              </h3>
              <p className="text-xs text-slate-400">Connecting verified historical logs with real-time telemetry.</p>
            </div>
          </div>
          <AIBrainEngine />
        </div>

        {/* Multivariate Performance Models */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div 
            className="p-8 rounded-2xl border space-y-6 shadow-xl"
            style={{ background: D.surf1, borderColor: D.border }}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center border" style={{ background: D.surf2, borderColor: D.border }}>
                <GitMerge className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white" style={{ fontFamily: D.head }}>
                  Multivariate Performance Models
                </h3>
                <p className="text-xs text-slate-400">Weighted against opposition strength and pressure windows.</p>
              </div>
            </div>
            <RankingsAlgorithm />
          </div>

          <div 
            className="p-8 rounded-2xl border space-y-6 shadow-xl"
            style={{ background: D.surf1, borderColor: D.border }}
          >
            <RankingPyramid />
          </div>
        </div>

        {/* Match Data Pipeline */}
        <div 
          className="p-8 rounded-2xl border space-y-6 shadow-xl"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          <div className="border-b pb-4" style={{ borderColor: D.border }}>
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: D.head }}>
              Match Data Pipeline Architecture
            </h3>
            <p className="text-xs text-slate-400">Event stream processing from scorer console to read models.</p>
          </div>
          <MatchDataPipeline />
        </div>
      </div>

      {/* Stakeholder Personas */}
      <div className="space-y-6">
        <SectionHeader 
          title="Stakeholder Value Matrix"
          sub="Role-scoped intelligence capabilities built on the SCRBRD network."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PersonaCard 
            icon={User}
            title="For Players"
            description="Own your verified athletic history. Track seasonal progression and unlock scout visibility."
          />
          <PersonaCard 
            icon={Shield}
            title="For Coaches"
            description="Develop with data. Access elite analysis tools and targeted drill recommendations."
          />
          <PersonaCard 
            icon={GraduationCap}
            title="For Schools"
            description="Preserve school sporting legacy across seasons and manage all sporting logistics."
          />
          <PersonaCard 
            icon={Microscope}
            title="For Scouts"
            description="Identify prospects using verified, deep-metric performance records."
          />
        </div>
      </div>
    </div>
  );
}

const PersonaCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div 
    className="p-6 rounded-2xl border space-y-4 transition-all hover:border-indigo-500/40 hover:shadow-xl"
    style={{ background: D.surf1, borderColor: D.border }}
  >
    <div 
      className="w-11 h-11 rounded-xl flex items-center justify-center border text-indigo-400"
      style={{ background: D.surf2, borderColor: D.border }}
    >
       <Icon className="h-5 w-5" />
    </div>
    <div className="space-y-1.5">
      <h4 className="text-base font-bold text-white" style={{ fontFamily: D.head }}>{title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>
  </div>
);
