"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Calendar, MapPin, Users, ShieldAlert, ArrowRight, RefreshCw, Clock } from "lucide-react";
import { D } from '@/lib/design-system';
import { Button } from "@/components/ui/button";

interface ConflictAlertProps {
  conflicts: string[];
  isOverridden?: boolean;
  onOverride?: () => void;
  onAutoSelectVenue?: () => void;
  onShiftTime?: () => void;
}

export function ConflictAlert({ 
  conflicts, 
  isOverridden = false,
  onOverride, 
  onAutoSelectVenue, 
  onShiftTime 
}: ConflictAlertProps) {
  if (conflicts.length === 0) return null;

  const getConflictIcon = (conflict: string) => {
    if (conflict.toLowerCase().includes('venue') || conflict.toLowerCase().includes('field')) return <MapPin className="h-4 w-4 text-red-400" />;
    if (conflict.toLowerCase().includes('team') || conflict.toLowerCase().includes('squad')) return <Users className="h-4 w-4 text-amber-400" />;
    return <Calendar className="h-4 w-4 text-cyan-400" />;
  };

  return (
    <Alert className={`backdrop-blur-xl rounded-2xl sh-slide-up transition-all ${
      isOverridden 
        ? "bg-amber-500/10 border-amber-500/30 text-white" 
        : "bg-red-500/10 border-red-500/30 text-white"
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${isOverridden ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
          <AlertTriangle className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <AlertTitle className={`font-bold text-base m-0 ${isOverridden ? "text-amber-400" : "text-red-400"}`} style={{ fontFamily: D.head }}>
              {isOverridden ? "Conflict Resolution: Overridden" : "Conflict Resolution Required"}
            </AlertTitle>
            {isOverridden && (
              <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Bypassed by Admin
              </span>
            )}
          </div>

          <AlertDescription className="mt-2">
            <ul className="space-y-2 mb-4">
              {conflicts.map((conflict, index) => (
                <li key={index} className="flex items-center gap-3 text-xs font-medium text-white/80 bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <div className="shrink-0">{getConflictIcon(conflict)}</div>
                  <span className="leading-tight">{conflict}</span>
                </li>
              ))}
            </ul>

            {/* Interactive Conflict Resolution Actions */}
            {!isOverridden ? (
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
                {onAutoSelectVenue && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={onAutoSelectVenue}
                    className="h-9 px-3 text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Auto-Assign Open Venue
                  </Button>
                )}

                {onShiftTime && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={onShiftTime}
                    className="h-9 px-3 text-xs bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold rounded-lg flex items-center gap-1.5"
                  >
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    Shift Time (+2 Hours)
                  </Button>
                )}

                {onOverride && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={onOverride}
                    className="h-9 px-3 text-xs text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 font-bold rounded-lg flex items-center gap-1.5 ml-auto"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Override & Proceed
                  </Button>
                )}
              </div>
            ) : (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-amber-300/80">
                <span>Conflict acknowledged. Match logged with audit flag.</span>
                {onOverride && (
                  <button 
                    type="button" 
                    onClick={onOverride}
                    className="underline text-white hover:text-amber-300 font-bold ml-2"
                  >
                    Re-enable Check
                  </button>
                )}
              </div>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
