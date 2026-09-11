"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Calendar, MapPin, Users } from "lucide-react";
import { D } from '@/lib/design-system';

interface ConflictAlertProps {
  conflicts: string[];
}

export function ConflictAlert({ conflicts }: ConflictAlertProps) {
  if (conflicts.length === 0) return null;

  const getConflictIcon = (conflict: string) => {
    if (conflict.toLowerCase().includes('venue')) return <MapPin className="h-4 w-4" />;
    if (conflict.toLowerCase().includes('team')) return <Users className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  return (
    <Alert className="bg-red-500/10 border-red-500/20 backdrop-blur-xl text-white rounded-2xl sh-slide-up">
      <AlertTriangle className="h-5 w-5 text-red-400" />
      <AlertTitle className="font-bold text-red-400" style={{ fontFamily: D.head }}>Conflict Resolution Required</AlertTitle>
      <AlertDescription>
        <ul className="mt-3 space-y-2">
          {conflicts.map((conflict, index) => (
            <li key={index} className="flex items-center gap-3 text-xs font-medium text-white/70 bg-white/5 p-2 rounded-lg border border-white/5">
              <div className="text-red-400/60">{getConflictIcon(conflict)}</div>
              {conflict}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
