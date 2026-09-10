import { Match, Field } from '@/types/firestore';
import * as V4 from '@/types/schema_v4';

export interface MatchupInsights {
    h2h: {
        total: number;
        homeWins: number;
        awayWins: number;
        draws: number;
        lastResults: Array<{
            id: string;
            date: string;
            winnerId: string | null;
            scoreLine?: string;
        }>;
    };
    groundInsights: {
        status: string;
        description: string;
        rating: number;
        amenities: string[];
    } | null;
    rivalryLevel: 'Normal' | 'Competitive' | 'Fierce';
}

/**
 * Calculates Head-to-Head statistics from a list of historical matches
 */
export function calculateH2H(matches: Match[] | V4.Match[], homeTeamId: string, awayTeamId: string) {
    const h2hMatches = (matches as any[]).filter(m =>
        (m.homeTeamId === homeTeamId && m.awayTeamId === awayTeamId) ||
        (m.homeTeamId === awayTeamId && m.awayTeamId === homeTeamId)
    );

    const homeWins = h2hMatches.filter(m => (m.winningTeamId || m.resultWinnerId || m.winnerTeamId) === homeTeamId).length;
    const awayWins = h2hMatches.filter(m => (m.winningTeamId || m.resultWinnerId || m.winnerTeamId) === awayTeamId).length;
    const draws = h2hMatches.filter(m => (m.status === 'completed' || m.liveStatus === 'completed') && !(m.winningTeamId || m.resultWinnerId || m.winnerTeamId)).length;

    const lastResults = h2hMatches
        .sort((a, b) => {
            const dateA = new Date(a.matchDate || a.scheduledStartAt || a.dateTime || 0).getTime();
            const dateB = new Date(b.matchDate || b.scheduledStartAt || b.dateTime || 0).getTime();
            return dateB - dateA;
        })
        .slice(0, 3)
        .map(m => ({
            id: m.id,
            date: (m.matchDate || m.scheduledStartAt || m.dateTime) as string,
            winnerId: (m.winningTeamId || m.resultWinnerId || m.winnerTeamId || null) as string | null,
            scoreLine: (m.marginText || m.resultSummary || m.result || 'Result Pending') as string
        }));

    // Simple rivalry heuristic: more history or close gaps = higher rivalry
    let rivalryLevel: 'Normal' | 'Competitive' | 'Fierce' = 'Normal';
    if (h2hMatches.length > 5) rivalryLevel = 'Fierce';
    else if (h2hMatches.length > 2) rivalryLevel = 'Competitive';

    return {
        total: h2hMatches.length,
        homeWins,
        awayWins,
        draws,
        lastResults,
        rivalryLevel
    };
}

/**
 * Generates ground insights from Field data
 */
export function getGroundInsights(field: Field | V4.Field | null): MatchupInsights['groundInsights'] {
    if (!field) return null;

    return {
        status: (field as any).status || 'Available',
        description: (field as any).notes || (field as any).location || 'Standard school facility.',
        rating: (field as any).surfaceConditionRating || 3,
        amenities: (field as any).amenities || []
    };
}
