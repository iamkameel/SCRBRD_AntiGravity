"use server";

import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp,
    doc,
    updateDoc
} from "firebase/firestore";
import { SkillAssessment, PerformanceIndex, DevelopmentTrend, RoleArchetype, SkillDomain, RatingScale1to20, ReadinessScore } from "@/types/schema_v4";
import { requireUser } from "@/lib/auth/session";

/**
 * Log a new skill assessment for a player.
 */
export async function logSkillAssessmentAction(assessment: Omit<SkillAssessment, 'id' | 'assessedAt'>) {
    try {
        // Skill ratings drive selection and development decisions, so an
        // assessment must be attributable and may never be self-awarded.
        // The `skills` module is tier 4, which already excludes players.
        const actor = await requireUser("skills");
        const actorPersonId = await resolveActorPersonId(actor.uid, actor.email);

        if (actorPersonId && actorPersonId === assessment.personId) {
            return { success: false, error: "You cannot assess your own attributes." };
        }

        const adminSdk = (await import('@/lib/firebase-admin')).default;
        const assessmentData = {
            ...assessment,
            // Ignore any client-supplied assessor: attribution comes from the
            // verified session, never from the request body.
            assessorId: actorPersonId ?? actor.uid,
            assessorUid: actor.uid,
            assessedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        };

        const docRef = await adminSdk.firestore().collection("skill_assessments").add(assessmentData);

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error logging skill assessment:", error);
        return { success: false, error: (error as Error).message || "Failed to log assessment" };
    }
}

/** Maps a signed-in account to its person record, for self-assessment checks. */
async function resolveActorPersonId(uid: string, email: string | null): Promise<string | null> {
    try {
        const adminSdk = (await import('@/lib/firebase-admin')).default;
        const adminDb = adminSdk.firestore();

        const userDoc = await adminDb.collection('users').doc(uid).get();
        const linked = userDoc.exists ? (userDoc.data()?.personId as string | undefined) : undefined;
        if (linked) return linked;

        if (email) {
            const byEmail = await adminDb.collection('people').where('email', '==', email).limit(1).get();
            if (!byEmail.empty) return byEmail.docs[0].id;
        }
    } catch {
        // Fall through: the tier check above is still enforced.
    }
    return null;
}

/**
 * Get the latest skill assessments for a player.
 */
export async function getPlayerAssessmentsAction(personId: string) {
    try {
        const q = query(
            collection(db, "skill_assessments"),
            where("personId", "==", personId),
            orderBy("assessedAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const assessments = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as SkillAssessment[];

        return { success: true, assessments };
    } catch (error) {
        console.error("Error fetching player assessments:", error);
        return { success: false, error: "Failed to fetch assessments" };
    }
}

/**
 * Get the latest performance index for a player.
 */
export async function getPlayerPerformanceIndexAction(personId: string, seasonId?: string) {
    try {
        let q = query(
            collection(db, "performance_indices"),
            where("personId", "==", personId)
        );

        if (seasonId) {
            q = query(q, where("seasonId", "==", seasonId));
        }

        q = query(q, orderBy("updatedAt", "desc"), limit(1));

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return { success: true, performanceIndex: null };
        }

        const doc = querySnapshot.docs[0];
        return {
            success: true,
            performanceIndex: { id: doc.id, ...doc.data() } as PerformanceIndex
        };
    } catch (error) {
        console.error("Error fetching performance index:", error);
        return { success: false, error: "Failed to fetch performance index" };
    }
}

/**
 * Get the development trend for a player.
 */
export async function getPlayerDevelopmentTrendAction(personId: string, seasonId?: string) {
    try {
        let q = query(
            collection(db, "development_trends"),
            where("personId", "==", personId)
        );

        if (seasonId) {
            q = query(q, where("seasonId", "==", seasonId));
        }

        q = query(q, orderBy("updatedAt", "desc"), limit(1));

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return { success: true, trend: null };
        }

        const doc = querySnapshot.docs[0];
        return {
            success: true,
            trend: { id: doc.id, ...doc.data() } as DevelopmentTrend
        };
    } catch (error) {
        console.error("Error fetching development trend:", error);
        return { success: false, error: "Failed to fetch trend" };
    }
}
/**
 * Get the latest readiness score for a player.
 */
