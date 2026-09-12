"use server";

import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/services/auditService";

export interface ScoutReportInput {
    personId: string;
    personName: string;
    roleArchetype: string;
    scoutGrade: string;
    potentialScore: string;
    metrics: {
        velocity?: number;
        accuracy?: number;
        stamina?: number;
        timing?: number;
        power?: number;
        defense?: number;
        versatility?: number;
        impact?: number;
        composure?: number;
        reflexes?: number;
        hands?: number;
        agility?: number;
        [key: string]: number | undefined;
    };
    notes?: string;
}

export interface ProspectItem {
    id: string;
    name: string;
    role: string;
    age: number;
    scoutGrade: string;
    potential: string;
    metrics: Record<string, number>;
    trend: 'up' | 'down' | 'same';
    reports: number;
    inWatchlist?: boolean;
}

const DEFAULT_PROSPECTS: ProspectItem[] = [
    {
        id: 'p1',
        name: 'James Anderson',
        role: 'Fast Bowler',
        age: 16,
        scoutGrade: 'A+',
        potential: 'ELITE',
        metrics: { velocity: 88, accuracy: 92, stamina: 85 },
        trend: 'up',
        reports: 12
    },
    {
        id: 'p2',
        name: 'Liam Smith',
        role: 'Opening Batter',
        age: 17,
        scoutGrade: 'A',
        potential: 'HIGH',
        metrics: { timing: 90, power: 78, defense: 95 },
        trend: 'same',
        reports: 8
    },
    {
        id: 'p3',
        name: 'Noah Patel',
        role: 'All-Rounder',
        age: 15,
        scoutGrade: 'B+',
        potential: 'HIGH',
        metrics: { versatility: 94, impact: 82, composure: 75 },
        trend: 'down',
        reports: 15
    },
    {
        id: 'p4',
        name: 'Ethan Williams',
        role: 'Wicketkeeper',
        age: 18,
        scoutGrade: 'B',
        potential: 'MEDIUM',
        metrics: { reflexes: 96, hands: 94, agility: 88 },
        trend: 'up',
        reports: 6
    },
];

/**
 * Creates a new scouting evaluation report in Firestore.
 * Requires verified session with `scouting` module permission.
 */
export async function createScoutReportAction(report: ScoutReportInput) {
    try {
        const user = await requireUser("talent");

        const docRef = await adminDb.collection("scouting_reports").add({
            ...report,
            scoutUid: user.uid,
            scoutEmail: user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await recordAuditLog({
            actorId: user.uid,
            actorName: user.email || 'Scout',
            actionType: 'SCOUT_REPORT_SUBMITTED',
            entityType: 'scouting_report',
            entityId: docRef.id,
            description: `Submitted talent evaluation report for ${report.personName} (${report.scoutGrade} / ${report.potentialScore})`,
        });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating scout report:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create scout report.",
        };
    }
}

/**
 * Fetches prospects aggregated from Firestore scouting reports.
 * Falls back gracefully to default structured prospects when collection is sparse.
 */
export async function getProspectsAction() {
    try {
        const reportsSnap = await adminDb.collection("scouting_reports").orderBy("createdAt", "desc").get();
        const watchlistSnap = await adminDb.collection("scouting_watchlists").get();

        const watchlistIds = new Set(watchlistSnap.docs.map(doc => doc.data().personId));

        if (reportsSnap.empty) {
            return {
                success: true,
                prospects: DEFAULT_PROSPECTS.map(p => ({
                    ...p,
                    inWatchlist: watchlistIds.has(p.id)
                }))
            };
        }

        const prospectsMap: Record<string, ProspectItem> = {};

        reportsSnap.docs.forEach(doc => {
            const data = doc.data();
            const personId = data.personId || doc.id;

            if (!prospectsMap[personId]) {
                prospectsMap[personId] = {
                    id: personId,
                    name: data.personName || "Unknown Athlete",
                    role: data.roleArchetype || "General Athlete",
                    age: data.age || 17,
                    scoutGrade: data.scoutGrade || "B",
                    potential: data.potentialScore || "HIGH",
                    metrics: data.metrics || { impact: 80, technique: 75 },
                    trend: 'up',
                    reports: 1,
                    inWatchlist: watchlistIds.has(personId)
                };
            } else {
                prospectsMap[personId].reports += 1;
            }
        });

        const firestoreProspects = Object.values(prospectsMap);

        return {
            success: true,
            prospects: firestoreProspects.length > 0 ? firestoreProspects : DEFAULT_PROSPECTS
        };
    } catch (error) {
        console.error("Error fetching prospects:", error);
        return {
            success: true,
            prospects: DEFAULT_PROSPECTS
        };
    }
}

/**
 * Fetches historical scouting reports for a specific athlete.
 */
export async function getScoutReportsAction(personId?: string) {
    try {
        let q = adminDb.collection("scouting_reports").orderBy("createdAt", "desc");
        if (personId) {
            q = q.where("personId", "==", personId) as any;
        }
        const snap = await q.get();
        const reports = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return { success: true, reports };
    } catch (error) {
        console.error("Error fetching scout reports:", error);
        return { success: false, error: "Failed to fetch scout reports.", reports: [] };
    }
}

/**
 * Adds or removes an athlete from the user's scouting watchlist.
 */
export async function toggleWatchlistAction(personId: string) {
    try {
        const user = await requireUser("talent");

        const existingSnap = await adminDb.collection("scouting_watchlists")
            .where("ownerUid", "==", user.uid)
            .where("personId", "==", personId)
            .get();

        if (!existingSnap.empty) {
            await adminDb.collection("scouting_watchlists").doc(existingSnap.docs[0].id).delete();
            await recordAuditLog({
                actorId: user.uid,
                actorName: user.email || 'Scout',
                actionType: 'LOGISTICS_UPDATE',
                entityType: 'scouting_report',
                entityId: personId,
                description: `Removed athlete ${personId} from scouting watchlist`,
            });
            return { success: true, added: false };
        } else {
            await adminDb.collection("scouting_watchlists").add({
                ownerUid: user.uid,
                personId,
                addedAt: new Date().toISOString()
            });
            await recordAuditLog({
                actorId: user.uid,
                actorName: user.email || 'Scout',
                actionType: 'LOGISTICS_CREATE',
                entityType: 'scouting_report',
                entityId: personId,
                description: `Added athlete ${personId} to scouting watchlist`,
            });
            return { success: true, added: true };
        }
    } catch (error) {
        console.error("Error toggling watchlist:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update watchlist."
        };
    }
}
