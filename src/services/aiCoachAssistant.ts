/**
 * SCRBRD — AI Coach Assistant & Automated Athlete Diagnosis.
 * Ported & enhanced from scrbrd-beta-2/src/services/aiCoachAssistant.ts
 */

import { MASTER_DRILL_LIBRARY } from "@/lib/drillLibrary";
import { Drill } from "@/types/drills";

export interface PlayerDiagnosis {
    playerId: string;
    playerName: string;
    roleArchetype: string;
    weaknessSeverity: 'HIGH' | 'MODERATE' | 'LOW';
    primaryWeakness: string;
    primaryStrength: string;
    medicalRestrictions: string[];
    recommendedDrills: Array<{
        id: string;
        name: string;
        category: string;
        objective: string;
        durationMinutes: number;
        equipment: string[];
        safetyCleared: boolean;
        confidence: 'HIGH' | 'MODERATE' | 'LOW';
    }>;
}

export class AICoachAssistantService {
    /**
     * Diagnoses athlete performance metrics and matches them against master drill library + medical safety filters.
     */
    public diagnosePlayer(
        playerId: string,
        playerName: string,
        roleArchetype: string,
        dotBallPercentage: number,
        strikeRate: number,
        medicalRestrictions: string[] = []
    ): PlayerDiagnosis {
        const isOpener = roleArchetype.toLowerCase().includes('opener');
        const isDeathBowler = roleArchetype.toLowerCase().includes('death');
        const isKeeper = roleArchetype.toLowerCase().includes('keeper');
        const hasShoulderRestriction = medicalRestrictions.some(m => m.toLowerCase().includes('shoulder'));
        const hasBackRestriction = medicalRestrictions.some(m => m.toLowerCase().includes('back'));

        const recommendedDrills = [];

        // Rule 1: High Dot-Ball Percentage (>45%) -> Strike Rotation Drill
        if (dotBallPercentage > 45) {
            const drill = MASTER_DRILL_LIBRARY.find((d: Drill) => d.id === 'bat_01');
            if (drill) {
                recommendedDrills.push({
                    id: drill.id,
                    name: drill.name,
                    category: drill.category,
                    objective: drill.coachingObjective,
                    durationMinutes: drill.durationMinutes,
                    equipment: drill.equipment,
                    safetyCleared: true,
                    confidence: 'HIGH' as const,
                });
            }
        }

        // Rule 2: Low Strike Rate (<110) for Openers -> Power Hitting Drill
        if (strikeRate < 110 && isOpener) {
            const drill = MASTER_DRILL_LIBRARY.find((d: Drill) => d.id === 'bat_03');
            if (drill) {
                recommendedDrills.push({
                    id: drill.id,
                    name: drill.name,
                    category: drill.category,
                    objective: drill.coachingObjective,
                    durationMinutes: drill.durationMinutes,
                    equipment: drill.equipment,
                    safetyCleared: !hasShoulderRestriction,
                    confidence: 'HIGH' as const,
                });
            }
        }

        // Rule 3: Death Bowler -> Yorker Target Grid
        if (isDeathBowler) {
            const drill = MASTER_DRILL_LIBRARY.find((d: Drill) => d.id === 'bowl_02');
            if (drill) {
                recommendedDrills.push({
                    id: drill.id,
                    name: drill.name,
                    category: drill.category,
                    objective: drill.coachingObjective,
                    durationMinutes: drill.durationMinutes,
                    equipment: drill.equipment,
                    safetyCleared: !hasBackRestriction,
                    confidence: 'HIGH' as const,
                });
            }
        }

        // Rule 4: Wicketkeeper -> Leg-Side Deflection Take
        if (isKeeper) {
            const drill = MASTER_DRILL_LIBRARY.find((d: Drill) => d.id === 'keep_01');
            if (drill) {
                recommendedDrills.push({
                    id: drill.id,
                    name: drill.name,
                    category: drill.category,
                    objective: drill.coachingObjective,
                    durationMinutes: drill.durationMinutes,
                    equipment: drill.equipment,
                    safetyCleared: true,
                    confidence: 'HIGH' as const,
                });
            }
        }

        // Always include a fielding drill if available
        const fieldDrill = MASTER_DRILL_LIBRARY.find((d: Drill) => d.id === 'field_01');
        if (fieldDrill && !recommendedDrills.some(d => d.id === fieldDrill.id)) {
            recommendedDrills.push({
                id: fieldDrill.id,
                name: fieldDrill.name,
                category: fieldDrill.category,
                objective: fieldDrill.coachingObjective,
                durationMinutes: fieldDrill.durationMinutes,
                equipment: fieldDrill.equipment,
                safetyCleared: !hasShoulderRestriction,
                confidence: 'MODERATE' as const,
            });
        }

        return {
            playerId,
            playerName,
            roleArchetype,
            weaknessSeverity: dotBallPercentage > 50 ? 'HIGH' : 'MODERATE',
            primaryWeakness: dotBallPercentage > 45 ? 'High Dot-Ball Percentage in Middle Overs' : 'Boundary Execution Rate',
            primaryStrength: 'Defensive Alignment & Front Foot Balance',
            medicalRestrictions,
            recommendedDrills,
        };
    }
}

export const aiCoachAssistant = new AICoachAssistantService();
