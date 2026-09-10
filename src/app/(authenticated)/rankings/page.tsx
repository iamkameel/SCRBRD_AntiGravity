import React from 'react';
import { Metadata } from 'next';
import { GlobalRankingsClient } from '@/components/rankings/GlobalRankingsClient';

export const metadata: Metadata = {
    title: 'Rankings | SCRBRD',
    description: 'Global Rankings and Performance Intelligence',
};

export default function RankingsPage() {
    return (
        <GlobalRankingsClient />
    );
}
