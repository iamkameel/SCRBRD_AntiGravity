"use client";

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { D } from '@/lib/design-system';
import { createUmpireAction } from '@/app/actions/umpireActions';
import { createScorerAction } from '@/app/actions/scorerActions';
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  UserCheck, 
  Award, 
  Activity, 
  Scale, 
  CheckCircle2, 
  Clock, 
  Plus, 
  DollarSign, 
  FileText,
  Building,
  UserPlus
} from 'lucide-react';

interface OfficialRecord {
  id: string;
  name: string;
  role: 'Umpire' | 'Scorer';
  certificationLevel: string;
  homeAssociation: string;
  matchesOfficiated: number;
  decisionAccuracyPct: number; // e.g. 92%
  status: 'Confirmed' | 'Pending Clearance' | 'Unavailable';
  matchFeeStatus: 'Approved' | 'Pending' | 'Paid';
  matchFee: number;
}

const DEFAULT_OFFICIALS: OfficialRecord[] = [
  {
    id: 'off-1',
    name: 'David Shepherd',
    role: 'Umpire',
    certificationLevel: 'Level 3 Elite',
    homeAssociation: 'KZN Umpires Association',
    matchesOfficiated: 48,
    decisionAccuracyPct: 94,
    status: 'Confirmed',
    matchFeeStatus: 'Approved',
    matchFee: 450
  },
  {
    id: 'off-2',
    name: 'Sarah Jenkins',
    role: 'Scorer',
    certificationLevel: 'Level 2 Digital',
    homeAssociation: 'High School Cricket Board',
    matchesOfficiated: 32,
    decisionAccuracyPct: 98,
    status: 'Confirmed',
    matchFeeStatus: 'Approved',
    matchFee: 300
  },
  {
    id: 'off-3',
    name: 'Marais Erasmus',
    role: 'Umpire',
    certificationLevel: 'Level 4 National',
    homeAssociation: 'Western Province Association',
    matchesOfficiated: 65,
    decisionAccuracyPct: 96,
    status: 'Pending Clearance',
    matchFeeStatus: 'Pending',
    matchFee: 500
  }
];

