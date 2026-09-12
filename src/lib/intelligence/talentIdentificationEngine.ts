/**
 * Regional talent identification domain helpers.
 *
 * Scores are stored as percentages so historical reports, player ratings, and
 * selector assessments can be compared on the same scale. The source report
 * still retains its native 20/15/10-point assessment matrix for auditability.
 */

export const ABILITY_DIMENSIONS = [
  'Technical',
  'Tactical',
  'Physical',
  'Mental',
  'Competitive',
  'Evidence',
] as const;

export type AbilityDimension = (typeof ABILITY_DIMENSIONS)[number];
export type AbilityVector = Record<AbilityDimension, number>;
export type ScoutGrade = 'A+' | 'A' | 'B+' | 'B' | 'C';
export type PathwayStage = 'School Squad' | 'Zonal Select' | 'Provincial Invitational' | 'National Camp';
export type InvitationalStatus = 'Identified' | 'Invited' | 'Confirmed' | 'Attended' | 'Selected' | 'Declined';

export interface AbilitySnapshot {
  season: string;
  currentAbility: number;
  projectedPotential: number;
  abilities: AbilityVector;
  projectedAbilities: AbilityVector;
}

export interface RegionalProspect {
  id: string;
  name: string;
  school: string;
  region: string;
  ageGroup: string;
  roleArchetype: string;
  scoutGrade: ScoutGrade;
  pathwayStage: PathwayStage;
  currentAbility: number;
  projectedPotential: number;
  abilityHistory: AbilitySnapshot[];
  reportCount: number;
  notes: string;
  inWatchlist: boolean;
  watchlistPriority?: 'High' | 'Standard' | 'Monitor';
  invitational?: ProvincialInvitational;
}

export interface ProvincialInvitational {
  id: string;
  personId: string;
  personName: string;
  province: string;
  eventName: string;
  eventDate: string;
  ageGroup: string;
  status: InvitationalStatus;
  notes?: string;
  updatedAt?: string;
}

export interface AssessmentMatrix {
  technicalScore: number;
  tacticalScore: number;
  physicalScore: number;
  mentalScore: number;
  competitivenessScore: number;
  statisticalEvidenceScore: number;
}

const gradeHeadroom: Record<ScoutGrade, number> = {
  'A+': 13,
  A: 11,
  'B+': 9,
  B: 7,
  C: 5,
};

const categoryHeadroom: Record<string, number> = {
  'High-upside Athlete': 10,
  'Long-term Project': 9,
  'Immediate Impact': 3,
  'Role Specialist': 5,
  'System Player': 4,
  ELITE: 11,
  HIGH: 7,
  MEDIUM: 4,
};

