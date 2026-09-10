import { describe, it, expect } from 'vitest';
import { ImpactAttributor } from '../ImpactAttributor';
import { Rankings } from '../../../types/firestore';
import { ScoringAction } from '../../../types/scoring';
import { UUID } from '../../../types/schema_v4';

describe('ImpactAttributor', () => {

    const mockFixtureId = 'fixture-1' as UUID;
    const mockInningsId = 'innings-1' as UUID;
    const mockBallId = 'ball-1' as UUID;
    const mockStrikerId = 'striker-1' as UUID;
    const mockBowlerId = 'bowler-1' as UUID;
    const mockFielderId = 'fielder-1' as UUID;

    const baseImpactEvent: Rankings.MatchImpactEvent = {
        id: 'impact-1' as UUID,
        fixtureId: mockFixtureId,
        inningsId: mockInningsId,
        overNumber: 1,
        ballNumber: 1,
        eventType: 'Runs',
        phase: 'Powerplay',
        pressureState: 'Normal',
        baseImpactValue: 1.0,
        contextMultiplier: 1.0,
        pressureMultiplier: 1.0,
        oppositionMultiplier: 1.0,
        swingAdjustment: 0,
        totalImpactValue: 1.0,
        battingTeamImpact: 1.0,
        bowlingTeamImpact: 0,
        createdAt: new Date().toISOString()
    };

    const baseBall: ScoringAction = {
        id: mockBallId,
        matchId: 'match-1',
        sequenceNumber: 1,
        inningsNumber: 1,
        timestamp: new Date().toISOString(),
        overNumber: 0,
        ballInOver: 1,
        strikerId: mockStrikerId,
        nonStrikerId: 'non-striker-1',
        bowlerId: mockBowlerId,
        runsOffBat: 1,
        totalRuns: 1,
        isLegalDelivery: true,
        isWicket: false,
        extras: { wide: 0, noBall: 0, bye: 0, legBye: 0, penalty: 0 },
        source: 'live',
        isVoided: false,
        createdAt: new Date().toISOString()
    };

    it('should attribute impact to both batter and bowler for a single run', () => {
        const attributions = ImpactAttributor.attributeImpact(baseImpactEvent, baseBall);

        const batterAttr = attributions.find(a => a.roleType === 'Batter');
        const bowlerAttr = attributions.find(a => a.roleType === 'Bowler');

        expect(batterAttr).toBeDefined();
        expect(bowlerAttr).toBeDefined();
        expect(batterAttr?.impactValue).toBe(1.0); // Full positive impact for run
        expect(bowlerAttr?.impactValue).toBe(-0.5); // Conceded 1 run = -0.5 impact
    });

    it('should split impact between bowler and fielder for a catch', () => {
        const wicketImpact: Rankings.MatchImpactEvent = {
            ...baseImpactEvent,
            eventType: 'Wicket',
            totalImpactValue: 25.0
        };
        const catchBall: ScoringAction = {
            ...baseBall,
            isWicket: true,
            wicket: {
                type: 'caught',
                dismissedPlayerId: mockStrikerId,
                fielderIds: [mockFielderId]
            }
        };

        const attributions = ImpactAttributor.attributeImpact(wicketImpact, catchBall);

        const bowlerAttr = attributions.find(a => a.roleType === 'Bowler');
        const fielderAttr = attributions.find(a => a.roleType === 'Fielder');

        expect(bowlerAttr?.impactValue).toBe(17.5); // 70% of 25.0
        expect(fielderAttr?.impactValue).toBe(7.5);  // 30% of 25.0
    });

    it('should attribute full impact to bowler for a bowled wicket', () => {
        const wicketImpact: Rankings.MatchImpactEvent = {
            ...baseImpactEvent,
            eventType: 'Wicket',
            totalImpactValue: 25.0
        };
        const bowledBall: ScoringAction = {
            ...baseBall,
            isWicket: true,
            wicket: {
                type: 'bowled',
                dismissedPlayerId: mockStrikerId
            }
        };

        const attributions = ImpactAttributor.attributeImpact(wicketImpact, bowledBall);

        const bowlerAttr = attributions.find(a => a.roleType === 'Bowler');

        expect(bowlerAttr?.impactValue).toBe(25.0); // Total impact
    });
});
