import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TalentPathwayEngine } from '../TalentPathwayEngine';

vi.mock('@/app/actions/scoutingActions', () => ({
    nominateProvincialCampAction: vi.fn().mockResolvedValue({ success: true, id: 'camp_123' }),
    toggleWatchlistAction: vi.fn().mockResolvedValue({ success: true, added: true }),
}));

describe('TalentPathwayEngine Component', () => {
    it('renders talent pathway metrics and prospects', () => {
        render(<TalentPathwayEngine />);
        expect(screen.getByText(/SELECTION PATHWAY &/i)).toBeInTheDocument();
        expect(screen.getByText('Jaxon Reed')).toBeInTheDocument();
        expect(screen.getByText('Liam Smith')).toBeInTheDocument();
    });

    it('filters prospects by pathway stage funnel tier click', () => {
        render(<TalentPathwayEngine />);
        const tierButtons = screen.getAllByRole('button', { name: /Zonal Select/i });
        fireEvent.click(tierButtons[0]);
        expect(screen.getByText('Ethan Miller')).toBeInTheDocument();
        expect(screen.queryByText('Jaxon Reed')).not.toBeInTheDocument();
    });

    it('toggles provincial camp nomination', async () => {
        render(<TalentPathwayEngine />);
        const nominateButtons = screen.getAllByRole('button', { name: /Nominate Camp/i });
        fireEvent.click(nominateButtons[0]);
        expect(screen.getAllByText('Nominated').length).toBeGreaterThan(0);
    });
});
