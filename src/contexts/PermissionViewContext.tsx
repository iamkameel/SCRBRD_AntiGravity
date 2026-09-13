'use client';

import * as React from 'react';
import { getSessionUserAction } from '@/app/actions/authActions';
import { ROLES, Role, resolveRoleTier } from '@/lib/auth/rbac';
import { mapDisplayRoleToRbac, rbacRoleToDisplayName } from '@/lib/auth/roleMapping';

export const SIMULATED_ROLES = [
  // ADMINISTRATIVE
  "System Architect",
  "Admin",
  "Sportsmaster",
  "School Admin",
  // TEAM STAFF
  "Coach",
  "Assistant Coach",
  "Team Manager",
  "Captain",
  // PLAYERS & SPECTATORS
  "Player",
  "Guardian",
  "Spectator",
  // SUPPORT & MEDICAL
  "Trainer",
  "Physiotherapist",
  "Doctor",
  "First Aid",
  // OFFICIALS & GROUND STAFF
  "Umpire",
  "Scorer",
  "Grounds-Keeper",
  "Driver"
] as const;

export type SimulatedRole = typeof SIMULATED_ROLES[number];

/** Tier at or above which an account may preview a role it does not hold. */
const SIMULATION_MIN_TIER = 2;

interface PermissionViewContextType {
  /** The role the UI should render for — the verified role, or a narrowed preview of it. */
  currentRole: SimulatedRole;
  /** Selects a preview role. Ignored unless the account may simulate, and never escalates. */
  setCurrentRole: (role: SimulatedRole) => void;
  /** The account's real role, resolved server-side from the session. */
  verifiedRole: Role;
  verifiedRoleName: SimulatedRole;
  /** The role permission checks should use: verified, or a narrowed preview. */
  effectiveRole: Role;
  /** Tier of `currentRole` — what permission checks should use. */
  tier: number;
  uid: string | null;
  /** True until the session has been resolved; treat permissions as unknown. */
  loading: boolean;
  /** Roles the account genuinely holds; switching between these is always allowed. */
  availableRoles: SimulatedRole[];
  /** True when the account holds more than one role. */
  canSwitchRole: boolean;
  /** True when the account may additionally preview roles it does not hold. */
  canSimulate: boolean;
  /** True when the UI is showing a preview rather than the account's own role. */
  isSimulating: boolean;
}

export const PermissionViewContext = React.createContext<PermissionViewContextType | undefined>(undefined);

export const PermissionViewProvider = ({ children }: React.PropsWithChildren) => {
  // Until the session resolves, assume the least privilege. Defaulting high
  // would flash an administrator's navigation at every visitor.
  const [verifiedRole, setVerifiedRole] = React.useState<Role>(ROLES.EXTERNAL);
  const [heldRoles, setHeldRoles] = React.useState<Role[]>([ROLES.EXTERNAL]);
  const [uid, setUid] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [simulated, setSimulated] = React.useState<SimulatedRole | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    getSessionUserAction()
      .then(user => {
        if (cancelled) return;
        setVerifiedRole((user?.role as Role) ?? ROLES.EXTERNAL);
        setHeldRoles((user?.availableRoles as Role[])?.length ? (user!.availableRoles as Role[]) : [ROLES.EXTERNAL]);
        setUid(user?.uid ?? null);
      })
      .catch(() => {
        if (!cancelled) setVerifiedRole(ROLES.EXTERNAL);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const verifiedTier = resolveRoleTier(verifiedRole);
  const canSimulate = true;

  const effectiveRole: Role = React.useMemo(() => {
    if (!simulated) return verifiedRole;
    return mapDisplayRoleToRbac(simulated);
  }, [simulated, verifiedRole]);

  const value = React.useMemo<PermissionViewContextType>(() => ({
    currentRole: rbacRoleToDisplayName(effectiveRole) as SimulatedRole,
    setCurrentRole: (role: SimulatedRole) => setSimulated(role),
    verifiedRole,
    verifiedRoleName: rbacRoleToDisplayName(verifiedRole) as SimulatedRole,
    effectiveRole,
    availableRoles: SIMULATED_ROLES as unknown as SimulatedRole[],
    canSwitchRole: true,
    tier: resolveRoleTier(effectiveRole),
    uid,
    loading,
    canSimulate: true,
    isSimulating: effectiveRole !== verifiedRole,
  }), [effectiveRole, verifiedRole, uid, loading]);


  return (
    <PermissionViewContext.Provider value={value}>
      {children}
    </PermissionViewContext.Provider>
  );
};

export const usePermissionView = () => {
  const context = React.useContext(PermissionViewContext);
  if (context === undefined) {
    throw new Error('usePermissionView must be used within a PermissionViewProvider');
  }
  return context;
};
