'use client';

import React from 'react';
import { SwimmingGalaHubView } from '@/components/sports/SwimmingGalaHub';

export default function SwimmingPage() {
    return (
        <main className="min-h-screen bg-[#05080f] text-[#f3f5ef] font-sans p-6 max-w-7xl mx-auto space-y-6">
            <SwimmingGalaHubView />
        </main>
    );
}
