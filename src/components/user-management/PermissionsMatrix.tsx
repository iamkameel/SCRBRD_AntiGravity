"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

import { ALL_ROLES, USER_ROLES } from "@/lib/roles";

const PERMISSION_GROUPS = {
  'Teams & People': [
    'View Teams',
    'Edit Teams',
    'View Players',
    'Edit Players',
    'Manage Coaches',
  ],
  'Matches & Scoring': [
    'View Matches',
    'Score Matches',
    'Edit Match Results',
    'Approve Scorecards',
  ],
  'Administration': [
    'Manage Users',
    'View Audit Logs',
    'Manage Roles',
    'System Settings',
  ],
  'Operations': [
    'Manage Equipment',
    'Manage Transport',
    'View Financials',
    'Manage Fields',
  ],
} as const;

// Mock permission matrix - in a real app this would come from database
const PERMISSIONS_MATRIX: Record<string, string[]> = {
  [USER_ROLES.SYSTEM_ARCHITECT]: Object.values(PERMISSION_GROUPS).flat(),
  [USER_ROLES.ADMIN]: [
    'View Teams', 'Edit Teams', 'View Players', 'Edit Players', 'Manage Coaches',
    'View Matches', 'Edit Match Results', 'Approve Scorecards',
    'Manage Users', 'View Audit Logs',
    'Manage Equipment', 'Manage Transport', 'View Financials', 'Manage Fields',
  ],
  [USER_ROLES.SPORTSMASTER]: [
    'View Teams', 'Edit Teams', 'View Players', 'Edit Players', 'Manage Coaches',
    'View Matches', 'Edit Match Results', 'Approve Scorecards',
    'Manage Equipment', 'Manage Transport', 'View Financials', 'Manage Fields',
  ],
  [USER_ROLES.SCHOOL_ADMIN]: [
    'View Teams', 'Edit Teams', 'View Players', 'Manage Coaches',
    'View Matches', 'View Audit Logs', 'View Financials',
  ],
  [USER_ROLES.COACH]: [
    'View Teams', 'Edit Teams', 'View Players', 'Edit Players',
    'View Matches', 'Score Matches', 'Edit Match Results',
    'Manage Equipment', 'View Financials',
  ],
  [USER_ROLES.ASSISTANT_COACH]: [
    'View Teams', 'View Players', 'Edit Players',
    'View Matches', 'Score Matches',
    'Manage Equipment',
  ],
  [USER_ROLES.TEAM_MANAGER]: [
    'View Teams', 'View Players',
    'View Matches',
    'Manage Equipment', 'Manage Transport', 'View Financials',
  ],
  [USER_ROLES.CAPTAIN]: [
    'View Teams', 'View Players',
    'View Matches', 'Score Matches',
  ],
  [USER_ROLES.PLAYER]: [
    'View Teams', 'View Players',
    'View Matches',
  ],
  [USER_ROLES.GUARDIAN]: [
    'View Teams', 'View Players',
    'View Matches',
  ],
  [USER_ROLES.SPECTATOR]: [
    'View Teams', 'View Matches',
  ],
  [USER_ROLES.TRAINER]: [
    'View Teams', 'View Players',
    'View Matches',
  ],
  [USER_ROLES.PHYSIOTHERAPIST]: [
    'View Teams', 'View Players',
    'View Matches',
  ],
  [USER_ROLES.DOCTOR]: [
    'View Teams', 'View Players',
    'View Matches',
  ],
  [USER_ROLES.FIRST_AID]: [
    'View Teams', 'View Players',
    'View Matches',
  ],
  [USER_ROLES.UMPIRE]: [
    'View Teams', 'View Players',
    'View Matches', 'Score Matches', 'Approve Scorecards',
  ],
  [USER_ROLES.SCORER]: [
    'View Teams', 'View Players',
    'View Matches', 'Score Matches',
  ],
  [USER_ROLES.GROUNDS_KEEPER]: [
    'View Matches',
    'Manage Equipment', 'Manage Fields',
  ],
  [USER_ROLES.DRIVER]: [
    'View Matches',
    'Manage Transport',
  ],
};

export function PermissionsMatrix() {
  const hasPermission = (role: string, permission: string): boolean => {
    return PERMISSIONS_MATRIX[role]?.includes(permission) || false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions Matrix</CardTitle>
        <p className="text-sm text-muted-foreground">
          Overview of role-based permissions across the system
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
              <div key={groupName} className="mb-6 last:mb-0">
                <h3 className="text-sm font-semibold mb-3 text-primary">{groupName}</h3>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-medium text-sm">Permission</th>
                        {ALL_ROLES.map(role => (
                          <th key={role} className="text-center p-3 font-medium text-sm w-32">
                            {role}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map((permission, idx) => (
                        <tr key={permission} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                          <td className="p-3 text-sm">{permission}</td>
                          {ALL_ROLES.map(role => (
                            <td key={`${role}-${permission}`} className="text-center p-3">
                              {hasPermission(role, permission) ? (
                                <div className="flex justify-center">
                                  <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Check className="h-3 w-3 text-green-600" />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-center">
                                  <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
                                    <X className="h-3 w-3 text-gray-400" />
                                  </div>
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="h-3 w-3 text-green-600" />
            </div>
            <span>Has Permission</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
              <X className="h-3 w-3 text-gray-400" />
            </div>
            <span>No Permission</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
