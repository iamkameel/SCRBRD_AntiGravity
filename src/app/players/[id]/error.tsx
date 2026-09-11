'use client';

import { ErrorState } from '@/components/ui/EmptyState';

export default function PlayerDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <ErrorState
        error={error}
        reset={reset}
        title="Couldn't load player profile"
      />
    </div>
  );
}
