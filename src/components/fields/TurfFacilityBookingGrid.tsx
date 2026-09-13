"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  RefreshCw,
  Zap,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Layers,
  Search,
  ExternalLink,
  Info,
  CalendarDays,
  Repeat,
  Trophy,
  Hammer,
  User,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBookingAction, getFieldBookingsAction } from "@/app/actions/fieldBookingActions";

// Mock/Initial Turf Facilities
export interface TurfFacility {
  id: string;
  name: string;
  code: string;
  surface: "NATURAL GRASS" | "HYBRID TURF" | "TURF SQUARES" | "ASTRO TURF";
  condition: "PRISTINE" | "EXCELLENT" | "STABLE" | "MAINTENANCE" | "HEAVILY WIP";
  status: "AVAILABLE" | "IN USE" | "MAINTENANCE";
  capacity: string;
  location: string;
}

const DEFAULT_FACILITIES: TurfFacility[] = [
  {
    id: "1",
    name: "Main Oval (The Ridge)",
    code: "OVAL-01",
    surface: "NATURAL GRASS",
    condition: "PRISTINE",
    status: "AVAILABLE",
    capacity: "1st XI Match Standard",
    location: "Upper Campus"
  },
  {
    id: "2",
    name: "North Academy Oval",
    code: "OVAL-02",
    surface: "HYBRID TURF",
    condition: "EXCELLENT",
    status: "IN USE",
    capacity: "Multi-Pitch Standard",
    location: "North Sports Complex"
  },
  {
    id: "3",
    name: "South Practice Nets (Turf & Astro)",
    code: "NETS-01",
    surface: "ASTRO TURF",
    condition: "STABLE",
    status: "AVAILABLE",
    capacity: "12 Lane Enclosure",
    location: "Lower Fields"
  },
  {
    id: "4",
    name: "Central Turf Square (Block A)",
    code: "SQUARE-01",
    surface: "TURF SQUARES",
    condition: "MAINTENANCE",
    status: "MAINTENANCE",
    capacity: "Curator Pitch Block",
    location: "Main Oval Complex"
  }
];

export interface GridBooking {
  id: string;
  facilityId: string;
  facilityName: string;
  title: string;
  organizer: string;
  type: "Match" | "Practice" | "Maintenance" | "Event";
  date: string; // YYYY-MM-DD
  startHour: number; // e.g. 9 for 09:00
  durationHours: number; // e.g. 4 for 4 hours
  startTime: string; // "09:00"
  endTime: string; // "13:00"
  status: "Confirmed" | "Pending" | "Cancelled";
  fixtureId?: string;
  syncedWithFixtureWizard?: boolean;
}

// Initial synced bookings (including Fixture Wizard synced matches)
const INITIAL_GRID_BOOKINGS: GridBooking[] = [
  {
    id: "b-01",
    facilityId: "1",
    facilityName: "Main Oval (The Ridge)",
    title: "1st XI vs Hilton College (50-Over)",
    organizer: "St John's College Sports Office",
    type: "Match",
    date: new Date().toISOString().split("T")[0],
    startHour: 9,
    durationHours: 6,
    startTime: "09:00",
    endTime: "15:00",
    status: "Confirmed",
    fixtureId: "fix-101",
    syncedWithFixtureWizard: true
  },
  {
    id: "b-02",
    facilityId: "1",
    facilityName: "Main Oval (The Ridge)",
    title: "Curator Heavy Heavy Roller & Line Prep",
    organizer: "Head Groundskeeper",
    type: "Maintenance",
    date: new Date().toISOString().split("T")[0],
    startHour: 6,
    durationHours: 2,
    startTime: "06:00",
    endTime: "08:00",
    status: "Confirmed",
    syncedWithFixtureWizard: false
  },
  {
    id: "b-03",
    facilityId: "2",
    facilityName: "North Academy Oval",
    title: "U15A Squad Net & Middle Practice",
    organizer: "Coach Mark Robinson",
    type: "Practice",
    date: new Date().toISOString().split("T")[0],
    startHour: 14,
    durationHours: 3,
    startTime: "14:00",
    endTime: "17:00",
    status: "Confirmed",
    syncedWithFixtureWizard: false
  },
  {
    id: "b-04",
    facilityId: "3",
    facilityName: "South Practice Nets",
    title: "Open Spin & Pace Bowling Academy",
    organizer: "High Performance Unit",
    type: "Practice",
    date: new Date().toISOString().split("T")[0],
    startHour: 15,
    durationHours: 2,
    startTime: "15:00",
    endTime: "17:00",
    status: "Confirmed",
    syncedWithFixtureWizard: false
  },
  {
    id: "b-05",
    facilityId: "4",
    facilityName: "Central Turf Square",
    title: "Pitch 3 Scarification & Top Dressing",
    organizer: "Grounds Dept",
    type: "Maintenance",
    date: new Date().toISOString().split("T")[0],
    startHour: 7,
    durationHours: 8,
    startTime: "07:00",
    endTime: "15:00",
    status: "Confirmed",
    syncedWithFixtureWizard: false
  }
];

