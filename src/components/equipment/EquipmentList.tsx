"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, PenTool, Trash2, Loader2, UserPlus, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Equipment } from "@/types/firestore";
import { deleteEquipmentItemAction, assignEquipmentAction, returnEquipmentAction } from "@/lib/actions/equipment";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";

interface EquipmentListProps {
  initialEquipment: Equipment[];
}

type OptimisticAction = 
  | { type: "delete"; id: string }
  | { type: "update"; id: string; updates: Partial<Equipment> };

export function EquipmentList({ initialEquipment }: EquipmentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<'All' | 'Available' | 'In Use' | 'Maintenance'>('All');
  const [isPending, startTransition] = useTransition();
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  // Optimistic state management
  const [optimisticEquipment, setOptimisticEquipment] = useOptimistic<Equipment[], OptimisticAction>(
    initialEquipment,
    (currentItems, action) => {
      switch (action.type) {
        case "delete":
          return currentItems.filter((item) => item.id !== action.id);
        case "update":
          return currentItems.map((item) =>
            item.id === action.id ? { ...item, ...action.updates } : item
          );
        default:
          return currentItems;
      }
    }
  );

  const filteredEquipment = optimisticEquipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
    case 'Available': return 'secondary';
    case 'In Use': return 'default';
    case 'Maintenance': return 'destructive';
    case 'Retired': return 'outline';
    default: return 'outline';
  }
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      setOptimisticEquipment({ type: "delete", id });
    });
    
    const result = await deleteEquipmentItemAction(id);
    if (result.success) {
      toast.success("Equipment deleted successfully");
    } else {
      toast.error(result.message || "Failed to delete equipment");
    }
  };

  const handleAssign = async (id: string) => {
    setPendingItemId(id);
    startTransition(async () => {
      setOptimisticEquipment({ type: "update", id, updates: { status: "In Use" } });
    });
    
    // Quick demo assign - in real app would show a modal to select person
    const result = await assignEquipmentAction(id, "demo-person-id");
    if (result.success) {
      toast.success("Equipment assigned");
    } else {
      toast.error(result.message || "Failed to assign equipment");
    }
    setPendingItemId(null);
  };

  const handleReturn = async (id: string) => {
    setPendingItemId(id);
    startTransition(async () => {
      setOptimisticEquipment({ type: "update", id, updates: { status: "Available", assignedTo: null } });
    });
    
    const result = await returnEquipmentAction(id);
    if (result.success) {
      toast.success("Equipment returned");
    } else {
      toast.error(result.message || "Failed to return equipment");
    }
    setPendingItemId(null);
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search equipment..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['All', 'Available', 'In Use', 'Maintenance'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredEquipment.length} items
        {filter !== 'All' && ` (${filter})`}
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map(item => {
          const isItemPending = pendingItemId === item.id;
          
          return (
            <Card key={item.id || item.itemId} className={isItemPending ? "opacity-70" : ""}>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Badge variant="outline">{item.type}</Badge>
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.brand}</p>
                  </div>
                  <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span>Condition: <span className={item.condition === 'New' ? 'text-emerald-500 font-medium' : ''}>{item.condition}</span></span>
                  </div>
                  {item.assignedTo && (
                    <div className="text-muted-foreground">
                      Assigned
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="font-bold text-primary">R {item.cost}</span>
                  <div className="flex gap-1">
                    {/* Quick Actions */}
                    {item.status === 'Available' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAssign(item.id!)}
                        disabled={isItemPending}
                        title="Assign to person"
                      >
                        {isItemPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {item.status === 'In Use' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleReturn(item.id!)}
                        disabled={isItemPending}
                        title="Return equipment"
                      >
                        {isItemPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Link href={`/equipment/${item.id || item.itemId}/edit`}>
                      <Button variant="ghost" size="sm">
                        <PenTool className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteConfirmationDialog
                      entityName={item.name}
                      onDelete={() => handleDelete(item.id!)}
                      trigger={
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEquipment.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No equipment found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
