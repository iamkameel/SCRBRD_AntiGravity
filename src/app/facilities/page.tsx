import { FacilityCommandCenter } from '@/components/facilities/FacilityCommandCenter';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Turf & Facility Engine | SCRBRD OS',
  description: 'School-wide turf health, booking conflicts, fixture reconciliation, pitch preparation countdowns and wear-balanced pitch allocation.',
};

export default function FacilitiesPage() {
  return (
    <RouteGuard module="fields" label="Turf & Facility Engine">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <FacilityCommandCenter />
      </div>
    </RouteGuard>
  );
}
