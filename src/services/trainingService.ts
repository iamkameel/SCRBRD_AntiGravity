import { db } from "@/lib/firebase";
import { collection, doc, setDoc, getDocs, onSnapshot, query, where, orderBy, Timestamp } from "firebase/firestore";
import { Drill } from "@/types/drills";
import { MASTER_DRILL_CATALOG } from "@/services/drillService";

export interface SessionAssignment {
    assignmentId: string;
    drillId: string;
    drillName: string;
    category: string;
    durationMins: number;
    assignedBy: string;
    status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
    targetPlayerId?: string;
    targetPlayerName?: string;
}

export interface SessionPlayerLog {
    playerId: string;
    playerName: string;
    completed: boolean;
    coachObservation: string;
    playerResponse: 'Excellent' | 'Satisfactory' | 'Fatigued / Modified' | 'Needs Intervention';
    effectivenessScore: number; // 1 to 5
}

export interface TrainingSessionPlan {
    sessionId: string;
    teamId: string;
    teamName: string;
    seasonId: string;
    title: string;
    objective: string;
    scheduledAt: string;
    venueName: string;
    totalDurationMins: number;
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    createdBy: string;
    assignments: SessionAssignment[];
    logs?: SessionPlayerLog[];
    createdAt: string;
    updatedAt: string;
}

const COLLECTION_NAME = "training_sessions";

export const MOCK_TRAINING_SESSIONS: TrainingSessionPlan[] = [
    {
        sessionId: "ts-001",
        teamId: "team-1st-xi",
        teamName: "1st XI Squad",
        seasonId: "2026-season",
        title: "Death Bowling & Strike Rotation Workshop",
        objective: "Master yorker execution under pressure and drop-and-run singles against quality seam.",
        scheduledAt: "2026-09-15T15:30:00Z",
        venueName: "Main Oval Nets & Center Pitch",
        totalDurationMins: 75,
        status: "PLANNED",
        createdBy: "Coach David Smith",
        assignments: [
            {
                assignmentId: "sa-1",
                drillId: "drill-bat-01",
                drillName: "Drop-and-Run Strike Rotation",
                category: "Batting",
                durationMins: 20,
                assignedBy: "Coach David Smith",
                status: "COMPLETED",
                targetPlayerName: "Batting Unit"
            },
            {
                assignmentId: "sa-2",
                drillId: "drill-bowl-01",
                drillName: "Yorker Target Grid Series",
                category: "Bowling",
                durationMins: 25,
                assignedBy: "Coach David Smith",
                status: "PENDING",
                targetPlayerName: "Fast Bowlers"
            },
            {
                assignmentId: "sa-3",
                drillId: "drill-keep-01",
                drillName: "Spin Standing-Up Leg-Side Gather",
                category: "Wicketkeeping",
                durationMins: 20,
                assignedBy: "Coach David Smith",
                status: "PENDING",
                targetPlayerName: "Specialist Keepers"
            }
        ],
        logs: [
            {
                playerId: "p-01",
                playerName: "Liam Thorne",
                completed: true,
                coachObservation: "Excellent execution of top-hand control during drop-and-run sets.",
                playerResponse: "Excellent",
                effectivenessScore: 5
            },
            {
                playerId: "p-02",
                playerName: "Kagiso Mokoena",
                completed: true,
                coachObservation: "Yorker landing rate hit 70% in death overs.",
                playerResponse: "Satisfactory",
                effectivenessScore: 4
            }
        ],
        createdAt: "2026-09-10T10:00:00Z",
        updatedAt: "2026-09-10T10:00:00Z"
    },
    {
        sessionId: "ts-002",
        teamId: "team-u15a",
        teamName: "Under 15A Squad",
        seasonId: "2026-season",
        title: "Fielding Ring Intensity & Catching Clinic",
        objective: "Sharpen slip reaction times and inner-ring pressure throwing accuracy.",
        scheduledAt: "2026-09-17T14:00:00Z",
        venueName: "Field B Outfield",
        totalDurationMins: 60,
        status: "PLANNED",
        createdBy: "Assistant Coach Mark Johnson",
        assignments: [
            {
                assignmentId: "sa-4",
                drillId: "drill-bat-02",
                drillName: "Short-Pitch Pull Shot Control",
                category: "Batting",
                durationMins: 25,
                assignedBy: "Assistant Coach Mark Johnson",
                status: "PENDING",
                targetPlayerName: "Top Order"
            }
        ],
        logs: [],
        createdAt: "2026-09-11T08:00:00Z",
        updatedAt: "2026-09-11T08:00:00Z"
    }
];

export const trainingService = {
    /**
     * Subscribe to real-time training plan updates from Firestore
     */
    subscribeTrainingPlans: (callback: (sessions: TrainingSessionPlan[]) => void): (() => void) => {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
            return onSnapshot(
                q,
                (snapshot) => {
                    if (snapshot.empty) {
                        callback(MOCK_TRAINING_SESSIONS);
                    } else {
                        const sessions = snapshot.docs.map((doc) => ({
                            sessionId: doc.id,
                            ...doc.data()
                        })) as TrainingSessionPlan[];
                        callback(sessions);
                    }
                },
                (error) => {
                    console.warn("Firestore training_sessions subscription failed, falling back to mock data:", error);
                    callback(MOCK_TRAINING_SESSIONS);
                }
            );
        } catch (e) {
            console.warn("Error setting up training_sessions subscription:", e);
            callback(MOCK_TRAINING_SESSIONS);
            return () => { };
        }
    },

    /**
     * Save a new training plan to Firestore
     */
    saveTrainingPlan: async (session: TrainingSessionPlan): Promise<void> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, session.sessionId);
            await setDoc(docRef, {
                ...session,
                updatedAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Failed to save training session to Firestore:", e);
            // Fallback local update
            const existingIdx = MOCK_TRAINING_SESSIONS.findIndex(s => s.sessionId === session.sessionId);
            if (existingIdx >= 0) {
                MOCK_TRAINING_SESSIONS[existingIdx] = session;
            } else {
                MOCK_TRAINING_SESSIONS.unshift(session);
            }
        }
    },

    /**
     * Log player execution & coach feedback for a session
     */
    logPlayerExecution: async (sessionId: string, logs: SessionPlayerLog[]): Promise<void> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, sessionId);
            await setDoc(
                docRef,
                {
                    logs,
                    status: "COMPLETED",
                    updatedAt: new Date().toISOString()
                },
                { merge: true }
            );
        } catch (e) {
            console.error("Failed to update session execution log in Firestore:", e);
            const session = MOCK_TRAINING_SESSIONS.find(s => s.sessionId === sessionId);
            if (session) {
                session.logs = logs;
                session.status = "COMPLETED";
            }
        }
    }
};
