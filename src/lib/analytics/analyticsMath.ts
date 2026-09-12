export interface BallPerformance {
    overNumber: number;
    ballNumber: number;
    runs: number;
    extras?: number;
    isWicket?: boolean;
    angle?: number;
    distance?: number;
}

export interface PhaseBreakdown {
    phase: 'Powerplay' | 'Middle Overs' | 'Death Overs';
    oversRange: string;
    runs: number;
    wickets: number;
    balls: number;
    runRate: number;
    boundaryCount: number;
}

export interface SectorDistribution {
    sector: string;
    angleMin: number;
    angleMax: number;
    shotsCount: number;
    runsScored: number;
    boundaryCount: number;
    percentageOfRuns: number;
}

/**
 * Classifies an angle (0-360 deg, where 0 is straight down the ground) into cricket fielding sectors.
 */
export function classifyShotSector(angle: number): string {
    const normAngle = ((angle % 360) + 360) % 360;

    if (normAngle >= 337.5 || normAngle < 22.5) return 'Straight / Long On/Off';
    if (normAngle >= 22.5 && normAngle < 67.5) return 'Cover / Extra Cover';
    if (normAngle >= 67.5 && normAngle < 112.5) return 'Point / Backward Point';
    if (normAngle >= 112.5 && normAngle < 157.5) return 'Third Man / Gully';
    if (normAngle >= 157.5 && normAngle < 202.5) return 'Fine Leg / Behind Wicket';
    if (normAngle >= 202.5 && normAngle < 247.5) return 'Square Leg / Deep Backward Square';
    if (normAngle >= 247.5 && normAngle < 292.5) return 'Mid-Wicket / Cow Corner';
    return 'Long On / Mid-On';
}

/**
 * Calculates phase breakdown (Powerplay 1-6, Middle 7-15, Death 16-20).
 */
export function calculatePhaseBreakdown(balls: BallPerformance[]): PhaseBreakdown[] {
    const phases = [
        { name: 'Powerplay' as const, range: 'Overs 1-6', minOver: 1, maxOver: 6 },
        { name: 'Middle Overs' as const, range: 'Overs 7-15', minOver: 7, maxOver: 15 },
        { name: 'Death Overs' as const, range: 'Overs 16-20', minOver: 16, maxOver: 20 },
    ];

    return phases.map((p) => {
        const phaseBalls = balls.filter(
            (b) => b.overNumber >= p.minOver && b.overNumber <= p.maxOver
        );

        const totalRuns = phaseBalls.reduce(
            (acc, b) => acc + (b.runs || 0) + (b.extras || 0),
            0
        );
        const wickets = phaseBalls.filter((b) => b.isWicket).length;
        const count = phaseBalls.length;
        const runRate = count > 0 ? Number(((totalRuns / count) * 6).toFixed(2)) : 0;
        const boundaryCount = phaseBalls.filter((b) => (b.runs || 0) >= 4).length;

        return {
            phase: p.name,
            oversRange: p.range,
            runs: totalRuns,
            wickets,
            balls: count,
            runRate,
            boundaryCount,
        };
    });
}

/**
 * Aggregates shot sector distribution from ball performance events.
 */
export function calculateSectorDistribution(balls: BallPerformance[]): SectorDistribution[] {
    const sectorsMap: Record<string, { count: number; runs: number; boundaries: number }> = {};
    let totalRuns = 0;

    balls.forEach((b) => {
        if (b.angle === undefined) return;
        const sector = classifyShotSector(b.angle);
        if (!sectorsMap[sector]) {
            sectorsMap[sector] = { count: 0, runs: 0, boundaries: 0 };
        }
        const runs = b.runs || 0;
        sectorsMap[sector].count += 1;
        sectorsMap[sector].runs += runs;
        if (runs >= 4) sectorsMap[sector].boundaries += 1;
        totalRuns += runs;
    });

    return Object.entries(sectorsMap).map(([sector, data]) => ({
        sector,
        angleMin: 0,
        angleMax: 360,
        shotsCount: data.count,
        runsScored: data.runs,
        boundaryCount: data.boundaries,
        percentageOfRuns: totalRuns > 0 ? Number(((data.runs / totalRuns) * 100).toFixed(1)) : 0,
    }));
}

/**
 * Calculates current required run rate and DLS telemetry estimates.
 */
export function calculateDLSTelemetry(
    targetRuns: number,
    currentRuns: number,
    oversRemaining: number,
    wicketsLost: number
): { requiredRunRate: number; parScore: number; status: 'ahead' | 'level' | 'behind' } {
    if (oversRemaining <= 0) {
        return {
            requiredRunRate: 0,
            parScore: targetRuns,
            status: currentRuns >= targetRuns ? 'ahead' : 'behind',
        };
    }

    const runsNeeded = Math.max(0, targetRuns - currentRuns);
    const requiredRunRate = Number((runsNeeded / oversRemaining).toFixed(2));

    // Simple par score calculation estimate based on target, overs remaining, and wickets lost
    const wicketPenalty = wicketsLost * 4;
    const parScore = Math.max(0, Math.round(targetRuns * (1 - oversRemaining / 20) + wicketPenalty));

    let status: 'ahead' | 'level' | 'behind' = 'level';
    if (currentRuns > parScore) status = 'ahead';
    else if (currentRuns < parScore) status = 'behind';

    return { requiredRunRate, parScore, status };
}
