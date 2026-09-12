import { MultiSportPlatform } from '@/components/sports/MultiSportPlatform';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Multi-Sport Platform Engine | SCRBRD OS',
  description: 'Sport engine consoles (cricket, aquatics, athletics, rugby, hockey, netball, soccer, basketball), cross-sport athlete load passports, universal facility grid and championship shield aggregation.',
};

/**
 * The platform shell lives in components/sports/MultiSportPlatform so this
 * route stays a thin, server-rendered wrapper (metadata + RBAC gate).
 */
export default function MultiSportPlatformPage() {
  return (
    <RouteGuard module="competitions" label="Multi-Sport Platform">
      <div className="container mx-auto px-4 py-8">
        <MultiSportPlatform />
      </div>
    </RouteGuard>
  );
}
