"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, GraduationCap, ArrowUpRight, ChevronRight } from "lucide-react";
import { School } from "@/types/firestore";
import { D } from '@/lib/design-system';
import { motion } from "framer-motion";

interface SchoolCardProps {
  school: School;
  viewMode?: 'grid' | 'list' | 'table';
  index?: number;
}

export function SchoolCard({ school, viewMode = 'grid', index = 0 }: SchoolCardProps) {
  if (viewMode === 'grid') {
    return (
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="group relative"
      >
        <div 
          className="p-5 rounded-2xl border transition-all duration-300 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 space-y-4"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {school.logoUrl ? (
                <div className="relative h-11 w-11 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black/20">
                  <Image 
                    src={school.logoUrl} 
                    alt={school.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div 
                  className="h-11 w-11 rounded-xl flex items-center justify-center border shrink-0 bg-indigo-500/10 border-indigo-500/20"
                >
                  <span className="text-sm font-bold text-indigo-400">
                    {school.abbreviation?.[0] || school.name[0]}
                  </span>
                </div>
              )}

              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                  {school.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate font-medium">
                  {school.location || 'Regional Institution'}
                </p>
              </div>
            </div>

            {school.abbreviation && (
              <Badge 
                variant="outline" 
                className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border-indigo-500/20 shrink-0"
              >
                {school.abbreviation}
              </Badge>
            )}
          </div>

          {/* Info Details */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs" style={{ borderColor: D.border }}>
            <div className="flex items-center gap-1.5 text-muted-foreground truncate">
              <MapPin size={13} className="text-sky-400 shrink-0" />
              <span className="truncate">{school.location || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground truncate justify-end">
              <Calendar size={13} className="text-amber-400 shrink-0" />
              <span>{school.establishmentYear ? `Est. ${school.establishmentYear}` : 'Est. N/A'}</span>
            </div>
          </div>

          {/* Brand Colors & Actions Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {school.brandColors ? (
                <div className="flex gap-1 items-center">
                  <div 
                    className="h-3.5 w-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: school.brandColors.primary }}
                  />
                  <div 
                    className="h-3.5 w-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: school.brandColors.secondary }}
                  />
                </div>
              ) : (
                <span className="text-[11px] text-muted-foreground/60 italic">Standard Colors</span>
              )}
            </div>

            <Link href={`/schools/${school.id}`}>
              <Button 
                size="sm" 
                className="h-8 px-3 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20"
              >
                View Hub
                <ArrowUpRight size={13} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // List View Mode
  return (
    <motion.div
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
      className="group"
    >
      <div 
        className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-indigo-500/40"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {school.logoUrl ? (
            <div className="relative h-10 w-10 rounded-xl overflow-hidden shrink-0 border border-white/10">
              <Image 
                src={school.logoUrl} 
                alt={school.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <span className="text-xs font-bold text-indigo-400">
                {school.abbreviation?.[0] || school.name[0]}
              </span>
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                {school.name}
              </h3>
              {school.abbreviation && (
                <Badge 
                  variant="outline" 
                  className="text-[10px] font-medium px-2 py-0 rounded bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                >
                  {school.abbreviation}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {school.location || 'Location Unspecified'} {school.establishmentYear ? `• Est. ${school.establishmentYear}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link href={`/schools/${school.id}`}>
            <Button size="sm" className="h-8 px-3 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
              View Hub
              <ChevronRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
