/**
 * AI Flow: Match Preview
 * Generates an analytical pre-match preview using team stats, key players, and context.
 */
'use server';

import { ai, DEFAULT_MODEL } from './genkit';

export interface TeamStats {
    name: string;
    recentForm: string;
    topBatter: { name: string; average: number; strikeRate: number };
    topBowler: { name: string; average: number; economy: number };
    winRateThisSeason: number;
}

export interface MatchPreviewInput {
    homeTeam: TeamStats;
    awayTeam: TeamStats;
    venue?: string;
    scheduledAt: string;
    competition?: string;
    matchFormat?: string;
}

export interface KeyBattle {
    batter: string;
    bowler: string;
    context: string;
}

export interface MatchPreviewOutput {
    preview: string;
    headline: string;
    keyBattles: KeyBattle[];
    prediction: string;
}

export async function generateMatchPreview(input: MatchPreviewInput): Promise<MatchPreviewOutput> {
    const format = input.matchFormat ?? 'T20';
    const { homeTeam: h, awayTeam: a } = input;

    try {
        const response = await ai.generate({
            model: DEFAULT_MODEL,
            prompt: `You are a school cricket analyst. Write an engaging pre-match preview.

Match: ${h.name} vs ${a.name}
Format: ${format}${input.venue ? ` at ${input.venue}` : ''}
${input.competition ? `Competition: ${input.competition}` : ''}

${h.name}: Form ${h.recentForm}, Win rate ${h.winRateThisSeason}%
Key batter: ${h.topBatter.name} (avg ${h.topBatter.average}, SR ${h.topBatter.strikeRate})
Key bowler: ${h.topBowler.name} (avg ${h.topBowler.average}, econ ${h.topBowler.economy})

${a.name}: Form ${a.recentForm}, Win rate ${a.winRateThisSeason}%
Key batter: ${a.topBatter.name} (avg ${a.topBatter.average}, SR ${a.topBatter.strikeRate})
Key bowler: ${a.topBowler.name} (avg ${a.topBowler.average}, econ ${a.topBowler.economy})

Respond ONLY with valid JSON:
{
  "headline": "<12 words max>",
  "preview": "<150-250 word analytical preview>",
  "keyBattles": [{"batter": "", "bowler": "", "context": ""}],
  "prediction": "<1-2 sentence prediction>"
}`,
        });

        const text = response.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
        return JSON.parse(text) as MatchPreviewOutput;
    } catch (err) {
        console.warn('[AI] Gemini API unavailable or failed, returning structured mock preview:', err);
        return {
            headline: `Clash of Titans: ${h.name} Prepare to Host ${a.name} in Key ${format} Encounter`,
            preview: `${h.name} enter this fixture in solid form (${h.recentForm}) boasting a ${h.winRateThisSeason}% win rate this season. All eyes will be on key batter ${h.topBatter.name} (Avg: ${h.topBatter.average}, SR: ${h.topBatter.strikeRate}) and lead bowler ${h.topBowler.name} (Econ: ${h.topBowler.economy}). Meanwhile, ${a.name} bring high tactical discipline with ${a.topBatter.name} leading their batting lineup. Pitch conditions at ${input.venue ?? 'the grounds'} are expected to offer a true surface for bat and ball.`,
            keyBattles: [
                { batter: h.topBatter.name, bowler: a.topBowler.name, context: 'Powerplay new-ball battle' },
                { batter: a.topBatter.name, bowler: h.topBowler.name, context: 'Middle overs spin control vs boundary striking' }
            ],
            prediction: `Expect a tightly fought match, with ${h.winRateThisSeason >= a.winRateThisSeason ? h.name : a.name} holding a strategic edge based on recent execution.`
        };
    }
}
