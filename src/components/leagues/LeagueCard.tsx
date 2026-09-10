"use client";

import { D } from "@/lib/design-system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, PenTool, Globe, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface LeagueCardProps {
  league: {
    id: string;
    name: string;
    type: string;
    description?: string;
    provinceId?: string;
  };
  index: number;
}

export function LeagueCard({ league, index }: LeagueCardProps) {
  const typeColors: Record<string, { bg: string, text: string, icon: any }> = {
    League: { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa', icon: Globe },
    Series: { bg: 'rgba(168, 85, 247, 0.1)', text: '#c084fc', icon: Trophy },
    Cup: { bg: 'rgba(245, 158, 11, 0.1)', text: '#fbbf24', icon: Trophy },
    Friendly: { bg: 'rgba(16, 185, 129, 0.1)', text: '#34d399', icon: Users },
  };

  const config = typeColors[league.type] || typeColors.League;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className="group relative p-6 rounded-3xl border transition-all hover:shadow-2xl"
      style={{ background: D.surf1, borderColor: D.border }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity rounded-3xl" 
           style={{ background: D.gradMain }} />
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex gap-5">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0"
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
            <Icon className="w-7 h-7" style={{ color: config.text }} />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold tracking-tight uppercase italic" style={{ color: D.textPrimary, fontFamily: D.head }}>
                {league.name}
              </h3>
              <Badge variant="outline" 
                     className="text-[10px] font-black uppercase tracking-widest border-none px-2 py-0.5 rounded-full"
                     style={{ backgroundColor: config.bg, color: config.text }}>
                {league.type}
              </Badge>
            </div>
            
            {league.description && (
              <p className="text-sm font-medium leading-relaxed max-w-xl" style={{ color: D.textMuted }}>
                {league.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                 <Globe className="w-3.5 h-3.5 text-indigo-400" />
                 <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: D.textMuted }}>
                   Province: {league.provinceId || 'N/A'}
                 </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link href={`/leagues/${league.id}/edit`} className="flex-1 md:flex-none">
            <Button variant="outline" 
                    className="w-full h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest border-none transition-all hover:scale-105"
                    style={{ background: D.surf2, color: D.textMuted }}>
              <PenTool className="mr-2 h-3.5 w-3.5" />
              Manage
            </Button>
          </Link>
          
          <Link href={`/leagues/${league.id}`} className="flex-1 md:flex-none">
            <Button className="w-full h-11 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/10 transition-all hover:scale-105"
                    style={{ background: D.indigo, color: 'white' }}>
              View Hub
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
