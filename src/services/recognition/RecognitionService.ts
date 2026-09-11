import { Award, Accolade, Honour, Milestone, UUID } from '../../types/schema_v4';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export interface LiveBallContext {
    matchId: string;
    inningsNumber: 1 | 2;
    strikerId: string;
    strikerName: string;
    bowlerId: string;
    bowlerName: string;
    runs: number;
    isWicket: boolean;
    wicketType?: string;
    fielderId?: string;
    fielderName?: string;
    // Cumulative state before/after this ball
    strikerRunsBefore: number;
    strikerRunsAfter: number;
    bowlerWicketsBefore: number;
    bowlerWicketsAfter: number;
    recentOverBalls?: { runs: number; isWicket: boolean; extrasType?: string }[];
}

export interface LiveMilestoneTrigger {
    milestone: Milestone;
    toastTitle: string;
    toastDescription: string;
    celebrationLevel: 'MILESTONE' | 'SUPER_MILESTONE' | 'LEGENDARY';
    badgeEmoji: string;
}

/**
 * RecognitionService
 * Handles the management and query logic for formal sporting recognition in SCRBRD:
 * - Awards (Official Player of Match, Tournament honors)
 * - Accolades (Coach & Scout commendations)
 * - Honours (Representative caps & team selections)
 * - Milestones (Career & Live match performance milestones)
 */
export class RecognitionService {
    /**
     * Confers an official representative honour on a player.
     */
    static async conferHonour(honour: Omit<Honour, 'id' | 'createdAt'>): Promise<Honour> {
        const newHonour: Honour = {
            ...honour,
            id: `honour_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            createdAt: new Date().toISOString(),
        };

        try {
            await addDoc(collection(db, 'honours'), newHonour);
        } catch (e) {
            console.error('Error saving honour to Firestore:', e);
        }

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

        try {
            await addDoc(collection(db, 'awards'), newAward);
        } catch (e) {
            console.error('Error saving award to Firestore:', e);
        }

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

        try {
            await addDoc(collection(db, 'accolades'), newAccolade);
        } catch (e) {
            console.error('Error saving accolade to Firestore:', e);
        }

        return newAccolade;
    }

    /**
     * Persists a milestone to Firestore.
     */
    static async saveMilestone(milestoneData: Omit<Milestone, 'id' | 'createdAt'>): Promise<Milestone> {
        const milestone: Milestone = {
            ...milestoneData,
            id: `milestone_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            createdAt: new Date().toISOString(),
        };

        try {
            await addDoc(collection(db, 'milestones'), milestone);
        } catch (e) {
            console.error('Error saving milestone to Firestore:', e);
        }

        return milestone;
    }

    /**
     * Evaluates a live ball event for real-time match milestones.
     */
    static async evaluateLiveBallEvent(ctx: LiveBallContext): Promise<LiveMilestoneTrigger[]> {
        const triggers: LiveMilestoneTrigger[] = [];

        // 1. Half-Century (50 Runs in Innings)
        if (ctx.strikerRunsBefore < 50 && ctx.strikerRunsAfter >= 50) {
            const milestone = await this.saveMilestone({
                personId: ctx.strikerId,
                title: 'Match 50 (Half-Century)',
                milestoneType: 'Runs',
                value: 50,
                achievedOn: new Date().toISOString().split('T')[0],
                description: `${ctx.strikerName} scored a brilliant half-century in Innings ${ctx.inningsNumber}.`,
            });

            triggers.push({
                milestone,
                toastTitle: `🏏 HALF-CENTURY! 50 RUNS FOR ${ctx.strikerName.toUpperCase()}`,
                toastDescription: `${ctx.strikerName} brings up a magnificent 50 off the bat!`,
                celebrationLevel: 'MILESTONE',
                badgeEmoji: '🏏',
            });
        }

        // 2. Century (100 Runs in Innings)
        if (ctx.strikerRunsBefore < 100 && ctx.strikerRunsAfter >= 100) {
            const milestone = await this.saveMilestone({
                personId: ctx.strikerId,
                title: 'Match 100 (Century)',
                milestoneType: 'Runs',
                value: 100,
                achievedOn: new Date().toISOString().split('T')[0],
                description: `${ctx.strikerName} scored a monumental 100 in Innings ${ctx.inningsNumber}.`,
            });

            triggers.push({
                milestone,
                toastTitle: `💯 CENTURY! 100 RUNS FOR ${ctx.strikerName.toUpperCase()}`,
                toastDescription: `Unbelievable innings! ${ctx.strikerName} reaches 100 runs!`,
                celebrationLevel: 'LEGENDARY',
                badgeEmoji: '💯',
            });
        }

        // 3. 3-Wicket Haul
        if (ctx.bowlerWicketsBefore < 3 && ctx.bowlerWicketsAfter >= 3) {
            const milestone = await this.saveMilestone({
                personId: ctx.bowlerId,
                title: '3-Wicket Haul',
                milestoneType: 'Wickets',
                value: 3,
                achievedOn: new Date().toISOString().split('T')[0],
                description: `${ctx.bowlerName} claimed 3 wickets in Innings ${ctx.inningsNumber}.`,
            });

            triggers.push({
                milestone,
                toastTitle: `🎯 3-WICKET HAUL FOR ${ctx.bowlerName.toUpperCase()}`,
                toastDescription: `Disciplined bowling spell! ${ctx.bowlerName} takes 3 wickets!`,
                celebrationLevel: 'MILESTONE',
                badgeEmoji: '🎯',
            });
        }

        // 4. 5-Wicket Haul (Fifer)
        if (ctx.bowlerWicketsBefore < 5 && ctx.bowlerWicketsAfter >= 5) {
            const milestone = await this.saveMilestone({
                personId: ctx.bowlerId,
                title: '5-Wicket Haul (Fifer)',
                milestoneType: 'Wickets',
                value: 5,
                achievedOn: new Date().toISOString().split('T')[0],
                description: `${ctx.bowlerName} captured an extraordinary 5-wicket haul!`,
            });

            triggers.push({
                milestone,
                toastTitle: `🖐️ 5-WICKET FIFER FOR ${ctx.bowlerName.toUpperCase()}`,
                toastDescription: `Masterclass spell! 5 wickets for ${ctx.bowlerName}!`,
                celebrationLevel: 'SUPER_MILESTONE',
                badgeEmoji: '🖐️',
            });
        }

        // 5. Hattrick Check (3 wickets on last 3 legal balls)
        if (ctx.recentOverBalls && ctx.recentOverBalls.length >= 3) {
            const lastThree = ctx.recentOverBalls.slice(-3);
            const isHattrick = lastThree.every(b => b.isWicket && b.extrasType !== 'wide' && b.extrasType !== 'noball');
            if (isHattrick) {
                const milestone = await this.saveMilestone({
                    personId: ctx.bowlerId,
                    title: 'Hat-trick',
                    milestoneType: 'Wickets',
                    value: 3,
                    achievedOn: new Date().toISOString().split('T')[0],
                    description: `${ctx.bowlerName} took a rare Hat-trick on 3 consecutive deliveries!`,
                });

                triggers.push({
                    milestone,
                    toastTitle: `🎩 HAT-TRICK! 3 WICKETS IN 3 BALLS FOR ${ctx.bowlerName.toUpperCase()}`,
                    toastDescription: `Incredible achievement! ${ctx.bowlerName} claims a live match Hat-trick!`,
                    celebrationLevel: 'LEGENDARY',
                    badgeEmoji: '🎩',
                });
            }
        }

        return triggers;
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

