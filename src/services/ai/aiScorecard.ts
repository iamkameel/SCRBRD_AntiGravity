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
}
