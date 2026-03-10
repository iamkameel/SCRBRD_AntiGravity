"use client";

import { useState, useMemo, useOptimistic, useTransition, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { 
  User, Mail, Phone, Shield, School, Search, Filter, 
  Grid3x3, List, Plus, Trash2, Edit, MoreVertical,
  Download, Upload, X, BarChart3, Columns, Loader2,
  UserCheck,
  Building
} from "lucide-react";
import { ListPeopleData } from "@/generated/dataconnect";
import { motion, AnimatePresence } from "framer-motion";
import { ROLE_GROUPS } from "@/lib/roles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Use the generated type for Person
type GQLPerson = ListPeopleData['people'][0];

interface PeopleClientProps {
  initialPeople: GQLPerson[];
  userRole?: string;
}

type ViewMode = 'grid' | 'list' | 'stats' | 'board';

export default function PeopleClient({ initialPeople, userRole = 'Player' }: PeopleClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedOrgId, setSelectedOrgId] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Helper to extract primary role and organisation from the relational structure
  const getPersonMeta = (person: GQLPerson) => {
    const assignments = person.userAccount_on_person?.userRoleAssignments_on_userAccount || [];
    const primaryAssignment = assignments[0];
    return {
      role: primaryAssignment?.systemRole?.label || 'Player',
      organisationName: primaryAssignment?.organisation?.name || 'Independent',
      organisationId: primaryAssignment?.organisation?.id || 'none',
      allRoles: assignments.map(a => a.systemRole?.label).filter(Boolean) as string[],
      allOrgIds: assignments.map(a => a.organisation?.id).filter(Boolean) as string[]
    };
  };

  // Check permissions based on user role
  const canCreate = ['Admin', 'System Architect', 'Sportsmaster', 'Coach'].includes(userRole);
  const canEdit = ['Admin', 'System Architect', 'Sportsmaster', 'Coach', 'Team Manager'].includes(userRole);
  const canDelete = ['Admin', 'System Architect'].includes(userRole);

  // Unique Organisations from the joined data
  const organisations = useMemo(() => {
    const orgMap = new Map<string, string>();
    initialPeople.forEach(p => {
      const meta = getPersonMeta(p);
      if (meta.organisationId !== 'none' && meta.organisationName) {
        orgMap.set(meta.organisationId, meta.organisationName);
      }
    });
    return Array.from(orgMap.entries()).map(([id, name]) => ({ id, name }));
  }, [initialPeople]);

  // Filter and search logic
  const filteredPeople = useMemo(() => {
    return initialPeople.filter(person => {
      const meta = getPersonMeta(person);
      
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchLower) ||
        person.email?.toLowerCase().includes(searchLower) ||
        person.phone?.toLowerCase().includes(searchLower);

      // Role filter (matches any assigned role)
      const matchesRole = selectedRole === "all" || meta.allRoles.includes(selectedRole);

      // Organisation filter
      const matchesOrg = selectedOrgId === "all" || meta.allOrgIds.includes(selectedOrgId);

      return matchesSearch && matchesRole && matchesOrg;
    });
  }, [initialPeople, searchQuery, selectedRole, selectedOrgId]);

  // Group people by their primary role
  const groupedByRole = useMemo(() => {
    return filteredPeople.reduce((acc, person) => {
      const meta = getPersonMeta(person);
      const role = meta.role;
      if (!acc[role]) acc[role] = [];
      acc[role].push(person);
      return acc;
    }, {} as Record<string, GQLPerson[]>);
  }, [filteredPeople]);

  const handleDelete = async (personId: string) => {
    if (!confirm('Are you sure you want to delete this person from the V4 engine?')) return;
    toast.error("Deletion not yet implemented for V4 relational model");
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Player': return 'default';
      case 'Coach': return 'secondary';
      case 'Admin': return 'destructive';
      case 'Scorer': return 'outline';
      default: return 'outline';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3 tracking-tighter font-heading italic">
            <UserCheck className="h-10 w-10 text-primary" />
            Registry (V4)
          </h1>
          <p className="text-muted-foreground mt-2 italic font-medium">
            Centralized Relational Identity Directory
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <Button asChild className="font-heading italic bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/20 border-0">
              <Link href="/people/add">
                <Plus className="h-4 w-4 mr-2" />
                Enroll Person
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-6 bg-card/50 backdrop-blur-md border-primary/10 shadow-xl rounded-3xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search */}
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search registry by name, email, or identifiers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-background/50 border-primary/10 rounded-2xl text-lg focus:ring-primary/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 rounded-2xl px-6 font-heading italic"
            >
              <Filter className="h-4 w-4 mr-2" />
              Criteria
              {(selectedRole !== "all" || selectedOrgId !== "all") && (
                <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">
                  Active
                </Badge>
              )}
            </Button>

            <div className="flex items-center gap-1 border border-primary/10 rounded-2xl p-1 bg-background/50">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={`h-10 w-10 rounded-xl ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <Grid3x3 className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={`h-10 w-10 rounded-xl ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-primary/10">
                {/* Role Filter */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Global System Role</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="h-12 rounded-xl bg-background/50 border-primary/10">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {Object.entries(ROLE_GROUPS).map(([group, roles]) => (
                        <div key={group}>
                          <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                            {group}
                          </div>
                          {roles.map(role => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Org Filter */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Primary Organisation</label>
                  <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                    <SelectTrigger className="h-12 rounded-xl bg-background/50 border-primary/10">
                      <SelectValue placeholder="All Organisations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Organisations</SelectItem>
                      {organisations.map(org => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Results View */}
      {filteredPeople.length > 0 ? (
        <div className="space-y-12">
          {viewMode === 'grid' && Object.entries(groupedByRole).map(([role, rolePeople]) => (
            <motion.div key={role} className="space-y-6" initial="hidden" animate="show" variants={container}>
              <div className="flex items-center gap-4 px-2">
                <div className="h-px flex-1 bg-primary/10" />
                <div className="flex items-center gap-2">
                   <Shield className="h-5 w-5 text-primary" />
                   <h2 className="text-xl font-heading italic font-bold tracking-tight">{role}s</h2>
                   <Badge variant="outline" className="ml-2 border-primary/20 text-primary">{rolePeople.length}</Badge>
                </div>
                <div className="h-px flex-1 bg-primary/10" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rolePeople.map((person) => {
                  const meta = getPersonMeta(person);
                  return (
                    <motion.div key={person.id} variants={item}>
                      <Card className="p-6 hover:shadow-2xl hover:border-primary/40 transition-all duration-500 group relative overflow-hidden bg-card/40 border-primary/5 rounded-3xl backdrop-blur-sm">
                        <div className="absolute top-0 right-0 p-4">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl">
                                <DropdownMenuItem asChild>
                                  <Link href={`/people/${person.id}`} className="cursor-pointer">
                                    <User className="h-4 w-4 mr-2" /> Profile
                                  </Link>
                                </DropdownMenuItem>
                                {canEdit && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/people/${person.id}/edit`} className="cursor-pointer">
                                      <Edit className="h-4 w-4 mr-2" /> Edit
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </div>

                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/10 relative z-10 overflow-hidden">
                              {person.profileImageUrl ? (
                                <img src={person.profileImageUrl} alt={person.firstName} className="w-full h-full object-cover" />
                              ) : (
                                <User className="h-10 w-10 text-primary" />
                              )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-background border border-primary/10 rounded-full p-1.5 shadow-sm z-20">
                               <Shield className="h-3 w-3 text-primary" />
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-xl font-heading italic group-hover:text-primary transition-colors">
                              {person.firstName} {person.lastName}
                            </h3>
                            <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mt-1">{meta.role}</p>
                          </div>

                          <div className="w-full space-y-2 py-4 border-y border-primary/5">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground justify-center">
                              <Building className="h-4 w-4 text-primary/40" />
                              <span className="font-medium truncate max-w-[180px]">{meta.organisationName}</span>
                            </div>
                            {person.email && (
                              <div className="flex items-center gap-3 text-sm text-muted-foreground justify-center">
                                <Mail className="h-4 w-4 text-primary/40" />
                                <span className="truncate max-w-[180px]">{person.email}</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-2">
                             <Link href={`/people/${person.id}`}>
                               <Button variant="outline" size="sm" className="rounded-full px-6 font-heading italic text-xs hover:bg-primary hover:text-primary-foreground transition-all">
                                 View Records
                               </Button>
                             </Link>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
          
          {viewMode === 'list' && (
             <Card className="rounded-3xl overflow-hidden border-primary/10 bg-card/40 backdrop-blur-sm shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary/5">
                      <tr>
                        <th className="p-6 text-left text-xs font-bold uppercase tracking-widest text-primary/60">Identity</th>
                        <th className="p-6 text-left text-xs font-bold uppercase tracking-widest text-primary/60">Global Role</th>
                        <th className="p-6 text-left text-xs font-bold uppercase tracking-widest text-primary/60">Affiliation</th>
                        <th className="p-6 text-left text-xs font-bold uppercase tracking-widest text-primary/60">Contact</th>
                        <th className="p-6 text-right text-xs font-bold uppercase tracking-widest text-primary/60">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {filteredPeople.map((person) => {
                        const meta = getPersonMeta(person);
                        return (
                          <tr key={person.id} className="group hover:bg-primary/[0.02] transition-colors">
                            <td className="p-6">
                              <Link href={`/people/${person.id}`} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/10 overflow-hidden">
                                   {person.profileImageUrl ? <img src={person.profileImageUrl} className="w-full h-full object-cover" /> : <User className="h-5 w-5 text-primary" />}
                                </div>
                                <span className="font-bold text-lg font-heading italic group-hover:text-primary transition-colors">{person.firstName} {person.lastName}</span>
                              </Link>
                            </td>
                            <td className="p-6">
                              <Badge variant={getRoleBadgeVariant(meta.role) as any} className="font-heading italic py-1 px-4 rounded-full">
                                {meta.role}
                              </Badge>
                            </td>
                            <td className="p-6">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                {meta.organisationName}
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="space-y-1">
                                <div className="text-sm font-medium">{person.email || '-'}</div>
                                <div className="text-xs text-muted-foreground">{person.phone || '-'}</div>
                              </div>
                            </td>
                            <td className="p-6 text-right">
                               <Link href={`/people/${person.id}`}>
                                 <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                                   <MoreVertical className="h-5 w-5" />
                                 </Button>
                               </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
             </Card>
          )}
        </div>
      ) : (
        <Card className="p-20 text-center border-dashed border-primary/20 bg-primary/5 rounded-[3rem]">
          <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <User className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-3xl font-heading italic font-bold mb-4">Registry Empty</h3>
          <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg italic font-medium">
            {searchQuery || selectedRole !== "all" || selectedOrgId !== "all"
              ? "The relational engine couldn't locate any identities matching these specific criteria."
              : "The V4 Relational Registry is currently awaiting its first enrollment. Enforce data integrity from day one."}
          </p>
          {canCreate && (!searchQuery && selectedRole === "all" && selectedOrgId === "all") && (
            <Button asChild size="lg" className="h-14 px-10 rounded-2xl text-lg font-heading italic shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90">
              <Link href="/people/add">
                <Plus className="h-5 w-5 mr-3" />
                Begin Enrollment
              </Link>
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
