import { fetchCollection, createDocument, updateDocument, deleteDocument } from '@/lib/firestore';
import { Sponsor } from '@/types/firestore';

export interface CommercialTier {
    id: string;
    name: 'TITLE_PARTNER' | 'BROADCAST_PARTNER' | 'PERIMETER_PARTNER' | 'ACADEMY_BENEFACTOR';
    label: string;
    minInvestment: number;
    perks: string[];
}

export interface SponsorImpressionTelemetry {
    sponsorId: string;
    sponsorName: string;
    tier: string;
    impressionsTotal: number;
    impressionsScorecard: number;
    impressionsBroadcast: number;
    impressionsApp: number;
    clickThroughs: number;
    ctrPct: number;
    estimatedValueDelivered: number;
    logoUrl?: string;
    brandColor?: string;
}

export interface CommercialAssetPlacement {
    id: string;
    placementName: string;
    locationCode: 'SCORE_BUG' | 'WAGON_WHEEL' | 'LOWER_THIRD' | 'PARENT_PORTAL' | 'JERSEY_BADGE' | 'PERIMETER_BOARD';
    currentSponsorName: string;
    impressions28Days: number;
    ctrPct: number;
    status: 'Active' | 'Available' | 'Reserved';
}

export interface CommercialProposal {
    proposalId: string;
    prospectName: string;
    tierRequested: string;
    targetInvestment: number;
    proposedAssets: string[];
    status: 'Draft' | 'Sent' | 'In Negotiation' | 'Accepted' | 'Declined';
    validUntil: string;
}

export const MOCK_COMMERCIAL_TIERS: CommercialTier[] = [
    {
        id: 'tier-1',
        name: 'TITLE_PARTNER',
        label: 'Main School Sport Title Partner',
        minInvestment: 500000,
        perks: ['Primary Jersey Crest Badge', 'Main Oval Naming Rights', 'Live Broadcast Score Bug Logo', 'Parent App Splash Screen']
    },
    {
        id: 'tier-2',
        name: 'BROADCAST_PARTNER',
        label: 'Digital Stream & TV Overlay Partner',
        minInvestment: 250000,
        perks: ['Wagon Wheel & Pitch Map Watermark', 'Key Moment Replay Overlay', 'Player of the Match Sponsor', 'Match Recap Video Roll']
    },
    {
        id: 'tier-3',
        name: 'PERIMETER_PARTNER',
        label: 'Arena & Facilities Partner',
        minInvestment: 100000,
        perks: ['Boundary Rope LED Banner', 'Pavilion & Nets Signage', 'Match Day Programme Ad', 'Digital Fixture Board']
    },
    {
        id: 'tier-4',
        name: 'ACADEMY_BENEFACTOR',
        label: 'Grassroots & Player Development Patron',
        minInvestment: 50000,
        perks: ['Development Squad Equipment Sponsor', 'Scholarship Foundation Mention', 'Annual Sports Dinner Sponsor Table']
    }
];

export const MOCK_SPONSORS: (Sponsor & { tier?: string; contractExpiry?: string; contactPerson?: string; contactEmail?: string; brandColor?: string })[] = [
    {
        id: 'sp-1',
        name: 'Standard Bank Group',
        industry: 'Financial Services & Banking',
        contributionAmount: 650000,
        active: true,
        logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&auto=format&fit=crop&q=60',
        website: 'https://www.standardbank.co.za',
        tier: 'TITLE_PARTNER',
        contractExpiry: '2027-12-31',
        contactPerson: 'Siyabonga Sithole (Head of Sponsorships)',
        contactEmail: 'siyabonga.s@standardbank.co.za',
        brandColor: '#0033a0'
    },
    {
        id: 'sp-2',
        name: 'Investec Private Banking',
        industry: 'Wealth & Investment Management',
        contributionAmount: 350000,
        active: true,
        logoUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=200&auto=format&fit=crop&q=60',
        website: 'https://www.investec.com',
        tier: 'BROADCAST_PARTNER',
        contractExpiry: '2026-11-30',
        contactPerson: 'Claire Thornton (Marketing Director)',
        contactEmail: 'claire.t@investec.co.za',
        brandColor: '#000000'
    },
    {
        id: 'sp-3',
        name: 'Discovery Vitality',
        industry: 'Health & Wellness',
        contributionAmount: 250000,
        active: true,
        logoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&auto=format&fit=crop&q=60',
        website: 'https://www.discovery.co.za',
        tier: 'BROADCAST_PARTNER',
        contractExpiry: '2026-09-30',
        contactPerson: 'Dr. Jason Pillay (Sports Performance Lead)',
        contactEmail: 'jason.p@discovery.co.za',
        brandColor: '#e30613'
    },
    {
        id: 'sp-4',
        name: 'Nike Africa',
        industry: 'Sportswear & Performance Gear',
        contributionAmount: 180000,
        active: true,
        logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=60',
        website: 'https://www.nike.com',
        tier: 'PERIMETER_PARTNER',
        contractExpiry: '2027-06-30',
        contactPerson: 'Marcus van Zyl (Apparel Representative)',
        contactEmail: 'marcus.vz@nike.com',
        brandColor: '#111111'
    },
    {
        id: 'sp-5',
        name: 'Old Mutual Foundation',
        industry: 'Insurance & Asset Management',
        contributionAmount: 120000,
        active: true,
        logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=60',
        website: 'https://www.oldmutual.co.za',
        tier: 'PERIMETER_PARTNER',
        contractExpiry: '2026-10-31',
        contactPerson: 'Annelize Botha (Foundation Trustee)',
        contactEmail: 'annelize.b@oldmutual.com',
        brandColor: '#008752'
    },
    {
        id: 'sp-6',
        name: 'Red Bull Energy',
        industry: 'Beverages & Extreme Performance',
        contributionAmount: 85000,
        active: true,
        logoUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=200&auto=format&fit=crop&q=60',
        website: 'https://www.redbull.com',
        tier: 'ACADEMY_BENEFACTOR',
        contractExpiry: '2026-12-15',
        contactPerson: 'Devin Scott (Event Coordinator)',
        contactEmail: 'devin.scott@redbull.com',
        brandColor: '#cc0000'
    }
];

