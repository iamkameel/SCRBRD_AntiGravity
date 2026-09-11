"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AIScoutingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/scouting?tab=ai");
  }, [router]);

  return (
    <div className="container mx-auto p-12 text-center text-muted-foreground font-bold">
      Redirecting to Scouting Hub...
    </div>
  );
}
