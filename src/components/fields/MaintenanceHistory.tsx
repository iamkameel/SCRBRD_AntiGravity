"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Wrench } from "lucide-react";

interface MaintenanceLog {
  id: string;
  date: string;
  type: 'Mowing' | 'Rolling' | 'Watering' | 'Fertilizing' | 'Repair';
  description: string;
  performedBy: string;
  status: 'Completed' | 'Scheduled';
}

interface MaintenanceHistoryProps {
  logs: MaintenanceLog[];
}

export function MaintenanceHistory({ logs }: MaintenanceHistoryProps) {
  
  const getTypeColor = (type: MaintenanceLog['type']) => {
    switch (type) {
      case 'Mowing': return 'bg-emerald-500';
      case 'Rolling': return 'bg-emerald-500';
      case 'Watering': return 'bg-cyan-500';
      case 'Fertilizing': return 'bg-amber-500';
      case 'Repair': return 'bg-red-500';
    }
  };

  const getTypeIcon = (type: MaintenanceLog['type']) => {
    return <Wrench className="h-3 w-3" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Maintenance History</CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Log
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No maintenance logs recorded</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div key={log.id} className="flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full ${getTypeColor(log.type)} flex items-center justify-center text-white`}>
                    {getTypeIcon(log.type)}
                  </div>
                  {index < logs.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border my-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{log.type}</span>
                        <Badge variant={log.status === 'Completed' ? 'secondary' : 'default'}>
                          {log.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(log.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{log.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    By: {log.performedBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
