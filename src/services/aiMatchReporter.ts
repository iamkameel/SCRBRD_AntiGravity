/**
 * SCRBRD — AI Match Reporter Service.
 * Ported & enhanced from scrbrd-beta-2/src/services/aiMatchReporter.ts
 *
 * Transforms match state telemetry into headmaster press releases,
 * multi-platform social media captions, and Player of the Match rationales.
 */

import { LiveMatchState } from "./liveMatchSync";

export interface MatchTelemetry {
    homeTeam: string;
    awayTeam: string;
    homeScore: string;
    awayScore: string;
    venue: string;
    date?: string;
    winner: string;
    winMargin: string;
    topBatters: Array<{ name: string; runs: number; balls: number; fours: number; sixes: number }>;
    topBowlers: Array<{ name: string; wickets: number; runs: number; overs: string }>;
    playerOfTheMatch: { name: string; performance: string; rationale?: string };
    turningPoint: string;
}

export interface GeneratedMatchReport {
    title: string;
    headmasterPressRelease: string;
    pressRelease: string;
    socialMediaCaptions: {
        instagram: string;
        twitter: string;
        facebook: string;
    };
    socialCaptions: {
        instagram: string;
        twitter: string;
        facebook: string;
    };
    keyTakeaways: string[];
    playerOfTheMatch: {
        name: string;
        performance: string;
        rationale: string;
    };
}

export class AIMatchReporterService {
    /**
     * Generates press release, social media captions, and match takeaways from match telemetry or LiveMatchState.
     */
    public generateReport(input: LiveMatchState | MatchTelemetry): GeneratedMatchReport {
        let telemetry: MatchTelemetry;

        if ('homeTeamName' in input) {
            // Input is LiveMatchState
            const live = input as LiveMatchState;
            const leadingBatter = live.striker.runs >= live.nonStriker.runs ? live.striker : live.nonStriker;
            telemetry = {
                homeTeam: live.homeTeamName,
                awayTeam: live.awayTeamName,
                homeScore: `${live.totalRuns}/${live.wickets}`,
                awayScore: `${live.targetRuns ? live.targetRuns - 1 : 210}`,
                venue: "St John's Oval",
                winner: live.battingTeamName,
                winMargin: live.targetRuns ? `${live.targetRuns - live.totalRuns} runs required` : "3 wickets",
                topBatters: [
                    { name: leadingBatter.name, runs: leadingBatter.runs, balls: leadingBatter.ballsFacing, fours: leadingBatter.fours, sixes: leadingBatter.sixes }
                ],
                topBowlers: [
                    { name: live.currentBowler.name, wickets: live.currentBowler.wicketsTaken, runs: live.currentBowler.runsConceded, overs: `${live.currentBowler.overs}` }
                ],
                playerOfTheMatch: {
                    name: leadingBatter.name,
                    performance: `${leadingBatter.runs}* off ${leadingBatter.ballsFacing} balls`,
                    rationale: "Stabilised the chase under high powerplay pressure with aggressive gap placement."
                },
                turningPoint: live.statusMessage || "Crucial 50-run partnership during the middle overs."
            };
        } else {
            telemetry = input as MatchTelemetry;
        }

        const {
            homeTeam,
            awayTeam,
            homeScore,
            awayScore,
            venue,
            winner,
            winMargin,
            topBatters,
            topBowlers,
            playerOfTheMatch,
            turningPoint,
        } = telemetry;

        const leadBatter = topBatters[0] ?? { name: "The top batter", runs: 0, balls: 0 };
        const leadBowler = topBowlers[0] ?? { name: "The strike bowler", wickets: 0, runs: 0, overs: "4.0" };
        const title = `${winner} Triumph at ${venue} in Classic Encounter`;

        const headmasterPressRelease = `
In an exciting fixture hosted at ${venue}, ${winner} earned a hard-fought victory against ${winner === homeTeam ? awayTeam : homeTeam} (${winMargin}).

Match Summary:
• ${homeTeam}: ${homeScore}
• ${awayTeam}: ${awayScore}

Outstanding Performers:
${leadBatter.name} paced the innings with an outstanding ${leadBatter.runs} runs off ${leadBatter.balls} balls (${leadBatter.fours}x4, ${leadBatter.sixes}x6). With the ball, ${leadBowler.name} produced a disciplined spell of ${leadBowler.wickets}/${leadBowler.runs} in ${leadBowler.overs} overs.

Turning Point:
${turningPoint}

Player of the Match:
${playerOfTheMatch.name} (${playerOfTheMatch.performance}) — ${playerOfTheMatch.rationale ?? "Outstanding all-round leadership and performance under pressure."}

— SCRBRD Sports Intelligence Engine
`.trim();

        const instagram = `
🔥 MATCH RESULT | ${homeTeam} vs ${awayTeam} 🔥

${winner} take victory at ${venue} (${winMargin})! 🏆

⭐ Player of the Match: @${playerOfTheMatch.name.toLowerCase().replace(/\s+/g, '')} (${playerOfTheMatch.performance})
🏏 Top Batter: ${leadBatter.name} (${leadBatter.runs} off ${leadBatter.balls}b)
🎯 Top Bowler: ${leadBowler.name} (${leadBowler.wickets}/${leadBowler.runs})

#SCRBRD #SchoolCricket #${winner.replace(/\s+/g, '')} #CricketOS
`.trim();

        const twitter = `
FT at ${venue}: ${winner} win (${winMargin})! 🏏

${homeTeam}: ${homeScore}
${awayTeam}: ${awayScore}

POTM: ${playerOfTheMatch.name} 🎖️
${turningPoint}

#SCRBRD #SchoolCricket
`.trim();

        const facebook = `
Match Summary: ${homeTeam} vs ${awayTeam} at ${venue}

${winner} defeated ${winner === homeTeam ? awayTeam : homeTeam} by ${winMargin}.

Highlights:
- ${leadBatter.name}: ${leadBatter.runs} runs (${leadBatter.balls} balls)
- ${leadBowler.name}: ${leadBowler.wickets} wickets for ${leadBowler.runs} runs
- Player of the Match: ${playerOfTheMatch.name}
`.trim();

        const potm = {
            name: playerOfTheMatch.name,
            performance: playerOfTheMatch.performance,
            rationale: playerOfTheMatch.rationale ?? "Decisive contributions in critical match phases."
        };

        return {
            title,
            headmasterPressRelease,
            pressRelease: headmasterPressRelease,
            socialMediaCaptions: {
                instagram,
                twitter,
                facebook,
            },
            socialCaptions: {
                instagram,
                twitter,
                facebook,
            },
            keyTakeaways: [
                `${winner} established strong control early in the fixture.`,
                `Key turning point occurred when ${turningPoint.toLowerCase()}.`,
                `${leadBowler.name} maintained disciplined line and length under pressure.`,
            ],
            playerOfTheMatch: potm,
        };
    }
}

export const aiMatchReporter = new AIMatchReporterService();
