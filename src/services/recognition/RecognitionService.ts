import { Award, Accolade, Honour, Milestone, UUID } from '../../types/schema_v4';

/**
 * RecognitionService
 * Handles the management and query logic for formal sporting recognition in SCRBRD:
 * - Awards (Official Player of Match, Tournament honors)
 * - Accolades (Coach & Scout commendations)
 * - Honours (Representative caps & team selections)
 * - Milestones (Career performance milestones)
 * 
 * Crucially, these entities represent un-gamified sporting record history,
 * entirely separate from spendable commercial points managed in RewardsEngine.
 */
export class RecognitionService {
    /**
     * Confers an official representative honour on a player (e.g. 1st XI Debut, Provincial U19).
     */
    static async conferHonour(honour: Omit<Honour, 'id' | 'createdAt'>): Promise<Honour> {
        const newHonour: Honour = {
            ...honour,
            id: `honour_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            createdAt: new Date().toISOString(),
        };

        // Storage logic / Firestore persistence point
        return newHonour;
    }

    /**
     * Grants an official award to a player.
     */
    static async grantAward(award: Omit<Award, 'id' | 'createdAt'>): Promise<Award> {
        const newAward: Award = {
            ...award,
            id: `award_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            createdAt: new Date().toISOString(),
        };

        return newAward;
    }

    /**
     * Records a qualitative coach or scout accolade.
     */
    static async recordAccolade(accolade: Omit<Accolade, 'id'>): Promise<Accolade> {
        const newAccolade: Accolade = {
            ...accolade,
            id: `accolade_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        };

        return newAccolade;
    }

    /**
     * Evaluates stats for career milestone thresholds (e.g., 500/1000 Runs, 50 Wickets).
     */
    static checkCareerMilestones(
        personId: UUID,
        careerStats: { runs: number; wickets: number; matches: number; catches: number }
    ): Omit<Milestone, 'id' | 'createdAt'>[] {
        const detected: Omit<Milestone, 'id' | 'createdAt'>[] = [];

        // Runs milestones
        if (careerStats.runs >= 1000) {
            detected.push({
                personId,
                title: '1,000 Career Runs',
                milestoneType: 'Runs',
                value: 1000,
                achievedOn: new Date().toISOString().split('T')[0],
                description: 'Surpassed 1,000 career runs across school competitions.',
            });
        } else if (careerStats.runs >= 500) {
            detected.push({
                personId,
                title: '500 Career Runs',
                milestoneType: 'Runs',
                value: 500,
                achievedOn: new Date().toISOString().split('T')[0],
                description: 'Surpassed 500 career runs.',
            });
        }

        // Wickets milestones
        if (careerStats.wickets >= 50) {
            detected.push({
                personId,
                title: '50 Career Wickets',
                milestoneType: 'Wickets',
                value: 50,
                achievedOn: new Date().toISOString().split('T')[0],
                description: 'Reached 50 career wickets.',
            });
        }

        // Matches milestones
        if (careerStats.matches >= 50) {
            detected.push({
                personId,
                title: '50 Matches Played',
                milestoneType: 'Matches',
                value: 50,
                achievedOn: new Date().toISOString().split('T')[0],
                description: '50 official SCRBRD match appearances.',
            });
        }

        return detected;
    }
}
