import { NextRequest, NextResponse } from 'next/server';
import { generateMatchPreview, MatchPreviewInput } from '@/services/ai/matchPreview';
import { getSessionUser } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
    try {
        // Billable model call: signed-in users only.
        if (!(await getSessionUser())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body: MatchPreviewInput = await request.json();
        const result = await generateMatchPreview(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[AI] matchPreview error:', error);
        return NextResponse.json({ error: 'Failed to generate match preview' }, { status: 500 });
    }
}
