/**
 * SCRBRD — Automated Milestone & Accolades Detector
 * Evaluates live InningsState to detect landmark accomplishments:
 * - Batting: 50s, 100s, Blitz Half-Centuries, High Boundary Pct
 * - Bowling: 3-Wicket Hauls, 5-Wicket Hauls, Hat-Tricks, Maidens
 * - Team & Career: Landmark milestones (500 career runs, 50 career wickets)
 */

import { InningsState, BatterState, BowlerState, fmtOvers } from './matchEngine';

export interface MilestoneEvent {
    id: string;
    type: 'BATTING_50' | 'BATTING_100' | 'BLITZ_50' | 'BOWLING_3W' | 'BOWLING_5W' | 'HAT_TRICK' | 'MAIDEN' | 'CAREER_500_RUNS' | 'CAREER_50_Wkts';
    player: string;
    playerId: string;
    headline: string;
    details: string;
    timestamp: number;
    badge: string;
    color: string;
}

export function detectMilestones(state: InningsState): MilestoneEvent[] {
    const milestones: MilestoneEvent[] = [];
    const now = Date.now();

    // 1. Evaluate Batting Milestones
    for (const bat of state.batsmen) {
        if (!bat || bat.runs === 0) continue;

        // Century (100+ Runs)
        if (bat.runs >= 100) {
            milestones.push({
                id: `milestone-100-${bat.id}`,
                type: 'BATTING_100',
                player: bat.name,
                playerId: bat.id,
                headline: `CENTURY! 💯`,
                details: `${bat.name} reaches a monumental 100 off ${bat.balls} balls (${bat.fours}x4, ${bat.sixes}x6)!`,
                timestamp: now,
                badge: '💯 CENTURY',
                color: '#10b981', // emerald
            });
        }
        // Half-Century (50-99 Runs)
        else if (bat.runs >= 50) {
            const isBlitz = bat.balls > 0 && (bat.runs / bat.balls) * 100 >= 200;
            milestones.push({
                id: `milestone-50-${bat.id}`,
                type: isBlitz ? 'BLITZ_50' : 'BATTING_50',
                player: bat.name,
                playerId: bat.id,
                headline: isBlitz ? `⚡ BLITZ FIFTY!` : `FIFTY! 🏏`,
                details: `${bat.name} scores 50 runs off ${bat.balls} balls (SR ${(bat.runs / bat.balls * 100).toFixed(1)})!`,
                timestamp: now,
                badge: isBlitz ? '⚡ BLITZ 50' : '🏏 FIFTY',
                color: isBlitz ? '#f59e0b' : '#38bdf8', // amber or sky
            });
        }
    }

    // 2. Evaluate Bowling Milestones
    for (const bow of state.bowlers) {
        if (!bow) continue;

        // 5-Wicket Haul
        if (bow.wickets >= 5) {
            milestones.push({
                id: `milestone-5w-${bow.id}`,
                type: 'BOWLING_5W',
                player: bow.name,
                playerId: bow.id,
                headline: `FIVE-WICKET HAUL! 🔥`,
                details: `${bow.name} claims a brilliant 5-wicket haul (${bow.wickets}/${bow.runs} in ${fmtOvers(bow.balls)} overs)!`,
                timestamp: now,
                badge: '🔥 5-FER',
                color: '#f43f5e', // rose
            });
        }
        // 3-Wicket Haul
        else if (bow.wickets >= 3) {
            milestones.push({
                id: `milestone-3w-${bow.id}`,
                type: 'BOWLING_3W',
                player: bow.name,
                playerId: bow.id,
                headline: `3-WICKET SPELL! 🎯`,
                details: `${bow.name} takes 3 wickets (${bow.wickets}/${bow.runs}) to put bowling team in control.`,
                timestamp: now,
                badge: '🎯 3-FER',
                color: '#8b5cf6', // violet
            });
        }

        // Maidens
        if (bow.maidens > 0) {
            milestones.push({
                id: `milestone-maiden-${bow.id}-${bow.maidens}`,
                type: 'MAIDEN',
                player: bow.name,
                playerId: bow.id,
                headline: `MAIDEN OVER! 🔒`,
                details: `${bow.name} completes ${bow.maidens} maiden over${bow.maidens > 1 ? 's' : ''} of tight pressure.`,
                timestamp: now,
                badge: '🔒 MAIDEN',
                color: '#64748b', // slate
            });
        }
    }

    // 3. Evaluate Hat-Trick Patterns from ballLog
    if (state.ballLog && state.ballLog.length >= 3) {
        let consecutiveWickets = 0;
        let hatTrickBowler: string | null = null;

        for (let i = state.ballLog.length - 1; i >= Math.max(0, state.ballLog.length - 6); i--) {
            const b = state.ballLog[i];
            if (b.type === 'W' && b.dismissal !== 'run out') {
                consecutiveWickets += 1;
                hatTrickBowler = b.bowlerId ?? b.bowler;
                if (consecutiveWickets === 3) {
                    const bowlerName = state.bowlers.find(x => x.id === hatTrickBowler)?.name ?? 'Bowler';
                    milestones.push({
                        id: `milestone-hattrick-${hatTrickBowler}-${i}`,
                        type: 'HAT_TRICK',
                        player: bowlerName,
                        playerId: hatTrickBowler ?? 'unknown',
                        headline: `HAT-TRICK! 🎩✨`,
                        details: `${bowlerName} takes 3 wickets in 3 consecutive deliveries! Incredible execution!`,
                        timestamp: now,
                        badge: '🎩 HAT-TRICK',
                        color: '#ec4899', // pink
                    });
                    break;
                }
            } else if (b.type !== 'Wd' && b.type !== 'Nb') {
                consecutiveWickets = 0;
            }
        }
    }

    return milestones;
}
