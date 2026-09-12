/**
 * SCRBRD Multi-Rater Coach Calibration Engine
 * Normalizes multi-coach assessment ratings (1-9 scale), calculates rater bias,
 * computes calibrated domain scores (0-100), and measures consensus confidence.
 */

export interface CoachRater {
    id: string;
    name: string;
    role: string; // e.g. "Head Coach", "Bowling Coach", "Batting Specialist", "Regional Scout"
    school: string;
    biasDelta: number; // positive = lenient, negative = strict
    assessmentsSubmitted: number;
    reliabilityScore: number; // 0 - 100 percentage
}

export interface AttributeRating {
    attribute: string;
    domain: 'Physical' | 'Mental' | 'Tactical' | 'Batting' | 'Bowling' | 'Fielding' | 'Wicketkeeping';
    ratings: {
        coachId: string;
        coachName: string;
        coachRole: string;
        rawScore: number; // 1 - 9
        note?: string;
    }[];
}

export interface DomainCalibrationResult {
    domain: 'Physical' | 'Mental' | 'Tactical' | 'Batting' | 'Bowling' | 'Fielding' | 'Wicketkeeping';
    rawAverage: number; // 1-9
    calibratedScore: number; // 0-100
    raterVariance: number;
    confidenceLevel: 'HIGH' | 'MODERATE' | 'LOW';
    flaggedForConsensus: boolean;
    coachScores: Record<string, number>; // coachId -> rawScore
}

export interface PlayerCalibrationProfile {
    playerId: string;
    playerName: string;
    roleArchetype: string;
    school: string;
    age: number;
    scoutGrade: string;
    potential: 'ELITE' | 'HIGH' | 'MEDIUM' | 'DEVELOPING';
    overallRawAvg: number;
    overallCalibratedScore: number;
    consensusConfidenceScore: number; // 0 - 100
    totalRaters: number;
    flaggedDomainsCount: number;
    domainResults: DomainCalibrationResult[];
    raters: CoachRater[];
}

/**
 * Mock raters network for school coaches and regional scouts
 */
export const MOCK_COACH_RATERS: CoachRater[] = [
    { id: 'C-01', name: 'Larry Speck (Head Coach)', role: 'Head Coach', school: 'Wynberg Boys High', biasDelta: +0.4, assessmentsSubmitted: 48, reliabilityScore: 94 },
    { id: 'C-02', name: 'Mark Boucher (Fast Bowling)', role: 'Bowling Specialist', school: 'Wynberg Boys High', biasDelta: -0.6, assessmentsSubmitted: 36, reliabilityScore: 91 },
    { id: 'C-03', name: 'Neil McKenzie (Batting)', role: 'Batting Specialist', school: 'Wynberg Boys High', biasDelta: +0.1, assessmentsSubmitted: 42, reliabilityScore: 96 },
    { id: 'C-04', name: 'Gary Kirsten (Regional Scout)', role: 'Regional Scout', school: 'WC Talent Network', biasDelta: -0.3, assessmentsSubmitted: 65, reliabilityScore: 98 },
];

/**
 * Mock player evaluation dataset containing multi-rater inputs across all 7 domains
 */
