/**
 * Cricket Wagon Wheel Zone & Telemetry Utilities
 */

export interface ShotZoneInfo {
    zoneName: string;
    zoneCode: 'FL' | 'SL' | 'MW' | 'MO' | 'LO' | 'LF' | 'MF' | 'CO' | 'PT' | 'TM' | 'PITCH';
    ringName: 'Infield' | 'Inner Ring' | 'Outfield' | 'Boundary 4' | 'Boundary 6';
    isBoundary: boolean;
}

/**
 * Derives field zone and ring details from shot angle (0° = top/straight, clockwise)
 * and distance percentage (0-100%).
 */
export function calculateShotZone(angle: number, distance: number): ShotZoneInfo {
    // Normalize angle to 0-360
    const normalizedAngle = ((angle % 360) + 360) % 360;

    // Determine Ring
    let ringName: ShotZoneInfo['ringName'] = 'Infield';
    let isBoundary = false;

    if (distance >= 95) {
        ringName = 'Boundary 6';
        isBoundary = true;
    } else if (distance >= 85) {
        ringName = 'Boundary 4';
        isBoundary = true;
    } else if (distance >= 50) {
        ringName = 'Outfield';
    } else if (distance >= 25) {
        ringName = 'Inner Ring';
    } else {
        ringName = 'Infield';
    }

    // Determine Sector (assuming RHB with 0° straight down ground / Long-Off to Long-On)
    // Angle sectors (10 primary zones)
    let zoneName = 'Mid-On';
    let zoneCode: ShotZoneInfo['zoneCode'] = 'MO';

    if (normalizedAngle >= 342 || normalizedAngle < 18) {
        zoneName = 'Long-Off / Straight';
        zoneCode = 'LO';
    } else if (normalizedAngle >= 18 && normalizedAngle < 54) {
        zoneName = 'Extra Cover';
        zoneCode = 'CO';
    } else if (normalizedAngle >= 54 && normalizedAngle < 90) {
        zoneName = 'Cover Point / Point';
        zoneCode = 'PT';
    } else if (normalizedAngle >= 90 && normalizedAngle < 126) {
        zoneName = 'Gully / Backward Point';
        zoneCode = 'PT';
    } else if (normalizedAngle >= 126 && normalizedAngle < 162) {
        zoneName = 'Third Man / Fly Slip';
        zoneCode = 'TM';
    } else if (normalizedAngle >= 162 && normalizedAngle < 198) {
        zoneName = 'Fine Leg / Behind Square';
        zoneCode = 'FL';
    } else if (normalizedAngle >= 198 && normalizedAngle < 234) {
        zoneName = 'Square Leg / Backward Square';
        zoneCode = 'SL';
    } else if (normalizedAngle >= 234 && normalizedAngle < 270) {
        zoneName = 'Mid-Wicket / Cow Corner';
        zoneCode = 'MW';
    } else if (normalizedAngle >= 270 && normalizedAngle < 306) {
        zoneName = 'Mid-On';
        zoneCode = 'MO';
    } else {
        zoneName = 'Long-On';
        zoneCode = 'LO';
    }

    return {
        zoneName,
        zoneCode,
        ringName,
        isBoundary
    };
}

export function getRunColor(runs: number, isWicket?: boolean): string {
    if (isWicket) return '#ef4444'; // Red
    switch (runs) {
        case 0: return '#64748b'; // Slate dot
        case 1: return '#3b82f6'; // Blue
        case 2: return '#06b6d4'; // Cyan
        case 3: return '#10b981'; // Emerald
        case 4: return '#3b82f6'; // Indigo/Blue boundary 4
        case 6: return '#a855f7'; // Purple boundary 6
        default: return '#f59e0b'; // Amber
    }
}
