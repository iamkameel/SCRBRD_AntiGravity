import type { LucideIcon } from 'lucide-react';
import {
  Shield, Users, CalendarDays, ListChecks, Trophy, Sparkles, UsersRound,
  Home, Settings, FilePenLine, UserCheck, Tractor, UserCog, Activity,
  Truck, Wallet, Handshake, BookOpen, HelpCircle, Presentation, Dumbbell,
  ClipboardList, Eye, Layers, School as SchoolIcon, MapPin, Shovel,
  Crosshair, GitCompareArrows, GraduationCap, BarChart3, Medal,
  Calendar, Users2, Database, CircleHelp, Target, Terminal
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
}

// Dashboard (always visible, not in a group)
export const dashboardLink: NavLink = {
  href: '/home',
  label: 'Dashboard',
  icon: Home,
  key: 'dashboard'
};

// Grouped navigation sections (matching reference design)
export const navGroups: NavGroup[] = [
  {
    id: 'match-operations',
    label: 'Match Operations',
    icon: Crosshair,
    key: 'group-match-operations',
    defaultOpen: false,
    links: [
      { href: '/fixtures', label: 'Matches', icon: CalendarDays, key: 'matches' },
      { href: '/matches/add', label: 'Live Scoring', icon: Activity, key: 'live-scoring' },
      { href: '/analytics', label: 'Analytics Dashboard', icon: BarChart3, key: 'analytics-dashboard' },
      { href: '/strategic-calendar', label: 'Strategic Calendar', icon: Calendar, key: 'strategic-calendar' },
      { href: '/scouting', label: 'Scouting Assistant', icon: Sparkles, key: 'scouting' },
      { href: '/umpire-review', label: 'Umpire Review', icon: Eye, key: 'umpire-review' },
      { href: '/results', label: 'Head-to-Head', icon: GitCompareArrows, key: 'head-to-head' },
      { href: '/analysis', label: 'Analysis Hub', icon: BarChart3, key: 'analysis-hub' },
    ]
  },
  {
    id: 'participants',
    label: 'Participants',
    icon: Users2,
    key: 'group-participants',
    defaultOpen: false,
    links: [
      { href: '/teams', label: 'Teams', icon: Shield, key: 'teams' },
      { href: '/players', label: 'People', icon: UsersRound, key: 'people' },
      { href: '/umpire-profiles', label: 'Umpire Profiles', icon: UserCheck, key: 'umpire-profiles' },
      { href: '/suggest-role', label: 'Suggest Role (AI)', icon: Sparkles, key: 'suggest-role' },
      { href: '/schools', label: 'Schools', icon: SchoolIcon, key: 'schools' },
    ]
  },
  {
    id: 'league-structure',
    label: 'League Structure',
    icon: Trophy,
    key: 'group-league-structure',
    defaultOpen: false,
    links: [
      { href: '/browse-leagues', label: 'Competitions', icon: Trophy, key: 'competitions' },
      { href: '/seasons', label: 'Seasons', icon: Calendar, key: 'seasons' },
      { href: '/browse-divisions', label: 'Divisions', icon: Layers, key: 'divisions' },
      { href: '/rankings', label: 'Rankings', icon: BarChart3, key: 'rankings' },
      { href: '/awards', label: 'Awards', icon: Medal, key: 'awards' },
    ]
  },
  {
    id: 'coaching-training',
    label: 'Coaching & Training',
    icon: GraduationCap,
    key: 'group-coaching-training',
    defaultOpen: false,
    links: [
      { href: '/planner', label: 'Session Planner', icon: ClipboardList, key: 'session-planner' },
      { href: '/drills', label: 'Drill Library', icon: Dumbbell, key: 'drill-library' },
      { href: '/coaches', label: 'Player Development', icon: Target, key: 'player-development' },
      { href: '/spider-chart', label: 'Performance Analysis', icon: Crosshair, key: 'performance-analysis' },
    ]
  },
  {
    id: 'resources-logistics',
    label: 'Resources & Logistics',
    icon: Tractor,
    key: 'group-resources-logistics',
    defaultOpen: false,
    links: [
      { href: '/fields', label: 'Fields', icon: MapPin, key: 'fields' },
      { href: '/equipment', label: 'Equipment', icon: Tractor, key: 'equipment' },
      { href: '/transport', label: 'Transport', icon: Truck, key: 'transport' },
    ]
  },
  {
    id: 'finance-partnerships',
    label: 'Finance & Partnerships',
    icon: Wallet,
    key: 'group-finance-partnerships',
    defaultOpen: false,
    links: [
      { href: '/sponsors', label: 'Sponsors', icon: Handshake, key: 'sponsors' },
      { href: '/financials', label: 'Financials', icon: Wallet, key: 'financials' },
    ]
  },
  {
    id: 'system-administration',
    label: 'System Administration',
    icon: Settings,
    key: 'group-system-administration',
    defaultOpen: false,
    highlighted: true, // Special styling
    links: [
      { href: '/user-management', label: 'User Management', icon: UserCog, key: 'user-management' },
      { href: '/data-management', label: 'Data Management', icon: Database, key: 'data-management' },
      { href: '/testing-arena', label: 'Testing Arena', icon: Terminal, key: 'testing-arena' },
      { href: '/audit-log', label: 'Audit Log', icon: FilePenLine, key: 'audit-log' },
      { href: '/pitch-deck', label: 'Pitch Deck', icon: Presentation, key: 'pitch-deck' },
    ]
  },
  {
    id: 'reference',
    label: 'Reference',
    icon: BookOpen,
    key: 'group-reference',
    defaultOpen: false,
    highlighted: true, // Green border styling
    links: [
      { href: '/features', label: 'Features', icon: ListChecks, key: 'features' },
      { href: '/roles', label: 'User Roles', icon: UserCheck, key: 'user-roles' },
      { href: '/rulebook', label: 'Rule Book', icon: BookOpen, key: 'rulebook' },
      { href: '/help', label: 'Help & Onboarding', icon: CircleHelp, key: 'help-onboarding' },
    ]
  },
];

// Legacy export for backwards compatibility (flatten all groups)
export const navLinks: NavLink[] = [
  dashboardLink,
  ...navGroups.flatMap(group => group.links)
];
