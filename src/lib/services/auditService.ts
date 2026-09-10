import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from "firebase/firestore";

export type AuditActionType =
    | "SQUAD_CONFIRMED"
    | "PLAYER_REPLACED"
    | "SCOUT_REPORT_SUBMITTED"
    | "READINESS_OVERRIDE"
    | "MATCH_RESULT_VERIFIED"
    | "SECURITY_ALERT"
    | "LOGISTICS_UPDATE"
    | "LOGISTICS_CREATE";

export interface AuditLogEntry {
    id?: string;
    actorId: string;
    actorName: string;
    actionType: AuditActionType;
    entityType: "match" | "player" | "team" | "school" | "system" | "vehicle" | "transport_trip" | "ground_readiness" | "facility_booking" | "medical_incident";
    entityId: string;
    description: string;
    beforeState?: any;
    afterState?: any;
    timestamp?: any;
    schoolId?: string;
}

/**
 * Records a critical OS action into the audit log.
 */
export async function recordAuditLog(entry: Omit<AuditLogEntry, "timestamp">) {
    try {
        const auditRef = collection(db, "audit_logs");
        await addDoc(auditRef, {
            ...entry,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Failed to record audit log:", error);
        // We don't throw here to avoid breaking the calling workflow, 
        // but in a production OS we would have a fallback log.
    }
}

/**
 * Fetches recent audit logs for a specific school or system-wide.
 */
export async function getRecentAuditLogs(schoolId?: string, limitCount = 10) {
    try {
        const auditRef = collection(db, "audit_logs");
        let q;
        if (schoolId) {
            q = query(
                auditRef,
                where("schoolId", "==", schoolId),
                orderBy("timestamp", "desc"),
                limit(limitCount)
            );
        } else {
            q = query(
                auditRef,
                orderBy("timestamp", "desc"),
                limit(limitCount)
            );
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as AuditLogEntry[];
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return [];
    }
}
