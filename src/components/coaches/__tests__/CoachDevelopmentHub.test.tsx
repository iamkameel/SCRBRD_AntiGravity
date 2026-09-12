import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { CoachDevelopmentHub } from '../CoachDevelopmentHub';

// Mock server actions
vi.mock('@/app/actions/skillActions', () => ({
    logSkillAssessmentAction: vi.fn().mockResolvedValue({ success: true, id: 'test_assess_123' }),
    assignInterventionAction: vi.fn().mockResolvedValue({ success: true, id: 'test_int_123' }),
    getPlayersForDevelopmentAction: vi.fn().mockResolvedValue({
        success: true,
        players: [
            {
                id: 'p1',
                name: 'Lethabo Nkosi',
                role: 'Opener',
                readinessStatus: 'Ready',
                medicalRestrictions: [],
                dotBallPercentage: 48,
                strikeRate: 104,
            },
            {
                id: 'p2',
                name: 'Callum Smith',
                role: 'Strike Pace Bowler',
                readinessStatus: 'Caution',
                medicalRestrictions: ['Lumbar Strain'],
                dotBallPercentage: 35,
                strikeRate: 125,
            }
        ]
    }),
    getPlayerAssessmentsAction: vi.fn().mockResolvedValue({ success: true, assessments: [] }),
    getPlayerInterventionsAction: vi.fn().mockResolvedValue({ success: true, interventions: [] }),
    getPlayerReadinessAction: vi.fn().mockResolvedValue({ success: true, readiness: null }),
    getPlayerDevelopmentTrendAction: vi.fn().mockResolvedValue({ success: true, trend: null }),
}));

describe('CoachDevelopmentHub', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders header, workflow stage stepper, and player options', async () => {
        render(<CoachDevelopmentHub />);

        expect(screen.getByText(/COACH/i)).toBeInTheDocument();
        expect(screen.getByText(/DEVELOPMENT HUB/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getAllByText(/Lethabo Nkosi/i).length).toBeGreaterThan(0);
        });
    });

    it('allows changing active workflow stage to Diagnosis and displays diagnosis profile', async () => {
        render(<CoachDevelopmentHub />);

        await waitFor(() => {
            expect(screen.getByText('Lethabo Nkosi (Opener)')).toBeInTheDocument();
        });

        const diagnosisBtn = screen.getByText('Diagnosis').closest('button')!;
        fireEvent.click(diagnosisBtn);

        await waitFor(() => {
            expect(screen.getByText(/ATHLETE PERFORMANCE & SAFETY PROFILE/i)).toBeInTheDocument();
        });
    });

    it('displays medical caution notice when player with medical restriction is selected', async () => {
        render(<CoachDevelopmentHub />);

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'p2' } });

        await waitFor(() => {
            expect(screen.getAllByText(/Strike Pace Bowler/i).length).toBeGreaterThan(0);
        });

        fireEvent.click(screen.getByText('Diagnosis').closest('button')!);

        await waitFor(() => {
            expect(screen.getByText(/Medical Restriction Active/i)).toBeInTheDocument();
        });
    });

    it('navigates to Prescription stage and renders targeted drill recommendations', async () => {
        render(<CoachDevelopmentHub />);

        await waitFor(() => {
            expect(screen.getByText('Lethabo Nkosi (Opener)')).toBeInTheDocument();
        });

        const prescriptionBtn = screen.getByText('Prescription').closest('button')!;
        fireEvent.click(prescriptionBtn);

        await waitFor(() => {
            expect(screen.getByText(/RECOMMENDED INTERVENTIONS/i)).toBeInTheDocument();
        });
    });
});
