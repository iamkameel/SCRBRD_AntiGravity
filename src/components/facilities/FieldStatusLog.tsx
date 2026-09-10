"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { D } from "@/lib/scoring/theme";
import { History, Thermometer, Droplets, MapPin } from 'lucide-react';

const MOCK_LOGS = [
  { id: 1, date: '2026-03-11 08:30', condition: 'Excellent', temp: '22°C', humidity: '45%', author: 'J. Smith', notes: 'Heavy rolling complete on Pitch 4. Outfield height checked.' },
  { id: 2, date: '2026-03-10 16:45', condition: 'Good', temp: '19°C', humidity: '52%', author: 'J. Smith', notes: 'Irrigation cycle complete. Covers staged near Pitch 4.' },
  { id: 3, date: '2026-03-09 09:15', condition: 'Fair', temp: '17°C', humidity: '60%', author: 'P. Botha', notes: 'Post-rain inspection. Some surface moisture on the square.' },
];

export function FieldStatusLog() {
  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden mt-6">
      <CardHeader className="border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-primary" />
          <div>
            <CardTitle className="text-xl font-black tracking-tight" style={{ fontFamily: D.syne }}>Operational History</CardTitle>
            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Audit Log: A-Field Surface Intel</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-white/5">
          {MOCK_LOGS.map((log) => (
            <div key={log.id} className="p-6 hover:bg-white/5 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <Badge className="bg-white/10 text-white/60 border-white/5 font-mono text-[10px]">{log.date}</Badge>
                  <Badge className={`bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase`}>
                    {log.condition}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-white/30 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>{log.temp}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>{log.humidity}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{log.author}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed font-medium">
                {log.notes}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
