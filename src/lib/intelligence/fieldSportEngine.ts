/**
 * SCRBRD Field & Court Sport Match Engine
 * =======================================
 * One event-sourced match model for rugby, hockey, netball, soccer and
 * basketball. A ruleset per sport supplies periods, scoring values, card /
 * suspension rules and squad sizes; everything else (clock, scoreline,
 * suspensions, fouls, summaries, league points) is derived from the event log.
 *
 * Pure — no I/O. Persistence lives in fieldSportService, UI in FieldSportConsole.
 */

export type FieldSport = 'RUGBY' | 'HOCKEY' | 'NETBALL' | 'SOCCER' | 'BASKETBALL';
export type Side = 'home' | 'away';

export interface ScoreType { code: string; label: string; points: number; }
export interface CardType {
    code: string;
    label: string;
    /** Seconds off the field; null = for the rest of the match; 0 = caution only. */
    suspensionSec: number | null;
    tone: 'green' | 'yellow' | 'red' | 'grey';
    /** Counts toward the per-player foul limit (basketball). */
    countsAsFoul?: boolean;
}

export interface SportRuleset {
    sport: FieldSport;
    label: string;
    periods: number;
    periodSec: number;
    periodLabel: string;           // "Half", "Quarter"
    playersOnField: number;
    rollingSubs: boolean;
    maxSubs: number | null;        // null = unlimited
    scoreTypes: ScoreType[];
    cardTypes: CardType[];
    foulLimitPerPlayer?: number;   // basketball: 5
    league: { win: number; draw: number; loss: number };
}

export const RULESETS: Record<FieldSport, SportRuleset> = {
    RUGBY: {
        sport: 'RUGBY', label: 'Rugby Union', periods: 2, periodSec: 35 * 60, periodLabel: 'Half',
        playersOnField: 15, rollingSubs: false, maxSubs: 8,
        scoreTypes: [
            { code: 'TRY', label: 'Try', points: 5 },
            { code: 'CON', label: 'Conversion', points: 2 },
            { code: 'PEN', label: 'Penalty', points: 3 },
            { code: 'DG', label: 'Drop goal', points: 3 },
            { code: 'PT', label: 'Penalty try', points: 7 },
        ],
        cardTypes: [
            { code: 'YC', label: 'Yellow (sin-bin)', suspensionSec: 10 * 60, tone: 'yellow' },
            { code: 'RC', label: 'Red', suspensionSec: null, tone: 'red' },
        ],
        league: { win: 4, draw: 2, loss: 0 },
    },
    HOCKEY: {
        sport: 'HOCKEY', label: 'Field Hockey', periods: 4, periodSec: 15 * 60, periodLabel: 'Quarter',
        playersOnField: 11, rollingSubs: true, maxSubs: null,
        scoreTypes: [
            { code: 'FG', label: 'Field goal', points: 1 },
            { code: 'PC', label: 'Penalty corner goal', points: 1 },
            { code: 'PS', label: 'Penalty stroke', points: 1 },
        ],
        cardTypes: [
            { code: 'GC', label: 'Green', suspensionSec: 2 * 60, tone: 'green' },
            { code: 'YC', label: 'Yellow', suspensionSec: 5 * 60, tone: 'yellow' },
            { code: 'YC10', label: 'Yellow (10 min)', suspensionSec: 10 * 60, tone: 'yellow' },
            { code: 'RC', label: 'Red', suspensionSec: null, tone: 'red' },
        ],
        league: { win: 3, draw: 1, loss: 0 },
    },
    NETBALL: {
        sport: 'NETBALL', label: 'Netball', periods: 4, periodSec: 15 * 60, periodLabel: 'Quarter',
        playersOnField: 7, rollingSubs: true, maxSubs: null,
        scoreTypes: [
            { code: 'GOAL', label: 'Goal', points: 1 },
            { code: 'SUPER', label: 'Super shot', points: 2 },
        ],
        cardTypes: [
            { code: 'WARN', label: 'Warning', suspensionSec: 0, tone: 'grey' },
            { code: 'SUSP', label: 'Suspension', suspensionSec: 2 * 60, tone: 'yellow' },
            { code: 'OFF', label: 'Ordered off', suspensionSec: null, tone: 'red' },
        ],
        league: { win: 3, draw: 1, loss: 0 },
    },
    SOCCER: {
        sport: 'SOCCER', label: 'Soccer', periods: 2, periodSec: 35 * 60, periodLabel: 'Half',
        playersOnField: 11, rollingSubs: false, maxSubs: 5,
        scoreTypes: [
            { code: 'GOAL', label: 'Goal', points: 1 },
            { code: 'PEN', label: 'Penalty', points: 1 },
            { code: 'OG', label: 'Own goal (credited)', points: 1 },
        ],
        cardTypes: [
            { code: 'YC', label: 'Yellow', suspensionSec: 0, tone: 'yellow' },
            { code: 'RC', label: 'Red', suspensionSec: null, tone: 'red' },
        ],
        league: { win: 3, draw: 1, loss: 0 },
    },
    BASKETBALL: {
        sport: 'BASKETBALL', label: 'Basketball', periods: 4, periodSec: 8 * 60, periodLabel: 'Quarter',
        playersOnField: 5, rollingSubs: true, maxSubs: null,
        scoreTypes: [
            { code: 'FT', label: 'Free throw', points: 1 },
            { code: '2PT', label: 'Field goal', points: 2 },
            { code: '3PT', label: 'Three-pointer', points: 3 },
        ],
        cardTypes: [
            { code: 'PF', label: 'Personal foul', suspensionSec: 0, tone: 'grey', countsAsFoul: true },
            { code: 'TF', label: 'Technical foul', suspensionSec: 0, tone: 'yellow', countsAsFoul: true },
            { code: 'DQ', label: 'Disqualifying foul', suspensionSec: null, tone: 'red', countsAsFoul: true },
        ],
        foulLimitPerPlayer: 5,
        league: { win: 2, draw: 1, loss: 0 },
    },
};

