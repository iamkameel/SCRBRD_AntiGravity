"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { D } from "@/lib/scoring/theme";
import { motion } from "framer-motion";
import { 
  CloudRain, 
  Sun, 
  Wind, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Hammer, 
  Droplets, 
  Thermometer,
  Layout,
  ChevronRight
} from 'lucide-react';

const PREP_TASKS = [
  { id: 'mowing', label: 'Outfield Mowing (Match Height: 12mm)', done: true },
  { id: 'rolling', label: 'Heavy Roller Application (Pitch 4)', done: true },
  { id: 'crease', label: 'Crease Marking & Painting', done: false },
  { id: 'stumps', label: 'Stump Hole Boring & Setting', done: false },
  { id: 'covers', label: 'Cover Deployment (Pre-match Prep)', done: false },
];

const MAINTENANCE_LOG = [
  { id: 1, task: 'Irrigation Header Repair', priority: 'High', status: 'In Progress', icon: Hammer },
  { id: 2, task: 'Sight Screen Cleaning', priority: 'Low', status: 'Pending', icon: Sun },
  { id: 3, task: 'Boundary Rope Inspection', priority: 'Med', status: 'Pending', icon: Layout },
];

export function GroundskeeperDashboard() {
  const [tasks, setTasks] = useState(PREP_TASKS);
  
  const completedCount = tasks.filter(t => t.done).length;
  const progressPercent = (completedCount / tasks.length) * 100;

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="space-y-6 p-6 bg-[#05070a] min-h-screen text-white">
      {/* Top Intel Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: D.syne }}>
            FIELD <span className="text-primary tracking-normal">INTEX</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-xs">A-Field Operations & Pitch Prep</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Conditions</p>
              <p className="text-lg font-black" style={{ fontFamily: D.syne }}>Stellar</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Moisture</p>
              <p className="text-lg font-black" style={{ fontFamily: D.syne }}>14%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Day Readiness */}
        <Card className="lg:col-span-2 bg-black/40 border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-6">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-black tracking-tight" style={{ fontFamily: D.syne }}>Match-Day Readiness</CardTitle>
                <CardDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Preparation Checklist</CardDescription>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 font-black text-[10px] tracking-widest uppercase">
                {Math.round(progressPercent)}% Ready
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                {tasks.map((task) => (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                      task.done 
                        ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox 
                        id={task.id} 
                        checked={task.done} 
                        onCheckedChange={() => toggleTask(task.id)}
                        className="w-6 h-6 rounded-lg border-2 border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none"
                      />
                      <label 
                        htmlFor={task.id}
                        className={`text-sm font-bold tracking-tight select-none cursor-pointer ${task.done ? 'text-white/80' : 'text-white/50'}`}
                        style={{ fontFamily: D.syne }}
                      >
                        {task.label}
                      </label>
                    </div>
                    {task.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-white/10" />
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="pt-4">
                <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]">
                  <CheckCircle2 className="w-5 h-5" /> Confirm Field Readiness
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Intel */}
        <div className="space-y-6">
          {/* Surface Intel */}
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-white/40" style={{ fontFamily: D.syne }}>Pitch Intel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                  <span>Surface Hardness</span>
                  <span className="text-primary">8.5/10</span>
                </div>
                <Progress value={85} className="h-1.5 bg-white/5" indicatorClassName="bg-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                  <span>Grass Cover</span>
                  <span className="text-emerald-400">40% Uniform</span>
                </div>
                <Progress value={40} className="h-1.5 bg-white/5" indicatorClassName="bg-emerald-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                  <span>Crack Development</span>
                  <span className="text-amber-400">Low (Stable)</span>
                </div>
                <Progress value={20} className="h-1.5 bg-white/5" indicatorClassName="bg-amber-500" />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Queue */}
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden border-l-4 border-l-amber-500/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-white/40" style={{ fontFamily: D.syne }}>Operational Queue</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {MAINTENANCE_LOG.map((item) => (
                  <div key={item.id} className="p-5 flex items-start gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-primary transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-white/90 group-hover:text-white transition-colors" style={{ fontFamily: D.syne }}>{item.task}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 border-white/10 ${
                          item.priority === 'High' ? 'text-rose-400' : 
                          item.priority === 'Med' ? 'text-amber-400' : 'text-blue-400'
                        }`}>
                          {item.priority}
                        </Badge>
                        <span className="text-[10px] font-bold text-white/20">{item.status}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
