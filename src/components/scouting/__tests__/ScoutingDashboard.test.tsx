import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

vi.mock('@/lib/firebase', () => ({ db: {}, auth: {}, storage: {}, dataconnect: {}, default: {} }));
vi.mock('@/app/actions/scoutingActions', () => ({
    getProspectsAction: vi.fn().mockResolvedValue({
        success: true,
        prospects: [
            {
                id: '1',
                name: 'James Anderson',
                role: 'Fast Bowler',
                age: 16,
                scoutGrade: 'A+',
                potential: 'ELITE',
                metrics: { velocity: 88, accuracy: 92, stamina: 85 },
                trend: 'up',
                reports: 12,
                isWatchlisted: false,
            },
            {
                id: '2',
                name: 'Liam Smith',
                role: 'Opening Batter',
                age: 17,
                scoutGrade: 'A',
                potential: 'HIGH',
                metrics: { timing: 90, power: 78, defense: 95 },
                trend: 'same',
                reports: 8,
                isWatchlisted: true,
            }
        ]
    }),
    createScoutReportAction: vi.fn().mockResolvedValue({ success: true, id: 'rep-101' }),
    toggleWatchlistAction: vi.fn().mockResolvedValue({ success: true, isWatchlisted: true })
}));

import ScoutingDashboard from '../ScoutingDashboard';
import { getProspectsAction, toggleWatchlistAction } from '@/app/actions/scoutingActions';

describe('ScoutingDashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders header, HUD metrics, and prospect cards', async () => {
        render(<ScoutingDashboard />);
        
        expect(await screen.findByText('Personnel Intel')).toBeInTheDocument();
        expect(screen.getByText('James Anderson')).toBeInTheDocument();
        expect(screen.getByText('Liam Smith')).toBeInTheDocument();
        expect(screen.getByText('ACTIVE PIPELINE')).toBeInTheDocument();
        expect(screen.getByText('ELITE POTENTIAL')).toBeInTheDocument();
    });

    it('filters prospects by search input', async () => {
        render(<ScoutingDashboard />);
        await screen.findByText('James Anderson');

        const searchInput = screen.getByPlaceholderText('SEARCH PROSPECTS...');
        fireEvent.change(searchInput, { target: { value: 'Liam' } });

        expect(screen.getByText('Liam Smith')).toBeInTheDocument();
        expect(screen.queryByText('James Anderson')).not.toBeInTheDocument();
    });

    it('opens report creation modal when clicking CREATE REPORT', async () => {
        render(<ScoutingDashboard />);
        await screen.findByText('Personnel Intel');

        const createButton = screen.getByRole('button', { name: /CREATE REPORT/i });
        fireEvent.click(createButton);

        expect(screen.getByText('Scout Report Evaluation Form')).toBeInTheDocument();
    });

    it('toggles prospect watchlist state', async () => {
        render(<ScoutingDashboard />);
        await screen.findByText('James Anderson');

        const watchlistButtons = screen.getAllByTitle('Add to Watchlist');
        expect(watchlistButtons.length).toBeGreaterThan(0);

        fireEvent.click(watchlistButtons[0]);

        await waitFor(() => {
            expect(toggleWatchlistAction).toHaveBeenCalledWith('1');
        });
    });
});
