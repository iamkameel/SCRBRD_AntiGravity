/**
 * SCRBRD Highlight Clipper Engine
 * ===============================
 * Pure functions that turn the live ball feed into clip-worthy moments, map
 * them onto the broadcast stream's timeline, assemble a highlight reel within
 * a duration budget, and export markers for OBS / vMix / YouTube / NLEs.
 *
 * No I/O here — persistence lives in highlightService, UI in HighlightClipper.
 */

import type { LiveBallEvent, LiveMatchState, MilestoneAlert } from '@/services/liveMatchSync';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type HighlightKind =
    | 'SIX' | 'FOUR' | 'WICKET' | 'HAT_TRICK' | 'MAIDEN'
    | 'FIFTY' | 'CENTURY' | 'FIVE_FOR' | 'INNINGS_CLOSE' | 'MANUAL';

export type ClipStatus = 'QUEUED' | 'CLIPPED' | 'PUBLISHED' | 'DISCARDED';

export interface HighlightClip {
    id: string;
    fixtureId: string;
    kind: HighlightKind;
    title: string;
    description: string;
    over: string;                 // "34.2"
    players: string[];
    priority: 1 | 2 | 3;          // 1 = must-include
    source: 'AUTO' | 'MANUAL';
    status: ClipStatus;
    detectedAt: string;           // ISO wall-clock
    streamOffsetSec: number | null; // seconds since stream start (null until synced)
    clipStartSec: number | null;
    clipEndSec: number | null;
    durationSec: number;
    tags: string[];
    sourceBallId?: string;
}

export interface StreamSync {
    /** ISO timestamp of when the broadcast stream started (t = 0). */
    streamStartIso: string | null;
    /** Seconds the scorer lags the pictures (positive = scorer is behind). */
    scorerLagSec: number;
}

export interface ClipWindowConfig {
    preRollSec: number;
    postRollSec: number;
}

export interface KindMeta {
    label: string;
    emoji: string;
    priority: 1 | 2 | 3;
    preRollSec: number;
    postRollSec: number;
    tags: string[];
}

export const KIND_META: Record<HighlightKind, KindMeta> = {
    SIX:           { label: 'Six',            emoji: '💥', priority: 2, preRollSec: 8,  postRollSec: 6,  tags: ['boundary', 'six'] },
    FOUR:          { label: 'Four',           emoji: '🏏', priority: 3, preRollSec: 6,  postRollSec: 5,  tags: ['boundary', 'four'] },
    WICKET:        { label: 'Wicket',         emoji: '🎯', priority: 1, preRollSec: 8,  postRollSec: 10, tags: ['wicket'] },
    HAT_TRICK:     { label: 'Hat-trick',      emoji: '🎩', priority: 1, preRollSec: 30, postRollSec: 15, tags: ['wicket', 'hat-trick', 'milestone'] },
    MAIDEN:        { label: 'Maiden Over',    emoji: '🧱', priority: 3, preRollSec: 40, postRollSec: 4,  tags: ['bowling', 'maiden'] },
    FIFTY:         { label: 'Half-century',   emoji: '5️⃣', priority: 1, preRollSec: 6,  postRollSec: 12, tags: ['milestone', 'batting'] },
    CENTURY:       { label: 'Century',        emoji: '💯', priority: 1, preRollSec: 8,  postRollSec: 20, tags: ['milestone', 'batting'] },
    FIVE_FOR:      { label: 'Five-wicket haul', emoji: '🖐️', priority: 1, preRollSec: 8, postRollSec: 15, tags: ['milestone', 'bowling'] },
    INNINGS_CLOSE: { label: 'Innings Close',  emoji: '🔔', priority: 2, preRollSec: 10, postRollSec: 10, tags: ['innings'] },
    MANUAL:        { label: 'Marked Moment',  emoji: '📍', priority: 2, preRollSec: 10, postRollSec: 8,  tags: ['manual'] },
};

// ─────────────────────────────────────────────────────────────────────────────
// Time helpers
// ─────────────────────────────────────────────────────────────────────────────

export function toStreamOffset(detectedAtIso: string, sync: StreamSync): number | null {
    if (!sync.streamStartIso) return null;
    const start = new Date(sync.streamStartIso).getTime();
    const at = new Date(detectedAtIso).getTime();
    if (isNaN(start) || isNaN(at)) return null;
    // The scorer records the ball slightly after it happened on the pictures,
    // so subtract their lag to land on the actual moment.
    return Math.max(0, Math.round((at - start) / 1000 - sync.scorerLagSec));
}