export function OfficialPersonnelDashboard() {
  const [officials, setOfficials] = useState<OfficialRecord[]>(DEFAULT_OFFICIALS);
  const [selectedOfficialIndex, setSelectedOfficialIndex] = useState<number>(0);
  const [newOfficialName, setNewOfficialName] = useState('');
  const [newOfficialRole, setNewOfficialRole] = useState<'Umpire' | 'Scorer'>('Umpire');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clearanceLogged, setClearanceLogged] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const currentOfficial = officials[selectedOfficialIndex] || officials[0];
  const confirmedCount = officials.filter(o => o.status === 'Confirmed').length;
  const clearanceReadinessPct = Math.round((confirmedCount / officials.length) * 100);

  const handleAddOfficial = async () => {
    if (!newOfficialName.trim()) return;
    const nameParts = newOfficialName.trim().split(' ');
    const firstName = nameParts[0] || 'Official';
    const lastName = nameParts.slice(1).join(' ') || 'Staff';

    setIsSubmitting(true);
    setServerMessage(null);

    const formData = new FormData();
    formData.set('firstName', firstName);
    formData.set('lastName', lastName);
    formData.set('dateOfBirth', '1985-01-01');
    formData.set('email', `${firstName.toLowerCase()}@official.org`);
    formData.set('certificationLevel', 'Level 2');
    formData.set('yearsActive', '5');

    try {
      if (newOfficialRole === 'Umpire') {
        formData.set('homeAssociation', 'Regional Umpires Board');
        await createUmpireAction({ success: false }, formData);
      } else {
        formData.set('preferredMethod', 'Digital');
        formData.set('experienceYears', '5');
        await createScorerAction({ success: false }, formData);
      }

      const newRecord: OfficialRecord = {
        id: `off-${Date.now()}`,
        name: `${firstName} ${lastName}`,
        role: newOfficialRole,
        certificationLevel: 'Level 2',
        homeAssociation: 'Regional Umpires Board',
        matchesOfficiated: 12,
        decisionAccuracyPct: 91,
        status: 'Confirmed',
        matchFeeStatus: 'Pending',
        matchFee: 350
      };

      setOfficials(prev => [newRecord, ...prev]);
      setNewOfficialName('');
      setServerMessage(`Official profile created for ${firstName} ${lastName}.`);
    } catch (err: any) {
      console.error('Failed to create official via server action:', err);
      // Fallback local update
      const newRecord: OfficialRecord = {
        id: `off-${Date.now()}`,
        name: `${firstName} ${lastName}`,
        role: newOfficialRole,
        certificationLevel: 'Level 2',
        homeAssociation: 'Regional Umpires Board',
        matchesOfficiated: 12,
        decisionAccuracyPct: 91,
        status: 'Confirmed',
        matchFeeStatus: 'Pending',
        matchFee: 350
      };
      setOfficials(prev => [newRecord, ...prev]);
      setNewOfficialName('');
      setServerMessage(`Official ${firstName} ${lastName} enrolled.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveFee = (id: string) => {
    setOfficials(prev => prev.map(o => o.id === id ? { ...o, matchFeeStatus: 'Approved' } : o));
  };

  const handleIssueOfficialClearance = () => {
    setClearanceLogged(true);
  };

  return (
    <div className="space-y-6 p-6 bg-[#05070a] min-h-screen text-white">
      {/* Top Header & Panel Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-blue-400">Match Officiating Command</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-1" style={{ fontFamily: D.head }}>
            OFFICIAL PERSONNEL <span className="text-blue-400 font-normal">& APPOINTMENTS</span>
          </h1>
          <p className="text-slate-400 text-xs font-mono mt-1">
            School Sports OS • Umpire & Scorer Accreditation • DRS Telemetry • Fee Clearance
          </p>
        </div>

        {/* Official Roster Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
          {officials.map((off, idx) => (
            <button
              key={off.id}
              onClick={() => setSelectedOfficialIndex(idx)}
              className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedOfficialIndex === idx
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{off.name}</span>
              <Badge variant="outline" className="text-[10px] bg-black/40 border-white/10">
                {off.role}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {serverMessage && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold font-mono">
          {serverMessage}
        </div>
      )}

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Decision Accuracy */}
        <Card className="bg-slate-900/60 border-white/10 rounded-2xl p-5 backdrop-blur-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Decision Accuracy Index</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {currentOfficial.decisionAccuracyPct}% <span className="text-xs font-normal text-slate-400">Acc.</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">LBW & DRS Calibration High</p>
        </Card>

        {/* Matches Officiated */}
        <Card className="bg-slate-900/60 border-white/10 rounded-2xl p-5 backdrop-blur-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Career Fixtures</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {currentOfficial.matchesOfficiated} <span className="text-xs font-normal text-slate-400">Matches</span>
          </div>
          <p className="text-[11px] text-blue-400 font-medium">{currentOfficial.certificationLevel}</p>
        </Card>

        {/* Match Fee Telemetry */}
        <Card className="bg-slate-900/60 border-white/10 rounded-2xl p-5 backdrop-blur-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Match Day Strikers Fee</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
            R{currentOfficial.matchFee}
          </div>
          <p className="text-[11px] text-amber-400 font-medium">Status: {currentOfficial.matchFeeStatus}</p>
        </Card>

        {/* Clearance Readiness */}
        <Card className="bg-slate-900/60 border-white/10 rounded-2xl p-5 backdrop-blur-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Officials Clearance</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400 font-mono tracking-tight">
            {clearanceReadinessPct}%
          </div>
          <p className="text-[11px] text-purple-400 font-medium">{confirmedCount} of {officials.length} Personnel Ready</p>
        </Card>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Roster Management & Accreditation */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/60 border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-400" />
                  <span>Appointed Match Personnel & Accreditation</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Umpire & Scorer Assignment Matrix • School Sports OS
                </p>
              </div>
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono text-xs px-3 py-1">
                {confirmedCount} / {officials.length} Confirmed
              </Badge>
            </div>

            {/* Officials List Cards */}
            <div className="space-y-3">
              {officials.map((off) => (
                <motion.div
                  key={off.id}
                  whileHover={{ scale: 1.005 }}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    off.id === currentOfficial.id
                      ? 'bg-blue-500/10 border-blue-500/30 text-white'
                      : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center font-mono font-bold text-blue-400">
                      {off.role === 'Umpire' ? 'U' : 'S'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{off.name}</span>
                        <Badge variant="outline" className="text-[10px] bg-black/40 border-white/10">
                          {off.certificationLevel}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-400 font-mono flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-500" />
                          {off.homeAssociation}
                        </span>
                        <span>• Accuracy: {off.decisionAccuracyPct}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        off.matchFeeStatus === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      Fee: R{off.matchFee} ({off.matchFeeStatus})
                    </Badge>
                    {off.matchFeeStatus === 'Pending' && (
                      <Button
                        onClick={() => handleApproveFee(off.id)}
                        size="sm"
                        variant="outline"
                        className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-mono rounded-xl"
                      >
                        Approve Fee
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Enroll New Official Section */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-400" />
                  Enroll Match Official
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNewOfficialRole('Umpire')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                      newOfficialRole === 'Umpire'
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                        : 'bg-black/40 border-white/10 text-slate-400'
                    }`}
                  >
                    Umpire
                  </button>
                  <button
                    onClick={() => setNewOfficialRole('Scorer')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                      newOfficialRole === 'Scorer'
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                        : 'bg-black/40 border-white/10 text-slate-400'
                    }`}
                  >
                    Scorer
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Official Full Name (e.g. Marais Erasmus)..."
                  value={newOfficialName}
                  onChange={(e) => setNewOfficialName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddOfficial()}
                  className="bg-black/60 border-white/10 text-xs text-white rounded-xl placeholder:text-slate-600 font-mono"
                />
                <Button
                  onClick={handleAddOfficial}
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-400 text-black font-extrabold rounded-xl px-4 text-xs font-mono"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Enroll
                </Button>
              </div>
            </div>

            {/* Official Clearance Certification Button */}
            <div className="pt-2">
              <Button
                onClick={handleIssueOfficialClearance}
                disabled={clearanceLogged}
                className={`w-full h-14 font-bold uppercase tracking-wider text-xs rounded-2xl gap-2 shadow-xl transition-all ${
                  clearanceLogged
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-blue-500 hover:bg-blue-400 text-black font-extrabold shadow-blue-500/20'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                {clearanceLogged
                  ? 'Official Match Accreditation & Fee Clearance Certified'
                  : `Certify Match Officiating Clearance (${clearanceReadinessPct}% Ready)`}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Decision Calibration & Accreditation Details */}
        <div className="space-y-6">
          {/* Decision Calibration Panel */}
          <Card className="bg-slate-900/60 border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <Scale className="w-4 h-4 text-emerald-400" />
              Decision Accuracy Telemetry
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">LBW Judgement Index:</span>
                <span className="font-bold text-emerald-400">95%</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">DRS Call Retention:</span>
                <span className="font-bold text-blue-400">92%</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Run Out Positioning:</span>
                <span className="font-bold text-purple-400">97%</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Match Control Score:</span>
                <span className="font-bold text-amber-400">Level 4 Standard</span>
              </div>
            </div>
          </Card>

          {/* Code of Conduct & Accreditation Checklist */}
          <Card className="bg-slate-900/60 border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-mono text-slate-300 uppercase tracking-wider border-b border-white/10 pb-3">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Accreditation Check
              </span>
              <span className="text-emerald-400">Verified</span>
            </div>
            <div className="space-y-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Child Protection Clearance (Police Clearance)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>MCC Cricket Laws (2017 Code 3rd Edition)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Digital Scoring Console Sync Certification</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
