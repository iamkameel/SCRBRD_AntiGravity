import { GroundskeeperDashboard } from '@/components/facilities/GroundskeeperDashboard';

export const dynamic = 'force-dynamic';

export default async function GroundsDashboardPage() {
  // In a real app, we would use the services to fetch real data
  // For now, we use the premium dashboard which has built-in demo data
  return (
    <div className="pb-20">
      <GroundskeeperDashboard />
    </div>
  );
}
