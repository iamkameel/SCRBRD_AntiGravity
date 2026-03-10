/**
 * Match State Badge Component
 * 
 * Displays match state with appropriate styling and icons
 */

import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  ClipboardCheck, 
  Play, 
  Coffee, 
  CheckCircle2, 
  XCircle, 
  Clock 
} from 'lucide-react';
import { MatchState, STATE_LABELS, STATE_BADGE_VARIANTS } from '@/lib/matchStates';

interface MatchStateBadgeProps {
  state: MatchState;
  className?: string;
}

const STATE_ICONS = {
  SCHEDULED: Calendar,
  TEAM_SELECTION: Users,
  PRE_MATCH: ClipboardCheck,
  LIVE: Play,
  INNINGS_BREAK: Coffee,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
  POSTPONED: Clock,
} as const;

export function MatchStateBadge({ state, className }: MatchStateBadgeProps) {
  const Icon = STATE_ICONS[state];
  const variant = STATE_BADGE_VARIANTS[state];
  const label = STATE_LABELS[state];
  
  return (
    <Badge variant={variant} className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}
