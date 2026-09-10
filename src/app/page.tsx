"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Trophy, Users, BarChart3, Calendar, Target, Zap,
  Shield, TrendingUp, Award, Clock, CheckCircle2, ArrowRight,
  Database, Activity, Network, Brain, Fingerprint, MessageSquare,
  BarChart, Map, ShieldCheck, Dumbbell, Truck, History
} from "lucide-react";
import { LiveSection } from "@/components/home/LiveSection";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 150]);
  const statsY = useTransform(scrollYProgress, [0.3, 0.6], [50, -50]);
  const footerY = useTransform(scrollYProgress, [0.8, 1], [100, 0]);

  const osLayers = [
    {
      icon: Network,
      title: "Competition Engine",
      description: "Automated league structures, fixture generation, and live standings across all age groups and divisions.",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: ShieldCheck,
      title: "Team Operations",
      description: "Digital squad selection, match-day readiness boards, and real-time availability tracking for every fixture.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      icon: Activity,
      title: "Match Engine",
      description: "Elite event-driven scoring system. Ball-by-ball precision with integrated match intelligence and live overlays.",
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    {
      icon: Brain,
      title: "Intelligence Engine",
      description: "Transform raw events into deep analytics, form trends, and predictive performance insights.",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      icon: Fingerprint,
      title: "Identity Engine",
      description: "Durable digital identities for every player. A permanent record of growth, stats, and milestones across seasons.",
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      icon: MessageSquare,
      title: "Comm & Admin Hub",
      description: "The sticky layer. Automated notifications, fixture confirmations, and school-wide reporting workflows.",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10"
    }
  ];

  const powerhouseFeatures = [
    {
      icon: Map,
      title: "Visual Intelligence",
      description: "Elite wagon wheels, pitch maps, and shot zone distribution for every innings."
    },
    {
      icon: Shield,
      title: "Player Readiness",
      description: "Automated medical clearances, injury tracking, and workload management."
    },
    {
      icon: BarChart,
      title: "Impact Metrics",
      description: "Advanced performance indices that value match-winning contributions over raw volume."
    },
    {
      icon: Dumbbell,
      title: "Training Engine",
      description: "AI-driven drill recommendations based on individual skill gaps and performance data."
    },
    {
      icon: Truck,
      title: "Logistics Hub",
      description: "Integrated facility bookings and transport manifest management for all away fixtures."
    },
    {
      icon: History,
      title: "Career Archive",
      description: "Comprehensive historical records that build an institutional memory for the school."
    }
  ];

  const stats = [
    { value: "12K+", label: "Active Matches" },
    { value: "85", label: "Partner Schools" },
    { value: "15K+", label: "Player Profiles" },
    { value: "1M+", label: "Ball Events" }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background selection:bg-primary/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
        {/* Parallax Background */}
        <motion.div 
          style={{ y: heroY }}
          className="absolute inset-0 z-0 opacity-40"
        >
          <Image
            src="/Users/kameel.kalyan/.gemini/antigravity/brain/afee75d9-264e-4960-b3d4-54b6c7fcd3a8/cricket_stadium_cinematic_1773175376112.png"
            alt="Cricket Stadium Night"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </motion.div>

        {/* Modern Background Elements */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px] pointer-events-none" />
        <div className="absolute top-0 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full opacity-30 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-morphism-premium text-primary text-sm font-bold mb-8 animate-slide-in-up">
              <Zap className="h-4 w-4 fill-primary" />
              <span className="tracking-wide uppercase text-[10px]">The Operating System for School Cricket</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-8 animate-slide-in-up [animation-delay:100ms]">
              CRICKET <span className="text-gradient">OPERATIONS</span>
              <br />
              UPGRADED.
            </h1>

            {/* Subheadline */}
            <p className="max-w-3xl mx-auto text-xl md:text-2xl text-muted-foreground mb-12 animate-slide-in-up [animation-delay:200ms] leading-relaxed">
              SCRBRD is the digital infrastructure layer for school cricket operations, 
              competition, performance, and history. Built for the modern school era.
            </p>

            {/* High-Impact CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-in-up [animation-delay:300ms]">
              <Link href="/signup">
                <Button size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl shadow-2xl shadow-primary/20 hover-glow group">
                  Enter The Hub
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="ghost" className="h-16 px-10 text-lg font-bold rounded-2xl hover:bg-white/5 border border-white/10 backdrop-blur-sm">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Infrastructure Pillars */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-slide-in-up [animation-delay:400ms]">
              {["Reliable", "Scalable", "Data-First", "Intuitive"].map((pillar) => (
                <div key={pillar} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest opacity-70">{pillar}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Impact Hub */}
      <div className="relative z-10 -mt-10">
        <LiveSection />
      </div>

      {/* The Six Layers Section */}
      <section className="py-32 relative overflow-hidden bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              The Six Core Layers
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              SCRBRD isn&apos;t just a scoring app. It&apos;s a fully-integrated digital environment where every action feeds into a school-wide cricket ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {osLayers.map((layer, index) => (
              <Card key={index} className="glass-card p-8 border-white/5 hover-glow group transition-all duration-500 overflow-hidden relative">
                <div className={cn("inline-flex items-center justify-center p-3 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500", layer.bg)}>
                  <layer.icon className={cn("h-8 w-8", layer.color)} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{layer.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {layer.description}
                </p>
                {/* Decorative element */}
                <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/[0.01] group-hover:bg-white/[0.03] transition-colors" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        {/* Parallax Background */}
        <motion.div 
          style={{ y: statsY }}
          className="absolute inset-0 z-0 opacity-20"
        >
          <Image
            src="/Users/kameel.kalyan/.gemini/antigravity/brain/afee75d9-264e-4960-b3d4-54b6c7fcd3a8/cricket_field_parallax_1773175409772.png"
            alt="Cricket Field Parallax"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-5xl md:text-7xl font-black text-gradient mb-3 transition-transform duration-500 group-hover:scale-110">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground opacity-70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Powerhouse Features Grid */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                Powerhouse Capabilities
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Elite tools that turn raw high-school match data into institutional knowledge and professional development pathways.
              </p>
            </div>
            <Link href="/ecosystem">
              <Button size="lg" className="rounded-2xl h-14 px-8 font-bold bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30">
                Explore The Ecosystem
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {powerhouseFeatures.map((feature, index) => (
              <div key={index} className="flex gap-6 group">
                <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-300">
                  <feature.icon className="h-7 w-7 text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 tracking-tight group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        {/* Parallax Background */}
        <motion.div 
          style={{ y: footerY }}
          className="absolute inset-0 z-0 opacity-30"
        >
          <Image
            src="/Users/kameel.kalyan/.gemini/antigravity/brain/afee75d9-264e-4960-b3d4-54b6c7fcd3a8/cricket_equipment_abstract_1773175391671.png"
            alt="Cricket Equipment Abstract"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </motion.div>

        <div className="relative max-w-5xl mx-auto z-10 group">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-1000 -z-10" />
          <div className="glass-morphism-premium rounded-[40px] p-12 md:p-24 text-center border border-white/10 backdrop-blur-xl">
            <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-none">
              READY TO <span className="text-gradient">OPERATE</span>?
            </h2>
            <p className="text-xl md:text-3xl mb-16 opacity-80 max-w-2xl mx-auto leading-relaxed font-medium">
              Join the institutional network of schools redefining the standards of cricket management.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Link href="/signup">
                <Button size="lg" className="h-20 px-14 text-xl font-bold rounded-2xl shadow-2xl shadow-primary/30 hover-glow">
                  Get Started Now
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-20 px-14 text-xl font-bold rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-6 opacity-50">Discovery</h4>
              <ul className="space-y-4 font-medium text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">OS Features</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Pricing Hub</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-6 opacity-50">Platform</h4>
              <ul className="space-y-4 font-medium text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">Our Mission</Link></li>
                <li><Link href="/blog" className="hover:text-primary transition-colors">Technical Blog</Link></li>
                <li><Link href="/careers" className="hover:text-primary transition-colors">Join The Lab</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-6 opacity-50">Intel</h4>
              <ul className="space-y-4 font-medium text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">API Docs</Link></li>
                <li><Link href="/help" className="hover:text-primary transition-colors">Support Center</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Status Board</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-6 opacity-50">Governance</h4>
              <ul className="space-y-4 font-medium text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Charter</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Security Model</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary fill-primary" />
              <span className="font-black text-lg tracking-tighter text-foreground">SCRBRD</span>
            </div>
            <p>© 2026 SCRBRD Cricket OS. The canonical source of truth for high school cricket.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
