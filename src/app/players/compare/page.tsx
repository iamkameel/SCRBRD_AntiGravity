import { PlayerComparisonCockpit } from "@/components/players/PlayerComparisonCockpit";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PlayerComparePage() {
  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/players">
          <Button variant="ghost" size="sm" className="bg-white/5 hover:bg-white/10 text-white border border-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Players Directory
          </Button>
        </Link>
      </div>

      <PlayerComparisonCockpit />
    </div>
  );
}
