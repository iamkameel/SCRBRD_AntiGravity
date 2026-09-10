/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, Zap, Lock, ChevronRight, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'Commercial' | 'Development' | 'Prestige';
  isLocked?: boolean;
  requiredTier?: string;
  imageUrl?: string;
}

interface RewardsStoreProps {
  items: StoreItem[];
  userBalance: number;
  userTier: string;
  className?: string;
}

export const RewardsStore: React.FC<RewardsStoreProps> = ({
  items,
  userBalance,
  userTier,
  className = ''
}) => {
  const categories = ['All', 'Commercial', 'Development', 'Prestige'];
  const [activeCategory, setActiveCategory] = React.useState('All');

  const filteredItems = items.filter(item => 
    activeCategory === 'All' || item.category === activeCategory
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-2 tracking-tighter uppercase">
            <ShoppingBag className="w-6 h-6 text-blue-500" />
            Vantage Store
          </h3>
          <p className="text-sm text-slate-400">Redeem your hard-earned SCRBRD points</p>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 glass-card rounded-2xl border-white/5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                activeCategory === cat 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => {
          const isAffordable = userBalance >= item.cost;
          const isLocked = item.isLocked || (item.requiredTier && userTier !== item.requiredTier); // Simplified check

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <Card className="relative h-full overflow-hidden glass-card border-white/5 flex flex-col hover:border-white/20 transition-all duration-500">
                {/* Item Image area */}
                <div className="relative h-40 bg-slate-900 group-hover:scale-105 transition-transform duration-700">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-blue-500/20" />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="outline" className="bg-slate-950/80 backdrop-blur-md border-white/10 text-[10px] uppercase tracking-widest px-2 py-0.5">
                      {item.category}
                    </Badge>
                  </div>

                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <Lock className="w-8 h-8 text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Requires {item.requiredTier}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1 gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white group-hover:text-blue-400 transition">{item.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Redeem for</span>
                      <div className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-lg font-black text-white">{item.cost.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-500">PTS</span>
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      disabled={isLocked || !isAffordable}
                      className={`rounded-xl px-4 font-bold border-none transition-all duration-300 ${
                        isAffordable 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20' 
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isAffordable ? 'Redeem' : 'Insufficient'}
                      {!isLocked && isAffordable && <Zap className="w-3 h-3 ml-2 fill-current" />}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
