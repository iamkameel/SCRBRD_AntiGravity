import { DevelopmentNeed, Drill, DrillRecommendation } from '@/types/drills';
import { drillService } from '@/services/drillService';

export const recommendationEngine = {
    /**
     * Calculates the Development Need Score for a specific player attribute.
     * Score = roleImportance * weaknessSeverity * performanceImpact * coachPriority
     */
    calculateDevelopmentNeedScore: (need: DevelopmentNeed): number => {
        return need.roleImportance * need.weaknessSeverity * need.performanceImpact * need.coachPriority;
    },

    /**
     * Generates ranked, medically filtered drill recommendations for a player.
     */
    generateRecommendations: (
        personId: string,
        needs: DevelopmentNeed[],
        activeMedicalRestrictions: string[] = [],
        availableDrills: Drill[] = drillService.getAllDrills()
    ): DrillRecommendation[] => {
        // 1. Enforce Medical Safety Rule 21.6: Filter out drills conflicting with active medical restrictions
        const safeDrills = drillService.filterSafeDrills(availableDrills, activeMedicalRestrictions);

        // 2. Rank development needs by Development Need Score descending
        const rankedNeeds = [...needs].sort((a, b) => {
            return recommendationEngine.calculateDevelopmentNeedScore(b) - recommendationEngine.calculateDevelopmentNeedScore(a);
        });

        const recommendations: DrillRecommendation[] = [];

        // 3. Match top development needs to safe drills targeting the linked attributes
        for (const need of rankedNeeds) {
            const score = recommendationEngine.calculateDevelopmentNeedScore(need);
            const matchingDrills = safeDrills.filter(drill =>
                drill.linkedAttributes.some(attr => attr.toLowerCase() === need.attribute.toLowerCase())
            );

            for (const drill of matchingDrills) {
                // Prevent duplicate drill recommendations
                if (recommendations.some(r => r.drillId === drill.id)) continue;

                recommendations.push({
                    id: `rec-${personId}-${drill.id}`,
                    personId,
                    drillId: drill.id,
                    drillName: drill.name,
                    category: drill.category,
                    subcategory: drill.subcategory,
                    developmentNeedScore: score,
                    confidenceLevel: score > 150 ? 'High' : score > 80 ? 'Moderate' : 'Low',
                    rationale: `Targeted to improve ${need.attribute} for ${need.roleArchetype} role (Score: ${score}).`,
                    medicalSafetyCleared: true,
                    generatedAt: new Date().toISOString()
                });
            }
        }

        return recommendations;
    }
};
