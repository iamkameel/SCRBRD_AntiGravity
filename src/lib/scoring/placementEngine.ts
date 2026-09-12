/**
 * SCRBRD — Shot Placement & Polar Spatial Intelligence Engine.
 * Ported & adapted from SCRBRD_OS/packages/scoring/src/placement.mjs
 *
 * Polar coordinate frame:
 * - theta: degrees CLOCKWISE FROM DIRECTLY BEHIND THE BATTER (12 o'clock = 0/360)
 * - 180 deg = straight down the ground toward bowler
 * - positive rotation = leg side for a right-hander
 * - radius: fraction of boundary distance at bearing (0.00 to 1.00)
 * - Batter-relative theta makes positions comparable across venues & handedness
 */

export const PLACEMENT_SOURCE = {
    POINT: "point",
    SECTOR: "sector",
} as const;

export type PlacementSource = typeof PLACEMENT_SOURCE[keyof typeof PLACEMENT_SOURCE];

export const PLACEMENT_NULL = {
    NO_CONTACT: "no_contact",
    NOT_APPLICABLE: "not_applicable",
    NOT_REQUIRED: "not_required",
    SKIPPED: "skipped",
} as const;

export type PlacementNullReason = typeof PLACEMENT_NULL[keyof typeof PLACEMENT_NULL];

export const CAPTURE_PROFILE = {
    FULL: "full",
    STANDARD: "standard",
    QUICK: "quick",
} as const;

export type CaptureProfile = typeof CAPTURE_PROFILE[keyof typeof CAPTURE_PROFILE];

const norm = (deg: number): number => ((Math.round(deg) % 360) + 360) % 360;
const between = (t: number, a: number, b: number): boolean => (a <= b ? t >= a && t < b : t >= a || t < b);

export const quantiseTheta = (deg: number): number => norm(deg);
export const quantiseRadius = (r: number): number => Math.round(Math.min(Math.max(r, 0), 1) * 100) / 100;

export const thetaFromClock = (hour: number): number => norm(hour * 30);
export const clockFromTheta = (theta: number): number => (Math.round(norm(theta) / 30) % 12) || 12;

/** Batter-relative theta -> screen angle for field rendering */
export function screenAngle(theta: number | null, batHand: "R" | "L" = "R"): number | null {
    if (theta == null) return null;
    return batHand === "L" ? norm(360 - theta) : norm(theta);
}

/** Screen angle tap -> batter-relative theta */
export function thetaFromScreen(angle: number, batHand: "R" | "L" = "R"): number {
    return batHand === "L" ? norm(360 - angle) : norm(angle);
}

// ── Fielding Circle & Depth Bands ─────────────────────────
export const CIRCLE_RADIUS_M = 27.43; // 30 yards
export const DEFAULT_BOUNDARY_M = 62; // mid-sized school ground
export const fieldingCircle = (boundaryM = DEFAULT_BOUNDARY_M): number =>
    Math.min(CIRCLE_RADIUS_M / boundaryM, 0.95);

export const DEPTH = {
    SILLY: "silly",
    SHORT: "short",
    RING: "ring",
    DEEP: "deep",
} as const;

export type DepthBand = typeof DEPTH[keyof typeof DEPTH];

export const SILLY_MAX = 0.11;
export const SHORT_MAX = 0.26;

export function depthBand(radius: number | null, options: { boundaryM?: number } = {}): DepthBand | null {
    if (radius == null) return null;
    if (radius < SILLY_MAX) return DEPTH.SILLY;
    if (radius < SHORT_MAX) return DEPTH.SHORT;
    return radius < fieldingCircle(options.boundaryM) ? DEPTH.RING : DEPTH.DEEP;
}

// ── Angular Families ──────────────────────────────────────
const FAMILIES: Array<[number, number, string, string, string, string | null, string | null]> = [
    [345, 15, "straight_behind", "long stop", "long stop", "short fine leg", null],
    [15, 40, "fine_leg", "fine leg", "deep fine leg", "short fine leg", null],
    [40, 70, "backward_square", "backward square leg", "deep backward square leg", "short leg", null],
    [70, 105, "square_leg", "square leg", "deep square leg", "short leg", null],
    [105, 145, "mid_wicket", "mid-wicket", "deep mid-wicket", "short mid-wicket", null],
    [145, 175, "mid_on", "mid on", "long on", "short mid on", "silly mid on"],
    [175, 185, "straight", "straight", "long on", "short straight", null],
    [185, 215, "mid_off", "mid off", "long off", "short mid off", "silly mid off"],
    [215, 255, "cover", "cover", "deep cover", "short cover", null],
    [255, 275, "point", "point", "deep point", "short point", "silly point"],
    [275, 310, "backward_point", "backward point", "deep backward point", "short third", null],
    [310, 345, "third", "third", "deep third", "short third", null],
];

export function angularFamily(theta: number | null): string | null {
    if (theta == null) return null;
    const t = norm(theta);
    for (const [a, b, key] of FAMILIES) if (between(t, a, b)) return key;
    return null;
}

// ── Catching Ring ──────────────────────────────────────────
export const CLOSE_RADIUS = SILLY_MAX;

