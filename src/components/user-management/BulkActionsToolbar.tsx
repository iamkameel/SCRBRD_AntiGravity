"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SchoolTeamAssignment } from "@/components/common/SchoolTeamAssignment";
import {
  ChevronDown,
  Building2,
  Users,
  Shield,
  Mail,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAssignSchools: (schools: string[], teams: string[]) => Promise<void>;
  onBulkChangeRole: (role: string) => Promise<void>;
  onBulkChangeStatus: (status: "active" | "inactive" | "injured") => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onBulkInvite: () => Promise<void>;
}

export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  onBulkAssignSchools,
  onBulkChangeRole,
  onBulkChangeStatus,
  onBulkDelete,
  onBulkInvite,
}: BulkActionsToolbarProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<{
    schools: string[];
    teams: string[];
  }>({ schools: [], teams: [] });

  const handleBulkAssign = async () => {
    try {
      setLoading(true);
      await onBulkAssignSchools(assignments.schools, assignments.teams);
      toast.success(
        `Assigned ${selectedCount} user(s) to ${assignments.schools.length} school(s) and ${assignments.teams.length} team(s)`
      );
      setAssignDialogOpen(false);
      setAssignments({ schools: [], teams: [] });
    } catch (error) {
      console.error("Bulk assign error:", error);
      toast.error("Failed to assign users");
    } finally {
      setLoading(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-4 rounded-lg animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-3">
          <Badge variant="default" className="h-8 px-4 text-sm font-semibold">
            {selectedCount} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-8"
          >
            Clear Selection
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Assign to Schools/Teams */}
          <Button
            variant="default"
            size="sm"
            onClick={() => setAssignDialogOpen(true)}
            className="h-8"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Assign to Schools/Teams
          </Button>

          {/* Status Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Change Status
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Set Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onBulkChangeStatus("active")}>
                ✅ Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkChangeStatus("inactive")}>
                ⏸️ Inactive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkChangeStatus("injured")}>
                🤕 Injured
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                More Actions
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onBulkInvite}>
                <Mail className="h-4 w-4 mr-2" />
                Send Invites
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onBulkDelete}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bulk Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bulk Assign to Schools & Teams
            </DialogTitle>
            <DialogDescription>
              Assign {selectedCount} selected user(s) to schools and teams. This
              will add to their existing assignments.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <SchoolTeamAssignment
              initialSchools={[]}
              initialTeams={[]}
              onChange={setAssignments}
              mode="inline"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkAssign} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  Assign to {selectedCount} User(s)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
