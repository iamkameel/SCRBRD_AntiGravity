'use client';

import React from 'react';
import { AdvancedMatchCalculators } from '@/components/competitions/AdvancedMatchCalculators';

export default function MatchCalculatorsPage() {
    return (
        <main className="min-h-screen bg-[#05080f] text-[#f0f4ff] font-sans p-6 max-w-7xl mx-auto space-y-6">
            <AdvancedMatchCalculators />
        </main>
    );
}
