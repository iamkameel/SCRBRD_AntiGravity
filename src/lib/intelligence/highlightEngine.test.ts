import { describe, it, expect } from 'vitest';
import {
    detectHighlightsForBall,
    buildHighlightReel,
    buildClipWindow,
    toStreamOffset,
    resyncClips,
    formatTimecode,
    exportYouTubeChapters,
    exportEdl,
    exportCsvMarkers,
    createManualClip,
    KIND_META,
    type StreamSync,
} from './highlightEngine';
import type { LiveBallEvent, LiveMatchState } from '@/services/liveMatchSync';

const STREAM_START = '2026-09-12T08:00:00.000Z';
const sync: StreamSync = { streamStartIso: STREAM_START, scorerLagSec: 4 };
const unsynced: StreamSync = { streamStartIso: null, scorerLagSec: 0 };

function state(over: Partial<LiveMatchState> = {}): LiveMatchState {
    return {
        fixtureId: 'fix-1',
        homeTeamName: 'Home', awayTeamName: 'Away',
        battingTeamName: 'Home', bowlingTeamName: 'Away',
        totalRuns: 100, wickets: 2, oversCompleted: 20, ballsInOver: 3,
        currentRunRate: 5,
        striker: { name: 'A. Smith', runs: 46, ballsFacing: 40, fours: 5, sixes: 1 },
        nonStriker: { name: 'L. Davies', runs: 20, ballsFacing: 30, fours: 2, sixes: 0 },
        currentBowler: { name: 'B. Hendricks', overs: 6, maidens: 0, runsConceded: 30, wicketsTaken: 4 },
        recentBalls: [],
        wormData: [],
        matchStatus: 'LIVE', statusMessage: '',
        connectionStatus: 'CONNECTED',
        ...over,
    };
}

function ball(over: Partial<LiveBallEvent> = {}): LiveBallEvent {
    return {
        id: `b-${Math.random()}`, overNumber: 20, ballNumber: 4,
        strikerName: 'A. Smith', bowlerName: 'B. Hendricks',
        runsOffBat: 0, extraRuns: 0, totalRuns: 0, isWicket: false,
        commentary: '', timestamp: '2026-09-12T08:10:00.000Z',
        ...over,
    };
}

describe('toStreamOffset / buildClipWindow', () => {
    it('maps wall-clock to stream seconds minus scorer lag', () => {
        expect(toStreamOffset('2026-09-12T08:10:00.000Z', sync)).toBe(600 - 4);
        expect(toStreamOffset('2026-09-12T08:10:00.000Z', unsynced)).toBeNull();
    });

    it('never produces a negative clip start', () => {
        const w = buildClipWindow(3, 'WICKET');
        expect(w.clipStartSec).toBe(0);
        expect(w.clipEndSec).toBe(3 + KIND_META.WICKET.postRollSec);
    });

    it('carries the duration but no window when unsynced', () => {
        const w = buildClipWindow(null, 'SIX');
        expect(w.clipStartSec).toBeNull();
        expect(w.durationSec).toBe(KIND_META.SIX.preRollSec + KIND_META.SIX.postRollSec);
    });
});

describe('detectHighlightsForBall', () => {
    it('returns nothing for a dot ball', () => {
        expect(detectHighlightsForBall(ball(), state(), state(), sync)).toEqual([]);
    });

    it('detects a six and a fifty on the same ball', () => {
        const before = state();
        const after = state({ striker: { ...before.striker, runs: 52, ballsFacing: 41 } });
        const kinds = detectHighlightsForBall(ball({ runsOffBat: 6, totalRuns: 6 }), before, after, sync).map(c => c.kind);
        expect(kinds).toEqual(['SIX', 'FIFTY']);
    });

    it('detects a wicket and a five-for together', () => {
        const before = state(); // bowler on 4
        const after = state({ wickets: 3, currentBowler: { ...before.currentBowler, wicketsTaken: 5 } });
        const clips = detectHighlightsForBall(ball({ isWicket: true, wicketType: 'Bowled' }), before, after, sync);
        expect(clips.map(c => c.kind)).toEqual(['WICKET', 'FIVE_FOR']);
        expect(clips[0].players).toContain('B. Hendricks');
        expect(clips[0].streamOffsetSec).toBe(596);
    });

    it('promotes a third consecutive wicket to a hat-trick', () => {
        const prior = [
            ball({ id: 'w2', isWicket: true, ballNumber: 3 }),
            ball({ id: 'w1', isWicket: true, ballNumber: 2 }),
        ];
        const before = state({ recentBalls: prior });
        const after = state({ recentBalls: prior, wickets: 5 });
        const kinds = detectHighlightsForBall(ball({ isWicket: true }), before, after, sync).map(c => c.kind);
        expect(kinds).toContain('HAT_TRICK');
        expect(kinds).not.toContain('WICKET');
    });

    it('does not count a wide between wickets as breaking a hat-trick, but requires two legal wickets', () => {
        const prior = [
            ball({ id: 'wd', extraType: 'wide', extraRuns: 1, totalRuns: 1, ballNumber: 3 }),
            ball({ id: 'w2', isWicket: true, ballNumber: 3 }),
            ball({ id: 'w1', isWicket: true, ballNumber: 2 }),
        ];
        const kinds = detectHighlightsForBall(ball({ isWicket: true }), state({ recentBalls: prior }), state({ recentBalls: prior }), sync).map(c => c.kind);
        expect(kinds).toContain('HAT_TRICK');
    });

    it('detects a maiden on the sixth legal dot ball', () => {
        const dots = [5, 4, 3, 2, 1].map(n => ball({ id: `d${n}`, ballNumber: n, overNumber: 21 }));
        const before = state({ recentBalls: dots });
        const kinds = detectHighlightsForBall(ball({ overNumber: 21, ballNumber: 6 }), before, before, sync).map(c => c.kind);
        expect(kinds).toEqual(['MAIDEN']);
    });

    it('flags innings close on the tenth wicket', () => {
        const after = state({ wickets: 10 });
        const kinds = detectHighlightsForBall(ball({ isWicket: true }), state({ wickets: 9 }), after, sync).map(c => c.kind);
        expect(kinds).toContain('INNINGS_CLOSE');
    });
});

