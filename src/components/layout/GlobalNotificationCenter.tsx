"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Calendar, 
  Bus, 
  HeartPulse, 
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronRight,
  Zap,
  Activity
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { D } from "@/lib/design-system";

interface Notification {
  id: string;
  type: 'fixture' | 'logistics' | 'medical' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'fixture',
    title: 'Selection Notice: DH High',
    message: 'You have been selected for the First XI vs Durban High. Confirm availability.',
    timestamp: '2M AGO',
    read: false,
    priority: 'high'
  },
  {
    id: '2',
    type: 'medical',
    title: 'Medical Clearance Required',
    message: 'L. Peterson requires physician clearance for "Ankle Sprain" before tomorrow.',
    timestamp: '15M AGO',
    read: false,
    priority: 'high'
  },
  {
    id: '3',
    type: 'logistics',
    title: 'Transport Assigned: V02',
    message: 'Sprinter V02 has been assigned to your fixture. Departure 08:00 AM.',
    timestamp: '1H AGO',
    read: true,
    priority: 'medium'
  }
];

export function GlobalNotificationCenter({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [filter, setFilter] = useState<'all' | 'fixture' | 'medical' | 'logistics'>('all');

  const filteredNotifications = MOCK_NOTIFICATIONS.filter(n => filter === 'all' || n.type === filter);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm border-l z-[101] shadow-2xl flex flex-col"
            style={{ background: `${D.surf1}f5`, borderColor: D.border }}
          >
            {/* Header Hub */}
            <div className="p-8 border-b flex items-center justify-between" style={{ borderColor: D.border, background: D.surf2 }}>
              <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-2" style={{ fontFamily: D.head, color: D.textPrimary }}>
                  INTEL <span style={{ color: D.indigo }}>HUB</span>
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-50 flex items-center gap-2" style={{ color: D.textMuted }}>
                    <Activity className="w-3 h-3" /> OS OPERATIONS FEED
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border shadow-sm"
                style={{ background: D.surf1, borderColor: D.border, color: D.textMuted }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Strategic Filters */}
            <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth" style={{ background: D.surf1 }}>
              {[
                { id: 'all', label: 'ALL OPS' },
                { id: 'fixture', label: 'MATCH' },
                { id: 'medical', label: 'MEDICAL' },
                { id: 'logistics', label: 'LOGS' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${filter === f.id ? 'shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                  style={{ 
                    background: filter === f.id ? D.indigo : D.surf2, 
                    color: filter === f.id ? 'white' : D.textPrimary,
                    borderColor: filter === f.id ? D.indigo : D.border
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Notification Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notif, idx) => (
                  <motion.div 
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      notif.read ? '' : 'shadow-lg'
                    }`}
                    style={{ 
                        background: notif.read ? D.surf2 : `${D.indigo}08`, 
                        borderColor: notif.read ? D.border : `${D.indigo}30` 
                    }}
                  >
                    {!notif.read && (
                        <div className="absolute top-0 right-0 p-2">
                           <div className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--rose-rgb),0.5)]" style={{ background: D.rose }} />
                        </div>
                    )}
                    
                    <div className="flex gap-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner border transition-transform group-hover:scale-105 ${
                        notif.type === 'fixture' ? 'border-emerald-500/20 text-emerald-400' :
                        notif.type === 'medical' ? 'border-rose-500/20 text-rose-400' :
                        'border-blue-500/20 text-blue-400'
                      }`} style={{ background: D.surf1 }}>
                        {notif.type === 'fixture' && <Calendar className="w-6 h-6" />}
                        {notif.type === 'medical' && <HeartPulse className="w-6 h-6" />}
                        {notif.type === 'logistics' && <Bus className="w-6 h-6" />}
                        {notif.type === 'system' && <Info className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-[11px] font-black uppercase italic tracking-tight truncate" style={{ fontFamily: D.head, color: D.textPrimary }}>
                              {notif.title}
                          </h4>
                          <span className="text-[9px] font-black text-muted-foreground opacity-40 ml-2" style={{ fontFamily: D.mono }}>{notif.timestamp}</span>
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-tight leading-relaxed line-clamp-2 opacity-50" style={{ color: D.textMuted }}>
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer Control Unit */}
            <div className="p-8 border-t" style={{ borderColor: D.border, background: D.surf2 }}>
              <Button 
                variant="outline"
                className="w-full rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] h-14 border shadow-sm transition-all hover:translate-y-[-2px] active:scale-95"
                style={{ background: D.surf1, borderColor: D.border, color: D.textPrimary }}
              >
                INITIALIZE CLEAR ALL
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
