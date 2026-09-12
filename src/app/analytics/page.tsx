import { Suspense } from "react";
import { AnalyticsDashboardClient } from "@/components/analytics/AnalyticsDashboardClient";
import { D } from "@/lib/design-system";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Analytics Dashboard | SCRBRD",
  description: "Comprehensive cricket analytics and performance insights",
};

export default function AnalyticsPage() {
  return (
    <div
      className="min-h-screen pb-16"
      style={{ background: D.bg }}
    >
      <div className="max-w-7xl mx-auto px-4 pt-10 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1
              style={{
                fontFamily: D.head,
                fontWeight: 800,
                fontSize: "clamp(22px, 4vw, 34px)",
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                color: D.textPrimary,
              }}
            >
              Analytics Dashboard
            </h1>
            <p
              style={{
                fontFamily: D.body,
                fontSize: 14,
                color: D.textSecondary,
                marginTop: 6,
              }}
            >
              Comprehensive insights and performance metrics across your cricket
              programme.
            </p>
          </div>

          {/* AI badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: `${D.indigo}18`,
              border: `1px solid ${D.indigo}33`,
              borderRadius: D.xl,
              padding: "8px 16px",
              flexShrink: 0,
            }}
          >
            <Sparkles
              className="h-4 w-4"
              style={{ color: D.indigo }}
            />
            <span
              style={{
                fontFamily: D.head,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: D.indigo,
              }}
            >
              AI-Powered Insights
            </span>
          </div>
        </div>

        <Suspense fallback={<AnalyticsLoadingSkeleton />}>
          <AnalyticsDashboardClient />
        </Suspense>
      </div>
    </div>
  );
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl p-6"
            style={{ background: "#171a17", height: 100 }}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl"
            style={{ background: "#171a17", height: 280 }}
          />
        ))}
      </div>
    </div>
  );
}
