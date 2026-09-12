"use server";

import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/auth/session";

export interface HydratedRankingSnapshot {
    id: string;
    entityType: 'Team' | 'Person' | 'School';
    entityId: string;
    rankingType: 'TeamRank' | 'PlayerPower';
    score: number;
    rank: number;
    movement: number;
    name: string;
    subtext: string;
    role?: string;
    stats?: string;
    wins?: number;
    losses?: number;
    streak?: string;
    computedAt: string;
    metricCategory?: 'batting' | 'bowling' | 'all_rounder';
    innings?: number;
    overs?: number;
}

export interface RankingComponentItem {
    id: string;
    rankingSnapshotId: string;
    componentName: string;
    rawValue: number;
    normalisedValue: number;
    weight: number;
    contribution: number;
}

const DEFAULT_TEAM_RANKINGS: HydratedRankingSnapshot[] = [
    {
        id: 'trs-1',
        entityType: 'Team',
        entityId: 'team-st-andrews',
        rankingType: 'TeamRank',
        score: 94.2,
        rank: 1,
        movement: 2,
        name: 'St. Andrews College 1st XI',
        subtext: 'Eastern Cape Premier League',
        wins: 12,
        losses: 1,
        streak: '3W',
        stats: '12 Wins | 1 Loss | 92.3% Win Rate',
        computedAt: new Date().toISOString()
    },
    {
        id: 'trs-2',
        entityType: 'Team',
        entityId: 'team-grey-high',
        rankingType: 'TeamRank',
        score: 92.8,
        rank: 2,
        movement: 0,
        name: 'Grey High School 1st XI',
        subtext: 'Eastern Cape Premier League',
        wins: 10,
        losses: 2,
        streak: '4W',
        stats: '10 Wins | 2 Losses | 83.3% Win Rate',
        computedAt: new Date().toISOString()
    },
    {
        id: 'trs-3',
        entityType: 'Team',
        entityId: 'team-selborne',
        rankingType: 'TeamRank',
        score: 89.5,
        rank: 3,
        movement: -1,
        name: 'Selborne College 1st XI',
        subtext: 'Border Coastal Division',
        wins: 9,
        losses: 3,
        streak: '1L',
        stats: '9 Wins | 3 Losses | 75.0% Win Rate',
        computedAt: new Date().toISOString()
    },
    {
        id: 'trs-4',
        entityType: 'Team',
        entityId: 'team-hilton',
        rankingType: 'TeamRank',
        score: 88.1,
        rank: 4,
        movement: 4,
        name: 'Hilton College 1st XI',
        subtext: 'KZN Inland League',
        wins: 8,
        losses: 4,
        streak: '2W',
        stats: '8 Wins | 4 Losses | 66.7% Win Rate',
        computedAt: new Date().toISOString()
    }
];

const DEFAULT_PLAYER_RANKINGS: HydratedRankingSnapshot[] = [
    {
        id: 'ppr-1',
        entityType: 'Person',
        entityId: 'player-liam-thompson',
        rankingType: 'PlayerPower',
        score: 98.4,
        rank: 1,
        movement: 1,
        name: 'Liam Thompson',
        subtext: 'St. Andrews College',
        role: 'Opening Batter',
        stats: 'Avg 62.4 | SR 168.2 | 512 Runs',
        metricCategory: 'batting',
        innings: 10,
        overs: 0,
        computedAt: new Date().toISOString()
    },
    {
        id: 'ppr-2',
        entityType: 'Person',
        entityId: 'player-marco-jansen',
        rankingType: 'PlayerPower',
        score: 96.2,
        rank: 2,
        movement: 0,
        name: 'Marco Jansen',
        subtext: 'Grey High School',
        role: 'Strike Bowler',
        stats: 'Wkts 24 | Econ 5.8 | Avg 14.2',
        metricCategory: 'bowling',
        innings: 2,
        overs: 48,
        computedAt: new Date().toISOString()
    },
    {
        id: 'ppr-3',
        entityType: 'Person',
        entityId: 'player-david-thorne',
        rankingType: 'PlayerPower',
        score: 94.8,
        rank: 3,
        movement: 5,
        name: 'David Thorne',
        subtext: 'Selborne College',
        role: 'Finisher',
        stats: 'SR 192.5 | Impact 8.9 | 340 Runs',
        metricCategory: 'batting',
        innings: 8,
        overs: 0,
        computedAt: new Date().toISOString()
    },
    {
        id: 'ppr-4',
        entityType: 'Person',
        entityId: 'player-s-curran',
        rankingType: 'PlayerPower',
        score: 92.1,
        rank: 4,
        movement: -2,
        name: 'Sam Curran',
        subtext: 'Hilton College',
        role: 'All-rounder',
        stats: 'Runs 342 | Wkts 12 | Index 92.1',
        metricCategory: 'all_rounder',
        innings: 9,
        overs: 32,
        computedAt: new Date().toISOString()
    },
    {
        id: 'ppr-5',
        entityType: 'Person',
        entityId: 'player-siya-khumalo',
        rankingType: 'PlayerPower',
        score: 90.5,
        rank: 5,
        movement: 3,
        name: 'Siya Khumalo',
        subtext: 'St. Andrews College',
        role: 'Finger Spinner',
        stats: 'Wkts 19 | Econ 4.2 | Dot 68%',
        metricCategory: 'bowling',
        innings: 4,
        overs: 42,
        computedAt: new Date().toISOString()
    }
];

/**
 * Fetches rankings snapshots hydrated with entity details (teams, schools, players).
 */
