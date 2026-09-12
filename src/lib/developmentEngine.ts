/**
 * SCRBRD Player Development Intelligence Engine
 * Implements role-weighted domain calculations, skill normalisation (1-9 to 0-100),
 * development need scoring, and rules-based drill recommendations.
 * 
 * Reference: SCRBRD Cricket OS Specification Sections 11, 12, 13, 16, 17
 */

import { RoleArchetype, SkillDomain } from "@/types/schema_v4";
import { Drill, DevelopmentNeed, DrillRecommendation } from "@/types/drills";
import { MASTER_DRILL_LIBRARY } from "./drillLibrary";

/**
 * Normalise a 1-9 coach rating to a 0-100 percentage score.
 * Formula: ((raw_score - 1) / 8) * 100
 */
export function normalizeSkillScore(rawScore1to9: number): number {
    const clamped = Math.max(1, Math.min(9, rawScore1to9));
    return Math.round(((clamped - 1) / 8) * 100);
}

/**
 * Role-weighted domain importance vectors for the 16 core Cricket role archetypes.
 * Sum of weights per role equals 1.0 (100%).
 */
export const ROLE_DOMAIN_WEIGHTS: Record<RoleArchetype, Record<SkillDomain, number>> = {
    // Batting Roles
    "Opener": {
        Batting: 0.40,
        Tactical: 0.20,
        Mental: 0.20,
        Physical: 0.10,
        Fielding: 0.10,
        Bowling: 0.00,
        Wicketkeeping: 0.00,
    },
    "Top-order Anchor": {
        Batting: 0.45,
        Mental: 0.20,
        Tactical: 0.15,
        Physical: 0.10,
        Fielding: 0.10,
        Bowling: 0.00,
        Wicketkeeping: 0.00,
    },
    "Middle-order Stabiliser": {
        Batting: 0.40,
        Mental: 0.25,
        Tactical: 0.15,
        Physical: 0.10,
        Fielding: 0.10,
        Bowling: 0.00,
        Wicketkeeping: 0.00,
    },
    "Aggressive Middle-order Batter": {
        Batting: 0.45,
        Physical: 0.20,
        Tactical: 0.15,
        Mental: 0.10,
        Fielding: 0.10,
        Bowling: 0.00,
        Wicketkeeping: 0.00,
    },
    "Finisher": {
        Batting: 0.45,
        Mental: 0.25,
        Tactical: 0.15,
        Physical: 0.10,
        Fielding: 0.05,
        Bowling: 0.00,
        Wicketkeeping: 0.00,
    },
    "Batting All-rounder": {
        Batting: 0.35,
        Bowling: 0.25,
        Tactical: 0.15,
        Mental: 0.10,
        Physical: 0.10,
        Fielding: 0.05,
        Wicketkeeping: 0.00,
    },

    // Bowling Roles
    "New-ball Seamer": {
        Bowling: 0.45,
        Physical: 0.20,
        Tactical: 0.15,
        Mental: 0.10,
        Fielding: 0.10,
        Batting: 0.00,
        Wicketkeeping: 0.00,
    },
    "Strike Pace Bowler": {
        Bowling: 0.45,
        Physical: 0.25,
        Tactical: 0.10,
        Mental: 0.10,
        Fielding: 0.10,
        Batting: 0.00,
        Wicketkeeping: 0.00,
    },
    "Containment Seamer": {
        Bowling: 0.40,
        Tactical: 0.25,
        Mental: 0.15,
        Physical: 0.10,
        Fielding: 0.10,
        Batting: 0.00,
        Wicketkeeping: 0.00,
    },
    "Finger Spinner": {
        Bowling: 0.45,
        Tactical: 0.20,
        Mental: 0.15,
        Physical: 0.10,
        Fielding: 0.10,
        Batting: 0.00,
        Wicketkeeping: 0.00,
    },
    "Wrist Spinner": {
        Bowling: 0.45,
        Tactical: 0.20,
        Mental: 0.15,
        Physical: 0.10,
        Fielding: 0.10,
        Batting: 0.00,
        Wicketkeeping: 0.00,
    },
    "Middle-over Control Bowler": {
        Bowling: 0.40,
        Tactical: 0.25,
        Mental: 0.15,
        Physical: 0.10,
        Fielding: 0.10,
        Batting: 0.00,
        Wicketkeeping: 0.00,
    },
    "Death Bowler": {
        Bowling: 0.45,
        Mental: 0.20,
        Tactical: 0.15,
        Physical: 0.10,
        Fielding: 0.10,
        Batting: 0.00,
        Wicketkeeping: 0.00,
    },
    "Bowling All-rounder": {
        Bowling: 0.35,
        Batting: 0.25,
        Tactical: 0.15,
        Physical: 0.15,
        Mental: 0.05,
        Fielding: 0.05,
        Wicketkeeping: 0.00,
    },

    // Specialist Roles
    "Specialist Wicketkeeper": {
        Wicketkeeping: 0.35,
        Fielding: 0.15,
        Tactical: 0.15,
        Mental: 0.15,
        Physical: 0.10,
        Batting: 0.10,
        Bowling: 0.00,
    },
    "Wicketkeeper-Batter": {
        Batting: 0.35,
        Wicketkeeping: 0.25,
        Tactical: 0.15,
        Mental: 0.15,
        Physical: 0.05,
        Fielding: 0.05,
        Bowling: 0.00,
    },
    "Wicketkeeper-Finisher": {
        Batting: 0.35,
        Wicketkeeping: 0.25,
        Mental: 0.20,
        Tactical: 0.10,
        Physical: 0.05,
        Fielding: 0.05,
        Bowling: 0.00,
    },
    "Fielding Specialist": {
        Fielding: 0.45,
        Physical: 0.25,
        Mental: 0.15,
        Tactical: 0.15,
        Batting: 0.00,
        Bowling: 0.00,
        Wicketkeeping: 0.00,
    },
};