export const FIELD_SPORTS = Object.keys(RULESETS) as FieldSport[];

// ─────────────────────────────────────────────────────────────────────────────
// Match model
// ─────────────────────────────────────────────────────────────────────────────

export type MatchEventType = 'SCORE' | 'CARD' | 'SUB' | 'PERIOD_START' | 'PERIOD_END' | 'CLOCK_START' | 'CLOCK_STOP' | 'NOTE';

export interface MatchEvent {
    id: string;
    type: MatchEventType;
    team?: Side;
    code?: string;            // score / card code
    playerId?: string;
    playerName?: string;
    onPlayerId?: string;      // SUB: player coming on
    onPlayerName?: string;
    period: number;
    matchSec: number;         // cumulative seconds of play at the event
    wallTime: string;         // ISO
    note?: string;
}

export interface TeamRef { teamId: string; name: string; color?: string; }

export interface FieldSportMatch {
    id: string;
    sport: FieldSport;
    ruleset: SportRuleset;    // embedded so a saved match is self-describing
    home: TeamRef;
    away: TeamRef;
    status: 'SCHEDULED' | 'LIVE' | 'BREAK' | 'FULL_TIME';
    period: number;           // 1-based; 0 before kick-off
    clock: {
        running: boolean;
        elapsedAtStart: number;     // seconds elapsed in the current period when the clock last started
        startedAtWall: number | null; // epoch ms
    };
    events: MatchEvent[];
    venue?: string;
    competition?: string;
    schoolId?: string;
    createdAt: string;
    updatedAt: string;
}

let seq = 0;
const nextId = (p: string) => `${p}-${Date.now().toString(36)}-${(++seq).toString(36)}`;

