'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Shared EmptyState component — glassmorphic card with icon, title, description,
 * and optional action button. Extracted from the proven MatchesClient.tsx pattern.
 *
 * Usage:
 *   <EmptyState
 *     icon={<Users className="h-8 w-8" />}
 *     title="No players found"
 *     description="Add players to your squad to get started."
 *     action={{ label: 'Add Player', onClick: () => router.push('/players/add') }}
 *   />
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center',
        'rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm',
        'px-8 py-14 space-y-4',
        className ?? '',
      ]
        .join(' ')
        .trim()}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        <Button
          size="sm"
          variant="outline"
          onClick={action.onClick}
          className="mt-2 text-xs"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * ErrorState — used in error.tsx route segments.
 * Shows a red-tinted empty state with an error message and reset button.
 */
export function ErrorState({
  error,
  reset,
  title = 'Something went wrong',
}: {
  error?: Error;
  reset?: () => void;
  title?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-4">
      <EmptyState
        icon={<AlertCircle className="h-7 w-7 text-destructive" />}
        title={title}
        description={error?.message ?? 'An unexpected error occurred. Please try again.'}
        action={
          reset
            ? {
                label: 'Try again',
                onClick: reset,
              }
            : undefined
        }
      />
      {reset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="mt-3 gap-2 text-muted-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reload
        </Button>
      )}
    </div>
  );
}
