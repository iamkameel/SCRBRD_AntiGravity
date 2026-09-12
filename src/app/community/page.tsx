'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Radio, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Bell, 
  Share2, 
  MessageSquare, 
  Trophy, 
  Bus, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  Navigation, 
  Award, 
  ChevronRight, 
  Phone, 
  Mail, 
  Send,
  Heart,
  Activity,
  FileText,
  User
} from 'lucide-react';
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  communityService, 
  MOCK_CHILD_PROFILES, 
  MOCK_NOTIF_PREFS, 
  ChildProfileDigest, 
  ParentRSVP, 
  NotificationPreference 
} from '@/lib/services/communityService';
import { INITIAL_PARENT_NOTIFICATIONS, ParentNotification } from '@/lib/services/parentNotificationService';

export default function ParentsCommunityPortalPage() {
  const [childrenList, setChildrenList] = useState<ChildProfileDigest[]>(MOCK_CHILD_PROFILES);
  const [selectedChildId, setSelectedChildId] = useState<string>('child-101');
  const [activeTab, setActiveTab] = useState<'live_match' | 'rsvp_logistics' | 'child_digest' | 'notif_settings'>('live_match');

  // RSVP Form State
  const [guardianName, setGuardianName] = useState('Sarah Smith');
  const [guardianPhone, setGuardianPhone] = useState('+27 82 555 1234');
  const [attendanceStatus, setAttendanceStatus] = useState<ParentRSVP['attendanceStatus']>('ATTENDING_LIVE');
  const [transportMode, setTransportMode] = useState<ParentRSVP['transportMode']>('SELF_DRIVE_PARENT');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [rsvpSaved, setRsvpSaved] = useState(false);

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreference>(MOCK_NOTIF_PREFS['child-101']);
  const [prefsSaved, setPrefsSaved] = useState(false);

  // WhatsApp Share State
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    communityService.getChildProfiles().then(profiles => {
      if (profiles && profiles.length > 0) {
        setChildrenList(profiles);
      }
    });
  }, []);

  const activeChild = childrenList.find(c => c.studentId === selectedChildId) || childrenList[0];

  const handleSaveRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    const rsvp: ParentRSVP = {
      fixtureId: activeChild.nextFixture.fixtureId,
      studentId: activeChild.studentId,
      studentName: activeChild.studentName,
      guardianName,
      guardianPhone,
      attendanceStatus,
      transportMode,
      dietaryMedicalNotes: dietaryNotes,
      updatedAt: new Date().toISOString()
    };

    await communityService.saveParentRSVP(rsvp);
    setRsvpSaved(true);
    setTimeout(() => setRsvpSaved(false), 3000);
  };

  const handleSavePrefs = async () => {
    await communityService.saveNotificationPreferences(notifPrefs);
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 3000);
  };

  const handleCopyShareLink = () => {
    const text = `🏏 SCRBRD Live Score Update:\n${activeChild.studentName} is playing for ${activeChild.schoolName} vs ${activeChild.nextFixture.opponentName}!\nFollow live ball-by-ball updates here: https://scrbrd.app/live/${activeChild.nextFixture.fixtureId}`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="space-y-10 pb-24 max-w-7xl mx-auto">
      {/* Strategic Header */}
      <div 
        className="relative p-10 rounded-[3rem] border overflow-hidden shadow-2xl"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div 
            className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-inner" 
            style={{ background: D.surf2, border: `1px solid ${D.border}` }}
          >
            <Heart className="h-12 w-12 text-rose-500" />
          </div>
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] italic text-rose-400">
                COMMUNICATION & COMMUNITY LAYER
              </span>
              <Badge className="bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[9px] font-mono">
                PARENTS & SUPPORTERS PORTAL
              </Badge>
            </div>
            <h1 
              className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none" 
              style={{ fontFamily: D.head, color: D.textPrimary }}
            >
              PARENTS & COMMUNITY <span className="text-rose-400">HUB</span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] mt-3 opacity-60 italic" style={{ color: D.textMuted }}>
              LIVE TRACKING • MATCH-DAY RSVPs • CAREER DIGESTS • TRANSPORT ALERTS
            </p>
          </div>

          {/* Child Selector Pills */}
          <div className="lg:ml-auto flex items-center gap-3">
            {childrenList.map((child) => {
              const isSelected = child.studentId === selectedChildId;
              return (
                <button
                  key={child.studentId}
                  onClick={() => setSelectedChildId(child.studentId)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected ? 'bg-rose-500/20 border-rose-400 shadow-lg shadow-rose-500/10' : 'bg-black/20 border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className={`w-4 h-4 ${isSelected ? 'text-rose-400' : 'text-zinc-400'}`} />
                    <span className="text-sm font-black uppercase tracking-wider text-white">{child.studentName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">{child.teamName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Child Summary Hero Bar */}
      <div className="p-8 rounded-[2.5rem] border grid grid-cols-1 md:grid-cols-4 gap-6 shadow-2xl relative overflow-hidden"
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">STUDENT ATHLETE</span>
          <h2 className="text-2xl font-black uppercase italic tracking-tight text-white" style={{ fontFamily: D.head }}>
            {activeChild.studentName}
          </h2>
          <Badge className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[9px] font-bold">
            {activeChild.roleArchetype}
          </Badge>
        </div>

        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">NEXT FIXTURE</span>
          <p className="text-sm font-bold text-white uppercase tracking-wider">vs {activeChild.nextFixture.opponentName}</p>
          <p className="text-[11px] font-mono text-amber-400">{activeChild.nextFixture.fixtureDate}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">SELECTION STATUS</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-300 uppercase tracking-wider">
              {activeChild.nextFixture.selectionStatus.replace('_', ' ')}
            </span>
          </div>
          <p className="text-[10px] font-mono text-zinc-400">{activeChild.nextFixture.departureTime}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">SEASON FORM</span>
          <div className="flex items-center gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-white">{activeChild.seasonStats.runsScored} RUNS</span>
              <span className="text-[10px] font-mono text-zinc-400 block">Avg: {activeChild.seasonStats.battingAverage}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400">{activeChild.seasonStats.wicketsTaken} WICKETS</span>
              <span className="text-[10px] font-mono text-zinc-400 block">Econ: {activeChild.seasonStats.bowlingEconomy}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-4 p-2 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
        <button
          onClick={() => setActiveTab('live_match')}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'live_match'
              ? 'text-white shadow-xl'
              : 'opacity-40 hover:opacity-100'
          }`}
          style={{ background: activeTab === 'live_match' ? D.amber : 'transparent', color: activeTab === 'live_match' ? 'black' : D.textPrimary }}
        >
          <Radio className="w-4 h-4" /> Live Match Centre & Commentary
        </button>

        <button
          onClick={() => setActiveTab('rsvp_logistics')}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'rsvp_logistics'
              ? 'text-white shadow-xl'
              : 'opacity-40 hover:opacity-100'
          }`}
          style={{ background: activeTab === 'rsvp_logistics' ? D.emerald : 'transparent', color: activeTab === 'rsvp_logistics' ? 'black' : D.textPrimary }}
        >
          <Bus className="w-4 h-4" /> Match-Day RSVP & Logistics
        </button>

        <button
          onClick={() => setActiveTab('child_digest')}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'child_digest'
              ? 'text-white shadow-xl'
              : 'opacity-40 hover:opacity-100'
          }`}
          style={{ background: activeTab === 'child_digest' ? D.indigo : 'transparent', color: activeTab === 'child_digest' ? 'white' : D.textPrimary }}
        >
          <Trophy className="w-4 h-4" /> Progress & Career Digest
        </button>

        <button
          onClick={() => setActiveTab('notif_settings')}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'notif_settings'
              ? 'text-white shadow-xl'
              : 'opacity-40 hover:opacity-100'
          }`}
          style={{ background: activeTab === 'notif_settings' ? D.sky : 'transparent', color: activeTab === 'notif_settings' ? 'black' : D.textPrimary }}
        >
          <Bell className="w-4 h-4" /> Alert Preferences & SMS Log
        </button>
      </div>

      {/* TAB 1: LIVE MATCH CENTRE & COMMENTARY */}
      {activeTab === 'live_match' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Live Score Banner */}
          <div className="p-8 rounded-[2.5rem] border bg-zinc-950 border-amber-500/30 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400">
                  LIVE MATCH IN PROGRESS • 1st INNINGS (OVER 38.4)
                </span>
              </div>
              <Button
                onClick={handleCopyShareLink}
                size="sm"
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono"
              >
                <Share2 className="w-3.5 h-3.5 mr-1.5" />
                {copiedShare ? "LINK COPIED TO CLIPBOARD!" : "SHARE MATCH LINK"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-y border-white/10 py-6">
              {/* Home Team */}
              <div className="text-center md:text-left space-y-1">
                <span className="text-xs font-mono text-zinc-400">{activeChild.schoolName}</span>
                <h3 className="text-3xl font-black uppercase tracking-tight text-white" style={{ fontFamily: D.head }}>
                  214 / 4
                </h3>
                <span className="text-xs font-mono text-amber-400 font-bold">38.4 Overs • CRR: 5.53</span>
              </div>

              {/* Versus Badge */}
              <div className="text-center">
                <Badge className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-mono px-4 py-1.5">
                  TARGET: 265 RUNS
                </Badge>
                <p className="text-[10px] font-mono text-zinc-400 mt-2">Need 51 runs off 68 balls</p>
              </div>

              {/* Away Team */}
              <div className="text-center md:text-right space-y-1">
                <span className="text-xs font-mono text-zinc-400">{activeChild.nextFixture.opponentName}</span>
                <h3 className="text-3xl font-black uppercase tracking-tight text-white opacity-60" style={{ fontFamily: D.head }}>
                  264 / 7
                </h3>
                <span className="text-xs font-mono text-zinc-400">50.0 Overs (Innings Closed)</span>
              </div>
            </div>

            {/* Current Batters at Crease */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{activeChild.studentName} *</span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">ON STRIKE</Badge>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">Opener • Facing Pace</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-400 font-mono">64*</span>
                  <span className="text-[10px] font-mono text-zinc-400 block">(52b, 7x4, 2x6) • SR: 123.0</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white">Liam Thorne</span>
                  <span className="text-xs font-mono text-zinc-400 block">Non-Striker</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-white font-mono">38*</span>
                  <span className="text-[10px] font-mono text-zinc-400 block">(41b, 4x4) • SR: 92.6</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Ball-by-Ball Commentary Stream */}
          <div className="p-8 rounded-[2.5rem] border space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: D.border }}>
              <h3 className="text-xl font-black uppercase italic tracking-tight text-white" style={{ fontFamily: D.head }}>
                LIVE COMMENTARY <span style={{ color: D.amber }}>STREAM</span>
              </h3>
              <Badge className="bg-white/10 text-zinc-300 font-mono text-[9px]">REAL-TIME SYNCED</Badge>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl border bg-black/10 border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">38.4 OVER • FOUR!</span>
                  <span className="text-[10px] font-mono text-zinc-400">11:42 AM</span>
                </div>
                <p className="text-xs font-medium text-white">
                  CRUNCHED! <strong className="text-emerald-300">{activeChild.studentName}</strong> leans into a beautiful cover drive off Steyn! Sweeps past mid-off for 4 runs! Brings up the 100-run partnership!
                </p>
              </div>

              <div className="p-4 rounded-2xl border bg-black/10 border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">38.3 OVER • 1 RUN</span>
                  <span className="text-[10px] font-mono text-zinc-400">11:40 AM</span>
                </div>
                <p className="text-xs font-medium text-zinc-300">
                  Pushed down to long-on by Thorne for a sharp single. Excellent strike rotation between the two batters.
                </p>
              </div>

              <div className="p-4 rounded-2xl border bg-black/10 border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">38.2 OVER • SIX!</span>
                  <span className="text-[10px] font-mono text-zinc-400">11:39 AM</span>
                </div>
                <p className="text-xs font-medium text-white">
                  HUGE SHOT! <strong className="text-amber-300">{activeChild.studentName}</strong> steps down the track and lofts over long-off into the pavilion! Monster blow!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: MATCH-DAY RSVP & LOGISTICS */}
      {activeTab === 'rsvp_logistics' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: RSVP Form */}
          <div className="lg:col-span-1 p-8 rounded-[2.5rem] border space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: D.border }}>
              <h3 className="text-xl font-black uppercase italic tracking-tight text-white" style={{ fontFamily: D.head }}>
                MATCH-DAY <span style={{ color: D.emerald }}>RSVP</span>
              </h3>
              <Badge className="bg-emerald-500/10 text-emerald-300 text-[9px] font-mono">1-TAP CONFIRMATION</Badge>
            </div>

            {rsvpSaved && (
              <div className="p-4 rounded-2xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> RSVP saved and synced to Coach Dashboard!
              </div>
            )}

            <form onSubmit={handleSaveRSVP} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                  GUARDIAN NAME *
                </label>
                <input
                  type="text"
                  required
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl text-xs font-bold bg-black/10 border outline-none text-white focus:border-emerald-400"
                  style={{ borderColor: D.border }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                  GUARDIAN MOBILE *
                </label>
                <input
                  type="text"
                  required
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl text-xs font-bold bg-black/10 border outline-none text-white focus:border-emerald-400"
                  style={{ borderColor: D.border }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                  PARENT ATTENDANCE *
                </label>
                <select
                  value={attendanceStatus}
                  onChange={(e) => setAttendanceStatus(e.target.value as any)}
                  className="w-full h-14 px-4 rounded-2xl text-xs font-bold bg-black/10 border outline-none text-white focus:border-emerald-400"
                  style={{ borderColor: D.border }}
                >
                  <option value="ATTENDING_LIVE" className="bg-zinc-900">Attending Match Live in Person</option>
                  <option value="WATCHING_REMOTE" className="bg-zinc-900">Watching via SCRBRD Stream</option>
                  <option value="UNABLE_TO_ATTEND" className="bg-zinc-900">Unable to Attend</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                  STUDENT TRANSPORT METHOD *
                </label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value as any)}
                  className="w-full h-14 px-4 rounded-2xl text-xs font-bold bg-black/10 border outline-none text-white focus:border-emerald-400"
                  style={{ borderColor: D.border }}
                >
                  <option value="TEAM_BUS" className="bg-zinc-900">Riding Official Team Bus</option>
                  <option value="SELF_DRIVE_PARENT" className="bg-zinc-900">Self-Drive with Parent</option>
                  <option value="CARPOOL_OTHER" className="bg-zinc-900">Carpooling with Team Parent</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                  DIETARY OR MEDICAL NOTES
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Mild asthma (inhaler in kit bag), nut allergy..."
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  className="w-full p-4 rounded-2xl text-xs font-bold bg-black/10 border outline-none text-white focus:border-emerald-400"
                  style={{ borderColor: D.border }}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl"
                style={{ background: D.emerald, color: 'black' }}
              >
                SUBMIT MATCH-DAY RSVP
              </Button>
            </form>
          </div>

          {/* Right Column: Venue Directions & Map Info */}
          <div className="lg:col-span-2 p-8 rounded-[2.5rem] border space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: D.border }}>
              <h3 className="text-xl font-black uppercase italic tracking-tight text-white" style={{ fontFamily: D.head }}>
                VENUE DIRECTIONS & <span style={{ color: D.amber }}>MAP GUIDE</span>
              </h3>
              <Badge className="bg-amber-500/10 text-amber-300 font-mono text-[9px]">GPS LINK READY</Badge>
            </div>

            <div className="p-6 rounded-2xl border bg-black/20 space-y-4" style={{ borderColor: D.border }}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-black uppercase tracking-tight text-white">{activeChild.nextFixture.venueName}</h4>
                  <p className="text-xs font-mono text-zinc-400">{activeChild.nextFixture.venueAddress}</p>
                </div>
                <Button
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(activeChild.nextFixture.venueAddress)}`, '_blank')}
                  size="sm"
                  className="bg-amber-500 text-black font-black text-xs uppercase"
                >
                  <Navigation className="w-3.5 h-3.5 mr-1.5" />
                  GET GPS DIRECTIONS
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs font-mono">
                <div>
                  <span className="text-zinc-400 block text-[9px] uppercase">GATES OPEN</span>
                  <span className="font-bold text-white">07:30 AM</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[9px] uppercase">PARKING ZONE</span>
                  <span className="font-bold text-white">Oval Gate 2 (Visitors)</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[9px] uppercase">CATERING</span>
                  <span className="font-bold text-white">Parents Kiosk & Coffee Bus</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: CHILD PROGRESS & CAREER DIGEST */}
      {activeTab === 'child_digest' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border bg-black/20 space-y-2" style={{ borderColor: D.border }}>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">TOTAL RUNS SCORED</span>
              <div className="text-3xl font-black text-amber-400 font-mono">{activeChild.seasonStats.runsScored}</div>
              <span className="text-xs text-zinc-400 block">Highest Score: {activeChild.seasonStats.highestScore}</span>
            </div>

            <div className="p-6 rounded-2xl border bg-black/20 space-y-2" style={{ borderColor: D.border }}>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">BATTING AVERAGE</span>
              <div className="text-3xl font-black text-white font-mono">{activeChild.seasonStats.battingAverage}</div>
              <span className="text-xs text-zinc-400 block">Strike Rate: {activeChild.seasonStats.strikeRate}</span>
            </div>

            <div className="p-6 rounded-2xl border bg-black/20 space-y-2" style={{ borderColor: D.border }}>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">TOTAL WICKETS TAKEN</span>
              <div className="text-3xl font-black text-emerald-400 font-mono">{activeChild.seasonStats.wicketsTaken}</div>
              <span className="text-xs text-zinc-400 block">Economy: {activeChild.seasonStats.bowlingEconomy}</span>
            </div>
          </div>

          {/* Milestones Showcase */}
          <div className="p-8 rounded-[2.5rem] border space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: D.border }}>
              <h3 className="text-xl font-black uppercase italic tracking-tight text-white" style={{ fontFamily: D.head }}>
                CAREER MILESTONE <span style={{ color: D.indigo }}>SHOWCASE</span>
              </h3>
              <Badge className="bg-indigo-500/10 text-indigo-300 font-mono text-[9px]">OFFICIALLY VERIFIED</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeChild.milestonesAchieved.map((m) => (
                <div key={m.id} className="p-6 rounded-2xl border bg-black/10 border-indigo-500/30 space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">{m.title}</h4>
                  <span className="text-[10px] font-mono text-zinc-400 block">{m.date}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 4: ALERT PREFERENCES & SMS LOG */}
      {activeTab === 'notif_settings' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-1 p-8 rounded-[2.5rem] border space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: D.border }}>
              <h3 className="text-xl font-black uppercase italic tracking-tight text-white" style={{ fontFamily: D.head }}>
                ALERT <span style={{ color: D.sky }}>PREFERENCES</span>
              </h3>
              <Badge className="bg-sky-500/10 text-sky-300 font-mono text-[9px]">INSTANT DISPATCH</Badge>
            </div>

            {prefsSaved && (
              <div className="p-4 rounded-2xl border bg-sky-500/10 border-sky-500/30 text-sky-300 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Notification settings saved!
              </div>
            )}

            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-black/10" style={{ borderColor: D.border }}>
                <span>BUS TRANSPORT BOARDING ALERTS</span>
                <input
                  type="checkbox"
                  checked={notifPrefs.alertTypes.transportAlerts}
                  onChange={(e) => setNotifPrefs({
                    ...notifPrefs,
                    alertTypes: { ...notifPrefs.alertTypes, transportAlerts: e.target.checked }
                  })}
                  className="h-5 w-5 rounded border-white/20 accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border bg-black/10" style={{ borderColor: D.border }}>
                <span>SQUAD XI SELECTION ALERTS</span>
                <input
                  type="checkbox"
                  checked={notifPrefs.alertTypes.squadAnnouncements}
                  onChange={(e) => setNotifPrefs({
                    ...notifPrefs,
                    alertTypes: { ...notifPrefs.alertTypes, squadAnnouncements: e.target.checked }
                  })}
                  className="h-5 w-5 rounded border-white/20 accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border bg-black/10" style={{ borderColor: D.border }}>
                <span>LIVE WICKETS & MILESTONE PUSHES</span>
                <input
                  type="checkbox"
                  checked={notifPrefs.alertTypes.liveWicketsAndMilestones}
                  onChange={(e) => setNotifPrefs({
                    ...notifPrefs,
                    alertTypes: { ...notifPrefs.alertTypes, liveWicketsAndMilestones: e.target.checked }
                  })}
                  className="h-5 w-5 rounded border-white/20 accent-emerald-500"
                />
              </div>

              <Button
                onClick={handleSavePrefs}
                className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl"
                style={{ background: D.sky, color: 'black' }}
              >
                SAVE PREFERENCES
              </Button>
            </div>
          </div>

          {/* SMS & Push Log Feed */}
          <div className="lg:col-span-2 p-8 rounded-[2.5rem] border space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: D.border }}>
              <h3 className="text-xl font-black uppercase italic tracking-tight text-white" style={{ fontFamily: D.head }}>
                DISPATCHED ALERTS <span style={{ color: D.amber }}>LOG</span>
              </h3>
              <Badge className="bg-amber-500/10 text-amber-300 font-mono text-[9px]">LIVE AUDIT STREAM</Badge>
            </div>

            <div className="space-y-4">
              {INITIAL_PARENT_NOTIFICATIONS.map((n) => (
                <div key={n.id} className="p-4 rounded-2xl border bg-black/10 border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">{n.type}</Badge>
                      <span className="text-xs font-bold text-white">{n.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">{n.sentAt as string}</span>
                  </div>
                  <p className="text-xs text-zinc-300">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
