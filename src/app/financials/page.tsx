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
    <div className="animate-slide-in-up pb-24 space-y-12 max-w-7xl mx-auto p-4 md:p-8">
      {/* Strategic Command Header */}
      <div className="relative p-8 md:p-10 rounded-[3rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c0c10] overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-inner bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
             <Wallet className="h-12 w-12 text-blue-600 dark:text-blue-500" />
          </div>
          <div className="text-center lg:text-left">
            <h1 
              className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none text-zinc-900 dark:text-white" 
              style={{ fontFamily: D.head }}
            >
              FINANCIAL <span className="text-indigo-600 dark:text-indigo-400">REPORTS</span>
            </h1>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] mt-4 opacity-60 italic text-zinc-500 dark:text-zinc-400">
                CAPITAL ALLOCATION & ARITHMETIC PERFORMANCE ENGINE
            </p>
          </div>
          <div className="lg:ml-auto flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             <div className="flex items-center gap-6 px-8 h-16 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-900 dark:text-white">
                <div className="flex flex-col">
                   <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 italic">TOTAL EQUITY</span>
                   <span className="text-xl font-black italic uppercase leading-none mt-1 text-zinc-900 dark:text-white" style={{ fontFamily: D.mono }}>R 184,200</span>
                </div>
                <div className="h-8 w-px bg-zinc-200 dark:bg-white/10" />
                <TrendingUp size={20} className="text-emerald-500" />
             </div>
             <Button className="h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl bg-indigo-600 hover:bg-indigo-500 text-white">
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
                 { label: 'TOTAL REVENUE', value: 'R 284.5K', icon: TrendingUp, colorClass: 'text-emerald-500' },
                 { label: 'OPEX TOTAL', value: 'R 82.1K', icon: TrendingDown, colorClass: 'text-rose-500' },
                 { label: 'NET PROFIT', value: 'R 202.4K', icon: DollarSign, colorClass: 'text-indigo-500' }
               ].map((kpi, i) => (
                 <div key={i} className="p-8 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c0c10] overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                       <kpi.icon size={48} className={kpi.colorClass} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-4">{kpi.label}</p>
                    <h3 className="text-4xl font-black italic uppercase text-zinc-900 dark:text-white" style={{ fontFamily: D.head }}>{kpi.value}</h3>
                 </div>
               ))}
            </div>

            {/* Ledger */}
            <div className="space-y-6">
               <div className="flex items-center justify-between px-6 md:px-10">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">FINANCIAL LEDGER: <span className="text-indigo-600 dark:text-indigo-400 italic">ACTIVE HISTORY</span></div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em]">
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
                      className="group p-8 rounded-[2rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c0c10] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-indigo-500/10 hover:border-indigo-500/30"
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
                         <div className={cn(
                           "h-14 w-14 rounded-2xl flex items-center justify-center border shrink-0",
                           tx.amount > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                         )}>
                            {tx.amount > 0 ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                         </div>
                         <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                               <span className="text-[10px] font-black italic text-zinc-400 dark:text-zinc-500 uppercase" style={{ fontFamily: D.mono }}>{tx.id} • {tx.category}</span>
                               <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30 text-[8px] h-4 uppercase">{tx.status}</Badge>
                            </div>
                            <h4 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" style={{ fontFamily: D.head }}>{tx.title}</h4>
                         </div>
                         <div className="flex flex-col items-start md:items-end gap-1 md:border-l border-zinc-200 dark:border-white/10 md:pl-10">
                            <span className={cn("text-2xl font-black italic uppercase font-mono", tx.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                               {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{tx.date} 2026</span>
                         </div>
                      </div>
                    </motion.div>
                  ))}
               </div>
            </div>
         </div>

         {/* Sidebar Intel */}
         <div className="space-y-10">
            <div className="p-8 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c0c10] overflow-hidden shadow-2xl relative">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-8 pb-4 border-b border-zinc-200 dark:border-white/10">ALLOCATION RADAR</h4>
               <div className="space-y-8">
                  {[
                    { label: 'EQUIPMENT', value: 45, bgClass: 'bg-rose-500' },
                    { label: 'MAINTENANCE', value: 25, bgClass: 'bg-amber-500' },
                    { label: 'ADMINISTRATION', value: 15, bgClass: 'bg-indigo-500' },
                    { label: 'TRANSPORT', value: 15, bgClass: 'bg-sky-500' }
                  ].map((cat, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-900 dark:text-white">{cat.label}</span>
                          <span className="text-[10px] font-black italic text-zinc-700 dark:text-zinc-300 font-mono">{cat.value}%</span>
                       </div>
                       <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-white/5 overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${cat.value}%` }}
                             className={`h-full ${cat.bgClass}`} 
                          />
                       </div>
                    </div>
                  ))}
                  
                  <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 space-y-4">
                     <div className="flex items-center gap-3">
                        <Activity size={16} className="text-indigo-600 dark:text-indigo-400" />
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">NEXT DISBURSEMENT</h5>
                     </div>
                     <p className="text-[20px] font-black italic uppercase leading-none text-zinc-900 dark:text-white" style={{ fontFamily: D.head }}>R 12,500</p>
                     <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 italic">SCHEDULED: MARCH 28, 2026</p>
                  </div>

                  <Button className="w-full h-14 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/5" variant="outline">
                     GENERATE FISCAL REPORT
                  </Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
