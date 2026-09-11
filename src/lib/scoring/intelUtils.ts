import { D } from '@/lib/design-system';

export function getPhase(balls: number, overs: number): string {
    const ov = Math.floor(balls / 6) + 1;
    if (overs <= 10) return ov <= 3 ? 'POWERPLAY' : ov <= 7 ? 'MIDDLE' : 'DEATH';
    if (overs <= 20) return ov <= 6 ? 'POWERPLAY' : ov <= 15 ? 'MIDDLE' : 'DEATH';
    return ov <= 10 ? 'POWERPLAY' : ov <= 40 ? 'MIDDLE' : 'DEATH';
}

export function buildSignals(liveScore: any, overs: number, target: number | undefined, isChase: boolean) {
    if (!liveScore?.currentInnings) return null;
    const { runs = 0, wickets = 0, balls = 0 } = liveScore.currentInnings || {};
    const maxBalls = overs * 6;
    const rr = balls > 0 ? (runs / (balls / 6)) : 0;
    const reqRr = isChase && target && balls < maxBalls ? ((target - runs) / ((maxBalls - balls) / 6)) : null;
    const rrDelta = reqRr != null ? rr - reqRr : null;
    const projected = balls > 0 ? Math.round(runs / (balls / maxBalls)) : 0;

    const ballLog: any[] = liveScore.currentOver || [];
    const l6 = ballLog.slice(-6), l12 = ballLog.slice(-12);
    const ll6 = l6.filter((b: any) => b.extraType !== 'wide' && b.extraType !== 'noball');
    const ll12 = l12.filter((b: any) => b.extraType !== 'wide' && b.extraType !== 'noball');

    const dotsL6 = ll6.filter((b: any) => !b.runs && !b.isWicket).length;
    const dotsL12 = ll12.filter((b: any) => !b.runs && !b.isWicket).length;
    const bndsL6 = l6.filter((b: any) => b.runs === 4 || b.runs === 6).length;
    const bndsL12 = l12.filter((b: any) => b.runs === 4 || b.runs === 6).length;
    const wktsL12 = l12.filter((b: any) => b.isWicket).length;
    const runsL6 = l6.reduce((s: number, b: any) => s + (b.runs || 0), 0);

    const lastBndIdx = [...ballLog].reverse().findIndex((b: any) => b.runs === 4 || b.runs === 6);
    const bndDrought = lastBndIdx === -1 ? balls : lastBndIdx;

    let pressure = 30;
    if (dotsL6 >= 4) pressure += 18;
    if (dotsL12 >= 8) pressure += 10;
    if (wktsL12 >= 2) pressure += 22;
    if (wktsL12 >= 3) pressure += 12;
    if (bndDrought >= 18) pressure += 10;
    if (reqRr != null && reqRr - rr > 2) pressure += 15;
    if (reqRr != null && reqRr - rr > 4) pressure += 10;
    pressure = Math.min(100, Math.max(0, pressure));

    const pLbl = pressure < 26 ? 'LOW' : pressure < 51 ? 'MED' : pressure < 76 ? 'HIGH' : 'EXTREME';
    const pCol = pressure < 26 ? D.emerald : pressure < 51 ? D.amber : pressure < 76 ? D.orange : D.rose;

    let mom = 0;
    const recentRR = ll12.length > 0 ? (runsL6 / (ll12.length / 6)) : 0;
    mom += (recentRR - rr) * 10;
    mom -= wktsL12 * 18;
    mom += bndsL12 * 8;
    mom = Math.min(100, Math.max(-100, mom));
    const mLbl = mom > 20 ? 'BAT' : mom < -20 ? 'BOWL' : 'EVEN';
    const mCol = mom > 20 ? D.emerald : mom < -20 ? D.rose : D.amber;

    const phase = getPhase(balls, overs);
    const flags: string[] = [];
    if (isChase && reqRr && rrDelta && rrDelta > 0.5) flags.push('CHASE_ON_TRACK');
    if (isChase && reqRr && rrDelta && rrDelta < -1 && maxBalls - balls > 18) flags.push('CHASE_BEHIND');
    if (wktsL12 >= 2) flags.push('COLLAPSE_RISK');
    if (runsL6 >= 12 || bndsL6 >= 2) flags.push('BOWLER_UNDER_PUMP');
    if (bndDrought >= 18) flags.push('BOUNDARY_DROUGHT');
    if (phase === 'DEATH') flags.push('DEATH_OVERS');

    return {
        rr: +rr.toFixed(2), reqRr: reqRr ? +reqRr.toFixed(2) : null, rrDelta: rrDelta ? +rrDelta.toFixed(2) : null,
        projected, dotsL6, dotsL12, bndsL6, bndsL12, wktsL12, runsL6, bndDrought,
        pressure, pressureLabel: pLbl, pressureColor: pCol, mom: +mom.toFixed(0), momLabel: mLbl, momColor: mCol,
        phase, flags, runs, wickets, balls, overs, maxBalls, isChase, target
    };
}

