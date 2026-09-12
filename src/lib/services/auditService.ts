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
    | "LOGISTICS_CREATE"
    | "TACTICAL_DIRECTIVE_TRANSMITTED"
    | "TACTICAL_DIRECTIVE_ACCEPTED"
    | "TACTICAL_DIRECTIVE_MODIFIED"
    | "TACTICAL_DIRECTIVE_DISMISSED"
    | "TACTICAL_DIRECTIVE_SUPERSEDED"
    | "TACTICAL_DIRECTIVE_CANCELLED"
    | "TACTICAL_DIRECTIVE_EXPIRED";

export interface AuditLogEntry {
    id?: string;
    actorId: string;
    actorName: string;
    actionType: AuditActionType;
    entityType: "match" | "player" | "team" | "school" | "system" | "vehicle" | "transport_trip" | "ground_readiness" | "facility_booking" | "medical_incident" | "tactical_directive";
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
        const logs = snapshot.docs.map(doc => {
            const data = doc.data();
            let timestamp = data.timestamp;

            if (timestamp && typeof timestamp.toDate === 'function') {
                const date = timestamp.toDate();
                timestamp = {
                    seconds: Math.floor(date.getTime() / 1000),
                    nanoseconds: (date.getTime() % 1000) * 1000000,
                };
            } else if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
                timestamp = {
                    seconds: timestamp.seconds,
                    nanoseconds: timestamp.nanoseconds || 0,
                };
            }

            return {
                id: doc.id,
                ...data,
                timestamp,
            };
        });

        return JSON.parse(JSON.stringify(logs)) as AuditLogEntry[];
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return [];
    }
}

