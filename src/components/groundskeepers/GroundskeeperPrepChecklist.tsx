"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Clock, Wrench, Shield, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PrepTaskItem {
  id: string;
  label: string;
  category: 'Pitch' | 'Outfield' | 'Equipment' | 'Safety';
  completed: boolean;
  completedAt?: string;
}

const DEFAULT_TASKS: PrepTaskItem[] = [
  { id: 't1', label: 'Heavy Roller Session (45 mins)', category: 'Pitch', completed: true, completedAt: '07:30 AM' },
  { id: 't2', label: 'Pitch Cut & Mow (6mm height)', category: 'Pitch', completed: true, completedAt: '08:15 AM' },
  { id: 't3', label: 'Crease Line Marking & Stump Hole Prep', category: 'Pitch', completed: true, completedAt: '08:45 AM' },
  { id: 't4', label: 'Outfield Boundary Line Chalking', category: 'Outfield', completed: true, completedAt: '09:00 AM' },
  { id: 't5', label: 'Sight Screen Cleaning & Positioning', category: 'Equipment', completed: false },
  { id: 't6', label: 'Match Ball & Spare Ball Box Setup', category: 'Equipment', completed: false },
  { id: 't7', label: 'Emergency Medical Kit & Stretcher Check', category: 'Safety', completed: true, completedAt: '08:00 AM' },
  { id: 't8', label: 'Pitch Cover Removal & Storage', category: 'Pitch', completed: true, completedAt: '07:00 AM' }
];

interface GroundskeeperPrepChecklistProps {
  onSignOff?: () => void;
}

export function GroundskeeperPrepChecklist({ onSignOff }: GroundskeeperPrepChecklistProps) {
  const [tasks, setTasks] = useState<PrepTaskItem[]>(DEFAULT_TASKS);
  const [signedOff, setSignedOff] = useState(false);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? 'Just now' : undefined
        };
      }
      return t;
    }));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const isAllComplete = completedCount === tasks.length;

  const handleSignOff = () => {
    setSignedOff(true);
    if (onSignOff) onSignOff();
  };

  return (
    <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Groundskeeper Match Day Prep Workflow</h3>
          <p className="text-xs text-slate-400">{completedCount} of {tasks.length} tasks verified</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              "font-mono text-xs",
              signedOff 
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            )}
          >
            {signedOff ? 'Ground Certified Ready' : 'Prep In Progress'}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={cn(
              "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between",
              task.completed 
                ? "bg-white/5 border-white/10 text-slate-300" 
                : "bg-slate-950/60 border-amber-500/20 text-slate-400 hover:border-white/20"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center border transition-all",
                task.completed 
                  ? "bg-emerald-500 border-emerald-400 text-slate-950 font-bold" 
                  : "border-white/20 bg-slate-950"
              )}>
                {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span className={cn("text-sm font-medium", task.completed && "line-through text-slate-500")}>
                {task.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-slate-950 text-[10px] font-mono text-slate-400 border-white/10">
                {task.category}
              </Badge>
              {task.completedAt && (
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {task.completedAt}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-white/10">
        <div className="text-xs text-slate-400">
          Official Groundskeeper Sign-Off locks pitch state for referee & umpire audit.
        </div>
        <Button
          onClick={handleSignOff}
          disabled={signedOff || !isAllComplete}
          className={cn(
            "font-semibold text-xs tracking-wider uppercase shadow-lg transition-all",
            signedOff 
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
              : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
          )}
        >
          <CheckCircle2 className="w-4 h-4 mr-1.5" />
          {signedOff ? 'Ground Certified' : 'Certify Ground Readiness'}
        </Button>
      </div>
    </Card>
  );
}
