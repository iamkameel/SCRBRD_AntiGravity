"use client";

import { useState } from 'react';
import { useViewMode } from '@/hooks/useViewMode';
import { 
  Bus, 
  MapPin, 
  Calendar as CalendarIcon, 
  LayoutGrid, 
  List, 
  Table, 
  Search, 
  Users, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Map,
  ShieldCheck,
  MoreVertical
} from "lucide-react";
import { Trip, Vehicle } from "@/types/firestore";
import { D } from '@/lib/design-system';
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface TransportClientProps {
  trips: Trip[];
  vehicles: Vehicle[];
}

export function TransportClient({ trips, vehicles }: TransportClientProps) {
  const { viewMode, setViewMode } = useViewMode({ 
    storageKey: 'transport-view-mode',
    defaultMode: 'list'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'trips' | 'fleet'>('trips');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Filter logic
  const filteredTrips = trips.filter(trip => {
    const vehicle = vehicles.find(v => v.vehicleId === trip.vehicleId);
    const searchLower = searchTerm.toLowerCase();
    return (
      trip.purpose?.toLowerCase().includes(searchLower) ||
      trip.destination?.toLowerCase().includes(searchLower) ||
      vehicle?.name?.toLowerCase().includes(searchLower)
    );
  });

  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = searchTerm.toLowerCase();
    return (
      vehicle.name.toLowerCase().includes(searchLower) ||
      vehicle.type.toLowerCase().includes(searchLower) ||
      vehicle.licensePlate?.toLowerCase().includes(searchLower)
    );
  });

  // Design Primitives
  const Lbl = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: D.textMuted }}>{children}</div>
  );

  const Card = ({ children, onClick, active }: { children: React.ReactNode, onClick?: () => void, active?: boolean }) => (
    <div 
      onClick={onClick}
      style={{ 
        background: D.surf1, 
        border: `1px solid ${active ? D.sky : D.border}`, 
        borderRadius: D.xl, 
        padding: '20px', 
        position: 'relative', 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease'
      }}
    >
      {children}
    </div>
  );

  return (
    <div style={{ background: D.base, minHeight: '100vh', color: D.textPrimary }}>
      
      {/* Top Header */}
      <div style={{ 
        borderBottom: `1px solid ${D.border}`, 
        padding: '16px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(9, 9, 11, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <h1 style={{ fontFamily: D.head, fontWeight: 900, fontSize: '18px', letterSpacing: '-0.02em' }}>
              TRANSPORT <span style={{ color: D.amber }}>HUB</span>
            </h1>
            <div style={{ fontSize: '11px', color: D.textMuted, letterSpacing: '0.05em' }}>LOGISTICS ENGINE</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: D.textMuted }} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logistics..."
              style={{ 
                background: D.surf2, 
                border: `1px solid ${D.border}`, 
                color: D.textPrimary,
                borderRadius: D.md,
                padding: '8px 12px 8px 34px',
                fontSize: '13px',
                width: '240px'
              }}
            />
          </div>
          <button style={{ background: D.surf2, border: `1px solid ${D.border}`, borderRadius: D.md, padding: '8px 12px', color: D.textPrimary }}>
            <CalendarIcon size={16} />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: `1px solid ${D.border}` }}>
          {(['trips', 'fleet'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 4px',
                fontFamily: D.head,
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: 'none',
                border: 'none',
                color: activeTab === tab ? D.textPrimary : D.textMuted,
                borderBottom: `2px solid ${activeTab === tab ? D.amber : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab === 'trips' ? 'Next Trips' : 'Fleet Management'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px' }}>
          
          {/* Main List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeTab === 'trips' ? (
              filteredTrips.map(trip => {
                const vehicle = vehicles.find(v => v.vehicleId === trip.vehicleId);
                return (
                  <Card key={trip.tripId} onClick={() => setSelectedTripId(trip.tripId)} active={selectedTripId === trip.tripId}>
                    <div style={{ display: 'flex', gap: '24px' }}>
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        background: D.surf2, 
                        borderRadius: D.lg, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: D.head }}>{new Date(trip.date).getDate()}</div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: D.textMuted, textTransform: 'uppercase' }}>
                          {new Date(trip.date).toLocaleString('default', { month: 'short' })}
                        </div>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: 800, fontFamily: D.head }}>{trip.destination}</h3>
                          <div style={{ 
                            padding: '4px 8px', 
                            background: trip.status === 'Completed' ? D.surf2 : D.amber, 
                            color: trip.status === 'Completed' ? D.textMuted : '#000',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 900,
                            textTransform: 'uppercase'
                          }}>
                            {trip.status}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: D.textMuted }}>
                            <Clock size={14} /> 08:30 AM
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: D.textMuted }}>
                            <Bus size={14} /> {vehicle?.name || 'Bus Pending'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: D.textMuted }}>
                            <Users size={14} /> {trip.passengerCount || 0} manifest
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ChevronRight size={20} color={D.border} />
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {filteredVehicles.map(vehicle => (
                  <Card key={vehicle.vehicleId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: D.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bus size={20} color={D.amber} />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontFamily: D.head, fontWeight: 900 }}>{vehicle.licensePlate}</div>
                        <div style={{ fontSize: '10px', color: D.textMuted }}>{vehicle.status}</div>
                      </div>
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, fontFamily: D.head }}>{vehicle.name}</h4>
                    <p style={{ fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>{vehicle.type} • {vehicle.capacity} Seats</p>
                    
                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                      <div style={{ height: '4px', flex: 1, background: D.emerald, borderRadius: '2px' }} />
                      <div style={{ height: '4px', flex: 1, background: D.emerald, borderRadius: '2px' }} />
                      <div style={{ height: '4px', flex: 1, background: D.border, borderRadius: '2px' }} />
                    </div>
                    <div style={{ fontSize: '10px', color: D.textMuted, marginTop: '8px' }}>Next Service: 12 Oct 2026</div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Details Sidebar / Manifest */}
          <div>
            <AnimatePresence mode="wait">
              {selectedTripId ? (
                <motion.div
                  key="manifest"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card active>
                    <div style={{ borderBottom: `1px solid ${D.border}`, paddingBottom: '20px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Lbl>TRIP MANIFEST</Lbl>
                        <button 
                          onClick={() => setSelectedTripId(null)} 
                          style={{ 
                            background: D.surf2, 
                            border: `1px solid ${D.border}`, 
                            borderRadius: '4px', 
                            padding: '4px 8px',
                            fontSize: '10px',
                            fontFamily: D.head,
                            fontWeight: 900,
                            color: D.textMuted,
                            cursor: 'pointer'
                          }}
                        >
                          CLOSE
                        </button>
                      </div>
                      <h2 style={{ fontSize: '20px', fontWeight: 900, fontFamily: D.head, marginTop: '12px', letterSpacing: '-0.02em' }}>
                        {trips.find(t => t.tripId === selectedTripId)?.destination}
                      </h2>
                      <div style={{ fontSize: '12px', color: D.textMuted, marginTop: '4px' }}>
                        {trips.find(t => t.tripId === selectedTripId)?.purpose}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* Driver Section */}
                      <div>
                        <Lbl>DRIVER ASSIGNMENT</Lbl>
                        <div style={{ 
                          background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.4) 0%, rgba(17, 24, 39, 0.4) 100%)',
                          borderRadius: D.lg, 
                          padding: '16px',
                          marginTop: '8px',
                          border: `1px solid rgba(255,255,255,0.05)`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                            <ShieldCheck size={80} />
                          </div>
                          
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '12px', 
                              background: `linear-gradient(45deg, ${D.amber}, #f59e0b)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: D.head,
                              fontWeight: 900,
                              color: '#000'
                            }}>
                              JP
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: D.head }}>
                                {trips.find(t => t.tripId === selectedTripId)?.driverName || 'Unassigned'}
                              </div>
                              <div style={{ fontSize: '11px', color: D.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ShieldCheck size={10} color={D.emerald} /> Verified Professional
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Passenger List */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <Lbl>PASSENGER MANIFEST ({trips.find(t => t.tripId === selectedTripId)?.passengerCount || 0})</Lbl>
                          <div style={{ 
                            fontSize: '10px', 
                            color: D.sky, 
                            fontWeight: 900, 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Users size={12} /> ADD ALL
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[
                            { name: "M. Boucher", role: "Coach", status: "Boarded", id: 'p1' },
                            { name: "A. Markram", role: "Captain", status: "Boarded", id: 'p2' },
                            { name: "H. Klaasen", role: "Wicketkeeper", status: "Confirmed", id: 'p3' },
                            { name: "M. Jansen", role: "All-rounder", status: "Awaiting", id: 'p4' },
                            { name: "K. Rabada", role: "Bowler", status: "Awaiting", id: 'p5' }
                          ].map((p, i) => (
                            <div key={p.id} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '12px', 
                              background: D.surf2, 
                              borderRadius: D.md, 
                              border: `1px solid ${D.border}`,
                              opacity: p.status === 'Awaiting' ? 0.6 : 1,
                              transition: 'all 0.2s ease'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ 
                                  width: '24px', 
                                  height: '24px', 
                                  borderRadius: '6px', 
                                  background: D.border,
                                  fontSize: '9px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800
                                }}>
                                  {p.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: D.head }}>{p.name}</div>
                                  <div style={{ fontSize: '9px', color: D.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.role}</div>
                                </div>
                              </div>
                              <div style={{ 
                                fontSize: '10px', 
                                fontWeight: 900, 
                                color: p.status === 'Boarded' ? D.emerald : (p.status === 'Confirmed' ? D.sky : D.textMuted),
                                background: 'rgba(0,0,0,0.2)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                              }}>
                                {p.status}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                        <button style={{ 
                          background: D.surf2, 
                          color: D.textPrimary, 
                          border: `1px solid ${D.border}`, 
                          borderRadius: D.md, 
                          padding: '14px', 
                          fontFamily: D.head, 
                          fontWeight: 800, 
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}>
                          <Map size={14} /> VIEW ROUTE
                        </button>
                        <button style={{ 
                          background: `linear-gradient(to right, ${D.sky}, #60a5fa)`, 
                          color: '#000', 
                          border: 'none', 
                          borderRadius: D.md, 
                          padding: '14px', 
                          fontFamily: D.head, 
                          fontWeight: 800, 
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: `0 4px 14px -4px ${D.sky}`
                        }}>
                          <TrendingUp size={14} /> LIVE TRACK
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card>
                    <div style={{ textAlign: 'center', padding: '80px 40px' }}>
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '40px', 
                        background: D.surf2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                      }}>
                        <MapPin size={32} color={D.textMuted} style={{ opacity: 0.5 }} />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, fontFamily: D.head }}>NO TRIP SELECTED</h3>
                      <p style={{ fontSize: '13px', color: D.textMuted, marginTop: '12px', lineHeight: 1.6 }}>
                        Select a trip from the schedule to view the passenger manifest, driver details, and live tracking routes.
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>


        </div>
      </div>
    </div>
  );
}
