import { NextRequest, NextResponse } from 'next/server';
import { generateAiScorecard, AiScorecardInput } from '@/services/ai/aiScorecard';
import { getSessionUser } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
    try {
        // Billable model call: signed-in users only.
        if (!(await getSessionUser())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body: AiScorecardInput = await request.json();
        const result = await generateAiScorecard(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[AI] aiScorecard error:', error);
        return NextResponse.json({ error: 'Failed to generate AI scorecard' }, { status: 500 });
    }
}
