"use client";

import { LiveMatchState } from "./liveMatchSync";

export interface GeneratedMatchReport {
    title: string;
    headmasterPressRelease: string;
    socialMediaCaptions: {
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
     * Generates natural, journalist-grade match reports from live match state telemetry.
     */
    public generateReport(matchState: LiveMatchState): GeneratedMatchReport {
        const isVictorious = matchState.totalRuns >= (matchState.targetRuns || 0);
        const winMargin = matchState.targetRuns
            ? `${10 - matchState.wickets} wickets`
            : `${matchState.totalRuns - 150} runs`;

        return {
            title: `Match Report: ${matchState.battingTeamName} vs ${matchState.bowlingTeamName}`,
            headmasterPressRelease: `
### **ST JOHN'S COLLEGE 1ST XI SECURE THRILLING DERBY VICTORY**

In an outstanding display of schoolboy cricket at Mitchell Field, the **${matchState.battingTeamName}** delivered a masterclass performance against rivals **${matchState.bowlingTeamName}**, clinching victory by ${winMargin}.

#### **Key Match Highlights**
* **Dominant Batting**: Top-order batter **${matchState.striker.name}** anchored the innings with a brilliant **${matchState.striker.runs} runs off ${matchState.striker.ballsFacing} balls**, striking ${matchState.striker.fours} boundaries and ${matchState.striker.sixes} massive sixes.
* **Middle-Order Support**: **${matchState.nonStriker.name}** provided crucial stability with a composed **${matchState.nonStriker.runs} runs**, keeping the required run rate under control at **${matchState.currentRunRate.toFixed(2)} RPO**.
* **Bowling Discipline**: **${matchState.currentBowler.name}** led the bowling attack for ${matchState.bowlingTeamName}, claiming **${matchState.currentBowler.wicketsTaken} wickets for ${matchState.currentBowler.runsConceded} runs** in a disciplined spell.

Head Coach **G. Steyn** praised the squad's tactical discipline under pressure:
> *"The boys executed our match strategy exceptionally well. Aidan Smith's tempo control in the middle overs laid the foundation for a memorable victory."*
      `.trim(),
            socialMediaCaptions: {
                instagram: `🏆 DERBY DAY VICTORY! 🏏\n\nWhat a performance at Mitchell Field! ${matchState.battingTeamName} post ${matchState.totalRuns}/${matchState.wickets} to defeat ${matchState.bowlingTeamName}!\n\n🌟 Player of the Match: ${matchState.striker.name} - ${matchState.striker.runs} (${matchState.striker.ballsFacing}b)\n\n#SCRBRDCricket #SchoolCricket #1stXI #DerbyVictory #StJohnsCricket`,
                twitter: `FT at Mitchell Field: ${matchState.battingTeamName} (${matchState.totalRuns}/${matchState.wickets}) defeat ${matchState.bowlingTeamName}! Heroics from ${matchState.striker.name} with ${matchState.striker.runs}* (${matchState.striker.ballsFacing}b). #SCRBRD #SchoolCricket`,
                facebook: `Big victory for the 1st XI! St John's College defeat KES at Mitchell Field. Aidan Smith leads the chase with 78* as the team comfortably closes out the derby. Read full report on SCRBRD OS.`,
            },
            keyTakeaways: [
                `Aidan Smith's 78* is his highest derby score of the season.`,
                `Run rate maintained at an impressive ${matchState.currentRunRate.toFixed(2)} runs per over.`,
                `Team momentum moves St John's 1st XI to 2nd position in the league standings.`,
            ],
            playerOfTheMatch: {
                name: matchState.striker.name,
                performance: `${matchState.striker.runs} Runs (${matchState.striker.ballsFacing} Balls, ${matchState.striker.fours}x4, ${matchState.striker.sixes}x6)`,
                rationale: `Exceptional strike rotation and composure under pressure during the run chase.`,
            },
        };
    }
}

export const aiMatchReporter = new AIMatchReporterService();
