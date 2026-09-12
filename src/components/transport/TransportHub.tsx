"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Users, 
  ChevronRight, 
  Plus, 
  ShieldCheck, 
  AlertCircle,
  Navigation,
  Fuel,
  Wrench,
  UserCheck,
  Calendar,
  MoreVertical,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Check,
  Search,
  Filter,
  Play,
  RotateCcw,
  Sparkles,
  Map,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { D } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { transportService } from "@/lib/services/transportService";
import { transportEngine } from "@/lib/intelligence/transportEngine";
import Link from "next/link";


export interface FleetVehicle {
  id: string;
  name: string;
  type: 'Bus' | 'Van' | 'Minibus';
  registration: string;
  capacity: number;
  status: 'AVAILABLE' | 'IN TRANSIT' | 'MAINTENANCE';
  mileage: string;
  health: number;
  lastService: string;
  driverAssigned?: string;
}

export interface ManifestPassenger {
  id: string;
  name: string;
  role: 'Player' | 'Captain' | 'Coach' | 'Manager' | 'Physio' | 'Scorer';
  status: 'BOARDED' | 'AWAITING' | 'ABSENT';
  seatNumber?: number;
  emergencyPhone?: string;
}

export interface TransportTrip {
  id: string;
  fixture: string;
  destination: string;
  time: string;
  returnTime: string;
  vehicleId: string;
  vehicleName: string;
  driver: string;
  status: 'DRAFT' | 'CONFIRMED' | 'READY FOR DEPARTURE' | 'IN TRANSIT' | 'ARRIVED' | 'COMPLETED';
  passengers: ManifestPassenger[];
  routeStops: string[];
}

const INITIAL_FLEET: FleetVehicle[] = [
  { id: 'BUS-01', name: 'TITAN EXPRESS (24-SEATER)', type: 'Bus', registration: 'GP 492-719', capacity: 24, status: 'AVAILABLE', mileage: '12,400 KM', health: 98, lastService: '12 MAR 2026', driverAssigned: 'M. PETERSON' },
  { id: 'BUS-02', name: 'STRIKER SHUTTLE (16-SEATER)', type: 'Minibus', registration: 'GP 883-102', capacity: 16, status: 'IN TRANSIT', mileage: '8,200 KM', health: 85, lastService: '05 MAR 2026', driverAssigned: 'T. KHUMALO' },
  { id: 'VAN-03', name: 'SCOUT LOGISTICS VAN', type: 'Van', registration: 'GP 112-994', capacity: 8, status: 'MAINTENANCE', mileage: '4,100 KM', health: 42, lastService: '18 FEB 2026' },
];

