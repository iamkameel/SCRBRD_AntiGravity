"use client";

import { useState, useEffect } from "react";
import { Field } from "@/types/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, Users, Ruler, Sun, CloudRain, Wind, 
  Calendar, Settings, Info, Navigation, Share2,
  TrendingUp, Plus, Loader2
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PitchCondition } from "./PitchCondition";
import { FieldMatchHistory } from "./FieldMatchHistory";
import { FieldMap } from "./FieldMap";
import { FieldBookingCalendar } from "./FieldBookingCalendar";
import { CapacityGauge } from "./CapacityGauge";
import { CapacityTrendChart } from "./CapacityTrendChart";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { getCapacityHistoryAction, logCapacityAction } from "@/app/actions/fieldCapacityActions";
import { getMaintenanceTasksByFieldAction } from "@/app/actions/fieldActions";
import { MaintenanceTaskList } from "@/components/facilities/MaintenanceTaskList";
import { MaintenanceTaskForm } from "@/components/facilities/MaintenanceTaskForm";
import { MaintenanceTask } from "@/types/schema_v4";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface FieldDetailClientProps {
  field: Field;
}

interface CapacityHistoryItem {
  id: string;
  date: string;
  occupancy: number;
  eventId?: string;
  recordedBy?: string;
}

export function FieldDetailClient({ field }: FieldDetailClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [capacityHistory, setCapacityHistory] = useState<CapacityHistoryItem[]>([]);
  const [currentOccupancy, setCurrentOccupancy] = useState(0);
  const [isLogCapacityOpen, setIsLogCapacityOpen] = useState(false);
  const [newCapacityLog, setNewCapacityLog] = useState({ occupancy: 0, date: new Date().toISOString().split('T')[0] });
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoadingTasks(true);
      const [capacityResult, maintenanceResult] = await Promise.all([
        getCapacityHistoryAction(field.id),
        getMaintenanceTasksByFieldAction(field.id)
      ]);

      if (capacityResult.success && capacityResult.history) {
        const historyData = capacityResult.history as unknown as CapacityHistoryItem[];
        setCapacityHistory(historyData);
        if (historyData.length > 0) {
          setCurrentOccupancy(historyData[historyData.length - 1].occupancy);
        }
      }

      if (maintenanceResult.success && maintenanceResult.data) {
        setMaintenanceTasks(maintenanceResult.data as unknown as MaintenanceTask[]);
      }
      setLoadingTasks(false);
    };
    fetchData();
  }, [field.id]);

  const refreshTasks = async () => {
    const result = await getMaintenanceTasksByFieldAction(field.id);
    if (result.success && result.data) {
      setMaintenanceTasks(result.data as unknown as MaintenanceTask[]);
    }
  };

  const handleLogCapacity = async () => {
    try {
      const result = await logCapacityAction(field.id, {
        occupancy: Number(newCapacityLog.occupancy),
        date: new Date(newCapacityLog.date),
        recordedBy: 'Admin' // In a real app, get from auth context
      });

      if (result.success) {
        toast.success("Capacity logged successfully");
        setIsLogCapacityOpen(false);
        // Refresh history
        const historyResult = await getCapacityHistoryAction(field.id);
        if (historyResult.success && historyResult.history) {
          const historyData = historyResult.history as unknown as CapacityHistoryItem[];
          setCapacityHistory(historyData);
          setCurrentOccupancy(Number(newCapacityLog.occupancy));
        }
      } else {
        toast.error(result.error || "Failed to log capacity");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  // Mock weather data - in a real app this would come from an API
  const weather = {
    temp: 24,
    condition: "Sunny",
    wind: "12 km/h SE",
    humidity: "45%"
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative h-[300px] rounded-xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
        <Image
          src="/images/field-placeholder.jpg" // We'll need a placeholder or real image
          alt={field.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <MapPin className="h-4 w-4" />
                <span>{field.location || "Location not specified"}</span>
              </div>
              <h1 className="text-4xl font-bold mb-2">{field.name}</h1>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
                  {field.pitchType || "Natural Turf"}
                </Badge>
                {field.capacity && (
                  <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
                    {field.capacity.toLocaleString()} Capacity
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setActiveTab("booking")}>
                <Calendar className="h-4 w-4 mr-2" />
                Book Venue
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="facilities">Facilities</TabsTrigger>
              <TabsTrigger value="booking">Booking</TabsTrigger>
              <TabsTrigger value="capacity">Capacity</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Pitch Condition */}
              <PitchCondition 
                condition="Excellent"
                grassHealth={92}
                moistureLevel="Optimal"
                lastInspection="Yesterday"
                nextMaintenance="Friday, 10:00 AM"
              />

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Ruler className="h-5 w-5 text-primary mb-2" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Length</span>
                    <span className="font-bold">{field.pitchLength || 22}m</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Navigation className="h-5 w-5 text-primary mb-2" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Orientation</span>
                    <span className="font-bold">{field.orientation || "N-S"}</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Users className="h-5 w-5 text-primary mb-2" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Nets</span>
                    <span className="font-bold">{field.practiceNetsCount || 0}</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Sun className="h-5 w-5 text-primary mb-2" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Lights</span>
                    <span className="font-bold">{field.floodlights ? "Yes" : "No"}</span>
                  </CardContent>
                </Card>
              </div>

              {/* Description / About */}
              <Card>
                <CardHeader>
                  <CardTitle>About Venue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {field.name} is a premier cricket facility featuring a {field.pitchType?.toLowerCase()} surface. 
                    Located in {field.location}, it offers excellent amenities for both players and spectators.
                    {field.floodlights && " The venue is equipped with floodlights suitable for day-night matches."}
                    {field.practiceNetsCount && ` It includes ${field.practiceNetsCount} practice nets for training sessions.`}
                  </p>
                </CardContent>
              </Card>

              {/* Match History */}
              <FieldMatchHistory 
                matches={[
                  {
                    id: '1',
                    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    homeTeam: 'U19 First XI',
                    awayTeam: 'Rival School',
                    result: '145/7 vs 132 all out',
                    attendance: 850,
                    matchType: 'League'
                  },
                  {
                    id: '2',
                    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                    homeTeam: 'Senior Team',
                    awayTeam: 'Guest Team',
                    result: '201/8 vs 189 all out',
                    attendance: 1200,
                    matchType: 'Cup'
                  },
                  {
                    id: '3',
                    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                    homeTeam: 'U15 Team',
                    awayTeam: 'Local Club',
                    result: '98 all out vs 102/5',
                    matchType: 'Friendly'
                  },
                ]}
                totalMatches={24}
                averageAttendance={950}
              />

              {/* Location Map */}
              <FieldMap 
                location={field.location || field.name}
                coordinates={field.coordinates}
                address={field.address}
              />
            </TabsContent>

            <TabsContent value="facilities" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Facilities & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {field.amenities?.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                    {(!field.amenities || field.amenities.length === 0) && (
                      <div className="col-span-2 text-center py-8 text-muted-foreground">
                        No specific amenities listed.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="booking" className="mt-6">
              <FieldBookingCalendar fieldId={field.id} />
            </TabsContent>

            <TabsContent value="capacity" className="mt-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Capacity Management</h3>
                  <Dialog open={isLogCapacityOpen} onOpenChange={setIsLogCapacityOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Log Occupancy
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Log Current Occupancy</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input 
                            type="date" 
                            value={newCapacityLog.date}
                            onChange={(e) => setNewCapacityLog({...newCapacityLog, date: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Occupancy Count</Label>
                          <Input 
                            type="number" 
                            value={newCapacityLog.occupancy}
                            onChange={(e) => setNewCapacityLog({...newCapacityLog, occupancy: Number(e.target.value)})}
                          />
                        </div>
                        <Button onClick={handleLogCapacity} className="w-full">Save Log</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <CapacityTrendChart 
                  data={capacityHistory.map(h => ({
                    date: h.date,
                    occupancy: h.occupancy,
                    capacity: field.capacity || 5000
                  }))}
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Capacity Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Track and manage field capacity for events, matches, and practices. 
                      Monitor trends to optimize scheduling and prevent overcrowding.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Total Events This Month</div>
                        <div className="text-2xl font-bold">{capacityHistory.length}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Avg Attendance</div>
                        <div className="text-2xl font-bold">
                          {capacityHistory.length > 0 
                            ? Math.round(capacityHistory.reduce((sum, h) => sum + h.occupancy, 0) / capacityHistory.length).toLocaleString()
                            : 0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Maintenance & Tasks</CardTitle>
                      </div>
                      <MaintenanceTaskForm 
                        fields={[{ id: field.id, name: field.name }]} 
                        onSuccess={refreshTasks}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingTasks ? (
                      <div className="py-10 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Loading maintenance schedule...</p>
                      </div>
                    ) : (
                      <MaintenanceTaskList 
                        tasks={maintenanceTasks} 
                        onTaskUpdate={refreshTasks}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Enhanced Weather Widget */}
          <WeatherWidget 
            location={field.location?.split(',')[0] || field.name}
            weather={{
              temperature: 24,
              condition: 'Clear',
              humidity: 45,
              windSpeed: 12,
              windDirection: 'SE',
              visibility: 10,
              precipitation: 0,
              forecast: {
                nextHours: [
                  { time: '14:00', condition: 'Clear', precipitation: 0 },
                  { time: '15:00', condition: 'Partly Cloudy', precipitation: 0 },
                  { time: '16:00', condition: 'Cloudy', precipitation: 0.5 },
                ]
              }
            }}
            showImpact={true}
          />

          {/* Enhanced Capacity Gauge */}
          <CapacityGauge 
            totalCapacity={field.capacity || 5000}
            currentOccupancy={currentOccupancy}
            trend={capacityHistory.length >= 2 && capacityHistory[capacityHistory.length-1].occupancy > capacityHistory[capacityHistory.length-2].occupancy ? "up" : "down"}
            trendPercentage={5}
          />

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex gap-3 items-start pb-3 border-b last:border-0 last:pb-0">
                  <div className="w-12 text-center shrink-0">
                    <div className="text-xs font-bold text-primary uppercase">Nov</div>
                    <div className="text-xl font-bold">{28 + i}</div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">U19 League Match</h4>
                    <p className="text-xs text-muted-foreground">09:00 AM - 04:00 PM</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2" onClick={() => setActiveTab("booking")}>View Calendar</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
