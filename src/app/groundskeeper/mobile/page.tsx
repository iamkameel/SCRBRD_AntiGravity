import { GroundskeeperMobilePWA } from '@/components/facilities/GroundskeeperMobilePWA';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Groundskeeper Field Mobile | SCRBRD OS',
  description: 'Field mobile app for groundskeepers to log Clegg Impact Values, pitch moisture, grass height, and issue pre-match clearance.',
};

export default function GroundskeeperMobileShortcutPage() {
  return (
    <RouteGuard module="fields" label="Groundskeeper Mobile PWA">
      <GroundskeeperMobilePWA />
    </RouteGuard>
  );
}
