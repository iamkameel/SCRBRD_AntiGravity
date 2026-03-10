"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, Users, ClipboardList, Eye } from "lucide-react";

type RoleDefinition = {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  permissions: string[];
  color: string;
};

const ROLES: RoleDefinition[] = [
  {
    id: "architect",
    title: "System Architect",
    icon: <Shield size={32} />,
    description: "God-tier access. Can modify core system architecture and bypass all restrictions.",
    permissions: [
      "Full root access to all system resources",
      "Direct database manipulation",
      "Override all security protocols",
      "Manage all other administrators",
      "Deploy system updates"
    ],
    color: "#000000" // Black
  },
  {
    id: "admin",
    title: "Administrator",
    icon: <Shield size={32} />,
    description: "Full system access to manage all aspects of the league.",
    permissions: [
      "Manage all users and roles",
      "Configure season settings and divisions",
      "Edit or delete any match data",
      "Access audit logs and financial reports",
      "Manage global system settings"
    ],
    color: "#ef4444" // Red
  },
  {
    id: "coach",
    title: "Coach",
    icon: <ClipboardList size={32} />,
    description: "Manages team rosters, training, and match strategy.",
    permissions: [
      "Manage team roster and player profiles",
      "Schedule training sessions",
      "Create and assign drills",
      "View detailed player analytics",
      "Submit match squads"
    ],
    color: "#3b82f6" // Blue
  },
  {
    id: "scorer",
    title: "Scorer",
    icon: <Users size={32} />, // Using Users as a placeholder for Scorer
    description: "Responsible for recording live match data.",
    permissions: [
      "Access live scoring interface for assigned matches",
      "Edit scorecards for completed matches",
      "Verify match results",
      "Generate match reports"
    ],
    color: "#f59e0b" // Amber
  },
  {
    id: "umpire",
    title: "Umpire",
    icon: <Eye size={32} />,
    description: "Officiates matches and ensures fair play.",
    permissions: [
      "View assigned match schedule",
      "Submit match reports and disciplinary notes",
      "Verify final scores with scorers",
      "Access digital rule book"
    ],
    color: "#10b981" // Emerald
  },
  {
    id: "player",
    title: "Player",
    icon: <User size={32} />,
    description: "Participates in matches and tracks personal progress.",
    permissions: [
      "View personal stats and performance history",
      "Access training schedules",
      "View team fixtures and results",
      "Update personal profile details"
    ],
    color: "#8b5cf6" // Violet
  }
];

export default function RolesPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">User Role Directory</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Understanding the permissions and responsibilities for each user type in the SCRBRD ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ROLES.map((role) => (
          <Card key={role.id} className="border-t-4" style={{ borderTopColor: role.color }}>
            <CardHeader>
              <div className="flex items-center gap-4 mb-3">
                <div 
                  className="p-3 rounded-xl"
                  style={{ 
                    backgroundColor: `${role.color}20`,
                    color: role.color 
                  }}
                >
                  {role.icon}
                </div>
                <CardTitle className="text-2xl">{role.title}</CardTitle>
              </div>
              <p className="text-muted-foreground min-h-[3rem]">
                {role.description}
              </p>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Key Permissions
                </div>
                <ul className="space-y-3">
                  {role.permissions.map((perm, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <div 
                        className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                        style={{ backgroundColor: role.color }}
                      />
                      <span>{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
