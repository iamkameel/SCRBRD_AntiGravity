"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun, ShieldCheck, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/nav-links";
import { usePermissionView, SIMULATED_ROLES, SimulatedRole } from '@/contexts/PermissionViewContext';
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ROLE_GROUPS } from '@/lib/roles';
import { D, getRoleColour } from '@/lib/design-system';

export function Header() {
  const { toggleSidebar, isMobile } = useSidebar();
  const pathname = usePathname();
  const currentPage = [...navLinks].sort((a, b) => b.href.length - a.href.length).find(link => link.href === pathname || pathname.startsWith(link.href + '/'));
  const { currentRole, setCurrentRole, canSimulate, canSwitchRole, availableRoles, isSimulating, verifiedRoleName } = usePermissionView();
  const { theme, setTheme } = useTheme();
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const roleColour = getRoleColour(currentRole);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    // UIX Spec §8.3 — TopBar 52px, High-Performance Utility Bar
    <header
      className="sticky top-0 z-40 flex items-center justify-between gap-3 px-4 sm:px-6 backdrop-blur-xl border-b transition-colors"
      style={{
        height: 80,
        background: D.surf1,
        borderColor: D.border,
        fontFamily: D.sans,
      }}
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* Mobile sidebar toggle */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden h-9 w-9 rounded-xl border" style={{ borderColor: D.border, background: D.surf2 }}>
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        )}
        {!isMobile && (
          <div className="hidden group-data-[collapsible=icon]/sidebar-wrapper:block">
            <SidebarTrigger className="h-9 w-9 rounded-xl border" style={{ borderColor: D.border, background: D.surf2 }} />
          </div>
        )}

        <button
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))}
          className="flex h-11 items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-3 sm:w-72 xl:w-96 text-sm text-muted-foreground hover:border-primary/40"
          aria-label="Search teams, matches and workspaces"
        >
          <Search size={17} className="shrink-0" />
          <span className="hidden sm:inline truncate">Search teams, matches, and more…</span>
          <span className="sm:hidden">Search</span>
          <kbd className="ml-auto hidden sm:inline rounded-md border border-border px-1.5 text-[10px]">⌘ K</kbd>
        </button>
      </div>

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* Theme Toggle Unit */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border transition-all hover:scale-105" style={{ borderColor: D.border, background: D.surf2 }}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl border-white/5 shadow-2xl" style={{ background: D.surf1 }}>
            <DropdownMenuLabel className="text-[9px] font-semibold uppercase tracking-widest opacity-50 px-4 py-2">Appearance</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-10" />
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light" className="text-sm font-medium py-2.5">Light Mode</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark" className="text-sm font-medium py-2.5">Dark Mode</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system" className="text-sm font-medium py-2.5">System Default</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Operational Role Chip — UIX Spec §8.3 */}
        {currentRole && (
          <div
            className="hidden md:flex items-center gap-2.5 rounded-full px-4 py-1.5 border shadow-sm group"
            style={{
              background: `${roleColour}10`,
              borderColor: `${roleColour}30`,
              color: roleColour,
            }}
          >
            <div
              className="rounded-full shadow-inner animate-pulse"
              style={{ width: 7, height: 7, background: roleColour }}
              aria-hidden="true"
            />
            <span className="text-xs font-medium" style={{ fontFamily: D.sans }}>
               {currentRole}
            </span>
            {isSimulating && (
              <span
                className="text-[8px] font-bold uppercase tracking-[0.12em] rounded px-1.5 py-0.5 border"
                style={{ borderColor: `${roleColour}55`, background: `${roleColour}18` }}
                title={`Previewing as ${currentRole}. Your account is ${verifiedRoleName}.`}
              >
                Preview
              </span>
            )}
          </div>
        )}

        {/* Your account */}
        {loading ? (
          <div className="h-9 w-28 rounded-xl border animate-pulse" style={{ borderColor: D.border, background: D.surf2 }} aria-hidden="true" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-4 gap-3 rounded-xl border group transition-all"
                style={{ fontFamily: D.sans, borderColor: D.border, background: D.surf2 }}
              >
                <div className="h-5 w-5 rounded-lg flex items-center justify-center font-black text-[10px] italic shadow-sm" style={{ background: D.indigo, color: '#101610' }}>
                  { (user.displayName || 'U')[0].toUpperCase() }
                </div>
                <span className="text-xs font-medium" style={{ color: D.textPrimary }}>
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-[1.5rem] p-2 shadow-2xl border-white/5" style={{ background: D.surf1 }}>
              <div className="px-4 py-4 mb-2 rounded-2xl" style={{ background: D.surf2 }}>
                  <p className="text-sm font-bold uppercase tracking-tight leading-none" style={{ fontFamily: D.sans, color: D.textPrimary }}>{user.displayName || 'Your account'}</p>
                  <p className="text-[10px] font-normal uppercase tracking-widest mt-1.5 opacity-40 truncate" style={{ color: D.textMuted }}>{user.email}</p>
              </div>
              <DropdownMenuSeparator className="opacity-10 mb-2" />
              <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-xl px-4 py-3 text-sm font-medium cursor-pointer hover:bg-black/5">Account settings</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="rounded-xl px-4 py-3 text-xs font-black uppercase tracking-tight text-rose-500 cursor-pointer hover:bg-rose-500/10">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/login')} 
            className="h-9 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest border"
            style={{ borderColor: D.border, color: D.textPrimary, background: D.surf2 }}
          >
            Sign in
          </Button>
        )}

        {/* Global Operational Switcher */}
        {(canSwitchRole || canSimulate) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="Switch role" variant="outline" size="icon" className="h-9 w-9 rounded-xl border shadow-sm transition-all hover:bg-indigo-500/10 hover:border-indigo-500/30" style={{ borderColor: D.border, background: D.surf2, color: D.indigo }}>
                <ShieldCheck className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-[1.5rem] p-2 shadow-2xl border-white/5 overflow-hidden" style={{ background: D.surf1 }}>
              <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-50 px-4 py-3">
                Switch role
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="opacity-10" />
              <div className="max-h-[60vh] overflow-y-auto pr-1">
                <DropdownMenuRadioGroup value={currentRole} onValueChange={(value) => setCurrentRole(value as SimulatedRole)}>
                    {Object.entries(ROLE_GROUPS).map(([group, groupRoles]) => {
                    const visibleRoles = canSimulate
                      ? groupRoles
                      : groupRoles.filter(r => availableRoles.includes(r as typeof availableRoles[number]));
                    if (visibleRoles.length === 0) return null;
                    return (
                        <div key={group} className="mb-2 last:mb-0">
                        <DropdownMenuLabel className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground px-4 py-2 mt-2 opacity-40">{group}</DropdownMenuLabel>
                        {visibleRoles.map(role => (
                            <DropdownMenuRadioItem key={role} value={role} className="rounded-xl px-4 py-2.5 text-xs font-bold italic uppercase tracking-tight cursor-pointer">
                                {role}
                            </DropdownMenuRadioItem>
                        ))}
                        </div>
                    );
                    })}
                </DropdownMenuRadioGroup>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
