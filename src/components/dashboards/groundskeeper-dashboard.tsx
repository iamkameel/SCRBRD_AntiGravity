"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Tractor, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search,
  Filter,
  RefreshCw,
  Construction,
  Hammer,
  Waves,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldCard } from "@/components/fields/FieldCard";
import { MaintenanceTaskList } from "@/components/facilities/MaintenanceTaskList";
import { MaintenanceTaskForm } from "@/components/facilities/MaintenanceTaskForm";
import { 
  getSchoolFieldsAction, 
  getPendingMaintenanceTasksAction 
} from "@/app/actions/fieldActions";
import { Field, MaintenanceTask } from "@/types/schema_v4";
import { toast } from 'sonner';
import { D } from "@/lib/design-system";
import { motion, AnimatePresence } from "framer-motion";

interface GroundskeeperDashboardProps {
  schoolId: string;
}

export default function GroundskeeperDashboard({ schoolId }: GroundskeeperDashboardProps) {
  const [fields, setFields] = useState<Field[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [fieldsResult, tasksResult] = await Promise.all([
        getSchoolFieldsAction(schoolId),
        getPendingMaintenanceTasksAction(schoolId)
      ]);

      if (fieldsResult.success && fieldsResult.data) {
        setFields(fieldsResult.data as unknown as Field[]);
      }
      
      if (tasksResult.success && tasksResult.data) {
        setMaintenanceTasks(tasksResult.data as unknown as MaintenanceTask[]);
      }
    } catch (error) {
      console.error("Error fetching groundskeeper data:", error);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredFields = fields.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.pitchType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalFields: fields.length,
    availableFields: fields.filter(f => f.status === 'available').length,
    maintenanceFields: fields.filter(f => f.status === 'maintenance').length,
    pendingTasks: maintenanceTasks.length,
    urgentTasks: maintenanceTasks.filter(t => t.priority === 'Urgent').length
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: D.emerald }} />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: D.textMuted }}>Scanning Ground Surfaces...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500">
      {/* Header & Strategic Control Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                  style={{ background: `${D.emerald}15`, border: `1px solid ${D.emerald}30`, color: D.emerald }}
                >
                    <Tractor className="h-7 w-7" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic" style={{ fontFamily: D.head, color: D.textPrimary }}>
                        GROUNDS <span style={{ color: D.emerald }}>OPS</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: D.textMuted }}>
                        Precision Terrain Management & Facility Readiness
                    </p>
                </div>
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            className="h-10 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
            style={{ background: D.surf2, border: `1px solid ${D.border}`, color: D.textSecondary }}
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Status
          </Button>
          
          <MaintenanceTaskForm 
            fields={fields.map(f => ({ id: f.id, name: f.name }))} 
            onSuccess={() => fetchData(true)}
          />
        </div>
      </div>

      {/* Stats Summary Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Available Fields", value: stats.availableFields, sub: "Ready for Match Play", icon: CheckCircle2, color: D.emerald },
          { label: "In Maintenance", value: stats.maintenanceFields, sub: "Active Surface Prep", icon: Hammer, color: D.amber },
          { label: "Pending Tasks", value: stats.pendingTasks, sub: "Scheduled Work", icon: Clock, color: D.sky },
          { label: "Urgent Alerts", value: stats.urgentTasks, sub: "Requires Immediate Action", icon: AlertTriangle, color: stats.urgentTasks > 0 ? D.rose : D.textMuted },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="group relative overflow-hidden rounded-2xl p-6 transition-all border"
            style={{ background: D.surf1, border: `1px solid ${D.border}` }}
          >
            <div 
              className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-all group-hover:scale-125"
              style={{ color: stat.color }}
            >
              <stat.icon className="w-10 h-10" />
            </div>
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all"
              style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30`, color: stat.color }}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-3xl font-black" style={{ fontFamily: D.head, color: D.textPrimary }}>{stat.value}</div>
              <div className="text-[9px] font-black uppercase tracking-widest mt-1" style={{ color: D.textMuted }}>{stat.label}</div>
              <div className="text-[8px] font-bold uppercase tracking-widest mt-0.5 opacity-60" style={{ color: D.textMuted }}>{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="fields" className="space-y-6">
        <TabsList className="p-1 rounded-2xl border flex w-fit" style={{ background: D.surf1, border: `1px solid ${D.border}` }}>
          {[
            { value: "fields", label: "Field Status", icon: Construction },
            { value: "maintenance", label: "Maintenance log", icon: Clock, badge: stats.pendingTasks },
          ].map(tab => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="font-black text-[10px] uppercase tracking-widest gap-2 rounded-xl px-6 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500"
              style={{ color: D.textSecondary }}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {tab.badge ? (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[8px] font-black" style={{ background: `${D.emerald}20`, color: D.emerald }}>
                  {tab.badge}
                </span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="fields" className="space-y-8 outline-none px-1">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: D.textMuted, opacity: 0.4 }} />
              <input 
                placeholder="FIND A FIELD OR SURFACE TYPE..." 
                className="w-full rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none transition-all placeholder:opacity-30"
                style={{ 
                  background: D.surf2, 
                  border: `1px solid ${D.border}`, 
                  color: D.textPrimary,
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
               variant="outline" 
               className="h-10 w-10 rounded-xl p-0 transition-all"
               style={{ background: D.surf2, border: `1px solid ${D.border}`, color: D.textSecondary }}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredFields.length > 0 ? (
                filteredFields.map((field, i) => (
                  <motion.div
                    key={field.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                  >
                    <FieldCard field={field as any} index={i} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-24 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center gap-4" style={{ background: D.surf2, borderColor: D.border }}>
                  <Construction className="h-12 w-12 opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: D.textMuted }}>No matching surfaces found in the facility registry.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6 outline-none px-1">
          <div 
            className="rounded-3xl overflow-hidden shadow-2xl border"
            style={{ background: D.surf1, border: `1px solid ${D.border}` }}
          >
            <div className="p-8 pb-10 flex items-center justify-between" style={{ borderBottom: `1px solid ${D.border}`, background: D.surf2 }}>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter italic" style={{ fontFamily: D.head, color: D.textPrimary }}>UPCOMING MAINTENANCE</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: D.textMuted }}>Master schedule across all school facilities</p>
                </div>
                <MaintenanceTaskForm 
                  fields={fields.map(f => ({ id: f.id, name: f.name }))} 
                  onSuccess={() => fetchData(true)}
                />
            </div>
            <div className="p-6">
              <MaintenanceTaskList 
                tasks={maintenanceTasks} 
                onTaskUpdate={() => fetchData(true)}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
