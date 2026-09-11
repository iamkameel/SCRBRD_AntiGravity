/**
 * Skeleton loading state for /matches/[id]/manage
 */
export default function MatchManageLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-muted" />
          <div className="space-y-1.5">
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="h-3 w-32 rounded bg-muted/60" />
          </div>
          <div className="ml-auto h-9 w-28 rounded-full bg-muted" />
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
        {/* Tab bar skeleton */}
        <div className="flex gap-2">
          {[100, 80, 90, 76, 84].map((w, i) => (
            <div key={i} className="h-9 rounded-full bg-muted" style={{ width: `${w}px` }} />
          ))}
        </div>

        {/* Score card skeleton */}
        <div className="rounded-2xl border border-border/30 bg-card/60 p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-14 w-40 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted/60" />
            </div>
            <div className="h-14 w-40 rounded bg-muted" />
          </div>
          <div className="grid grid-cols-4 gap-4 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl bg-muted/40 p-4 h-20" />
            ))}
          </div>
        </div>

        {/* AI panel skeleton */}
        <div className="rounded-2xl border border-border/30 bg-card/60 p-6 space-y-4">
          <div className="h-5 w-56 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted/40" />
          <div className="h-3 w-3/4 rounded bg-muted/40" />
          <div className="h-3 w-1/2 rounded bg-muted/40" />
        </div>
      </div>
    </div>
  );
}
