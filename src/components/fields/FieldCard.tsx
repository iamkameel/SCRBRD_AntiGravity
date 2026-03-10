import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Users, ArrowRight } from "lucide-react";

import { Field } from "@/types/firestore";
import { FieldCapacityIndicator } from "./FieldCapacityIndicator";

interface FieldCardProps {
  field: Field;
  viewMode?: 'grid' | 'list';
}

export function FieldCard({ field, viewMode = 'grid' }: FieldCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow group border-l-4 border-l-transparent hover:border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{field.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{field.location || 'Location TBA'}</span>
                </div>
                {field.capacity && (
                  <div className="flex items-center gap-2">
                    <FieldCapacityIndicator 
                      capacity={field.capacity} 
                      currentBookings={Math.floor(Math.random() * 8)} // Mock data for now
                      showLabel={false}
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                {field.pitchType || 'Turf'}
              </Badge>
              <Link href={`/fields/${field.id}`}>
                <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground">View</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-t-4 border-t-transparent hover:border-t-primary flex flex-col h-full">
      <CardContent className="p-6 flex-1 flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors">{field.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{field.location || 'Location TBA'}</span>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
            {field.pitchType || 'Turf'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm bg-muted/30 p-3 rounded-lg border border-border/50">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Utilization</div>
            <FieldCapacityIndicator 
              capacity={field.capacity || 1000} 
              currentBookings={Math.floor(Math.random() * 8)} // Mock data for now
              showLabel={false}
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Status</div>
            <div className="font-medium text-emerald-600">Active</div>
          </div>
        </div>

        <div className="mt-auto pt-2">
          <Link href={`/fields/${field.id}`} className="block">
            <Button className="w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-md shadow-primary/20 group-hover:shadow-primary/30 transition-all">
              View Details
              <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