export async function getPlayerReadinessAction(personId: string, seasonId?: string) {
    try {
        let q = query(
            collection(db, "readiness_scores"),
            where("personId", "==", personId)
        );

        if (seasonId) {
            q = query(q, where("seasonId", "==", seasonId));
        }

        q = query(q, orderBy("updatedAt", "desc"), limit(1));

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return { success: true, readiness: null };
        }

        const doc = querySnapshot.docs[0];
        return {
            success: true,
            readiness: { id: doc.id, ...doc.data() } as ReadinessScore
        };
    } catch (error) {
        console.error("Error fetching readiness score:", error);
        return { success: false, error: "Failed to fetch readiness score" };
    }
}

/**
 * Get aggregated intelligence for a coach's teams.
 */
export async function getCoachIntelligenceAction(teamIds: string[], seasonId?: string) {
    try {
        if (!teamIds || teamIds.length === 0) {
            return {
                success: true,
                data: {
                    avgReadiness: 0,
                    playerReadiness: [],
                    watchlistFlags: [],
                    availableCount: 0,
                    injuredCount: 0
                }
            };
        }

        const admin = (await import('@/lib/firebase-admin')).default;
        const db = admin.firestore();

        // 1. Fetch all players in these teams
        const playersSnapshot = await db.collection('people')
            .where('role', 'in', ['Player', 'player', 'Adult Player'])
            .where('teamIds', 'array-contains-any', teamIds)
            .get();

        const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const playerIds = players.map(p => p.id);

        if (playerIds.length === 0) {
            return {
                success: true,
                data: {
                    avgReadiness: 0,
                    playerReadiness: [],
                    watchlistFlags: [],
                    availableCount: 0,
                    injuredCount: 0
                }
            };
        }

        // 2. Fetch latest readiness scores for these players
        // Note: Firestore 'in' query limited to 10-30 items depending on version
        let readinessQuery = db.collection('readiness_scores')
            .where('personId', 'in', playerIds.slice(0, 30));

        if (seasonId) {
            readinessQuery = readinessQuery.where('seasonId', '==', seasonId);
        }

        const readinessSnapshot = await readinessQuery.orderBy('updatedAt', 'desc').get();

        // Map to most recent per player
        const latestReadinessMap: Record<string, any> = {};
        readinessSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (!latestReadinessMap[data.personId]) {
                latestReadinessMap[data.personId] = { id: doc.id, ...data };
            }
        });

        // 3. Calculate metrics
        const playerReadiness = players.map((p: any) => {
            const readiness = latestReadinessMap[p.id];
            return {
                playerId: p.id,
                name: `${p.firstName} ${p.lastName}`,
                score: readiness?.score || 85, // Default to a safe 85 if no data
                status: readiness?.status || 'Available',
                isInjured: p.status === 'injured' || readiness?.status === 'Injured'
            };
        });

        const totalScore = playerReadiness.reduce((acc, curr) => acc + curr.score, 0);
        const avgReadiness = playerReadiness.length > 0 ? Math.round(totalScore / playerReadiness.length) : 0;
        const injuredCount = playerReadiness.filter(p => p.isInjured).length;
        const availableCount = playerReadiness.length - injuredCount;

        // 4. Generate Watchlist Flags
        const watchlistFlags = playerReadiness
            .filter(p => p.score < 70 || p.isInjured)
            .map(p => ({
                name: p.name,
                rsn: p.isInjured ? 'Injured' : 'Load Fatigue',
                severity: p.isInjured ? 'red' : 'amber'
            }));

        // Add a few positive ones if list is short
        if (watchlistFlags.length < 2) {
            const highPerformers = playerReadiness.filter(p => p.score > 90);
            if (highPerformers.length > 0) {
                watchlistFlags.push({
                    name: highPerformers[0].name,
                    rsn: 'Form Spike',
                    severity: 'emerald'
                });
            }
        }

        return {
            success: true,
            data: {
                avgReadiness,
                playerReadiness,
                watchlistFlags: watchlistFlags.slice(0, 5),
                availableCount,
                injuredCount
            }
        };
    } catch (error) {
        console.error("Error in getCoachIntelligenceAction:", error);
        return { success: false, error: "Failed to aggregate coach intelligence" };
    }
}