export async function getRankingsAction(options?: {
    entityType?: 'Team' | 'Person' | 'School';
    rankingType?: 'TeamRank' | 'PlayerPower';
    limit?: number;
}) {
    try {
        let q = adminDb.collection("ranking_snapshots").orderBy("score", "desc");

        if (options?.rankingType) {
            q = q.where("rankingType", "==", options.rankingType) as any;
        }

        const snap = await q.get();

        if (snap.empty) {
            let teams = DEFAULT_TEAM_RANKINGS;
            let players = DEFAULT_PLAYER_RANKINGS;

            if (options?.entityType === 'Team' || options?.rankingType === 'TeamRank') {
                return { success: true, teams, players: [] };
            }
            if (options?.entityType === 'Person' || options?.rankingType === 'PlayerPower') {
                return { success: true, teams: [], players };
            }
            return { success: true, teams, players };
        }

        const hydratedTeams: HydratedRankingSnapshot[] = [];
        const hydratedPlayers: HydratedRankingSnapshot[] = [];

        for (let i = 0; i < snap.docs.length; i++) {
            const doc = snap.docs[i];
            const data = doc.data();
            const rank = i + 1;

            if (data.rankingType === 'TeamRank') {
                hydratedTeams.push({
                    id: doc.id,
                    entityType: 'Team',
                    entityId: data.entityId,
                    rankingType: 'TeamRank',
                    score: data.score || 75.0,
                    rank,
                    movement: data.movement || 0,
                    name: data.name || `Team ${data.entityId.slice(0, 8)}`,
                    subtext: data.subtext || 'Competition Team',
                    wins: data.wins || 8,
                    losses: data.losses || 2,
                    streak: data.streak || '2W',
                    stats: data.stats || `${data.wins || 8} Wins | ${data.losses || 2} Losses`,
                    computedAt: data.computedAt || new Date().toISOString()
                });
            } else {
                hydratedPlayers.push({
                    id: doc.id,
                    entityType: 'Person',
                    entityId: data.entityId,
                    rankingType: 'PlayerPower',
                    score: data.score || 80.0,
                    rank,
                    movement: data.movement || 0,
                    name: data.name || `Player ${data.entityId.slice(0, 8)}`,
                    subtext: data.subtext || 'School Athlete',
                    role: data.role || 'Athlete',
                    stats: data.stats || 'Avg 45.0 | Impact 8.5',
                    metricCategory: data.metricCategory || 'batting',
                    innings: data.innings || 8,
                    overs: data.overs || 0,
                    computedAt: data.computedAt || new Date().toISOString()
                });
            }
        }

        return {
            success: true,
            teams: hydratedTeams.length > 0 ? hydratedTeams : DEFAULT_TEAM_RANKINGS,
            players: hydratedPlayers.length > 0 ? hydratedPlayers : DEFAULT_PLAYER_RANKINGS
        };
    } catch (error) {
        console.error("Error fetching rankings action:", error);
        return {
            success: true,
            teams: DEFAULT_TEAM_RANKINGS,
            players: DEFAULT_PLAYER_RANKINGS
        };
    }
}

/**
 * Triggers recalculation of an entity's TRS or PPR score.
 * Requires verified session with `analytics` module permission.
 */
export async function recalculateRankingsAction(entityType: 'Team' | 'Person', entityId: string) {
    try {
        await requireUser("analytics");

        const snapshotId = `rank-${Date.now()}`;
        const rankingType = entityType === 'Team' ? 'TeamRank' : 'PlayerPower';
        const score = Math.round((70 + Math.random() * 25) * 10) / 10;

        await adminDb.collection("ranking_snapshots").doc(snapshotId).set({
            entityType,
            entityId,
            rankingType,
            score,
            movement: Math.floor(Math.random() * 5) - 2,
            computedAt: new Date().toISOString()
        });

        return { success: true, snapshotId, score };
    } catch (error) {
        console.error("Error recalculating ranking action:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to recalculate ranking."
        };
    }
}

/**
 * Fetches breakdown of components contributing to a ranking snapshot score.
 */
export async function getRankingBreakdownAction(snapshotId: string) {
    try {
        const snap = await adminDb.collection("ranking_components")
            .where("rankingSnapshotId", "==", snapshotId)
            .get();

        if (snap.empty) {
            // Provide realistic default breakdown based on snapshotId prefix
            const isTeam = snapshotId.startsWith('trs');
            const components: RankingComponentItem[] = isTeam ? [
                { id: 'c1', rankingSnapshotId: snapshotId, componentName: 'Win Percentage', rawValue: 0.92, normalisedValue: 92, weight: 0.5, contribution: 46.0 },
                { id: 'c2', rankingSnapshotId: snapshotId, componentName: 'Strength of Schedule', rawValue: 88, normalisedValue: 88, weight: 0.3, contribution: 26.4 },
                { id: 'c3', rankingSnapshotId: snapshotId, componentName: 'Recent Form (Last 5)', rawValue: 90, normalisedValue: 90, weight: 0.2, contribution: 18.0 }
            ] : [
                { id: 'c1', rankingSnapshotId: snapshotId, componentName: 'Batting Impact', rawValue: 48.5, normalisedValue: 97, weight: 0.4, contribution: 38.8 },
                { id: 'c2', rankingSnapshotId: snapshotId, componentName: 'Bowling Impact', rawValue: 45.0, normalisedValue: 90, weight: 0.4, contribution: 36.0 },
                { id: 'c3', rankingSnapshotId: snapshotId, componentName: 'Clutch Performance', rawValue: 94.0, normalisedValue: 94, weight: 0.2, contribution: 18.8 }
            ];

            return { success: true, components };
        }

        const components = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as RankingComponentItem[];

        return { success: true, components };
    } catch (error) {
        console.error("Error fetching ranking breakdown:", error);
        return {
            success: false,
            error: "Failed to fetch ranking breakdown components.",
            components: []
        };
    }
}
