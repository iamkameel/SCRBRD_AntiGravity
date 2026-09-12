/**
 * SCRBRD — Design System Tokens (Design 2.0)
 *
 * Neutral-first surfaces with selective spectral accents. Surfaces and text
 * are CSS variables so they follow the theme; accents are hex constants so
 * the `${D.lime}18` alpha-suffix idiom used across the codebase keeps working.
 *
 * Usage:
 *   import { D } from '@/lib/design-system';
 *   style={{ color: D.positive, background: D.brand + '18' }}
 *
 * Legacy keys (indigo, amber, rose, violet, teal, orange, pink, syne) remain
 * as aliases so existing references resolve; new code should use the
 * semantic and spectral names.
 */

// ── §6.1 Core neutrals ───────────────────────────────────────────
export const NEUTRALS = {
    black: '#080A0B',
    ink: '#0D1012',
    graphite: '#14181B',
    surface: '#1A2024',
    surface2: '#22292E',
    white: '#F7F8F3',
    paper: '#F2F3ED',
    mist: '#E3E7E2',
    muted: '#A8B0AC',
} as const;

// ── §6.2 Signature spectral palette ──────────────────────────────
export const SPECTRAL = {
    lime: '#D7F900',      // signature — strong primary and live-performance moments only
    acid: '#B8F20A',
    green: '#31C884',
    emerald: '#0D985D',
    cyan: '#28C9E8',
    sky: '#188EF5',
    cobalt: '#315BA8',
    midnight: '#001F3F',
    yellow: '#FFD817',    // attention and sport-energy, never a permanent dominant
} as const;

// ── §6.3 Semantic states — never the only carrier of meaning ─────
export const STATES = {
    positive: '#38D684',
    warning: '#FFC84A',
    critical: '#FF5F63',  // wickets, errors, critical alerts — spend sparingly
    info: '#4DA7FF',
    neutral: '#8F9A96',
} as const;

/** Combined accent map. Legacy names map onto the new palette. */
export const ACCENTS = {
    brand: SPECTRAL.lime,
    ...SPECTRAL,
    ...STATES,
    // legacy aliases
    indigo: SPECTRAL.lime,
    amber: STATES.warning,
    rose: STATES.critical,
    violet: SPECTRAL.cobalt,
    teal: SPECTRAL.emerald,
    orange: SPECTRAL.yellow,
    pink: SPECTRAL.cyan,
} as const;

// ── §7 Gradients — behave like light, not wallpaper ──────────────
export const GRADIENTS = {
    signature: 'var(--grad-signature)',
    energy: 'var(--grad-energy)',
    performance: 'var(--grad-performance)',
    alert: 'var(--grad-alert)',
    achievement: 'var(--grad-achievement)',
    // legacy aliases
    main: 'var(--grad-energy)',
    gold: 'var(--grad-achievement)',
    live: 'var(--grad-performance)',
} as const;

// ── §10 Shape ────────────────────────────────────────────────────
export const RADIUS = {
    sm: '10px',
    md: '16px',
    lg: '22px',
    xl: '30px',
    pill: '999px',
} as const;

// ── §11 Typefaces (vars set by layout.tsx via next/font) ─────────
export const FONTS = {
    head: 'var(--font-head)',   // Inter Tight — display, headings, scores
    sans: 'var(--font-sans)',   // Inter — UI controls
    body: 'var(--font-body)',   // Inter — body copy
    mono: 'var(--font-mono)',   // Geist Mono — data, numerics
} as const;

// ── §44 Motion ───────────────────────────────────────────────────
export const MOTION = {
    control: 'var(--motion-control)',
    panel: 'var(--motion-panel)',
    major: 'var(--motion-major)',
    event: 'var(--motion-event)',
    ease: 'var(--ease-standard)',
    spring: 'var(--ease-spring)',
} as const;

