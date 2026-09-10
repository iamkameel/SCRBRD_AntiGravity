export type DrillCategory =
    | 'Batting'
    | 'Bowling'
    | 'Fielding'
    | 'Wicketkeeping'
    | 'Physical'
    | 'Mental'
    | 'Tactical'
    | 'Game Scenario'
    | 'Recovery';

export type DrillLevel = 'Foundation' | 'Intermediate' | 'Advanced';
export type DrillFormat = 'Individual' | 'Pair' | 'Group' | 'Team';

export interface Drill {
    id: string;
    sport: 'Cricket';
    name: string;
    category: DrillCategory;
    subcategory: string;
    description: string;
    linkedAttributes: string[];
    linkedDomains: string[];
    linkedRoleArchetypes: string[];
    ageSuitability: string[];
    intensity: 'Low' | 'Moderate' | 'High' | 'Elite';
    durationMinutes: number;
    equipment: string[];
    format: DrillFormat;
    injuryRestrictions: string[]; // e.g. ["Back Injury", "Shoulder Strain", "Hamstring Clearance Required"]
    level: DrillLevel;
    coachingObjective: string;
    successCriteria: string;
}

export interface DevelopmentNeed {
    personId: string;
    domain: string;
    attribute: string;
    roleArchetype: string;
    weaknessSeverity: number; // 1 (mild) - 9 (severe)
    roleImportance: number; // 1 - 5
    coachPriority: number; // 1 - 5
    performanceImpact: number; // 1 - 5
}

export interface DrillRecommendation {
    id: string;
    personId: string;
    drillId: string;
    drillName: string;
    category: DrillCategory;
    subcategory: string;
    developmentNeedScore: number;
    confidenceLevel: 'High' | 'Moderate' | 'Low';
    rationale: string;
    medicalSafetyCleared: boolean;
    generatedAt: string;
}
