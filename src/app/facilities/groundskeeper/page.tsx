import { GroundskeeperMobilePWA } from '@/components/facilities/GroundskeeperMobilePWA';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Groundskeeper Mobile PWA | SCRBRD OS',
  description: 'Field mobile app for groundskeepers to log Clegg Impact Values, pitch moisture, grass height, and issue pre-match clearance.',
};

export default function GroundskeeperMobilePage() {
  return (
    <RouteGuard module="fields" label="Groundskeeper Mobile PWA">
      <GroundskeeperMobilePWA />
    </RouteGuard>
  );
}
