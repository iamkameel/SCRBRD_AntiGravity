import { describe, it, expect } from 'vitest';
import {
    classifyShotSector,
    calculatePhaseBreakdown,
    calculateSectorDistribution,
    calculateDLSTelemetry,
    BallPerformance
} from '../analyticsMath';

describe('Analytics Math & Telemetry Engine', () => {
    describe('classifyShotSector', () => {
        it('correctly classifies straight shots', () => {
            expect(classifyShotSector(0)).toBe('Straight / Long On/Off');
            expect(classifyShotSector(350)).toBe('Straight / Long On/Off');
            expect(classifyShotSector(10)).toBe('Straight / Long On/Off');
        });

        it('correctly classifies cover and point shots', () => {
            expect(classifyShotSector(45)).toBe('Cover / Extra Cover');
            expect(classifyShotSector(90)).toBe('Point / Backward Point');
        });

        it('correctly classifies leg side and mid-wicket shots', () => {
            expect(classifyShotSector(270)).toBe('Mid-Wicket / Cow Corner');
            expect(classifyShotSector(180)).toBe('Fine Leg / Behind Wicket');
        });
    });

    describe('calculatePhaseBreakdown', () => {
        it('aggregates balls into Powerplay, Middle, and Death overs', () => {
            const mockBalls: BallPerformance[] = [
                { overNumber: 2, ballNumber: 1, runs: 4 },
                { overNumber: 4, ballNumber: 3, runs: 6 },
                { overNumber: 8, ballNumber: 2, runs: 1 },
                { overNumber: 12, ballNumber: 5, runs: 2, isWicket: true },
                { overNumber: 18, ballNumber: 4, runs: 6 },
                { overNumber: 19, ballNumber: 6, runs: 4 },
            ];

            const phases = calculatePhaseBreakdown(mockBalls);

            expect(phases).toHaveLength(3);

            // Powerplay
            expect(phases[0].phase).toBe('Powerplay');
            expect(phases[0].runs).toBe(10);
            expect(phases[0].balls).toBe(2);
            expect(phases[0].boundaryCount).toBe(2);

            // Middle Overs
            expect(phases[1].phase).toBe('Middle Overs');
            expect(phases[1].runs).toBe(3);
            expect(phases[1].wickets).toBe(1);

            // Death Overs
            expect(phases[2].phase).toBe('Death Overs');
            expect(phases[2].runs).toBe(10);
            expect(phases[2].boundaryCount).toBe(2);
        });
    });

    describe('calculateSectorDistribution', () => {
        it('calculates percentage of runs per sector', () => {
            const mockBalls: BallPerformance[] = [
                { overNumber: 1, ballNumber: 1, runs: 4, angle: 45 },
                { overNumber: 1, ballNumber: 2, runs: 6, angle: 45 },
                { overNumber: 2, ballNumber: 1, runs: 2, angle: 270 },
            ];

            const distribution = calculateSectorDistribution(mockBalls);
            const coverSector = distribution.find((d) => d.sector === 'Cover / Extra Cover');
            const midWicketSector = distribution.find((d) => d.sector === 'Mid-Wicket / Cow Corner');

            expect(coverSector).toBeDefined();
            expect(coverSector?.runsScored).toBe(10);
            expect(coverSector?.percentageOfRuns).toBe(83.3);

            expect(midWicketSector).toBeDefined();
            expect(midWicketSector?.runsScored).toBe(2);
            expect(midWicketSector?.percentageOfRuns).toBe(16.7);
        });
    });

    describe('calculateDLSTelemetry', () => {
        it('calculates required run rate and par score status correctly', () => {
            const telemetry = calculateDLSTelemetry(160, 100, 10, 2);

            expect(telemetry.requiredRunRate).toBe(6.0);
            expect(telemetry.parScore).toBe(88); // 160 * 0.5 + 8
            expect(telemetry.status).toBe('ahead');
        });

        it('handles completed overs match scenario', () => {
            const telemetry = calculateDLSTelemetry(160, 162, 0, 4);

            expect(telemetry.requiredRunRate).toBe(0);
            expect(telemetry.status).toBe('ahead');
        });
    });
});
