import { SportsDirectorDashboard } from '@/components/dashboard/SportsDirectorDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Director Command Dashboard | SCRBRD OS',
  description: 'School Sports Director Executive Command Dashboard for multi-team operational readiness, staff governance, and workload compliance.',
};

export default function DirectorDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <SportsDirectorDashboard />
    </div>
  );
}
