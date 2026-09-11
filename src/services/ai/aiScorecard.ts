/**
 * AI Flow: Demo Scorecard Generator
 * Generates a realistic T20 scorecard from two team lineups for demo/testing purposes.
 */
'use server';

import { ai, DEFAULT_MODEL } from './genkit';

export interface LineupPlayer {
    name: string;
    role?: 'Batter' | 'Bowler' | 'All-rounder' | 'Wicketkeeper' | 'Wicketkeeper-Batter';
}

export interface AiScorecardInput {
    homeTeam: { name: string; players: LineupPlayer[] };
    awayTeam: { name: string; players: LineupPlayer[] };
    tossWinner: string;
    tossDecision: 'bat' | 'field';
    overs?: number;
    venue?: string;
}

export interface BatterLine {
    name: string; howOut: string; runs: number; balls: number; fours: number; sixes: number;
}
export interface BowlerLine {
    name: string; overs: string; maidens: number; runs: number; wickets: number;
}
export interface InningsSummary {
    battingTeam: string; total: number; wickets: number; overs: string;
    extras: number; batters: BatterLine[]; bowlers: BowlerLine[]; fallOfWickets: string;
}
export interface AiScorecardOutput {
    innings1: InningsSummary;
    innings2: InningsSummary;
    result: string;
    playerOfTheMatch: string;
}

export async function generateAiScorecard(input: AiScorecardInput): Promise<AiScorecardOutput> {
    const overs = input.overs ?? 20;
    const battingFirst = input.tossDecision === 'bat' ? input.tossWinner :
        input.tossWinner === input.homeTeam.name ? input.awayTeam.name : input.homeTeam.name;
    const battingFirstTeam = battingFirst === input.homeTeam.name ? input.homeTeam : input.awayTeam;
    const fieldingFirstTeam = battingFirst === input.homeTeam.name ? input.awayTeam : input.homeTeam;

    const formatPlayer = (p: LineupPlayer, i: number) => `${i + 1}. ${p.name} (${p.role ?? 'Batter'})`;

    try {
        const response = await ai.generate({
            model: DEFAULT_MODEL,
            prompt: `Generate a realistic school cricket T20 scorecard (${overs} overs per side).

Batting first: ${battingFirstTeam.name}
Players: ${battingFirstTeam.players.map(formatPlayer).join(', ')}

Batting second: ${fieldingFirstTeam.name}
Players: ${fieldingFirstTeam.players.map(formatPlayer).join(', ')}

Rules:
- School cricket totals: 120-180 range typical
- Each batter runs + extras = team total
- Max 4 overs per bowler in T20
- Include a plausible result

Respond ONLY with valid JSON matching this structure:
{
  "innings1": {"battingTeam": "", "total": 0, "wickets": 0, "overs": "", "extras": 0,
    "batters": [{"name": "", "howOut": "", "runs": 0, "balls": 0, "fours": 0, "sixes": 0}],
    "bowlers": [{"name": "", "overs": "", "maidens": 0, "runs": 0, "wickets": 0}],
    "fallOfWickets": ""},
  "innings2": {<same structure>},
  "result": "",
  "playerOfTheMatch": ""
}`,
        });

        const text = response.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
        return JSON.parse(text) as AiScorecardOutput;
    } catch (err) {
        console.warn('[AI] Gemini API unavailable or failed, returning structured mock scorecard:', err);
        return {
            innings1: {
                battingTeam: battingFirstTeam.name,
                total: 158,
                wickets: 5,
                overs: `${overs}.0`,
                extras: 12,
                batters: battingFirstTeam.players.slice(0, 6).map((p, idx) => ({
                    name: p.name,
                    howOut: idx === 0 ? 'c Smith b Starc' : idx === 3 ? 'not out' : 'b Johnson',
                    runs: Math.max(8, 48 - idx * 8),
                    balls: Math.max(10, 34 - idx * 5),
                    fours: Math.max(1, 5 - idx),
                    sixes: idx % 2 === 0 ? 1 : 0
                })),
                bowlers: fieldingFirstTeam.players.slice(6, 10).map((p, idx) => ({
                    name: p.name,
                    overs: '4.0',
                    maidens: idx === 0 ? 1 : 0,
                    runs: 26 + idx * 5,
                    wickets: 2 - (idx % 2)
                })),
                fallOfWickets: '1-42 (4.2 ov), 2-89 (11.5 ov), 3-118 (15.1 ov)'
            },
            innings2: {
                battingTeam: fieldingFirstTeam.name,
                total: 154,
                wickets: 7,
                overs: `${overs}.0`,
                extras: 9,
                batters: fieldingFirstTeam.players.slice(0, 6).map((p, idx) => ({
                    name: p.name,
                    howOut: idx === 2 ? 'lbw Williams' : idx === 0 ? 'not out' : 'c Keeper b Bowler',
                    runs: Math.max(5, 42 - idx * 7),
                    balls: Math.max(8, 30 - idx * 4),
                    fours: Math.max(1, 4 - idx),
                    sixes: idx % 3 === 0 ? 1 : 0
                })),
                bowlers: battingFirstTeam.players.slice(6, 10).map((p, idx) => ({
                    name: p.name,
                    overs: '4.0',
                    maidens: 0,
                    runs: 28 + idx * 4,
                    wickets: 2
                })),
                fallOfWickets: '1-30 (3.5 ov), 2-75 (9.2 ov), 3-110 (14.4 ov)'
            },
            result: `${battingFirstTeam.name} won by 4 runs`,
            playerOfTheMatch: battingFirstTeam.players[0]?.name ?? 'Top Performer'
        };
    }
}
