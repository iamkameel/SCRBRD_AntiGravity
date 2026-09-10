import { describe, it, expect } from 'vitest';
import { recommendationEngine } from '@/services/recommendationEngine';
import { DevelopmentNeed, Drill } from '@/types/drills';

describe('recommendationEngine Unit Tests', () => {
    const sampleNeed: DevelopmentNeed = {
        personId: 'player-101',
        domain: 'Batting',
        attribute: 'strike rotation',
        roleArchetype: 'Opener',
        weaknessSeverity: 7, // 1-9
        roleImportance: 4,   // 1-5
        coachPriority: 5,    // 1-5
        performanceImpact: 4 // 1-5
    };

    it('correctly calculates Development Need Score', () => {
        // Score = 4 * 7 * 4 * 5 = 560
        const score = recommendationEngine.calculateDevelopmentNeedScore(sampleNeed);
        expect(score).toBe(560);
    });

    it('generates ranked recommendations matching player attributes', () => {
        const recs = recommendationEngine.generateRecommendations('player-101', [sampleNeed]);
        expect(recs.length).toBeGreaterThan(0);
        expect(recs[0].drillName).toBe('Drop-and-Run Strike Rotation');
        expect(recs[0].medicalSafetyCleared).toBe(true);
        expect(recs[0].confidenceLevel).toBe('High');
    });

    it('enforces medical safety rule 21.6 by filtering out restricted drills', () => {
        const yorkerNeed: DevelopmentNeed = {
            personId: 'player-102',
            domain: 'Bowling',
            attribute: 'death-over execution',
            roleArchetype: 'Death Bowler',
            weaknessSeverity: 8,
            roleImportance: 5,
            coachPriority: 5,
            performanceImpact: 5
        };

        // Yorker Target Grid Series requires Back Injury clearance
        const recsWithBackInjury = recommendationEngine.generateRecommendations('player-102', [yorkerNeed], ['Back Injury']);
        const yorkerRec = recsWithBackInjury.find(r => r.drillName === 'Yorker Target Grid Series');

        // Must NOT recommend Yorker drill to player with Back Injury!
        expect(yorkerRec).toBeUndefined();
    });
});
