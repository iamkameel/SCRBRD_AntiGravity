import { NextRequest, NextResponse } from 'next/server';
import { generateMatchPreview, MatchPreviewInput } from '@/services/ai/matchPreview';

export async function POST(request: NextRequest) {
    try {
        const body: MatchPreviewInput = await request.json();
        const result = await generateMatchPreview(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[AI] matchPreview error:', error);
        return NextResponse.json({ error: 'Failed to generate match preview' }, { status: 500 });
    }
}