export function clampAbility(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function deriveScoutGrade(totalScore: number): ScoutGrade {
  if (totalScore >= 90) return 'A+';
  if (totalScore >= 80) return 'A';
  if (totalScore >= 70) return 'B+';
  if (totalScore >= 60) return 'B';
  return 'C';
}

export function assessmentToAbilityVector(assessment: AssessmentMatrix): AbilityVector {
  return {
    Technical: clampAbility((assessment.technicalScore / 20) * 100),
    Tactical: clampAbility((assessment.tacticalScore / 15) * 100),
    Physical: clampAbility((assessment.physicalScore / 15) * 100),
    Mental: clampAbility((assessment.mentalScore / 20) * 100),
    Competitive: clampAbility((assessment.competitivenessScore / 10) * 100),
    Evidence: clampAbility((assessment.statisticalEvidenceScore / 20) * 100),
  };
}

export function averageAbility(abilities: AbilityVector): number {
  return clampAbility(
    ABILITY_DIMENSIONS.reduce((total, dimension) => total + abilities[dimension], 0) / ABILITY_DIMENSIONS.length,
  );
}

export function projectAbilityVector(
  abilities: AbilityVector,
  scoutGrade: ScoutGrade,
  age?: number,
  category?: string,
): AbilityVector {
  const ageHeadroom = age === undefined ? 4 : age <= 15 ? 10 : age <= 17 ? 7 : age <= 19 ? 4 : 2;
  const totalHeadroom = ageHeadroom + gradeHeadroom[scoutGrade] + (categoryHeadroom[category || ''] || 0);

  return ABILITY_DIMENSIONS.reduce((projected, dimension) => {
    // Evidence is deliberately conservative: potential reflects capability, not
    // assumed future statistical output. Physical growth is more age sensitive.
    const multiplier = dimension === 'Physical' ? 1.15 : dimension === 'Evidence' ? 0.55 : 1;
    projected[dimension] = clampAbility(abilities[dimension] + totalHeadroom * multiplier);
    return projected;
  }, {} as AbilityVector);
}

export function createAbilitySnapshot(
  season: string,
  assessment: AssessmentMatrix,
  scoutGrade: ScoutGrade,
  age?: number,
  category?: string,
): AbilitySnapshot {
  const abilities = assessmentToAbilityVector(assessment);
  const projectedAbilities = projectAbilityVector(abilities, scoutGrade, age, category);

  return {
    season,
    currentAbility: averageAbility(abilities),
    projectedPotential: averageAbility(projectedAbilities),
    abilities,
    projectedAbilities,
  };
}

export function abilityRadarData(snapshot: AbilitySnapshot) {
  return ABILITY_DIMENSIONS.map((subject) => ({
    subject,
    Current: snapshot.abilities[subject],
    Potential: snapshot.projectedAbilities[subject],
    fullMark: 100,
  }));
}

/** A meaningful offline/demo dataset is used only when Firestore has no reports yet. */
export const REGIONAL_TALENT_DEMO: RegionalProspect[] = [
  {
    id: 'pw-1', name: 'Jaxon Reed', school: 'St Stithians College', region: 'Gauteng Central', ageGroup: 'U19', roleArchetype: 'New-ball Seamer', scoutGrade: 'A+', pathwayStage: 'Provincial Invitational', currentAbility: 86, projectedPotential: 96, reportCount: 12, inWatchlist: true, watchlistPriority: 'High', notes: 'Explosive seam presentation and repeatable late movement. Ready for provincial exposure.',
    abilityHistory: [
      { season: '2024', currentAbility: 73, projectedPotential: 91, abilities: { Technical: 74, Tactical: 70, Physical: 82, Mental: 69, Competitive: 75, Evidence: 68 }, projectedAbilities: { Technical: 91, Tactical: 87, Physical: 96, Mental: 86, Competitive: 92, Evidence: 78 } },
      { season: '2025', currentAbility: 80, projectedPotential: 94, abilities: { Technical: 82, Tactical: 77, Physical: 89, Mental: 77, Competitive: 83, Evidence: 74 }, projectedAbilities: { Technical: 94, Tactical: 90, Physical: 99, Mental: 90, Competitive: 95, Evidence: 82 } },
      { season: '2026', currentAbility: 86, projectedPotential: 96, abilities: { Technical: 88, Tactical: 84, Physical: 95, Mental: 83, Competitive: 90, Evidence: 76 }, projectedAbilities: { Technical: 98, Tactical: 94, Physical: 100, Mental: 93, Competitive: 100, Evidence: 86 } },
    ],
    invitational: { id: 'inv-1', personId: 'pw-1', personName: 'Jaxon Reed', province: 'Gauteng', eventName: 'Gauteng U19 Provincial Invitational', eventDate: '2026-10-18', ageGroup: 'U19', status: 'Confirmed', notes: 'Fast-bowling allocation requested.' },
  },
  {
    id: 'pw-2', name: 'Liam Smith', school: 'King Edward VII School', region: 'Gauteng Central', ageGroup: 'U19', roleArchetype: 'Opener', scoutGrade: 'A', pathwayStage: 'Provincial Invitational', currentAbility: 84, projectedPotential: 92, reportCount: 8, inWatchlist: true, watchlistPriority: 'High', notes: 'Strong new-ball method with mature tempo control and elite defensive foundations.',
    abilityHistory: [
      { season: '2024', currentAbility: 76, projectedPotential: 89, abilities: { Technical: 86, Tactical: 76, Physical: 68, Mental: 82, Competitive: 79, Evidence: 65 }, projectedAbilities: { Technical: 96, Tactical: 88, Physical: 80, Mental: 94, Competitive: 91, Evidence: 74 } },
      { season: '2025', currentAbility: 81, projectedPotential: 91, abilities: { Technical: 91, Tactical: 82, Physical: 73, Mental: 87, Competitive: 85, Evidence: 69 }, projectedAbilities: { Technical: 99, Tactical: 92, Physical: 85, Mental: 97, Competitive: 95, Evidence: 77 } },
      { season: '2026', currentAbility: 84, projectedPotential: 92, abilities: { Technical: 94, Tactical: 86, Physical: 76, Mental: 90, Competitive: 87, Evidence: 71 }, projectedAbilities: { Technical: 100, Tactical: 95, Physical: 87, Mental: 99, Competitive: 96, Evidence: 79 } },
    ],
    invitational: { id: 'inv-2', personId: 'pw-2', personName: 'Liam Smith', province: 'Gauteng', eventName: 'Gauteng U19 Provincial Invitational', eventDate: '2026-10-18', ageGroup: 'U19', status: 'Invited' },
  },
  {
    id: 'pw-3', name: 'Ethan Miller', school: 'Hilton College', region: 'KwaZulu-Natal Midlands', ageGroup: 'U15', roleArchetype: 'Wrist Spinner', scoutGrade: 'A', pathwayStage: 'Zonal Select', currentAbility: 78, projectedPotential: 94, reportCount: 6, inWatchlist: false, notes: 'Rare revolutions and a clear wrong-un. Needs exposure to longer spells and stronger batters.',
    abilityHistory: [
      { season: '2025', currentAbility: 72, projectedPotential: 91, abilities: { Technical: 84, Tactical: 73, Physical: 65, Mental: 69, Competitive: 76, Evidence: 62 }, projectedAbilities: { Technical: 100, Tactical: 90, Physical: 86, Mental: 86, Competitive: 93, Evidence: 73 } },
      { season: '2026', currentAbility: 78, projectedPotential: 94, abilities: { Technical: 89, Tactical: 79, Physical: 71, Mental: 74, Competitive: 81, Evidence: 68 }, projectedAbilities: { Technical: 100, Tactical: 96, Physical: 92, Mental: 91, Competitive: 98, Evidence: 79 } },
    ],
  },
  {
    id: 'pw-4', name: 'Noah Patel', school: 'Jeppe High School for Boys', region: 'Gauteng East', ageGroup: 'U16', roleArchetype: 'Wicketkeeper-Batter', scoutGrade: 'A', pathwayStage: 'Zonal Select', currentAbility: 81, projectedPotential: 90, reportCount: 9, inWatchlist: true, watchlistPriority: 'Standard', notes: 'Soft hands and a rapidly improving middle-order game. Monitor decision-making against pace.',
    abilityHistory: [
      { season: '2025', currentAbility: 76, projectedPotential: 88, abilities: { Technical: 82, Tactical: 74, Physical: 76, Mental: 78, Competitive: 83, Evidence: 64 }, projectedAbilities: { Technical: 95, Tactical: 87, Physical: 89, Mental: 91, Competitive: 96, Evidence: 72 } },
      { season: '2026', currentAbility: 81, projectedPotential: 90, abilities: { Technical: 88, Tactical: 80, Physical: 81, Mental: 83, Competitive: 88, Evidence: 66 }, projectedAbilities: { Technical: 99, Tactical: 91, Physical: 92, Mental: 94, Competitive: 99, Evidence: 74 } },
    ],
    invitational: { id: 'inv-4', personId: 'pw-4', personName: 'Noah Patel', province: 'Gauteng', eventName: 'Gauteng U16 Provincial Invitational', eventDate: '2026-11-08', ageGroup: 'U16', status: 'Identified' },
  },
];
