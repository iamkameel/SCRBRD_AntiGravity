
"use client";

import React, { useState } from 'react';
import { 
  navGroups, 
  dashboardLink, 
  type NavLink, 
  type NavGroup 
} from '@/lib/nav-links';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { LucideIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissionView, type SimulatedRole } from '@/contexts/PermissionViewContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion } from "framer-motion";

import { usePermissions } from '@/lib/auth/usePermissions';
import { Module } from '@/lib/auth/rbac';
import { GlobalSearch } from '@/components/search/GlobalSearch';

// Maps NavLink.key to the unified RBAC Module
const navKeyToModuleMap: Record<string, Module> = {
  // Match Operations
  'dashboard': 'dashboard',
  'matches': 'matches', 
  'matches-hub': 'matches',
  'live-scoring': 'matches',
  'analytics-dashboard': 'analytics',
  'strategic-calendar': 'calendar',
  'scouting': 'talent',
  'ai-scouting': 'talent',
  'umpire-review': 'matches',
  'head-to-head': 'analytics',
  'analysis-hub': 'analytics',

  // Participants
  'teams': 'squad',
  'people': 'profiles',
  'umpire-profiles': 'staff',
  'suggest-role': 'management',
  'schools': 'school',
  'director-command': 'school',

  // League Structure
  'competitions': 'competitions',
  'multi-fixture-tool': 'matches',
  'seasons': 'leagues',
  'divisions': 'leagues',
  'rankings': 'powerindex',
  'awards': 'rewards',

  // Communications
  'inbox-newsfeed': 'dashboard',
  'broadcast-media': 'media',
  'broadcast-recap': 'media',

  // Coaching & Training
  'session-planner': 'training',
  'drill-library': 'skills',
  'player-development': 'passport',
  'performance-analysis': 'analytics',

  // Resources & Logistics
  'fields': 'fields',
  'facilities-engine': 'fields',
  'equipment': 'logistics',
  'transport': 'logistics',

  // Finance & Partnerships
  'sponsors': 'advertising',
  'financials': 'management',

  // System Administration
  'user-management': 'settings',
  'data-management': 'management',
  'testing-arena': 'settings',
  'audit-log': 'settings',
  'pitch-deck': 'pitchdeck',

  // Reference
  'features': 'settings',
  'user-roles': 'settings',
  'rulebook': 'rulebook',
  'help-onboarding': 'myprofile'
};

const SidebarNav = () => {
  const pathname = usePathname();
  const { canAccess } = usePermissions();
  
  // Track which groups are open (use group ID as key)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // Initialize with defaultOpen values and check if current path is in group
    const initial: Record<string, boolean> = {};
    navGroups.forEach(group => {
      const hasActivePath = group.links.some(link => pathname.startsWith(link.href));
      initial[group.id] = group.defaultOpen || hasActivePath;
    });
    return initial;
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const isLinkAllowed = (key: string) => {
    const navModule = navKeyToModuleMap[key];
    if (!navModule) return false; // Fail secure if unmapped
    return canAccess(navModule);
  };
  
  const isLinkActive = (href: string) => {
    if (href === '/home') return pathname === '/' || pathname === '/home';
    return pathname.startsWith(href);
  };

  const filterGroup = (group: NavGroup): NavGroup | null => {
    const filteredLinks = group.links.filter(link => isLinkAllowed(link.key));
    if (filteredLinks.length === 0) return null;
    return { ...group, links: filteredLinks };
  };

  const renderLink = (link: NavLink, isInGroup = false) => {
    const active = isLinkActive(link.href);
    const Component = isInGroup ? SidebarMenuSubButton : SidebarMenuButton;
    const Wrapper = isInGroup ? SidebarMenuSubItem : SidebarMenuItem;

    return (
      <Wrapper key={link.href}>
        <Component asChild isActive={active}>
          <Link
            href={link.disabled ? '#' : link.href}
            className={cn(
              link.disabled && 'opacity-50 cursor-not-allowed',
              !isInGroup && 'font-medium',
              'relative overflow-hidden rounded-md hover:bg-primary/5 transition-colors duration-200'
            )}
            aria-disabled={link.disabled}
            tabIndex={link.disabled ? -1 : undefined}
          >
            {active && (
              <motion.div
                layoutId="sidebar-active-indicator"
                className="absolute inset-0 bg-primary/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
            <motion.div
              className="flex items-center w-full relative z-10"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {link.icon && React.createElement(link.icon as LucideIcon, { 
                className: isInGroup ? "size-3.5 mr-2" : "size-4 mr-2" 
              })}
              <span>{link.label}</span>
              {link.badge && (
                <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  {link.badge}
                </span>
              )}
            </motion.div>
          </Link>
        </Component>
      </Wrapper>
    );
  };

  const renderGroup = (group: NavGroup) => {
    const filteredGroup = filterGroup(group);
    if (!filteredGroup) return null;

    const isOpen = openGroups[group.id];
    const hasActivePath = filteredGroup.links.some(link => isLinkActive(link.href));

    return (
      <Collapsible
        key={group.id}
        open={isOpen}
        onOpenChange={() => toggleGroup(group.id)}
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              className={cn(
                "w-full font-semibold",
                hasActivePath && "text-primary"
              )}
            >
              {React.createElement(group.icon as LucideIcon, { className: "size-4" })}
              <span>{group.label}</span>
              <ChevronDown 
                className={cn(
                  "ml-auto size-4 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {filteredGroup.links.map(link => renderLink(link, true))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  };

  // Filter dashboard link
  const showDashboard = isLinkAllowed(dashboardLink.key);

  return (
    <SidebarMenu>
      <SidebarMenuItem className="mb-4">
        <GlobalSearch />
      </SidebarMenuItem>

      {/* Dashboard - always at top, not in a group */}
      {showDashboard && renderLink(dashboardLink)}
      
      {showDashboard &&  <SidebarSeparator className="my-2" />}
      
      {/* Grouped navigation */}
      {navGroups.map(renderGroup)}
    </SidebarMenu>
  );
};

export default SidebarNav;
