import { Drill, MASTER_DRILL_LIBRARY } from './drillLibrary';

export interface PlayerAssessmentInput {
    personId: string;
    roleArchetype: string;
    readinessScore: number;
    medicalRestrictions?: string[];
    attributeScores: Record<string, number>; // 1-9 scale
    coachPriorityOverrides?: Record<string, number>; // 1-5 multiplier
}

export interface DevelopmentNeed {
    attribute: string;
    severity: number; // 1-100 scale (derived from 1-9 score)
    roleImportance: number; // 1-5 multiplier
    developmentNeedScore: number;
}

export interface DrillRecommendationResult {
    drill: Drill;
    recommendationType: 'weakness_remediation' | 'strength_sharpening';
    confidenceLevel: 'high' | 'moderate' | 'low';
    developmentNeedScore: number;
    reason: string;
}

/**
 * Calculates role importance multiplier (1 to 5) for a given attribute and role archetype.
 */
export function getRoleImportance(roleArchetype: string, attribute: string): number {
    const roleMap: Record<string, Record<string, number>> = {
        Opener: {
            'strike rotation': 5,
            'defensive technique': 5,
            'gap finding': 4,
            'playing pace': 4,
        },
        Finisher: {
            'boundary hitting': 5,
            'shot range': 5,
            'batting under pressure': 5,
        },
        'Death Bowler': {
            'death-over execution': 5,
            'control': 5,
            'line discipline': 4,
        },
        'Specialist Wicketkeeper': {
            'leg-side takes': 5,
            'glove work': 5,
            'reaction speed': 5,
        },
        'New-ball Seamer': {
            'new-ball execution': 5,
            'seam / swing / drift / shape': 5,
            'release consistency': 4,
        },
    };

    return roleMap[roleArchetype]?.[attribute] || 3;
}

/**
 * Generates drill recommendations based on player assessment, role archetype, and medical safety rules.
 */
export function generateDrillRecommendations(
    input: PlayerAssessmentInput,
    customLibrary: Drill[] = MASTER_DRILL_LIBRARY
): DrillRecommendationResult[] {
    const { roleArchetype, readinessScore, medicalRestrictions = [], attributeScores, coachPriorityOverrides = {} } = input;

    const recommendations: DrillRecommendationResult[] = [];

    // Identify weaknesses (score < 5 out of 9) and strengths (score >= 7 out of 9)
    Object.entries(attributeScores).forEach(([attribute, score1to9]) => {
        const isWeakness = score1to9 < 5;
        const isStrength = score1to9 >= 7;

        if (!isWeakness && !isStrength) return;

        // Normalise 1-9 to weakness severity (0-100)
        const weaknessSeverity = isWeakness ? ((5 - score1to9) / 4) * 100 : 20;
        const roleImportance = getRoleImportance(roleArchetype, attribute);
        const coachPriority = coachPriorityOverrides[attribute] || 1;
        const performanceImpact = 1.2;

        const developmentNeedScore = Math.round(roleImportance * weaknessSeverity * performanceImpact * coachPriority);

        // Find drills in library that target this attribute
        const matchingDrills = customLibrary.filter((drill) =>
            drill.linkedAttributes.includes(attribute)
        );

        matchingDrills.forEach((drill) => {
            // Medical Safety Filter
            if (drill.intensity === 'High' && readinessScore < 50) {
                return; // Exclude high intensity drill if readiness is dangerously low
            }

            if (
                medicalRestrictions.length > 0 &&
                drill.injuryRestrictions?.some((restriction) => medicalRestrictions.includes(restriction))
            ) {
                return; // Exclude restricted drill
            }

            let confidenceLevel: 'high' | 'moderate' | 'low' = 'high';
            if (readinessScore < 65) confidenceLevel = 'moderate';

            recommendations.push({
                drill,
                recommendationType: isWeakness ? 'weakness_remediation' : 'strength_sharpening',
                confidenceLevel,
                developmentNeedScore,
                reason: isWeakness
                    ? `Remediates low ${attribute} (score ${score1to9}/9) for ${roleArchetype} role.`
                    : `Sharpens elite ${attribute} (score ${score1to9}/9) strength.`,
            });
        });
    });

    // Sort recommendations by Development Need Score descending
    return recommendations.sort((a, b) => b.developmentNeedScore - a.developmentNeedScore);
}
