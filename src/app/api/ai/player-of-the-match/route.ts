import { NextRequest, NextResponse } from 'next/server';
import { selectPlayerOfTheMatch, PlayerOfTheMatchInput } from '@/services/ai/playerOfTheMatch';
import { getSessionUser } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
    try {
        // Billable model call: signed-in users only.
        if (!(await getSessionUser())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body: PlayerOfTheMatchInput = await request.json();
        const result = await selectPlayerOfTheMatch(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[AI] playerOfTheMatch error:', error);
        return NextResponse.json({ error: 'Failed to select Player of the Match' }, { status: 500 });
    }
}
