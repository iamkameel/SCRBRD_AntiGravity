"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
interface Partnership {
  batsman1Name: string;
  batsman2Name: string;
  runs: number;
  balls: number;
  wicket: number;
  strikeRate: number;
}

interface PartnershipCardProps {
  partnership: Partnership;
  isCurrentPartnership?: boolean;
}

export function PartnershipCard({ partnership, isCurrentPartnership = false }: PartnershipCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={isCurrentPartnership ? "border-primary shadow-md" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Partnership
            </CardTitle>
            {isCurrentPartnership && (
              <Badge variant="default" className="animate-pulse">Current</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Batsmen Names */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{partnership.batsman1Name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{partnership.batsman2Name}</span>
            </div>
          </div>

          {/* Partnership Stats */}
          <div className="grid grid-cols-3 gap-4 pt-3 border-t">
            <div className="text-center">
              <motion.div 
                key={partnership.runs}
                initial={{ scale: 1.2, color: "var(--primary)" }}
                animate={{ scale: 1, color: "var(--primary)" }}
                className="text-2xl font-bold text-primary"
              >
                {partnership.runs}
              </motion.div>
              <div className="text-xs text-muted-foreground">Runs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{partnership.balls}</div>
              <div className="text-xs text-muted-foreground">Balls</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{partnership.strikeRate.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">SR</div>
            </div>
          </div>

          {/* Wicket Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <TrendingUp className="h-4 w-4" />
            <span>For {partnership.wicket}{partnership.wicket === 1 ? 'st' : partnership.wicket === 2 ? 'nd' : partnership.wicket === 3 ? 'rd' : 'th'} wicket</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Component for displaying multiple partnerships
interface PartnershipListProps {
  partnerships: Partnership[];
  currentPartnershipIndex?: number;
}

export function PartnershipList({ partnerships, currentPartnershipIndex }: PartnershipListProps) {
  return (
    <div className="space-y-4">
      {partnerships.map((partnership, index) => (
        <PartnershipCard
          key={index}
          partnership={partnership}
          isCurrentPartnership={index === currentPartnershipIndex}
        />
      ))}
    </div>
  );
}