export const MOCK_PLAYER_RATINGS: Record<string, PlayerCalibrationProfile> = {
    '1': {
        playerId: '1',
        playerName: 'James Anderson',
        roleArchetype: 'Fast Bowler',
        school: 'Wynberg Boys High',
        age: 16,
        scoutGrade: 'A+',
        potential: 'ELITE',
        overallRawAvg: 7.8,
        overallCalibratedScore: 88.5,
        consensusConfidenceScore: 92,
        totalRaters: 4,
        flaggedDomainsCount: 1,
        raters: MOCK_COACH_RATERS,
        domainResults: [
            {
                domain: 'Physical',
                rawAverage: 8.2,
                calibratedScore: 92.5,
                raterVariance: 0.25,
                confidenceLevel: 'HIGH',
                flaggedForConsensus: false,
                coachScores: { 'C-01': 8.5, 'C-02': 8.0, 'C-03': 8.0, 'C-04': 8.2 }
            },
            {
                domain: 'Mental',
                rawAverage: 7.5,
                calibratedScore: 84.0,
                raterVariance: 0.60,
                confidenceLevel: 'HIGH',
                flaggedForConsensus: false,
                coachScores: { 'C-01': 8.0, 'C-02': 7.0, 'C-03': 7.5, 'C-04': 7.5 }
            },
            {
                domain: 'Tactical',
                rawAverage: 7.2,
                calibratedScore: 81.2,
                raterVariance: 0.45,
                confidenceLevel: 'HIGH',
                flaggedForConsensus: false,
                coachScores: { 'C-01': 7.5, 'C-02': 7.0, 'C-03': 7.0, 'C-04': 7.3 }
            },
            {
                domain: 'Batting',
                rawAverage: 5.4,
                calibratedScore: 58.0,
                raterVariance: 1.95,
                confidenceLevel: 'LOW',
                flaggedForConsensus: true, // Variance > 1.8 -> flagged!
                coachScores: { 'C-01': 7.0, 'C-02': 4.5, 'C-03': 5.0, 'C-04': 5.1 }
            },
            {
                domain: 'Bowling',
                rawAverage: 8.8,
                calibratedScore: 98.0,
                raterVariance: 0.15,
                confidenceLevel: 'HIGH',
                flaggedForConsensus: false,
                coachScores: { 'C-01': 9.0, 'C-02': 8.7, 'C-03': 8.8, 'C-04': 8.7 }
            },
            {
                domain: 'Fielding',
                rawAverage: 7.8,
                calibratedScore: 86.5,
                raterVariance: 0.35,
                confidenceLevel: 'HIGH',
                flaggedForConsensus: false,
                coachScores: { 'C-01': 8.0, 'C-02': 7.5, 'C-03': 7.8, 'C-04': 7.9 }
            },
            {
                domain: 'Wicketkeeping',
                rawAverage: 3.0,
                calibratedScore: 25.0,
                raterVariance: 0.10,
                confidenceLevel: 'HIGH',
                flaggedForConsensus: false,
                coachScores: { 'C-01': 3.0, 'C-02': 3.0, 'C-03': 3.0, 'C-04': 3.0 }
            }
        ]
    },
    '2': {
        playerId: '2',
        playerName: 'Liam Smith',
        roleArchetype: 'Opening Batter',
        school: 'Bishops Diocesan',
        age: 17,
        scoutGrade: 'A',
        potential: 'ELITE',
        overallRawAvg: 7.6,
        overallCalibratedScore: 85.0,
        consensusConfidenceScore: 88,
        totalRaters: 3,
        flaggedDomainsCount: 0,
        raters: MOCK_COACH_RATERS.slice(0, 3),
        domainResults: [
            {
                domain: 'Physical',
                rawAverage: 7.5,
                calibratedScore: 82.0,
                raterVariance: 0.30,
                confidenceLevel: 'HIGH',
                flaggedForConsensus: false,
                coachScores: { 'C-01': 7.8, 'C-02': 7.2, 'C-03': 7.5 }
            },
            {
                domain: 'Mental',
                rawAverage: 8.2,
                calibratedScore: 91.5,
                raterVariance: 0.20,
                confidenceLevel: 'HIGH',
                flaggedForConsensus: false,
                coachScores: { 'C-01': 8.4, 'C-02': 8.0, 'C-03': 8.2 }
            },
            {
                domain: 'Tactical',
                rawAverage: 7.8,
                calibratedScore: 86.0,
                raterVariance: 0.40,
                confidenceLevel: 'HIGH',
                flaggedForConsensus: false,
                coachScores: { 'C-01': 8.0, 'C-02': 7.5, 'C-03': 7.9 }
            },
            {
                domain: 'Batting',
                rawAverage: 8.9,
                calibratedScore: 99.0,
                raterVariance: 0.10,
                confidenceLevel: 'HIGH',
                flaggedForConsensus: false,
                coachScores: { 'C-01': 9.0, 'C-02': 8.8, 'C-03': 8.9 }
            },
            {
                domain: 'Bowling',
                rawAverage: 4.2,
                calibratedScore: 40.0,
                raterVariance: 0.50,
                confidenceLevel: 'HIGH',
                flaggedForConsensus: false,
                coachScores: { 'C-01': 4.5, 'C-02': 4.0, 'C-03': 4.1 }
            },
            {
                domain: 'Fielding',
                rawAverage: 8.0,
                calibratedScore: 88.0,
                raterVariance: 0.25,
                confidenceLevel: 'HIGH',
                flaggedForConsensus: false,
                coachScores: { 'C-01': 8.2, 'C-02': 7.8, 'C-03': 8.0 }
            },
            {
                domain: 'Wicketkeeping',
                rawAverage: 2.5,
                calibratedScore: 18.8,
                raterVariance: 0.05,
                confidenceLevel: 'HIGH',
                flaggedForConsensus: false,
                coachScores: { 'C-01': 2.5, 'C-02': 2.5, 'C-03': 2.5 }
            }
        ]
    }
};

/**
 * Normalizes a raw 1-9 score to a 0-100 rating scale.
 */
export function normalizeSkillScore(rawScore: number): number {
    const clamped = Math.max(1, Math.min(9, rawScore));
    return Math.round(((clamped - 1) / 8) * 100 * 10) / 10;
}

/**
 * Calculates calibrated score given raw ratings and rater bias adjustments.
 */
export function calculateCalibratedScore(rawScores: number[], raters: CoachRater[]): {
    rawAverage: number;
    calibratedScore: number;
    variance: number;
    confidence: 'HIGH' | 'MODERATE' | 'LOW';
} {
    if (rawScores.length === 0) {
        return { rawAverage: 1, calibratedScore: 0, variance: 0, confidence: 'LOW' };
    }

    const rawSum = rawScores.reduce((acc, val) => acc + val, 0);
    const rawAverage = rawSum / rawScores.length;

    // Apply bias adjustments
    const adjustedScores = rawScores.map((score, idx) => {
        const bias = raters[idx]?.biasDelta || 0;
        return Math.max(1, Math.min(9, score - bias));
    });

    const calibratedSum = adjustedScores.reduce((acc, val) => acc + val, 0);
    const calibratedAvgRaw = calibratedSum / adjustedScores.length;
    const calibratedScore = normalizeSkillScore(calibratedAvgRaw);

    // Compute variance
    const squareDiffs = rawScores.map((score) => Math.pow(score - rawAverage, 2));
    const variance = squareDiffs.reduce((acc, val) => acc + val, 0) / rawScores.length;

    let confidence: 'HIGH' | 'MODERATE' | 'LOW' = 'HIGH';
    if (variance > 1.5) {
        confidence = 'LOW';
    } else if (variance > 0.75) {
        confidence = 'MODERATE';
    }

    return {
        rawAverage: Math.round(rawAverage * 10) / 10,
        calibratedScore,
        variance: Math.round(variance * 100) / 100,
        confidence,
    };
}