export function buildClipWindow(
    offsetSec: number | null,
    kind: HighlightKind,
    override?: Partial<ClipWindowConfig>
): { clipStartSec: number | null; clipEndSec: number | null; durationSec: number } {
    const meta = KIND_META[kind];
    const pre = override?.preRollSec ?? meta.preRollSec;
    const post = override?.postRollSec ?? meta.postRollSec;
    if (offsetSec === null) return { clipStartSec: null, clipEndSec: null, durationSec: pre + post };
    const clipStartSec = Math.max(0, offsetSec - pre);
    const clipEndSec = offsetSec + post;
    return { clipStartSec, clipEndSec, durationSec: clipEndSec - clipStartSec };
}

/** Re-derive every clip's window against a new sync / roll config. */
export function resyncClips(clips: HighlightClip[], sync: StreamSync, roll?: Partial<ClipWindowConfig>): HighlightClip[] {
    return clips.map(c => {
        const streamOffsetSec = toStreamOffset(c.detectedAt, sync);
        return { ...c, streamOffsetSec, ...buildClipWindow(streamOffsetSec, c.kind, roll) };
    });
}

export function formatTimecode(sec: number | null, withFrames = false, fps = 25): string {
    if (sec === null || isNaN(sec)) return '--:--:--';
    const s = Math.max(0, sec);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = Math.floor(s % 60);
    const base = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    if (!withFrames) return base;
    const frames = Math.round((s - Math.floor(s)) * fps);
    return `${base}:${String(frames).padStart(2, '0')}`;
}

