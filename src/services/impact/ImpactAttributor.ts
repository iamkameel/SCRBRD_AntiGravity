import { ScoringAction } from '../../types/scoring';
import { Rankings } from '../../types/firestore';
import { UUID } from '../../types/schema_v4';

/**
 * ImpactAttributor
 * Distributes total impact among participants based on their role in the event.
 */
export class ImpactAttributor {

    static attributeImpact(
        impactEvent: Rankings.MatchImpactEvent,
        ball: ScoringAction
    ): Rankings.ImpactAttribution[] {
        const attributions: Rankings.ImpactAttribution[] = [];
        const totalValue = impactEvent.totalImpactValue;

        // 1. Batting Attribution (Striker)
        if (ball.runsOffBat > 0 || (ball.totalRuns === 0 && !ball.isWicket)) {
            attributions.push({
                id: crypto.randomUUID() as UUID,
                matchImpactEventId: impactEvent.id,
                personId: ball.strikerId as UUID,
                roleType: 'Batter',
                impactCategory: 'Batting',
                impactValue: this.calculateBattingShare(impactEvent, ball),
                explanation: ball.runsOffBat > 0 ? `Scored ${ball.runsOffBat} runs.` : 'Survived a dot ball under pressure.'
            });
        }

        // 2. Bowling Attribution
        attributions.push({
            id: crypto.randomUUID() as UUID,
            matchImpactEventId: impactEvent.id,
            personId: ball.bowlerId as UUID,
            roleType: 'Bowler',
            impactCategory: 'Bowling',
            impactValue: this.calculateBowlingShare(impactEvent, ball),
            explanation: ball.isWicket ? 'Took a clinical wicket.' : (ball.totalRuns === 0 ? 'Bowled a dot ball.' : 'Conceded runs.')
        });

        // 3. Fielding Attribution (Catch / Run Out / Stumping)
        if (ball.isWicket && ball.wicket?.fielderIds?.length) {
            attributions.push({
                id: crypto.randomUUID() as UUID,
                matchImpactEventId: impactEvent.id,
                personId: ball.wicket.fielderIds[0] as UUID,
                roleType: ball.wicket.type === 'stumped' ? 'Keeper' : 'Fielder',
                impactCategory: 'Fielding',
                impactValue: totalValue * 0.3, // Standard 30% share for fielder
                explanation: `Completed the ${ball.wicket.type?.toLowerCase()}.`
            });
        }

        return attributions;
    }

    private static calculateBattingShare(impact: Rankings.MatchImpactEvent, ball: ScoringAction): number {
        // If it's a wicket, batter takes negative impact (not implemented in V1 for score safety)
        if (ball.isWicket) return -5.0;
        return impact.totalImpactValue; // Striker owns the batting impact
    }

    private static calculateBowlingShare(impact: Rankings.MatchImpactEvent, ball: ScoringAction): number {
        if (ball.isWicket) {
            // Bowler takes 70% of wicket value if there's a fielder, 100% if bowled/LBW
            const hasFielder = !!(ball.wicket?.fielderIds?.length);
            return hasFielder ? impact.totalImpactValue * 0.7 : impact.totalImpactValue;
        }

        if (ball.totalRuns === 0) {
            return impact.totalImpactValue; // Full credit for dot ball pressure
        }

        if (ball.totalRuns > 0) {
            return - (ball.totalRuns * 0.5); // Slight penalty for conceded runs
        }

        return 0;
    }
}
