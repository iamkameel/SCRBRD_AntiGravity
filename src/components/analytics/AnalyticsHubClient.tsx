"use client";

import React, { useState } from 'react';
import { IntelligenceRadar } from "./IntelligenceRadar";
import { DevelopmentTimeline } from "./DevelopmentTimeline";
import { D, GlobalStyles } from "@/lib/scoring/theme";
import { 
  TrendingUp, 
  Users, 
  Trophy, 
  Activity, 
  BarChart3, 
  PieChart, 
  Radar, 
  Calendar,
  ChevronUp,
  Target,
  Zap,
  Star
} from "lucide-react";
import { 
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Mock Data for Institutional Intelligence
const insightData = [
  { month: 'Jan', runs: 1200, wickets: 45, impact: 78 },
  { month: 'Feb', runs: 1900, wickets: 52, impact: 82 },
  { month: 'Mar', runs: 1500, wickets: 48, impact: 75 },
  { month: 'Apr', runs: 2400, wickets: 65, impact: 88 },
  { month: 'May', runs: 2100, wickets: 58, impact: 85 },
];

const radarData = [
  { subject: 'Power', A: 92, B: 75, fullMark: 100 },
  { subject: 'Consistency', A: 85, B: 70, fullMark: 100 },
  { subject: 'Depth', A: 78, B: 65, fullMark: 100 },
  { subject: 'Fielding', A: 88, B: 72, fullMark: 100 },
  { subject: 'Mental', A: 90, B: 74, fullMark: 100 },
];

const timelineData = [
  { period: 'Term 1', value: 65 },
  { period: 'Term 2', value: 72 },
  { period: 'Term 3', value: 84 },
  { period: 'Term 4', value: 88 },
];

const topPerformers = [
  { name: "David Miller", role: "Finisher", impact: 98, runs: 452, sr: 168.5, form: "+12%" },
  { name: "Kagiso Rabada", role: "Strike Bowler", impact: 95, wickets: 24, econ: 6.2, form: "+8%" },
  { name: "Quinton de Kock", role: "WK Batter", impact: 92, runs: 388, sr: 142.2, form: "-3%" },
];

export function AnalyticsHubClient() {
  const [activeView, setActiveView] = useState<'overview' | 'teams' | 'players'>('overview');

  // Design Primitives
  const StatCard = ({ label, value, trend, icon: Icon, color }: any) => (
    <div style={{ 
      background: D.surf1, 
      border: `1px solid ${D.border}`, 
      borderRadius: D.xl, 
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
        <Icon size={80} color={color} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: D.textMuted, marginBottom: '8px' }}>
            {label}
          </div>
          <div style={{ fontFamily: D.head, fontSize: '28px', fontWeight: 900, letterSpacing: '-0.02em', color: D.textPrimary }}>
            {value}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '12px', fontWeight: 700, color: D.emerald }}>
            <ChevronUp size={14} /> {trend}
          </div>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: D.base, minHeight: '100vh', color: D.textPrimary }}>
      <GlobalStyles />
      
      {/* Header */}
      <div style={{ 
        borderBottom: `1px solid ${D.border}`, 
        padding: '16px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(9, 9, 11, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontFamily: D.head, fontWeight: 900, fontSize: '18px', letterSpacing: '-0.02em' }}>
            INTELLIGENCE <span style={{ color: D.sky }}>HUB</span>
          </h1>
          <div style={{ fontSize: '11px', color: D.textMuted, letterSpacing: '0.05em' }}>INSTITUTIONAL PERFORMANCE ENGINE</div>
        </div>
        
        <div style={{ display: 'flex', background: D.surf2, padding: '4px', borderRadius: D.lg, border: `1px solid ${D.border}` }}>
          {(['overview', 'teams', 'players'] as const).map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              style={{
                padding: '8px 16px',
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 900,
                textTransform: 'uppercase',
                background: activeView === view ? D.surf1 : 'transparent',
                border: `1px solid ${activeView === view ? D.border : 'transparent'}`,
                color: activeView === view ? D.textPrimary : D.textMuted,
                borderRadius: D.md,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* Top Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <StatCard label="Total Matches" value="142" trend="12% YoY" icon={Calendar} color={D.sky} />
          <StatCard label="Win Probability" value="68%" trend="5% Up" icon={Trophy} color={D.amber} />
          <StatCard label="Avg. Impact Score" value="84.2" trend="8% Season" icon={Zap} color={D.emerald} />
          <StatCard label="Active Personnel" value="284" trend="15% Growth" icon={Users} color={D.textPrimary} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
          
          {/* Main Analytics Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Trend Chart */}
            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.xl, padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Institutional Momentum
                </div>
                <Activity size={18} color={D.textMuted} />
              </div>
              
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={insightData}>
                    <defs>
                      <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={D.sky} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={D.sky} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={D.border} vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke={D.textMuted} 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke={D.textMuted} 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ background: D.surf2, border: `1px solid ${D.border}`, borderRadius: D.md }}
                      itemStyle={{ color: D.textPrimary, fontFamily: D.mono, fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="impact" stroke={D.sky} strokeWidth={3} fillOpacity={1} fill="url(#colorImpact)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Matrix View (Mocked List) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.xl, padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, textTransform: 'uppercase' }}>Top Institutional Performers</div>
                  <Target size={16} color={D.textMuted} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {topPerformers.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: D.surf2, border: `1px solid ${D.border}`, borderRadius: D.lg }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: D.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>
                          {p.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: D.head }}>{p.name}</div>
                          <div style={{ fontSize: '10px', color: D.textMuted }}>{p.role}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: D.sky }}>{p.impact}</div>
                        <div style={{ fontSize: '10px', color: D.emerald }}>{p.form}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.xl, padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, textTransform: 'uppercase' }}>Recent Milestones</div>
                  <Star size={16} color={D.textMuted} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { title: "500 Career Runs", player: "A. Markram", date: "2 Days Ago" },
                    { title: "50 Wickets Milestone", player: "M. Jansen", date: "Last Match" },
                    { title: "Best Bowling (6/12)", player: "K. Rabada", date: "Season Record" }
                  ].map((m, i) => (
                    <div key={i} style={{ padding: '12px', background: 'rgba(0,0,0,0.1)', borderLeft: `3px solid ${i === 0 ? D.amber : D.border}`, borderRadius: '4px 8px 8px 4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, fontFamily: D.head }}>{m.title}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: D.textMuted, marginTop: '4px' }}>
                        <span>{m.player}</span>
                        <span>{m.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area: Intelligence Components */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
             <IntelligenceRadar data={radarData} title="Team Strength Radar" />
             <DevelopmentTimeline data={timelineData} title="Skill Progression" />
             
             {/* Institutional Rating */}
             <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.xl, padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, textTransform: 'uppercase' }}>Institutional Rating</div>
                  <Zap size={16} color={D.emerald} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: D.textMuted }}>Overall Score</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: D.emerald }}>88.4</div>
                  </div>
                  <div style={{ height: '6px', background: D.border, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '88%', background: `linear-gradient(to right, ${D.emerald}, ${D.sky})` }} />
                  </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

