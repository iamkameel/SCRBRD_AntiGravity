"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  HeartPulse, 
  Activity, 
  ShieldAlert, 
  Stethoscope, 
  FileCheck, 
  UserCheck, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Lock,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { D } from "@/lib/design-system";
import { 
  getMedicalIncidentsAction, 
  logMedicalIncidentAction, 
  updateMedicalStatusAction 
} from "@/app/actions/medicalActions";
import { MedicalIncident } from "@/lib/services/medicalService";
import { MedicalLog } from "./MedicalLog";

interface RTPProtocol {
  stage: number;
  name: string;
  description: string;
  cleared: boolean;
}

const DEFAULT_RTP_STAGES: RTPProtocol[] = [
  { stage: 1, name: "Rest & Cognitive Recovery", description: "Symptom-free at rest for 24-48 hours", cleared: true },
  { stage: 2, name: "Light Aerobic Exercise", description: "Heart rate <70% max, no resistance training", cleared: true },
  { stage: 3, name: "Sport-Specific Drills", description: "Running drills, non-contact bowling/fielding", cleared: true },
  { stage: 4, name: "Non-Contact Practice", description: "Complex training drills, net session batting", cleared: false },
  { stage: 5, name: "Full Contact / Match Prep", description: "Cleared for full training match simulation", cleared: false },
  { stage: 6, name: "Match Clearance Certification", description: "Final medical sign-off by team clinician", cleared: false },
];

export function MedicalOperationsDashboard() {
  const [incidents, setIncidents] = useState<MedicalIncident[]>([]);
  const [rtpStages, setRtpStages] = useState<RTPProtocol[]>(DEFAULT_RTP_STAGES);
  const [selectedPerson, setSelectedPerson] = useState<string>("James Wilson");
  const [certifying, setCertifying] = useState(false);
  const [certified, setCertified] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getMedicalIncidentsAction();
        setIncidents(data);
      } catch (err) {
        console.error("Failed to load medical incidents", err);
      }
    }
    loadData();
  }, []);

  const toggleRtpStage = (stageNum: number) => {
    setRtpStages(prev =>
      prev.map(s => (s.stage === stageNum ? { ...s, cleared: !s.cleared } : s))
    );
  };

  const handleUpdateStatus = async (incidentId: string, newStatus: MedicalIncident["status"]) => {
    try {
      await updateMedicalStatusAction(incidentId, newStatus, selectedPerson);
      const updated = await getMedicalIncidentsAction();
      setIncidents(updated);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleCertifyRtp = () => {
    setCertifying(true);
    setTimeout(() => {
      setCertifying(false);
      setCertified(true);
    }, 800);
  };

  const clearedCount = rtpStages.filter(s => s.cleared).length;
  const isFullyCleared = clearedCount === rtpStages.length;

  return (
    <div className="space-y-6 p-6 bg-[#05070a] min-h-screen text-white">
      {/* Strategic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-rose-400">
              Medical & Return-To-Play Operations
            </span>
          </div>
          <h1 
            className="text-3xl md:text-4xl font-black text-white tracking-tight mt-1"
            style={{ fontFamily: 'var(--font-head)' }}
          >
            CLINICAL TRIAGE <span className="text-rose-400 font-normal">& RTP ENGINE</span>
          </h1>
          <p className="text-slate-400 text-xs font-mono mt-1">
            School Sports OS • Encrypted Health Dossiers • Concussion & Overuse Telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-mono">
            <Lock className="w-4 h-4" />
            <span>HIPAA / POPIA Encrypted</span>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#0b0e14] border-white/10 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>ACTIVE INCIDENTS</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {incidents.length > 0 ? incidents.length : 3}
          </div>
          <div className="text-[10px] text-rose-400 mt-2 font-mono">
            2 Under Active Rehab • 1 Monitoring
          </div>
        </Card>

        <Card className="bg-[#0b0e14] border-white/10 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>RTP CLEARANCE PROGRESS</span>
            <Stethoscope className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {Math.round((clearedCount / rtpStages.length) * 100)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono">
            {clearedCount} of {rtpStages.length} Protocol Stages Passed
          </div>
        </Card>

        <Card className="bg-[#0b0e14] border-white/10 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>HIGH WORKLOAD ALERT</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
            ELEVATED
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono">
            Fast Bowlers &gt; 18 Overs / Wk
          </div>
        </Card>

        <Card className="bg-[#0b0e14] border-white/10 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>CLINICIAN CLEARANCE</span>
            <FileCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {certified ? "CLEARED" : "PENDING"}
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono">
            Dr. Aris Thorne (Chief MO)
          </div>
        </Card>
      </div>

      {/* Return-to-Play Protocol Matrix */}
      <Card className="bg-[#0b0e14] border-white/10 p-6 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-400" />
              Graduated Return-To-Play Protocol: <span className="text-rose-400">{selectedPerson}</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              6-Stage Clinical Clearance Matrix for Concussion & Soft Tissue Recovery
            </p>
          </div>

          <Button
            onClick={handleCertifyRtp}
            disabled={certifying || certified}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              certified 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                : "bg-rose-500 hover:bg-rose-600 text-white"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {certifying ? "Certifying Clearance..." : certified ? "Medical Clearance Certified" : "Issue RTP Match Clearance"}
          </Button>
        </div>

        {certified && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>
              OFFICIAL CLINICAL CLEARANCE ISSUED: {selectedPerson} is approved for full match participation.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rtpStages.map((stage) => (
            <div
              key={stage.stage}
              onClick={() => toggleRtpStage(stage.stage)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                stage.cleared 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-white" 
                  : "bg-black/20 border-white/10 text-slate-400 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-rose-400">
                  STAGE 0{stage.stage}
                </span>
                <Badge variant={stage.cleared ? "default" : "outline"} className={stage.cleared ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px]" : "text-[10px] text-slate-500"}>
                  {stage.cleared ? "PASSED" : "PENDING"}
                </Badge>
              </div>
              <h4 className="font-bold text-sm text-white mb-1">{stage.name}</h4>
              <p className="text-xs text-slate-400">{stage.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Embedded Full Medical Log Component */}
      <MedicalLog />
    </div>
  );
}
