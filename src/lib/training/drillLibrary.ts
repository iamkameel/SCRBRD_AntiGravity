export interface Drill {
    id: string;
    name: string;
    category: 'Batting' | 'Bowling' | 'Fielding' | 'Wicketkeeping' | 'Physical' | 'Mental' | 'Tactical';
    subcategory: string;
    description: string;
    linkedAttributes: string[];
    linkedRoleArchetypes: string[];
    intensity: 'Low' | 'Moderate' | 'High';
    durationMinutes: number;
    format: 'Individual' | 'Pair' | 'Group' | 'Team';
    equipmentNeeded: string[];
    coachingObjective: string;
    measurableSuccessCriteria: string;
    injuryRestrictions?: string[];
}

export const MASTER_DRILL_LIBRARY: Drill[] = [
    // Batting Drills
    {
        id: 'bat-001',
        name: 'Drop-and-Run Strike Rotation',
        category: 'Batting',
        subcategory: 'strike rotation',
        description: 'Batter defends front foot or soft hands to single cone target and completes a rapid single with non-striker.',
        linkedAttributes: ['strike rotation', 'gap finding', 'running between wickets'],
        linkedRoleArchetypes: ['Opener', 'Top-order Anchor', 'Middle-order Stabiliser'],
        intensity: 'Moderate',
        durationMinutes: 15,
        format: 'Pair',
        equipmentNeeded: ['4 cones', 'sidearm ball feeder', 'bats & pads'],
        coachingObjective: 'Develop soft-hands deflection into gaps to minimize dot-ball percentage.',
        measurableSuccessCriteria: 'Complete 8 out of 10 singles within 2.5 seconds of impact.',
    },
    {
        id: 'bat-002',
        name: '12-Ball Spin Rotation Scenario',
        category: 'Batting',
        subcategory: 'playing spin',
        description: 'Batter faces 2 overs of spin with 4 close fielders; objective is to score at least 8 runs without taking aerial risks.',
        linkedAttributes: ['playing spin', 'tempo control', 'footwork'],
        linkedRoleArchetypes: ['Middle-order Stabiliser', 'Top-order Anchor', 'Batting All-rounder'],
        intensity: 'Moderate',
        durationMinutes: 20,
        format: 'Group',
        equipmentNeeded: ['Spin bowling machine or net spinners', 'Target cones'],
        coachingObjective: 'Improve footwork and wrist placement against turning balls.',
        measurableSuccessCriteria: 'Score >= 8 runs with zero dismissals or aerial miscues.',
    },
    {
        id: 'bat-003',
        name: 'Power Hitting Range Expansion',
        category: 'Batting',
        subcategory: 'power hitting',
        description: 'Full-pitch throws aimed at boundary target zones (cow corner, long-off, mid-wicket).',
        linkedAttributes: ['boundary hitting', 'shot range', 'batting under pressure'],
        linkedRoleArchetypes: ['Finisher', 'Aggressive Middle-order Batter', 'Wicketkeeper-Finisher'],
        intensity: 'High',
        durationMinutes: 20,
        format: 'Individual',
        equipmentNeeded: ['Heavy balls', 'Boundary flags', 'Feeder'],
        coachingObjective: 'Maximise hip-turn speed and clean ball contact into boundary zones.',
        measurableSuccessCriteria: 'Clear boundary rope on at least 6 out of 10 deliveries.',
    },

    // Bowling Drills
    {
        id: 'bowl-001',
        name: 'Yorker Target Grid',
        category: 'Bowling',
        subcategory: 'death bowling',
        description: 'Bowler aims at a 30cm x 30cm target mat placed on the crease line at maximum intensity.',
        linkedAttributes: ['death-over execution', 'control', 'line discipline', 'length discipline'],
        linkedRoleArchetypes: ['Death Bowler', 'Strike Pace Bowler', 'Bowling All-rounder'],
        intensity: 'High',
        durationMinutes: 15,
        format: 'Individual',
        equipmentNeeded: ['Target mat', 'Crease chalk', '6 balls'],
        coachingObjective: 'Develop repeatable yorker landing accuracy under match speed.',
        measurableSuccessCriteria: 'Hit target mat or crease line on at least 4 out of 6 balls.',
    },
    {
        id: 'bowl-002',
        name: 'New-Ball Seam Repeatability Set',
        category: 'Bowling',
        subcategory: 'new-ball skills',
        description: 'Bowler completes 4-over spells focusing on seam position upright at release into a good-length target zone.',
        linkedAttributes: ['seam / swing / drift / shape', 'release consistency', 'new-ball execution'],
        linkedRoleArchetypes: ['New-ball Seamer', 'Strike Pace Bowler'],
        intensity: 'Moderate',
        durationMinutes: 25,
        format: 'Individual',
        equipmentNeeded: ['New match balls', 'Good length target grid'],
        coachingObjective: 'Maintain upright seam angle through 24 consecutive deliveries.',
        measurableSuccessCriteria: '80% of balls land within 6-8m good-length box with upright seam.',
    },

    // Wicketkeeping Drills
    {
        id: 'keep-001',
        name: 'Leg-Side Deflection Collection',
        category: 'Wicketkeeping',
        subcategory: 'leg-side takes',
        description: 'Keeper starts in stance; feeder deflects ball off a slip board on the leg side.',
        linkedAttributes: ['leg-side takes', 'glove work', 'reaction speed', 'standing up takes'],
        linkedRoleArchetypes: ['Specialist Wicketkeeper', 'Wicketkeeper-Batter', 'Wicketkeeper-Finisher'],
        intensity: 'Moderate',
        durationMinutes: 15,
        format: 'Pair',
        equipmentNeeded: ['Deflection board', 'Wicketkeeping gloves', 'Light balls'],
        coachingObjective: 'Improve leg-side footwork and soft glove gathering.',
        measurableSuccessCriteria: 'Cleanly gather 8 out of 10 leg-side deflections without dropping.',
    },

    // Fielding Drills
    {
        id: 'field-001',
        name: 'Inner-Ring Pressure Pick-and-Throw',
        category: 'Fielding',
        subcategory: 'inner-ring pressure fielding',
        description: 'Fielder charges ground ball in inner ring, executes quick pick-up, and hits target single stump.',
        linkedAttributes: ['pick-up and release', 'throwing accuracy', 'pressure fielding'],
        linkedRoleArchetypes: ['Fielding Specialist', 'Opener', 'Aggressive Middle-order Batter'],
        intensity: 'High',
        durationMinutes: 15,
        format: 'Group',
        equipmentNeeded: ['Single target stump', 'Ground balls'],
        coachingObjective: 'Reduce transition time between pick-up and throw under 1.8 seconds.',
        measurableSuccessCriteria: 'Hit target stump or cause direct hit on 5 out of 8 attempts.',
    }
];
