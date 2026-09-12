import { TransportHub } from "@/components/transport/TransportHub";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { D } from "@/lib/design-system";

export default function TransportPage() {
  return (
    <RouteGuard module="logistics" label="Transport & Fleet Operations Hub">
      <div className="animate-slide-in-up pb-24">
        <TransportHub />
      </div>
    </RouteGuard>
  );
}
