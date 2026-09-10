"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Plus, CheckCircle2 } from "lucide-react";
import { upsertMaintenanceTaskAction } from '@/app/actions/fieldActions';
import { toast } from 'sonner';
import { MaintenanceTask, UUID } from '@/types/schema_v4';

interface MaintenanceTaskFormProps {
  fieldId?: string;
  fields: { id: string, name: string }[];
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function MaintenanceTaskForm({ fieldId, fields, trigger, onSuccess }: MaintenanceTaskFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFieldId, setSelectedFieldId] = useState(fieldId || (fields[0]?.id || ''));
  const [taskType, setTaskType] = useState<MaintenanceTask['taskType']>('Mowing');
  const [priority, setPriority] = useState<MaintenanceTask['priority']>('Medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async () => {
    if (!title || !selectedFieldId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const result = await upsertMaintenanceTaskAction({
        fieldId: selectedFieldId as any,
        title,
        description,
        taskType,
        priority,
        dueDate,
        status: 'PENDING'
      });
      
      if (result.success) {
        toast.success(`Maintenance task "${title}" created successfully.`);
        setOpen(false);
        onSuccess?.();
        // Reset form
        setTitle('');
        setDescription('');
      } else {
        toast.error(result.error || "Failed to create task.");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            New Maintenance Task
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="field">Select Field <span className="text-destructive">*</span></Label>
            <Select value={selectedFieldId} onValueChange={setSelectedFieldId}>
              <SelectTrigger id="field">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {fields.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Task Title <span className="text-destructive">*</span></Label>
            <Input 
              id="title" 
              placeholder="e.g. Mow boundary edges" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Task Type</Label>
              <Select value={taskType} onValueChange={(v: any) => setTaskType(v)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mowing">Mowing</SelectItem>
                  <SelectItem value="Rolling">Rolling</SelectItem>
                  <SelectItem value="Watering">Watering</SelectItem>
                  <SelectItem value="Marking">Marking</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                  <SelectItem value="Fertilizing">Fertilizing</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input 
              id="dueDate" 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Additional details about the task..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="font-bold gap-2"
          >
            {loading ? "Creating..." : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Create Task
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
