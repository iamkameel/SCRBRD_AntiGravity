"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ROLE_GROUPS } from "@/lib/roles";
import { Users, Search, MoreVertical, Plus, Pencil, Trash2, UserCog, ShieldAlert, Grid3x3, Mail, List, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PermissionsMatrix } from "@/components/user-management/PermissionsMatrix";
import { InviteUserDialog } from "@/components/user-management/InviteUserDialog";
import { UserService, UserData } from "@/lib/userService";
import { toast } from "sonner";
import { deletePersonAction } from "@/app/actions/personActions";
import { EnhancedUserEditDialog } from "@/components/user-management/EnhancedUserEditDialog";
import { BulkActionsToolbar } from "@/components/user-management/BulkActionsToolbar";

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await UserService.getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Player",
    roles: ["Player"] as string[],
    status: "active" as "active" | "inactive" | "injured"
  });

  const filteredUsers = users.filter(person => {
    const matchesSearch = (person.displayName || person.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (person.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || person.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const allRoles = Array.from(new Set(users.map(p => p.role).filter(Boolean)));

  const handleOpenDialog = (user?: UserData) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        role: user.role || "Player",
        roles: user.roles || [user.role || "Player"],
        status: (user.status as "active" | "inactive" | "injured") || "active"
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        role: "Player",
        roles: ["Player"],
        status: "active"
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        // Update existing user
        await UserService.updateUser(editingUser.uid, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: `${formData.firstName} ${formData.lastName}`,
          role: formData.role,
          roles: formData.roles,
          status: formData.status
        });
        toast.success("User updated successfully");
      } else {
        // Create new user (Invite)
        // For manual creation, we might want to use inviteUser or a direct create if supported
        // For now, let's assume manual creation is just an invite
        await UserService.inviteUser(formData.email, formData.role, formData.roles);
        toast.success("User invited successfully");
      }
      
      await fetchUsers(); // Refresh list
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user");
    }
  };

  const handleDelete = async (uid: string) => {
    const userToDelete = users.find(u => u.uid === uid);
    if (!userToDelete) return;

    if (confirm(`Are you sure you want to delete this ${userToDelete.hasAccount ? 'user' : 'person'}?`)) {
      try {
        if (userToDelete.hasAccount) {
          await UserService.deleteUser(uid);
        } else {
          // For person without account, uid is fake "person_ID", personId is real ID
          if (userToDelete.personId) {
            await deletePersonAction(userToDelete.personId);
          }
        }
        toast.success("Deleted successfully");
        await fetchUsers();
      } catch (error) {
        console.error("Error deleting:", error);
        toast.error("Failed to delete");
      }
    }
  };

  const toggleUserSelection = (personId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else {
      newSelected.add(personId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.uid)));
    }
  };

  const handleBulkAssignSchools = async (schools: string[], teams: string[]) => {
    if (selectedUsers.size === 0) return;
    
    try {
      await Promise.all(Array.from(selectedUsers).map(async (uid) => {
        const user = users.find(u => u.uid === uid);
        if (!user) return;

        const currentSchools = user.assignedSchools || [];
        const currentTeams = user.teamIds || [];

        // Merge new assignments with existing ones
        const newSchools = Array.from(new Set([...currentSchools, ...schools]));
        const newTeams = Array.from(new Set([...currentTeams, ...teams]));

        await UserService.updateUser(uid, { 
          assignedSchools: newSchools,
          teamIds: newTeams
        });
      }));
      await fetchUsers();
      setSelectedUsers(new Set());
    } catch (error) {
      console.error("Error assigning schools/teams:", error);
      throw error;
    }
  };

  const handleBulkChangeRole = async (role: string) => {
    // Implementation for bulk role change if needed
    console.log("Bulk change role not implemented yet");
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedUsers.size === 0) return;
    
    try {
      await Promise.all(Array.from(selectedUsers).map(async (uid) => {
        await UserService.updateUser(uid, { status: status as any });
      }));
      await fetchUsers();
      setSelectedUsers(new Set());
      toast.success(`Updated status for ${selectedUsers.size} users`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedUsers.size} user(s)?`)) {
      try {
        await Promise.all(Array.from(selectedUsers).map(uid => handleDelete(uid)));
        setSelectedUsers(new Set());
      } catch (error) {
        console.error("Error deleting users:", error);
        throw error;
      }
    }
  };

  const handleBulkInvite = async () => {
    // Implementation for bulk invite if needed
    console.log("Bulk invite not implemented yet");
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserCog className="h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage system access, roles, and user accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-8 px-3 text-sm">{users.length} Total Users</Badge>
          <Badge variant="secondary" className="h-8 px-3 text-sm">{users.filter(p => p.status === 'active').length} Active</Badge>
          <div className="flex gap-1 border border-border rounded-lg p-1 ml-2">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4 mr-2" />
              Users
            </Button>
            <Button
              variant={viewMode === 'matrix' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('matrix')}
              className="h-8 px-3"
            >
              <Grid3x3 className="h-4 w-4 mr-2" />
              Permissions
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'matrix' ? (
        <PermissionsMatrix />
      ) : (
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Roles</SelectItem>
                  {allRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" /> Add User
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsInviteDialogOpen(true)}
              >
                Invite User
              </Button>
            </div>
          </div>

          {/* Bulk Actions Toolbar */}
          <BulkActionsToolbar 
            selectedCount={selectedUsers.size}
            onClearSelection={() => setSelectedUsers(new Set())}
            onBulkAssignSchools={handleBulkAssignSchools}
            onBulkChangeRole={handleBulkChangeRole}
            onBulkChangeStatus={handleBulkStatusChange}
            onBulkDelete={handleBulkDelete}
            onBulkInvite={handleBulkInvite}
          />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assignments</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Loading users...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.uid)}
                        onChange={() => toggleUserSelection(user.uid)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                          {user.profileImageUrl ? (
                            <Image src={user.profileImageUrl} alt={user.firstName} width={40} height={40} className="object-cover h-full w-full" />
                          ) : (
                            <Users className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {user.displayName || `${user.firstName} ${user.lastName}`}
                            {!user.hasAccount && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1">No Account</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{user.email || 'No email'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((r, idx) => (
                            <Badge 
                              key={idx}
                              variant={r === user.role ? 'default' : 'secondary'}
                              className={r === user.role ? 'border border-primary' : ''}
                            >
                              {r}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant={user.role === 'Admin' ? 'destructive' : 'secondary'}>
                            {user.role}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {user.assignedSchools && user.assignedSchools.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="font-semibold">{user.assignedSchools.length}</span> Schools
                          </div>
                        )}
                        {user.teamIds && user.teamIds.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="font-semibold">{user.teamIds.length}</span> Teams
                          </div>
                        )}
                        {(!user.assignedSchools?.length && !user.teamIds?.length) && (
                          <span className="text-xs text-muted-foreground italic">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {(user as any).lastLogin ? new Date((user as any).lastLogin).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {!user.hasAccount && (
                             <DropdownMenuItem onClick={() => {
                               setFormData({ ...formData, email: user.email, role: user.role });
                               setIsInviteDialogOpen(true);
                             }}>
                              <Mail className="mr-2 h-4 w-4" /> Invite User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleOpenDialog(user)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user.uid)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      )}

      <InviteUserDialog 
        open={isInviteDialogOpen} 
        onOpenChange={(open) => {
          setIsInviteDialogOpen(open);
          if (!open) fetchUsers(); // Refresh on close in case invited
        }}
      />

      <EnhancedUserEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={editingUser}
        onSave={async (data) => {
          try {
            if (editingUser) {
              await UserService.updateUser(editingUser.uid, data);
              toast.success("User updated successfully");
            } else {
              // For new users, we might want to use inviteUser or create a placeholder
              // If we have an email, invite them
              if (data.email) {
                await UserService.inviteUser(data.email, data.role || 'Player', data.roles);
                toast.success("User invited successfully");
              } else {
                // If no email (e.g. just a person record), we might need a different flow
                // But EnhancedUserEditDialog enforces email for new users
                toast.error("Email is required for new users");
              }
            }
            await fetchUsers();
          } catch (error) {
            console.error("Error saving user:", error);
            toast.error("Failed to save user");
            throw error;
          }
        }}
      />
    </div>
  );
}
