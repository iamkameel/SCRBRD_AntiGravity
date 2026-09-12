import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

vi.mock('@/lib/firebase', () => ({ db: {}, auth: {}, storage: {}, dataconnect: {}, default: {} }));
vi.mock('@/app/actions/rankingActions', () => ({
    getRankingsAction: vi.fn().mockResolvedValue({
        success: true,
        teams: [
            {
                id: 'trs-1',
                entityType: 'Team',
                entityId: 'team-1',
                rankingType: 'TeamRank',
                score: 95.4,
                rank: 1,
                movement: 2,
                name: 'St. Andrews 1st XI',
                subtext: 'Eastern Cape Premier League',
                wins: 12,
                losses: 1,
                streak: '3W',
                stats: '12 Wins | 1 Loss'
            }
        ],
        players: [
            {
                id: 'ppr-1',
                entityType: 'Person',
                entityId: 'player-1',
                rankingType: 'PlayerPower',
                score: 98.2,
                rank: 1,
                movement: 1,
                name: 'Liam Thompson',
                subtext: 'St. Andrews College',
                role: 'Opening Batter',
                stats: 'Avg 62.4 | SR 168.2'
            }
        ]
    }),
    recalculateRankingsAction: vi.fn().mockResolvedValue({
        success: true,
        snapshotId: 'rank-new',
        score: 96.0
    }),
    getRankingBreakdownAction: vi.fn().mockResolvedValue({
        success: true,
        components: [
            {
                id: 'c1',
                rankingSnapshotId: 'trs-1',
                componentName: 'Win Percentage',
                rawValue: 0.92,
                normalisedValue: 92,
                weight: 0.5,
                contribution: 46.0
            },
            {
                id: 'c2',
                rankingSnapshotId: 'trs-1',
                componentName: 'Strength of Schedule',
                rawValue: 88,
                normalisedValue: 88,
                weight: 0.3,
                contribution: 26.4
            }
        ]
    })
}));

import RankingsDashboard from '../RankingsDashboard';
import { getRankingsAction, recalculateRankingsAction, getRankingBreakdownAction } from '@/app/actions/rankingActions';

describe('RankingsDashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders header and initial team rankings by default', async () => {
        render(<RankingsDashboard />);

        expect(await screen.findByText('Global Rankings Hub')).toBeInTheDocument();
        expect(screen.getByText('St. Andrews 1st XI')).toBeInTheDocument();
        expect(screen.getByText('95.4')).toBeInTheDocument();
    });

    it('renders Player PPR tab when initialTab="players"', async () => {
        render(<RankingsDashboard initialTab="players" />);

        expect(await screen.findByText('Liam Thompson')).toBeInTheDocument();
        expect(screen.getByText('98.2')).toBeInTheDocument();
    });

    it('triggers recalculation action when Recalculate button clicked', async () => {
        render(<RankingsDashboard />);
        await screen.findByText('Global Rankings Hub');

        const recalcButton = screen.getByRole('button', { name: /Recalculate/i });
        fireEvent.click(recalcButton);

        await waitFor(() => {
            expect(recalculateRankingsAction).toHaveBeenCalledWith('Team', 'team-st-andrews');
        });
    });

    it('opens breakdown modal when clicking on a ranking card', async () => {
        render(<RankingsDashboard />);
        await screen.findByText('St. Andrews 1st XI');

        const teamCard = screen.getByText('St. Andrews 1st XI');
        fireEvent.click(teamCard);

        await waitFor(() => {
            expect(getRankingBreakdownAction).toHaveBeenCalledWith('trs-1');
        });

        expect(await screen.findByText(/Score Breakdown: St. Andrews 1st XI/i)).toBeInTheDocument();
        expect(screen.getByText('Win Percentage')).toBeInTheDocument();
    });
});
