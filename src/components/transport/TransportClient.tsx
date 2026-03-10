"use client";

import { useState } from 'react';
import { useViewMode } from '@/hooks/useViewMode';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bus, MapPin, Calendar as CalendarIcon, LayoutGrid, List, Table, Calendar, Search, Users, User, Clock } from "lucide-react";
import { Trip, Vehicle } from "@/types/firestore";

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

  // Filter trips based on search
  const filteredTrips = trips.filter(trip => {
    const vehicle = vehicles.find(v => v.vehicleId === trip.vehicleId);
    const searchLower = searchTerm.toLowerCase();
    return (
      trip.purpose?.toLowerCase().includes(searchLower) ||
      trip.destination?.toLowerCase().includes(searchLower) ||
      vehicle?.name?.toLowerCase().includes(searchLower)
    );
  });

  // Filter vehicles based on search
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = searchTerm.toLowerCase();
    return (
      vehicle.name.toLowerCase().includes(searchLower) ||
      vehicle.type.toLowerCase().includes(searchLower) ||
      vehicle.licensePlate?.toLowerCase().includes(searchLower)
    );
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <button 
          onClick={() => setActiveTab('trips')}
          className={`pb-3 px-4 font-medium transition-colors border-b-2 relative ${
            activeTab === 'trips' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
          }`}
        >
          Trip Schedule
          {activeTab === 'trips' && (
            <motion.div 
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('fleet')}
          className={`pb-3 px-4 font-medium transition-colors border-b-2 relative ${
            activeTab === 'fleet' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
          }`}
        >
          Fleet Management
          {activeTab === 'fleet' && (
            <motion.div 
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>
      </div>

      {/* Search and View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={activeTab === 'trips' ? "Search trips..." : "Search vehicles..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 border border-border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 px-3"
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 px-3"
            title="List View"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="h-8 px-3"
            title="Table View"
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="h-8 px-3"
            title="Calendar View"
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results Count */}
      {searchTerm && (
        <div className="text-sm text-muted-foreground">
          Found {activeTab === 'trips' ? filteredTrips.length : filteredVehicles.length} {activeTab === 'trips' ? (filteredTrips.length === 1 ? 'trip' : 'trips') : (filteredVehicles.length === 1 ? 'vehicle' : 'vehicles')}
        </div>
      )}

      {/* Trips Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'trips' && (
          <motion.div
            key="trips"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* List View (Default) */}
            {viewMode === 'list' && (
              <motion.div 
                className="space-y-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {filteredTrips.map(trip => {
                  const vehicle = vehicles.find(v => v.vehicleId === trip.vehicleId);
                  return (
                    <motion.div key={trip.tripId} variants={item}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary/10 rounded-lg shrink-0">
                              <span className="text-2xl font-bold">{new Date(trip.date).getDate()}</span>
                              <span className="text-xs text-muted-foreground uppercase">
                                {new Date(trip.date).toLocaleDateString('en-US', { month: 'short' })}
                              </span>
                            </div>

                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold">{trip.purpose}</h3>
                                <Badge variant={trip.status === 'Completed' ? 'secondary' : 'default'}>
                                  {trip.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span>{trip.destination}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Bus className="h-4 w-4" />
                                  <span>{vehicle?.name || 'No vehicle'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Users className="h-4 w-4" />
                                  <span>{trip.passengerCount || 0} passengers</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {filteredTrips.map(trip => {
                  const vehicle = vehicles.find(v => v.vehicleId === trip.vehicleId);
                  return (
                    <motion.div key={trip.tripId} variants={item}>
                      <Card className="hover:shadow-md transition-shadow h-full">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg mb-1">{trip.purpose}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarIcon className="h-4 w-4" />
                                <span>{new Date(trip.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Badge variant={trip.status === 'Completed' ? 'secondary' : 'default'}>
                              {trip.status}
                            </Badge>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{trip.destination}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Bus className="h-4 w-4" />
                              <span>{vehicle?.name || 'No vehicle'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{trip.passengerCount || 0} passengers</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-4 font-medium">Date</th>
                            <th className="text-left p-4 font-medium">Purpose</th>
                            <th className="text-left p-4 font-medium">Destination</th>
                            <th className="text-left p-4 font-medium">Vehicle</th>
                            <th className="text-left p-4 font-medium">Passengers</th>
                            <th className="text-left p-4 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTrips.map(trip => {
                            const vehicle = vehicles.find(v => v.vehicleId === trip.vehicleId);
                            return (
                              <tr key={trip.tripId} className="border-b hover:bg-muted/30">
                                <td className="p-4">{new Date(trip.date).toLocaleDateString()}</td>
                                <td className="p-4 font-medium">{trip.purpose}</td>
                                <td className="p-4 text-muted-foreground">{trip.destination}</td>
                                <td className="p-4 text-muted-foreground">{vehicle?.name || '-'}</td>
                                <td className="p-4 text-muted-foreground">{trip.passengerCount || 0}</td>
                                <td className="p-4">
                                  <Badge variant={trip.status === 'Completed' ? 'secondary' : 'default'}>
                                    {trip.status}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Calendar View */}
            {viewMode === 'calendar' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
                      <p className="text-muted-foreground mb-4">
                        Trip schedule calendar
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Calendar view coming soon - will show trip schedules
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Fleet Content */}
        {activeTab === 'fleet' && (
          <motion.div
            key="fleet"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredVehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.vehicleId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{vehicle.name}</h3>
                        <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                      </div>
                      <Badge variant={vehicle.status === 'Active' ? 'default' : 'secondary'}>
                        {vehicle.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="font-medium">{vehicle.capacity} seats</span>
                      </div>
                      {vehicle.licensePlate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">License:</span>
                          <span className="font-medium font-mono">{vehicle.licensePlate}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty States */}
      {activeTab === 'trips' && filteredTrips.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardContent className="p-12 text-center">
              <Bus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trips found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'No trips scheduled'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'fleet' && filteredVehicles.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardContent className="p-12 text-center">
              <Bus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'No vehicles in fleet'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
