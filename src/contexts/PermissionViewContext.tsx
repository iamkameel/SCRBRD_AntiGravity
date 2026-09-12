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
  const canSimulate = !loading && verifiedTier <= SIMULATION_MIN_TIER;

  /**
   * Two different things share this control:
   *
   * - Switching to a role the account genuinely holds. A person can be both a
   *   coach and a parent; every one of those roles is verified, so switching
   *   between them is always allowed.
   * - Previewing a role the account does not hold. Only tier <= 2 may do this,
   *   and only *downward*: a higher tier number is lower privilege, so a
   *   preview can never grant access the account lacks.
   *
   * Authorization server-side always uses the account's most permissive role,
   * so neither case can widen what the server permits.
   */
  const effectiveRole: Role = React.useMemo(() => {
    if (!simulated) return verifiedRole;
    const candidate = mapDisplayRoleToRbac(simulated);

    if (heldRoles.includes(candidate)) return candidate;
    if (canSimulate && resolveRoleTier(candidate) >= verifiedTier) return candidate;
    return verifiedRole;
  }, [simulated, verifiedRole, verifiedTier, heldRoles, canSimulate]);

  const value = React.useMemo<PermissionViewContextType>(() => ({
    currentRole: rbacRoleToDisplayName(effectiveRole) as SimulatedRole,
    setCurrentRole: (role: SimulatedRole) => setSimulated(role),
    verifiedRole,
    verifiedRoleName: rbacRoleToDisplayName(verifiedRole) as SimulatedRole,
    effectiveRole,
    availableRoles: heldRoles.map(r => rbacRoleToDisplayName(r) as SimulatedRole),
    canSwitchRole: heldRoles.length > 1,
    tier: resolveRoleTier(effectiveRole),
    uid,
    loading,
    canSimulate,
    isSimulating: effectiveRole !== verifiedRole,
  }), [effectiveRole, verifiedRole, heldRoles, uid, loading, canSimulate]);

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