const INITIAL_TRIPS: TransportTrip[] = [
  { 
    id: 'TRIP-742', 
    fixture: 'VS ST JOHNS (1ST XI AWAY)', 
    destination: 'St Johns College Oval, Houghton',
    time: '07:30 AM', 
    returnTime: '17:30 PM',
    vehicleId: 'BUS-01', 
    vehicleName: 'TITAN EXPRESS',
    driver: 'M. PETERSON', 
    status: 'READY FOR DEPARTURE',
    routeStops: ['Main School Gate (07:15)', 'N3 Highway Slipway', 'St Johns Oval (07:55)'],
    passengers: [
      { id: 'p1', name: 'Mark Boucher', role: 'Coach', status: 'BOARDED', emergencyPhone: '+27 82 555 0101' },
      { id: 'p2', name: 'Aiden Markram', role: 'Captain', status: 'BOARDED', emergencyPhone: '+27 83 444 0202' },
      { id: 'p3', name: 'Heinrich Klaasen', role: 'Player', status: 'BOARDED', emergencyPhone: '+27 82 333 0303' },
      { id: 'p4', name: 'Marco Jansen', role: 'Player', status: 'BOARDED', emergencyPhone: '+27 81 222 0404' },
      { id: 'p5', name: 'Kagiso Rabada', role: 'Player', status: 'AWAITING', emergencyPhone: '+27 82 111 0505' },
      { id: 'p6', name: 'Keshav Maharaj', role: 'Player', status: 'BOARDED', emergencyPhone: '+27 83 999 0606' },
      { id: 'p7', name: 'Lungi Ngidi', role: 'Player', status: 'AWAITING', emergencyPhone: '+27 82 888 0707' },
      { id: 'p8', name: 'David Miller', role: 'Player', status: 'BOARDED', emergencyPhone: '+27 84 777 0808' },
      { id: 'p9', name: 'Tristan Stubbs', role: 'Player', status: 'BOARDED', emergencyPhone: '+27 82 666 0909' },
      { id: 'p10', name: 'Gerald Coetzee', role: 'Player', status: 'BOARDED', emergencyPhone: '+27 83 555 1010' },
      { id: 'p11', name: 'Ryan Rickelton', role: 'Player', status: 'BOARDED', emergencyPhone: '+27 82 444 1111' },
      { id: 'p12', name: 'Tabraiz Shamsi', role: 'Player', status: 'AWAITING', emergencyPhone: '+27 81 333 1212' },
      { id: 'p13', name: 'Dr. S. Naidoo', role: 'Physio', status: 'BOARDED', emergencyPhone: '+27 82 000 9999' },
    ]
  },
  { 
    id: 'TRIP-745', 
    fixture: 'VS PRETORIA BOYS (2ND XI AWAY)', 
    destination: 'Pretoria Boys High Oval',
    time: '12:30 PM', 
    returnTime: '18:45 PM',
    vehicleId: 'BUS-02', 
    vehicleName: 'STRIKER SHUTTLE',
    driver: 'T. KHUMALO', 
    status: 'CONFIRMED',
    routeStops: ['North Gate Departure (12:15)', 'N1 North Highway', 'PBHS Main Pavilion (13:10)'],
    passengers: [
      { id: 'p21', name: 'G. Kirsten', role: 'Coach', status: 'BOARDED', emergencyPhone: '+27 82 100 2000' },
      { id: 'p22', name: 'L. Williams', role: 'Captain', status: 'BOARDED', emergencyPhone: '+27 83 200 3000' },
      { id: 'p23', name: 'D. Paterson', role: 'Player', status: 'AWAITING', emergencyPhone: '+27 82 300 4000' },
      { id: 'p24', name: 'W. Mulder', role: 'Player', status: 'AWAITING', emergencyPhone: '+27 81 400 5000' },
      { id: 'p25', name: 'S. Muthusamy', role: 'Player', status: 'BOARDED', emergencyPhone: '+27 83 500 6000' },
    ]
  }
];

