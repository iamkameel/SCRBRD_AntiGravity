import { describe, it, expect } from 'vitest';
import { generateDrillRecommendations, getRoleImportance } from '../drillRecommendationEngine';

describe('drillRecommendationEngine', () => {
    it('correctly retrieves role importance multipliers', () => {
        expect(getRoleImportance('Opener', 'strike rotation')).toBe(5);
        expect(getRoleImportance('Death Bowler', 'death-over execution')).toBe(5);
        expect(getRoleImportance('Finisher', 'boundary hitting')).toBe(5);
        expect(getRoleImportance('Unknown Role', 'strike rotation')).toBe(3); // Default fallback
    });

    it('recommends weakness remediation drill for Opener with low strike rotation score', () => {
        const recommendations = generateDrillRecommendations({
            personId: 'player-001',
            roleArchetype: 'Opener',
            readinessScore: 85,
            attributeScores: {
                'strike rotation': 2, // Low score < 5
                'defensive technique': 7,
            },
        });

        expect(recommendations.length).toBeGreaterThan(0);
        const topRec = recommendations[0];
        expect(topRec.drill.id).toBe('bat-001'); // Drop-and-Run Strike Rotation
        expect(topRec.recommendationType).toBe('weakness_remediation');
        expect(topRec.confidenceLevel).toBe('high');
    });

    it('recommends death bowling drill for Death Bowler with low death execution score', () => {
        const recommendations = generateDrillRecommendations({
            personId: 'player-002',
            roleArchetype: 'Death Bowler',
            readinessScore: 90,
            attributeScores: {
                'death-over execution': 3,
            },
        });

        expect(recommendations.length).toBeGreaterThan(0);
        expect(recommendations[0].drill.id).toBe('bowl-001'); // Yorker Target Grid
        expect(recommendations[0].developmentNeedScore).toBeGreaterThan(100);
    });

    it('filters out high intensity drills when readiness score is low (< 50)', () => {
        const recommendations = generateDrillRecommendations({
            personId: 'player-003',
            roleArchetype: 'Finisher',
            readinessScore: 40, // Low readiness
            attributeScores: {
                'boundary hitting': 2, // Low score targets High intensity 'bat-003'
            },
        });

        // High intensity Power Hitting Range Expansion (bat-003) should be filtered out
        const highIntensityDrill = recommendations.find((r) => r.drill.id === 'bat-003');
        expect(highIntensityDrill).toBeUndefined();
    });
});
