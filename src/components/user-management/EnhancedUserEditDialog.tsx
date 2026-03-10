"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROLE_GROUPS } from "@/lib/roles";
import { UserData } from "@/lib/userService";
import { SchoolTeamAssignment } from "@/components/common/SchoolTeamAssignment";
import { User, Shield, Building2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EnhancedUserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  onSave: (data: Partial<UserData>) => Promise<void>;
}

export function EnhancedUserEditDialog({
  open,
  onOpenChange,
  user,
  onSave,
}: EnhancedUserEditDialogProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Player",
    roles: ["Player"] as string[],
    status: "active" as "active" | "inactive" | "injured",
    assignedSchools: [] as string[],
    teamIds: [] as string[],
  });

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        role: user.role || "Player",
        roles: user.roles || [user.role || "Player"],
        status: (user.status as "active" | "inactive" | "injured") || "active",
        assignedSchools: (user as any).assignedSchools || [],
        teamIds: (user as any).teamIds || [],
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        role: "Player",
        roles: ["Player"],
        status: "active",
        assignedSchools: [],
        teamIds: [],
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await onSave({
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        role: formData.role,
        roles: formData.roles,
        status: formData.status,
        assignedSchools: formData.assignedSchools,
        teamIds: formData.teamIds,
      } as any);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {user ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Update user information, roles, and assignments"
              : "Create a new user account with roles and assignments"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">
              <User className="h-4 w-4 mr-2" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="h-4 w-4 mr-2" />
              Roles & Access
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <Building2 className="h-4 w-4 mr-2" />
              Assignments
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john.doe@example.com"
                disabled={!!user} // Can't change email for existing users
              />
              {user && (
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed for existing users
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val: any) =>
                  setFormData({ ...formData, status: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="injured">Injured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Roles & Access Tab */}
          <TabsContent value="roles" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="role">Primary Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => {
                  const newRoles = formData.roles.includes(val)
                    ? formData.roles
                    : [val, ...formData.roles];
                  setFormData({ ...formData, role: val, roles: newRoles });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_GROUPS).map(([group, roles]) => (
                    <SelectGroup key={group}>
                      <SelectLabel>{group}</SelectLabel>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The primary role determines default permissions and UI behavior
              </p>
            </div>

            <div className="space-y-2">
              <Label>Additional Roles</Label>
              <div className="border rounded-md p-3 max-h-64 overflow-y-auto space-y-3">
                {Object.entries(ROLE_GROUPS).map(([group, roles]) => (
                  <div key={group} className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {group}
                    </p>
                    <div className="space-y-1.5 pl-2">
                      {roles.map((role) => (
                        <div key={role} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`role-${role}`}
                            checked={formData.roles.includes(role)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  roles: [...formData.roles, role],
                                });
                              } else {
                                if (role === formData.role) {
                                  toast.error("Cannot remove primary role");
                                  return;
                                }
                                setFormData({
                                  ...formData,
                                  roles: formData.roles.filter((r) => r !== role),
                                });
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                            disabled={role === formData.role}
                          />
                          <label
                            htmlFor={`role-${role}`}
                            className={`text-sm ${
                              role === formData.role ? "font-semibold" : ""
                            }`}
                          >
                            {role} {role === formData.role && "(Primary)"}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select all roles this user should have access to
              </p>
            </div>

            {/* Selected Roles Preview */}
            {formData.roles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">Selected Roles</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.roles.map((role) => (
                    <Badge
                      key={role}
                      variant={role === formData.role ? "default" : "secondary"}
                      className={
                        role === formData.role ? "border border-primary" : ""
                      }
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="mt-4">
            <SchoolTeamAssignment
              initialSchools={formData.assignedSchools}
              initialTeams={formData.teamIds}
              onChange={(data) =>
                setFormData({
                  ...formData,
                  assignedSchools: data.schools,
                  teamIds: data.teams,
                })
              }
              mode="inline"
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