export function formatDuration(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return m ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Detection
// ─────────────────────────────────────────────────────────────────────────────

let idCounter = 0;
function nextId(prefix: string): string {
    idCounter += 1;
    return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

function overLabel(ball: LiveBallEvent): string {
    return `${ball.overNumber}.${ball.ballNumber}`;
}

function makeClip(
    fixtureId: string,
    kind: HighlightKind,
    title: string,
    description: string,
    over: string,
    players: string[],
    sync: StreamSync,
    extra: Partial<HighlightClip> = {}
): HighlightClip {
    const meta = KIND_META[kind];
    const detectedAt = extra.detectedAt ?? new Date().toISOString();
    const streamOffsetSec = toStreamOffset(detectedAt, sync);
    return {
        id: nextId('hl'),
        fixtureId,
        kind,
        title,
        description,
        over,
        players,
        priority: meta.priority,
        source: 'AUTO',
        status: 'QUEUED',
        detectedAt,
        streamOffsetSec,
        ...buildClipWindow(streamOffsetSec, kind),
        tags: [...meta.tags],
        ...extra,
    };
}

/**
 * Detect every highlight a single new ball produces, given the state before
 * and after it was applied. Returns [] for a dot ball.
 */
export function detectHighlightsForBall(
    ball: LiveBallEvent,
    before: LiveMatchState,
    after: LiveMatchState,
    sync: StreamSync
): HighlightClip[] {
    const fixtureId = after.fixtureId;
    const over = overLabel(ball);
    const out: HighlightClip[] = [];
    const detectedAt = ball.timestamp && !isNaN(new Date(ball.timestamp).getTime())
        ? new Date(ball.timestamp).toISOString()
        : new Date().toISOString();
    const base = { detectedAt, sourceBallId: ball.id };

    // Hat-trick: this wicket plus the previous two legal balls from the same bowler were wickets.
    if (ball.isWicket) {
        const priorLegal = before.recentBalls
            .filter(b => b.bowlerName === ball.bowlerName && !b.extraType)
            .slice(0, 2);
        const isHatTrick = priorLegal.length === 2 && priorLegal.every(b => b.isWicket);
        if (isHatTrick) {
            out.push(makeClip(fixtureId, 'HAT_TRICK', `HAT-TRICK! ${ball.bowlerName}`,
                `${ball.bowlerName} takes three in three — ${ball.dismissedPlayerName || ball.strikerName} the third victim.`,
                over, [ball.bowlerName], sync, base));
        } else {
            const victim = ball.dismissedPlayerName || ball.strikerName;
            out.push(makeClip(fixtureId, 'WICKET', `WICKET — ${victim}`,
                `${victim} ${ball.wicketType ? ball.wicketType.toLowerCase() : 'dismissed'} by ${ball.bowlerName}. ${after.battingTeamName} ${after.totalRuns}/${after.wickets}.`,
                over, [victim, ball.bowlerName], sync, base));
        }

        // Five-for: bowler's tally crosses 5 on this ball.
        const wktsBefore = before.currentBowler.name === ball.bowlerName ? before.currentBowler.wicketsTaken : 0;
        const wktsAfter = after.currentBowler.name === ball.bowlerName ? after.currentBowler.wicketsTaken : wktsBefore + 1;
        if (wktsBefore < 5 && wktsAfter >= 5) {
            out.push(makeClip(fixtureId, 'FIVE_FOR', `FIVE-FOR — ${ball.bowlerName}`,
                `${ball.bowlerName} completes a five-wicket haul (${wktsAfter}-${after.currentBowler.runsConceded}).`,
                over, [ball.bowlerName], sync, base));
        }
    }

    if (ball.runsOffBat === 6) {
        out.push(makeClip(fixtureId, 'SIX', `SIX — ${ball.strikerName}`,
            `${ball.strikerName} clears the rope${ball.shotZone ? ` over ${ball.shotZone}` : ''} off ${ball.bowlerName}.`,
            over, [ball.strikerName, ball.bowlerName], sync, base));
    } else if (ball.runsOffBat === 4) {
        out.push(makeClip(fixtureId, 'FOUR', `FOUR — ${ball.strikerName}`,
            `${ball.strikerName} finds the fence${ball.shotZone ? ` through ${ball.shotZone}` : ''} off ${ball.bowlerName}.`,
            over, [ball.strikerName, ball.bowlerName], sync, base));
    }

    // Batting milestones: striker crosses 50 / 100 on this ball.
    if (!ball.isWicket && before.striker.name === ball.strikerName) {
        const runsBefore = before.striker.runs;
        const runsAfter = runsBefore + ball.runsOffBat;
        const balls = before.striker.ballsFacing + 1;
        if (runsBefore < 100 && runsAfter >= 100) {
            out.push(makeClip(fixtureId, 'CENTURY', `CENTURY — ${ball.strikerName}`,
                `${ball.strikerName} brings up a hundred off ${balls} balls.`, over, [ball.strikerName], sync, base));
        } else if (runsBefore < 50 && runsAfter >= 50) {
            out.push(makeClip(fixtureId, 'FIFTY', `FIFTY — ${ball.strikerName}`,
                `${ball.strikerName} reaches a half-century off ${balls} balls.`, over, [ball.strikerName], sync, base));
        }
    }

    // Maiden: sixth legal ball of an over where every ball in the over conceded nothing.
    if (ball.ballNumber === 6 && !ball.extraType && ball.totalRuns === 0) {
        const thisOver = [ball, ...before.recentBalls.filter(b => b.overNumber === ball.overNumber)];
        const legal = thisOver.filter(b => !b.extraType);
        if (legal.length >= 6 && thisOver.every(b => b.totalRuns === 0)) {
            out.push(makeClip(fixtureId, 'MAIDEN', `MAIDEN — ${ball.bowlerName}`,
                `${ball.bowlerName} bowls a maiden (over ${ball.overNumber}).`, `${ball.overNumber}.6`, [ball.bowlerName], sync, base));
        }
    }

    // Innings close on the 10th wicket.
    if (ball.isWicket && after.wickets >= 10) {
        out.push(makeClip(fixtureId, 'INNINGS_CLOSE', `ALL OUT — ${after.battingTeamName} ${after.totalRuns}`,
            `${after.battingTeamName} bowled out for ${after.totalRuns}.`, over, [], sync, base));
    }

    return out;
}

/** Build a manual "mark this moment" clip at wall-clock now. */
export function createManualClip(
    fixtureId: string,
    title: string,
    sync: StreamSync,
    state: LiveMatchState,
    roll?: Partial<ClipWindowConfig>
): HighlightClip {
    const over = `${state.oversCompleted}.${state.ballsInOver}`;
    const clip = makeClip(fixtureId, 'MANUAL', title || 'Marked moment',
        `${state.battingTeamName} ${state.totalRuns}/${state.wickets} (${over} ov) — ${state.striker.name} ${state.striker.runs}* facing ${state.currentBowler.name}.`,
        over, [state.striker.name, state.currentBowler.name], sync, { source: 'MANUAL' });
    return { ...clip, ...buildClipWindow(clip.streamOffsetSec, 'MANUAL', roll) };
}

/**
 * Seed clips from the balls already in the live buffer (demo / late-start).
 * Stamps each ball a few seconds apart so they sit on a plausible timeline.
 */
export function seedFromRecentBalls(state: LiveMatchState, sync: StreamSync): HighlightClip[] {
    const balls = [...state.recentBalls].reverse(); // oldest first
    const out: HighlightClip[] = [];
    const now = Date.now();
    let cursor: LiveMatchState = { ...state, recentBalls: [], striker: { ...state.striker, runs: Math.max(0, state.striker.runs - 20) } };
    balls.forEach((ball, i) => {
        const stamped: LiveBallEvent = { ...ball, timestamp: new Date(now - (balls.length - i) * 45_000).toISOString() };
        const after: LiveMatchState = { ...cursor, recentBalls: [stamped, ...cursor.recentBalls] };
        out.push(...detectHighlightsForBall(stamped, cursor, after, sync));
        cursor = after;
    });
    return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reel assembly
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pick the best clips that fit inside `budgetSec`, then return them in
 * chronological order. Priority first, then earlier moments first.
 */
export function buildHighlightReel(clips: HighlightClip[], budgetSec: number): { reel: HighlightClip[]; totalSec: number } {
    const eligible = clips
        .filter(c => c.status !== 'DISCARDED' && c.streamOffsetSec !== null)
        .sort((a, b) => a.priority - b.priority || (a.streamOffsetSec! - b.streamOffsetSec!));

    const reel: HighlightClip[] = [];
    let total = 0;
    for (const c of eligible) {
        if (total + c.durationSec > budgetSec) continue;
        reel.push(c);
        total += c.durationSec;
    }
    reel.sort((a, b) => a.streamOffsetSec! - b.streamOffsetSec!);
    return { reel, totalSec: total };
}

/** Convert a clip into the alert the broadcast overlay already knows how to render. */
export function clipToOverlayAlert(clip: HighlightClip): MilestoneAlert {
    const map: Partial<Record<HighlightKind, MilestoneAlert['type']>> = {
        SIX: 'SIX', FOUR: 'FOUR', WICKET: 'WICKET', HAT_TRICK: 'HAT_TRICK', FIFTY: 'FIFTY', CENTURY: 'CENTURY',
    };
    return {
        id: `ov-${clip.id}`,
        type: map[clip.kind] ?? 'FIFTY',
        title: clip.title,
        description: clip.description,
        timestamp: new Date().toLocaleTimeString(),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

function chronological(clips: HighlightClip[]): HighlightClip[] {
    return clips
        .filter(c => c.status !== 'DISCARDED' && c.clipStartSec !== null)
        .sort((a, b) => a.clipStartSec! - b.clipStartSec!);
}

/** YouTube description chapters — first chapter must be 00:00. */
export function exportYouTubeChapters(clips: HighlightClip[], intro = 'Start'): string {
    const lines = [`00:00 ${intro}`];
    chronological(clips).forEach(c => {
        const t = c.streamOffsetSec ?? c.clipStartSec ?? 0;
        const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60);
        const stamp = h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
        lines.push(`${stamp} ${KIND_META[c.kind].emoji} ${c.title} (${c.over} ov)`);
    });
    return lines.join('\n');
}

/** Generic CSV markers (Premiere / Resolve / vMix import). */
export function exportCsvMarkers(clips: HighlightClip[]): string {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['Marker Name', 'Description', 'In', 'Out', 'Duration', 'Marker Type', 'Over', 'Players', 'Priority', 'Status'];
    const rows = chronological(clips).map(c => [
        c.title, c.description,
        formatTimecode(c.clipStartSec, true), formatTimecode(c.clipEndSec, true), formatTimecode(c.durationSec, true),
        KIND_META[c.kind].label, c.over, c.players.join('; '), c.priority, c.status,
    ].map(esc).join(','));
    return [header.map(esc).join(','), ...rows].join('\n');
}

/** CMX3600-style EDL so an editor can conform the reel against the stream recording. */
export function exportEdl(clips: HighlightClip[], title: string, fps = 25): string {
    const lines = [`TITLE: ${title}`, 'FCM: NON-DROP FRAME', ''];
    let recCursor = 0;
    chronological(clips).forEach((c, i) => {
        const srcIn = formatTimecode(c.clipStartSec, true, fps);
        const srcOut = formatTimecode(c.clipEndSec, true, fps);
        const recIn = formatTimecode(recCursor, true, fps);
        recCursor += c.durationSec;
        const recOut = formatTimecode(recCursor, true, fps);
        lines.push(`${String(i + 1).padStart(3, '0')}  STREAM   V     C        ${srcIn} ${srcOut} ${recIn} ${recOut}`);
        lines.push(`* FROM CLIP NAME: ${c.title}`);
        lines.push(`* COMMENT: ${KIND_META[c.kind].label} — over ${c.over}`);
        lines.push('');
    });
    return lines.join('\n');
}