/**
 * Calculate role-weighted skill score (0-100) based on domain scores.
 */
export function calculateRoleSkillScore(
    domainScores: Partial<Record<SkillDomain, number>>,
    role: RoleArchetype
): number {
    const weights = ROLE_DOMAIN_WEIGHTS[role];
    if (!weights) return 0;

    let weightedSum = 0;
    let totalWeight = 0;

    (Object.keys(weights) as SkillDomain[]).forEach((domain) => {
        const weight = weights[domain];
        if (weight > 0) {
            const score = domainScores[domain] ?? 50; // Default baseline if not assessed
            weightedSum += score * weight;
            totalWeight += weight;
        }
    });

    return totalWeight === 0 ? 0 : Math.round(weightedSum / totalWeight);
}

/**
 * Calculate Development Need Score for an attribute.
 * Formula: roleImportance * weaknessSeverity * performanceImpact * coachPriority
 */
export function calculateDevelopmentNeedScore(
    roleImportance: number,
    weaknessSeverity: number,
    performanceImpact: number = 3,
    coachPriority: number = 3
): number {
    return roleImportance * weaknessSeverity * performanceImpact * coachPriority;
}

/**
 * Filter drills against active medical restrictions and readiness state.
 */
export function checkDrillMedicalSafety(
    drill: Drill,
    medicalRestrictions: string[],
    readinessStatus: string
): { safe: boolean; warning?: string } {
    if (readinessStatus === 'Unavailable' || readinessStatus === 'Restricted') {
        // High intensity or explosive drills disallowed if restricted
        if (drill.intensity === 'High' || drill.intensity === 'Elite') {
            return { safe: false, warning: `Drill intensity '${drill.intensity}' unsafe during ${readinessStatus} readiness` };
        }
    }

    if (medicalRestrictions && medicalRestrictions.length > 0) {
        const hasConflict = drill.injuryRestrictions.some(restriction =>
            medicalRestrictions.some(med => med.toLowerCase().includes(restriction.toLowerCase()) || restriction.toLowerCase().includes(med.toLowerCase()))
        );

        if (hasConflict) {
            return { safe: false, warning: `Contraindicated for active medical restriction` };
        }
    }

    return { safe: true };
}

/**
 * Rules-Based Drill Recommendation Engine V1
 * Evaluates player role, weakness areas (rating < 5), and readiness to generate recommendations.
 */
export function generateDrillRecommendations(
    personId: string,
    role: RoleArchetype,
    assessments: Array<{ domain: SkillDomain; attributeName: string; rating: number }>,
    readinessStatus: string = 'Ready',
    medicalRestrictions: string[] = []
): DrillRecommendation[] {
    const recommendations: DrillRecommendation[] = [];

    // Identify weak attributes (rating <= 5 on 1-9 scale)
    const weakItems = assessments.filter(a => a.rating <= 5);

    weakItems.forEach(item => {
        const weaknessSeverity = 10 - item.rating; // 1 (rating 9) to 9 (rating 1)
        const roleWeight = ROLE_DOMAIN_WEIGHTS[role]?.[item.domain] || 0.1;
        const roleImportance = Math.ceil(roleWeight * 10);

        const needScore = calculateDevelopmentNeedScore(roleImportance, weaknessSeverity);

        // Find drills matching domain and attribute or category
        const candidateDrills = MASTER_DRILL_LIBRARY.filter(drill => {
            const matchesCategory = drill.category.toLowerCase() === item.domain.toLowerCase();
            const matchesAttribute = drill.linkedAttributes.some(attr =>
                attr.toLowerCase().includes(item.attributeName.toLowerCase()) ||
                item.attributeName.toLowerCase().includes(attr.toLowerCase())
            );
            return matchesCategory || matchesAttribute;
        });

        candidateDrills.forEach(drill => {
            const safety = checkDrillMedicalSafety(drill, medicalRestrictions, readinessStatus);
            if (safety.safe) {
                recommendations.push({
                    id: `rec_${drill.id}_${Date.now()}`,
                    personId,
                    drillId: drill.id,
                    drillName: drill.name,
                    category: drill.category,
                    subcategory: drill.subcategory,
                    developmentNeedScore: needScore,
                    confidenceLevel: assessments.length > 5 ? 'High' : 'Moderate',
                    rationale: `Targeted intervention for ${item.attributeName} (Rating: ${item.rating}/9) weighted for ${role} role.`,
                    medicalSafetyCleared: true,
                    generatedAt: new Date().toISOString(),
                });
            }
        });
    });

    // Sort by highest development need score and return top 5
    return recommendations
        .sort((a, b) => b.developmentNeedScore - a.developmentNeedScore)
        .slice(0, 5);
}