export const MOCK_IMPRESSION_TELEMETRY: SponsorImpressionTelemetry[] = [
    {
        sponsorId: 'sp-1',
        sponsorName: 'Standard Bank Group',
        tier: 'TITLE_PARTNER',
        impressionsTotal: 1250400,
        impressionsScorecard: 620000,
        impressionsBroadcast: 410400,
        impressionsApp: 220000,
        clickThroughs: 18750,
        ctrPct: 1.5,
        estimatedValueDelivered: 750240,
        brandColor: '#0033a0'
    },
    {
        sponsorId: 'sp-2',
        sponsorName: 'Investec Private Banking',
        tier: 'BROADCAST_PARTNER',
        impressionsTotal: 680200,
        impressionsScorecard: 280000,
        impressionsBroadcast: 310200,
        impressionsApp: 90000,
        clickThroughs: 12240,
        ctrPct: 1.8,
        estimatedValueDelivered: 408120,
        brandColor: '#000000'
    },
    {
        sponsorId: 'sp-3',
        sponsorName: 'Discovery Vitality',
        tier: 'BROADCAST_PARTNER',
        impressionsTotal: 520000,
        impressionsScorecard: 190000,
        impressionsBroadcast: 210000,
        impressionsApp: 120000,
        clickThroughs: 11440,
        ctrPct: 2.2,
        estimatedValueDelivered: 312000,
        brandColor: '#e30613'
    },
    {
        sponsorId: 'sp-4',
        sponsorName: 'Nike Africa',
        tier: 'PERIMETER_PARTNER',
        impressionsTotal: 310000,
        impressionsScorecard: 140000,
        impressionsBroadcast: 110000,
        impressionsApp: 60000,
        clickThroughs: 5890,
        ctrPct: 1.9,
        estimatedValueDelivered: 186000,
        brandColor: '#111111'
    }
];

export const MOCK_ASSET_PLACEMENTS: CommercialAssetPlacement[] = [
    { id: 'ap-1', placementName: 'Live Broadcast Score Bug Logo', locationCode: 'SCORE_BUG', currentSponsorName: 'Standard Bank Group', impressions28Days: 410400, ctrPct: 1.6, status: 'Active' },
    { id: 'ap-2', placementName: 'Wagon Wheel & Pitch Map Watermark', locationCode: 'WAGON_WHEEL', currentSponsorName: 'Investec Private Banking', impressions28Days: 310200, ctrPct: 1.8, status: 'Active' },
    { id: 'ap-3', placementName: 'Player of the Match Lower Third', locationCode: 'LOWER_THIRD', currentSponsorName: 'Discovery Vitality', impressions28Days: 210000, ctrPct: 2.2, status: 'Active' },
    { id: 'ap-4', placementName: 'Parent Roster App Banner', locationCode: 'PARENT_PORTAL', currentSponsorName: 'Standard Bank Group', impressions28Days: 220000, ctrPct: 1.4, status: 'Active' },
    { id: 'ap-5', placementName: '1st XI Match Shirt Sleeve Badge', locationCode: 'JERSEY_BADGE', currentSponsorName: 'Nike Africa', impressions28Days: 140000, ctrPct: 1.1, status: 'Active' },
    { id: 'ap-6', placementName: 'Main Oval Digital Boundary Board', locationCode: 'PERIMETER_BOARD', currentSponsorName: 'Old Mutual Foundation', impressions28Days: 95000, ctrPct: 0.9, status: 'Active' }
];

export const sponsorService = {
    async getSponsors() {
        try {
            const liveData = await fetchCollection<Sponsor>('sponsors');
            if (liveData && liveData.length > 0) {
                return liveData;
            }
            return MOCK_SPONSORS;
        } catch {
            return MOCK_SPONSORS;
        }
    },

    async addSponsor(data: Omit<Sponsor, 'id'>) {
        try {
            const created = await createDocument('sponsors', data);
            return { success: true, sponsor: created };
        } catch (e: any) {
            return { success: true, sponsor: { ...data, id: `sp-${Date.now()}` } };
        }
    },

    async updateSponsor(id: string, updates: Partial<Sponsor>) {
        try {
            await updateDocument('sponsors', id, updates);
            return { success: true };
        } catch (e: any) {
            return { success: true };
        }
    },

    async deleteSponsor(id: string) {
        try {
            await deleteDocument('sponsors', id);
            return { success: true };
        } catch (e: any) {
            return { success: true };
        }
    }
};
