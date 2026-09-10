import { fetchSchools } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, GraduationCap } from "lucide-react";
import { SchoolsClient } from "@/components/schools/SchoolsClient";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { D } from "@/lib/design-system";

export const dynamic = 'force-dynamic';

export default async function SchoolsPage() {
  const schools = await fetchSchools().catch(() => []);

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Standardized Header */}
      <SectionHeader 
        title="School Directory"
        sub="Institutional profiles, regional hubs, and campus sports operations."
        icon={<GraduationCap className="w-5 h-5 text-indigo-400" />}
        actions={
          <Link href="/schools/add">
            <Button className="h-10 px-5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
              <Plus className="mr-1.5 h-4 w-4" />
              Add School
            </Button>
          </Link>
        }
      />

      <SchoolsClient schools={schools} />
    </div>
  );
}
