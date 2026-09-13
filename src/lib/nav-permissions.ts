import type { Module } from '@/lib/auth/rbac';

export const navKeyToModuleMap: Record<string, Module> = {
  // Match Operations
  'dashboard': 'dashboard',
  'operating-system': 'operatingsystem',
  'sports-reports': 'analytics',
  'scouting-dossier': 'talent',
  'scoreboard-calculators': 'scoring',
  'fixtures': 'matches',
  'medical': 'medical',
  'matches': 'matches',
  'matches-hub': 'matches',
  'live-scoring': 'scoring',
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
  'multi-sport-platform': 'competitions',
  'swimming-gala': 'competitions',
  'athletics-meet': 'competitions',
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
  'system-architect-hub': 'settings',
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
