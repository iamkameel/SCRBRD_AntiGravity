/**
 * AI Flow: Match Summary
 * Generates a concise journalistic summary of a completed cricket match.
 *
 * NOTE: Uses prompt-only generation with manual JSON.parse for Zod v3/v4 compatibility.
 * The project uses Zod v3 while Genkit 1.22 uses Zod v4 internally.
 */
'use server';

import { ai, DEFAULT_MODEL } from './genkit';

export interface MatchSummaryInput {
    homeTeam: string;
    awayTeam: string;
    result: string;
    scorecard: {
        innings1: {
            battingTeam: string;
            total: string;
            topScorers: Array<{ name: string; runs: number; balls: number }>;
            topBowlers: Array<{ name: string; wickets: number; runs: number; overs: string }>;
        };
        innings2: {
            battingTeam: string;
            total: string;
            topScorers: Array<{ name: string; runs: number; balls: number }>;
            topBowlers: Array<{ name: string; wickets: number; runs: number; overs: string }>;
        };
    };
    venue?: string;
    matchFormat?: string;
}

export interface MatchSummaryOutput {
    summary: string;
    headline: string;
}

export async function generateMatchSummary(input: MatchSummaryInput): Promise<MatchSummaryOutput> {
    const { innings1, innings2 } = input.scorecard;
    const format = input.matchFormat ?? 'T20';

    const response = await ai.generate({
        model: DEFAULT_MODEL,
        prompt: `You are a school cricket journalist. Write a concise, engaging match report.

Match: ${input.homeTeam} vs ${input.awayTeam}
Format: ${format}${input.venue ? ` at ${input.venue}` : ''}
Result: ${input.result}

First Innings (${innings1.battingTeam}): ${innings1.total}
Top Scorers: ${innings1.topScorers.map((s) => `${s.name} ${s.runs}(${s.balls})`).join(', ')}
Top Bowlers: ${innings1.topBowlers.map((b) => `${b.name} ${b.wickets}/${b.runs} (${b.overs})`).join(', ')}

Second Innings (${innings2.battingTeam}): ${innings2.total}
Top Scorers: ${innings2.topScorers.map((s) => `${s.name} ${s.runs}(${s.balls})`).join(', ')}
Top Bowlers: ${innings2.topBowlers.map((b) => `${b.name} ${b.wickets}/${b.runs} (${b.overs})`).join(', ')}

Respond ONLY with valid JSON: {"headline": "<10 words max>", "summary": "<150-250 word journalistic report>"}`,
    });

    const text = response.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(text) as MatchSummaryOutput;
}