describe('buildHighlightReel', () => {
    it('fills the budget by priority then keeps chronological order', () => {
        const mk = (kind: 'FOUR' | 'WICKET' | 'SIX', at: string) =>
            detectHighlightsForBall(
                ball({ runsOffBat: kind === 'FOUR' ? 4 : kind === 'SIX' ? 6 : 0, isWicket: kind === 'WICKET', timestamp: at }),
                state(), state({ wickets: 3 }), sync,
            )[0];
        const clips = [
            mk('FOUR', '2026-09-12T08:05:00Z'),   // 11s, p3
            mk('WICKET', '2026-09-12T08:20:00Z'), // 18s, p1
            mk('SIX', '2026-09-12T08:10:00Z'),    // 14s, p2
            mk('FOUR', '2026-09-12T08:30:00Z'),   // 11s, p3
        ];
        const { reel, totalSec } = buildHighlightReel(clips, 40);
        expect(reel.map(c => c.kind)).toEqual(['SIX', 'WICKET']); // 32s; next FOUR would exceed 40
        expect(totalSec).toBe(32);
        expect(reel[0].streamOffsetSec!).toBeLessThan(reel[1].streamOffsetSec!);
    });

    it('excludes discarded and unsynced clips', () => {
        const c = detectHighlightsForBall(ball({ runsOffBat: 4 }), state(), state(), sync)[0];
        const u = detectHighlightsForBall(ball({ runsOffBat: 4 }), state(), state(), unsynced)[0];
        expect(buildHighlightReel([{ ...c, status: 'DISCARDED' }, u], 600).reel).toHaveLength(0);
    });
});

describe('resync + exports', () => {
    const clips = [
        ...detectHighlightsForBall(ball({ runsOffBat: 4, timestamp: '2026-09-12T08:05:00Z' }), state({ striker: { name: 'A. Smith', runs: 10, ballsFacing: 12, fours: 1, sixes: 0 } }), state(), unsynced),
        ...detectHighlightsForBall(ball({ isWicket: true, timestamp: '2026-09-12T09:05:30Z' }), state(), state({ wickets: 3 }), unsynced),
    ];

    it('resyncClips fills offsets once a stream start is known', () => {
        expect(clips.every(c => c.streamOffsetSec === null)).toBe(true);
        const synced = resyncClips(clips, sync);
        expect(synced.map(c => c.streamOffsetSec)).toEqual([296, 3926]);
    });

    it('formats timecodes with and without frames', () => {
        expect(formatTimecode(3926)).toBe('01:05:26');
        expect(formatTimecode(3926.5, true, 25)).toBe('01:05:26:13');
        expect(formatTimecode(null)).toBe('--:--:--');
    });

    it('YouTube chapters start at 00:00 and use m:ss / h:mm:ss', () => {
        const out = exportYouTubeChapters(resyncClips(clips, sync), 'Toss');
        const lines = out.split('\n');
        expect(lines[0]).toBe('00:00 Toss');
        expect(lines[1]).toMatch(/^4:56 /);
        expect(lines[2]).toMatch(/^1:05:26 /);
    });

    it('EDL record timecodes are contiguous', () => {
        const edl = exportEdl(resyncClips(clips, sync), 'Test reel');
        const entries = edl.split('\n').filter(l => /^\d{3} /.test(l));
        expect(entries).toHaveLength(2);
        const recOut1 = entries[0].trim().split(/\s+/).at(-1);
        const recIn2 = entries[1].trim().split(/\s+/).at(-2);
        expect(recIn2).toBe(recOut1);
    });

    it('CSV escapes quotes and has one row per clip', () => {
        const withQuote = resyncClips(clips, sync).map(c => ({ ...c, title: 'He said "gone"' }));
        const csv = exportCsvMarkers(withQuote);
        expect(csv.split('\n')).toHaveLength(3);
        expect(csv).toContain('"He said ""gone"""');
    });

    it('manual clips stamp the current over and striker', () => {
        const c = createManualClip('fix-1', 'Diving catch', sync, state());
        expect(c.source).toBe('MANUAL');
        expect(c.over).toBe('20.3');
        expect(c.players).toEqual(['A. Smith', 'B. Hendricks']);
    });
});
