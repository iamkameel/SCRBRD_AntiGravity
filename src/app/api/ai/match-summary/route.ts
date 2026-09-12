import { NextRequest, NextResponse } from 'next/server';
import { generateMatchSummary, MatchSummaryInput } from '@/services/ai/matchSummary';
import { getSessionUser } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
    try {
        // Billable model call: signed-in users only.
        if (!(await getSessionUser())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body: MatchSummaryInput = await request.json();
        const result = await generateMatchSummary(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[AI] matchSummary error:', error);
        return NextResponse.json({ error: 'Failed to generate match summary' }, { status: 500 });
    }
}
