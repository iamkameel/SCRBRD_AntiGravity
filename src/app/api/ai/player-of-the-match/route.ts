import { NextRequest, NextResponse } from 'next/server';
import { selectPlayerOfTheMatch, PlayerOfTheMatchInput } from '@/services/ai/playerOfTheMatch';

export async function POST(request: NextRequest) {
    try {
        const body: PlayerOfTheMatchInput = await request.json();
        const result = await selectPlayerOfTheMatch(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[AI] playerOfTheMatch error:', error);
        return NextResponse.json({ error: 'Failed to select Player of the Match' }, { status: 500 });
    }
}