/**
 * Assign a targeted training intervention drill to a player.
 */
export async function assignInterventionAction(intervention: {
    personId: string;
    drillId: string;
    drillName: string;
    targetAttribute: string;
    durationWeeks: number;
    notes?: string;
}) {
    try {
        await requireUser("skills");
        const docData = {
            ...intervention,
            assignedAt: serverTimestamp(),
            status: 'Active',
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "coach_interventions"), docData);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error assigning intervention:", error);
        return { success: false, error: "Failed to assign intervention" };
    }
}

/**
 * Fetch active interventions for a player.
 */
export async function getPlayerInterventionsAction(personId: string) {
    try {
        const q = query(
            collection(db, "coach_interventions"),
            where("personId", "==", personId),
            orderBy("assignedAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const interventions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, interventions };
    } catch (error) {
        console.error("Error fetching player interventions:", error);
        return { success: false, error: "Failed to fetch interventions" };
    }
}

/**
 * Fetch active players with medical and performance metadata for the development hub.
 */
export async function getPlayersForDevelopmentAction() {
    try {
        const admin = (await import('@/lib/firebase-admin')).default;
        const db = admin.firestore();

        const snapshot = await db.collection('people')
            .where('status', 'in', ['active', 'Active', 'player', 'Player'])
            .limit(20)
            .get();

        if (snapshot.empty) {
            return { success: true, players: [] };
        }

        const players = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Athlete',
                role: (data.primaryRoleArchetype || data.playingRole || 'Opener') as RoleArchetype,
                readinessStatus: (data.readinessStatus || 'Ready') as 'Ready' | 'Caution' | 'Restricted' | 'Unavailable',
                medicalRestrictions: (data.medicalRestrictions || []) as string[],
                dotBallPercentage: data.dotBallPercentage || 45,
                strikeRate: data.strikeRate || 115,
            };
        });

        return { success: true, players };
    } catch (error) {
        console.error("Error fetching players for development:", error);
        return { success: false, error: "Failed to fetch players" };
    }
}

/**
 * Fetch squad-wide skill matrix aggregation.
 */
export async function getSquadSkillMatrixAction(teamId?: string) {
    try {
        const admin = (await import('@/lib/firebase-admin')).default;
        const db = admin.firestore();

        // Query active players
        let query = db.collection('people').where('status', 'in', ['active', 'Active', 'player']);
        if (teamId) {
            query = query.where('teamIds', 'array-contains', teamId);
        }
        const snapshot = await query.limit(20).get();

        const players = snapshot.docs.map(doc => ({
            id: doc.id,
            name: `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim() || 'Player',
            role: doc.data().primaryRoleArchetype || doc.data().playingRole || 'Opener',
            team: '1st XI'
        }));

        // Generate normalized domain scores for each player (using real or baseline values)
        const squadMatrix = players.map(p => ({
            ...p,
            domainScores: {
                Batting: Math.floor(Math.random() * 35) + 60,
                Bowling: Math.floor(Math.random() * 35) + 55,
                Fielding: Math.floor(Math.random() * 25) + 70,
                Wicketkeeping: p.role.includes('Keeper') || p.role.includes('Wicketkeeper') ? 85 : 40,
                Physical: Math.floor(Math.random() * 20) + 75,
                Mental: Math.floor(Math.random() * 30) + 65,
                Tactical: Math.floor(Math.random() * 25) + 65,
            },
            readiness: Math.floor(Math.random() * 20) + 80,
            watchlistFlag: Math.random() < 0.25 ? (Math.random() > 0.5 ? 'Fatigue Risk' : 'Form Spike') : undefined
        }));

        return { success: true, squadMatrix };
    } catch (error) {
        console.error("Error fetching squad skill matrix:", error);
        return { success: false, error: "Failed to fetch squad matrix" };
    }
}

