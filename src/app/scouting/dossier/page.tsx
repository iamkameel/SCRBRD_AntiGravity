'use client';

import React from 'react';
import { OppositionScoutingDossierView } from '@/components/scouting/OppositionScoutingDossier';

export default function ScoutingDossierPage() {
    return (
        <main className="min-h-screen bg-[#05080f] text-[#f3f5ef] font-sans p-6 max-w-7xl mx-auto space-y-6">
            <OppositionScoutingDossierView fixtureId="fix-1st-xi-kes" />
        </main>
    );
}
