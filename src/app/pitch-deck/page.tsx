"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Users, Award, Zap, Shield, BarChart, Clock } from "lucide-react";
import Link from "next/link";

export default function PitchDeckPage() {
  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-800 min-h-screen">
      {/* Hero Section */}
      <div className="py-20 px-8 text-center bg-gradient-to-br from-emerald-500/10 to-primary/10 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6 text-sm px-4 py-2">
            The Future of Cricket Management
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            Transform Your Cricket League with{' '}
            <span className="bg-gradient-to-br from-primary to-emerald-400 bg-clip-text text-transparent">
              SCRBRD
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
            The all-in-one platform for scoring, analytics, team management, and insights. 
            Designed for modern cricket administrators and coaches.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button className="px-8 py-6 text-lg rounded-lg bg-gradient-to-br from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-emerald-500/30 border-none">
                Get Started Free
              </Button>
            </Link>
            <Link href="/home">
              <Button variant="outline" className="px-8 py-6 text-lg rounded-lg border-white/20 bg-transparent hover:bg-white/5">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '10,000+', label: 'Matches Tracked', icon: <BarChart size={32} /> },
            { value: '500+', label: 'Teams', icon: <Users size={32} /> },
            { value: '5,000+', label: 'Players', icon: <Award size={32} /> },
            { value: '99.9%', label: 'Uptime', icon: <Zap size={32} /> }
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-primary mb-4 flex justify-center">
                {stat.icon}
              </div>
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground">Everything you need to run a professional cricket league.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <TrendingUp size={28} />,
              title: 'Advanced Analytics',
              description: 'Real-time match insights, predictive AI, and comprehensive performance tracking.'
            },
            {
              icon: <Users size={28} />,
              title: 'Team Management',
              description: 'Roster management, scheduling, and seamless communication tools.'
            },
            {
              icon: <Sparkles size={28} />,
              title: 'AI Scouting',
              description: 'Intelligent player comparisons and automated scouting reports.'
            },
            {
              icon: <Shield size={28} />,
              title: 'Secure & Reliable',
              description: 'Enterprise-grade security with role-based access control.'
            },
            {
              icon: <BarChart size={28} />,
              title: 'Live Scoring',
              description: 'Ball-by-ball scoring with instant updates and detailed statistics.'
            },
            {
              icon: <Clock size={28} />,
              title: 'Time-Saving',
              description: 'Automate administrative tasks and focus on what matters most.'
            }
          ].map((feature, i) => (
            <Card key={i} className="p-8">
              <div className="text-primary mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-8 text-center bg-gradient-to-br from-emerald-500/20 to-primary/20 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Revolutionize Your League?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join hundreds of leagues already using SCRBRD to manage their cricket operations.
          </p>
          <Link href="/signup">
            <Button className="px-10 py-6 text-xl rounded-lg bg-gradient-to-br from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-xl shadow-emerald-500/40 border-none">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
