/**
 * SCRBRD CricketOS — Design System Tokens
 * UIX Guidelines 2026 · §2 Colour System
 *
 * Usage:
 *   import { D, ROLE_COLOURS } from '@/lib/design-system';
 *   style={{ color: D.indigo, background: D.indigo + '18' }}
 */

// ── Dark Theme Surfaces ──────────────────────────────────────────
export const DARK = {
    bg: '#060910',   // App background — deepest layer
    surf0: '#0a0f1a',   // Page canvas
    surf1: '#0f1621',   // Card base layer, modals
    surf2: '#151d2e',   // Input fields, secondary cards
    surf3: '#1c2640',   // Hover states, chip backgrounds
    border: 'rgba(255,255,255,0.07)',  // Hairline borders
    borderMed: 'rgba(255,255,255,0.12)', // Visible separators
    cardBg: 'rgba(255,255,255,0.03)', // Ghost card background
    textPrimary: '#f0f4ff',   // Primary text
    textSecondary: '#8b9bc4',   // Secondary text, labels
    textMuted: '#4a5570',   // Muted text, placeholders
} as const;

// ── Light Theme Surfaces ─────────────────────────────────────────
export const LIGHT = {
    bg: '#f0f4f8',
    surf0: '#ffffff',
    surf1: '#ffffff',
    surf2: '#f5f7fb',
    surf3: '#eaeff7',
    border: 'rgba(0,0,0,0.08)',
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#94a3b8',
} as const;

// ── Accent Colours — Semantic Mapping (§2.4) ─────────────────────
export const ACCENTS = {
    indigo: '#6366f1',  // Brand primary — nav active, primary buttons
    sky: '#0ea5e9',  // Match / live data — scores, match cards
    emerald: '#10b981',  // Positive / live — wins, live status, fitness
    amber: '#f59e0b',  // Warning / traction — notifications, upcoming
    rose: '#f43f5e',  // Danger / medical — injuries, errors, wickets
    violet: '#8b5cf6',  // Restricted / advanced — passport, talent
    teal: '#14b8a6',  // Infrastructure — grounds, school admin
    orange: '#f97316',  // Scheduling / officials
    cyan: '#06b6d4',  // Support roles
    lime: '#84cc16',  // Transport — driver, vehicle/logistics
    pink: '#ec4899',  // Secondary accent — decorative only
} as const;

// ── Gradients (§2.5) ─────────────────────────────────────────────
export const GRADIENTS = {
    main: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
    gold: 'linear-gradient(135deg, #f59e0b, #f97316)',
    live: 'linear-gradient(135deg, #10b981, #06b6d4)',
} as const;

// ── Border Radius (§4.1) ─────────────────────────────────────────
export const RADIUS = {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '18px',
    pill: '999px',
} as const;

// ── Font Families (§3.1) ─────────────────────────────────────────
export const FONTS = {
    // Reference CSS vars so inline style={{ fontFamily: D.head }} also gets the
    // Next.js-loaded optimised subset (same vars injected by layout.tsx)
    mono: "var(--font-dm-mono, 'DM Mono', monospace)",     // All numeric/data values
    head: "var(--font-syne, 'Syne', sans-serif)",          // Main high-impact page titles
    sans: "var(--font-open-sans, 'Open Sans', sans-serif)",// Clean subheadings & UI controls
    body: "var(--font-open-sans, 'Open Sans', 'DM Sans', sans-serif)",    // Body copy & descriptions
} as const;

// ── Composite D token object (matches cricket_os.jsx API) ────────
export const D = {
    // Dynamic theme-aware surface & text tokens
    bg: 'var(--bg-app)',
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

    // Constant semantic accents & fonts
    ...ACCENTS,
    ...GRADIENTS,
    gradMain: GRADIENTS.main,
    gradGold: GRADIENTS.gold,
    gradLive: GRADIENTS.live,
    sm: RADIUS.sm,
    md: RADIUS.md,
    lg: RADIUS.lg,
    xl: RADIUS.xl,
    pill: RADIUS.pill,
    mono: FONTS.mono,
    head: FONTS.head,
    sans: FONTS.sans,
    body: FONTS.body,
} as const;

// ── Role Colour Map (§2.7) ───────────────────────────────────────
export const ROLE_COLOURS: Record<string, string> = {
    superadmin: ACCENTS.violet,
    platformops: '#7c3aed',
    leagueadmin: ACCENTS.indigo,
    tournamentdirector: '#4f46e5',
    sportsmaster: ACCENTS.amber,
    schooladmin: ACCENTS.teal,
    medicalofficer: ACCENTS.rose,
    schoolstaff: ACCENTS.sky,
    coach: ACCENTS.emerald,
    coachsupport: ACCENTS.cyan,
    matchofficial: ACCENTS.orange,
    selector: ACCENTS.amber,
    player: ACCENTS.emerald,
    adultplayer: ACCENTS.emerald,
    parent: ACCENTS.sky,
    scout: ACCENTS.violet,
    external: '#64748b',
    // Aliases (from ROLES enum)
    'System Architect': ACCENTS.violet,
    'Platform Ops': '#7c3aed',
    'School Admin': ACCENTS.teal,
    'Sports Master': ACCENTS.amber,
    'Coach': ACCENTS.emerald,
    'Coach Support': ACCENTS.cyan,
    'Player': ACCENTS.emerald,
    'Adult Player': ACCENTS.emerald,
    'Match Official': ACCENTS.orange,
    'Medical Officer': ACCENTS.rose,
    'Groundskeeper': ACCENTS.teal,
    'Driver': ACCENTS.lime,
    'Parent': ACCENTS.sky,
    'Scout': ACCENTS.violet,
    'External': '#64748b',
    'Spectator': '#64748b',
};

/**
 * Get role accent colour — safe with fallback
 */
export function getRoleColour(role?: string): string {
    if (!role) return ACCENTS.indigo;
    return ROLE_COLOURS[role] ?? ROLE_COLOURS[role.toLowerCase()] ?? ACCENTS.indigo;
}

/**
 * Alpha-tint a hex colour per UIX spec §2.6
 * bg → +18, border → +30, hover → +22
 */
export function alpha(hex: string, suffix: '18' | '22' | '30' | '33' | '44' | '55' | '66' | '08' | '12'): string {
    return `${hex}${suffix}`;
}
