import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { PlayerMicroPlanGenerator } from '../PlayerMicroPlanGenerator';

describe('PlayerMicroPlanGenerator', () => {
    it('renders generator header, player selector, and stage navigation', () => {
        render(<PlayerMicroPlanGenerator />);

        expect(screen.getByText(/PLAYER/i)).toBeInTheDocument();
        expect(screen.getByText(/MICRO-PLAN GENERATOR/i)).toBeInTheDocument();
        expect(screen.getByText(/STAGE 01/i)).toBeInTheDocument();
        expect(screen.getByText(/STAGE 02/i)).toBeInTheDocument();
        expect(screen.getByText(/STAGE 03/i)).toBeInTheDocument();
    });

    it('navigates through stages 1, 2, and 3', async () => {
        render(<PlayerMicroPlanGenerator />);

        // Stage 1 initial
        expect(screen.getByText(/Identified Need Scores/i)).toBeInTheDocument();

        // Move to Stage 2
        fireEvent.click(screen.getByText(/Proceed to Plan Construction/i));
        expect(screen.getByText(/Plan Configuration/i)).toBeInTheDocument();

        // Move to Stage 3 via Activate
        fireEvent.click(screen.getByText(/Confirm & Activate Micro-Plan/i));
        expect(screen.getByText(/MICRO-PLAN ACTIVE FOR/i)).toBeInTheDocument();
    });

    it('allows selecting different players', () => {
        render(<PlayerMicroPlanGenerator />);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'p2' } });

        expect(screen.getAllByText(/Marco Jansen/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/Role Profile: Strike Pace Bowler/i)).toBeInTheDocument();
    });

    it('allows toggling drills in Stage 2', () => {
        render(<PlayerMicroPlanGenerator />);

        // Go to Stage 2
        fireEvent.click(screen.getByText(/STAGE 02/i));

        const drillCard = screen.getByText('Yorker Target Grid Protocol');
        fireEvent.click(drillCard);

        expect(screen.getByText('3 Drills')).toBeInTheDocument();
    });
});
