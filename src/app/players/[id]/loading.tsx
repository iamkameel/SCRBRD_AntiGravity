/**
 * Skeleton loading state for /players/[id]
 */
export default function PlayerDetailLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Hero */}
      <div className="relative h-52 bg-muted/30">
        <div className="absolute bottom-6 left-6 flex items-end gap-4">
          <div className="h-20 w-20 rounded-2xl bg-muted" />
          <div className="space-y-2 pb-1">
            <div className="h-6 w-40 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted/60" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Stat chips */}
        <div className="flex gap-3 flex-wrap">
          {[120, 100, 90, 110, 95].map((w, i) => (
            <div key={i} className="h-10 rounded-xl bg-muted/40" style={{ width: `${w}px` }} />
          ))}
        </div>

        {/* Main cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border/30 bg-card/60 p-6 h-48 space-y-3">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-8 w-16 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted/40" />
              <div className="h-3 w-3/4 rounded bg-muted/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
