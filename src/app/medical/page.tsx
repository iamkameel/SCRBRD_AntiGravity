import { MedicalLog } from "@/components/medical/MedicalLog";
import { D } from '@/lib/design-system';

export default function MedicalPage() {
  return (
    <div className="animate-slide-in-up pb-24">
      <MedicalLog />
    </div>
  );
}
