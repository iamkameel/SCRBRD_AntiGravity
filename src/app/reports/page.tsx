"use client";

import { RouteGuard } from "@/components/auth/RouteGuard";
import { SportsmasterReportingHub } from "@/components/reports/SportsmasterReportingHub";

export default function ReportsPage() {
  return (
    <RouteGuard module="analytics" label="Sportsmaster Reporting & Export Hub">
      <div className="container mx-auto px-4 py-8">
        <SportsmasterReportingHub />
      </div>
    </RouteGuard>
  );
}
