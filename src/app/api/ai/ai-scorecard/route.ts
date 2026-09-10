import { NextRequest, NextResponse } from 'next/server';
import { generateAiScorecard, AiScorecardInput } from '@/services/ai/aiScorecard';

export async function POST(request: NextRequest) {
    try {
        const body: AiScorecardInput = await request.json();
        const result = await generateAiScorecard(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[AI] aiScorecard error:', error);
        return NextResponse.json({ error: 'Failed to generate AI scorecard' }, { status: 500 });
    }
}
