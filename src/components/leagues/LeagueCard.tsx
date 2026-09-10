"use client";

import { D } from "@/lib/design-system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, PenTool, Globe, Users, ArrowUpRight } from "lucide-react";
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
    League: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', icon: Globe },
    Series: { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', icon: Trophy },
    Cup: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', icon: Trophy },
    Friendly: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', icon: Users },
  };

  const config = typeColors[league.type] || typeColors.League;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -2 }}
      className="group relative"
    >
      <div 
        className="p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div 
            className="h-12 w-12 rounded-xl flex items-center justify-center border shrink-0 transition-colors group-hover:border-indigo-500/40"
            style={{ background: D.surf2, borderColor: D.border }}
          >
            <Icon className="w-6 h-6" style={{ color: config.text }} />
          </div>
          
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                {league.name}
              </h3>
              <Badge 
                variant="outline" 
                className="text-[10px] font-semibold px-2 py-0.5 rounded-lg border-none"
                style={{ backgroundColor: config.bg, color: config.text }}
              >
                {league.type}
              </Badge>
            </div>
            
            {league.description ? (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {league.description}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground/60 italic">
                No description provided
              </p>
            )}
            
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-0.5">
              <div className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Province: <strong className="text-white font-medium">{league.provinceId || 'National Scope'}</strong></span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions Row */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <Link href={`/leagues/${league.id}/edit`}>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-9 px-3 text-xs rounded-xl border-white/10 hover:bg-white/10"
            >
              <PenTool className="mr-1.5 h-3.5 w-3.5" />
              Manage
            </Button>
          </Link>
          
          <Link href={`/leagues/${league.id}`}>
            <Button 
              size="sm" 
              className="h-9 px-4 text-xs rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20"
            >
              View Hub
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
