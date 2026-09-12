import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PotentialVsAbilityRadar } from '../PotentialVsAbilityRadar';

describe('PotentialVsAbilityRadar Component', () => {
    it('renders radar graph header and athlete name', () => {
        render(<PotentialVsAbilityRadar athleteName="James Anderson" />);
        expect(screen.getByText('Current Ability')).toBeInTheDocument();
        expect(screen.getByText(/Projected Potential/i)).toBeInTheDocument();
        expect(screen.getByText('Technical Mechanics')).toBeInTheDocument();
        expect(screen.getByText('Mental Composure')).toBeInTheDocument();
    });

    it('renders custom dimensions correctly', () => {
        const customDimensions = [
            { key: 'batting', label: 'Batting Skill', current: 80, potential: 95 },
            { key: 'bowling', label: 'Bowling Control', current: 70, potential: 88 },
            { key: 'fitness', label: 'Fitness Engine', current: 85, potential: 92 },
        ];

        render(<PotentialVsAbilityRadar dimensions={customDimensions} athleteName="Noah Patel" />);
        expect(screen.getByText('Batting Skill')).toBeInTheDocument();
        expect(screen.getByText('Bowling Control')).toBeInTheDocument();
        expect(screen.getByText('Fitness Engine')).toBeInTheDocument();
    });
});
