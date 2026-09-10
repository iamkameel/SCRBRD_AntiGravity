/**
 * AI Flow: Player of the Match
 * Analyses scorecard data to select the most valuable player with justification.
 */
'use server';

import { ai, DEFAULT_MODEL } from './genkit';

export interface PlayerPerformance {
    name: string;
    team: string;
    batting?: { runs: number; balls: number; fours: number; sixes: number; dismissed: boolean };
    bowling?: { overs: string; wickets: number; runs: number; maidens: number };
    fielding?: { catches: number; runOuts: number; stumpings: number };
}

export interface PlayerOfTheMatchInput {
    homeTeam: string;
    awayTeam: string;
    result: string;
    matchFormat?: string;
    allPlayers: PlayerPerformance[];
}

export interface PlayerOfTheMatchOutput {
    playerName: string;
    team: string;
    justification: string;
    performanceSummary: string;
    shortlisted: Array<{ name: string; reason: string }>;
}

export async function selectPlayerOfTheMatch(input: PlayerOfTheMatchInput): Promise<PlayerOfTheMatchOutput> {
    const format = input.matchFormat ?? 'T20';

    const performanceSummary = input.allPlayers.map((p: PlayerPerformance) => {
        const parts: string[] = [`${p.name} (${p.team})`];
        if (p.batting) parts.push(`${p.batting.runs} runs (${p.batting.balls}b, ${p.batting.fours}x4, ${p.batting.sixes}x6)`);
        if (p.bowling) parts.push(`${p.bowling.wickets}/${p.bowling.runs} (${p.bowling.overs})`);
        if (p.fielding && (p.fielding.catches + p.fielding.runOuts + p.fielding.stumpings > 0)) {
            parts.push(`${p.fielding.catches}ct ${p.fielding.runOuts}ro ${p.fielding.stumpings}st`);
        }
        return parts.join(' | ');
    }).join('\n');

    const response = await ai.generate({
        model: DEFAULT_MODEL,
        prompt: `You are a school cricket awards panel. Select the Player of the Match.

${input.homeTeam} vs ${input.awayTeam} (${format})
Result: ${input.result}

Player Performances:
${performanceSummary}

Consider match impact, game-changing contributions, and team context. Select the best player and 2 runners-up.
Respond ONLY with valid JSON:
{
  "playerName": "",
  "team": "",
  "justification": "<2-3 sentences>",
  "performanceSummary": "<1 sentence stat highlight>",
  "shortlisted": [{"name": "", "reason": ""}]
}`,
    });

    const text = response.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(text) as PlayerOfTheMatchOutput;
}
