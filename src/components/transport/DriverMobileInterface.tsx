"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Navigation, 
  AlertTriangle, 
  Users, 
  Play, 
  CheckCheck, 
  Clock, 
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  Bell
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { D } from "@/lib/design-system";
import { transportService, TransportTrip, Passenger } from "@/lib/services/transportService";
import { parentNotificationService } from "@/lib/services/parentNotificationService";
import { ParentNotificationModal } from "./ParentNotificationModal";
import { toast } from "sonner";

interface DriverMobileInterfaceProps {
  tripId?: string;
}

export function DriverMobileInterface({ tripId = 'TRIP-101' }: DriverMobileInterfaceProps) {
  const [trip, setTrip] = useState<TransportTrip | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [safetyChecklist, setSafetyChecklist] = useState([
    { id: 'brakes', label: 'Brakes & Air/Hydraulic Pressure', checked: true },
    { id: 'tires', label: 'Tire Pressure & Tread Depth (>3mm)', checked: true },
    { id: 'fuel', label: 'Fuel Level (>50% Capacity)', checked: true },
    { id: 'lights', label: 'Headlights, Indicators & Brake Lights', checked: true },
    { id: 'firstaid', label: 'First Aid Kit & Fire Extinguisher', checked: true },
    { id: 'doors', label: 'Emergency Exits & Door Seals', checked: true },
  ]);

  const toggleSafetyItem = (id: string) => {
    setSafetyChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const allSafetyPassed = safetyChecklist.every(item => item.checked);

  useEffect(() => {
    setLoading(true);
    const unsubscribeTrips = transportService.subscribeTrips((trips) => {
      const activeTrip = trips.find(t => t.id === tripId) || trips[0];
      if (activeTrip) {
        setTrip(activeTrip);
        setPassengers(activeTrip.passengers || []);
      }
      setLoading(false);
    });

    return () => unsubscribeTrips();
  }, [tripId]);

  const handleTogglePassenger = async (passengerId: string, currentStatus: string) => {
    if (!trip) return;
    const newStatus = currentStatus === 'Boarded' ? 'Pending' : 'Boarded';
    const updated = passengers.map(p => p.id === passengerId ? { ...p, status: newStatus as any } : p);
    setPassengers(updated);

    const passenger = passengers.find(p => p.id === passengerId);

    const currentTripId = trip.id || 'TRIP-101';

    try {
      await transportService.updatePassengerStatus(passengerId, newStatus);
      if (newStatus === 'Boarded' && passenger) {
        toast.success(`Marked ${passenger.name} as BOARDED`);
        // Trigger automated parent notification
        parentNotificationService.notifyStudentBoarded(currentTripId, passenger.name || 'Student', trip.vehicleName || 'Squad Bus', trip.destination);
      } else if (passenger) {
        toast.info(`Reset ${passenger.name} status`);
      }
    } catch (err) {
      toast.error("Failed to update passenger status");
    }
  };

  const handleUpdateTripStatus = async (newStatus: TransportTrip['status']) => {
    if (!trip) return;
    const currentTripId = trip.id || 'TRIP-101';
    try {
      await transportService.updateTrip(currentTripId, { status: newStatus });
      setTrip(prev => prev ? { ...prev, status: newStatus } : null);

      if (newStatus === 'IN TRANSIT') {
        toast.success("TRIP STARTED! Squad bus is en route.");
        await parentNotificationService.notifyTripDeparted(currentTripId, trip.vehicleName || 'Squad Bus', trip.destination, '08:35 AM', passengers.length);
      } else if (newStatus === 'ARRIVED') {
        toast.success("SAFE ARRIVAL CONFIRMED!");
        await parentNotificationService.notifyTripArrived(currentTripId, trip.vehicleName || 'Squad Bus', trip.destination);
      }
    } catch (err) {
      toast.error("Failed to update trip status");
    }
  };

  if (loading || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: D.surf1, color: D.textPrimary }}>
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
          <p className="text-xs font-black uppercase tracking-widest opacity-60">LOADING DRIVER MANIFEST...</p>
        </div>
      </div>
    );
  }

  const boardedCount = passengers.filter(p => p.status === 'Boarded').length;
  const totalCount = passengers.length;
  const progressPct = totalCount > 0 ? Math.round((boardedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto border-x shadow-2xl overflow-x-hidden select-none" style={{ background: D.surf1, borderColor: D.border, color: D.textPrimary }}>
      {/* Top Driver Header */}
      <div className="p-5 border-b sticky top-0 z-40 backdrop-blur-xl" style={{ background: `${D.surf2}ee`, borderColor: D.border }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest block opacity-50" style={{ color: D.textMuted }}>
                SCRBRD DRIVER PWA
              </span>
              <h1 className="text-base font-black italic uppercase tracking-tight" style={{ fontFamily: D.head }}>
                {trip.vehicleName}
              </h1>
            </div>
          </div>
          
          <Badge 
            variant="outline"
            className={`text-[9px] font-black uppercase px-2.5 py-1 ${
              trip.status === 'ARRIVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
              trip.status === 'IN TRANSIT' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' :
              'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
            }`}
          >
            {trip.status}
          </Badge>
        </div>

        {/* Route Info Pill */}
        <div className="p-3 rounded-xl border flex items-center justify-between" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="text-[8px] font-black uppercase block opacity-50" style={{ color: D.textMuted }}>DESTINATION</span>
              <span className="text-xs font-bold truncate block" style={{ color: D.textPrimary }}>{trip.destination}</span>
            </div>
          </div>
          <a 
            href={`https://maps.google.com/?q=${encodeURIComponent(trip.destination)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 shadow-md"
          >
            <Navigation className="w-3 h-3" /> MAPS
          </a>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 flex-1 space-y-5">
        {/* Pre-Trip Vehicle Safety Inspection Button */}
        <button
          onClick={() => setSafetyModalOpen(true)}
          className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98] ${
            allSafetyPassed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert className={`w-4 h-4 ${allSafetyPassed ? 'text-emerald-400' : 'text-rose-400'}`} />
            <div className="text-left">
              <span className="text-[9px] font-black uppercase tracking-widest block opacity-70">PRE-TRIP VEHICLE INSPECTION</span>
              <span className="text-xs font-bold block">{allSafetyPassed ? '6/6 SAFETY CHECKS PASSED' : 'INSPECTION REQUIRED'}</span>
            </div>
          </div>
          <Badge variant="outline" className={`text-[8px] font-black uppercase ${allSafetyPassed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'}`}>
            {allSafetyPassed ? 'VERIFIED' : 'REVIEW'}
          </Badge>
        </button>

        {/* Boarding Progress Telemetry */}
        <div className="p-4 rounded-2xl border space-y-3" style={{ background: D.surf2, borderColor: D.border }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 flex items-center gap-1.5" style={{ color: D.textMuted }}>
              <Users className="w-3.5 h-3.5 text-indigo-400" /> PASSENGER MANIFEST
            </span>
            <span className="text-xs font-black" style={{ fontFamily: D.mono, color: D.textPrimary }}>
              {boardedCount} / {totalCount} ({progressPct}%)
            </span>
          </div>

          <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden border p-0.5" style={{ borderColor: D.border }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 shadow-md"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold opacity-60 pt-1" style={{ color: D.textMuted }}>
            <span>DEPARTURE: {trip.departureTime}</span>
            <button 
              onClick={() => setNotificationModalOpen(true)}
              className="text-indigo-400 hover:underline flex items-center gap-1 font-black uppercase"
            >
              <Bell className="w-3 h-3" /> PARENT ALERTS
            </button>
          </div>
        </div>

        {/* Big Touch Action Controls */}
        <div className="grid grid-cols-2 gap-3">
          {trip.status !== 'IN TRANSIT' && trip.status !== 'ARRIVED' && (
            <Button
              onClick={() => handleUpdateTripStatus('IN TRANSIT')}
              className="h-16 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-95 col-span-2"
            >
              <Play className="w-5 h-5 fill-current" /> DEPART NOW (IN TRANSIT)
            </Button>
          )}

          {trip.status === 'IN TRANSIT' && (
            <Button
              onClick={() => handleUpdateTripStatus('ARRIVED')}
              className="h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-95 col-span-2"
            >
              <CheckCheck className="w-6 h-6" /> ARRIVED AT VENUE
            </Button>
          )}
        </div>

        {/* Pre-Trip Vehicle Safety Modal */}
        <AnimatePresence>
          {safetyModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm p-5 rounded-3xl border space-y-4 shadow-2xl"
                style={{ background: D.surf2, borderColor: D.border }}
              >
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: D.border }}>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-sm font-black uppercase" style={{ fontFamily: D.head }}>PRE-TRIP SAFETY CHECK</h2>
                  </div>
                  <button onClick={() => setSafetyModalOpen(false)} className="text-xs font-black uppercase opacity-60">CLOSE</button>
                </div>

                <div className="space-y-2">
                  {safetyChecklist.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleSafetyItem(item.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                        item.checked ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-black/30 border-white/10 text-white/50'
                      }`}
                    >
                      <span>{item.label}</span>
                      <Badge variant="outline" className={`text-[8px] font-black uppercase ${item.checked ? 'bg-emerald-500 text-black font-black' : 'bg-black/40 text-white/40'}`}>
                        {item.checked ? 'PASSED' : 'TAP TO PASS'}
                      </Badge>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={() => {
                    toast.success("Vehicle Pre-Trip Inspection Verified!");
                    setSafetyModalOpen(false);
                  }}
                  className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase text-xs rounded-xl shadow-lg"
                >
                  SAVE INSPECTION VERIFICATION
                </Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Passenger Checklist Cards */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: D.textMuted }}>
              TAP STUDENT CARD TO CHECK-IN
            </span>
            <span className="text-[9px] font-bold opacity-40 uppercase" style={{ color: D.textMuted }}>
              INSTANT PARENT SMS SYNC
            </span>
          </div>

          {passengers.map((p) => {
            const isBoarded = p.status === 'Boarded';
            return (
              <button
                key={p.id}
                onClick={() => handleTogglePassenger(p.id, p.status)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between active:scale-[0.98] ${
                  isBoarded ? 'shadow-md border-emerald-500/40' : 'hover:border-indigo-500/40'
                }`}
                style={{ 
                  background: isBoarded ? `${D.emerald}12` : D.surf2, 
                  borderColor: isBoarded ? `${D.emerald}40` : D.border 
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                    isBoarded ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-black/30 text-white/50 border-white/10'
                  }`}>
                    {isBoarded ? <CheckCircle2 className="w-6 h-6" /> : p.seatNumber || '#'}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-black uppercase tracking-tight truncate" style={{ fontFamily: D.head, color: D.textPrimary }}>
                      {p.name}
                    </h3>
                    <p className="text-[10px] font-bold opacity-50 uppercase flex items-center gap-1 mt-0.5" style={{ color: D.textMuted }}>
                      {p.role || 'Player'} • {p.contact || 'No Contact'}
                    </p>
                  </div>
                </div>

                <Badge 
                  variant="outline"
                  className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl shrink-0 ${
                    isBoarded 
                      ? 'bg-emerald-500 text-black font-black border-emerald-400' 
                      : 'bg-black/40 text-muted-foreground border-white/10'
                  }`}
                >
                  {isBoarded ? 'BOARDED' : 'TAP TO BOARD'}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Emergency Coach Contact Bar */}
        <div className="p-4 rounded-2xl border flex items-center justify-between" style={{ background: `${D.rose}10`, borderColor: `${D.rose}30` }}>
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="text-[9px] font-black uppercase block text-rose-300">EMERGENCY COACH CONTACT</span>
              <span className="text-xs font-bold block" style={{ color: D.textPrimary }}>Head Coach (A. Smith)</span>
            </div>
          </div>
          <a
            href="tel:+27825551234"
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase flex items-center gap-1.5 shrink-0 shadow-lg active:scale-95"
          >
            <Phone className="w-3.5 h-3.5 fill-current" /> CALL NOW
          </a>
        </div>
      </div>

      <ParentNotificationModal 
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        tripId={trip.id}
        vehicleName={trip.vehicleName}
        destination={trip.destination}
        passengerCount={totalCount}
      />
    </div>
  );
}
