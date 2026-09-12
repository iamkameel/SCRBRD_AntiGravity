import { AnalyticsHubClient } from "@/components/charts/lazy";

export default function AnalyticsHubPage() {
  // In a real implementation, we would fetch institutional data here
  // For V1, the client component handles visualization of aggregated mock/fetched data
  return <AnalyticsHubClient />;
}
