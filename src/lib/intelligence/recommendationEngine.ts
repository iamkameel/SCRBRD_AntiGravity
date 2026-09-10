import { RoleArchetype, SkillDomain, SkillAssessment, ReadinessScore, UUID } from "@/types/schema_v4";
import { Drill, drillService } from "../services/drillService";

/**
 * Role-weighted importance mapping for attributes.
 * Scale: 0.0 to 1.0 (Higher means more critical to the role).
 */
const ROLE_ATTRIBUTE_IMPORTANCE: Record<RoleArchetype, Record<string, number>> = {
    'Opener': {
        'Setup': 1.0, 'Defensive': 1.0, 'Leave': 0.9, 'Rotation': 0.8, 'vs Pace': 1.0, 'Footwork': 0.9, 'Concentration': 1.0
    },
    'Top-order Anchor': {
        'Setup': 0.9, 'Defensive': 0.9, 'Rotation': 1.0, 'Innings Construction': 1.0, 'Concentration': 1.0, 'Decision Making': 0.9
    },
    'Middle-order Stabiliser': {
        'Rotation': 1.0, 'Defensive': 0.8, 'vs Spin': 1.0, 'Innings Construction': 0.9, 'Patience': 1.0
    },
    'Aggressive Middle-order Batter': {
        'Boundary': 1.0, 'Range': 0.9, 'vs Spin': 0.8, 'Intent': 1.0, 'Power': 0.9
    },
    'Finisher': {
        'Boundary': 1.0, 'Pressure': 1.0, 'Decision Making': 0.9, 'Power': 1.0, 'Intent': 1.0
    },
    'Batting All-rounder': {
        'Setup': 0.8, 'Rotation': 0.8, 'Innings Construction': 0.7, 'vs Pace': 0.8, 'Control': 0.7
    },
    'New-ball Seamer': {
        'Rhythm': 0.9, 'New Ball': 1.0, 'Seam/Swing': 1.0, 'Line': 0.9, 'Length': 0.9, 'Control': 0.8
    },
    'Strike Pace Bowler': {
        'Pace': 1.0, 'Threat': 1.0, 'Variation': 0.8, 'Intent': 0.9, 'Power': 0.8
    },
    'Containment Seamer': {
        'Line': 1.0, 'Length': 1.0, 'Control': 1.0, 'Repeatability': 0.9, 'Discipline': 1.0
    },
    'Finger Spinner': {
        'Control': 1.0, 'vs Spin': 0.9, 'Line': 0.9, 'Length': 1.0, 'Variation': 0.7, 'Repeatability': 0.9
    },
    'Wrist Spinner': {
        'Variation': 1.0, 'Threat': 1.0, 'Seam/Swing': 0.9, 'Control': 0.7, 'Reset': 0.8
    },
    'Middle-over Control Bowler': {
        'Control': 1.0, 'Line': 0.9, 'Length': 0.9, 'Middle Overs': 1.0, 'Repeatability': 0.9
    },
    'Death Bowler': {
        'Death': 1.0, 'Pressure': 1.0, 'Variation': 0.9, 'Composure': 1.0, 'Repeatability': 0.8
    },
    'Bowling All-rounder': {
        'Control': 0.8, 'Line': 0.8, 'Length': 0.8, 'Variation': 0.7, 'Endurance': 0.7
    },
    'Specialist Wicketkeeper': {
        'Setup': 1.0, 'Glove Work': 1.0, 'Collection': 1.0, 'Hands': 1.0, 'Standing Up': 0.9, 'Reaction': 1.0
    },
    'Wicketkeeper-Batter': {
        'Setup': 0.9, 'Glove Work': 0.9, 'Rotation': 0.8, 'vs Spin': 0.8, 'Reaction': 0.9
    },
    'Wicketkeeper-Finisher': {
        'Setup': 0.8, 'Glove Work': 0.8, 'Boundary': 0.9, 'Pressure': 1.0, 'Power': 0.8
    },
    'Fielding Specialist': {
        'Catching': 1.0, 'Ground': 1.0, 'Accuracy': 1.0, 'Reflexes': 1.0, 'Anticipation': 1.0, 'Positioning': 0.9
    }
};

export interface IdentifiedNeed {
    domain: SkillDomain;
    attribute: string;
    severity: 'High' | 'Medium' | 'Low';
    impactScore: number; // 0-10
}

/**
 * Core Intelligence Engine for Training Recommendations.
 */
export const recommendationEngine = {
    /**
     * Identify development needs based on assessments and player role.
     */
    getIdentifiedNeeds(
        assessments: SkillAssessment[],
        role: RoleArchetype
    ): IdentifiedNeed[] {
        const needs: IdentifiedNeed[] = [];
        const importanceMap = ROLE_ATTRIBUTE_IMPORTANCE[role] || {};

        // For each assessment, calculate a "Need Score"
        // Need Score = (Importance [0.0 - 1.0]) * (Weakness [1.0 - (Rating/9)]) * 10

        // Group assessments by attribute to get the latest rating
        const latestAssessments: Record<string, SkillAssessment> = {};
        assessments.forEach(a => {
            const key = `${a.domain}:${a.attributeName}`;
            if (!latestAssessments[key] || new Date(a.assessedAt) > new Date(latestAssessments[key].assessedAt)) {
                latestAssessments[key] = a;
            }
        });

        Object.values(latestAssessments).forEach(a => {
            const importance = importanceMap[a.attributeName] || 0.5; // Default 0.5 if not specified
            const weakness = (10 - a.rating) / 9; // 1-9 scale, lower rating = higher weakness

            const impactScore = Math.min(10, importance * weakness * 10);

            if (impactScore >= 4) { // Only record significant needs
                needs.push({
                    domain: a.domain,
                    attribute: a.attributeName,
                    severity: impactScore >= 7 ? 'High' : (impactScore >= 5 ? 'Medium' : 'Low'),
                    impactScore: parseFloat(impactScore.toFixed(1))
                });
            }
        });

        // Sort by impact score descending
        return needs.sort((a, b) => b.impactScore - a.impactScore);
    },

    /**
     * Suggest drills based on identified needs and readiness status.
     */
    suggestDrills(
        needs: IdentifiedNeed[],
        readiness?: ReadinessScore
    ): Drill[] {
        const suggestions: Drill[] = [];
        const seenDrillIds = new Set<UUID>();

        // Safety first: Filter out restricted drills based on readiness notes
        const restrictions = readiness?.notes?.toLowerCase() || "";
        const isSafetyRestricted = (drill: Drill) => {
            if (restrictions.includes("hamstring") && drill.intensity === "High") return true;
            if (restrictions.includes("shoulder") && drill.category === "Bowling") return true;
            return false;
        };

        needs.forEach(need => {
            const matchingDrills = drillService.getByAttribute(need.attribute);

            matchingDrills.forEach(drill => {
                if (!seenDrillIds.has(drill.id) && !isSafetyRestricted(drill)) {
                    suggestions.push(drill);
                    seenDrillIds.add(drill.id);
                }
            });
        });

        return suggestions.slice(0, 5); // Return top 5 suggestions
    }
};
