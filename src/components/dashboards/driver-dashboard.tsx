"use client";

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { Truck, MapPin, Clock, Calendar, Loader2, ChevronRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getDriverTripsAction } from "@/app/actions/transportActions";
import { TransportTrip as Trip } from "@/lib/services/transportService";
import { format } from "date-fns";
import { D } from "@/lib/design-system";
import { motion, AnimatePresence } from "framer-motion";

export default function DriverDashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      getDriverTripsAction(user.email)
        .then(setTrips)
        .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [user]);

  if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: D.indigo }} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: D.textMuted }}>Syncing Logistics & Routes...</p>
        </div>
      );
  }

  // Calculate stats
  const upcomingTrips = trips.filter(t => new Date(t.scheduledDeparture as any) > new Date());
  const nextTrip = upcomingTrips[0];
  const totalTrips = trips.length;
  const hoursLogged = 0; 

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="px-1">
        <PageHeader 
          title="Transport Terminal" 
          description="Manage vehicle assignments, passenger manifests, and route efficiency."
        />
      </div>

      {/* Fixture Centre */}
      <FixtureCentreCard 
        role="Driver"
        maxMatches={3}
      />

      {/* Strategic Logistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Next Departure", value: nextTrip ? format(new Date(nextTrip.scheduledDeparture as any), "HH:mm") : "--:--", subtitle: nextTrip ? `To: ${nextTrip.destination}` : "Standby Status", icon: Calendar, color: D.indigo },
          { label: "Vehicle Status", value: "Optimal", subtitle: "Bus #42 • Fuel: 80%", icon: Truck, color: D.emerald },
          { label: "Total Trips", value: totalTrips, subtitle: "Historical distance", icon: MapPin, color: D.sky },
          { label: "Duty Hours", value: hoursLogged, subtitle: "Logged this week", icon: Clock, color: D.amber },
        ].map((stat, i) => (
          <MetricCard key={i} {...stat} />
        ))}
      </div>

      {/* Upcoming Schedule */}
      <div 
        className="rounded-3xl overflow-hidden shadow-2xl border"
        style={{ background: D.surf1, border: `1px solid ${D.border}` }}
      >
        <div className="p-6 flex flex-row items-center justify-between" style={{ borderBottom: `1px solid ${D.border}`, background: D.surf2 }}>
          <h3 className="text-sm font-black flex items-center gap-3 uppercase tracking-tight" style={{ fontFamily: D.head, color: D.textPrimary }}>
            <Calendar className="h-5 w-5" style={{ color: D.indigo }} />
            LOGISTICS SCHEDULE
          </h3>
          <Badge className="font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: `${D.indigo}20`, color: D.indigo, border: `1px solid ${D.indigo}30` }}>
            {upcomingTrips.length} UPCOMING TRIPS
          </Badge>
        </div>
        <div className="p-6">
          {upcomingTrips.length > 0 ? (
            <div className="space-y-4">
              {upcomingTrips.map((trip, i) => (
                <motion.div 
                  key={trip.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative flex items-center justify-between p-5 rounded-2xl border transition-all"
                  style={{ background: D.surf2, border: `1px solid ${D.border}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${D.indigo}30`)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = D.border)}
                >
                  <div className="flex-1">
                    <p className="text-lg font-black uppercase italic tracking-tight mb-1" style={{ fontFamily: D.head, color: D.textPrimary }}>{trip.fixture || trip.fixtureId || 'MATCH TRANSPORT'}</p>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest" style={{ color: D.textMuted }}>
                      <span className="flex items-center gap-1.5"><UserPlus className="w-3.5 h-3.5 opacity-50" style={{ color: D.indigo }} /> {trip.passengerCount || 0} PASSENGERS</span>
                      <span className="opacity-20">•</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 opacity-50" style={{ color: D.indigo }} /> {trip.destination}</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2 px-6" style={{ borderLeft: `1px solid ${D.border}` }}>
                    <p className="text-sm font-black uppercase italic" style={{ fontFamily: D.head, color: D.textPrimary }}>{format(new Date(trip.scheduledDeparture as any), "EEE, MMM d")}</p>
                    <Badge className="font-black text-[10px] uppercase tracking-widest rounded-lg" style={{ background: D.surf1, color: D.indigo, border: `1px solid ${D.border}` }}>
                        {format(new Date(trip.scheduledDeparture as any), "HH:mm")}
                    </Badge>
                  </div>
                  <div 
                    className="ml-4 p-2.5 rounded-full transition-all group-hover:scale-110"
                    style={{ background: D.surf3, color: D.textMuted }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div 
              className="py-16 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center gap-4"
              style={{ background: D.surf2, borderColor: D.border }}
            >
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${D.indigo}10` }}>
                    <Truck className="w-6 h-6" style={{ color: D.indigo }} />
                </div>
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: D.textMuted }}>No upcoming transport cycles</h4>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