export function buildNarratives(sig: any): { type: string; pri: number; hl: string; chips: { l: string; v: any; c?: string }[]; accent: string; icon: string }[] {
    if (!sig) return [];
    const n: any[] = [];
    const push = (type: string, pri: number, hl: string, chips: any[], accent: string, icon: string) => n.push({ type, pri, hl, chips, accent, icon });

    if (sig.isChase && sig.reqRr != null) {
        const need = (sig.target || 0) - sig.runs;
        const ballsLeft = sig.maxBalls - sig.balls;
        if (sig.rrDelta < -1) push('CHASE_BEHIND', 83, `Need ${need} off ${ballsLeft} balls`,
            [{ l: 'RRR', v: sig.reqRr, c: D.rose }, { l: 'CRR', v: sig.rr }, { l: 'Behind', v: '+' + Math.abs(sig.rrDelta).toFixed(1), c: D.rose }], D.rose, '🎯');
        else push('CHASE_ON_TRACK', 66, `${need} from ${ballsLeft} — on track`,
            [{ l: 'RRR', v: sig.reqRr, c: D.emerald }, { l: 'CRR', v: sig.rr, c: D.emerald }], D.emerald, '✅');
    }

    if (sig.pressure >= 75) push('PRESSURE', 80, sig.pressureLabel === 'EXTREME' ? 'Under extreme pressure' : 'Batting under pressure',
        [{ l: 'Dots/6', v: sig.dotsL6, c: sig.pressureColor }, { l: 'Score', v: sig.pressure + '%', c: sig.pressureColor }], sig.pressureColor, '🔥');

    if (Math.abs(sig.mom) > 40) push('MOMENTUM', 70, sig.momLabel === 'BAT' ? 'Bat dominating' : 'Bowlers wrestling back',
        [{ l: 'Last 6', v: sig.runsL6 + 'r' }, { l: 'Bnds/12', v: sig.bndsL12 }, { l: 'Wkts/12', v: sig.wktsL12 }], sig.momColor, sig.momLabel === 'BAT' ? '💥' : '⚡');

    if (sig.flags.includes('COLLAPSE_RISK')) push('COLLAPSE', 78, `${sig.wktsL12} wickets in last 12 balls`,
        [{ l: 'Wickets', v: sig.wktsL12, c: D.rose }], D.rose, '📉');

    if (sig.flags.includes('BOUNDARY_DROUGHT') && !sig.flags.includes('PRESSURE')) push('DROUGHT', 52,
        `Boundary drought — ${sig.bndDrought} balls`,
        [{ l: 'Drought', v: sig.bndDrought + 'b', c: D.amber }, { l: 'Dots/6', v: sig.dotsL6 }], D.amber, '🌵');

    if (!sig.isChase && sig.balls >= 24) push('PROJECTION', 38, `At this rate: ${sig.projected} projected`,
        [{ l: 'RR', v: sig.rr }, { l: 'Phase', v: sig.phase }], D.violet, '📊');

    push('RUN_RATE', 10, `Run rate: ${sig.rr} rpo`,
        [{ l: 'Runs', v: sig.runs }, { l: 'Overs', v: Math.floor(sig.balls / 6) + '.' + (sig.balls % 6) }, { l: 'Proj', v: sig.projected }], D.sky, '📈');

    return n.sort((a: any, b: any) => b.pri - a.pri);
}
