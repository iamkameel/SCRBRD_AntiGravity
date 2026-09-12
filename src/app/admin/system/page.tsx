import { SystemArchitectHub } from "@/components/admin/SystemArchitectHub";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function SystemArchitectPage() {
  return (
    <RouteGuard module="settings" label="System Architect & Platform Audit Hub">
      <div className="animate-slide-in-up pb-24">
        <SystemArchitectHub />
      </div>
    </RouteGuard>
  );
}