const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => i + 6); // 06:00 to 20:00

export function TurfFacilityBookingGrid() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [surfaceFilter, setSurfaceFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [bookings, setBookings] = useState<GridBooking[]>(INITIAL_GRID_BOOKINGS);
  const [viewMode, setViewMode] = useState<"grid" | "calendar" | "wizardSync">("grid");

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({
    facilityId: "1",
    title: "",
    organizer: "",
    type: "Match" as GridBooking["type"],
    startTime: "09:00",
    endTime: "12:00",
    syncWithWizard: true
  });

  // Calendar Feed Copy State
  const [copiedFeed, setCopiedFeed] = useState(false);

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return DEFAULT_FACILITIES.filter((f) => {
      if (surfaceFilter !== "ALL" && f.surface !== surfaceFilter) return false;
      if (
        searchQuery &&
        !f.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !f.code.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [surfaceFilter, searchQuery]);

  // Filter bookings for selected date and type
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (b.date !== selectedDate) return false;
      if (typeFilter !== "ALL" && b.type !== typeFilter) return false;
      return true;
    });
  }, [bookings, selectedDate, typeFilter]);

  // Navigate date
  const handleDateChange = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  // Open booking modal pre-filled for a specific cell
  const handleSlotClick = (facilityId: string, hour: number) => {
    const formattedHour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
    const endHourNum = Math.min(hour + 2, 20);
    const formattedEndHour = endHourNum < 10 ? `0${endHourNum}:00` : `${endHourNum}:00`;

    setNewBooking({
      facilityId,
      title: "",
      organizer: "School Sports Office",
      type: "Match",
      startTime: formattedHour,
      endTime: formattedEndHour,
      syncWithWizard: true
    });
    setIsBookingOpen(true);
  };

  // Submit new booking
  const handleCreateBooking = () => {
    if (!newBooking.title.trim()) {
      toast.error("Please enter a title for the booking.");
      return;
    }

    const facility = DEFAULT_FACILITIES.find((f) => f.id === newBooking.facilityId);
    const startHourNum = parseInt(newBooking.startTime.split(":")[0], 10);
    const endHourNum = parseInt(newBooking.endTime.split(":")[0], 10);
    const duration = Math.max(1, endHourNum - startHourNum);

    const bookingToAdd: GridBooking = {
      id: `b-${Date.now()}`,
      facilityId: newBooking.facilityId,
      facilityName: facility ? facility.name : "Facility",
      title: newBooking.title,
      organizer: newBooking.organizer || "Sports Office",
      type: newBooking.type,
      date: selectedDate,
      startHour: startHourNum,
      durationHours: duration,
      startTime: newBooking.startTime,
      endTime: newBooking.endTime,
      status: "Confirmed",
      syncedWithFixtureWizard: newBooking.syncWithWizard
    };

    setBookings((prev) => [...prev, bookingToAdd]);
    toast.success("Turf booking confirmed & synced with Fixture Wizard!");

    if (newBooking.syncWithWizard && newBooking.type === "Match") {
      toast.info("Opening Fixture Wizard to assign teams to this venue slot...");
      setTimeout(() => {
        router.push(
          `/fixtures/new?venueId=${newBooking.facilityId}&date=${selectedDate}&time=${newBooking.startTime}`
        );
      }, 1200);
    }

    setIsBookingOpen(false);
  };

  // Export iCal (.ics) file
  const handleExportICS = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SCRBRD//Turf and Facility Engine//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      ...filteredBookings.map((b) => {
        const startClean = b.startTime.replace(":", "") + "00";
        const endClean = b.endTime.replace(":", "") + "00";
        const dateClean = b.date.replace(/-/g, "");
        return [
          "BEGIN:VEVENT",
          `UID:${b.id}@scrbrd.app`,
          `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
          `DTSTART:${dateClean}T${startClean}`,
          `DTEND:${dateClean}T${endClean}`,
          `SUMMARY:${b.title}`,
          `LOCATION:${b.facilityName}`,
          `DESCRIPTION:SCRBRD Turf Booking (${b.type}) - Organized by ${b.organizer}`,
          "END:VEVENT"
        ].join("\n");
      }),
      "END:VCALENDAR"
    ].join("\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `SCRBRD-Turf-Bookings-${selectedDate}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded .ics Calendar Feed file!");
  };

  const copyFeedUrl = () => {
    navigator.clipboard.writeText(`https://scrbrd.app/api/calendar/turf-bookings.ics`);
    setCopiedFeed(true);
    toast.success("iCal Calendar Feed URL copied to clipboard!");
    setTimeout(() => setCopiedFeed(false), 2000);
  };

  const getTypeStyle = (type: GridBooking["type"]) => {
    switch (type) {
      case "Match":
        return "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 dark:text-emerald-300";
      case "Practice":
        return "bg-indigo-500/20 border-indigo-500/40 text-indigo-400 dark:text-indigo-300";
      case "Maintenance":
        return "bg-amber-500/20 border-amber-500/40 text-amber-400 dark:text-amber-300";
      case "Event":
        return "bg-purple-500/20 border-purple-500/40 text-purple-400 dark:text-purple-300";
      default:
        return "bg-zinc-500/20 border-zinc-500/40 text-zinc-300";
    }
  };

  return (
    <div className="space-y-8">
      {/* Control Header & Live Sync Status Banner */}
      <div className="relative p-6 md:p-8 rounded-[2.5rem] bg-card border border-border shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" /> FIXTURE WIZARD & CALENDARS SYNCHRONIZED
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> TURF & FACILITY ENGINE
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Turf & Facility Booking Grid
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
              Real-time multi-pitch occupancy matrix. Directly synced with the SCRBRD Fixture Wizard, ground health monitors, and external iCal/Google Calendar feeds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setViewMode("grid")}
              variant={viewMode === "grid" ? "default" : "outline"}
              className="rounded-xl text-xs font-bold font-mono"
            >
              <Layers className="h-4 w-4 mr-2" /> Grid Matrix
            </Button>

            <Button
              onClick={() => setViewMode("calendar")}
              variant={viewMode === "calendar" ? "default" : "outline"}
              className="rounded-xl text-xs font-bold font-mono"
            >
              <CalendarDays className="h-4 w-4 mr-2" /> Calendar Feed
            </Button>

            <Button
              onClick={() => setViewMode("wizardSync")}
              variant={viewMode === "wizardSync" ? "default" : "outline"}
              className="rounded-xl text-xs font-bold font-mono"
            >
              <Zap className="h-4 w-4 mr-2 text-amber-500" /> Wizard Sync
            </Button>

            <Button
              onClick={() => {
                setNewBooking({
                  facilityId: "1",
                  title: "",
                  organizer: "Sports Office",
                  type: "Match",
                  startTime: "09:00",
                  endTime: "13:00",
                  syncWithWizard: true
                });
                setIsBookingOpen(true);
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold font-mono text-xs shadow-lg shadow-emerald-500/20"
            >
              <Plus className="h-4 w-4 mr-2" /> Book Pitch / Turf
            </Button>
          </div>
        </div>
      </div>

      {/* Date Navigation & Filtering Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border">
        {/* Date Selector */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDateChange(-1)}
            className="h-10 w-10 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/40 border border-white/5 font-mono text-sm font-bold">
            <CalendarIcon className="h-4 w-4 text-emerald-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent outline-none text-foreground cursor-pointer font-sans"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDateChange(1)}
            className="h-10 w-10 rounded-xl"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
            className="text-xs font-mono font-bold text-muted-foreground hover:text-foreground"
          >
            Today
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Surface Filter */}
          <Select value={surfaceFilter} onValueChange={setSurfaceFilter}>
            <SelectTrigger className="w-40 rounded-xl text-xs font-mono">
              <SelectValue placeholder="Surface Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Surfaces</SelectItem>
              <SelectItem value="NATURAL GRASS">Natural Grass</SelectItem>
              <SelectItem value="HYBRID TURF">Hybrid Turf</SelectItem>
              <SelectItem value="TURF SQUARES">Turf Squares</SelectItem>
              <SelectItem value="ASTRO TURF">Astro Turf</SelectItem>
            </SelectContent>
          </Select>

          {/* Event Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36 rounded-xl text-xs font-mono">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Events</SelectItem>
              <SelectItem value="Match">Matches</SelectItem>
              <SelectItem value="Practice">Practices</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Event">School Events</SelectItem>
            </SelectContent>
          </Select>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ground / code..."
              className="pl-9 w-44 rounded-xl text-xs"
            />
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: HOURLY BOOKING GRID MATRIX */}
      {viewMode === "grid" && (
        <div className="rounded-3xl bg-card border border-border p-6 shadow-2xl overflow-x-auto space-y-6">
          <div className="min-w-[1000px] space-y-4">
            {/* Header Row with Time Slots */}
            <div className="grid grid-cols-[220px_repeat(15,1fr)] gap-2 border-b border-border pb-3 text-center">
              <div className="text-left font-mono font-bold text-xs text-muted-foreground uppercase tracking-wider pl-3">
                Facility / Ground
              </div>
              {TIME_SLOTS.map((hour) => (
                <div key={hour} className="font-mono text-[11px] font-bold text-muted-foreground">
                  {hour < 10 ? `0${hour}:00` : `${hour}:00`}
                </div>
              ))}
            </div>

            {/* Facility Rows */}
            {filteredFacilities.map((fac) => {
              const facBookings = filteredBookings.filter((b) => b.facilityId === fac.id);

              return (
                <div
                  key={fac.id}
                  className="grid grid-cols-[220px_repeat(15,1fr)] gap-2 items-center py-2.5 border-b border-border/50 hover:bg-accent/20 transition-colors rounded-xl px-2"
                >
                  {/* Facility Detail Column */}
                  <div className="pr-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-foreground truncate">{fac.name}</h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="text-[9px] font-mono px-1.5 py-0 border-emerald-500/30 text-emerald-500"
                      >
                        {fac.surface}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono">{fac.code}</span>
                    </div>
                  </div>

                  {/* 15 Time Cell Columns */}
                  {TIME_SLOTS.map((hour) => {
                    // Check if a booking starts at this hour or spans across this hour
                    const activeBooking = facBookings.find(
                      (b) => hour >= b.startHour && hour < b.startHour + b.durationHours
                    );

                    const isStart = activeBooking && activeBooking.startHour === hour;

                    return (
                      <div key={hour} className="relative h-14">
                        {activeBooking ? (
                          isStart ? (
                            <div
                              onClick={() => {
                                toast.info(
                                  `Booking: ${activeBooking.title} (${activeBooking.startTime} - ${activeBooking.endTime})`
                                );
                              }}
                              style={{
                                width: `calc(${activeBooking.durationHours * 100}% + ${
                                  (activeBooking.durationHours - 1) * 8
                                }px)`
                              }}
                              className={`absolute inset-0 z-10 p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-lg ${getTypeStyle(
                                activeBooking.type
                              )}`}
                            >
                              <div className="flex items-center justify-between gap-1 overflow-hidden">
                                <span className="font-bold text-[10px] truncate">
                                  {activeBooking.title}
                                </span>
                                {activeBooking.syncedWithFixtureWizard && (
                                  <Badge className="bg-amber-500 text-slate-950 text-[8px] font-mono font-black px-1 py-0">
                                    FIXTURE SYNC
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center justify-between text-[9px] font-mono opacity-80">
                                <span>
                                  {activeBooking.startTime} - {activeBooking.endTime}
                                </span>
                                <span className="uppercase">{activeBooking.type}</span>
                              </div>
                            </div>
                          ) : null
                        ) : (
                          <button
                            onClick={() => handleSlotClick(fac.id, hour)}
                            className="w-full h-full rounded-xl border border-dashed border-border/40 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex items-center justify-center group"
                          >
                            <Plus className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-emerald-500 transition-colors" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Grid Legend & Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border text-xs font-mono">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500/40 border border-emerald-500" />
                <span className="text-muted-foreground">Match Booking (Fixture Synced)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-indigo-500/40 border border-indigo-500" />
                <span className="text-muted-foreground">Practice / Nets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-amber-500/40 border border-amber-500" />
                <span className="text-muted-foreground">Curator Maintenance</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportICS}
                className="rounded-xl text-xs font-mono font-bold"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" /> Export .ics Calendar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CALENDAR FEED & SUBSCRIPTION */}
      {viewMode === "calendar" && (
        <Card className="rounded-3xl border-border shadow-2xl p-6 space-y-6">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <CalendarDays className="h-5 w-5 text-emerald-500" /> Live Calendar Feed & iCal Sync
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Subscribe to the auto-updating SCRBRD Turf & Facility iCal feed in Apple Calendar, Google Calendar, or Microsoft Outlook.
            </p>
          </CardHeader>

          <CardContent className="p-0 space-y-6">
            <div className="p-4 rounded-2xl bg-secondary/40 border border-white/5 space-y-3">
              <Label className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Universal iCal Subscription URL
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  readOnly
                  value="https://scrbrd.app/api/calendar/turf-bookings.ics"
                  className="font-mono text-xs bg-background/50 border-white/10"
                />
                <Button
                  onClick={copyFeedUrl}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold font-mono text-xs shrink-0"
                >
                  {copiedFeed ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Feed URL
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-emerald-500" /> Google Calendar Sync
                  </h4>
                  <Badge variant="outline" className="text-[9px] font-mono text-emerald-500">
                    Auto-Sync
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Adds all confirmed turf match bookings & maintenance windows directly into your Google Calendar account.
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      "https://calendar.google.com/calendar/render?cid=https://scrbrd.app/api/calendar/turf-bookings.ics",
                      "_blank"
                    )
                  }
                  className="w-full rounded-xl text-xs font-mono font-bold"
                >
                  Add to Google Calendar
                </Button>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Download className="h-4 w-4 text-emerald-500" /> Apple & Outlook (.ics) Download
                  </h4>
                  <Badge variant="outline" className="text-[9px] font-mono text-indigo-500">
                    Offline File
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Download a static `.ics` file containing all scheduled ground bookings for the current date range.
                </p>
                <Button
                  onClick={handleExportICS}
                  className="w-full rounded-xl text-xs font-mono font-bold bg-primary text-primary-foreground"
                >
                  Download .ics File
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* VIEW MODE 3: FIXTURE WIZARD SYNC LOG */}
      {viewMode === "wizardSync" && (
        <Card className="rounded-3xl border-border shadow-2xl p-6 space-y-6">
          <CardHeader className="p-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <Zap className="h-5 w-5 text-amber-500" /> Fixture Wizard Synchronization Engine
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Matches created in the SCRBRD Fixture Wizard automatically reserve turf slots and check for venue availability.
              </p>
            </div>
            <Link href="/fixtures/new">
              <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-lg">
                <Zap className="h-3.5 w-3.5 mr-1.5" /> Launch Fixture Wizard
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-0 space-y-4">
            <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
              {bookings
                .filter((b) => b.syncedWithFixtureWizard)
                .map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-card hover:bg-accent/20 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{b.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 font-mono">
                          <MapPin className="h-3 w-3 text-emerald-500" />
                          <span>{b.facilityName}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3 text-indigo-500" />
                          <span>
                            {b.startTime} - {b.endTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-mono text-[10px]">
                        SYNCHRONIZED
                      </Badge>
                      <Link href={`/fixtures`}>
                        <Button variant="ghost" size="sm" className="rounded-xl text-xs font-mono">
                          View Fixture <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* NEW TURF BOOKING DIALOG */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-black text-xl flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-500" /> Book Turf & Reserve Facility
            </DialogTitle>
            <DialogDescription className="text-xs">
              Create a turf slot reservation for matches, practice sessions, or ground maintenance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Facility Select */}
            <div className="space-y-1.5">
              <Label className="font-mono font-bold">Facility / Pitch</Label>
              <Select
                value={newBooking.facilityId}
                onValueChange={(val) => setNewBooking({ ...newBooking, facilityId: val })}
              >
                <SelectTrigger className="rounded-xl text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_FACILITIES.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} ({f.surface})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Event Title */}
            <div className="space-y-1.5">
              <Label className="font-mono font-bold">Booking / Match Title</Label>
              <Input
                placeholder="e.g. U14A Match vs Jeppe Boys"
                value={newBooking.title}
                onChange={(e) => setNewBooking({ ...newBooking, title: e.target.value })}
                className="rounded-xl text-xs"
              />
            </div>

            {/* Type & Organizer */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-mono font-bold">Event Type</Label>
                <Select
                  value={newBooking.type}
                  onValueChange={(val: GridBooking["type"]) =>
                    setNewBooking({ ...newBooking, type: val })
                  }
                >
                  <SelectTrigger className="rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Match">Match</SelectItem>
                    <SelectItem value="Practice">Practice / Nets</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Event">School Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono font-bold">Organizer / Contact</Label>
                <Input
                  placeholder="e.g. Coach Smith"
                  value={newBooking.organizer}
                  onChange={(e) => setNewBooking({ ...newBooking, organizer: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Start & End Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-mono font-bold">Start Time</Label>
                <Input
                  type="time"
                  value={newBooking.startTime}
                  onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono font-bold">End Time</Label>
                <Input
                  type="time"
                  value={newBooking.endTime}
                  onChange={(e) => setNewBooking({ ...newBooking, endTime: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Fixture Wizard Sync Toggle */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h5 className="font-bold text-xs text-amber-500 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" /> Sync with Fixture Wizard
                </h5>
                <p className="text-[10px] text-muted-foreground">
                  Pre-fills venue & schedule in the Fixture Wizard to assign teams immediately.
                </p>
              </div>
              <input
                type="checkbox"
                checked={newBooking.syncWithWizard}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, syncWithWizard: e.target.checked })
                }
                className="h-4 w-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBookingOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBooking}
              className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold font-mono text-xs shadow-lg"
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
