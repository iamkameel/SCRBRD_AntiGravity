import { baseService } from './baseService';
import { Rankings } from '../types/firestore';
import { UUID } from '../types/schema_v4';

/**
 * ScoutingService
 * Extends the Rankings Intelligence Suite to manage human-augmented
 * player assessments (Scout Reports) and Potential Projections.
 */
export const scoutingService = {
    COLLECTION_REPORTS: 'scout_reports',
    COLLECTION_PROJECTIONS: 'potential_projections',

    /**
     * Saves a new Scout Report to Firestore.
     * Automatically derives the 'scoutGrade' based on the quantitative scores.
     * 
     * @param reportData The raw scores and qualitative notes.
     * @returns The generated UUID for the report.
     */
    async saveScoutReport(reportData: Omit<Rankings.ScoutReport, 'id' | 'scoutGrade' | 'createdAt' | 'updatedAt'>): Promise<UUID> {
        // Calculate the total score
        const totalScore =
            reportData.technicalScore +
            reportData.tacticalScore +
            reportData.physicalScore +
            reportData.mentalScore +
            reportData.competitivenessScore +
            reportData.statisticalEvidenceScore;

        const MaxScore = 100; // 20+15+15+20+10+20 = 100

        // Derive Scout Grade
        let scoutGrade: Rankings.ScoutReport['scoutGrade'] = 'C';
        if (totalScore >= 90) scoutGrade = 'A+';
        else if (totalScore >= 80) scoutGrade = 'A';
        else if (totalScore >= 70) scoutGrade = 'B+';
        else if (totalScore >= 60) scoutGrade = 'B';

        const id = crypto.randomUUID() as UUID;
        const now = new Date().toISOString();

        const report: Rankings.ScoutReport = {
            ...reportData,
            id,
            scoutGrade,
            createdAt: now,
            updatedAt: now
        };

        await baseService.set(this.COLLECTION_REPORTS, id, report);
        return id;
    },

    /**
     * Retrieves all scout reports for a specific player.
     * Useful for building a timeline of a player's development.
     */
    async getPlayerReports(personId: UUID): Promise<Rankings.ScoutReport[]> {
        return baseService.getAll<Rankings.ScoutReport>(this.COLLECTION_REPORTS, {
            constraints: [
                // In actual implementation we use Firestore 'where' constraint here
                // where('personId', '==', personId)
            ],
            orderByField: 'createdAt',
            orderDirection: 'desc'
        }).then(reports => reports.filter(r => r.personId === personId)); // Filter mock for now
    },

    /**
     * Computes or retrieves a Potential Projection for a player based on their
     * current PPR (Player Power Rating) and the latest Scout Reports.
     */
    async getPotentialProjection(personId: UUID, seasonId: UUID): Promise<Rankings.PotentialProjection | null> {
        // 1. Check if an active projection exists
        const existing = await baseService.getAll<Rankings.PotentialProjection>(this.COLLECTION_PROJECTIONS, {
            constraints: []
        }).then(projs => projs.find(p => p.personId === personId && p.seasonId === seasonId));

        if (existing) return existing;

        return null;
    },

    /**
     * Retrieves the scouting watchlist for a scout or school.
     */
    async getScoutWatchlist(scoutId: UUID): Promise<{ id: UUID; personId: UUID; addedAt: string; notes?: string }[]> {
        return baseService.getAll<{ id: UUID; personId: UUID; scoutId: UUID; addedAt: string; notes?: string }>('scout_watchlists', {
            constraints: []
        }).then(list => list.filter(item => item.scoutId === scoutId));
    },

    /**
     * Adds a player to a scout's watchlist.
     */
    async addToWatchlist(scoutId: UUID, personId: UUID, notes?: string): Promise<UUID> {
        const id = crypto.randomUUID() as UUID;
        const entry = {
            id,
            scoutId,
            personId,
            notes: notes || '',
            addedAt: new Date().toISOString()
        };
        await baseService.set('scout_watchlists', id, entry);
        return id;
    }
};

