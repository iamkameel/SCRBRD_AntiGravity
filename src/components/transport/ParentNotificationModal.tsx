"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Smartphone, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  X, 
  Users, 
  Radio, 
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { D } from "@/lib/design-system";
import { parentNotificationService, ParentNotification } from "@/lib/services/parentNotificationService";
import { toast } from "sonner";

interface ParentNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId?: string;
  vehicleName?: string;
  destination?: string;
  passengerCount?: number;
}

export function ParentNotificationModal({
  isOpen,
  onClose,
  tripId = 'TRIP-101',
  vehicleName = 'Mercedes Sprinter V02',
  destination = 'Westville Oval',
  passengerCount = 11
}: ParentNotificationModalProps) {
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [channel, setChannel] = useState<'SMS' | 'PUSH' | 'WHATSAPP'>('SMS');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = parentNotificationService.subscribeNotifications(tripId, (data) => {
      setNotifications(data);
    });
    return () => unsubscribe();
  }, [isOpen, tripId]);

  const handleSendBroadcast = async () => {
    if (!customMessage.trim()) {
      toast.error("Please enter a broadcast message");
      return;
    }
    setSending(true);
    try {
      await parentNotificationService.dispatchNotification({
        tripId,
        studentName: 'Squad Passengers',
        guardianName: `Parents of (${passengerCount} Players)`,
        guardianPhone: `Broadcast List (${passengerCount} Phones)`,
        channel,
        type: 'DEPARTED',
        title: `Coaches Broadcast: ${vehicleName}`,
        message: `SCRBRD LOGISTICS: ${customMessage.trim()}`
      });
      toast.success(`Broadcast dispatched via ${channel} to ${passengerCount} parents!`);
      setCustomMessage('');
    } catch (err) {
      toast.error("Failed to send broadcast");
    } finally {
      setSending(false);
    }
  };

  const handleQuickTrigger = async (type: 'BOARDED_ALL' | 'DEPARTED' | 'ARRIVED') => {
    setSending(true);
    try {
      if (type === 'BOARDED_ALL') {
        await parentNotificationService.dispatchNotification({
          tripId,
          studentName: 'Squad XI',
          guardianName: 'All Parents',
          guardianPhone: `Broadcast (${passengerCount} Guardians)`,
          channel: 'SMS',
          type: 'BOARDED',
          title: 'Squad Boarding Complete',
          message: `SCRBRD LOGISTICS: All ${passengerCount} players have completed boarding on ${vehicleName}. Vehicle preparing to depart for ${destination}.`
        });
        toast.success("Boarding completion SMS sent to all parents!");
      } else if (type === 'DEPARTED') {
        await parentNotificationService.notifyTripDeparted(tripId, vehicleName, destination, '08:35 AM', passengerCount);
        toast.success("Departure push notification sent to all parents!");
      } else if (type === 'ARRIVED') {
        await parentNotificationService.notifyTripArrived(tripId, vehicleName, destination);
        toast.success("Arrival alert sent to all parents!");
      }
    } catch (err) {
      toast.error("Failed to trigger alert");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          {/* Top Bar Header */}
          <div className="p-6 border-b flex items-center justify-between" style={{ background: D.surf2, borderColor: D.border }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner text-emerald-400" style={{ background: D.surf1, borderColor: D.border }}>
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2" style={{ fontFamily: D.head, color: D.textPrimary }}>
                  PARENT <span style={{ color: D.emerald }}>NOTIFICATIONS</span>
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2" style={{ color: D.textMuted }}>
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> SMS & PUSH GATEWAY • {vehicleName}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all hover:scale-105 active:scale-95"
              style={{ background: D.surf1, borderColor: D.border, color: D.textMuted }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1 no-scrollbar">
            {/* Quick One-Tap Triggers */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 block opacity-60" style={{ color: D.textMuted }}>
                QUICK ONE-TAP BROADCAST TRIGGERS
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  disabled={sending}
                  onClick={() => handleQuickTrigger('BOARDED_ALL')}
                  className="p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between group"
                  style={{ background: `${D.emerald}10`, borderColor: `${D.emerald}30` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <Badge variant="outline" className="text-[8px] font-black uppercase" style={{ borderColor: `${D.emerald}40`, color: D.emerald }}>SMS</Badge>
                  </div>
                  <span className="text-xs font-black uppercase tracking-tight text-emerald-300" style={{ fontFamily: D.head }}>
                    100% BOARDED
                  </span>
                  <span className="text-[9px] font-bold opacity-60 mt-1" style={{ color: D.textMuted }}>
                    Alert parents all {passengerCount} players are on bus
                  </span>
                </button>

                <button
                  disabled={sending}
                  onClick={() => handleQuickTrigger('DEPARTED')}
                  className="p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between group"
                  style={{ background: `${D.indigo}10`, borderColor: `${D.indigo}30` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Radio className="w-4 h-4 text-indigo-400" />
                    <Badge variant="outline" className="text-[8px] font-black uppercase" style={{ borderColor: `${D.indigo}40`, color: D.indigo }}>PUSH</Badge>
                  </div>
                  <span className="text-xs font-black uppercase tracking-tight text-indigo-300" style={{ fontFamily: D.head }}>
                    BUS EN ROUTE
                  </span>
                  <span className="text-[9px] font-bold opacity-60 mt-1" style={{ color: D.textMuted }}>
                    Notify departure & ETA to {destination}
                  </span>
                </button>

                <button
                  disabled={sending}
                  onClick={() => handleQuickTrigger('ARRIVED')}
                  className="p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between group"
                  style={{ background: `${D.amber}10`, borderColor: `${D.amber}30` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <Badge variant="outline" className="text-[8px] font-black uppercase" style={{ borderColor: `${D.amber}40`, color: D.amber }}>ALL</Badge>
                  </div>
                  <span className="text-xs font-black uppercase tracking-tight text-amber-300" style={{ fontFamily: D.head }}>
                    ARRIVED AT VENUE
                  </span>
                  <span className="text-[9px] font-bold opacity-60 mt-1" style={{ color: D.textMuted }}>
                    Confirm safe arrival at {destination}
                  </span>
                </button>
              </div>
            </div>

            {/* Custom Broadcast Compose */}
            <div className="p-4 rounded-2xl border space-y-4" style={{ background: D.surf2, borderColor: D.border }}>
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 flex items-center gap-2" style={{ color: D.textMuted }}>
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> CUSTOM GUARDIAN BROADCAST
                </label>
                <div className="flex gap-1.5">
                  {(['SMS', 'PUSH', 'WHATSAPP'] as const).map(ch => (
                    <button
                      key={ch}
                      onClick={() => setChannel(ch)}
                      className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase border transition-all ${
                        channel === ch ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'opacity-40 hover:opacity-100'
                      }`}
                      style={{ borderColor: D.border }}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Input 
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={`Type alert message for ${passengerCount} parents (e.g. Traffic delay 10 mins)...`}
                  className="bg-black/30 border text-xs h-11 rounded-xl"
                  style={{ borderColor: D.border, color: D.textPrimary }}
                />
                <Button 
                  disabled={sending || !customMessage.trim()}
                  onClick={handleSendBroadcast}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs px-5 h-11 rounded-xl shrink-0 gap-2 shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" /> SEND
                </Button>
              </div>
            </div>

            {/* Live Notification Audit Feed */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 block opacity-60" style={{ color: D.textMuted }}>
                DISPATCH AUDIT LOG ({notifications.length} MESSAGES SENT)
              </label>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                {notifications.map((n) => (
                  <div 
                    key={n.id}
                    className="p-3.5 rounded-xl border flex items-center justify-between text-xs"
                    style={{ background: D.surf2, borderColor: D.border }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        n.type === 'BOARDED' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                        n.type === 'ABSENT' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' :
                        'border-indigo-500/30 text-indigo-400 bg-indigo-500/10'
                      }`}>
                        {n.type === 'BOARDED' && <CheckCircle2 className="w-4 h-4" />}
                        {n.type === 'ABSENT' && <ShieldAlert className="w-4 h-4" />}
                        {(n.type === 'DEPARTED' || n.type === 'ARRIVED') && <Radio className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[11px] truncate" style={{ color: D.textPrimary }}>{n.title}</span>
                          <Badge variant="outline" className="text-[8px] px-1.5 py-0" style={{ borderColor: D.border, color: D.textMuted }}>
                            {n.channel}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate opacity-70 mt-0.5" style={{ color: D.textMuted }}>
                          {n.message}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <span className="text-[9px] font-black text-emerald-400 flex items-center justify-end gap-1" style={{ fontFamily: D.mono }}>
                        <CheckCircle2 className="w-2.5 h-2.5" /> DELIVERED
                      </span>
                      <span className="text-[8px] text-muted-foreground opacity-50 block mt-0.5" style={{ fontFamily: D.mono }}>
                        {typeof n.sentAt === 'string' ? n.sentAt : 'JUST NOW'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t flex justify-end" style={{ background: D.surf2, borderColor: D.border }}>
            <Button variant="outline" onClick={onClose} className="rounded-xl font-bold uppercase text-xs">
              Close Gateway
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
