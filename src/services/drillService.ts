import { Drill } from '@/types/drills';

export const MASTER_DRILL_CATALOG: Drill[] = [
    {
        id: 'drill-bat-01',
        sport: 'Cricket',
        name: 'Drop-and-Run Strike Rotation',
        category: 'Batting',
        subcategory: 'strike rotation',
        description: 'Batter plays soft hands into extra cover / mid-wicket gap and calls immediate single.',
        linkedAttributes: ['strike rotation', 'gap finding', 'tempo control'],
        linkedDomains: ['Batting', 'Tactical'],
        linkedRoleArchetypes: ['Opener', 'Top-order Anchor', 'Middle-order Stabiliser'],
        ageSuitability: ['U13', 'U15', 'U19', '1st XI'],
        intensity: 'Moderate',
        durationMinutes: 15,
        equipment: ['Stumps', 'Cones', 'Balls'],
        format: 'Pair',
        injuryRestrictions: [],
        level: 'Intermediate',
        coachingObjective: 'Develop soft wrist control and immediate gap awareness.',
        successCriteria: '8/10 successful single calls without risk of run-out.'
    },
    {
        id: 'drill-bat-02',
        sport: 'Cricket',
        name: 'Short-Pitch Pull Shot Control',
        category: 'Batting',
        subcategory: 'playing pace',
        description: 'High-intensity short ball drill focusing on top-hand control and swivel footwork.',
        linkedAttributes: ['playing pace', 'boundary hitting', 'composure'],
        linkedDomains: ['Batting', 'Mental'],
        linkedRoleArchetypes: ['Opener', 'Aggressive Middle-order Batter', 'Finisher'],
        ageSuitability: ['U15', 'U19', '1st XI'],
        intensity: 'High',
        durationMinutes: 20,
        equipment: ['Sidearm', 'Leather Balls', 'Helmet'],
        format: 'Individual',
        injuryRestrictions: ['Shoulder Strain', 'Concussion Watch'],
        level: 'Advanced',
        coachingObjective: 'Control short-pitched bowling under pace.',
        successCriteria: 'Control 80% of pulls in front of square.'
    },
    {
        id: 'drill-bowl-01',
        sport: 'Cricket',
        name: 'Yorker Target Grid Series',
        category: 'Bowling',
        subcategory: 'death bowling',
        description: 'Bowler executes full-length yorkers hitting a target grid placed at crease line.',
        linkedAttributes: ['death-over execution', 'control', 'length discipline'],
        linkedDomains: ['Bowling', 'Tactical'],
        linkedRoleArchetypes: ['Death Bowler', 'Strike Pace Bowler', 'Bowling All-rounder'],
        ageSuitability: ['U15', 'U19', '1st XI'],
        intensity: 'High',
        durationMinutes: 20,
        equipment: ['Target Mat', 'Stumps', 'Balls'],
        format: 'Individual',
        injuryRestrictions: ['Back Injury', 'Lower Back Stress'],
        level: 'Advanced',
        coachingObjective: 'Master yorker execution under high death-over pressure.',
        successCriteria: '6/10 deliveries hit target mat inside crease zone.'
    },
    {
        id: 'drill-keep-01',
        sport: 'Cricket',
        name: 'Spin Standing-Up Leg-Side Gather',
        category: 'Wicketkeeping',
        subcategory: 'leg-side takes',
        description: 'Keeper stands up to spin, collecting sharp turn down the leg side with soft hands.',
        linkedAttributes: ['leg-side takes', 'standing up takes', 'stumping speed'],
        linkedDomains: ['Wicketkeeping'],
        linkedRoleArchetypes: ['Specialist Wicketkeeper', 'Wicketkeeper-Batter'],
        ageSuitability: ['U13', 'U15', 'U19', '1st XI'],
        intensity: 'Moderate',
        durationMinutes: 15,
        equipment: ['Wicketkeeping Gloves', 'Pads', 'Inner Gloves'],
        format: 'Individual',
        injuryRestrictions: ['Finger Sprain'],
        level: 'Intermediate',
        coachingObjective: 'Improve leg-side collection and stumping execution.',
        successCriteria: 'Clean collection on 9/10 leg-side deliveries.'
    }
];

export const drillService = {
    /**
     * Retrieves all available drills in the master catalog.
     */
    getAllDrills: (): Drill[] => {
        return MASTER_DRILL_CATALOG;
    },

    /**
     * Filters drills by medical restrictions, ensuring injured/restricted players are NOT recommended hazardous drills (Safety Rule 21.6).
     */
    filterSafeDrills: (drills: Drill[], activeMedicalRestrictions: string[]): Drill[] => {
        if (!activeMedicalRestrictions || activeMedicalRestrictions.length === 0) {
            return drills;
        }
        const lowerRestrictions = activeMedicalRestrictions.map(r => r.toLowerCase());
        return drills.filter(drill => {
            const hasConflict = drill.injuryRestrictions.some(restriction =>
                lowerRestrictions.some(userRest => userRest.includes(restriction.toLowerCase()) || restriction.toLowerCase().includes(userRest))
            );
            return !hasConflict;
        });
    }
};
