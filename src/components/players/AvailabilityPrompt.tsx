"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { D } from '@/lib/design-system';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  MapPin, 
  Clock, 
  Bus, 
  Stethoscope,
  Info,
  ChevronRight
} from 'lucide-react';

interface AvailabilityPromptProps {
  matchId: string;
  opponent: string;
  date: string;
  venue: string;
  time: string;
  onConfirm: (status: 'available' | 'unavailable', data: any) => void;
}

export function AvailabilityPrompt({ matchId, opponent, date, venue, time, onConfirm }: AvailabilityPromptProps) {
  const [step, setStep] = useState<'invite' | 'details' | 'success'>('invite');
  const [status, setStatus] = useState<'available' | 'unavailable' | null>(null);

  const handleAction = (selectedStatus: 'available' | 'unavailable') => {
    setStatus(selectedStatus);
    if (selectedStatus === 'available') {
      setStep('details');
    } else {
      onConfirm('unavailable', {});
      setStep('success');
    }
  };

  return (
    <div className="max-w-md mx-auto relative">
      <AnimatePresence mode="wait">
        {step === 'invite' && (
          <motion.div 
            key="invite"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <Card className="bg-black/60 border-primary/20 backdrop-blur-2xl rounded-[2rem] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 p-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse font-black tracking-widest text-[9px]">U19 SELECTION</Badge>
              </div>
              
              <CardContent className="p-8 pt-10">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>

                <h2 className="text-3xl font-black text-white tracking-tighter leading-none mb-2" style={{ fontFamily: D.syne }}>
                  FIXTURE <span className="text-primary italic">INVITE</span>
                </h2>
                <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mb-8">Official Match-Day Selection Notice</p>

                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-primary transition-colors">
                      <ShieldCircleIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Opponent</p>
                      <p className="text-sm font-bold text-white uppercase">{opponent}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-primary transition-colors">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Venue</p>
                      <p className="text-sm font-bold text-white uppercase">{venue}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-primary transition-colors">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Schedule</p>
                      <p className="text-sm font-bold text-white uppercase">{date} • {time}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => handleAction('available')}
                    className="h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest text-xs group"
                  >
                    Confirm <CheckCircle2 className="w-4 h-4 ml-2 group-hover:scale-125 transition-transform" />
                  </Button>
                  <Button 
                    onClick={() => handleAction('unavailable')}
                    variant="outline"
                    className="h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/30 text-white/40 hover:text-rose-500 font-black uppercase tracking-widest text-xs transition-all"
                  >
                    Decline <XCircle className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-black/60 border-primary/20 backdrop-blur-2xl rounded-[2rem] overflow-hidden shadow-2xl relative">
              <CardContent className="p-8">
                <button 
                  onClick={() => setStep('invite')}
                  className="text-[10px] font-black uppercase text-white/40 hover:text-white mb-6 flex items-center gap-1 transition-colors"
                >
                  Back to fixture
                </button>

                <h2 className="text-2xl font-black text-white tracking-tighter mb-8" style={{ fontFamily: D.syne }}>
                  LOGISTICS <span className="text-primary italic">PLAN</span>
                </h2>

                <div className="space-y-6">
                  {/* Transport Toggle */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest flex items-center gap-2">
                       <Bus className="w-3 h-3 text-primary" /> Transport Requirements
                    </label>
                    <div className="grid grid-cols-2 gap-3 p-1 bg-white/5 rounded-2xl border border-white/5">
                      <button className="py-3 px-4 rounded-xl bg-primary text-black font-black text-[10px] uppercase tracking-widest">Seat Required</button>
                      <button className="py-3 px-4 rounded-xl text-white/40 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors">Own Transport</button>
                    </div>
                  </div>

                  {/* Medical Note */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest flex items-center gap-2">
                       <Stethoscope className="w-3 h-3 text-primary" /> Medical Status
                    </label>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-primary/30 transition-colors">
                      <span className="text-white/60 text-xs font-bold uppercase tracking-tight">Fully Fit & Ready</span>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                    </div>
                  </div>

                  {/* Ready Action */}
                  <Button 
                    onClick={() => {
                      onConfirm('available', { transport: 'required', fitness: 'fit' });
                      setStep('success');
                    }}
                    className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-xs mt-4"
                  >
                    Lock Participation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-black/80 border-emerald-500/30 backdrop-blur-3xl rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)] text-center py-12 px-8">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-2" style={{ fontFamily: D.syne }}>{status === 'available' ? 'Mission Locked' : 'Declined'}</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">
                {status === 'available' 
                  ? 'Your participation is confirmed. Transport manifest updated.' 
                  : 'Response logged. The coach has been notified.'}
              </p>
              <Button 
                variant="outline" 
                className="mt-8 rounded-xl border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 h-10"
                onClick={() => setStep('invite')}
              >
                Return to Dashboard
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShieldCircleIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <circle cx="12" cy="11" r="3" />
    </svg>
  );
}
