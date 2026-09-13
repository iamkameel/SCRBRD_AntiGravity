/**
 * SCRBRD — Deterministic Replay & Match Engine.
 * Ported & adapted from SCRBRD_OS/packages/scoring/src/events.mjs & replay.mjs
 *
 * Core Principle:
 * All scoring outputs derive from a pure fold over the event log (`deriveInnings`).
 * Nothing mutates or stores "the score" directly.
 * Undo appends a `VOID` event pointing to the target event ID.
 */

export const KIND = {
    INNINGS_START: "innings_start",
    BATTERS: "batters",
    BOWLER: "bowler",
    BALL: "ball",
    PENALTY: "penalty",
    RETIRE: "retire",
    INNINGS_END: "innings_end",
    VOID: "void",
} as const;

export type EventKind = typeof KIND[keyof typeof KIND];

export const BALL_TYPE = {
    RUN: "run",
    WICKET: "W",
    WIDE: "Wd",
    NO_BALL: "Nb",
    BYE: "B",
    LEG_BYE: "LB",
} as const;

export type BallType = typeof BALL_TYPE[keyof typeof BALL_TYPE];

export const ILLEGAL = new Set<string>([BALL_TYPE.WIDE, BALL_TYPE.NO_BALL]);
export const isLegal = (type: string): boolean => !ILLEGAL.has(type);

export interface MatchEvent {
    id?: string;
    kind: EventKind;
    innings: number;
    clientTs?: number;
    seq?: number;
    [key: string]: any;
}

export interface BatterState {
    id: string;
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    status: "batting" | "out" | "retired";
    dismissal: string | null;
}

export interface BowlerState {
    id: string;
    name: string;
    runs: number;
    balls: number;
    wickets: number;
    wides: number;
    noBalls: number;
    maidens: number;
}

export interface InningsState {
    battingTeam: string | null;
    bowlingTeam: string | null;
    teamKey: string | null;
    bowlingTeamKey: string | null;
    teamFlag: string;
    squad: any[];
    bowlingSquad: any[];
    twelfthMan: string | null;
    overs: number;
    target: number | null;
    runs: number;
    wickets: number;
    balls: number;
    extras: {
        wide: number;
        noBall: number;
        bye: number;
        legBye: number;
        penalty: number;
    };
    batsmen: BatterState[];
    bowlers: BowlerState[];
    fow: Array<{ runs: number; wickets: number; batsman: string; overs: string }>;
    partnerships: Array<{ bat1: string; bat2: string; runs: number; balls: number; wicket: number }>;
    curPartner: { runs: number; balls: number; bat1: string | null; bat2: string | null };
    ballLog: any[];
    overLog: Array<{ over: number; balls: any[] }>;
    striker: string | null;
    nonStriker: string | null;
    bowler: string | null;
    complete: boolean;
    endReason: string | null;
    freeHit: boolean;
    voided: number;
}

export const fmtOvers = (balls: number): string => `${Math.floor(balls / 6)}.${balls % 6}`;

let _monotonic = 0;
export function newEventId(deviceId: string, matchId: string): string {
    _monotonic += 1;
    return `${deviceId}:${matchId}:${Date.now().toString(36)}:${_monotonic.toString(36)}`;
}

/**
 * Pure deterministic fold over an event log.
 */
