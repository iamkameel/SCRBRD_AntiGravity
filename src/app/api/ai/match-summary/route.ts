import { NextRequest, NextResponse } from 'next/server';
import { generateMatchSummary, MatchSummaryInput } from '@/services/ai/matchSummary';

export async function POST(request: NextRequest) {
    try {
        const body: MatchSummaryInput = await request.json();
        const result = await generateMatchSummary(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[AI] matchSummary error:', error);
        return NextResponse.json({ error: 'Failed to generate match summary' }, { status: 500 });
    }
}
