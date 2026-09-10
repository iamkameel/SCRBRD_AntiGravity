"use client";

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  Lock,
  Plus,
  ShieldAlert,
  ChevronRight,
  ShieldCheck,
  Loader2,
  HeartPulse,
  Activity,
  FileText,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { D } from "@/lib/design-system";
import { 
  getMedicalIncidentsAction, 
  logMedicalIncidentAction 
} from '@/app/actions/medicalActions';
import { MedicalIncident } from '@/lib/services/medicalService';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

const INJURY_CATEGORIES = [
  'SOFT TISSUE',
  'BONE / JOINT',
  'CONCUSSION',
  'OVERUSE / FATIGUE',
  'POST-SURGICAL',
  'GENERAL ILLNESS'
];

export function MedicalLog() {
  const [showAdd, setShowAdd] = useState(false);
  const [incidents, setIncidents] = useState<MedicalIncident[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function initMedical() {
      try {
        const data = await getMedicalIncidentsAction();
        setIncidents(data);
      } catch (err) {
        console.error("Medical init error", err);
      } finally {
        setLoading(false);
      }
    }
    initMedical();
  }, []);

  const handleLogIncident = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await logMedicalIncidentAction({
        personId: formData.get('personId') as string,
        personName: formData.get('personName') as string,
        type: formData.get('type') as string,
        severity: formData.get('severity') as any,
        status: 'Reported',
        description: formData.get('description') as string,
        reportedBy: 'MEDICAL SYSTEM',
        reportedAt: new Date().toISOString()
      });
      
      const updated = await getMedicalIncidentsAction();
      setIncidents(updated);
      setShowAdd(false);
    } catch (err) {
      console.error("Failed to log incident", err);
    }
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'Critical': return { color: D.rose, label: 'CRITICAL ALERT' };
      case 'High': return { color: D.amber, label: 'HIGH PRIORITY' };
      case 'Medium': return { color: D.sky, label: 'STABLE MONITORING' };
      default: return { color: D.emerald, label: 'LOW RISK' };
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Strategic Command Header */}
      <div className="relative p-10 rounded-[3rem] border overflow-hidden shadow-2xl" 
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-inner" 
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
             <HeartPulse className="h-12 w-12 text-rose-500" />
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none" 
                style={{ fontFamily: D.head, color: D.textPrimary }}>
              MEDICAL <span style={{ color: D.rose }}>INTEL</span>
            </h1>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] mt-4 opacity-60 italic" style={{ color: D.textMuted }}>
                SECURE PERSONNEL HEALTH & READINESS DATA ENGINE
            </p>
          </div>
          <div className="lg:ml-auto flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             <div className="flex items-center gap-3 px-6 h-16 rounded-2xl border" style={{ background: D.surf2, borderColor: D.border }}>
                <Lock size={16} className="text-emerald-500" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">ENCRYPTED STORAGE ACTIVE</p>
             </div>
             <Button 
               onClick={() => setShowAdd(!showAdd)}
               className="h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95" 
               style={{ background: D.rose, color: 'white' }}>
               <Plus className="mr-3 h-4 w-4" /> LOG INCIDENT
             </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative p-10 rounded-[2.5rem] border overflow-hidden shadow-2xl"
            style={{ background: D.surf1, borderColor: D.rose }}
          >
            <div className="absolute inset-0 opacity-5 bg-rose-500" />
            <form onSubmit={handleLogIncident} className="relative z-10 space-y-10">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter" style={{ fontFamily: D.head }}>NEW MEDICAL RECORD</h3>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">AUTHORISED PERSONNEL PROTOCOL</p>
                  </div>
                  <Button variant="ghost" type="button" onClick={() => setShowAdd(false)} className="h-12 w-12 rounded-xl border" style={{ borderColor: D.border }}><ChevronUp size={18} /></Button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="md:col-span-2 space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">SUBJECT NAME</label>
                           <input name="personName" required className="w-full h-14 px-6 rounded-xl bg-black/10 border border-white/5 focus:border-rose-500/50 outline-none transition-all font-bold text-sm" placeholder="e.g. JAMES WILSON" />
                           <input name="personId" className="w-full h-10 px-6 rounded-xl bg-black/10 border border-white/5 outline-none font-black text-[9px] opacity-40" placeholder="INTERNAL ID (OPTIONAL)" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">INCIDENT TOPOLOGY</label>
                           <select name="type" className="w-full h-14 px-6 rounded-xl bg-black/10 border border-white/5 focus:border-rose-500/50 outline-none transition-all font-black text-[10px] uppercase tracking-widest">
                             {INJURY_CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-[#0f1118]">{cat}</option>)}
                           </select>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">CLINICAL OBSERVATIONS & RECOVERY PLAN</label>
                        <textarea name="description" required className="w-full min-h-[160px] p-6 rounded-2xl bg-black/10 border border-white/5 focus:border-rose-500/50 outline-none transition-all font-bold text-sm leading-relaxed" placeholder="DETAILED MEDICAL NOTES AND PRESCRIBED PROTOCOLS..." />
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="p-8 rounded-2xl border bg-black/10" style={{ borderColor: D.border }}>
                        <div className="flex items-center gap-3 mb-6">
                           <Activity size={14} className="text-rose-500" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">TRIAGE CLASSIFICATION</h4>
                        </div>
                        <div className="space-y-3">
                           {['Low', 'Medium', 'High', 'Critical'].map(level => (
                             <label key={level} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 cursor-pointer hover:border-rose-500/30 transition-all">
                                <input type="radio" name="severity" value={level} className="accent-rose-500 h-4 w-4" defaultChecked={level === 'Medium'} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{level} PRIORITY</span>
                             </label>
                           ))}
                        </div>
                     </div>
                     <Button type="submit" className="w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105" 
                             style={{ background: D.rose, color: 'white' }}>
                        COMMIT TO DOSSIER
                     </Button>
                  </div>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* History Ledger */}
        <div className="lg:col-span-3 space-y-8">
           <div className="flex items-center justify-between px-10">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                 PERSONNEL ARCHIVE: <span className="text-white opacity-100 italic" style={{ color: D.rose }}>{incidents.length} LOGGED EVENT(S)</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-[0.2em]" 
                   style={{ background: `${D.rose}08`, borderColor: `${D.rose}20`, color: D.rose }}>
                HOSPITAL-GRADE ENCRYPTION
              </div>
           </div>

           <div className="space-y-6">
             {incidents.length === 0 ? (
               <div className="py-24 text-center rounded-[3rem] border border-dashed flex flex-col items-center gap-4" 
                    style={{ borderColor: D.border }}>
                  <Stethoscope className="h-12 w-12 opacity-10 animate-pulse text-rose-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">NO MEDICAL RECORDS DETECTED IN ARCHIVE</p>
               </div>
             ) : (
               incidents.map((incident, idx) => {
                 const config = getSeverityConfig(incident.severity);
                 return (
                   <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.05 }}
                     key={incident.id}
                     className="group relative p-8 rounded-[2rem] border overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-rose-500/10 hover:border-rose-500/30"
                     style={{ background: D.surf1, borderColor: D.border }}
                   >
                     <div className="flex flex-col md:flex-row gap-10">
                        <div className="flex-1 space-y-4">
                           <div className="flex items-center gap-3">
                              <div className="px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-[0.2em]" 
                                   style={{ background: `${config.color}08`, borderColor: `${config.color}20`, color: config.color }}>
                                {incident.type} • {config.label}
                              </div>
                              <span className="text-[10px] font-black italic opacity-20" style={{ fontFamily: D.mono }}>LOG #{incident.id?.slice(-6).toUpperCase()}</span>
                           </div>
                           <h3 className="text-2xl font-black italic uppercase tracking-tighter transition-colors group-hover:text-rose-400" 
                               style={{ fontFamily: D.head, color: D.textPrimary }}>
                             {incident.personName}
                           </h3>
                           <p className="text-sm font-bold opacity-60 leading-relaxed max-w-2xl" style={{ color: D.textMuted }}>
                             {incident.description}
                           </p>
                        </div>

                        <div className="flex flex-col items-end gap-6 border-l pl-10" style={{ borderColor: D.border }}>
                           <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-40">
                                 <Calendar size={12} /> REPORTED AT
                              </div>
                              <span className="text-xs font-black italic uppercase" style={{ fontFamily: D.mono }}>
                                {typeof incident.reportedAt === 'string' ? format(new Date(incident.reportedAt), 'dd MMM yyyy') : 'DATE PENDING'}
                              </span>
                           </div>
                           <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-40">
                                 <Stethoscope size={12} /> CLINICIAN
                              </div>
                              <span className="text-xs font-black italic uppercase" style={{ fontFamily: D.mono }}>{incident.reportedBy}</span>
                           </div>
                           <div className={cn(
                             "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                             incident.status === 'Cleared' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-rose-500/10 text-rose-500 border-rose-500/30"
                           )}>
                              STATUS: {incident.status}
                           </div>
                        </div>
                     </div>
                   </motion.div>
                 );
               })
             )}
           </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-8">
           <div className="p-8 rounded-[2rem] border overflow-hidden shadow-2xl relative" 
                style={{ background: D.surf1, borderColor: D.border }}>
              <div className="absolute top-0 right-0 p-6 opacity-5">
                 <ShieldAlert className="h-16 w-16 text-rose-500" />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-8 pb-4 border-b" style={{ borderColor: D.border }}>INJURY RISK MATRIX</h4>
              
              <div className="space-y-10">
                 <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-black/10 border" style={{ borderColor: D.border }}>
                    <div className="text-5xl font-black italic tracking-tighter text-rose-500 mb-2" style={{ fontFamily: D.head }}>12%</div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">SQUAD RISK INDEX</div>
                 </div>

                 <div className="space-y-6">
                    {[
                      { label: 'HAMSTRING LOAD', status: 'ELEVATED', color: D.amber },
                      { label: 'SHOULDER MOBILITY', status: 'OPTIMAL', color: D.emerald },
                      { label: 'BOWLING WORKLOAD', status: 'CRITICAL', color: D.rose }
                    ].map((risk, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] font-black uppercase tracking-tighter opacity-100" style={{ color: D.textPrimary }}>{risk.label}</span>
                           <span className="text-[8px] font-black italic px-2 py-0.5 rounded border" 
                                 style={{ background: `${risk.color}08`, borderColor: `${risk.color}20`, color: risk.color }}>
                              {risk.status}
                           </span>
                        </div>
                        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                           <div className="h-full opacity-60" style={{ background: risk.color, width: risk.status === 'OPTIMAL' ? '15%' : risk.status === 'ELEVATED' ? '65%' : '95%' }} />
                        </div>
                      </div>
                    ))}
                 </div>

                 <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex gap-4">
                    <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-1" />
                    <p className="text-[10px] font-bold text-rose-400 italic leading-relaxed">SCHOOL BUS (B01) SCHEDULED MAINTENANCE IS OVERDUE BY 3 DAYS.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
