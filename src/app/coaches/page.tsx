"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Person } from '@/types/firestore';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Plus, Loader2, Mail, Phone, Users, Shield, Award, UserPlus, Search, ChevronRight } from "lucide-react";
import { USER_ROLES } from "@/lib/roles";
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import TrainerDashboard from '@/components/dashboards/trainer-dashboard';

import { CoachDevelopmentHub } from '@/components/coaches/CoachDevelopmentHub';

import { RouteGuard } from '@/components/auth/RouteGuard';

export default function CoachesPage() {
  const [activeView, setActiveView] = useState<'trainer' | 'skills' | 'staff'>('trainer');
  const [coaches, setCoaches] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCoaches = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, 'people'),
          where('role', 'in', [USER_ROLES.COACH, USER_ROLES.ASSISTANT_COACH])
        );
        const querySnapshot = await getDocs(q);
        const data: Person[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Person));
        setCoaches(data);
      } catch (error) {
        console.error('Error fetching coaches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  const filteredCoaches = coaches.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-6">
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: D.indigo }} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 animate-pulse">AUTHORIZING STAFF PROTOCOLS</p>
      </div>
    );
  }

  return (
    <RouteGuard module="skills" label="Coach Development Engine">
      <div className="space-y-12 pb-24">
        {/* Strategic Toggle Interface */}
        <div className="flex items-center justify-center p-1.5 rounded-2xl w-fit mx-auto border gap-1" 
             style={{ background: D.surf1, borderColor: D.border }}>
          <button 
            onClick={() => setActiveView('trainer')}
            className={cn(
              "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
              activeView === 'trainer' ? "text-white shadow-xl" : "opacity-40 hover:opacity-100"
            )}
            style={{ background: activeView === 'trainer' ? D.indigo : 'transparent' }}
          >
            Trainer Terminal
          </button>
          <button 
            onClick={() => setActiveView('skills')}
            className={cn(
              "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
              activeView === 'skills' ? "text-white shadow-xl" : "opacity-40 hover:opacity-100"
            )}
            style={{ background: activeView === 'skills' ? D.indigo : 'transparent' }}
          >
            Skill Matrix & Drills
          </button>
          <button 
            onClick={() => setActiveView('staff')}
            className={cn(
              "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
              activeView === 'staff' ? "text-white shadow-xl" : "opacity-40 hover:opacity-100"
            )}
            style={{ background: activeView === 'staff' ? D.indigo : 'transparent' }}
          >
            Staff Directory
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeView === 'trainer' ? (
            <motion.div
              key="trainer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <TrainerDashboard />
            </motion.div>
          ) : activeView === 'skills' ? (
            <motion.div
              key="skills"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <CoachDevelopmentHub />
            </motion.div>
          ) : (
            <motion.div
              key="staff"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Strategic Command Header */}
              <div className="relative p-10 rounded-[3rem] border overflow-hidden shadow-2xl" 
                   style={{ background: D.surf1, borderColor: D.border }}>
                <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
                <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
                  <div className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-inner" 
                       style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
                     <Users className="h-12 w-12 text-indigo-500" />
                  </div>
                  <div className="text-center lg:text-left">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none" 
                        style={{ fontFamily: D.head, color: D.textPrimary }}>
                      COACHING <span style={{ color: D.indigo }}>STAFF</span>
                    </h1>
                    <p className="text-[12px] font-black uppercase tracking-[0.4em] mt-4 opacity-60 italic" style={{ color: D.textMuted }}>
                        INSTITUTIONAL PERFORMANCE DIRECTORS & TECHNICAL SPECIALISTS
                    </p>
                  </div>
                  <div className="lg:ml-auto w-full lg:w-auto">
                     <Link href="/coaches/add">
                       <Button className="h-10 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:scale-105 active:scale-95" 
                               style={{ background: D.indigo, color: 'white' }}>
                         REGISTER NEW STAFF
                       </Button>
                     </Link>
                  </div>
                </div>
              </div>

              {/* Search & Filter Hub */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 rounded-[2rem] border" 
                   style={{ background: D.surf1, borderColor: D.border }}>
                <div className="relative flex-1 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-all" size={18} />
                  <input 
                    type="text" 
                    placeholder="SEARCH STAFF BY NAME OR CREDENTIALS..."
                    className="w-full h-16 pl-16 pr-8 rounded-2xl bg-black/5 border-transparent focus:border-indigo-500/30 focus:bg-white/5 outline-none transition-all text-xs font-black tracking-widest uppercase"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center px-8 h-16 rounded-2xl" style={{ background: D.surf2 }}>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40">ACTIVE STAFF: <span className="text-white opacity-100 italic" style={{ color: D.indigo }}>{coaches.length}</span></p>
                </div>
              </div>

              {/* Coaches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCoaches.length === 0 ? (
                  <div className="col-span-full py-24 text-center rounded-[3rem] border border-dashed flex flex-col items-center gap-4" 
                       style={{ borderColor: D.border }}>
                     <Shield className="h-12 w-12 opacity-10 animate-pulse" />
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">NO STAFF RECORDS MATCH SELECTED QUERY</p>
                  </div>
                ) : (
                  filteredCoaches.map((coach, idx) => (
                    <motion.div
                      key={coach.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group"
                    >
                      <Link href={`/coaches/${coach.id}`}>
                        <div className="relative p-8 rounded-[2.5rem] border overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-indigo-500/10 hover:border-indigo-500/30" 
                             style={{ background: D.surf1, borderColor: D.border }}>
                          <div className="flex items-start justify-between mb-8">
                            <div className="relative h-24 w-24 rounded-3xl overflow-hidden border-2 shadow-2xl transition-transform duration-500 group-hover:scale-105" 
                                 style={{ borderColor: D.border }}>
                              <Image
                                src={coach.profileImageUrl || `https://ui-avatars.com/api/?name=${coach.firstName}+${coach.lastName}&background=4f46e5&color=fff&size=128&bold=true`}
                                alt={`${coach.firstName} ${coach.lastName}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em]" 
                                 style={{ background: `${D.indigo}08`, borderColor: `${D.indigo}20`, color: D.indigo }}>
                              {coach.role?.replace('_', ' ') || 'STAFF'}
                            </div>
                          </div>

                          <div className="space-y-4 mb-8">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter transition-colors group-hover:text-indigo-400" 
                                style={{ fontFamily: D.head, color: D.textPrimary }}>
                              {coach.firstName} {coach.lastName}
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40" style={{ color: D.textMuted }}>
                              {coach.title || 'CRICKET TECHNICAL DIRECTOR'}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-8">
                            {(coach.specializations || ['General Coaching', 'Tactical Analysis']).slice(0, 3).map((spec, i) => (
                              <div key={i} className="px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest opacity-60" 
                                   style={{ background: D.surf2, borderColor: D.border, color: D.textPrimary }}>
                                {spec}
                              </div>
                            ))}
                          </div>

                          <div className="pt-6 border-t space-y-3" style={{ borderColor: D.border }}>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-black/5">
                                <Mail size={14} className="opacity-40" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-tight truncate opacity-60" style={{ color: D.textPrimary }}>{coach.email || 'CONTACT NOT ASSIGNED'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-black/5">
                                <Phone size={14} className="opacity-40" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-tight opacity-60" style={{ color: D.textPrimary }}>{coach.phone || 'NO SECURE LINE'}</span>
                            </div>
                          </div>

                          <div className="absolute bottom-0 right-0 p-8 translate-x-4 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500">
                             <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-indigo-500 text-white shadow-2xl">
                                <ChevronRight size={20} />
                             </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </RouteGuard>
  );
}

