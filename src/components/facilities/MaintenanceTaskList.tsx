"use client";

import React, { useState } from 'react';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Tractor, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MoreVertical,
  Plus,
  Trash2,
  Calendar
} from "lucide-react";
import { MaintenanceTask } from "@/types/schema_v4";
import { upsertMaintenanceTaskAction } from "@/app/actions/fieldActions";
import { toast } from 'sonner';
import { format } from 'date-fns';

interface MaintenanceTaskListProps {
  tasks: MaintenanceTask[];
  onTaskUpdate?: () => void;
}

export function MaintenanceTaskList({ tasks, onTaskUpdate }: MaintenanceTaskListProps) {
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  const handleStatusUpdate = async (taskId: string, newStatus: MaintenanceTask['status']) => {
    setLoadingTaskId(taskId);
    try {
      const result = await upsertMaintenanceTaskAction({ id: taskId as any, status: newStatus });
      if (result.success) {
        toast.success(`Task status updated to ${newStatus}`);
        onTaskUpdate?.();
      } else {
        toast.error(result.error || "Failed to update task");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoadingTaskId(null);
    }
  };

  const getPriorityBadge = (priority: MaintenanceTask['priority']) => {
    switch (priority) {
      case 'Urgent':
        return <Badge variant="destructive" className="animate-pulse">Urgent</Badge>;
      case 'High':
        return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
      case 'Medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-xl border-2 border-dashed border-border/50">
        <Tractor className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="font-bold text-lg">No pending tasks</h3>
        <p className="text-sm text-muted-foreground max-w-[250px]">
          Everything looks good! All maintenance tasks are completed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div 
          key={task.id}
          className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background border border-border rounded-xl hover:shadow-md hover:border-primary/30 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className={`mt-1 p-2 rounded-lg ${task.status === 'IN_PROGRESS' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {task.status === 'IN_PROGRESS' ? <Clock className="h-5 w-5" /> : <Tractor className="h-5 w-5" />}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-base leading-none">{task.title}</h4>
                {getPriorityBadge(task.priority)}
                {task.status === 'IN_PROGRESS' && (
                  <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">In Progress</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 max-w-md">
                {task.description || "No description provided."}
              </p>
              <div className="flex items-center gap-4 text-[10px] font-medium text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] uppercase tracking-tighter">
                    {task.taskType}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:pl-4">
            {task.status === 'PENDING' && (
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 text-xs font-bold"
                onClick={() => handleStatusUpdate(task.id, 'IN_PROGRESS')}
                disabled={loadingTaskId === task.id}
              >
                Start
              </Button>
            )}
            <Button 
              size="sm" 
              className="h-8 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => handleStatusUpdate(task.id, 'COMPLETED')}
              disabled={loadingTaskId === task.id}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Complete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
