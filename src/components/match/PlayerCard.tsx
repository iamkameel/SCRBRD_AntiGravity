import React from 'react';
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
// Import framer-motion
import { motion } from "framer-motion";

interface PlayerCardProps {
  name: string;
  role?: string;
  teamColor?: string; // Tailwind class like 'bg-fox-gold'
  image?: string;
  stats: Record<string, string | number>;
  variant?: 'batsman' | 'bowler';
  className?: string;
}

export function PlayerCard({
  name,
  role,
  teamColor = "bg-fox-blue",
  image,
  stats,
  variant = 'batsman',
  className
}: PlayerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card className={cn(
        "overflow-hidden bg-gray-900 border-gray-800 relative group",
        className
      )}>
        {/* Team Accent Stripe */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-2", teamColor)} />
        
        {/* Background Swirl Effect (Subtle) */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform duration-500 group-hover:scale-150" />

        <div className="flex flex-col md:flex-row p-4 pl-6 gap-4 items-center">
          {/* Player Image / Icon */}
          <div className="shrink-0 relative">
            <motion.div 
              className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center overflow-hidden"
              whileHover={{ rotate: 5, scale: 1.05 }}
            >
              {image ? (
                <Image 
                  src={image} 
                  alt={name} 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 80px, 96px"
                />
              ) : (
                <User className="w-10 h-10 text-gray-500" />
              )}
            </motion.div>
            {/* Role Badge */}
            {role && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-950 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-700 uppercase tracking-wider text-gray-400 whitespace-nowrap z-10">
                {role}
              </div>
            )}
          </div>

          {/* Info & Stats */}
          <div className="flex-1 w-full text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-extrabold text-white uppercase tracking-tight mb-1">
              {name}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mt-3">
              {Object.entries(stats).map(([key, value], index) => (
                <motion.div 
                  key={key} 
                  className="flex flex-col"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                    {key}
                  </span>
                  <span className="text-lg font-bold text-white font-mono">
                    {value}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
