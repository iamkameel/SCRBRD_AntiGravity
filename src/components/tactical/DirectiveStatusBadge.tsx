'use client';

import { Badge } from '@/components/ui/badge';
import type { DirectiveStatus } from '@/types/tacticalDirectives';

const STATUS_STYLE: Record<DirectiveStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground border-transparent',
  QUEUED: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  TRANSMITTED: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  DELIVERED: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  VIEWED: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  MODIFIED: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  DISMISSED: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  ACTIVE: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  COMPLETED: 'bg-muted text-muted-foreground border-transparent',
  SUPERSEDED: 'bg-muted text-muted-foreground border-transparent line-through',
  EXPIRED: 'bg-muted text-muted-foreground border-transparent',
  EXPIRED_BEFORE_DELIVERY: 'bg-muted text-muted-foreground border-transparent',
  OUTCOME_ANALYSED: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
};

const STATUS_LABEL: Record<DirectiveStatus, string> = {
  DRAFT: 'Draft',
  QUEUED: 'Queued',
  TRANSMITTED: 'Sent',
  DELIVERED: 'Delivered',
  VIEWED: 'Seen',
  ACCEPTED: 'Accepted',
  MODIFIED: 'Modified',
  DISMISSED: 'Dismissed',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  SUPERSEDED: 'Superseded',
  EXPIRED: 'Expired',
  EXPIRED_BEFORE_DELIVERY: 'Expired (unseen)',
  OUTCOME_ANALYSED: 'Analysed',
};

export function DirectiveStatusBadge({ status }: { status: DirectiveStatus }) {
  return (
    <Badge variant="outline" className={STATUS_STYLE[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
