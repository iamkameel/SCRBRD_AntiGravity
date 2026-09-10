"use client";

import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Calendar, 
  MoreVertical,
  PieChart,
  Wallet,
  Activity,
  ArrowRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { D } from "@/lib/design-system";
import { cn } from "@/lib/utils";

const TRANSACTIONS = [
  { id: 'TX-901', title: 'NEW EQUIPMENT: TITAN BATS', amount: -12400, category: 'GEAR', date: '21 MAR', status: 'COMPLETED' },
  { id: 'TX-902', title: 'SPONSORSHIP: BROWNS AUTO', amount: 45000, category: 'PARTNERSHIP', date: '18 MAR', status: 'PENDING' },
  { id: 'TX-903', title: 'MATCH FEES: ST JOHNS', amount: 3200, category: 'FEES', date: '15 MAR', status: 'COMPLETED' },
  { id: 'TX-904', title: 'FACILITY UPKEEP: N ACADEMY', amount: -6500, category: 'MAINTENANCE', date: '12 MAR', status: 'COMPLETED' },
];

export default function FinancialsPage() {
  return (
    <div className="animate-slide-in-up pb-24 space-y-12">
      {/* Strategic Command Header */}
      <div className="relative p-10 rounded-[3rem] border overflow-hidden shadow-2xl" 
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-inner" 
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
             <Wallet className="h-12 w-12 text-blue-500" />
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none" 
                style={{ fontFamily: D.head, color: D.textPrimary }}>
              FINANCIAL <span style={{ color: D.indigo }}>REPORTS</span>
            </h1>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] mt-4 opacity-60 italic" style={{ color: D.textMuted }}>
                CAPITAL ALLOCATION & ARITHMETIC PERFORMANCE ENGINE
            </p>
          </div>
          <div className="lg:ml-auto flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             <div className="flex items-center gap-6 px-8 h-16 rounded-2xl border" style={{ background: D.surf2, borderColor: D.border }}>
                <div className="flex flex-col">
                   <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">TOTAL EQUITY</span>
                   <span className="text-xl font-black italic uppercase leading-none mt-1" style={{ fontFamily: D.mono }}>R 184,200</span>
                </div>
                <div className="h-8 w-px bg-white/5" />
                <TrendingUp size={20} className="text-emerald-500" />
             </div>
             <Button className="h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl" style={{ background: D.indigo }}>
                <Plus className="mr-3 h-4 w-4" /> ADD TRANSACTION
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
         <div className="lg:col-span-3 space-y-10">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { label: 'TOTAL REVENUE', value: 'R 284.5K', icon: TrendingUp, color: D.emerald },
                 { label: 'OPEX TOTAL', value: 'R 82.1K', icon: TrendingDown, color: D.rose },
                 { label: 'NET PROFIT', value: 'R 202.4K', icon: DollarSign, color: D.indigo }
               ].map((kpi, i) => (
                 <div key={i} className="p-8 rounded-[2.5rem] border overflow-hidden shadow-2xl relative" 
                      style={{ background: D.surf1, borderColor: D.border }}>
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                       <kpi.icon size={48} style={{ color: kpi.color }} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4">{kpi.label}</p>
                    <h3 className="text-4xl font-black italic uppercase" style={{ fontFamily: D.head, color: D.textPrimary }}>{kpi.value}</h3>
                 </div>
               ))}
            </div>

            {/* Ledger */}
            <div className="space-y-6">
               <div className="flex items-center justify-between px-10">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">FINANCIAL LEDGER: <span className="text-white opacity-100 italic" style={{ color: D.indigo }}>ACTIVE HISTORY</span></div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-[0.2em]" 
                       style={{ background: `${D.indigo}08`, borderColor: `${D.indigo}20`, color: D.indigo }}>
                    AUDIT LOG VERIFIED
                  </div>
               </div>

               <div className="space-y-4">
                  {TRANSACTIONS.map((tx, idx) => (
                    <motion.div 
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group p-8 rounded-[2rem] border overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-indigo-500/10 hover:border-indigo-500/30"
                      style={{ background: D.surf1, borderColor: D.border }}
                    >
                      <div className="flex items-center gap-10">
                         <div className={cn(
                           "h-14 w-14 rounded-2xl flex items-center justify-center border shrink-0",
                           tx.amount > 0 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-rose-500/10 text-rose-500 border-rose-500/30"
                         )}>
                            {tx.amount > 0 ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                         </div>
                         <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                               <span className="text-[10px] font-black italic opacity-20 uppercase" style={{ fontFamily: D.mono }}>{tx.id} • {tx.category}</span>
                               <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/30 text-[8px] h-4 uppercase">{tx.status}</Badge>
                            </div>
                            <h4 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-indigo-400 transition-colors" style={{ fontFamily: D.head }}>{tx.title}</h4>
                         </div>
                         <div className="flex flex-col items-end gap-1 border-l pl-10" style={{ borderColor: D.border }}>
                            <span className="text-2xl font-black italic uppercase" style={{ fontFamily: D.mono, color: tx.amount > 0 ? D.emerald : D.rose }}>
                               {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{tx.date} 2026</span>
                         </div>
                      </div>
                    </motion.div>
                  ))}
               </div>
            </div>
         </div>

         {/* Sidebar Intel */}
         <div className="space-y-10">
            <div className="p-8 rounded-[2.5rem] border overflow-hidden shadow-2xl relative" 
                 style={{ background: D.surf1, borderColor: D.border }}>
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-8 pb-4 border-b" style={{ borderColor: D.border }}>ALLOCATION RADAR</h4>
               <div className="space-y-8">
                  {[
                    { label: 'EQUIPMENT', value: 45, color: D.rose },
                    { label: 'MAINTENANCE', value: 25, color: D.amber },
                    { label: 'ADMINISTRATION', value: 15, color: D.indigo },
                    { label: 'TRANSPORT', value: 15, color: D.sky }
                  ].map((cat, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-tighter opacity-100">{cat.label}</span>
                          <span className="text-[10px] font-black italic" style={{ fontFamily: D.mono }}>{cat.value}%</span>
                       </div>
                       <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${cat.value}%` }}
                             className="h-full opacity-60" 
                             style={{ background: cat.color }} 
                          />
                       </div>
                    </div>
                  ))}
                  
                  <div className="p-6 rounded-2xl bg-black/10 border space-y-4" style={{ borderColor: D.border }}>
                     <div className="flex items-center gap-3">
                        <Activity size={16} className="text-indigo-500" />
                        <h5 className="text-[10px] font-black uppercase tracking-widest">NEXT DISBURSEMENT</h5>
                     </div>
                     <p className="text-[20px] font-black italic uppercase leading-none" style={{ fontFamily: D.head }}>R 12,500</p>
                     <p className="text-[9px] font-bold text-indigo-400 italic">SCHEDULED: MARCH 28, 2026</p>
                  </div>

                  <Button className="w-full h-14 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl" variant="outline" style={{ borderColor: D.border }}>
                     GENERATE FISCAL REPORT
                  </Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