export const CLOSE_POSITION = {
    KEEPER: "keeper",
    SLIP: "slip",
    GULLY: "gully",
    LEG_SLIP: "leg_slip",
    LEG_GULLY: "leg_gully",
    SILLY_POINT: "silly_point",
    SHORT_LEG: "short_leg",
    SHORT_MID_WICKET: "short_mid_wicket",
    AT_FEET: "at_feet",
} as const;

export interface ClosePositionDefinition {
    name: string;
    angleDeg: number;
    radiusFrac: number;
}

export const CLOSE_POSITIONS: ClosePositionDefinition[] = [
    { name: '1st Slip', angleDeg: 348, radiusFrac: 0.12 },
    { name: '2nd Slip', angleDeg: 340, radiusFrac: 0.13 },
    { name: '3rd Slip', angleDeg: 332, radiusFrac: 0.14 },
    { name: 'Gully', angleDeg: 305, radiusFrac: 0.18 },
    { name: 'Silly Point', angleDeg: 270, radiusFrac: 0.10 },
    { name: 'Keeper', angleDeg: 0, radiusFrac: 0.14 },
    { name: 'Leg Slip', angleDeg: 15, radiusFrac: 0.12 },
    { name: 'Short Leg', angleDeg: 75, radiusFrac: 0.10 },
    { name: 'Short Mid Wicket', angleDeg: 130, radiusFrac: 0.18 },
];

const SLIP_ARC = 8;
const SLIP_FIRST = 352;

export function closePositionFor(theta: number | null, radius: number | null): string | null {
    if (theta == null || radius == null || radius >= CLOSE_RADIUS) return null;
    if (radius < 0.03) return CLOSE_POSITION.AT_FEET;
    const t = norm(theta);
    if (between(t, 356, 4)) return CLOSE_POSITION.KEEPER;
    if (between(t, 320, 356)) {
        const n = Math.min(Math.floor((SLIP_FIRST - t + 360) % 360 / SLIP_ARC) + 1, 5);
        return `${CLOSE_POSITION.SLIP}_${n}`;
    }
    if (between(t, 290, 320)) return CLOSE_POSITION.GULLY;
    if (between(t, 255, 290)) return CLOSE_POSITION.SILLY_POINT;
    if (between(t, 4, 25)) return CLOSE_POSITION.LEG_SLIP;
    if (between(t, 25, 55)) return CLOSE_POSITION.LEG_GULLY;
    if (between(t, 55, 110)) return CLOSE_POSITION.SHORT_LEG;
    if (between(t, 110, 150)) return CLOSE_POSITION.SHORT_MID_WICKET;
    return CLOSE_POSITION.AT_FEET;
}

export function positionName(theta: number | null, radius: number | null, options: { boundaryM?: number } = {}): string | null {
    if (theta == null || radius == null) return null;
    const close = closePositionFor(theta, radius);
    if (close) return close.replace(/_/g, " ").replace(/(\d)$/, " $1");
    const t = norm(theta);
    const row = FAMILIES.find(([a, b]) => between(t, a, b));
    if (!row) return null;
    const [, , , ring, deep, short, silly] = row;
    switch (depthBand(radius, options)) {
        case DEPTH.SILLY: return silly ?? short ?? ring;
        case DEPTH.SHORT: return short ?? ring;
        case DEPTH.DEEP: return deep;
        default: return ring;
    }
}

export const R_ROPE = 124, R_INNER = 56, R_MIDDLE = 104;
export const ZONE_INNER = R_INNER / R_ROPE;  // 0.45
export const ZONE_OUTER = R_MIDDLE / R_ROPE; // 0.84

export function zoneFromRadius(radius: number | null): "boundary" | "outer" | "inner" | null {
    if (radius == null) return null;
    if (radius >= ZONE_OUTER) return "boundary";
    if (radius >= ZONE_INNER) return "outer";
    return "inner";
}

export function segFromScreenAngle(angle: number | null): number | null {
    if (angle == null) return null;
    return Math.round(norm(angle) / 30) % 12;
}

export interface CapturedPlacement {
    theta: number;
    radius: number;
    placementSource: typeof PLACEMENT_SOURCE.POINT;
    placementNull: null;
    closePosition: string | null;
    captureProfile: CaptureProfile;
    seg: number | null;
    zone: "boundary" | "outer" | "inner" | null;
}

export function placementFromTap({
    angle,
    radius,
    batHand = "R",
    profile = CAPTURE_PROFILE.FULL,
}: {
    angle: number;
    radius: number;
    batHand?: "R" | "L";
    profile?: CaptureProfile;
}): CapturedPlacement {
    const theta = quantiseTheta(thetaFromScreen(angle, batHand));
    const r = quantiseRadius(radius);
    return {
        theta,
        radius: r,
        placementSource: PLACEMENT_SOURCE.POINT,
        placementNull: null,
        closePosition: closePositionFor(theta, r),
        captureProfile: profile,
        seg: segFromScreenAngle(screenAngle(theta, batHand)),
        zone: zoneFromRadius(r),
    };
}

export function noPlacement(reason: PlacementNullReason, profile = CAPTURE_PROFILE.FULL) {
    return {
        theta: null,
        radius: null,
        placementSource: null,
        placementNull: reason,
        closePosition: null,
        captureProfile: profile,
        seg: null,
        zone: null,
    };
}
