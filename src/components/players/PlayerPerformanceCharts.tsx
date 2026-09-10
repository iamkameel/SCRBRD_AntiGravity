"use client";

import { useEffect, useState } from "react";
import { D } from "@/lib/scoring/theme";
import { Activity, Target } from "lucide-react";
import { Player as Person } from "@/lib/store";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { getPlayerPerformanceTrendsAction, PerformanceDataPoint } from "@/app/actions/playerStatsActions";

interface PlayerPerformanceChartsProps {
  player: Person;
}

export function PlayerPerformanceCharts({ player }: PlayerPerformanceChartsProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   const fetchPerformanceData = async () => {
      const result = await getPlayerPerformanceTrendsAction(player.id, 10);
      if (result.success && result.data) {
        setPerformanceData(result.data);
      }
      setLoading(false);
    };
    fetchPerformanceData();
  }, [player.id]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-slide-up h-64 flex items-center justify-center">
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30" style={{ fontFamily: D.mono }}>Loading Intel...</p>
        </div>
      </div>
    );
  }

  if (performanceData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-slide-up h-64 flex flex-col items-center justify-center gap-4">
          <Activity className="h-8 w-8 text-white/10" />
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30" style={{ fontFamily: D.mono }}>Insufficient Data for Analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Batting Form - Runs */}
      <div className="col-span-1 lg:col-span-2 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-slide-up">
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary" style={{ fontFamily: D.mono }}>
            Career Runway (Batting)
          </h3>
          <Target className="h-4 w-4 text-white/20" />
        </div>
        <div className="p-8">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorRuns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="matchDate" fontSize={10} fontFamily={D.mono} tick={{ fill: 'rgba(255,255,255,0.3)', fontWeight: 900 }} tickLine={false} axisLine={false} dy={10} />
                <YAxis fontSize={10} fontFamily={D.mono} tick={{ fill: 'rgba(255,255,255,0.3)', fontWeight: 900 }} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(10px)', color: 'white' }}
                  itemStyle={{ color: '#10b981', fontFamily: D.head, fontWeight: 900 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', fontFamily: D.mono, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="runs" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRuns)" 
                  name="Runs Scored"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Batting Average Trend */}
      <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/80" style={{ fontFamily: D.mono }}>
            Average Control
          </h3>
          <Activity className="h-4 w-4 text-white/20" />
        </div>
        <div className="p-8">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="matchDate" fontSize={10} fontFamily={D.mono} tick={{ fill: 'rgba(255,255,255,0.3)', fontWeight: 900 }} tickLine={false} axisLine={false} dy={10} />
                <YAxis fontSize={10} fontFamily={D.mono} tick={{ fill: 'rgba(255,255,255,0.3)', fontWeight: 900 }} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(10px)', color: 'white' }}
                  itemStyle={{ color: '#3b82f6', fontFamily: D.head, fontWeight: 900 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', fontFamily: D.mono, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="battingAverage" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }}
                  name="Batting Average"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strike Rate */}
      <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/80" style={{ fontFamily: D.mono }}>
            Tempo (Strike Rate)
          </h3>
          <Activity className="h-4 w-4 text-white/20" />
        </div>
        <div className="p-8">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="matchDate" fontSize={10} fontFamily={D.mono} tick={{ fill: 'rgba(255,255,255,0.3)', fontWeight: 900 }} tickLine={false} axisLine={false} dy={10} />
                <YAxis fontSize={10} fontFamily={D.mono} tick={{ fill: 'rgba(255,255,255,0.3)', fontWeight: 900 }} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(10px)', color: 'white' }}
                  itemStyle={{ color: '#f59e0b', fontFamily: D.head, fontWeight: 900 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', fontFamily: D.mono, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Bar dataKey="strikeRate" name="Strike Rate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bowling Performance */}
      <div className="col-span-1 lg:col-span-2 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400" style={{ fontFamily: D.mono }}>
            Bowling Threat Vector
          </h3>
          <Target className="h-4 w-4 text-white/20" />
        </div>
        <div className="p-8">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="matchDate" fontSize={10} fontFamily={D.mono} tick={{ fill: 'rgba(255,255,255,0.3)', fontWeight: 900 }} tickLine={false} axisLine={false} dy={10} />
                <YAxis yAxisId="left" orientation="left" fontSize={10} fontFamily={D.mono} tick={{ fill: 'rgba(239,68,68,0.5)', fontWeight: 900 }} tickLine={false} axisLine={false} dx={-10} />
                <YAxis yAxisId="right" orientation="right" fontSize={10} fontFamily={D.mono} tick={{ fill: 'rgba(139,92,246,0.5)', fontWeight: 900 }} tickLine={false} axisLine={false} dx={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(10px)', color: 'white' }}
                  itemStyle={{ fontFamily: D.head, fontWeight: 900 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', fontFamily: D.mono, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontFamily: D.mono, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="wickets" name="Wickets" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar yAxisId="right" dataKey="economy" name="Economy" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
