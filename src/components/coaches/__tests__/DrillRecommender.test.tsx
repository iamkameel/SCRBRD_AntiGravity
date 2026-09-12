import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { DrillRecommender } from '../DrillRecommender';

describe('DrillRecommender', () => {
    it('renders recommender title and initial awaiting state', () => {
        render(
            <DrillRecommender 
                playerId="p1" 
                playerName="Lethabo Nkosi" 
                role="Opener" 
            />
        );

        expect(screen.getByText(/INTERVENTION/i)).toBeInTheDocument();
        expect(screen.getByText(/PLANNER/i)).toBeInTheDocument();
        expect(screen.getByText(/AWAITING SYSTEM DIAGNOSIS/i)).toBeInTheDocument();
    });

    it('runs analysis and displays generated drill protocols', async () => {
        render(
            <DrillRecommender 
                playerId="p1" 
                playerName="Lethabo Nkosi" 
                role="Opener" 
                assessments={[
                    {
                        id: 'a1',
                        personId: 'p1',
                        assessorId: 'c1',
                        domain: 'Batting',
                        attributeName: 'Rotation',
                        rating: 2,
                        confidence: 'High',
                        assessedAt: new Date().toISOString()
                    }
                ]}
            />
        );

        const runBtn = screen.getByText(/RUN DIAGNOSIS/i);
        fireEvent.click(runBtn);

        await waitFor(() => {
            expect(screen.getByText(/GENERATED PROTOCOLS/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        expect(screen.getByText(/Strike Rotation/i)).toBeInTheDocument();
    });
});
