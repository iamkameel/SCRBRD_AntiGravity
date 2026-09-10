"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Wind, Flag, Play, CheckCircle2, XCircle, Award } from 'lucide-react';
import { AthleticsMeet, AthleticsEvent, AthleticsCompetitorEntry } from '@/types/sports';
import { cn } from '@/lib/utils';

const MOCK_ATHLETICS_MEET: AthleticsMeet = {
  meetId: 'meet-2026-01',
  title: 'Championship Track & Field Inter-High',
  venue: 'St Stithians Athletics Stadium',
  date: '12 March 2026',
  hostSchool: 'St Stithians College',
  status: 'Live',
  schoolStandings: [
    { schoolName: 'St Stithians College', totalPoints: 184, firstPlaces: 8, secondPlaces: 5, thirdPlaces: 4 },
    { schoolName: 'King Edward VII School', totalPoints: 172, firstPlaces: 7, secondPlaces: 6, thirdPlaces: 3 },
    { schoolName: 'Pretoria Boys High', totalPoints: 156, firstPlaces: 5, secondPlaces: 6, thirdPlaces: 5 },
    { schoolName: 'Jeppe High School for Boys', totalPoints: 138, firstPlaces: 4, secondPlaces: 4, thirdPlaces: 6 }
  ],
  events: [
    {
      id: 'ath-ev-1',
      eventName: 'U19 Boys Long Jump (Final)',
      category: 'Field',
      ageGroup: 'U19',
      gender: 'Boys',
      recordMark: '7.38m',
      recordHolder: 'T. Mokoena (PBHS, 2022)',
      status: 'Live',
      windMs: +1.4,
      entries: [
        {
          competitorId: 'ath-1',
          competitorName: 'Sipho Zulu',
          schoolName: 'King Edward VII School',
          seedMark: '7.15m',
          bestMark: '7.42m',
          rank: 1,
          pointsEarned: 10,
          status: 'Finished',
          attempts: [
            { attemptNumber: 1, markMeters: 6.95, windMs: +0.8 },
            { attemptNumber: 2, markMeters: 7.12, windMs: +1.2 },
            { attemptNumber: 3, isFoul: true, windMs: +2.1 },
            { attemptNumber: 4, markMeters: 7.42, windMs: +1.4 },
          ]
        },
        {
          competitorId: 'ath-2',
          competitorName: 'Jordan Smith',
          schoolName: 'St Stithians College',
          seedMark: '7.20m',
          bestMark: '7.28m',
          rank: 2,
          pointsEarned: 8,
          status: 'Finished',
          attempts: [
            { attemptNumber: 1, markMeters: 7.05, windMs: +0.5 },
            { attemptNumber: 2, markMeters: 7.28, windMs: +1.0 },
            { attemptNumber: 3, markMeters: 7.15, windMs: +1.1 },
            { attemptNumber: 4, isFoul: true, windMs: +1.8 },
          ]
        },
        {
          competitorId: 'ath-3',
          competitorName: 'David Khumalo',
          schoolName: 'Pretoria Boys High',
          seedMark: '6.90m',
          bestMark: '7.02m',
          rank: 3,
          pointsEarned: 6,
          status: 'Finished',
          attempts: [
            { attemptNumber: 1, markMeters: 6.85, windMs: +0.2 },
            { attemptNumber: 2, markMeters: 7.02, windMs: +0.9 },
            { attemptNumber: 3, markMeters: 6.98, windMs: +1.3 },
          ]
        }
      ]
    },
    {
      id: 'ath-ev-2',
      eventName: 'U19 Boys 100m Sprint (Final)',
      category: 'Track',
      ageGroup: 'U19',
      gender: 'Boys',
      recordMark: '10.32s',
      recordHolder: 'K. Adams (Jeppe, 2021)',
      status: 'Scheduled',
      windMs: +0.8,
      entries: [
        { competitorId: 'ath-4', competitorName: 'Marcus Vance', schoolName: 'Jeppe High School for Boys', seedMark: '10.55s', status: 'Confirmed' },
        { competitorId: 'ath-5', competitorName: 'Brandon Lee', schoolName: 'King Edward VII School', seedMark: '10.42s', status: 'Confirmed' },
        { competitorId: 'ath-6', competitorName: 'Kagiso Maseko', schoolName: 'St Stithians College', seedMark: '10.48s', status: 'Confirmed' },
      ]
    }
  ]
};