// ── Composite D token object ─────────────────────────────────────
export const D = {
    // Theme-aware surfaces and text (CSS variables)
    bg: 'var(--bg-app)',
    base: 'var(--bg-app)',
    surface0: 'var(--surface-0)',
    surface1: 'var(--surface-1)',
    surface2: 'var(--surface-2)',
    surface3: 'var(--surface-3)',
    surface4: 'var(--surface-4)',
    // legacy surface names
    surf0: 'var(--surf0)',
    surf1: 'var(--surf1)',
    surf2: 'var(--surf2)',
    surf3: 'var(--surf3)',
    border: 'var(--border-subtle)',
    borderMed: 'var(--border-med)',
    cardBg: 'var(--card-ghost)',
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    textMuted: 'var(--text-muted)',

    // Accents (hex, alpha-suffixable)
    ...ACCENTS,

    // Gradients
    ...GRADIENTS,
    grad: GRADIENTS.energy,
    gradMain: GRADIENTS.energy,
    gradGold: GRADIENTS.achievement,
    gradLive: GRADIENTS.performance,

    // Shape
    sm: RADIUS.sm,
    md: RADIUS.md,
    lg: RADIUS.lg,
    xl: RADIUS.xl,
    xxl: '36px',
    pill: RADIUS.pill,

    // §9 Glass — selective use only
    glass: 'rgba(20, 24, 27, 0.72)',

    // Type
    mono: FONTS.mono,
    head: FONTS.head,
    syne: FONTS.head,   // legacy alias
    sans: FONTS.sans,
    body: FONTS.body,

    // Motion
    ...MOTION,
} as const;

// ── Role colours — a few hues, reused; not one per role ──────────
// §6 rule: fewer simultaneous accents. Roles group by tier.
const PLATFORM = SPECTRAL.lime;
const COMPETITION = SPECTRAL.cyan;
const SCHOOL = SPECTRAL.sky;
const COACHING = SPECTRAL.green;
const OPERATIONS = SPECTRAL.yellow;
const MEDICAL = STATES.critical;
const PARTICIPANT = SPECTRAL.acid;
const EXTERNAL = STATES.neutral;

export const ROLE_COLOURS: Record<string, string> = {
    superadmin: PLATFORM,
    platformops: PLATFORM,
    leagueadmin: COMPETITION,
    tournamentdirector: COMPETITION,
    sportsmaster: SCHOOL,
    schooladmin: SCHOOL,
    schoolstaff: SCHOOL,
    medicalofficer: MEDICAL,
    coach: COACHING,
    coachsupport: COACHING,
    selector: COACHING,
    matchofficial: OPERATIONS,
    groundskeeper: OPERATIONS,
    driver: OPERATIONS,
    player: PARTICIPANT,
    adultplayer: PARTICIPANT,
    parent: PARTICIPANT,
    scout: EXTERNAL,
    external: EXTERNAL,
    // Display-name aliases
    'System Architect': PLATFORM,
    'Platform Ops': PLATFORM,
    'Admin': COMPETITION,
    'Sportsmaster': SCHOOL,
    'Sports Master': SCHOOL,
    'School Admin': SCHOOL,
    'Team Manager': SCHOOL,
    'Coach': COACHING,
    'Assistant Coach': COACHING,
    'Coach Support': COACHING,
    'Captain': COACHING,
    'Umpire': OPERATIONS,
    'Scorer': OPERATIONS,
    'Match Official': OPERATIONS,
    'Groundskeeper': OPERATIONS,
    'Grounds-Keeper': OPERATIONS,
    'Driver': OPERATIONS,
    'Trainer': MEDICAL,
    'Physiotherapist': MEDICAL,
    'Doctor': MEDICAL,
    'First Aid': MEDICAL,
    'Medical Officer': MEDICAL,
    'Player': PARTICIPANT,
    'Adult Player': PARTICIPANT,
    'Guardian': PARTICIPANT,
    'Parent': PARTICIPANT,
    'Scout': EXTERNAL,
    'External': EXTERNAL,
    'Spectator': EXTERNAL,
};

/** Role accent colour with a safe fallback. */
export function getRoleColour(role?: string): string {
    if (!role) return ACCENTS.brand;
    return ROLE_COLOURS[role] ?? ROLE_COLOURS[role.toLowerCase()] ?? ACCENTS.brand;
}

/** Alpha-tint a hex colour: bg → 18, border → 30, hover → 22. */
export function alpha(hex: string, suffix: '18' | '22' | '30' | '33' | '44' | '55' | '66' | '08' | '12'): string {
    return `${hex}${suffix}`;
}
