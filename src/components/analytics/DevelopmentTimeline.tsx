"use client";

import { D } from "@/lib/scoring/theme";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp } from "lucide-react";

interface DevelopmentTimelineProps {
  data: any[];
  title?: string;
}

export function DevelopmentTimeline({ data, title = "Longitudinal Growth" }: DevelopmentTimelineProps) {
  return (
    <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.xl, padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, textTransform: 'uppercase' }}>{title}</div>
        <TrendingUp size={16} color={D.textMuted} />
      </div>
      
      <div style={{ height: '240px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={D.border} vertical={false} />
            <XAxis 
              dataKey="period" 
              stroke={D.textMuted} 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke={D.textMuted} 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ background: D.surf2, border: `1px solid ${D.border}`, borderRadius: D.md }}
              itemStyle={{ color: D.textPrimary, fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={D.sky} 
              strokeWidth={3} 
              dot={{ fill: D.sky, strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: D.base, strokeWidth: 2 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: D.sky }} />
          <div style={{ fontSize: '11px', color: D.textMuted }}>Skill Progression</div>
        </div>
      </div>
    </div>
  );
}
