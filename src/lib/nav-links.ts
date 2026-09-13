import type { LucideIcon } from 'lucide-react';
import {
  Shield, Users, CalendarDays, ListChecks, Trophy, Sparkles, UsersRound,
  Home, Settings, FilePenLine, UserCheck, Tractor, UserCog, Activity,
  Truck, Wallet, Handshake, BookOpen, HelpCircle, Presentation, Dumbbell,
  ClipboardList, Eye, Layers, School as SchoolIcon, MapPin, Shovel,
  Crosshair, GitCompareArrows, GraduationCap, BarChart3, Medal,
  Calendar, Users2, Database, CircleHelp, Target, Terminal, MessageSquare,
  Waves, Flag, Tv, Calculator, Newspaper, Crown
} from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
  key: string;
  badge?: string | number;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  links: NavLink[];
  key: string;
  defaultOpen?: boolean;
  highlighted?: boolean; // For special styling (green border)
  accentColor?: string;
}

// Dashboard (always visible, not in a group)
export const dashboardLink: NavLink = {
  href: '/home',
  label: 'Dashboard',
  icon: Home,
  key: 'dashboard'
};

export const navGroups: NavGroup[] = [
  {
    id: 'school-cricket-os',
    label: 'School Cricket OS',
    icon: Sparkles,
    key: 'group-school-cricket-os',
    defaultOpen: true,
    highlighted: true,
    accentColor: '#8b5cf6', // Violet
    links: [
      { href: '/operating-system', label: 'Canonical OS Hub', icon: Sparkles, key: 'operating-system', badge: 'OS' },
    ]
  },
  {
    id: 'teams-people',
    label: 'Teams & People',
    icon: Users2,
    key: 'group-teams-people',
    defaultOpen: true,
    accentColor: '#6366f1', // Indigo
    links: [
      { href: '/teams', label: 'Team Directory', icon: Shield, key: 'teams' },
      { href: '/players', label: 'People', icon: UsersRound, key: 'people' },
      { href: '/schools', label: 'Schools', icon: SchoolIcon, key: 'schools' },
      { href: '/inter-house', label: 'Inter-House Cricket', icon: Shield, key: 'inter-house', badge: 'HOUSE' },
      { href: '/director', label: 'Director Command', icon: Crown, key: 'director-command' },
      { href: '/browse-leagues', label: 'Leagues', icon: Trophy, key: 'competitions' },
      { href: '/browse-divisions', label: 'Divisions', icon: Layers, key: 'divisions' },
      { href: '/umpire-profiles', label: 'Umpire Profiles', icon: UserCheck, key: 'umpire-profiles' },
      { href: '/suggest-role', label: 'Suggest Role (AI)', icon: Sparkles, key: 'suggest-role' },
    ]
  },
  {
    id: 'sports-engines',
    label: 'Sport Engines',
    icon: Waves,
    key: 'group-sports-engines',
    defaultOpen: true,
    accentColor: '#10b981', // Emerald
    links: [
      { href: '/sports/multi-sport', label: 'Multi-Sport Platform', icon: Layers, key: 'multi-sport-platform' },
      { href: '/swimming', label: 'Swimming Gala Engine', icon: Waves, key: 'swimming-gala' },
      { href: '/athletics', label: 'Athletics Track & Field', icon: Flag, key: 'athletics-meet' },
      { href: '/media', label: 'Broadcast & Media', icon: Tv, key: 'broadcast-media' },
    ]
  },
  {
    id: 'matches',
    label: 'Matches',
    icon: Crosshair,
    key: 'group-matches',
    defaultOpen: false,
    accentColor: '#f43f5e', // Rose / Red
    links: [
      { href: '/fixtures', label: 'Match Fixtures', icon: CalendarDays, key: 'matches' },
      { href: '/matches', label: 'Matches Hub', icon: Trophy, key: 'matches-hub' },
      { href: '/matches/add', label: 'Live Scoring', icon: Activity, key: 'live-scoring', badge: 'LIVE' },
      { href: '/match-calculators', label: 'Match Calculators & DLS', icon: Calculator, key: 'match-calculators' },
      { href: '/umpire-review', label: 'Umpire Review', icon: Eye, key: 'umpire-review' },
      { href: '/fixtures/multi-create', label: 'Multi-Fixture Tool', icon: Sparkles, key: 'multi-fixture-tool' },
      { href: '/match-operations', label: 'Match Operations', icon: FilePenLine, key: 'match-operations' },
      { href: '/seasons', label: 'Seasons', icon: Calendar, key: 'seasons' },
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    key: 'group-analytics',
    defaultOpen: false,
    accentColor: '#f59e0b', // Amber / Gold
    links: [
      { href: '/reports', label: 'School Reports', icon: Newspaper, key: 'sports-reports' },
      { href: '/analytics', label: 'Analysis Dashboard', icon: BarChart3, key: 'analytics-dashboard' },
      { href: '/analysis', label: 'Analysis Hub', icon: BarChart3, key: 'analysis-hub' },
      { href: '/scouting', label: 'Scouting Hub', icon: Sparkles, key: 'scouting' },
      { href: '/scouting/dossier', label: 'Tactical Dossier', icon: Shield, key: 'scouting-dossier' },
      { href: '/recap', label: 'Broadcast Recap', icon: Newspaper, key: 'broadcast-recap' },
      { href: '/results', label: 'Head-to-Head', icon: GitCompareArrows, key: 'head-to-head' },
      { href: '/rankings', label: 'Rankings', icon: BarChart3, key: 'rankings' },
      { href: '/awards', label: 'Awards', icon: Medal, key: 'awards' },
      { href: '/spider-chart', label: 'Performance Analysis', icon: Crosshair, key: 'performance-analysis' },
    ]
  },
  {
    id: 'coaching',
    label: 'Coaching',
    icon: Target,
    key: 'group-coaching',
    defaultOpen: false,
    accentColor: '#0284c7', // Sky Blue
    links: [
      { href: '/planner', label: 'Session Planner', icon: ClipboardList, key: 'session-planner' },
      { href: '/drills', label: 'Drill Library', icon: Dumbbell, key: 'drill-library' },
      { href: '/coaches', label: 'Player Development', icon: Target, key: 'player-development' },
    ]
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: Tractor,
    key: 'group-operations',
    defaultOpen: false,
    accentColor: '#8b5cf6', // Violet
    links: [
      { href: '/fields', label: 'Fields', icon: MapPin, key: 'fields' },
      { href: '/facilities', label: 'Turf & Facility Engine', icon: Shovel, key: 'facilities-engine' },
      { href: '/equipment', label: 'Equipment', icon: Tractor, key: 'equipment' },
      { href: '/transport', label: 'Transport', icon: Truck, key: 'transport' },
      { href: '/sponsors', label: 'Sponsors', icon: Handshake, key: 'sponsors' },
      { href: '/financials', label: 'Financials', icon: Wallet, key: 'financials' },
      { href: '/inbox', label: 'Inbox & Newsfeed', icon: MessageSquare, key: 'inbox-newsfeed' },
    ]
  },
  {
    id: 'administration',
    label: 'Administration',
    icon: Settings,
    key: 'group-administration',
    defaultOpen: false,
    highlighted: true,
    accentColor: '#64748b', // Slate
    links: [
      { href: '/admin/system', label: 'System Architect Hub', icon: Shield, key: 'system-architect-hub' },
      { href: '/user-management', label: 'User Management', icon: UserCog, key: 'user-management' },
      { href: '/data-management', label: 'Data Management', icon: Database, key: 'data-management' },
      { href: '/audit-log', label: 'Audit Log', icon: FilePenLine, key: 'audit-log' },
      { href: '/strategic-calendar', label: 'Strategic Calendar', icon: Calendar, key: 'strategic-calendar' },
      { href: '/roles', label: 'User Roles', icon: UserCheck, key: 'user-roles' },
      { href: '/rulebook', label: 'Rule Book', icon: BookOpen, key: 'rulebook' },
      { href: '/testing-arena', label: 'Testing Arena', icon: Terminal, key: 'testing-arena' },
      { href: '/pitch-deck', label: 'Pitch Deck', icon: Presentation, key: 'pitch-deck' },
      { href: '/features', label: 'Features', icon: ListChecks, key: 'features' },
      { href: '/help', label: 'Help & Onboarding', icon: CircleHelp, key: 'help-onboarding' },
    ]
  }
];

// Legacy export for backwards compatibility (flatten all groups)
export const navLinks: NavLink[] = [
  dashboardLink,
  ...navGroups.flatMap(group => group.links)
];
