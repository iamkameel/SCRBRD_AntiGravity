import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MatchInfoCardProps {
  competition?: string;
  date: string;
  time: string;
  venue?: string;
  weather?: string;
  currentInnings?: string;
  umpires?: string[];
  referee?: string;
}

export function MatchInfoCard({
  competition,
  date,
  time,
  venue,
  weather,
  currentInnings,
  umpires,
  referee
}: MatchInfoCardProps) {
  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600">
          Match Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {competition && (
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-xs font-medium text-slate-500 uppercase">Competition</span>
            <span className="text-sm font-semibold text-slate-900">{competition}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <span className="text-xs font-medium text-slate-500 uppercase">Date & Time</span>
          <span className="text-sm font-semibold text-slate-900">{date} • {time}</span>
        </div>

        {currentInnings && (
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-xs font-medium text-slate-500 uppercase">Innings</span>
            <span className="text-sm font-semibold text-slate-900">{currentInnings}</span>
          </div>
        )}

        {venue && (
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-xs font-medium text-slate-500 uppercase">Venue</span>
            <span className="text-sm font-semibold text-slate-900">{venue}</span>
          </div>
        )}

        {weather && (
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-xs font-medium text-slate-500 uppercase">Weather</span>
            <span className="text-sm font-semibold text-slate-900">{weather}</span>
          </div>
        )}

        {umpires && umpires.length > 0 && (
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-xs font-medium text-slate-500 uppercase">Umpires</span>
            <span className="text-sm font-semibold text-slate-900">{umpires.join(', ')}</span>
          </div>
        )}

        {referee && (
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-500 uppercase">Referee</span>
            <span className="text-sm font-semibold text-slate-900">{referee}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