export function AthleticsMeetHub() {
  const [meet, setMeet] = useState<AthleticsMeet>(MOCK_ATHLETICS_MEET);
  const [selectedEventId, setSelectedEventId] = useState<string>(MOCK_ATHLETICS_MEET.events[0].id);

  const selectedEvent = meet.events.find(e => e.id === selectedEventId) || meet.events[0];
  const isRecordBroken = selectedEvent.entries.some(e => e.rank === 1 && e.bestMark && parseFloat(e.bestMark) > parseFloat(selectedEvent.recordMark));

  return (
    <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-['Syne',sans-serif] tracking-tight">{meet.title}</h2>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-mono text-[10px]">
                <Wind className="w-3 h-3 mr-1" />
                Track & Field Engine
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{meet.venue} • Host: {meet.hostSchool}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {meet.events.map(ev => (
            <Button
              key={ev.id}
              size="sm"
              variant="outline"
              onClick={() => setSelectedEventId(ev.id)}
              className={cn(
                "text-xs font-mono transition-all",
                selectedEventId === ev.id 
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40" 
                  : "bg-slate-950 text-slate-400 border-white/10"
              )}
            >
              {ev.eventName.split(' ')[0]} {ev.eventName.split(' ')[2]}
            </Button>
          ))}
        </div>
      </div>

      {/* Record Alert */}
      {isRecordBroken && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 animate-bounce">
          <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <div className="text-xs font-mono font-bold uppercase text-amber-400">New Meet Record Set!</div>
            <div className="text-xs text-slate-200 mt-0.5">
              <span className="font-bold text-white">{selectedEvent.entries.find(e => e.rank === 1)?.competitorName}</span> ({selectedEvent.entries.find(e => e.rank === 1)?.schoolName}) set a record mark of <span className="font-mono text-emerald-400 font-bold">{selectedEvent.entries.find(e => e.rank === 1)?.bestMark}</span> (Previous: {selectedEvent.recordMark}).
            </div>
          </div>
        </div>
      )}

      {/* Selected Event Bar */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-slate-400">Event</span>
          <h3 className="text-lg font-bold text-white">{selectedEvent.eventName}</h3>
        </div>
        <div className="flex gap-6 text-xs font-mono">
          <div>
            <span className="text-slate-400">Record: </span>
            <span className="text-amber-400 font-bold">{selectedEvent.recordMark}</span> ({selectedEvent.recordHolder})
          </div>
          <div>
            <span className="text-slate-400">Wind Gauge: </span>
            <span className="text-emerald-400 font-bold">+{selectedEvent.windMs} m/s</span>
          </div>
        </div>
      </div>

      {/* Attempt Grid */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase font-bold text-slate-400">Field Attempts & Jump Marks</div>
        <div className="space-y-3">
          {selectedEvent.entries.map(comp => (
            <div 
              key={comp.competitorId}
              className={cn(
                "p-4 rounded-xl border space-y-3 transition-all",
                comp.rank === 1 
                  ? "bg-amber-500/10 border-amber-500/30 text-slate-100" 
                  : "bg-white/5 border-white/5 text-slate-300"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    {comp.competitorName}
                    <span className="text-xs text-slate-400 font-normal">({comp.schoolName})</span>
                    {comp.rank === 1 && <Badge className="bg-amber-500 text-slate-950 font-mono text-[9px]">1st PLACE</Badge>}
                    {comp.rank === 2 && <Badge className="bg-slate-300 text-slate-950 font-mono text-[9px]">2nd PLACE</Badge>}
                    {comp.rank === 3 && <Badge className="bg-amber-700 text-white font-mono text-[9px]">3rd PLACE</Badge>}
                  </div>
                </div>
                <div className="font-mono text-right">
                  <span className="text-xs text-slate-400 mr-2">Best Mark:</span>
                  <span className="text-emerald-400 font-bold text-base">{comp.bestMark || '--'}</span>
                </div>
              </div>

              {/* Attempts strip */}
              {comp.attempts && (
                <div className="flex gap-2 font-mono text-xs">
                  {comp.attempts.map((att, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border text-center flex-1",
                        att.isFoul 
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                          : "bg-slate-950 border-white/10 text-slate-200"
                      )}
                    >
                      <div className="text-[10px] text-slate-500">Attempt {att.attemptNumber}</div>
                      <div className="font-bold">{att.isFoul ? 'FOUL' : `${att.markMeters}m`}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Inter-School Athletics Standings */}
      <div className="space-y-3 pt-2">
        <div className="text-xs font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          Inter-School Track & Field Points Table
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {meet.schoolStandings.map((stand, idx) => (
            <div key={stand.schoolName} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">{idx + 1}. {stand.schoolName}</span>
                <span className="font-mono text-amber-400 font-bold text-sm">{stand.totalPoints} pts</span>
              </div>
              <div className="flex gap-2 text-[10px] font-mono text-slate-400 pt-1">
                <span>🥇 {stand.firstPlaces} Gold</span>
                <span>🥈 {stand.secondPlaces} Silver</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
