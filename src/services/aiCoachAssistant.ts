"use client";

export interface PlayerDiagnosis {
    playerId: string;
    playerName: string;
    roleArchetype: string;
    weaknessSeverity: 'HIGH' | 'MODERATE' | 'LOW';
    primaryWeakness: string;
    primaryStrength: string;
    medicalRestrictions: string[];
    recommendedDrills: {
        id: string;
        name: string;
        category: 'Batting' | 'Bowling' | 'Fielding' | 'Wicketkeeping' | 'Mental' | 'Tactical';
        objective: string;
        durationMinutes: number;
        equipment: string[];
        safetyCleared: boolean;
        confidence: 'HIGH' | 'MODERATE' | 'LOW';
    }[];
}

export class AICoachAssistantService {
    /**
     * Evaluates player assessment matrices and medical restrictions to generate AI training plans.
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
        const hasShoulderRestriction = medicalRestrictions.some(m => m.toLowerCase().includes('shoulder'));

        const recommendedDrills = [];

        // Drill 1: Strike Rotation (Rule-based condition: high dot ball %)
        if (dotBallPercentage > 45) {
            recommendedDrills.push({
                id: 'drill-rot-1',
                name: 'Drop-and-Run Single Rotation Drill',
                category: 'Batting' as const,
                objective: 'Improve gap awareness and quick first-step acceleration to rotate strike against spin/pace.',
                durationMinutes: 20,
                equipment: ['Cones', 'Tennis Balls', 'Batten Grid'],
                safetyCleared: true,
                confidence: 'HIGH' as const,
            });
        }

        // Drill 2: Power Hitting / Boundary Expansion
        if (strikeRate < 110 && isOpener) {
            recommendedDrills.push({
                id: 'drill-pow-2',
                name: 'Powerplay Lofted Off-Drive Block',
                category: 'Batting' as const,
                objective: 'Develop clean extension through the line for over-the-infield boundary options.',
                durationMinutes: 25,
                equipment: ['Sidearm Feeder', 'Heavy Bat'],
                safetyCleared: !hasShoulderRestriction,
                confidence: 'HIGH' as const,
            });
        }

        // Drill 3: Death Over Target Bowling
        if (isDeathBowler) {
            recommendedDrills.push({
                id: 'drill-bow-3',
                name: 'Yorker & Slower-Ball Target Grid',
                category: 'Bowling' as const,
                objective: 'Execute high-pressure wide yorkers and back-of-the-hand slower balls in 6-ball sets.',
                durationMinutes: 30,
                equipment: ['Target Cones', 'New Leather Balls'],
                safetyCleared: true,
                confidence: 'HIGH' as const,
            });
        }

        // Drill 4: Mental Resiliency / Reset Routine
        recommendedDrills.push({
            id: 'drill-men-4',
            name: 'Pre-Ball Focus Reset Routine',
            category: 'Mental' as const,
            objective: 'Establish a consistent 5-second breath reset routine between balls under match scenario pressure.',
            durationMinutes: 15,
            equipment: ['Match Scenario Scoreboard'],
            safetyCleared: true,
            confidence: 'MODERATE' as const,
        });

        return {
            playerId,
            playerName,
            roleArchetype,
            weaknessSeverity: dotBallPercentage > 50 ? 'HIGH' : 'MODERATE',
            primaryWeakness: dotBallPercentage > 45 ? 'High Dot-Ball Percentage in Middle Overs' : 'Boundary Execution Rate',
            primaryStrength: 'Defensive Alignment & Front Foot Solidness',
            medicalRestrictions,
            recommendedDrills,
        };
    }
}

export const aiCoachAssistant = new AICoachAssistantService();
