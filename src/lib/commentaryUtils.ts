import { Person } from '@/types/firestore';
import { generateCommentary, CommentaryContext } from '@/lib/utils/commentaryGenerator';

export interface CommentaryItem {
    over: number;
    ball: number;
    description: string;
    runs: number;
    timestamp: string;
    bowler?: string;
    batsman?: string;
}

export function generateCommentaryFromHistory(
    ballHistory: any[], // Using any[] as LiveScore definition uses any[] for ballHistory
    allPlayers: Person[]
): CommentaryItem[] {
    if (!ballHistory || ballHistory.length === 0) return [];

    const commentary: CommentaryItem[] = [];
    let currentOver = 0;
    let ballsInOver = 0;

    // We need to iterate and calculate overs/balls
    // Assuming ballHistory is ordered chronologically

    ballHistory.forEach((ball) => {
        // Determine if legal ball
        const isExtra = ball.extrasType === 'wide' || ball.extrasType === 'no-ball' || ball.extrasType === 'noball' || ball.extraType === 'wide' || ball.extraType === 'no-ball' || ball.extraType === 'noball';

        if (!isExtra) {
            ballsInOver++;
        }

        // Get names
        const bowler = allPlayers.find(p => p.id === ball.bowlerId);
        const batsman = allPlayers.find(p => p.id === ball.batsmanId);
        const fielder = ball.fielderIds && ball.fielderIds.length > 0 ? allPlayers.find(p => p.id === ball.fielderIds[0]) : undefined;

        const bowlerName = bowler ? `${bowler.firstName ? bowler.firstName[0] + '. ' : ''}${bowler.lastName}` : (ball.bowlerName || "Bowler");
        const batsmanName = batsman ? `${batsman.firstName ? batsman.firstName[0] + '. ' : ''}${batsman.lastName}` : (ball.strikerName || ball.batsmanName || "Batsman");
        const fielderName = fielder ? `${fielder.firstName ? fielder.firstName[0] + '. ' : ''}${fielder.lastName}` : undefined;

        const totalRuns = (ball.runs || 0) + (ball.extras || ball.extraRuns || 0);

        let description = ball.commentary;

        if (!description) {
            const ctx: CommentaryContext = {
                runs: ball.runs || 0,
                isWide: ball.extrasType === 'wide' || ball.extraType === 'wide',
                isNoBall: ball.extrasType === 'noball' || ball.extrasType === 'no-ball' || ball.extraType === 'noball' || ball.extraType === 'no-ball',
                isDismissal: !!ball.isWicket,
                dismissalType: ball.wicketType || 'Dismissed',
                batsmanName,
                bowlerName,
                fielderName,
                shotZone: ball.shotZone,
                shotType: ball.shotType,
                contactQuality: ball.contactQuality,
                isPowerplay: currentOver < 6,
                isDeathOver: currentOver >= 16,
            };
            description = generateCommentary(ctx);
        }

        commentary.unshift({ // Add to front for reverse chronological order
            over: currentOver,
            ball: ballsInOver,
            description,
            runs: totalRuns,
            timestamp: ball.timestamp ? (typeof ball.timestamp === 'string' ? ball.timestamp : new Date(ball.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : '',
            bowler: bowlerName,
            batsman: batsmanName
        });

        // Increment over if 6 legal balls
        if (ballsInOver >= 6) {
            currentOver++;
            ballsInOver = 0;
        }
    });

    return commentary;
}

