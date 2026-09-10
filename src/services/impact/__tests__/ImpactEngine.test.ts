import { describe, it, expect } from 'vitest';
import { ImpactEngine, ImpactInningsContext } from '../ImpactEngine';
import { ScoringAction } from '../../../types/scoring';
import { Match, UUID } from '../../../types/schema_v4';

describe('ImpactEngine', () => {

    const mockFixtureId = 'fixture-1' as UUID;
    const mockBallId = 'ball-1' as UUID;
    const mockPersonId = 'person-1' as UUID;

    const baseInnings: ImpactInningsContext = {
        inningsNumber: 1,
        runs: 0,
        wickets: 0,
        balls: 0,
        maxOvers: 20
    };

    const baseMatch: Match = {
        id: 'match-1' as UUID,
        fixtureId: mockFixtureId,
        liveStatus: 'innings_1',
        matchState: 'in_progress',
        duckworthLewisUsed: false,
        versionNo: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const baseBall: ScoringAction = {
        id: mockBallId,
        matchId: 'match-1',
        sequenceNumber: 1,
        inningsNumber: 1,
        timestamp: new Date().toISOString(),
        overNumber: 0,
        ballInOver: 1,
        strikerId: mockPersonId,
        nonStrikerId: 'person-2',
        bowlerId: 'bowler-1',
        runsOffBat: 0,
        totalRuns: 0,
        isLegalDelivery: true,
        isWicket: false,
        extras: { wide: 0, noBall: 0, bye: 0, legBye: 0, penalty: 0 },
        source: 'live',
        isVoided: false,
        createdAt: new Date().toISOString()
    };

    it('should calculate base impact for a dot ball correctly', () => {
        const impact = ImpactEngine.calculateBallImpact(baseBall, baseInnings, baseMatch as any);
        // Base dot ball impact is 1.0. Pressure mult is 1.0.
        expect(impact.baseImpactValue).toBe(1.0);
        expect(impact.totalImpactValue).toBe(1.0);
        expect(impact.phase).toBe('Powerplay');
    });

    it('should calculate base impact for a boundary (4) correctly', () => {
        const boundaryFour: ScoringAction = {
            ...baseBall,
            runsOffBat: 4,
            totalRuns: 4
        };
        const impact = ImpactEngine.calculateBallImpact(boundaryFour, baseInnings, baseMatch as any);
        // Base runs (4) + Boundary bonus (2.0) = 6.0 + 3.0 (swing) = 9.0 total
        expect(impact.baseImpactValue).toBe(6.0);
        expect(impact.totalImpactValue).toBe(9.0);
    });

    it('should calculate base impact for a wicket correctly', () => {
        const wicketBall: ScoringAction = {
            ...baseBall,
            isWicket: true,
            wicket: {
                type: 'bowled',
                dismissedPlayerId: mockPersonId
            }
        };
        const impact = ImpactEngine.calculateBallImpact(wicketBall, baseInnings, baseMatch as any);
        // Base wicket value is 30.0.
        expect(impact.baseImpactValue).toBe(30.0);
    });

    it('should apply a pressure multiplier for death overs', () => {
        const deathBall: ScoringAction = { ...baseBall, overNumber: 18 };
        const deathInnings: ImpactInningsContext = { ...baseInnings, balls: 108 };
        const impact = ImpactEngine.calculateBallImpact(deathBall, deathInnings, baseMatch as any);

        // Base dot (1.0) * Death Multiplier (1.0) = 1.0
        expect(impact.pressureMultiplier).toBe(1.0);
        expect(impact.totalImpactValue).toBe(1.0);
        expect(impact.phase).toBe('Death');
    });

    it('should apply higher pressure in a high-RR chase', () => {
        const chaseInnings: ImpactInningsContext = {
            ...baseInnings,
            inningsNumber: 2,
            target: 100,
            runs: 50,
            balls: 100, // 20 balls left -> reqRR = 15
        };
        const impact = ImpactEngine.calculateBallImpact(baseBall, chaseInnings, baseMatch as any);
        expect(impact.pressureMultiplier).toBe(1.8);
        expect(impact.pressureState).toBe('Elevated');
    });
});
