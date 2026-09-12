"use client";

import React from "react";
import { GroundskeeperDashboard } from "@/components/facilities/GroundskeeperDashboard";

export default function GroundsPage() {
    return (
        <main className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
            <GroundskeeperDashboard />
        </main>
    );
}