export function deriveInnings(events: MatchEvent[] = [], ctx: { flagFor?: (key: string) => string } = {}): InningsState {
    const inn: InningsState = {
        battingTeam: null,
        bowlingTeam: null,
        teamKey: null,
        bowlingTeamKey: null,
        teamFlag: "🏏",
        squad: [],
        bowlingSquad: [],
        twelfthMan: null,
        overs: 20,
        target: null,
        runs: 0,
        wickets: 0,
        balls: 0,
        extras: { wide: 0, noBall: 0, bye: 0, legBye: 0, penalty: 0 },
        batsmen: [],
        bowlers: [],
        fow: [],
        partnerships: [],
        curPartner: { runs: 0, balls: 0, bat1: null, bat2: null },
        ballLog: [],
        overLog: [],
        striker: null,
        nonStriker: null,
        bowler: null,
        complete: false,
        endReason: null,
        freeHit: false,
        voided: 0,
    };

    const nameOf = (id: string | null): string => {
        if (id == null) return "?";
        const all = [...(inn.squad || []), ...(inn.bowlingSquad || [])];
        const hit = all.find((p) => (p?.id ?? p?.personId ?? p) === id);
        return (hit?.displayName ?? hit?.name ?? `${hit?.firstName ?? ''} ${hit?.lastName ?? ''}`.trim()) || String(id);
    };

    const batterFor = (id: string | null): BatterState | null => {
        if (id == null) return null;
        let b = inn.batsmen.find((x) => x.id === id);
        if (!b) {
            b = { id, name: nameOf(id), runs: 0, balls: 0, fours: 0, sixes: 0, status: "batting", dismissal: null };
            inn.batsmen.push(b);
        }
        return b;
    };

    const bowlerFor = (id: string | null): BowlerState | null => {
        if (id == null) return null;
        let b = inn.bowlers.find((x) => x.id === id);
        if (!b) {
            b = { id, name: nameOf(id), runs: 0, balls: 0, wickets: 0, wides: 0, noBalls: 0, maidens: 0 };
            inn.bowlers.push(b);
        }
        return b;
    };

    const rotate = () => {
        const s = inn.striker;
        inn.striker = inn.nonStriker;
        inn.nonStriker = s;
    };

    let partnerStartRuns = 0;
    const openPartnership = () => {
        partnerStartRuns = inn.runs;
        inn.curPartner = { runs: 0, balls: 0, bat1: inn.striker, bat2: inn.nonStriker };
    };

    const closePartnership = () => {
        const cp = inn.curPartner;
        if (cp && (cp.runs > 0 || cp.balls > 0)) {
            inn.partnerships.push({
                bat1: nameOf(cp.bat1),
                bat2: nameOf(cp.bat2),
                runs: cp.runs,
                balls: cp.balls,
                wicket: inn.wickets,
            });
        }
    };

    const logBall = (ev: MatchEvent, at: number) => {
        const entry = {
            ...ev,
            strikerId: inn.striker,
            bowlerId: inn.bowler,
            over: Math.floor(at / 6),
            ballInOver: at % 6,
        };
        inn.ballLog.push(entry);
        const last = inn.overLog[inn.overLog.length - 1];
        if (!last || last.over !== entry.over) inn.overLog.push({ over: entry.over, balls: [entry] });
        else last.balls.push(entry);
        return entry;
    };

    // Pre-pass to identify voided events
    const voided = new Set<string>();
    for (const ev of events) {
        if (ev.kind === KIND.VOID && ev.target != null) voided.add(ev.target);
    }
    inn.voided = voided.size;

    for (const ev of events) {
        if (ev.kind === KIND.VOID) continue;
        if (ev.id != null && voided.has(ev.id)) continue;

        switch (ev.kind) {
            case KIND.INNINGS_START:
                Object.assign(inn, {
                    battingTeam: ev.battingTeam,
                    bowlingTeam: ev.bowlingTeam,
                    teamKey: ev.teamKey ?? ev.battingTeam,
                    bowlingTeamKey: ev.bowlingTeamKey ?? ev.bowlingTeam,
                    squad: ev.squad ?? [],
                    bowlingSquad: ev.bowlingSquad ?? [],
                    twelfthMan: ev.twelfthMan ?? null,
                    overs: ev.overs ?? 20,
                    target: ev.target ?? null,
                });
                if (ctx.flagFor && inn.teamKey) inn.teamFlag = ctx.flagFor(inn.teamKey) ?? "🏏";
                break;

            case KIND.BATTERS:
                const hadPair = inn.striker != null && inn.nonStriker != null;
                if (ev.striker != null) { batterFor(ev.striker); inn.striker = ev.striker; }
                if (ev.nonStriker != null) { batterFor(ev.nonStriker); inn.nonStriker = ev.nonStriker; }
                if (!hadPair || ev.striker != null || ev.nonStriker != null) openPartnership();
                break;

            case KIND.BOWLER:
                bowlerFor(ev.bowler);
                inn.bowler = ev.bowler;
                break;

            case KIND.PENALTY:
                if (ev.toBattingTeam !== false) {
                    inn.runs += ev.runs ?? 5;
                    inn.extras.penalty += ev.runs ?? 5;
                }
                break;

            case KIND.RETIRE:
                const b = batterFor(ev.batter);
                if (b) { b.status = "retired"; b.dismissal = `retired ${ev.reason ?? "hurt"}`; }
                closePartnership();
                if (inn.striker === ev.batter) inn.striker = null;
                if (inn.nonStriker === ev.batter) inn.nonStriker = null;
                break;

            case KIND.INNINGS_END:
                inn.complete = true;
                inn.endReason = ev.reason ?? null;
                break;

            case KIND.BALL: {
                const type = ev.type ?? BALL_TYPE.RUN;
                const v = ev.value ?? 0;
                const legal = isLegal(type);
                const bat = batterFor(inn.striker);
                const bow = bowlerFor(inn.bowler);
                const wasFreeHit = inn.freeHit;
                const at = inn.balls;

                const penaltyRun = legal ? 0 : 1;
                let bowlerCharged = 0;

                switch (type) {
                    case BALL_TYPE.WIDE:
                        inn.runs += penaltyRun + v;
                        inn.extras.wide += penaltyRun + v;
                        bowlerCharged = penaltyRun + v;
                        if (bow) bow.wides += 1;
                        break;

                    case BALL_TYPE.NO_BALL:
                        inn.runs += penaltyRun + v;
                        inn.extras.noBall += penaltyRun;
                        bowlerCharged = penaltyRun + v;
                        if (bow) bow.noBalls += 1;
                        if (bat) {
                            bat.balls += 1; bat.runs += v;
                            if (v === 4) bat.fours += 1;
                            if (v === 6) bat.sixes += 1;
                        }
                        break;

                    case BALL_TYPE.BYE:
                        inn.runs += v; inn.extras.bye += v;
                        if (bat) bat.balls += 1;
                        break;

                    case BALL_TYPE.LEG_BYE:
                        inn.runs += v; inn.extras.legBye += v;
                        if (bat) bat.balls += 1;
                        break;

                    case BALL_TYPE.WICKET:
                        inn.runs += v; bowlerCharged = v;
                        if (bat) { bat.balls += 1; bat.runs += v; }
                        break;

                    default:
                        inn.runs += v; bowlerCharged = v;
                        if (bat) {
                            bat.balls += 1; bat.runs += v;
                            if (v === 4) bat.fours += 1;
                            if (v === 6) bat.sixes += 1;
                        }
                        break;
                }

                if (legal) inn.balls += 1;
                if (bow) { bow.runs += bowlerCharged; if (legal) bow.balls += 1; }

                if (inn.curPartner) {
                    inn.curPartner.runs = inn.runs - partnerStartRuns;
                    if (legal) inn.curPartner.balls += 1;
                }

                const entry = logBall(ev, at);

                if (type === BALL_TYPE.WICKET) {
                    const runOut = /run ?out/i.test(ev.dismissal ?? "");
                    if (!wasFreeHit || runOut) {
                        const outId = ev.dismissed ?? inn.striker;
                        const outBat = batterFor(outId);
                        inn.wickets += 1;
                        if (outBat) {
                            outBat.status = "out";
                            outBat.dismissal = describeDismissal(ev, nameOf(inn.bowler));
                        }
                        if (bow && chargedToBowler(ev.dismissal)) bow.wickets += 1;
                        inn.fow.push({
                            runs: inn.runs, wickets: inn.wickets,
                            batsman: outBat?.name ?? "?", overs: fmtOvers(inn.balls),
                        });
                        closePartnership();
                        if (inn.striker === outId) inn.striker = null; else inn.nonStriker = null;
                        inn.curPartner = { runs: 0, balls: 0, bat1: inn.striker, bat2: inn.nonStriker };
                        partnerStartRuns = inn.runs;
                    } else {
                        (entry as any).freeHitSaved = true;
                    }
                }

                if (type !== BALL_TYPE.WICKET && v % 2 === 1) rotate();
                if (legal && inn.balls % 6 === 0) { rotate(); inn.bowler = null; }

                inn.freeHit = type === BALL_TYPE.NO_BALL ? true : (legal ? false : inn.freeHit);
                break;
            }
        }
    }

    // Calculate Maidens
    for (const bow of inn.bowlers) {
        bow.maidens = 0;
    }
    for (const over of inn.overLog) {
        const legalCount = over.balls.filter((b) => isLegal(b.type ?? BALL_TYPE.RUN)).length;
        if (legalCount < 6) continue;
        const bowlerId = over.balls[0]?.bowlerId ?? over.balls[0]?.bowler ?? null;
        const charged = over.balls.reduce((sum, b) => {
            const t = b.type ?? BALL_TYPE.RUN;
            if (t === BALL_TYPE.BYE || t === BALL_TYPE.LEG_BYE) return sum;
            return sum + (isLegal(t) ? 0 : 1) + (b.value ?? 0);
        }, 0);
        if (charged === 0) {
            const bow = inn.bowlers.find((x) => x.id === bowlerId);
            if (bow) bow.maidens += 1;
        }
    }

    return inn;
}

const UNCREDITED = /run ?out|retired|obstruct|handled|timed ?out/i;
export const chargedToBowler = (mode?: string | null): boolean => !UNCREDITED.test(mode ?? "");

export function describeDismissal(ev: MatchEvent, bowlerName?: string | null): string {
    const mode = ev.dismissal ?? "out";
    const f = ev.fielder ? ` ${ev.fielder}` : "";
    if (/run ?out/i.test(mode)) return `run out${f ? ` (${ev.fielder})` : ""}`;
    if (/stumped|^st\b/i.test(mode)) return `st${f} b ${bowlerName ?? "?"}`;
    if (/caught|^c\b/i.test(mode)) return `c${f || " ?"} b ${bowlerName ?? "?"}`;
    if (/bowled|^b\b/i.test(mode)) return `b ${bowlerName ?? "?"}`;
    if (/lbw/i.test(mode)) return `lbw b ${bowlerName ?? "?"}`;
    return bowlerName ? `${mode} b ${bowlerName}` : mode;
}

