import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface FieldCapacityIndicatorProps {
  capacity: number;
  currentBookings?: number; // Number of bookings today
  maxDailyBookings?: number; // Theoretical max bookings per day (e.g., 8 slots)
  className?: string;
  showLabel?: boolean;
}

export function FieldCapacityIndicator({
  capacity,
  currentBookings = 0,
  maxDailyBookings = 8, // Default to 8 slots per day
  className,
  showLabel = true
}: FieldCapacityIndicatorProps) {
  // Calculate utilization percentage based on bookings vs max slots
  const utilization = Math.min(100, Math.round((currentBookings / maxDailyBookings) * 100));
  
  // Determine status color
  const getStatusColor = (percent: number) => {
    if (percent >= 90) return "bg-red-500";
    if (percent >= 70) return "bg-amber-500";
    if (percent >= 40) return "bg-blue-500";
    return "bg-emerald-500";
  };

  const getStatusText = (percent: number) => {
    if (percent >= 90) return "Fully Booked";
    if (percent >= 70) return "Busy";
    if (percent >= 40) return "Moderate";
    return "Available";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />
            Utilization
          </span>
          <span className={cn("font-medium", 
            utilization >= 90 ? "text-red-600" : 
            utilization >= 70 ? "text-amber-600" : 
            "text-muted-foreground"
          )}>
            {getStatusText(utilization)}
          </span>
        </div>
      )}
      
      <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500 rounded-full", getStatusColor(utilization))}
          style={{ width: `${utilization}%` }}
        />
      </div>
      
      {showLabel && (
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{currentBookings} bookings</span>
          <span>{capacity.toLocaleString()} capacity</span>
        </div>
      )}
    </div>
  );
}