export function TransportHub() {
  const [activeTab, setActiveTab] = useState<'fleet' | 'trips'>('trips');
  const [fleet, setFleet] = useState<FleetVehicle[]>(INITIAL_FLEET);
  const [trips, setTrips] = useState<TransportTrip[]>(INITIAL_TRIPS);
  const [selectedTripId, setSelectedTripId] = useState<string>('TRIP-742');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [selectedPassengerForCall, setSelectedPassengerForCall] = useState<ManifestPassenger | null>(null);

  // Form states for new trip
  const [newTripFixture, setNewTripFixture] = useState('');
  const [newTripDestination, setNewTripDestination] = useState('');
  const [newTripTime, setNewTripTime] = useState('08:00 AM');
  const [newTripVehicleId, setNewTripVehicleId] = useState('BUS-01');
  const [newTripDriver, setNewTripDriver] = useState('M. PETERSON');

  // Form states for new vehicle
  const [newVehName, setNewVehName] = useState('');
  const [newVehReg, setNewVehReg] = useState('');
  const [newVehCapacity, setNewVehCapacity] = useState('16');
  const [newVehType, setNewVehType] = useState<'Bus' | 'Van' | 'Minibus'>('Minibus');

  // Real-time Firestore Sync with fallback to INITIAL mock data
  useEffect(() => {
    const unsubVehicles = transportService.subscribeVehicles((fsVehicles) => {
      if (fsVehicles && fsVehicles.length > 0) {
        const mappedFleet: FleetVehicle[] = fsVehicles.map(v => ({
          id: v.id || v.registration,
          name: v.makeModel || 'SCHOOL VEHICLE',
          type: (v.type as any) || 'Bus',
          registration: v.registration || 'GP 000-000',
          capacity: v.capacity || 16,
          status: (v.status as any) || 'AVAILABLE',
          mileage: v.mileage || '0 KM',
          health: v.health ?? 98,
          lastService: v.lastService || 'RECENT',
          driverAssigned: v.assignedDriver
        }));
        setFleet(mappedFleet);
      }
    });

    const unsubTrips = transportService.subscribeTrips((fsTrips) => {
      if (fsTrips && fsTrips.length > 0) {
        const mappedTrips: TransportTrip[] = fsTrips.map(t => ({
          id: t.id || `TRIP-${Math.floor(100 + Math.random() * 900)}`,
          fixture: t.fixture || 'CRICKET MATCH TRIP',
          destination: t.destination || 'AWAY OVAL',
          time: t.time || '08:00 AM',
          returnTime: t.returnTime || '17:00 PM',
          vehicleId: t.vehicleId || 'BUS-01',
          vehicleName: t.vehicleName || 'TITAN EXPRESS',
          driver: t.driver || t.driverName || 'M. PETERSON',
          status: (t.status as any) || 'CONFIRMED',
          routeStops: t.routeStops || ['Main Gate Departure', t.destination || 'Destination'],
          passengers: (t.passengers && t.passengers.length > 0)
            ? t.passengers.map((p: any, idx: number) => ({
                id: p.id || `p-${t.id}-${idx}`,
                name: p.name || 'Squad Member',
                role: (p.role || p.roleOnTrip || 'Player') as any,
                status: p.status === 'Boarded' || p.status === 'BOARDED' ? 'BOARDED' : p.status === 'Absent' || p.status === 'ABSENT' ? 'ABSENT' : 'AWAITING',
                seatNumber: typeof p.seatNumber === 'number' ? p.seatNumber : idx + 1,
                emergencyPhone: p.emergencyPhone || p.contact || p.parentPhone || '+27 82 555 0101'
              }))
            : [
                { id: `p-${t.id}-1`, name: 'Mark Boucher', role: 'Coach', status: 'BOARDED', emergencyPhone: '+27 82 555 0101' },
                { id: `p-${t.id}-2`, name: 'Aiden Markram', role: 'Captain', status: 'BOARDED', emergencyPhone: '+27 83 444 0202' },
              ]
        }));
        setTrips(mappedTrips);
      }
    });

    return () => {
      if (typeof unsubVehicles === 'function') unsubVehicles();
      if (typeof unsubTrips === 'function') unsubTrips();
    };
  }, []);

  const selectedTrip = trips.find(t => t.id === selectedTripId) || trips[0];

  // Passenger boarding toggle
  const togglePassengerBoarding = (tripId: string, passengerId: string) => {
    let updatedTripObj: TransportTrip | null = null;
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      const updatedPassengers = t.passengers.map(p => {
        if (p.id !== passengerId) return p;
        const nextStatus: ManifestPassenger['status'] = 
          p.status === 'AWAITING' ? 'BOARDED' :
          p.status === 'BOARDED' ? 'ABSENT' : 'AWAITING';
        return { ...p, status: nextStatus };
      });

      // Recalculate trip readiness
      const boardedCount = updatedPassengers.filter(p => p.status === 'BOARDED').length;
      let nextTripStatus = t.status;
      if (boardedCount === updatedPassengers.length && t.status !== 'IN TRANSIT' && t.status !== 'ARRIVED') {
        nextTripStatus = 'READY FOR DEPARTURE';
      }

      updatedTripObj = {
        ...t,
        status: nextTripStatus,
        passengers: updatedPassengers
      };
      return updatedTripObj;
    }));

    if (updatedTripObj) {
      transportService.updateTrip(tripId, {
        status: (updatedTripObj as TransportTrip).status as any,
        passengers: (updatedTripObj as TransportTrip).passengers
      }).catch(err => console.warn('Firestore trip manifest sync error:', err));
    }
  };

  // Board All Passengers
  const boardAllPassengers = (tripId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      const updatedTrip = {
        ...t,
        status: 'READY FOR DEPARTURE' as const,
        passengers: t.passengers.map(p => ({ ...p, status: 'BOARDED' as const }))
      };
      transportService.updateTrip(tripId, {
        status: 'READY FOR DEPARTURE' as any,
        passengers: updatedTrip.passengers
      }).catch(err => console.warn('Firestore board all sync error:', err));
      return updatedTrip;
    }));
  };

  // Update Trip Lifecycle State
  const updateTripState = (tripId: string, newStatus: TransportTrip['status']) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: newStatus } : t));
    transportService.updateTripStatus(tripId, newStatus as any)
      .catch(err => console.warn('Firestore updateTripStatus error:', err));
  };

  // Handle Create Trip
  const handleCreateTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripFixture || !newTripDestination) return;

    const selectedVeh = fleet.find(v => v.id === newTripVehicleId);
    const newTripObj: TransportTrip = {
      id: `TRIP-${Math.floor(100 + Math.random() * 900)}`,
      fixture: newTripFixture.toUpperCase(),
      destination: newTripDestination,
      time: newTripTime,
      returnTime: '17:00 PM',
      vehicleId: newTripVehicleId,
      vehicleName: selectedVeh?.name.split(' (')[0] || 'BUS-01',
      driver: newTripDriver,
      status: 'CONFIRMED',
      routeStops: ['Main Gate Departure', newTripDestination],
      passengers: [
        { id: `p-${Date.now()}-1`, name: 'H. Coach', role: 'Coach', status: 'AWAITING', emergencyPhone: '+27 82 000 1111' },
        { id: `p-${Date.now()}-2`, name: 'C. Captain', role: 'Captain', status: 'AWAITING', emergencyPhone: '+27 82 000 2222' },
        { id: `p-${Date.now()}-3`, name: 'P. Bowler', role: 'Player', status: 'AWAITING', emergencyPhone: '+27 82 000 3333' },
        { id: `p-${Date.now()}-4`, name: 'P. Batter', role: 'Player', status: 'AWAITING', emergencyPhone: '+27 82 000 4444' },
      ]
    };

    setTrips(prev => [newTripObj, ...prev]);
    setSelectedTripId(newTripObj.id);
    setIsCreateTripOpen(false);

    try {
      await transportService.createTrip({
        fixture: newTripObj.fixture,
        destination: newTripObj.destination,
        time: newTripObj.time,
        returnTime: newTripObj.returnTime,
        vehicleId: newTripObj.vehicleId,
        vehicleName: newTripObj.vehicleName,
        driver: newTripObj.driver,
        status: newTripObj.status as any,
        routeStops: newTripObj.routeStops,
        passengers: newTripObj.passengers
      });
    } catch (err) {
      console.warn('Firestore trip creation error:', err);
    }

    setNewTripFixture('');
    setNewTripDestination('');
  };

  // Handle Add Vehicle
  const handleAddVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehName || !newVehReg) return;

    const newVehObj: FleetVehicle = {
      id: `BUS-0${fleet.length + 1}`,
      name: newVehName.toUpperCase(),
      type: newVehType,
      registration: newVehReg,
      capacity: parseInt(newVehCapacity) || 16,
      status: 'AVAILABLE',
      mileage: '0 KM',
      health: 100,
      lastService: 'JUST REGISTERED'
    };

    setFleet(prev => [...prev, newVehObj]);
    setIsAddVehicleOpen(false);

    try {
      await transportService.addVehicle({
        schoolId: 'school-dhs',
        registration: newVehObj.registration,
        makeModel: newVehObj.name,
        type: newVehObj.type,
        capacity: newVehObj.capacity,
        status: newVehObj.status as any,
        mileage: newVehObj.mileage,
        health: newVehObj.health,
        lastService: newVehObj.lastService
      });
    } catch (err) {
      console.warn('Firestore add vehicle error:', err);
    }

    setNewVehName('');
    setNewVehReg('');
  };


  const filteredTrips = trips.filter(t => 
    t.fixture.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.driver.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const boardedCount = selectedTrip ? selectedTrip.passengers.filter(p => p.status === 'BOARDED').length : 0;
  const totalCount = selectedTrip ? selectedTrip.passengers.length : 0;
  const boardingPct = totalCount > 0 ? Math.round((boardedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-10 pb-24">
      
      {/* Header Banner */}
      <div className="relative p-10 rounded-[3rem] border overflow-hidden shadow-2xl" 
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-inner shrink-0" 
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
             <Bus className="h-12 w-12 text-indigo-400" />
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none" 
                style={{ fontFamily: D.head, color: D.textPrimary }}>
              TRANSPORT <span style={{ color: D.amber }}>HUB</span> & LOGISTICS
            </h1>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] mt-3 opacity-60 italic" style={{ color: D.textMuted }}>
                SCHOOL FLEET ASSET DEPLOYMENT • REAL-TIME PASSENGER MANIFEST & BOARDING ENGINE
            </p>
          </div>

          <div className="lg:ml-auto flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border backdrop-blur-xl" style={{ background: D.surf2, borderColor: D.border }}>
                {[
                  { id: 'trips', label: `TRIP MANIFESTS (${trips.length})` },
                  { id: 'fleet', label: `FLEET ASSETS (${fleet.length})` },
                ].map((t) => {
                  const isActive = activeTab === t.id;
                  return (
                    <button 
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={cn(
                        "relative h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors duration-300 select-none",
                        isActive ? "text-slate-900 font-bold" : "text-white/40 hover:text-white"
                      )}
                      style={{ fontFamily: D.head }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="transportTabPill"
                          className="absolute inset-0 rounded-xl border border-amber-500/50 bg-amber-500 shadow-lg shadow-amber-500/20"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{t.label}</span>
                    </button>
                  );
                })}
             </div>

             <Button 
              onClick={() => setIsCreateTripOpen(true)}
              className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-transform hover:scale-105" 
              style={{ background: D.amber, color: '#000' }}>
                <Plus className="mr-2 h-4 w-4" /> CREATE TRIP
             </Button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left / Primary Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Search and Filters */}
          <div className="flex items-center gap-4 p-4 rounded-2xl border bg-black/20" style={{ borderColor: D.border }}>
            <Search className="h-5 w-5 text-white/40" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fixture, destination, or driver..."
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-white/30"
              style={{ color: D.textPrimary }}
            />
            {activeTab === 'fleet' && (
              <Button 
                onClick={() => setIsAddVehicleOpen(true)}
                size="sm"
                className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-500/30 text-amber-400 bg-amber-500/10">
                + ADD VEHICLE
              </Button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'trips' ? (
              <motion.div 
                key="trips"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {filteredTrips.map((trip) => {
                  const isSelected = selectedTripId === trip.id;
                  const tripBoarded = trip.passengers.filter(p => p.status === 'BOARDED').length;
                  const tripTotal = trip.passengers.length;
                  const tripBoardingPct = Math.round((tripBoarded / tripTotal) * 100);

                  // Transport Intelligence Audit
                  const auditReport = transportEngine.auditManifest({
                    id: trip.id,
                    fixtureTitle: trip.fixture,
                    destinationVenue: trip.destination,
                    scheduledDeparture: trip.time,
                    vehicleId: trip.vehicleId,
                    driverName: trip.driver,
                    status: trip.status,
                    passengers: trip.passengers,
                    routeStops: trip.routeStops
                  });

                  return (
                    <div 
                      key={trip.id} 
                      onClick={() => setSelectedTripId(trip.id)}
                      className={cn(
                        "group p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer relative overflow-hidden",
                        isSelected ? "bg-amber-500/10 border-amber-500/50 shadow-2xl shadow-amber-500/10" : "bg-[rgba(18,18,24,0.6)] border-white/10 hover:border-white/20"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono font-bold opacity-40">{trip.id}</span>
                          <Badge className={cn(
                            "text-[9px] font-black uppercase tracking-widest h-6 px-3 border",
                            trip.status === 'READY FOR DEPARTURE' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" :
                            trip.status === 'IN TRANSIT' ? "bg-sky-500/20 text-sky-400 border-sky-500/40" :
                            trip.status === 'ARRIVED' ? "bg-purple-500/20 text-purple-400 border-purple-500/40" : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                          )}>
                            {trip.status}
                          </Badge>
                          <Badge className={cn(
                            "text-[9px] font-black uppercase tracking-widest h-6 px-3 border",
                            auditReport.readinessGrade === 'READY' ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" :
                            auditReport.readinessGrade === 'WARNING' ? "bg-amber-500/10 text-amber-300 border-amber-500/30" : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                          )}>
                            AUDIT: {auditReport.readinessGrade}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                            DEPARTURE: {trip.time}
                          </span>
                          <Link 
                            href={`/transport/driver/${trip.id}`} 
                            onClick={(e) => e.stopPropagation()}
                            className="h-7 px-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <Navigation size={11} /> PWA
                          </Link>
                        </div>
                      </div>

                      <h3 className="text-xl font-black italic uppercase tracking-tight mb-2" style={{ fontFamily: D.head }}>
                        {trip.fixture}
                      </h3>

                      <div className="flex items-center gap-2 text-xs font-semibold text-white/60 mb-3">
                        <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>{trip.destination}</span>
                      </div>

                      {auditReport.missingEssentialRoles.length > 0 && (
                        <div className="mb-3 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-[10px] font-mono text-rose-300">
                          <AlertCircle size={12} className="shrink-0 text-rose-400" />
                          <span>MISSING ESSENTIALS: {auditReport.missingEssentialRoles.join(', ')}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-black/30 border border-white/5 mb-4 text-center">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-white/40">VEHICLE</p>
                          <p className="text-xs font-bold font-mono text-white/90">{trip.vehicleName}</p>
                        </div>
                        <div className="border-x border-white/10">
                          <p className="text-[8px] font-black uppercase tracking-widest text-white/40">DRIVER</p>
                          <p className="text-xs font-bold font-mono text-white/90">{trip.driver}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-white/40">BOARDING</p>
                          <p className="text-xs font-bold font-mono text-emerald-400">{tripBoarded} / {tripTotal} ({tripBoardingPct}%)</p>
                        </div>
                      </div>

                      {/* Boarding Progress Bar */}
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-500"
                          style={{ width: `${tripBoardingPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div 
                key="fleet"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {fleet.map((veh) => (
                  <div key={veh.id} className="p-6 rounded-[2rem] border bg-[rgba(18,18,24,0.6)] border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-2xl flex items-center justify-center border bg-white/5 border-white/10">
                        <Bus className="h-6 w-6 text-amber-400" />
                      </div>
                      <Badge className={cn(
                        "text-[9px] font-black uppercase tracking-widest h-6 border",
                        veh.status === 'AVAILABLE' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                        veh.status === 'MAINTENANCE' ? "bg-rose-500/10 text-rose-400 border-rose-500/30" : "bg-sky-500/10 text-sky-400 border-sky-500/30"
                      )}>
                        {veh.status}
                      </Badge>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-white/40 italic">{veh.registration}</span>
                      <h4 className="text-lg font-black italic uppercase tracking-tight" style={{ fontFamily: D.head }}>{veh.name}</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-black/20 text-center text-xs font-mono">
                      <div>
                        <span className="text-[8px] font-black text-white/40 block">SEATS</span>
                        <span className="font-bold">{veh.capacity}</span>
                      </div>
                      <div className="border-x border-white/10">
                        <span className="text-[8px] font-black text-white/40 block">ODOMETER</span>
                        <span className="font-bold">{veh.mileage}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-white/40 block">HEALTH</span>
                        <span className={cn("font-bold", veh.health > 80 ? "text-emerald-400" : "text-rose-400")}>{veh.health}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-white/50 pt-2 border-t border-white/5">
                      <span>DRIVER: {veh.driverAssigned || 'UNASSIGNED'}</span>
                      <span>LAST SVC: {veh.lastService}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right / Secondary Column: Interactive Passenger Manifest & Dispatcher (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="p-8 rounded-[2.5rem] border bg-[rgba(18,18,24,0.8)] border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
            
            {/* Manifest Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">PASSENGER MANIFEST CHECK-IN</span>
                <h3 className="text-xl font-black italic uppercase tracking-tight mt-1" style={{ fontFamily: D.head }}>
                  {selectedTrip.fixture}
                </h3>
              </div>
              <Button 
                onClick={() => boardAllPassengers(selectedTrip.id)}
                size="sm" 
                className="h-10 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black">
                <Check className="mr-1 h-3.5 w-3.5" /> BOARD ALL
              </Button>
            </div>

            {/* Boarding Counter & Telemetry */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-white/60">BOARDING CLEARANCE:</span>
                <span className="text-emerald-400">{boardedCount} / {totalCount} ({boardingPct}%)</span>
              </div>
              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${boardingPct}%` }} />
              </div>
              
              <div className="flex items-center justify-between text-[10px] font-mono text-white/50 pt-2 border-t border-white/5">
                <span>DRIVER: <strong className="text-white">{selectedTrip.driver}</strong></span>
                <span>VEHICLE: <strong className="text-white">{selectedTrip.vehicleName}</strong></span>
              </div>
            </div>

            {/* Trip Lifecycle Action Bar */}
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">TRIP DISPATCHER STATUS</span>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  onClick={() => updateTripState(selectedTrip.id, 'READY FOR DEPARTURE')}
                  size="sm" 
                  className={cn(
                    "h-10 rounded-xl text-[9px] font-black uppercase tracking-wider border",
                    selectedTrip.status === 'READY FOR DEPARTURE' ? "bg-amber-500 text-black border-amber-500" : "bg-white/5 text-white/60 border-white/10"
                  )}>
                  READY
                </Button>
                <Button 
                  onClick={() => updateTripState(selectedTrip.id, 'IN TRANSIT')}
                  size="sm" 
                  className={cn(
                    "h-10 rounded-xl text-[9px] font-black uppercase tracking-wider border",
                    selectedTrip.status === 'IN TRANSIT' ? "bg-sky-500 text-black border-sky-500" : "bg-white/5 text-white/60 border-white/10"
                  )}>
                  IN TRANSIT
                </Button>
                <Button 
                  onClick={() => updateTripState(selectedTrip.id, 'ARRIVED')}
                  size="sm" 
                  className={cn(
                    "h-10 rounded-xl text-[9px] font-black uppercase tracking-wider border",
                    selectedTrip.status === 'ARRIVED' ? "bg-purple-500 text-black border-purple-500" : "bg-white/5 text-white/60 border-white/10"
                  )}>
                  ARRIVED
                </Button>
              </div>
            </div>

            {/* Interactive Passenger Row List */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {selectedTrip.passengers.map((p) => (
                <div 
                  key={p.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border bg-black/20 border-white/5 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs font-mono text-amber-400">
                      {p.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{p.name}</p>
                      <span className="text-[9px] font-mono text-white/40 uppercase">{p.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.emergencyPhone && (
                      <button 
                        onClick={() => setSelectedPassengerForCall(p)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 transition-colors"
                        title="Contact Guardian / Emergency">
                        <PhoneCall size={13} />
                      </button>
                    )}

                    <button 
                      onClick={() => togglePassengerBoarding(selectedTrip.id, p.id)}
                      className={cn(
                        "h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5",
                        p.status === 'BOARDED' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" :
                        p.status === 'ABSENT' ? "bg-rose-500/20 text-rose-400 border-rose-500/40" : "bg-white/5 text-white/50 border-white/10"
                      )}>
                      {p.status === 'BOARDED' && <CheckCircle2 size={12} />}
                      {p.status === 'ABSENT' && <XCircle size={12} />}
                      {p.status}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Route Stops Summary */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">PLANNED ROUTE STOPS</span>
              <div className="space-y-1.5">
                {selectedTrip.routeStops.map((stop, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-mono text-white/70">
                    <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                    <span>{stop}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Emergency Contact Modal */}
      <AnimatePresence>
        {selectedPassengerForCall && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121218] border border-white/20 p-8 rounded-[2.5rem] max-w-sm w-full space-y-6 text-center"
            >
              <div className="h-16 w-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
                <PhoneCall size={28} />
              </div>

              <div>
                <h3 className="text-xl font-black italic uppercase" style={{ fontFamily: D.head }}>{selectedPassengerForCall.name}</h3>
                <p className="text-xs font-mono text-white/50 mt-1">EMERGENCY GUARDIAN CONTACT</p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 font-mono text-lg font-bold text-emerald-400">
                {selectedPassengerForCall.emergencyPhone}
              </div>

              <Button 
                onClick={() => setSelectedPassengerForCall(null)}
                className="w-full h-12 rounded-xl font-black text-xs uppercase bg-white/10 hover:bg-white/20">
                CLOSE
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Trip Modal */}
      <AnimatePresence>
        {isCreateTripOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121218] border border-white/20 p-8 rounded-[2.5rem] max-w-md w-full space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-xl font-black italic uppercase" style={{ fontFamily: D.head }}>CREATE NEW TRIP</h3>
                <button onClick={() => setIsCreateTripOpen(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
              </div>

              <form onSubmit={handleCreateTripSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-white/50 block mb-1">FIXTURE TITLE</label>
                  <input 
                    value={newTripFixture}
                    onChange={e => setNewTripFixture(e.target.value)}
                    placeholder="e.g. VS HILTON COLLEGE (1ST XI AWAY)"
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-sm font-semibold outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-white/50 block mb-1">DESTINATION VENUE</label>
                  <input 
                    value={newTripDestination}
                    onChange={e => setNewTripDestination(e.target.value)}
                    placeholder="e.g. Hilton Oval, Hilton"
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-sm font-semibold outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-white/50 block mb-1">DEPARTURE TIME</label>
                    <input 
                      value={newTripTime}
                      onChange={e => setNewTripTime(e.target.value)}
                      className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-sm font-mono outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-white/50 block mb-1">ASSIGNED DRIVER</label>
                    <input 
                      value={newTripDriver}
                      onChange={e => setNewTripDriver(e.target.value)}
                      className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-sm font-mono outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-white/50 block mb-1">ASSIGNED VEHICLE</label>
                  <select 
                    value={newTripVehicleId}
                    onChange={e => setNewTripVehicleId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-sm font-mono outline-none focus:border-amber-500 text-white"
                  >
                    {fleet.map(v => (
                      <option key={v.id} value={v.id} className="bg-[#121218]">{v.name} ({v.capacity} Seats)</option>
                    ))}
                  </select>
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl font-black text-xs uppercase bg-amber-500 text-black hover:bg-amber-400 shadow-xl">
                  CONFIRM & CREATE TRIP
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Vehicle Modal */}
      <AnimatePresence>
        {isAddVehicleOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121218] border border-white/20 p-8 rounded-[2.5rem] max-w-md w-full space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-xl font-black italic uppercase" style={{ fontFamily: D.head }}>ADD FLEET VEHICLE</h3>
                <button onClick={() => setIsAddVehicleOpen(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddVehicleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-white/50 block mb-1">VEHICLE NAME</label>
                  <input 
                    value={newVehName}
                    onChange={e => setNewVehName(e.target.value)}
                    placeholder="e.g. EAGLE EXPRESS (22-SEATER)"
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-sm font-semibold outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-white/50 block mb-1">REGISTRATION</label>
                    <input 
                      value={newVehReg}
                      onChange={e => setNewVehReg(e.target.value)}
                      placeholder="e.g. GP 992-101"
                      className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-sm font-mono outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-white/50 block mb-1">CAPACITY (SEATS)</label>
                    <input 
                      type="number"
                      value={newVehCapacity}
                      onChange={e => setNewVehCapacity(e.target.value)}
                      className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-sm font-mono outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl font-black text-xs uppercase bg-amber-500 text-black hover:bg-amber-400 shadow-xl">
                  ADD TO SCHOOL FLEET
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

