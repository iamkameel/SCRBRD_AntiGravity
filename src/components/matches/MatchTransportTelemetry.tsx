"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Users, 
  Radio, 
  Clock, 
  Navigation, 
  ShieldCheck, 
  Bell,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { D } from "@/lib/design-system";
import { transportService, TransportTrip } from "@/lib/services/transportService";
import { ParentNotificationModal } from "@/components/transport/ParentNotificationModal";
import Link from 'next/link';

interface MatchTransportTelemetryProps {
  fixtureId?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  isCompact?: boolean;
}

export function MatchTransportTelemetry({
  fixtureId = 'match-101',
  homeTeamName = 'Westville 1st XI',
  awayTeamName = 'Kearsney 1st XI',
  isCompact = false
}: MatchTransportTelemetryProps) {
  const [trip, setTrip] = useState<TransportTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [parentModalOpen, setParentModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = transportService.subscribeTrips((trips) => {
      // Find trip matching fixture or default to first
      const activeTrip = trips.find(t => t.fixtureId === fixtureId) || trips[0];
      if (activeTrip) {
        setTrip(activeTrip);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fixtureId]);

  if (loading || !trip) return null;

  const passengers = trip.passengers || [];
  const boardedCount = passengers.filter(p => p.status === 'Boarded').length;
  const totalCount = passengers.length;
  const boardedPct = totalCount > 0 ? Math.round((boardedCount / totalCount) * 100) : 0;

  if (isCompact) {
    return (
      <div 
        className="p-4 rounded-2xl border flex items-center justify-between shadow-md"
        style={{ background: D.surf2, borderColor: D.border }}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner ${
            trip.status === 'ARRIVED' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
            trip.status === 'IN TRANSIT' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
            'border-indigo-500/30 text-indigo-400 bg-indigo-500/10'
          }`}>
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black italic uppercase" style={{ fontFamily: D.head, color: D.textPrimary }}>
                {trip.vehicleName}
              </span>
              <Badge 
                variant="outline"
                className={`text-[8px] font-black uppercase px-2 py-0.5 ${
                  trip.status === 'ARRIVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  trip.status === 'IN TRANSIT' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' :
                  'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                }`}
              >
                {trip.status}
              </Badge>
            </div>
            <p className="text-[10px] font-bold opacity-60 uppercase flex items-center gap-2 mt-0.5" style={{ color: D.textMuted }}>
              <span>MANIFEST: {boardedCount}/{totalCount} BOARDED ({boardedPct}%)</span>
              <span>•</span>
              <span>ETA {trip.arrivalTime || '08:35 AM'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/transport/driver/${trip.id}`}>
            <Button size="sm" variant="outline" className="text-[9px] font-black uppercase h-8 rounded-lg gap-1">
              <ExternalLink className="w-3 h-3" /> DRIVER VIEW
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 rounded-3xl border shadow-xl space-y-5 relative overflow-hidden"
      style={{ background: D.surf2, borderColor: D.border }}
    >
      {/* Decorative accent background highlight */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: trip.status === 'ARRIVED' ? D.emerald : trip.status === 'IN TRANSIT' ? D.amber : D.indigo }}
      />

      {/* Header telemetry strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: D.border }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner text-indigo-400" style={{ background: D.surf1, borderColor: D.border }}>
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-black italic uppercase tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>
                SQUAD TRANSPORT TELEMETRY
              </h3>
              <Badge 
                variant="outline"
                className={`text-[9px] font-black uppercase px-2.5 py-1 ${
                  trip.status === 'ARRIVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  trip.status === 'IN TRANSIT' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' :
                  'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                }`}
              >
                {trip.status === 'ARRIVED' ? 'ARRIVED AT VENUE' : trip.status === 'IN TRANSIT' ? 'EN ROUTE' : 'PREPARING'}
              </Badge>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2 mt-0.5" style={{ color: D.textMuted }}>
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> LIVE TELEMETRY STREAM • {trip.vehicleName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button 
            size="sm"
            onClick={() => setParentModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase rounded-xl h-10 px-4 gap-1.5 shadow-md"
          >
            <Bell className="w-3.5 h-3.5" /> PARENT ALERTS
          </Button>

          <Link href={`/transport/driver/${trip.id}`}>
            <Button size="sm" variant="outline" className="font-black text-xs uppercase rounded-xl h-10 px-4 gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> DRIVER PWA
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Vehicle & Driver */}
        <div className="p-4 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] block opacity-50 mb-1" style={{ color: D.textMuted }}>
            ASSIGNED FLEET & DRIVER
          </span>
          <h4 className="text-sm font-black uppercase tracking-tight truncate" style={{ fontFamily: D.head, color: D.textPrimary }}>
            {trip.vehicleName}
          </h4>
          <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs font-bold" style={{ borderColor: D.border }}>
            <span opacity-70 style={{ color: D.textMuted }}>{trip.driverName || 'S. Khumalo'}</span>
            <a href={`tel:${trip.driverPhone || '+27825551234'}`} className="text-emerald-400 hover:underline flex items-center gap-1">
              <Phone className="w-3 h-3" /> CALL DRIVER
            </a>
          </div>
        </div>

        {/* Card 2: Destination & Schedule */}
        <div className="p-4 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] block opacity-50 mb-1" style={{ color: D.textMuted }}>
            DESTINATION VENUE
          </span>
          <h4 className="text-sm font-black uppercase tracking-tight truncate flex items-center gap-1.5" style={{ fontFamily: D.head, color: D.textPrimary }}>
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" /> {trip.destination}
          </h4>
          <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs font-bold opacity-70" style={{ borderColor: D.border, color: D.textMuted }}>
            <span>DEPARTED: {trip.departureTime}</span>
            <span>ETA: {trip.arrivalTime || '08:35 AM'}</span>
          </div>
        </div>

        {/* Card 3: Boarding Manifest gauge */}
        <div className="p-4 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50" style={{ color: D.textMuted }}>
              SQUAD BOARDING MANIFEST
            </span>
            <span className="text-xs font-black text-emerald-400" style={{ fontFamily: D.mono }}>
              {boardedCount}/{totalCount} ({boardedPct}%)
            </span>
          </div>
          
          <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border p-0.5 mt-2" style={{ borderColor: D.border }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${boardedPct}%` }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 shadow-md"
            />
          </div>

          <p className="text-[10px] font-bold opacity-60 uppercase mt-2 text-right" style={{ color: D.textMuted }}>
            {boardedPct === 100 ? '✅ 100% SQUAD ACCOUNTED FOR' : `${totalCount - boardedCount} PLAYERS AWAITING BOARDING`}
          </p>
        </div>
      </div>

      <ParentNotificationModal 
        isOpen={parentModalOpen}
        onClose={() => setParentModalOpen(false)}
        tripId={trip.id}
        vehicleName={trip.vehicleName}
        destination={trip.destination}
        passengerCount={totalCount}
      />
    </div>
  );
}
