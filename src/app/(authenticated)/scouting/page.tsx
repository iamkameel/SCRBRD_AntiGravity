import React from 'react';
import { Metadata } from 'next';
import { PageHeader } from '@/components/dashboard/PageHeader';
import ScoutingDashboard from '@/components/scouting/ScoutingDashboard';

export const metadata: Metadata = {
    title: 'Scouting Assistant | AppName',
    description: 'Human-augmented intelligence and potential indexing.',
};

export default function ScoutingPage() {
    return (
        <div className="flex-1 space-y-6 container mx-auto p-4 md:p-8">
            <PageHeader 
                title="Scouting Assistant" 
                description="Monitor high-upside prospects and log detailed technical assessments." 
            />
            
            <ScoutingDashboard />
        </div>
    );
}
