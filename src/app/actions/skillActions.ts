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
import { SkillAssessment, PerformanceIndex, DevelopmentTrend, RoleArchetype, SkillDomain, RatingScale1to9, ReadinessScore } from "@/types/schema_v4";

/**
 * Log a new skill assessment for a player.
 */
export async function logSkillAssessmentAction(assessment: Omit<SkillAssessment, 'id' | 'assessedAt'>) {
    try {
        const assessmentData = {
            ...assessment,
            assessedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "skill_assessments"), assessmentData);

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error logging skill assessment:", error);
        return { success: false, error: "Failed to log assessment" };
    }
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
