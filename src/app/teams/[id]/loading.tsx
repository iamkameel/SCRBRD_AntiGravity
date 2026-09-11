/**
 * Skeleton loading state for /teams/[id]
 */
export default function TeamDetailLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header */}
      <div className="border-b border-border/30 bg-card/40 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="h-3 w-28 rounded bg-muted/60" />
          </div>
          <div className="ml-auto flex gap-2">
            <div className="h-9 w-20 rounded-full bg-muted/40" />
            <div className="h-9 w-28 rounded-full bg-muted" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Squad list */}
        <div className="rounded-2xl border border-border/30 bg-card/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-border/20">
            <div className="h-4 w-32 rounded bg-muted" />
          </div>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border/10 last:border-0">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-36 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted/60" />
              </div>
              <div className="h-6 w-16 rounded-full bg-muted/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
