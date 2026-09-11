"use client";

import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { D } from '@/lib/design-system';

const defaultData = [
  { month: 'Jan', form: 4.2 },
  { month: 'Feb', form: 5.8 },
  { month: 'Mar', form: 5.1 },
  { month: 'Apr', form: 7.2 },
  { month: 'May', form: 6.8 },
  { month: 'Jun', form: 8.4 },
];

export const FormTrendTracker = () => {
  return (
    <div className="w-full h-[150px] relative mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={defaultData}>
          <defs>
            <linearGradient id="formGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="month" 
            hide 
          />
          <YAxis hide domain={[0, 10]} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0a0a0a', 
              border: '1px solid #ffffff10', 
              borderRadius: '8px',
              fontSize: '10px',
              color: '#fff'
            }}
            itemStyle={{ color: '#22c55e' }}
            cursor={{ stroke: '#22c55e', strokeWidth: 1 }}
          />
          <Area 
            type="monotone" 
            dataKey="form" 
            stroke="#22c55e" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#formGrad)" 
            animationDuration={2000}
            animationBegin={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