export function createMatch(
    sport: FieldSport,
    home: TeamRef,
    away: TeamRef,
    opts: { id?: string; venue?: string; competition?: string; schoolId?: string; now?: number } = {}
): FieldSportMatch {
    const now = new Date(opts.now ?? Date.now()).toISOString();
    return {
        id: opts.id ?? nextId('fsm'),
        sport,
        ruleset: RULESETS[sport],
        home, away,
        status: 'SCHEDULED',
        period: 0,
        clock: { running: false, elapsedAtStart: 0, startedAtWall: null },
        events: [],
        venue: opts.venue,
        competition: opts.competition,
        schoolId: opts.schoolId,
        createdAt: now,
        updatedAt: now,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Clock
// ─────────────────────────────────────────────────────────────────────────────

/** Seconds elapsed in the current period. */
export function periodElapsed(m: FieldSportMatch, nowMs = Date.now()): number {
    const { running, elapsedAtStart, startedAtWall } = m.clock;
    if (!running || startedAtWall === null) return elapsedAtStart;
    return elapsedAtStart + Math.max(0, Math.floor((nowMs - startedAtWall) / 1000));
}

/** Cumulative seconds of play across completed periods + current. */
export function matchElapsed(m: FieldSportMatch, nowMs = Date.now()): number {
    if (m.period === 0) return 0;
    return (m.period - 1) * m.ruleset.periodSec + periodElapsed(m, nowMs);
}

export function formatClock(sec: number): string {
    const s = Math.max(0, Math.floor(sec));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function withEvent(m: FieldSportMatch, ev: Omit<MatchEvent, 'id' | 'period' | 'matchSec' | 'wallTime'>, nowMs: number): FieldSportMatch {
    const full: MatchEvent = { id: nextId('ev'), period: m.period, matchSec: matchElapsed(m, nowMs), wallTime: new Date(nowMs).toISOString(), ...ev };
    return { ...m, events: [...m.events, full], updatedAt: full.wallTime };
}

export function startPeriod(m: FieldSportMatch, nowMs = Date.now()): FieldSportMatch {
    if (m.status === 'FULL_TIME') return m;
    if (m.status === 'LIVE') return m;
    const period = m.period + 1;
    if (period > m.ruleset.periods) return m;
    const next: FieldSportMatch = { ...m, period, status: 'LIVE', clock: { running: true, elapsedAtStart: 0, startedAtWall: nowMs } };
    return withEvent(next, { type: 'PERIOD_START', note: `${m.ruleset.periodLabel} ${period}` }, nowMs);
}

export function startClock(m: FieldSportMatch, nowMs = Date.now()): FieldSportMatch {
    if (m.status !== 'LIVE' || m.clock.running) return m;
    const next: FieldSportMatch = { ...m, clock: { ...m.clock, running: true, startedAtWall: nowMs } };
    return withEvent(next, { type: 'CLOCK_START' }, nowMs);
}

export function stopClock(m: FieldSportMatch, nowMs = Date.now()): FieldSportMatch {
    if (m.status !== 'LIVE' || !m.clock.running) return m;
    const elapsed = periodElapsed(m, nowMs);
    const next: FieldSportMatch = { ...m, clock: { running: false, elapsedAtStart: elapsed, startedAtWall: null } };
    return withEvent(next, { type: 'CLOCK_STOP' }, nowMs);
}

export function endPeriod(m: FieldSportMatch, nowMs = Date.now()): FieldSportMatch {
    if (m.status !== 'LIVE') return m;
    const stopped = m.clock.running ? stopClock(m, nowMs) : m;
    const isLast = stopped.period >= stopped.ruleset.periods;
    const next: FieldSportMatch = { ...stopped, status: isLast ? 'FULL_TIME' : 'BREAK' };
    return withEvent(next, { type: 'PERIOD_END', note: isLast ? 'Full time' : `End of ${m.ruleset.periodLabel.toLowerCase()} ${stopped.period}` }, nowMs);
}

// ─────────────────────────────────────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────────────────────────────────────

export function recordScore(m: FieldSportMatch, team: Side, code: string, player?: { id?: string; name?: string }, nowMs = Date.now()): FieldSportMatch {
    if (!m.ruleset.scoreTypes.some(s => s.code === code)) throw new Error(`Unknown score type "${code}" for ${m.sport}`);
    if (m.status !== 'LIVE') throw new Error('Match is not live');
    return withEvent(m, { type: 'SCORE', team, code, playerId: player?.id, playerName: player?.name }, nowMs);
}

export function recordCard(m: FieldSportMatch, team: Side, code: string, player: { id?: string; name: string }, nowMs = Date.now()): FieldSportMatch {
    if (!m.ruleset.cardTypes.some(c => c.code === code)) throw new Error(`Unknown card "${code}" for ${m.sport}`);
    if (m.status !== 'LIVE') throw new Error('Match is not live');
    return withEvent(m, { type: 'CARD', team, code, playerId: player.id, playerName: player.name }, nowMs);
}

export function recordSub(m: FieldSportMatch, team: Side, off: { id?: string; name: string }, on: { id?: string; name: string }, nowMs = Date.now()): FieldSportMatch {
    if (m.status === 'FULL_TIME' || m.status === 'SCHEDULED') throw new Error('Substitutions only during the match');
    const used = m.events.filter(e => e.type === 'SUB' && e.team === team).length;
    if (m.ruleset.maxSubs !== null && used >= m.ruleset.maxSubs) throw new Error(`${team} has used all ${m.ruleset.maxSubs} substitutions`);
    return withEvent(m, { type: 'SUB', team, playerId: off.id, playerName: off.name, onPlayerId: on.id, onPlayerName: on.name }, nowMs);
}

export function addNote(m: FieldSportMatch, note: string, nowMs = Date.now()): FieldSportMatch {
    return withEvent(m, { type: 'NOTE', note }, nowMs);
}

/** Remove the most recent score/card/sub/note (clock and period events are structural and stay). */
export function undoLastEvent(m: FieldSportMatch): FieldSportMatch {
    const idx = [...m.events].reverse().findIndex(e => ['SCORE', 'CARD', 'SUB', 'NOTE'].includes(e.type));
    if (idx < 0) return m;
    const real = m.events.length - 1 - idx;
    return { ...m, events: m.events.filter((_, i) => i !== real), updatedAt: new Date().toISOString() };
}

// ─────────────────────────────────────────────────────────────────────────────
// Derived state
// ─────────────────────────────────────────────────────────────────────────────

export interface Scoreline { home: number; away: number; breakdown: Record<Side, Record<string, number>>; }

export function deriveScore(m: FieldSportMatch, upToEventIndex = m.events.length): Scoreline {
    const pts = new Map(m.ruleset.scoreTypes.map(s => [s.code, s.points]));
    const out: Scoreline = { home: 0, away: 0, breakdown: { home: {}, away: {} } };
    m.events.slice(0, upToEventIndex).forEach(e => {
        if (e.type !== 'SCORE' || !e.team || !e.code) return;
        out[e.team] += pts.get(e.code) ?? 0;
        out.breakdown[e.team][e.code] = (out.breakdown[e.team][e.code] ?? 0) + 1;
    });
    return out;
}

export interface Suspension { team: Side; playerId?: string; playerName: string; code: string; label: string; endsAtMatchSec: number | null; remainingSec: number | null; }

/** Players currently off the field through a card. */
export function activeSuspensions(m: FieldSportMatch, nowMs = Date.now()): Suspension[] {
    const now = matchElapsed(m, nowMs);
    const cards = new Map(m.ruleset.cardTypes.map(c => [c.code, c]));
    const out: Suspension[] = [];
    for (const e of m.events) {
        if (e.type !== 'CARD' || !e.team || !e.code) continue;
        const card = cards.get(e.code);
        if (!card || card.suspensionSec === 0) continue;
        const endsAt = card.suspensionSec === null ? null : e.matchSec + card.suspensionSec;
        if (endsAt !== null && endsAt <= now) continue;
        out.push({ team: e.team, playerId: e.playerId, playerName: e.playerName ?? 'Unknown', code: e.code, label: card.label, endsAtMatchSec: endsAt, remainingSec: endsAt === null ? null : endsAt - now });
    }
    return out;
}

export interface FoulTally { team: Side; playerId?: string; playerName: string; fouls: number; fouledOut: boolean; }

/** Basketball-style per-player foul counts (any card with countsAsFoul). */
export function foulTallies(m: FieldSportMatch): FoulTally[] {
    const limit = m.ruleset.foulLimitPerPlayer;
    if (!limit) return [];
    const foulCodes = new Set(m.ruleset.cardTypes.filter(c => c.countsAsFoul).map(c => c.code));
    const map = new Map<string, FoulTally>();
    for (const e of m.events) {
        if (e.type !== 'CARD' || !e.team || !e.code || !foulCodes.has(e.code)) continue;
        const key = `${e.team}:${e.playerId ?? e.playerName}`;
        const t = map.get(key) ?? { team: e.team, playerId: e.playerId, playerName: e.playerName ?? 'Unknown', fouls: 0, fouledOut: false };
        t.fouls += 1;
        t.fouledOut = t.fouls >= limit || e.code === 'DQ';
        map.set(key, t);
    }
    return Array.from(map.values()).sort((a, b) => b.fouls - a.fouls);
}

export function playersOnField(m: FieldSportMatch, team: Side, nowMs = Date.now()): number {
    const off = activeSuspensions(m, nowMs).filter(s => s.team === team).length;
    return m.ruleset.playersOnField - off;
}

export interface MatchSummary {
    scoreline: Scoreline;
    result: 'HOME' | 'AWAY' | 'DRAW' | null;
    periodScores: Array<{ period: number; home: number; away: number }>;
    scorers: Array<{ team: Side; playerName: string; points: number; count: number; codes: string[] }>;
    cards: Array<{ team: Side; playerName: string; code: string; label: string; period: number; matchSec: number }>;
    subsUsed: Record<Side, number>;
    leaguePoints: Record<Side, number> | null;
}

export function summarize(m: FieldSportMatch): MatchSummary {
    const scoreline = deriveScore(m);
    const pts = new Map(m.ruleset.scoreTypes.map(s => [s.code, s.points]));
    const cardLabel = new Map(m.ruleset.cardTypes.map(c => [c.code, c.label]));

    const periodScores: MatchSummary['periodScores'] = [];
    for (let p = 1; p <= Math.max(m.period, 1); p++) {
        const inPeriod = m.events.filter(e => e.type === 'SCORE' && e.period === p);
        periodScores.push({
            period: p,
            home: inPeriod.filter(e => e.team === 'home').reduce((s, e) => s + (pts.get(e.code!) ?? 0), 0),
            away: inPeriod.filter(e => e.team === 'away').reduce((s, e) => s + (pts.get(e.code!) ?? 0), 0),
        });
    }

    const scorerMap = new Map<string, MatchSummary['scorers'][number]>();
    m.events.filter(e => e.type === 'SCORE' && e.team).forEach(e => {
        const name = e.playerName ?? 'Unattributed';
        const key = `${e.team}:${name}`;
        const s = scorerMap.get(key) ?? { team: e.team!, playerName: name, points: 0, count: 0, codes: [] };
        s.points += pts.get(e.code!) ?? 0;
        s.count += 1;
        s.codes.push(e.code!);
        scorerMap.set(key, s);
    });

    const cards = m.events.filter(e => e.type === 'CARD' && e.team).map(e => ({
        team: e.team!, playerName: e.playerName ?? 'Unknown', code: e.code!, label: cardLabel.get(e.code!) ?? e.code!, period: e.period, matchSec: e.matchSec,
    }));

    const result: MatchSummary['result'] = m.status !== 'FULL_TIME' ? null
        : scoreline.home > scoreline.away ? 'HOME' : scoreline.away > scoreline.home ? 'AWAY' : 'DRAW';

    const lp = m.ruleset.league;
    const leaguePoints = result === null ? null : {
        home: result === 'HOME' ? lp.win : result === 'DRAW' ? lp.draw : lp.loss,
        away: result === 'AWAY' ? lp.win : result === 'DRAW' ? lp.draw : lp.loss,
    };

    return {
        scoreline,
        result,
        periodScores,
        scorers: Array.from(scorerMap.values()).sort((a, b) => b.points - a.points),
        cards,
        subsUsed: {
            home: m.events.filter(e => e.type === 'SUB' && e.team === 'home').length,
            away: m.events.filter(e => e.type === 'SUB' && e.team === 'away').length,
        },
        leaguePoints,
    };
}

/** Human-readable line for the event log. */
export function describeEvent(m: FieldSportMatch, e: MatchEvent): string {
    const team = e.team ? (e.team === 'home' ? m.home.name : m.away.name) : '';
    switch (e.type) {
        case 'SCORE': {
            const st = m.ruleset.scoreTypes.find(s => s.code === e.code);
            return `${st?.label ?? e.code} — ${team}${e.playerName ? ` (${e.playerName})` : ''} +${st?.points ?? 0}`;
        }
        case 'CARD': {
            const ct = m.ruleset.cardTypes.find(c => c.code === e.code);
            return `${ct?.label ?? e.code} — ${e.playerName ?? 'Unknown'} (${team})`;
        }
        case 'SUB': return `Sub — ${team}: ${e.playerName} off, ${e.onPlayerName} on`;
        case 'PERIOD_START': return `${e.note} starts`;
        case 'PERIOD_END': return e.note ?? 'Period ends';
        case 'CLOCK_START': return 'Clock started';
        case 'CLOCK_STOP': return 'Clock stopped';
        case 'NOTE': return e.note ?? '';
    }
}
